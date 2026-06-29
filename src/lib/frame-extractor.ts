export interface ExtractedFrame {
  index: number;
  timestamp: number;
  blob: Blob;
  thumbnailUrl: string;
  blurScore: number;
  brightness: number;
}

export interface ExtractionProgress {
  phase: 'extracting' | 'filtering' | 'selecting';
  current: number;
  total: number;
}

export type ProgressCallback = (progress: ExtractionProgress) => void;

// Helper to calculate brightness
export function computeBrightness(imageData: ImageData): number {
  let sum = 0;
  const data = imageData.data;
  const len = data.length;
  // Sample every 4th pixel to speed up
  let count = 0;
  for (let i = 0; i < len; i += 16) {
    const r = data[i];
    const g = data[i + 1];
    const b = data[i + 2];
    // Luminance formula
    sum += 0.299 * r + 0.587 * g + 0.114 * b;
    count++;
  }
  return sum / count;
}

// Helper to calculate blur score (Laplacian variance)
export function computeBlurScore(imageData: ImageData): number {
  const width = imageData.width;
  const height = imageData.height;
  const data = imageData.data;

  // We'll operate on a scaled-down version or just sample.
  // For performance, converting a patch to grayscale and applying a 3x3 kernel.
  // We'll sample a central patch to save time, or do the whole image if small enough.
  
  // Create a grayscale array
  const gray = new Uint8Array(width * height);
  for (let i = 0; i < width * height; i++) {
    const idx = i * 4;
    gray[i] = 0.299 * data[idx] + 0.587 * data[idx + 1] + 0.114 * data[idx + 2];
  }

  // Apply Laplacian kernel [0, 1, 0, 1, -4, 1, 0, 1, 0]
  let sum = 0;
  let sumSq = 0;
  let count = 0;

  // Avoid edges
  for (let y = 1; y < height - 1; y++) {
    for (let x = 1; x < width - 1; x++) {
      const idx = y * width + x;
      const val = 
        gray[idx - width] + 
        gray[idx - 1] - 4 * gray[idx] + gray[idx + 1] + 
        gray[idx + width];
      
      sum += val;
      sumSq += val * val;
      count++;
    }
  }

  const mean = sum / count;
  const variance = (sumSq / count) - (mean * mean);
  return variance;
}

// Helper to compute similarity between two ImageData
export function computeSimilarity(a: ImageData, b: ImageData): number {
  let diffSum = 0;
  const len = a.data.length;
  let count = 0;
  for (let i = 0; i < len; i += 16) {
    const rA = a.data[i];
    const gA = a.data[i + 1];
    const bA = a.data[i + 2];
    const grayA = 0.299 * rA + 0.587 * gA + 0.114 * bA;

    const rB = b.data[i];
    const gB = b.data[i + 1];
    const bB = b.data[i + 2];
    const grayB = 0.299 * rB + 0.587 * gB + 0.114 * bB;

    diffSum += Math.abs(grayA - grayB);
    count++;
  }
  const meanDiff = diffSum / count;
  // 0 difference = 1 similarity, 255 difference = 0 similarity
  return Math.max(0, 1 - (meanDiff / 255));
}

