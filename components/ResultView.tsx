import React from 'react';
import { GeneratedResult } from '../types';

interface ResultViewProps {
  result: GeneratedResult | null;
  onClose: () => void;
}

const ResultView: React.FC<ResultViewProps> = ({ result, onClose }) => {
  if (!result) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md">
      <div className="bg-slate-900 border border-slate-700 rounded-2xl max-w-5xl w-full max-h-[95vh] flex flex-col shadow-2xl overflow-hidden">
        
        <div className="flex items-center justify-between p-4 border-b border-slate-800">
          <h3 className="text-lg font-semibold text-white">Extended Result</h3>
          <button 
            onClick={onClose}
            className="p-2 hover:bg-slate-800 rounded-full text-slate-400 hover:text-white transition-colors"
          >
            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>
          </button>
        </div>

        <div className="flex-1 overflow-auto p-6 flex items-center justify-center bg-slate-950/50">
          <img 
            src={result.imageUrl} 
            alt="Extended result" 
            className="max-w-full max-h-[70vh] object-contain rounded shadow-lg border border-slate-800"
          />
        </div>

        <div className="p-6 border-t border-slate-800 bg-slate-900 flex flex-col md:flex-row gap-4 items-center justify-between">
          <div className="text-slate-400 text-sm max-w-lg">
            <p><span className="text-slate-300 font-medium">Prompt used:</span> {result.prompt || "Seamless expansion"}</p>
          </div>
          <div className="flex gap-3">
             <button 
              onClick={onClose}
              className="px-4 py-2 rounded-lg border border-slate-600 text-slate-300 hover:bg-slate-800 transition-colors"
            >
              Close
            </button>
            <a 
              href={result.imageUrl} 
              download={`expanse-ai-${Date.now()}.png`}
              className="px-6 py-2 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white font-medium shadow-lg shadow-indigo-500/20 transition-all flex items-center gap-2"
            >
              <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path><polyline points="7 10 12 15 17 10"></polyline><line x1="12" y1="15" x2="12" y2="3"></line></svg>
              Download Image
            </a>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ResultView;
