
import React, { useState, useCallback } from 'react';
import { Header } from './components/Header';
import { ControlPanel } from './components/ControlPanel';
import { ImageViewer } from './components/ImageViewer';
import { Sidebar } from './components/Sidebar';
import type { AnalysisResult, SelectionRect, GeneSearchResult, GeneHotspot, LoadedGeneDataPoint } from './types';

const App: React.FC = () => {
  const [selectionRect, setSelectionRect] = useState<SelectionRect | null>(null);
  const [analysisResult, setAnalysisResult] = useState<AnalysisResult | null>(null);
  const [geneSearchResult, setGeneSearchResult] = useState<GeneSearchResult | null>(null);
  const [selectedHotspot, setSelectedHotspot] = useState<GeneHotspot | null>(null);
  const [isQuerying, setIsQuerying] = useState<boolean>(false);
  const [wsiUrl, setWsiUrl] = useState<string>('https://picsum.photos/seed/histology/1024/768');
  const [stDataVisible, setStDataVisible] = useState<boolean>(true);
  const [activeView, setActiveView] = useState<string>('analysis');
  const [loadedGeneData, setLoadedGeneData] = useState<LoadedGeneDataPoint[] | null>(null);

  const handleQuery = useCallback(async (rect: SelectionRect) => {
    setIsQuerying(true);
    setAnalysisResult(null);

    // Simulate HPC processing delay
    await new Promise(resolve => setTimeout(resolve, 2500));
    
    // Mock HPC results based on selection
    const mockHpcResult = {
      region: rect,
      cellCount: Math.floor((rect.width * rect.height) / 100),
      topGenes: [
        { name: 'GENE_A', expression: Math.random() * 100 },
        { name: 'COL1A1', expression: Math.random() * 80 + 20 },
        { name: 'KRT19', expression: Math.random() * 70 },
        { name: 'CD45', expression: Math.random() * 60 },
        { name: 'FN1', expression: Math.random() * 50 },
      ],
      spatialClusters: Math.floor(Math.random() * 5) + 2,
    };
    
    setAnalysisResult({ hpc: mockHpcResult, gemini: null });
    setIsQuerying(false);
  }, []);

  const handleNewWSI = (url: string) => {
    setWsiUrl(url);
    setGeneSearchResult(null);
    setSelectedHotspot(null);
    setLoadedGeneData(null); // Also clear loaded gene data with new image
  }

  const handleClearAll = useCallback(() => {
    setSelectionRect(null);
    setAnalysisResult(null);
    setGeneSearchResult(null);
    setSelectedHotspot(null);
    setLoadedGeneData(null);
  }, []);

  return (
    <div className="flex flex-col h-screen bg-brand-primary font-sans">
      <Header />
      <main className="flex flex-1 overflow-hidden">
        <Sidebar activeView={activeView} setActiveView={setActiveView} />
        <ControlPanel
          selectionRect={selectionRect}
          onQuery={handleQuery}
          isQuerying={isQuerying}
          analysisResult={analysisResult}
          setAnalysisResult={setAnalysisResult}
          setWsiUrl={handleNewWSI}
          setStDataVisible={setStDataVisible}
          stDataVisible={stDataVisible}
          geneSearchResult={geneSearchResult}
          setGeneSearchResult={setGeneSearchResult}
          selectedHotspot={selectedHotspot}
          setSelectedHotspot={setSelectedHotspot}
          loadedGeneData={loadedGeneData}
          setLoadedGeneData={setLoadedGeneData}
          onClearAll={handleClearAll}
        />
        <div className="flex-1 flex items-center justify-center p-4 bg-black/20">
          <ImageViewer
            imageUrl={wsiUrl}
            onSelect={setSelectionRect}
            stDataVisible={stDataVisible}
            geneSearchResult={geneSearchResult}
            selectedHotspot={selectedHotspot}
            onHotspotClick={setSelectedHotspot}
          />
        </div>
      </main>
    </div>
  );
};

export default App;
