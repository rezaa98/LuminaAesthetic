import { useEffect, useState, useRef } from 'react';

interface RecoloredImageProps {
  imageSrc: string;
  targetColorHex: string;
  shirtColor: { r: number; g: number; b: number } | null;
  tolerance?: number; // 0 - 100, default around 45
  className?: string;
}

export const RecoloredImage = ({
  imageSrc,
  targetColorHex,
  shirtColor,
  tolerance = 45,
  className = ""
}: RecoloredImageProps) => {
  const [renderedSrc, setRenderedSrc] = useState<string>(imageSrc);
  const [isProcessing, setIsProcessing] = useState<boolean>(false);
  const cacheKeyRef = useRef<string>("");

  useEffect(() => {
    if (!imageSrc) return;
    if (!shirtColor) {
      setRenderedSrc(imageSrc);
      return;
    }

    // Cache key to prevent redundant heavy rendering
    const currentKey = `${imageSrc.substring(0, 100)}_${targetColorHex}_${shirtColor.r},${shirtColor.g},${shirtColor.b}_${tolerance}`;
    if (cacheKeyRef.current === currentKey) return;
    cacheKeyRef.current = currentKey;

    setIsProcessing(true);

    const img = new Image();
    img.crossOrigin = "anonymous";
    img.src = imageSrc;

    img.onload = () => {
      // Create offscreen canvas for rendering
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');
      if (!ctx) {
        setIsProcessing(false);
        return;
      }

      // Max size to keep calculations fast and responsive
      const maxDim = 400;
      let width = img.naturalWidth || img.width;
      let height = img.naturalHeight || img.height;

      if (width > maxDim || height > maxDim) {
        if (width > height) {
          height = Math.round((height * maxDim) / width);
          width = maxDim;
        } else {
          width = Math.round((width * maxDim) / height);
          height = maxDim;
        }
      }

      canvas.width = width;
      canvas.height = height;
      ctx.drawImage(img, 0, 0, width, height);

      const imgData = ctx.getImageData(0, 0, width, height);
      const data = imgData.data;

      // Convert target Hex to RGB
      const hexToRgb = (hex: string) => {
        const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
        return result ? {
          r: parseInt(result[1], 16),
          g: parseInt(result[2], 16),
          b: parseInt(result[3], 16)
        } : { r: 120, g: 120, b: 120 };
      };

      const targetRgb = hexToRgb(targetColorHex);

      // Color convertors
      const rgbToHsl = (r: number, g: number, b: number) => {
        r /= 255; g /= 255; b /= 255;
        const max = Math.max(r, g, b), min = Math.min(r, g, b);
        let h = 0, s = 0, l = (max + min) / 2;

        if (max !== min) {
          const d = max - min;
          s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
          if (max === r) {
            h = (g - b) / d + (g < b ? 6 : 0);
          } else if (max === g) {
            h = (b - r) / d + 2;
          } else if (max === b) {
            h = (r - g) / d + 4;
          }
          h /= 6;
        }
        return { h: h * 360, s: s * 100, l: l * 100 };
      };

      const hslToRgb = (h: number, s: number, l: number) => {
        h /= 360; s /= 100; l /= 100;
        let r, g, b;

        if (s === 0) {
          r = g = b = l;
        } else {
          const hue2rgb = (p: number, q: number, t: number) => {
            if (t < 0) t += 1;
            if (t > 1) t -= 1;
            if (t < 1/6) return p + (q - p) * 6 * t;
            if (t < 1/2) return q;
            if (t < 2/3) return p + (q - p) * (2/3 - t) * 6;
            return p;
          };
          const q = l < 0.5 ? l * (1 + s) : l + s - l * s;
          const p = 2 * l - q;
          r = hue2rgb(p, q, h + 1/3);
          g = hue2rgb(p, q, h);
          b = hue2rgb(p, q, h - 1/3);
        }
        return {
          r: Math.round(r * 255),
          g: Math.round(g * 255),
          b: Math.round(b * 255)
        };
      };

      const refHsl = rgbToHsl(shirtColor.r, shirtColor.g, shirtColor.b);
      const targetHsl = rgbToHsl(targetRgb.r, targetRgb.g, targetRgb.b);

      // We process only the bottom portion of the image to keep background skin protected
      // Assume top 35% of image is face/hair, we can keep full tolerance in bottom 65%.
      // In upper 35% we use a much tighter tolerance to protect hair/hijab unless it's the target fabric itself.
      const boundaryY = Math.round(height * 0.35);

      for (let i = 0; i < data.length; i += 4) {
        const r = data[i];
        const g = data[i + 1];
        const b = data[i + 2];

        // Pixel Coordinate
        const pixelIdx = i / 4;
        const py = Math.floor(pixelIdx / width);

        // Convert pixel to HSL
        const pixHsl = rgbToHsl(r, g, b);

        // Compute HSL distance to reference shirt color
        let hDiff = Math.min(Math.abs(pixHsl.h - refHsl.h), 360 - Math.abs(pixHsl.h - refHsl.h));
        let sDiff = Math.abs(pixHsl.s - refHsl.s);
        let lDiff = Math.abs(pixHsl.l - refHsl.l);

        // Dynamic tolerance based on Y height (to protect face area)
        let customToleranceHue = tolerance;
        let customToleranceSat = tolerance * 1.25;

        if (py < boundaryY) {
          // upper body/face region: tighten tolerance immensely to protect skin and lips
          customToleranceHue = tolerance * 0.45;
          customToleranceSat = tolerance * 0.5;
        }

        // Distance in RGB space as absolute fallback
        const rDiff = Math.abs(r - shirtColor.r);
        const gDiff = Math.abs(g - shirtColor.g);
        const bDiff = Math.abs(b - shirtColor.b);
        const rgbDistance = Math.sqrt(rDiff * rDiff + gDiff * gDiff + bDiff * bDiff);

        // Determine if pixel belongs to the shirt color range
        const matchesHue = hDiff < customToleranceHue;
        const matchesSat = sDiff < customToleranceSat;
        const matchesLuminance = lDiff < 38; // prevent extreme whites/blacks from shifting

        // Protect skin colors (typically warm hue between 0 and 42 degrees, with certain saturation/lightness)
        const isSkinColor = pixHsl.h >= 0 && pixHsl.h <= 36 && pixHsl.s > 10 && pixHsl.s < 60 && pixHsl.l > 30 && pixHsl.l < 85;

        // Combine match logic
        // If shirt color is skin-like, we skip skin protection. If not, protect skin.
        const refIsSkin = refHsl.h >= 0 && refHsl.h <= 36 && refHsl.s > 10 && refHsl.s < 60;
        const shouldProtectSkin = !refIsSkin && isSkinColor;

        if (matchesHue && matchesSat && matchesLuminance && !shouldProtectSkin) {
          // Fabric Shading preservation:
          // Keep the original lightness details of the folds/wrinkles
          // We apply the ratio of original pixel lightness relative to reference shirt lightness
          let newL = targetHsl.l;
          
          if (refHsl.l > 0) {
            const ratio = pixHsl.l / refHsl.l;
            newL = Math.min(100, Math.max(0, targetHsl.l * ratio));
          }

          // Generate new RGB
          const newRgb = hslToRgb(targetHsl.h, targetHsl.s, newL);

          // Write back with slight blending to avoid harsh edges
          data[i] = newRgb.r;
          data[i + 1] = newRgb.g;
          data[i + 2] = newRgb.b;
        }
      }

      ctx.putImageData(imgData, 0, 0);
      try {
        const dataUrl = canvas.toDataURL("image/jpeg", 0.9);
        setRenderedSrc(dataUrl);
      } catch (err) {
        console.error("Canvas toDataURL failed:", err);
        setRenderedSrc(imageSrc);
      }
      setIsProcessing(false);
    };

    img.onerror = () => {
      setRenderedSrc(imageSrc);
      setIsProcessing(false);
    };

  }, [imageSrc, targetColorHex, shirtColor, tolerance]);

  return (
    <div className="relative w-full h-full">
      <img
        src={renderedSrc}
        alt="Color virtual try-on avatar"
        referrerPolicy="no-referrer"
        className={`${className} transition-opacity duration-300 ${isProcessing ? 'opacity-70' : 'opacity-100'}`}
      />
      {isProcessing && (
        <div className="absolute inset-0 bg-stone-900/10 backdrop-blur-[1px] flex items-center justify-center">
          <div className="w-5 h-5 border-2 border-indigo-500 border-t-transparent rounded-full animate-spin"></div>
        </div>
      )}
    </div>
  );
};
