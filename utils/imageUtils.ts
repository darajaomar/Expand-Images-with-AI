import { Size } from '../types';

// Helper to read file as Data URL
export const readFileAsDataURL = (file: File): Promise<string> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
};

// Helper to load an image object from a source URL
export const loadImage = (src: string): Promise<HTMLImageElement> => {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.crossOrigin = "anonymous";
    img.onload = () => resolve(img);
    img.onerror = reject;
    img.src = src;
  });
};

// Calculate dimensions to fit 'source' inside 'target' (contain)
export const calculateFitDimensions = (
  source: Size,
  target: Size
): { width: number; height: number; x: number; y: number } => {
  const sourceRatio = source.width / source.height;
  const targetRatio = target.width / target.height;

  let width, height;

  if (sourceRatio > targetRatio) {
    // Source is wider than target (fit to width)
    width = target.width;
    height = target.width / sourceRatio;
  } else {
    // Source is taller than target (fit to height)
    height = target.height;
    width = target.height * sourceRatio;
  }

  return {
    width,
    height,
    x: (target.width - width) / 2,
    y: (target.height - height) / 2
  };
};