export async function extractKeyFrames(
  videoFile: File,
  onProgress?: ProgressCallback,
  options: { targetCount?: number; sampleIntervalSec?: number } = {}
): Promise<ExtractedFrame[]> {
  const targetCount = options.targetCount || 15;
  const sampleIntervalSec = options.sampleIntervalSec || 5;

  return new Promise((resolve, reject) => {
    const videoUrl = URL.createObjectURL(videoFile);
    const video = document.createElement('video');
    video.src = videoUrl;
    video.muted = true;
    video.playsInline = true;

    video.onloadedmetadata = async () => {
      try {
        const duration = video.duration;
        if (!duration || !isFinite(duration)) {
          throw new Error("Could not determine video duration.");
        }

        const width = video.videoWidth;
        const height = video.videoHeight;
        
        // Setup canvas
        const canvas = document.createElement('canvas');
        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext('2d', { willReadFrequently: true });
        if (!ctx) throw new Error("Could not get 2d context");

        const frames: { timestamp: number, blurScore: number, brightness: number, imageData: ImageData, blob: Blob, thumbnailUrl: string }[] = [];
        
        const timestamps = [];
        for (let t = 0; t < duration; t += sampleIntervalSec) {
          timestamps.push(t);
        }
        
        if (timestamps.length === 0) timestamps.push(0);

        for (let i = 0; i < timestamps.length; i++) {
          const t = timestamps[i];
          if (onProgress) onProgress({ phase: 'extracting', current: i, total: timestamps.length });

          await new Promise<void>((seekResolve) => {
            video.onseeked = () => seekResolve();
            video.currentTime = t;
          });

          ctx.drawImage(video, 0, 0, width, height);
          const imageData = ctx.getImageData(0, 0, width, height);
          
          const blurScore = computeBlurScore(imageData);
          const brightness = computeBrightness(imageData);

          // Convert to blob
          const blob = await new Promise<Blob | null>(res => canvas.toBlob(res, 'image/jpeg', 0.85));
          if (blob) {
            frames.push({
              timestamp: t,
              blurScore,
              brightness,
              imageData,
              blob,
              thumbnailUrl: URL.createObjectURL(blob)
            });
          }
        }

        if (onProgress) onProgress({ phase: 'filtering', current: 0, total: frames.length });

        // Filter bad frames
        // Brightness between 30 and 220
        // Blur score > threshold (e.g. 50 depending on scale, let's keep it lenient)
        const validFrames = frames.filter(f => f.brightness >= 30 && f.brightness <= 220 && f.blurScore >= 10);

        // If filtering removed everything, fallback to all frames to ensure we submit something
        let candidates = validFrames.length > 0 ? validFrames : frames;

        if (onProgress) onProgress({ phase: 'selecting', current: 0, total: candidates.length });

        // Deduplication
        const uniqueFrames = [];
        if (candidates.length > 0) {
          uniqueFrames.push(candidates[0]);
          for (let i = 1; i < candidates.length; i++) {
            const current = candidates[i];
            const prev = uniqueFrames[uniqueFrames.length - 1];
            const sim = computeSimilarity(current.imageData, prev.imageData);
            if (sim < 0.95) {
              uniqueFrames.push(current);
            } else {
              // Too similar, keep the one with higher blurScore (sharper)
              if (current.blurScore > prev.blurScore) {
                uniqueFrames[uniqueFrames.length - 1] = current;
              }
            }
          }
        }

        // Limit to targetCount by taking evenly spaced samples
        let finalFrames = uniqueFrames;
        if (finalFrames.length > targetCount) {
          const step = (finalFrames.length - 1) / (targetCount - 1);
          const sampled = [];
          for (let i = 0; i < targetCount; i++) {
            sampled.push(finalFrames[Math.round(i * step)]);
          }
          finalFrames = sampled;
        }

        // Cleanup unused object URLs
        for (const f of frames) {
          if (!finalFrames.includes(f)) {
            URL.revokeObjectURL(f.thumbnailUrl);
          }
        }
        URL.revokeObjectURL(videoUrl);

        const extracted: ExtractedFrame[] = finalFrames.map((f, i) => ({
          index: i,
          timestamp: f.timestamp,
          blob: f.blob,
          thumbnailUrl: f.thumbnailUrl,
          blurScore: f.blurScore,
          brightness: f.brightness
        }));

        resolve(extracted);

      } catch (err) {
        URL.revokeObjectURL(videoUrl);
        reject(err);
      }
    };

    video.onerror = () => {
      URL.revokeObjectURL(videoUrl);
      reject(new Error("Error loading video"));
    };
  });
}
