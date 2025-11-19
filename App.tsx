import React, { useState, useRef } from 'react';
import CanvasPreview, { CanvasPreviewHandle } from './components/CanvasPreview';
import ResultView from './components/ResultView';
import { Resolution, GenerationSettings, GeneratedResult } from './types';
import { readFileAsDataURL, loadImage } from './utils/imageUtils';
import { generateExpandedImage } from './services/geminiService';

const PRESET_RESOLUTIONS: Resolution[] = [
  { width: 1280, height: 720, label: '1280 x 720', description: 'HD Landscape' },
  { width: 1920, height: 1080, label: '1920 x 1080', description: 'Full HD' },
  { width: 1080, height: 1920, label: '1080 x 1920', description: 'Vertical Story' },
  { width: 1080, height: 1080, label: '1080 x 1080', description: 'Square' },
];

const App: React.FC = () => {
  const [originalImage, setOriginalImage] = useState<HTMLImageElement | null>(null);
  const [settings, setSettings] = useState<GenerationSettings>({
    resolution: PRESET_RESOLUTIONS[0], // Default to 1280x720
    prompt: ''
  });
  const [isGenerating, setIsGenerating] = useState(false);
  const [result, setResult] = useState<GeneratedResult | null>(null);
  const [error, setError] = useState<string | null>(null);
  
  const canvasRef = useRef<CanvasPreviewHandle>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      try {
        const url = await readFileAsDataURL(e.target.files[0]);
        const img = await loadImage(url);
        setOriginalImage(img);
        setError(null);
        setResult(null);
      } catch (err) {
        setError("Failed to load image.");
      }
    }
  };

  const handleGenerate = async () => {
    if (!process.env.API_KEY) {
      setError("API Key is missing in environment variables.");
      return;
    }
    
    const paddedImageBase64 = canvasRef.current?.getDataURL();
    if (!paddedImageBase64) {
      setError("Could not prepare image for generation.");
      return;
    }

    setIsGenerating(true);
    setError(null);

    try {
      const outputUrl = await generateExpandedImage(
        paddedImageBase64,
        settings.prompt,
        process.env.API_KEY
      );

      setResult({
        imageUrl: outputUrl,
        prompt: settings.prompt,
        timestamp: Date.now()
      });
    } catch (err: any) {
      setError(err.message || "Generation failed. Please try again.");
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#0B1120] text-slate-200 selection:bg-indigo-500/30">
      {/* Header */}
      <header className="border-b border-slate-800 bg-[#0F172A]/80 backdrop-blur-sm sticky top-0 z-30">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-lg flex items-center justify-center shadow-lg shadow-indigo-500/20">
              <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="15 3 21 3 21 9"></polyline><polyline points="9 21 3 21 3 15"></polyline><line x1="21" y1="3" x2="14" y2="10"></line><line x1="3" y1="21" x2="10" y2="14"></line></svg>
            </div>
            <span className="font-bold text-xl tracking-tight text-white">Expanse AI</span>
          </div>
          <div className="text-xs font-mono text-slate-500 hidden sm:block">
            POWERED BY GEMINI 2.5
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        
        {/* Error Banner */}
        {error && (
          <div className="mb-6 p-4 bg-red-500/10 border border-red-500/20 rounded-lg text-red-400 flex items-center gap-3">
            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"></circle><line x1="12" y1="8" x2="12" y2="12"></line><line x1="12" y1="16" x2="12.01" y2="16"></line></svg>
            {error}
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          
          {/* Left Column: Controls */}
          <div className="lg:col-span-4 space-y-6">
            
            {/* Upload Section */}
            <div className="bg-slate-900/50 border border-slate-800 rounded-2xl p-6 shadow-xl">
              <h2 className="text-sm uppercase tracking-wider text-slate-500 font-semibold mb-4">1. Source Image</h2>
              <div 
                onClick={() => fileInputRef.current?.click()}
                className="group cursor-pointer relative w-full h-32 border-2 border-dashed border-slate-700 hover:border-indigo-500 rounded-xl flex flex-col items-center justify-center transition-all bg-slate-900 hover:bg-slate-800"
              >
                 <input 
                  type="file" 
                  ref={fileInputRef} 
                  onChange={handleFileChange} 
                  accept="image/*" 
                  className="hidden" 
                />
                <div className="p-3 bg-slate-800 rounded-full mb-2 group-hover:scale-110 transition-transform">
                  <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-indigo-400"><rect x="3" y="3" width="18" height="18" rx="2" ry="2"></rect><circle cx="8.5" cy="8.5" r="1.5"></circle><polyline points="21 15 16 10 5 21"></polyline></svg>
                </div>
                <span className="text-sm text-slate-400 group-hover:text-white transition-colors">
                  {originalImage ? "Change Image" : "Upload Photo"}
                </span>
              </div>
            </div>

            {/* Settings Section */}
            <div className={`bg-slate-900/50 border border-slate-800 rounded-2xl p-6 shadow-xl transition-opacity ${!originalImage ? 'opacity-50 pointer-events-none' : 'opacity-100'}`}>
              <h2 className="text-sm uppercase tracking-wider text-slate-500 font-semibold mb-4">2. Output Resolution</h2>
              
              {/* Resolution Grid */}
              <div className="grid grid-cols-2 gap-3 mb-6">
                {PRESET_RESOLUTIONS.map((res) => (
                  <button
                    key={res.label}
                    onClick={() => setSettings(s => ({ ...s, resolution: res }))}
                    className={`p-3 rounded-xl border text-left transition-all relative overflow-hidden group ${
                      settings.resolution.width === res.width && settings.resolution.height === res.height
                        ? 'bg-indigo-600 border-indigo-500 shadow-lg shadow-indigo-500/25'
                        : 'bg-slate-800 border-slate-700 hover:bg-slate-750 hover:border-slate-600'
                    }`}
                  >
                    <div className={`font-semibold text-sm mb-1 ${
                         settings.resolution.width === res.width && settings.resolution.height === res.height ? 'text-white' : 'text-slate-200'
                    }`}>
                      {res.label}
                    </div>
                    <div className={`text-xs ${
                        settings.resolution.width === res.width && settings.resolution.height === res.height ? 'text-indigo-100' : 'text-slate-500 group-hover:text-slate-400'
                    }`}>
                      {res.description}
                    </div>
                    {settings.resolution.width === res.width && settings.resolution.height === res.height && (
                        <div className="absolute top-2 right-2 w-2 h-2 rounded-full bg-white shadow-sm"></div>
                    )}
                  </button>
                ))}
              </div>

              {/* Text Prompt */}
              <div className="mb-6">
                <label className="block text-sm font-medium text-slate-300 mb-2">
                  Vision Prompt <span className="text-slate-500 font-normal">(Optional)</span>
                </label>
                <textarea
                  value={settings.prompt}
                  onChange={(e) => setSettings(s => ({ ...s, prompt: e.target.value }))}
                  placeholder="Describe what to fill in the background (e.g., 'A snowy mountain range with pine trees')..."
                  className="w-full h-24 bg-slate-950 border border-slate-700 rounded-xl p-3 text-sm text-slate-200 focus:ring-2 focus:ring-indigo-500/50 focus:border-indigo-500 outline-none resize-none transition-all placeholder:text-slate-600"
                />
              </div>

              <button
                onClick={handleGenerate}
                disabled={isGenerating}
                className={`w-full py-3.5 rounded-xl font-semibold text-white shadow-lg transition-all flex items-center justify-center gap-2 relative overflow-hidden ${
                  isGenerating 
                    ? 'bg-slate-700 cursor-not-allowed' 
                    : 'bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 shadow-indigo-500/25 hover:shadow-indigo-500/40'
                }`}
              >
                {isGenerating ? (
                  <>
                    <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    <span>Extending Canvas...</span>
                  </>
                ) : (
                  <>
                    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 3V21M3 12H21"/></svg>
                    <span>Generate Expanse</span>
                  </>
                )}
              </button>
            </div>

            <div className="bg-slate-900/30 border border-slate-800/50 rounded-xl p-4">
              <h4 className="text-xs font-semibold text-slate-500 uppercase mb-2">How it works</h4>
              <p className="text-xs text-slate-400 leading-relaxed">
                The AI takes your image, centers it on a {settings.resolution.label} canvas, and hallucinates realistic surroundings to fill the empty space based on your prompt.
              </p>
            </div>

          </div>

          {/* Right Column: Preview */}
          <div className="lg:col-span-8">
             <div className="bg-slate-900/50 border border-slate-800 rounded-2xl p-1 shadow-xl h-full min-h-[500px] flex flex-col">
                <div className="flex items-center justify-between px-6 py-4 border-b border-slate-800">
                  <h2 className="text-sm uppercase tracking-wider text-slate-500 font-semibold">Preview</h2>
                  {originalImage ? (
                     <div className="text-xs flex gap-3 text-slate-400">
                        <span>Src: <span className="text-slate-300">{originalImage.width}x{originalImage.height}</span></span>
                        <span>Target: <span className="text-indigo-400 font-semibold">{settings.resolution.label}</span></span>
                     </div>
                  ) : (
                    <span className="text-xs text-slate-500">No image selected</span>
                  )}
                </div>
                <div className="flex-1 flex items-center justify-center p-6 bg-[#050911] rounded-b-xl relative overflow-hidden">
                    {/* Grid pattern background */}
                    <div className="absolute inset-0 opacity-20" 
                         style={{ backgroundImage: 'radial-gradient(#334155 1px, transparent 1px)', backgroundSize: '24px 24px' }}>
                    </div>
                    
                    <CanvasPreview 
                      ref={canvasRef} 
                      originalImage={originalImage} 
                      settings={settings} 
                    />
                </div>
             </div>
          </div>
        </div>
      </main>

      {/* Result Modal */}
      <ResultView 
        result={result} 
        onClose={() => setResult(null)} 
      />
    </div>
  );
};

export default App;
