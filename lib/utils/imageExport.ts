import JSZip from "jszip";
import { PowerForecast, LongTermAnalysis } from "@/types";

/**
 * Capture element as image blob
 */
async function captureElementAsBlob(
  elementId: string,
  options?: {
    scale?: number;
    backgroundColor?: string;
  }
): Promise<Blob | null> {
  try {
    const html2canvas = (await import("html2canvas")).default;
    const element = document.getElementById(elementId);

    if (!element) {
      console.warn(`Element with ID "${elementId}" not found`);
      return null;
    }

    const canvas = await html2canvas(element, {
      backgroundColor: options?.backgroundColor || "#ffffff",
      scale: options?.scale || 2,
      logging: false,
      useCORS: true,
      allowTaint: true,
      foreignObjectRendering: false,
      imageTimeout: 15000,
    });

    return new Promise((resolve) => {
      canvas.toBlob((blob) => {
        resolve(blob);
      }, "image/png");
    });
  } catch (error) {
    console.error(`Failed to capture ${elementId}:`, error);
    return null;
  }
}

/**
 * Capture element as data URL (for GIF creation)
 */
async function captureElementAsDataURL(
  elementId: string,
  options?: {
    scale?: number;
    backgroundColor?: string;
  }
): Promise<string | null> {
  try {
    const html2canvas = (await import("html2canvas")).default;
    const element = document.getElementById(elementId);

    if (!element) {
      console.warn(`Element with ID "${elementId}" not found`);
      return null;
    }

    const canvas = await html2canvas(element, {
      backgroundColor: options?.backgroundColor || "#ffffff",
      scale: options?.scale || 2,
      logging: false,
      useCORS: true,
      allowTaint: true,
      foreignObjectRendering: false,
      imageTimeout: 15000,
    });

    return canvas.toDataURL("image/png");
  } catch (error) {
    console.error(`Failed to capture ${elementId}:`, error);
    return null;
  }
}

/**
 * Capture map animation frames as data URLs (for GIF creation)
 */
async function captureMapAnimationFrames(
  mapElementId: string,
  totalHours: number = 24
): Promise<string[]> {
  const frames: string[] = [];
  const timeSlider = document.querySelector(
    'input[type="range"]'
  ) as HTMLInputElement;

  if (!timeSlider) {
    console.warn("Time slider not found for animation capture");
    return frames;
  }

  for (let hour = 0; hour < totalHours; hour++) {
    // Set slider to specific hour
    timeSlider.value = hour.toString();
    timeSlider.dispatchEvent(new Event("input", { bubbles: true }));

    // Wait for map to update (longer wait for Mapbox to render)
    await new Promise((resolve) => setTimeout(resolve, 800));

    // Capture frame as data URL
    const dataURL = await captureElementAsDataURL(mapElementId, {
      scale: 1.5,
      backgroundColor: "#1a1a1a",
    });

    if (dataURL) {
      frames.push(dataURL);
    }
  }

  return frames;
}

/**
 * Create GIF from image data URLs
 */
async function createGIFFromFrames(
  frames: string[],
  options?: {
    interval?: number;
    gifWidth?: number;
    gifHeight?: number;
  }
): Promise<Blob | null> {
  try {
    const gifshot = (await import("gifshot")).default;

    return new Promise((resolve, reject) => {
      gifshot.createGIF(
        {
          images: frames,
          gifWidth: options?.gifWidth || 800,
          gifHeight: options?.gifHeight || 600,
          interval: options?.interval || 0.5, // seconds per frame
          numFrames: frames.length,
          frameDuration: 1,
          sampleInterval: 10,
          numWorkers: 2,
        },
        (obj: any) => {
          if (!obj.error) {
            // Convert base64 to blob
            const base64Data = obj.image.split(",")[1];
            const byteCharacters = atob(base64Data);
            const byteNumbers = new Array(byteCharacters.length);
            for (let i = 0; i < byteCharacters.length; i++) {
              byteNumbers[i] = byteCharacters.charCodeAt(i);
            }
            const byteArray = new Uint8Array(byteNumbers);
            const blob = new Blob([byteArray], { type: "image/gif" });
            resolve(blob);
          } else {
            console.error("GIF creation error:", obj.error);
            reject(new Error(obj.error));
          }
        }
      );
    });
  } catch (error) {
    console.error("Failed to create GIF:", error);
    return null;
  }
}

