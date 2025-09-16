
import React, { useState } from 'react';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from 'recharts';
import type { SelectionRect, AnalysisResult, GeneSearchResult, GeneHotspot, LoadedGeneDataPoint } from '../types';
import { performGeminiAnalysis } from '../services/geminiService';
import { Spinner } from './Spinner';
import { UploadIcon } from './icons/UploadIcon';
import { QueryIcon } from './icons/QueryIcon';
import { GeneIcon } from './icons/GeneIcon';
import { CloseIcon } from './icons/CloseIcon';
import { GeminiIcon } from './icons/GeminiIcon';
import { ClearIcon } from './icons/ClearIcon';

interface ControlPanelProps {
  selectionRect: SelectionRect | null;
  onQuery: (rect: SelectionRect) => void;
  isQuerying: boolean;
  analysisResult: AnalysisResult | null;
  setAnalysisResult: React.Dispatch<React.SetStateAction<AnalysisResult | null>>;
  setWsiUrl: (url: string) => void;
  stDataVisible: boolean;
  setStDataVisible: (visible: boolean) => void;
  geneSearchResult: GeneSearchResult | null;
  setGeneSearchResult: React.Dispatch<React.SetStateAction<GeneSearchResult | null>>;
  selectedHotspot: GeneHotspot | null;
  setSelectedHotspot: React.Dispatch<React.SetStateAction<GeneHotspot | null>>;
  loadedGeneData: LoadedGeneDataPoint[] | null;
  setLoadedGeneData: React.Dispatch<React.SetStateAction<LoadedGeneDataPoint[] | null>>;
  onClearAll: () => void;
}


