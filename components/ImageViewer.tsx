import React, { useState, useRef, useEffect } from 'react';
import type { SelectionRect, GeneSearchResult, GeneHotspot } from '../types';

interface ImageViewerProps {
  imageUrl: string;
  onSelect: (rect: SelectionRect | null) => void;
  stDataVisible: boolean;
  geneSearchResult: GeneSearchResult | null;
  selectedHotspot: GeneHotspot | null;
  onHotspotClick: (hotspot: GeneHotspot | null) => void;
}

export const ImageViewer: React.FC<ImageViewerProps> = ({ imageUrl, onSelect, stDataVisible, geneSearchResult, selectedHotspot, onHotspotClick }) => {
  const [isSelecting, setIsSelecting] = useState(false);
  const [startPoint, setStartPoint] = useState({ x: 0, y: 0 });
  const [selection, setSelection] = useState<SelectionRect | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // Reset selection when image changes
    setSelection(null);
    onSelect(null);
  }, [imageUrl, onSelect]);
  
  const getCoords = (e: React.MouseEvent<HTMLDivElement>): { x: number; y: number } => {
    if (!containerRef.current) return { x: 0, y: 0 };
    const rect = containerRef.current.getBoundingClientRect();
    const targetWidth = containerRef.current.clientWidth;
    const targetHeight = containerRef.current.clientHeight;

    // This part requires knowing the actual image dimensions to scale correctly.
    // For picsum photos, we requested 1024x768, so we assume that's the intrinsic size.
    // A more robust solution would use the image's naturalWidth/naturalHeight on load.
    const naturalWidth = 1024;
    const naturalHeight = 768;

    const scaleX = targetWidth / naturalWidth;
    const scaleY = targetHeight / naturalHeight;
    const scale = Math.min(scaleX, scaleY);
    
    const imgDisplayWidth = naturalWidth * scale;
    const imgDisplayHeight = naturalHeight * scale;
    
    const offsetX = (targetWidth - imgDisplayWidth) / 2;
    const offsetY = (targetHeight - imgDisplayHeight) / 2;

    return {
      x: (e.clientX - rect.left - offsetX) / scale,
      y: (e.clientY - rect.top - offsetY) / scale,
    };
  };

  const handleMouseDown = (e: React.MouseEvent<HTMLDivElement>) => {
    e.preventDefault();
    onHotspotClick(null); // Clear selected hotspot when starting a new selection
    setIsSelecting(true);
    const coords = getCoords(e);
    setStartPoint(coords);
    setSelection({ ...coords, width: 0, height: 0 });
  };

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!isSelecting) return;
    const currentCoords = getCoords(e);
    const newSelection: SelectionRect = {
      x: Math.min(startPoint.x, currentCoords.x),
      y: Math.min(startPoint.y, currentCoords.y),
      width: Math.abs(startPoint.x - currentCoords.x),
      height: Math.abs(startPoint.y - currentCoords.y),
    };
    setSelection(newSelection);
  };
  
  const getDisplayCoords = (rect: SelectionRect) => {
    if (!containerRef.current) return { left: 0, top: 0, width: 0, height: 0 };
    
    const targetWidth = containerRef.current.clientWidth;
    const targetHeight = containerRef.current.clientHeight;

    const naturalWidth = 1024;
    const naturalHeight = 768;

    const scaleX = targetWidth / naturalWidth;
    const scaleY = targetHeight / naturalHeight;
    const scale = Math.min(scaleX, scaleY);
    
    const imgDisplayWidth = naturalWidth * scale;
    const imgDisplayHeight = naturalHeight * scale;
    
    const offsetX = (targetWidth - imgDisplayWidth) / 2;
    const offsetY = (targetHeight - imgDisplayHeight) / 2;

    return {
        left: rect.x * scale + offsetX,
        top: rect.y * scale + offsetY,
        width: rect.width * scale,
        height: rect.height * scale,
    }
  }


  const handleMouseUp = () => {
    setIsSelecting(false);
    if (selection && selection.width > 5 && selection.height > 5) {
      onSelect(selection);
    } else {
      onSelect(null);
      setSelection(null);
    }
  };
  
  const handleMouseLeave = () => {
      if (isSelecting) {
          handleMouseUp();
      }
  };

  return (
    <div
      ref={containerRef}
      className="relative w-full h-full cursor-crosshair select-none overflow-hidden bg-black flex items-center justify-center"
      onMouseDown={handleMouseDown}
      onMouseMove={handleMouseMove}
      onMouseUp={handleMouseUp}
      onMouseLeave={handleMouseLeave}
    >
      <div className="relative" style={{maxWidth: '100%', maxHeight: '100%'}}>
        <img src={imageUrl} alt="Whole-Slide Image" className="max-w-full max-h-full object-contain pointer-events-none" />
        
        {stDataVisible && (
          <div 
            className="absolute top-0 left-0 w-full h-full pointer-events-none"
            style={{
              backgroundImage: 'radial-gradient(rgba(100, 255, 218, 0.4) 1px, transparent 1px)',
              backgroundSize: '20px 20px',
            }}
          />
        )}
        
        {selection && (
          <div
            className="absolute border-2 border-brand-highlight bg-brand-highlight/20"
            style={getDisplayCoords(selection)}
          />
        )}

        {geneSearchResult?.hotspots.map((hotspot, index) => {
            // Hotspot size in image coordinates.
            const hotspotSize = 20; 
            const displayCoords = getDisplayCoords({
                x: hotspot.x,
                y: hotspot.y,
                width: hotspotSize, 
                height: hotspotSize
            });
            
            const isSelected = selectedHotspot && selectedHotspot.x === hotspot.x && selectedHotspot.y === hotspot.y;

            return (
              <div
                key={index}
                className="absolute group"
                style={{
                  left: displayCoords.left,
                  top: displayCoords.top,
                  width: displayCoords.width,
                  height: displayCoords.height,
                  transform: 'translate(-50%, -50%)', // Center the hotspot
                }}
                onClick={(e) => {
                    e.stopPropagation(); // Prevent triggering onMouseDown on the container
                    onHotspotClick(isSelected ? null : hotspot);
                }}
              >
                {/* The pulsing hotspot */}
                <div className="relative w-full h-full cursor-pointer">
                    {/* Outer ping animation */}
                    <div className="absolute inline-flex h-full w-full rounded-full bg-brand-highlight opacity-75 animate-subtle-ping"></div>
                    {/* Inner static circle */}
                    <div className="relative inline-flex rounded-full h-full w-full bg-brand-highlight border-2 border-brand-primary"></div>
                    {/* Selection ring */}
                    {isSelected && (
                      <div className="absolute top-0 left-0 w-full h-full rounded-full ring-2 ring-yellow-300 animate-pulse"></div>
                    )}
                </div>

                {/* Custom Tooltip */}
                <div 
                  className="absolute bottom-full mb-2 w-max bg-brand-secondary text-brand-text text-xs rounded py-1 px-2 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none transform -translate-x-1/2 left-1/2 shadow-lg"
                  role="tooltip"
                >
                  <strong className="text-brand-highlight">{geneSearchResult.geneName}</strong>
                  <p>Expression: {hotspot.expression.toFixed(2)}</p>
                  <div className="absolute top-full left-1/2 -translate-x-1/2 w-0 h-0 border-x-4 border-x-transparent border-t-4 border-t-brand-secondary" aria-hidden="true"></div>
                </div>
              </div>
            )
        })}
      </div>
      <div className="absolute bottom-2 right-2 bg-black/50 text-white text-xs px-2 py-1 rounded">
        Click and drag to select a region for analysis
      </div>
    </div>
  );
};