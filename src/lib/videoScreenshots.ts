// lib/videoScreenshots.ts

export interface ScreenshotData {
  blob: Blob;
  timestamp: number;
  base64: string;
}

// Laplacian sharpness metric for clear screenshots
function getImageSharpness(
  canvas: HTMLCanvasElement,
  ctx: CanvasRenderingContext2D
): number {
  const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
  const grayscale: number[] = [];
  for (let i = 0; i < imageData.data.length; i += 4) {
    grayscale.push(
      0.299 * imageData.data[i] +
        0.587 * imageData.data[i + 1] +
        0.114 * imageData.data[i + 2]
    );
  }
  let mean = 0;
  let sum = 0;
  for (let i = 0; i < grayscale.length - 1; i++) {
    const lap = grayscale[i + 1] - grayscale[i];
    sum += lap * lap;
    mean += lap;
  }
  mean = mean / grayscale.length;
  const variance = sum / grayscale.length - mean * mean;
  return variance;
}

export const extractScreenshots = (
  file: File,
  requestedScreenshots: number = 4
): Promise<ScreenshotData[]> => {
  return new Promise((resolve, reject) => {
    if (!file.type.startsWith("video/")) {
      reject(new Error("Invalid file type. Please upload a video file."));
      return;
    }
    const maxSize = 100 * 1024 * 1024; // 100MB
    if (file.size > maxSize) {
      reject(new Error("Video file is too large. Please upload a smaller video."));
      return;
    }

    const video = document.createElement("video");
    const canvas = document.createElement("canvas");
    const ctx = canvas.getContext("2d");
    if (!ctx) {
      reject(new Error("Canvas context not available. Browser may not support video processing."));
      return;
    }

    video.preload = "metadata";
    video.muted = true;
    video.playsInline = true;
    video.crossOrigin = "anonymous";
    const timeout = setTimeout(() => {
      reject(new Error("Video processing timeout. The video may be corrupted or in an unsupported format."));
    }, 45000);

    video.onloadedmetadata = () => {
      clearTimeout(timeout);
      const duration = video.duration;
      if (!duration || duration <= 0) {
        reject(new Error("Invalid video duration. Please upload a valid video file."));
        return;
      }

      // Decide screenshot intervals
      let minScreenshots = 5;
      let desiredScreenshots = requestedScreenshots;
      if (duration < 15) {
        desiredScreenshots = Math.max(2, Math.floor(duration / 5));
      } else {
        desiredScreenshots = Math.max(minScreenshots, Math.floor(duration / 6));
        desiredScreenshots = Math.min(desiredScreenshots, 10);
      }
      if (desiredScreenshots < minScreenshots) desiredScreenshots = minScreenshots;

      const timestamps: number[] = [];
      const startBuffer = Math.min(2, duration * 0.05);
      const endBuffer = Math.min(2, duration * 0.05);
      const usableDuration = duration - startBuffer - endBuffer;
      const interval = usableDuration / (desiredScreenshots + 1);

      for (let i = 0; i < desiredScreenshots; i++) {
        const timestamp = startBuffer + interval * (i + 1);
        timestamps.push(timestamp);
      }

      // Wait for video frame ready
      const waitForVideoReady = () => {
        return new Promise<void>((resolveWait) => {
          if (video.readyState >= 2) {
            resolveWait();
          } else {
            video.addEventListener("canplay", () => resolveWait(), { once: true });
          }
        });
      };

      // Screenshot extraction with sharpness filter
      const SHARPNESS_THRESHOLD = 100;
      const MAX_ATTEMPTS = 3;
      const screenshots: ScreenshotData[] = [];
      let currentIndex = 0;

      const captureScreenshot = async () => {
        if (currentIndex >= timestamps.length) {
          resolve(screenshots);
          return;
        }

        let timestamp = timestamps[currentIndex];
        let attempts = 0;
        let bestSharpness = 0;
        let bestBlob: Blob | null = null;
        let bestBase64 = "";

        while (attempts < MAX_ATTEMPTS) {
          video.currentTime = timestamp;
          await new Promise<void>((resolveSeeked) => {
            const onSeeked = () => {
              video.removeEventListener("seeked", onSeeked);
              resolveSeeked();
            };
            video.addEventListener("seeked", onSeeked);
            setTimeout(() => {
              video.removeEventListener("seeked", onSeeked);
              resolveSeeked();
            }, 1000);
          });
          await waitForVideoReady();
          await new Promise((resolve) => setTimeout(resolve, 200));

          // Canvas sizing/quality scaling
          let canvasWidth = video.videoWidth;
          let canvasHeight = video.videoHeight;
          const maxWidth = 1920, maxHeight = 1080;
          const aspectRatio = canvasWidth / canvasHeight;
          if (canvasWidth > maxWidth) {
            canvasWidth = maxWidth;
            canvasHeight = maxWidth / aspectRatio;
          }
          if (canvasHeight > maxHeight) {
            canvasHeight = maxHeight;
            canvasWidth = maxHeight * aspectRatio;
          }
          canvasWidth = Math.floor(canvasWidth / 2) * 2;
          canvasHeight = Math.floor(canvasHeight / 2) * 2;
          canvas.width = canvasWidth;
          canvas.height = canvasHeight;
          ctx.imageSmoothingEnabled = true;
          ctx.imageSmoothingQuality = "high";
          ctx.fillStyle = "#FFFFFF";
          ctx.fillRect(0, 0, canvasWidth, canvasHeight);

          ctx.drawImage(
            video, 0, 0, video.videoWidth, video.videoHeight,
            0, 0, canvasWidth, canvasHeight
          );

          let sharpness = getImageSharpness(canvas, ctx);
          if (sharpness > bestSharpness) {
            bestSharpness = sharpness;
            bestBase64 = canvas.toDataURL("image/jpeg", 0.95);
            bestBlob = await new Promise<Blob | null>((resolve) =>
              canvas.toBlob(resolve, "image/jpeg", 0.95)
            );
          }
          if (sharpness > SHARPNESS_THRESHOLD) break;

          timestamp += 0.2;
          attempts++;
        }
        if (bestBlob) {
          screenshots.push({
            blob: bestBlob,
            timestamp,
            base64: bestBase64,
          });
        }
        currentIndex++;
        await new Promise((resolve) => setTimeout(resolve, 120));
        await captureScreenshot();
      };

      captureScreenshot().catch(reject);
    };

    video.onerror = () => {
      clearTimeout(timeout);
      reject(new Error("Error loading video file"));
    };
    try {
      video.src = URL.createObjectURL(file);
      video.load();
    } catch {
      clearTimeout(timeout);
      reject(new Error("Failed to create video URL. File may be corrupted."));
    }
  });
};