/**
 * Toggle map type (solar/wind) and wait for update
 */
async function toggleMapType(targetType: "solar" | "wind"): Promise<void> {
  const solarButton = document.querySelector(
    'button[aria-label="Solar view"]'
  ) as HTMLButtonElement;
  const windButton = document.querySelector(
    'button[aria-label="Wind view"]'
  ) as HTMLButtonElement;

  if (targetType === "solar" && solarButton) {
    solarButton.click();
  } else if (targetType === "wind" && windButton) {
    windButton.click();
  }

  // Wait for map to reload with new data
  await new Promise((resolve) => setTimeout(resolve, 2000));
}

/**
 * Export all visualizations as ZIP file
 */
export async function exportAllImagesAsZip(
  forecast?: PowerForecast | null,
  longTerm?: LongTermAnalysis | null,
  activeTab?: string,
  onProgress?: (message: string) => void
): Promise<void> {
  const zip = new JSZip();
  const timestamp = new Date().toISOString().replace(/[:.]/g, "-");
  let capturedCount = 0;

  try {
    // Create folders
    const chartsFolder = zip.folder("charts");
    const mapsFolder = zip.folder("maps");
    const animationsFolder = zip.folder("animations");
    const analyticsFolder = zip.folder("analytics");
    const researchFolder = zip.folder("research");

    // 1. Capture Power Forecast Chart
    onProgress?.("Capturing power forecast chart...");
    if (forecast) {
      const forecastBlob = await captureElementAsBlob("chart-container");
      if (forecastBlob && chartsFolder) {
        const assetType = forecast.asset.type;
        chartsFolder.file(
          `${assetType}-power-forecast-chart.png`,
          forecastBlob
        );
        capturedCount++;
      }
    }

    // 2. Capture Long-Term Analysis Chart
    onProgress?.("Capturing long-term analysis chart...");
    if (longTerm) {
      const longTermBlob = await captureElementAsBlob(
        "long-term-chart-container"
      );
      if (longTermBlob && chartsFolder) {
        const assetType = longTerm.asset.type;
        chartsFolder.file(
          `${assetType}-long-term-analysis-chart.png`,
          longTermBlob
        );
        capturedCount++;
      }
    }

    // 3. Capture Analytics Dashboard
    onProgress?.("Capturing analytics dashboard...");
    const analyticsBlob = await captureElementAsBlob("analytics-dashboard");
    if (analyticsBlob && analyticsFolder) {
      analyticsFolder.file("analytics-dashboard.png", analyticsBlob);
      capturedCount++;
    }

    // 4. Capture Research Dashboard
    onProgress?.("Capturing research dashboard...");
    const researchBlob = await captureElementAsBlob("research-dashboard");
    if (researchBlob && researchFolder) {
      researchFolder.file("atmospheric-research-dashboard.png", researchBlob);
      capturedCount++;
    }

    // 5. Capture BOTH Solar and Wind Maps with Animations
    onProgress?.("Capturing solar map animation (24 frames)...");
    await toggleMapType("solar");
    const solarMapBlob = await captureElementAsBlob("national-energy-map", {
      backgroundColor: "#1a1a1a",
    });
    if (solarMapBlob && mapsFolder) {
      mapsFolder.file("solar-energy-map.png", solarMapBlob);
      capturedCount++;
    }

    // Capture solar animation frames
    const solarFrames = await captureMapAnimationFrames(
      "national-energy-map",
      24
    );
    if (solarFrames.length > 0) {
      // Save individual frames
      const solarFramesFolder = mapsFolder?.folder("solar-animation-frames");
      solarFrames.forEach((frame, index) => {
        if (solarFramesFolder) {
          // Convert data URL to blob
          const base64Data = frame.split(",")[1];
          const byteCharacters = atob(base64Data);
          const byteNumbers = new Array(byteCharacters.length);
          for (let i = 0; i < byteCharacters.length; i++) {
            byteNumbers[i] = byteCharacters.charCodeAt(i);
          }
          const byteArray = new Uint8Array(byteNumbers);
          const blob = new Blob([byteArray], { type: "image/png" });

          solarFramesFolder.file(
            `solar-frame-${String(index).padStart(2, "0")}-hour-${index}.png`,
            blob
          );
        }
      });
      capturedCount += solarFrames.length;

      // Create solar GIF
      onProgress?.("Creating solar animation GIF...");
      const solarGif = await createGIFFromFrames(solarFrames, {
        interval: 0.5,
        gifWidth: 1200,
        gifHeight: 800,
      });
      if (solarGif && animationsFolder) {
        animationsFolder.file("solar-energy-map-24hr-animation.gif", solarGif);
        capturedCount++;
      }
    }

    // 6. Capture Wind Map and Animation
    onProgress?.("Capturing wind map animation (24 frames)...");
    await toggleMapType("wind");
    const windMapBlob = await captureElementAsBlob("national-energy-map", {
      backgroundColor: "#1a1a1a",
    });
    if (windMapBlob && mapsFolder) {
      mapsFolder.file("wind-energy-map.png", windMapBlob);
      capturedCount++;
    }

    // Capture wind animation frames
    const windFrames = await captureMapAnimationFrames(
      "national-energy-map",
      24
    );
    if (windFrames.length > 0) {
      // Save individual frames
      const windFramesFolder = mapsFolder?.folder("wind-animation-frames");
      windFrames.forEach((frame, index) => {
        if (windFramesFolder) {
          // Convert data URL to blob
          const base64Data = frame.split(",")[1];
          const byteCharacters = atob(base64Data);
          const byteNumbers = new Array(byteCharacters.length);
          for (let i = 0; i < byteCharacters.length; i++) {
            byteNumbers[i] = byteCharacters.charCodeAt(i);
          }
          const byteArray = new Uint8Array(byteNumbers);
          const blob = new Blob([byteArray], { type: "image/png" });

          windFramesFolder.file(
            `wind-frame-${String(index).padStart(2, "0")}-hour-${index}.png`,
            blob
          );
        }
      });
      capturedCount += windFrames.length;

      // Create wind GIF
      onProgress?.("Creating wind animation GIF...");
      const windGif = await createGIFFromFrames(windFrames, {
        interval: 0.5,
        gifWidth: 1200,
        gifHeight: 800,
      });
      if (windGif && animationsFolder) {
        animationsFolder.file("wind-energy-map-24hr-animation.gif", windGif);
        capturedCount++;
      }
    }

    // 7. Add README file
    onProgress?.("Generating ZIP file...");
    const readmeContent = `GridCast Renewables - Complete Visualization Export
Generated: ${new Date().toLocaleString()}

This ZIP file contains ALL visualizations from your GridCast Renewables session,
including solar and wind energy maps with full 24-hour animations.

📂 Contents:
============

📊 charts/
   - solar-power-forecast-chart.png: 48-hour solar power forecast
   - wind-power-forecast-chart.png: 48-hour wind power forecast
   - solar-long-term-analysis-chart.png: Monthly solar production analysis
   - wind-long-term-analysis-chart.png: Monthly wind production analysis

🗺️ maps/
   - solar-energy-map.png: National solar energy potential map
   - wind-energy-map.png: National wind energy potential map
   - solar-animation-frames/: 24 hourly frames of solar energy map
     * solar-frame-00-hour-0.png through solar-frame-23-hour-23.png
   - wind-animation-frames/: 24 hourly frames of wind energy map
     * wind-frame-00-hour-0.png through wind-frame-23-hour-23.png

🎬 animations/
   - solar-energy-map-24hr-animation.gif: Animated solar energy map (24 hours)
   - wind-energy-map-24hr-animation.gif: Animated wind energy map (24 hours)

📈 analytics/
   - analytics-dashboard.png: ROI, carbon offset, and peak production analysis

🔬 research/
   - atmospheric-research-dashboard.png: Statistical analysis and correlations

Total Items Captured: ${capturedCount}

🎯 Usage:
=========
✓ View GIF animations directly in any image viewer or browser
✓ Use individual frames to create custom videos with ffmpeg
✓ Include maps and charts in presentations or reports
✓ Share complete analysis with stakeholders
✓ Maps show full Mapbox visualization with state boundaries

🎬 Creating Custom Videos from Frames:
======================================
Using ffmpeg (install from https://ffmpeg.org):

  # Create MP4 video from solar frames:
  ffmpeg -framerate 2 -pattern_type glob -i 'solar-frame-*.png' \\
         -c:v libx264 -pix_fmt yuv420p solar-animation.mp4

  # Create MP4 video from wind frames:
  ffmpeg -framerate 2 -pattern_type glob -i 'wind-frame-*.png' \\
         -c:v libx264 -pix_fmt yuv420p wind-animation.mp4

📧 Support:
===========
For more information, visit: https://gridcast-renewables.vercel.app
`;

    zip.file("README.txt", readmeContent);

    // Generate and download ZIP
    onProgress?.("Compressing files...");
    const content = await zip.generateAsync({
      type: "blob",
      compression: "DEFLATE",
      compressionOptions: { level: 6 },
    });

    // Download
    onProgress?.("Downloading ZIP file...");
    const url = URL.createObjectURL(content);
    const link = document.createElement("a");
    link.href = url;
    link.download = `gridcast-complete-export-${timestamp}.zip`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);

    onProgress?.("Export complete!");
    return;
  } catch (error) {
    console.error("Failed to export images as ZIP:", error);
    throw new Error(
      `Failed to export images: ${
        error instanceof Error ? error.message : "Unknown error"
      }`
    );
  }
}

