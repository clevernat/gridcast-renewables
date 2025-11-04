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
 * Capture map animation frames
 */
async function captureMapAnimationFrames(
  mapElementId: string,
  totalHours: number = 24
): Promise<Blob[]> {
  const frames: Blob[] = [];
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

    // Wait for map to update
    await new Promise((resolve) => setTimeout(resolve, 500));

    // Capture frame
    const blob = await captureElementAsBlob(mapElementId, {
      scale: 1.5,
      backgroundColor: "#1a1a1a",
    });

    if (blob) {
      frames.push(blob);
    }
  }

  return frames;
}

/**
 * Export all visualizations as ZIP file
 */
export async function exportAllImagesAsZip(
  forecast?: PowerForecast | null,
  longTerm?: LongTermAnalysis | null,
  activeTab?: string
): Promise<void> {
  const zip = new JSZip();
  const timestamp = new Date().toISOString().replace(/[:.]/g, "-");
  let capturedCount = 0;

  try {
    // Create folders
    const chartsFolder = zip.folder("charts");
    const mapsFolder = zip.folder("maps");
    const analyticsFolder = zip.folder("analytics");
    const researchFolder = zip.folder("research");

    // 1. Capture Power Forecast Chart
    if (forecast) {
      const forecastBlob = await captureElementAsBlob("chart-container");
      if (forecastBlob && chartsFolder) {
        chartsFolder.file("power-forecast-chart.png", forecastBlob);
        capturedCount++;
      }
    }

    // 2. Capture Long-Term Analysis Chart
    if (longTerm) {
      const longTermBlob = await captureElementAsBlob(
        "long-term-chart-container"
      );
      if (longTermBlob && chartsFolder) {
        chartsFolder.file("long-term-analysis-chart.png", longTermBlob);
        capturedCount++;
      }
    }

    // 3. Capture National Energy Map (current view)
    const mapBlob = await captureElementAsBlob("national-energy-map", {
      backgroundColor: "#1a1a1a",
    });
    if (mapBlob && mapsFolder) {
      mapsFolder.file("national-energy-map-current.png", mapBlob);
      capturedCount++;
    }

    // 4. Capture Map Animation Frames (if on map tab)
    if (activeTab === "map") {
      const animationFrames = await captureMapAnimationFrames(
        "national-energy-map",
        24
      );
      if (animationFrames.length > 0 && mapsFolder) {
        const animationFolder = mapsFolder.folder("animation-frames");
        animationFrames.forEach((frame, index) => {
          if (animationFolder) {
            animationFolder.file(
              `frame-${String(index).padStart(2, "0")}-hour-${index}.png`,
              frame
            );
          }
        });
        capturedCount += animationFrames.length;
      }
    }

    // 5. Capture Analytics Dashboard
    const analyticsBlob = await captureElementAsBlob("analytics-dashboard");
    if (analyticsBlob && analyticsFolder) {
      analyticsFolder.file("analytics-dashboard.png", analyticsBlob);
      capturedCount++;
    }

    // 6. Capture Research Dashboard
    const researchBlob = await captureElementAsBlob("research-dashboard");
    if (researchBlob && researchFolder) {
      researchFolder.file("atmospheric-research-dashboard.png", researchBlob);
      capturedCount++;
    }

    // 7. Add README file
    const readmeContent = `GridCast Renewables - Exported Visualizations
Generated: ${new Date().toLocaleString()}

This ZIP file contains all visualizations from your GridCast Renewables session.

Contents:
---------
📊 charts/
   - power-forecast-chart.png: 48-hour power forecast visualization
   - long-term-analysis-chart.png: Monthly production analysis

🗺️ maps/
   - national-energy-map-current.png: Current map view
   - animation-frames/: 24-hour animation frames (if captured)
     * frame-00-hour-0.png through frame-23-hour-23.png

📈 analytics/
   - analytics-dashboard.png: ROI, carbon offset, and peak analysis

🔬 research/
   - atmospheric-research-dashboard.png: Statistical analysis and correlations

Total Images Captured: ${capturedCount}

Usage:
------
- View images in any image viewer
- Use animation frames to create GIF/video
- Include in presentations or reports
- Share with stakeholders

For more information, visit: https://gridcast-renewables.vercel.app
`;

    zip.file("README.txt", readmeContent);

    // Generate and download ZIP
    const content = await zip.generateAsync({
      type: "blob",
      compression: "DEFLATE",
      compressionOptions: { level: 6 },
    });

    // Download
    const url = URL.createObjectURL(content);
    const link = document.createElement("a");
    link.href = url;
    link.download = `gridcast-visualizations-${timestamp}.zip`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);

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
 * Export only map animation as ZIP
 */
export async function exportMapAnimationAsZip(): Promise<void> {
  const zip = new JSZip();
  const timestamp = new Date().toISOString().replace(/[:.]/g, "-");

  try {
    const frames = await captureMapAnimationFrames("national-energy-map", 24);

    if (frames.length === 0) {
      throw new Error("No animation frames captured");
    }

    frames.forEach((frame, index) => {
      zip.file(
        `frame-${String(index).padStart(2, "0")}-hour-${index}.png`,
        frame
      );
    });

    // Add README
    const readmeContent = `GridCast Renewables - Map Animation Frames
Generated: ${new Date().toLocaleString()}

This ZIP contains 24 hourly frames of the National Energy Map animation.

Files:
------
- frame-00-hour-0.png through frame-23-hour-23.png

Usage:
------
1. Create animated GIF using tools like ImageMagick:
   convert -delay 20 -loop 0 frame-*.png animation.gif

2. Create video using ffmpeg:
   ffmpeg -framerate 2 -i frame-%02d-hour-%d.png -c:v libx264 animation.mp4

3. Use in presentations as individual frames

Total Frames: ${frames.length}
`;

    zip.file("README.txt", readmeContent);

    const content = await zip.generateAsync({
      type: "blob",
      compression: "DEFLATE",
      compressionOptions: { level: 6 },
    });

    const url = URL.createObjectURL(content);
    const link = document.createElement("a");
    link.href = url;
    link.download = `gridcast-map-animation-${timestamp}.zip`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  } catch (error) {
    console.error("Failed to export map animation:", error);
    throw new Error(
      `Failed to export animation: ${
        error instanceof Error ? error.message : "Unknown error"
      }`
    );
  }
}

