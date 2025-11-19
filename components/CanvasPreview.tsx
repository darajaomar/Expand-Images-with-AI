import React, { useEffect, useRef, useState, forwardRef, useImperativeHandle } from 'react';
import { GenerationSettings, Size } from '../types';
import { calculateFitDimensions } from '../utils/imageUtils';

interface CanvasPreviewProps {
  originalImage: HTMLImageElement | null;
  settings: GenerationSettings;
}

export interface CanvasPreviewHandle {
  getDataURL: () => string | null;
}

const CanvasPreview = forwardRef<CanvasPreviewHandle, CanvasPreviewProps>(({ originalImage, settings }, ref) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const [dimensions, setDimensions] = useState<Size>({ width: 0, height: 0 });

  useImperativeHandle(ref, () => ({
    getDataURL: () => {
      if (!canvasRef.current) return null;
      return canvasRef.current.toDataURL('image/png');
    }
  }));

  useEffect(() => {
    if (!canvasRef.current || !originalImage) return;

    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // 1. Set Canvas Dimensions to the Target Resolution
    const targetWidth = settings.resolution.width;
    const targetHeight = settings.resolution.height;

    canvas.width = targetWidth;
    canvas.height = targetHeight;
    setDimensions({ width: targetWidth, height: targetHeight });

    // 2. Draw Logic
    
    // Fill background with black/dark color
    ctx.fillStyle = '#0f172a'; // Matches app bg
    ctx.fillRect(0, 0, targetWidth, targetHeight);

    // Calculate how to place the original image (Contain)
    const fit = calculateFitDimensions(
      { width: originalImage.width, height: originalImage.height },
      { width: targetWidth, height: targetHeight }
    );

    // Draw Blurred Background (Scale to Cover)
    // We want the background to cover the whole canvas so there are no black bars, 
    // but we blur it to serve as context for the AI.
    const scaleCover = Math.max(
        targetWidth / originalImage.width, 
        targetHeight / originalImage.height
    );
    
    const bgW = originalImage.width * scaleCover;
    const bgH = originalImage.height * scaleCover;
    const bgX = (targetWidth - bgW) / 2;
    const bgY = (targetHeight - bgH) / 2;

    ctx.save();
    ctx.filter = 'blur(30px) brightness(0.6)'; 
    // Draw a slightly larger rect to avoid edge bleeding issues with blur
    ctx.drawImage(originalImage, bgX - 10, bgY - 10, bgW + 20, bgH + 20);
    ctx.restore();

    // Draw Original Image Centered (Fit/Contain)
    ctx.save();
    // Optional: Add a small shadow behind the original image to separate it visually
    // ctx.shadowColor = "rgba(0,0,0,0.5)";
    // ctx.shadowBlur = 20;
    ctx.drawImage(originalImage, fit.x, fit.y, fit.width, fit.height);
    ctx.restore();

  }, [originalImage, settings]);

  if (!originalImage) {
    return (
      <div className="w-full h-64 bg-slate-800/50 rounded-xl border-2 border-dashed border-slate-700 flex items-center justify-center text-slate-500">
        Upload an image to start
      </div>
    );
  }

  return (
    <div className="relative w-full flex items-center justify-center bg-slate-900/50 rounded-xl border border-slate-700 p-4 overflow-hidden shadow-inner">
      <div className="relative shadow-2xl" style={{ maxWidth: '100%', maxHeight: '600px' }}>
        <canvas 
          ref={canvasRef} 
          className="max-w-full max-h-[60vh] w-auto h-auto object-contain rounded-sm border border-slate-800"
        />
        {/* Guide overlay showing original image bounds */}
        <div 
            className="absolute border border-white/20 pointer-events-none"
            style={{
                top: '50%',
                left: '50%',
                // We need to calculate the visual percentage width/height relative to the canvas element
                // Since we don't have easy access to the calculated 'fit' variables here in render without state,
                // we rely on the canvas drawing. 
                // Instead of complex React state math for this overlay, let's just use the canvas result.
                // But to show "Original" label, we can do a simple trick if we really want it.
                // For now, clean look is better.
                display: 'none' 
            }}
        >
        </div>
      </div>
    </div>
  );
});

export default CanvasPreview;