/**
 * Export only map animation as ZIP (current map type)
 */
export async function exportMapAnimationAsZip(
  onProgress?: (message: string) => void
): Promise<void> {
  const zip = new JSZip();
  const timestamp = new Date().toISOString().replace(/[:.]/g, "-");

  try {
    // Determine current map type
    const solarButton = document.querySelector(
      'button[aria-label="Solar view"]'
    ) as HTMLButtonElement;
    const isSolar = solarButton?.classList.contains("bg-yellow-500");
    const mapType = isSolar ? "solar" : "wind";

    onProgress?.(`Capturing ${mapType} map animation (24 frames)...`);
    const frames = await captureMapAnimationFrames("national-energy-map", 24);

    if (frames.length === 0) {
      throw new Error("No animation frames captured");
    }

    // Save individual frames
    frames.forEach((frame, index) => {
      // Convert data URL to blob
      const base64Data = frame.split(",")[1];
      const byteCharacters = atob(base64Data);
      const byteNumbers = new Array(byteCharacters.length);
      for (let i = 0; i < byteCharacters.length; i++) {
        byteNumbers[i] = byteCharacters.charCodeAt(i);
      }
      const byteArray = new Uint8Array(byteNumbers);
      const blob = new Blob([byteArray], { type: "image/png" });

      zip.file(
        `${mapType}-frame-${String(index).padStart(2, "0")}-hour-${index}.png`,
        blob
      );
    });

    // Create GIF
    onProgress?.(`Creating ${mapType} animation GIF...`);
    const gif = await createGIFFromFrames(frames, {
      interval: 0.5,
      gifWidth: 1200,
      gifHeight: 800,
    });

    if (gif) {
      zip.file(`${mapType}-energy-map-24hr-animation.gif`, gif);
    }

    // Add README
    const readmeContent = `GridCast Renewables - ${
      mapType.charAt(0).toUpperCase() + mapType.slice(1)
    } Map Animation
Generated: ${new Date().toLocaleString()}

This ZIP contains 24 hourly frames of the ${mapType} energy map animation
plus an animated GIF showing the full 24-hour cycle.

Files:
------
- ${mapType}-energy-map-24hr-animation.gif: Animated GIF (ready to use!)
- ${mapType}-frame-00-hour-0.png through ${mapType}-frame-23-hour-23.png

Usage:
------
1. View the GIF directly in any image viewer or browser
2. Share the GIF on social media or presentations
3. Create custom video using ffmpeg:
   ffmpeg -framerate 2 -pattern_type glob -i '${mapType}-frame-*.png' \\
          -c:v libx264 -pix_fmt yuv420p ${mapType}-animation.mp4

Total Frames: ${frames.length}
Includes: Animated GIF + Individual PNG frames
`;

    zip.file("README.txt", readmeContent);

    onProgress?.("Compressing files...");
    const content = await zip.generateAsync({
      type: "blob",
      compression: "DEFLATE",
      compressionOptions: { level: 6 },
    });

    onProgress?.("Downloading ZIP file...");
    const url = URL.createObjectURL(content);
    const link = document.createElement("a");
    link.href = url;
    link.download = `gridcast-${mapType}-animation-${timestamp}.zip`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);

    onProgress?.("Export complete!");
  } catch (error) {
    console.error("Failed to export map animation:", error);
    throw new Error(
      `Failed to export animation: ${
        error instanceof Error ? error.message : "Unknown error"
      }`
    );
  }
}