export const ControlPanel: React.FC<ControlPanelProps> = ({
  selectionRect,
  onQuery,
  isQuerying,
  analysisResult,
  setAnalysisResult,
  setWsiUrl,
  stDataVisible,
  setStDataVisible,
  geneSearchResult,
  setGeneSearchResult,
  selectedHotspot,
  setSelectedHotspot,
  onClearAll,
}) => {
  const [isGeminiLoading, setIsGeminiLoading] = useState(false);
  const [geneQuery, setGeneQuery] = useState('');
  const [isSearching, setIsSearching] = useState(false);
  
  const handleQueryClick = () => {
    if (selectionRect) {
      onQuery(selectionRect);
    }
  };
  
  const handleGeminiAnalysis = async () => {
    if (!analysisResult?.hpc) return;

    setIsGeminiLoading(true);
    try {
      const geminiResult = await performGeminiAnalysis(analysisResult.hpc);
      setAnalysisResult(prev => prev ? { ...prev, gemini: geminiResult } : null);
    } catch (error) {
      console.error("Gemini analysis failed:", error);
    } finally {
      setIsGeminiLoading(false);
    }
  };

  const handleGeneSearch = async () => {
      if (!geneQuery) return;
      setIsSearching(true);
      await new Promise(res => setTimeout(res, 1500));
      setGeneSearchResult({
        geneName: geneQuery.toUpperCase(),
        description: `This gene is associated with cell proliferation and is often found in tumor microenvironments.`,
        associatedCellTypes: ['Fibroblast', 'Epithelial', 'Macrophage'],
        hotspots: Array.from({length: 15}).map(() => ({
          x: Math.random() * 1000,
          y: Math.random() * 750,
          expression: Math.random() * 100,
          dominantCellType: ['Fibroblast', 'Epithelial', 'Macrophage'][Math.floor(Math.random() * 3)],
        })),
        dataSource: 'mock'
      });
      setIsSearching(false);
  };
  
  const handleWsiUpload = () => {
    const urls = [
        'https://picsum.photos/seed/pathology/1024/768',
        'https://picsum.photos/seed/tissue/1024/768',
        'https://picsum.photos/seed/microscope/1024/768'
    ];
    setWsiUrl(urls[Math.floor(Math.random() * urls.length)]);
  };

  const handleClearAllClick = () => {
    onClearAll();
    setGeneQuery('');
  };

  const clearSelection = () => {
    setAnalysisResult(null);
  };
  
  const clearGeneSearch = () => {
    setGeneSearchResult(null);
    setSelectedHotspot(null);
    setGeneQuery('');
  };


  return (
    <aside className="w-[400px] bg-brand-secondary flex flex-col p-4 space-y-4 overflow-y-auto flex-shrink-0">
      {/* WSI & Data Controls */}
      <div className="bg-brand-primary/40 p-3 rounded-lg animate-fade-in">
        <h3 className="text-lg font-bold text-brand-highlight mb-2">Data Controls</h3>
        <div className="flex space-x-2">
            <button 
                onClick={handleWsiUpload}
                className="flex-1 bg-brand-accent hover:bg-brand-accent/80 text-white font-bold py-2 px-4 rounded-md inline-flex items-center justify-center transition-colors"
                title="Load a different sample Whole-Slide Image"
            >
                <UploadIcon /> <span className="ml-2">Load New WSI</span>
            </button>
             <button
                onClick={handleClearAllClick}
                className="flex-1 bg-red-800/70 hover:bg-red-700 text-white font-bold py-2 px-4 rounded-md inline-flex items-center justify-center transition-colors"
                title="Clear all selections, results, and searches"
            >
                <ClearIcon /> <span className="ml-2">Clear All</span>
            </button>
        </div>
         <div className="mt-3">
          <label className="flex items-center space-x-2 cursor-pointer">
            <input 
              type="checkbox" 
              checked={stDataVisible} 
              onChange={() => setStDataVisible(!stDataVisible)}
              className="form-checkbox h-5 w-5 text-brand-highlight bg-brand-secondary border-brand-light rounded focus:ring-brand-highlight"
            />
            <span className="text-brand-text">Show ST Data Overlay</span>
          </label>
        </div>
      </div>
      
      {/* Selection Analysis */}
      <div className="bg-brand-primary/40 p-3 rounded-lg animate-fade-in">
        <h3 className="text-lg font-bold text-brand-highlight mb-2">Region Analysis</h3>
        {selectionRect ? (
          <div>
            <div className="text-sm mb-2">
              <p>X: {selectionRect.x.toFixed(0)}, Y: {selectionRect.y.toFixed(0)}</p>
              <p>W: {selectionRect.width.toFixed(0)}, H: {selectionRect.height.toFixed(0)}</p>
            </div>
            <button 
              onClick={handleQueryClick} 
              disabled={isQuerying}
              className="w-full bg-brand-highlight hover:bg-brand-highlight/80 text-brand-primary font-bold py-2 px-4 rounded-md inline-flex items-center justify-center transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isQuerying ? <><Spinner /> <span className="ml-2">Querying HPC...</span></> : <><QueryIcon /> <span className="ml-2">Query Selected Region</span></>}
            </button>
          </div>
        ) : (
          <p className="text-sm text-brand-light">Select a region on the image to begin analysis.</p>
        )}
      </div>

      {/* Analysis Results */}
      {analysisResult && (
        <div className="bg-brand-primary/40 p-3 rounded-lg animate-fade-in relative">
           <button onClick={clearSelection} className="absolute top-2 right-2 text-brand-light hover:text-white">
                <CloseIcon />
            </button>
          <h3 className="text-lg font-bold text-brand-highlight mb-2">HPC Results</h3>
          <div className="text-sm space-y-1 mb-3">
            <p><strong>Cell Count:</strong> {analysisResult.hpc.cellCount}</p>
            <p><strong>Spatial Clusters:</strong> {analysisResult.hpc.spatialClusters}</p>
          </div>
          <h4 className="font-semibold mb-1">Top Expressed Genes:</h4>
          <div className="h-48 w-full">
            <ResponsiveContainer>
              <BarChart data={analysisResult.hpc.topGenes} layout="vertical" margin={{ top: 5, right: 20, left: 10, bottom: 5 }}>
                 <CartesianGrid strokeDasharray="3 3" stroke="#415A77" />
                <XAxis type="number" stroke="#E0E1DD" fontSize={12} />
                <YAxis type="category" dataKey="name" stroke="#E0E1DD" fontSize={12} width={50} />
                <Tooltip 
                    cursor={{fill: '#415A77'}}
                    contentStyle={{ backgroundColor: '#0D1B2A', border: '1px solid #64FFDA' }} 
                />
                <Bar dataKey="expression" fill="#64FFDA" />
              </BarChart>
            </ResponsiveContainer>
          </div>
          
          <div className="mt-4 pt-4 border-t border-brand-accent">
            <h3 className="text-lg font-bold text-brand-highlight mb-2">Gemini Analysis</h3>
            {analysisResult.gemini ? (
                 <div className="text-sm space-y-4 animate-fade-in">
                    <div>
                        <strong className="text-brand-light block mb-1">Summary:</strong>
                        <p className="italic">"{analysisResult.gemini.summary}"</p>
                    </div>
                    
                    <div>
                        <strong className="text-brand-light block mb-2">Confidence Score:</strong>
                        <div className="flex items-center gap-3">
                            <div className="w-full bg-brand-primary rounded-full h-4 relative">
                                <div 
                                    className="bg-gradient-to-r from-green-400 to-blue-500 h-4 rounded-full transition-all duration-500 ease-out" 
                                    style={{ width: `${analysisResult.gemini.confidence}%` }}
                                    role="progressbar"
                                    aria-valuenow={analysisResult.gemini.confidence}
                                    aria-valuemin={0}
                                    aria-valuemax={100}
                                ></div>
                            </div>
                            <span className="font-bold text-lg text-brand-highlight">{analysisResult.gemini.confidence.toFixed(0)}%</span>
                        </div>
                    </div>

                    <div>
                        <strong className="text-brand-light block mb-2">Potential Cell Type Composition:</strong>
                        <div className="space-y-3">
                            {analysisResult.gemini.potentialCellTypes.map(cellType => (
                                <div key={cellType.name}>
                                    <div className="flex justify-between items-baseline mb-1">
                                        <span className="font-semibold">{cellType.name}</span>
                                        <span className="text-xs font-mono text-brand-light">{cellType.prevalence.toFixed(0)}%</span>
                                    </div>
                                    <div className="w-full bg-brand-primary rounded-full h-2">
                                        <div 
                                            className="bg-brand-accent h-2 rounded-full" 
                                            style={{ width: `${cellType.prevalence}%` }}
                                        ></div>
                                    </div>
                                    <p className="text-xs text-brand-light mt-1 italic">{cellType.description}</p>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            ) : (
                <button
                    onClick={handleGeminiAnalysis}
                    disabled={!analysisResult.hpc || isGeminiLoading}
                    className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-2 px-4 rounded-md inline-flex items-center justify-center transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                    {isGeminiLoading ? (
                        <><Spinner /> <span className="ml-2">Analyzing with Gemini...</span></>
                    ) : (
                        <><GeminiIcon /> <span className="ml-2">Analyze with Gemini</span></>
                    )}
                </button>
            )}
        </div>

        </div>
      )}

       {/* Gene Search */}
        <div className="bg-brand-primary/40 p-3 rounded-lg animate-fade-in">
             <h3 className="text-lg font-bold text-brand-highlight mb-2">Gene Query</h3>
             <div className="flex space-x-2">
                 <input 
                    type="text"
                    value={geneQuery}
                    onChange={(e) => setGeneQuery(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && handleGeneSearch()}
                    placeholder="e.g., COL1A1"
                    className="flex-1 bg-brand-primary border border-brand-accent rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-brand-highlight"
                 />
                 <button onClick={handleGeneSearch} disabled={isSearching || !geneQuery} className="bg-brand-accent hover:bg-brand-accent/80 text-white font-bold py-2 px-4 rounded-md inline-flex items-center justify-center transition-colors disabled:opacity-50 disabled:cursor-not-allowed">
                     {isSearching ? <Spinner /> : <GeneIcon />}
                 </button>
             </div>
        </div>

        {geneSearchResult && (
             <div className="bg-brand-primary/40 p-3 rounded-lg animate-fade-in relative">
                 <button onClick={clearGeneSearch} className="absolute top-2 right-2 text-brand-light hover:text-white">
                    <CloseIcon />
                 </button>
                 <h3 className="text-lg font-bold text-brand-highlight mb-2">Gene: {geneSearchResult.geneName}</h3>
                 <p className="text-sm text-brand-light mb-2">{geneSearchResult.description}</p>
                 <div className="text-sm">
                     <p><strong>Associated Cell Types:</strong> {geneSearchResult.associatedCellTypes.join(', ')}</p>
                     <p><strong>Hotspots Found:</strong> {geneSearchResult.hotspots.length}</p>
                     {geneSearchResult.dataSource === 'csv' && <p className="text-xs italic text-green-400 mt-1">Data loaded from CSV.</p>}
                 </div>
                 {selectedHotspot && (
                     <div className="mt-3 pt-3 border-t border-brand-accent">
                        <h4 className="font-semibold text-brand-highlight">Selected Hotspot</h4>
                        <p className="text-sm">Expression: {selectedHotspot.expression.toFixed(2)}</p>
                        <p className="text-sm">Dominant Cell Type: {selectedHotspot.dominantCellType}</p>
                     </div>
                 )}
             </div>
        )}
    </aside>
  );
};
