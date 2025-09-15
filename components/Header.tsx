
import React from 'react';

export const Header: React.FC = () => {
  return (
    <header className="bg-brand-secondary shadow-md z-10 p-3">
      <h1 className="text-xl font-bold text-brand-text">
        <span className="text-brand-highlight">PathoST-GNN:</span> Interactive Query Interface
      </h1>
      <h2 className="text-sm text-brand-light">Hypergraph Neural Fields for WSI & Spatial Transcriptomics Co-registration</h2>
    </header>
  );
};
