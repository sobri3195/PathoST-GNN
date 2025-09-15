import React, { useState, useEffect } from 'react';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from 'recharts';
import type { SelectionRect, AnalysisResult, GeneSearchResult, GeneHotspot } from '../types';
import { performGeminiAnalysis } from '../services/geminiService';
import { Spinner } from './Spinner';
import { UploadIcon } from './icons/UploadIcon';
import { QueryIcon } from './icons/QueryIcon';
import { GeneIcon } from './icons/GeneIcon';
import { CloseIcon } from './icons/CloseIcon';

interface ControlPanelProps {
  selectionRect: SelectionRect | null;
  onQuery: (rect: SelectionRect) => void;
  isQuerying: boolean;
  analysisResult: AnalysisResult | null;
  setAnalysisResult: React.Dispatch<React.SetStateAction<AnalysisResult | null>>;
  setWsiUrl: (url: string) => void;
  setStDataVisible: (visible: boolean) => void;
  stDataVisible: boolean;
  geneSearchResult: GeneSearchResult | null;
  setGeneSearchResult: (result: GeneSearchResult | null) => void;
  selectedHotspot: GeneHotspot | null;
  setSelectedHotspot: (hotspot: GeneHotspot | null) => void;
}

const mockGeneDatabase: { [key: string]: Omit<GeneSearchResult, 'geneName' | 'hotspots'> } = {
  'KRT19': { description: 'Keratin 19, an epithelial cell marker often expressed in carcinomas.', associatedCellTypes: ['Epithelial Cells', 'Tumor Cells'] },
  'COL1A1': { description: 'Collagen Type I Alpha 1 Chain, a major component of the extracellular matrix.', associatedCellTypes: ['Fibroblasts', 'Stromal Cells'] },
  'CD45': { description: 'Also known as PTPRC, a pan-leukocyte marker for immune cells.', associatedCellTypes: ['Leukocytes', 'T-Cells', 'B-Cells'] },
  'FN1': { description: 'Fibronectin 1, involved in cell adhesion and wound healing.', associatedCellTypes: ['Fibroblasts', 'Endothelial Cells'] },
};

const generateMockGeneData = (geneName: string): GeneSearchResult => {
  const upperGeneName = geneName.toUpperCase();
  const geneInfo = mockGeneDatabase[upperGeneName];

  if (!geneInfo) {
    return {
      geneName: geneName,
      description: 'Gene not found in our simulated database.',
      associatedCellTypes: [],
      hotspots: [],
    };
  }
  
  const numHotspots = Math.floor(Math.random() * 5) + 3; // 3 to 7 hotspots
  const hotspots = Array.from({ length: numHotspots }, (): GeneHotspot => ({
      x: Math.random() * 950 + 25, // Avoid edges
      y: Math.random() * 700 + 25,
      expression: Math.random() * 100,
      dominantCellType: geneInfo.associatedCellTypes[Math.floor(Math.random() * geneInfo.associatedCellTypes.length)] || 'Unknown',
  }));

  return { geneName: upperGeneName, ...geneInfo, hotspots };
};


