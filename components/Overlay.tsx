import React from 'react';
import { TreeMorphState } from '../types';

interface OverlayProps {
  treeState: TreeMorphState;
  onToggle: () => void;
}

export const Overlay: React.FC<OverlayProps> = ({ treeState, onToggle }) => {
  const isTree = treeState === TreeMorphState.TREE_SHAPE;

  return (
    <div className="absolute inset-0 pointer-events-none flex flex-col justify-between p-8 md:p-12 z-10 text-[#f0f0f0]">
      {/* Header */}
      <header className="flex flex-col items-start gap-2 animate-fade-in-down">
        <h3 className="text-gold-400 font-serif tracking-[0.2em] text-sm uppercase opacity-80" style={{ color: '#D4AF37' }}>
          Interactive Collection
        </h3>
        <h1 className="text-4xl md:text-6xl font-serif font-bold leading-tight" style={{ fontFamily: '"Playfair Display", serif' }}>
          ARIX <br />
          <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#D4AF37] via-[#FFF8C6] to-[#D4AF37]">
            SIGNATURE
          </span>
        </h1>
      </header>

      {/* Controls */}
      <div className="flex flex-col items-center md:items-end gap-6 pointer-events-auto">
        <div className="flex flex-col items-end text-right space-y-1">
            <span className="text-xs tracking-widest uppercase opacity-50">Current Mode</span>
            <span className="text-xl font-serif text-[#D4AF37]">
                {isTree ? "Imperial Cone" : "Stardust Drift"}
            </span>
        </div>

        <button
          onClick={onToggle}
          className="group relative px-8 py-4 bg-[#0a0f0d] bg-opacity-80 border border-[#D4AF37] overflow-hidden transition-all duration-500 hover:bg-[#D4AF37] hover:bg-opacity-10 backdrop-blur-sm"
        >
          <span className="absolute w-0 h-full bg-[#D4AF37] left-0 top-0 opacity-20 transition-all duration-300 group-hover:w-full"></span>
          <span className="relative font-serif tracking-widest uppercase text-sm font-bold text-[#D4AF37] group-hover:text-white transition-colors duration-300">
            {isTree ? "Release to Chaos" : "Assemble Form"}
          </span>
        </button>
      </div>

      {/* Footer / Credits */}
      <div className="absolute bottom-8 left-8 md:left-12 opacity-40 text-xs tracking-widest">
        EXPERIENCE 001 // REACT THREE FIBER
      </div>
    </div>
  );
};