export const ControlPanel: React.FC<ControlPanelProps> = ({
  selectionRect,
  onQuery,
  isQuerying,
  analysisResult,
  setAnalysisResult,
  setWsiUrl,
  setStDataVisible,
  stDataVisible,
  geneSearchResult,
  setGeneSearchResult,
  selectedHotspot,
  setSelectedHotspot,
}) => {
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [geneQuery, setGeneQuery] = useState('');
  const [isSearchingGene, setIsSearchingGene] = useState(false);
  const [isGeneDetailsVisible, setIsGeneDetailsVisible] = useState(true);
  const [searchHistory, setSearchHistory] = useState<string[]>([]);
  const [isHistoryVisible, setIsHistoryVisible] = useState(false);


  const handleRunQuery = () => {
    if (selectionRect) {
      onQuery(selectionRect);
    }
  };

  const handleGeminiAnalysis = async () => {
    if (analysisResult && analysisResult.hpc) {
      setIsAnalyzing(true);
      try {
        const geminiResult = await performGeminiAnalysis(analysisResult.hpc);
        setAnalysisResult(prev => prev ? { ...prev, gemini: geminiResult } : null);
      } catch (error) {
        console.error("Gemini analysis failed:", error);
        alert("Failed to perform Gemini analysis. Check the console for details.");
      } finally {
        setIsAnalyzing(false);
      }
    }
  };

  const handleRandomWSI = () => {
    const randomId = Math.floor(Math.random() * 1000);
    setWsiUrl(`https://picsum.photos/seed/${randomId}/1024/768`);
    setGeneSearchResult(null); // Clear hotspots on new image
    setSelectedHotspot(null);
  };

  const executeGeneSearch = async (query: string) => {
    if (!query) return;
    setIsSearchingGene(true);
    setGeneSearchResult(null);
    setSelectedHotspot(null);
    
    // Simulate DB lookup
    await new Promise(resolve => setTimeout(resolve, 1500));
    
    const result = generateMockGeneData(query);
    setGeneSearchResult(result);
    setIsSearchingGene(false);
    setIsGeneDetailsVisible(true);

    if (result.hotspots.length > 0) { // Only add successful searches to history
      const upperGene = query.toUpperCase();
      setSearchHistory(prev => {
        const updatedHistory = [upperGene, ...prev.filter(g => g.toUpperCase() !== upperGene)];
        return updatedHistory.slice(0, 5);
      });
    }
  };

  const handleGeneSearch = () => {
    executeGeneSearch(geneQuery);
  };

  const handleHistoryClick = (gene: string) => {
    setGeneQuery(gene);
    executeGeneSearch(gene);
  };

  return (
    <aside className="w-96 bg-brand-secondary p-4 overflow-y-auto flex flex-col space-y-4">
      {/* Data Loader Section */}
      <div className="bg-brand-accent/30 p-3 rounded-lg">
        <h3 className="font-bold text-lg mb-2 text-brand-highlight">1. Load Data</h3>
        <div className="space-y-2">
          <button onClick={handleRandomWSI} className="w-full flex items-center justify-center space-x-2 bg-brand-accent hover:bg-brand-light/80 text-white font-bold py-2 px-4 rounded-md transition-colors">
            <UploadIcon />
            <span>Load Random WSI</span>
          </button>
          <div className="flex items-center justify-between p-2 bg-black/20 rounded-md">
             <label htmlFor="st-toggle" className="text-sm font-medium">Show ST Data Overlay</label>
             <div className="relative inline-block w-10 mr-2 align-middle select-none transition duration-200 ease-in">
                <input type="checkbox" name="st-toggle" id="st-toggle" checked={stDataVisible} onChange={(e) => setStDataVisible(e.target.checked)} className="toggle-checkbox absolute block w-6 h-6 rounded-full bg-white border-4 appearance-none cursor-pointer checked:right-0 checked:bg-brand-highlight" />
                <label htmlFor="st-toggle" className="toggle-label block overflow-hidden h-6 rounded-full bg-gray-300 cursor-pointer"></label>
            </div>
            <style>{`
                .toggle-checkbox:checked { right: 0; border-color: #64FFDA; }
                .toggle-checkbox:checked + .toggle-label { background-color: #64FFDA; }
            `}</style>
          </div>
        </div>
      </div>

      {/* Gene Search Section */}
      <div className="bg-brand-accent/30 p-3 rounded-lg">
        <h3 className="font-bold text-lg mb-2 text-brand-highlight">2. Gene Search</h3>
        <div className="flex">
          <input 
            type="text" 
            value={geneQuery}
            onChange={(e) => setGeneQuery(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleGeneSearch()}
            placeholder="e.g., KRT19"
            className="flex-1 bg-brand-primary border border-brand-accent rounded-l-md px-2 py-1.5 text-sm focus:ring-2 focus:ring-brand-highlight focus:outline-none z-10"
          />
          <button 
            onClick={handleGeneSearch} 
            disabled={isSearchingGene || !geneQuery} 
            className="relative -ml-px flex items-center justify-center bg-brand-accent hover:bg-brand-light/80 text-white font-bold p-2 rounded-r-md transition-colors disabled:opacity-50 border border-brand-accent"
            aria-label="Search for gene"
          >
            {isSearchingGene ? <Spinner /> : <QueryIcon />}
          </button>
        </div>
        
        {/* Gene Search Results Panel */}
        {geneSearchResult && (
          <div className="mt-3 text-sm animate-fade-in">
            {geneSearchResult.hotspots.length > 0 ? (
              // Successful search result
              <div className="bg-black/20 rounded-md">
                <button 
                  onClick={() => setIsGeneDetailsVisible(!isGeneDetailsVisible)} 
                  className={`w-full flex justify-between items-center p-3 text-left font-bold text-white hover:bg-brand-accent/50 transition-colors ${isGeneDetailsVisible ? 'rounded-t-md' : 'rounded-md'}`}
                  aria-expanded={isGeneDetailsVisible}
                  aria-controls="gene-details-content"
                >
                  <span>Gene Details: <span className="font-mono text-brand-highlight">{geneSearchResult.geneName}</span></span>
                  <svg xmlns="http://www.w3.org/2000/svg" className={`h-5 w-5 text-brand-light transform transition-transform duration-200 ${isGeneDetailsVisible ? 'rotate-180' : ''}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                  </svg>
                </button>
                {isGeneDetailsVisible && (
                  <div id="gene-details-content" className="p-3 border-t border-brand-accent/30">
                    <p className="text-xs text-brand-light">{geneSearchResult.description}</p>
                    {geneSearchResult.associatedCellTypes.length > 0 && (
                        <div className="mt-2">
                          <strong className="text-xs text-brand-light">Associated Cell Types:</strong>
                          <div className="flex flex-wrap gap-1 mt-1">
                              {geneSearchResult.associatedCellTypes.map(type => (
                                  <span key={type} className="text-xs bg-brand-highlight/20 text-brand-highlight px-2 py-1 rounded-full">{type}</span>
                              ))}
                          </div>
                      </div>
                    )}
                  </div>
                )}
              </div>
            ) : (
              // Gene not found result
              <div className="p-3 bg-red-900/40 text-red-300 rounded-md">
                <p className="font-semibold">Gene Not Found: {geneSearchResult.geneName}</p>
                <p className="text-xs mt-1">{geneSearchResult.description}</p>
              </div>
            )}
          </div>
        )}

        {searchHistory.length > 0 && (
          <div className="mt-2 text-sm bg-black/20 rounded-md">
            <button
              onClick={() => setIsHistoryVisible(!isHistoryVisible)}
              className="w-full flex justify-between items-center p-2 text-left font-semibold text-brand-light hover:bg-brand-accent/50 transition-colors rounded-md"
              aria-expanded={isHistoryVisible}
              aria-controls="search-history"
            >
              <span>Search History</span>
              <svg xmlns="http://www.w3.org/2000/svg" className={`h-5 w-5 transform transition-transform duration-200 ${isHistoryVisible ? 'rotate-180' : ''}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
              </svg>
            </button>
            {isHistoryVisible && (
              <div id="search-history" className="p-2 border-t border-brand-accent/30">
                <ul className="space-y-1">
                  {searchHistory.map(gene => (
                    <li key={gene}>
                      <button
                        onClick={() => handleHistoryClick(gene)}
                        className="w-full text-left p-1 rounded hover:bg-brand-accent/70 text-brand-light transition-colors"
                      >
                        {gene}
                      </button>
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Selected Hotspot Section */}
      {selectedHotspot && geneSearchResult && (
        <div className="bg-brand-accent/30 p-3 rounded-lg animate-fade-in">
          <div className="flex justify-between items-center mb-2">
            <h3 className="font-bold text-lg text-brand-highlight">Hotspot Details</h3>
            <button 
              onClick={() => setSelectedHotspot(null)} 
              className="text-brand-light hover:text-white transition-colors"
              aria-label="Close hotspot details"
            >
              <CloseIcon />
            </button>
          </div>
          <div className="text-sm bg-black/20 p-3 rounded-md space-y-2">
              <div className="flex justify-between">
                <span className="font-semibold text-brand-light">Gene:</span>
                <span className="font-mono text-brand-highlight">{geneSearchResult.geneName}</span>
              </div>
              <div className="flex justify-between">
                <span className="font-semibold text-brand-light">Expression:</span>
                <span>{selectedHotspot.expression.toFixed(2)}</span>
              </div>
               <div className="flex justify-between">
                <span className="font-semibold text-brand-light">Cell Type:</span>
                <span className="text-xs bg-brand-highlight/20 text-brand-highlight px-2 py-1 rounded-full">{selectedHotspot.dominantCellType}</span>
              </div>
              <div className="flex justify-between">
                <span className="font-semibold text-brand-light">Coordinates:</span>
                <span>({Math.round(selectedHotspot.x)}, {Math.round(selectedHotspot.y)})</span>
              </div>
          </div>
        </div>
      )}
      
      {/* Query Section */}
      <div className="bg-brand-accent/30 p-3 rounded-lg">
        <h3 className="font-bold text-lg mb-2 text-brand-highlight">3. In-Situ Query</h3>
        <p className="text-sm text-brand-light mb-2">Select a region on the image viewer to enable querying.</p>
        <button
          onClick={handleRunQuery}
          disabled={!selectionRect || isQuerying}
          className="w-full flex items-center justify-center space-x-2 bg-brand-highlight text-brand-primary font-bold py-2 px-4 rounded-md transition-all disabled:bg-gray-500 disabled:cursor-not-allowed hover:bg-white"
        >
          {isQuerying ? <Spinner /> : <QueryIcon />}
          <span>{isQuerying ? 'Querying HPC...' : 'Run HPC Query'}</span>
        </button>
        {selectionRect && (
          <div className="text-xs mt-2 text-brand-light bg-black/20 p-2 rounded">
            Selected Region: (x: {Math.round(selectionRect.x)}, y: {Math.round(selectionRect.y)}, w: {Math.round(selectionRect.width)}, h: {Math.round(selectionRect.height)})
          </div>
        )}
      </div>
      
      {/* Results Section */}
      <div className="flex-1 bg-brand-accent/30 p-3 rounded-lg min-h-0">
        <h3 className="font-bold text-lg text-brand-highlight">4. Analysis Results</h3>
        {analysisResult?.hpc && (
          <div className="space-y-4 text-sm mt-2">
            <div>
              <h4 className="font-semibold text-brand-text mb-1">HPC Transcriptomics Summary</h4>
              <ul className="list-disc list-inside bg-black/20 p-2 rounded-md text-brand-light space-y-1">
                <li>Cell Count Estimate: {analysisResult.hpc.cellCount}</li>
                <li>Identified Spatial Clusters: {analysisResult.hpc.spatialClusters}</li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold text-brand-text mb-1">Top Expressed Genes</h4>
              <div className="h-48 w-full">
                <ResponsiveContainer>
                  <BarChart data={analysisResult.hpc.topGenes} margin={{ top: 5, right: 20, left: 10, bottom: 5 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#415A77" />
                    <XAxis dataKey="name" stroke="#778DA9" fontSize={10} />
                    <YAxis stroke="#778DA9" fontSize={10}/>
                    <Tooltip contentStyle={{ backgroundColor: '#1B263B', border: 'none' }} labelStyle={{ color: '#E0E1DD' }}/>
                    <Bar dataKey="expression" fill="#64FFDA" />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>
            
            {!analysisResult.gemini && (
              <button onClick={handleGeminiAnalysis} disabled={isAnalyzing} className="w-full mt-4 flex items-center justify-center space-x-2 bg-gradient-to-r from-purple-500 to-indigo-600 text-white font-bold py-2 px-4 rounded-md transition-all disabled:opacity-50 hover:from-purple-600 hover:to-indigo-700">
                {isAnalyzing ? <Spinner /> : <GeneIcon />}
                <span>Analyze with Gemini</span>
              </button>
            )}

            {isAnalyzing && (
                 <div className="text-center p-4">
                    <Spinner />
                    <p className="mt-2 text-sm text-brand-light">Gemini is analyzing the data...</p>
                 </div>
            )}
            
            {analysisResult.gemini && (
              <div className="space-y-3 mt-4">
                <h4 className="font-semibold text-brand-text">Gemini AI Analysis</h4>
                <div className="bg-black/20 p-3 rounded-md space-y-3">
                  <div>
                    <strong className="text-brand-light">Summary:</strong>
                    <p className="text-xs">{analysisResult.gemini.summary}</p>
                  </div>
                  <div>
                    <strong className="text-brand-light">Potential Cell Types:</strong>
                    <div className="flex flex-wrap gap-1 mt-1">
                      {analysisResult.gemini.potentialCellTypes.map(type => (
                        <span key={type} className="text-xs bg-brand-highlight/20 text-brand-highlight px-2 py-1 rounded-full">{type}</span>
                      ))}
                    </div>
                  </div>
                   <div>
                    <strong className="text-brand-light">Confidence Score:</strong>
                    <div className="w-full bg-gray-600 rounded-full h-2.5 mt-1">
                      <div className="bg-brand-highlight h-2.5 rounded-full" style={{width: `${analysisResult.gemini.confidence}%`}}></div>
                    </div>
                  </div>
                </div>
              </div>
            )}
            
          </div>
        )}
        {!analysisResult && !isQuerying && (
             <div className="text-center pt-16">
                 <p className="text-brand-light">Results will be displayed here after running a query.</p>
             </div>
        )}
      </div>
    </aside>
  );
};