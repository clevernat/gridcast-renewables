# Screenshots Directory

This directory contains screenshots for the GridCast Renewables README documentation.

## Required Screenshots

To complete the documentation, please add the following screenshots:

### 1. `asset-config.png`
**What to capture:**
- The "Configure Your Asset" form
- Show an example address entered (e.g., "1600 Amphitheatre Parkway, Mountain View, CA")
- Display the latitude/longitude fields populated
- Show both Solar and Wind configuration sections
- Capture the "Generate Forecast" button

**How to capture:**
1. Open the application at http://localhost:3000
2. Enter a complete address in the Address field
3. Click "Find" to geocode the address
4. Fill in sample values for DC Capacity (e.g., 7 kW)
5. Take a screenshot of the entire form
6. Save as `asset-config.png` in this directory

### 2. `forecast-chart.png`
**What to capture:**
- The 48-hour power forecast chart
- Show the interactive ECharts visualization
- Display both power output and meteorological data
- Include the chart legend and axis labels
- Show capacity factor if visible

**How to capture:**
1. After configuring an asset, click "Generate Forecast"
2. Wait for the forecast to load
3. Click on the "48-Hour Forecast" tab
4. Take a screenshot of the entire chart area
5. Save as `forecast-chart.png` in this directory

### 3. `national-map.png`
**What to capture:**
- The National Energy Map with heatmap overlay
- Show either Solar or Wind potential view
- Display the time slider at a specific hour
- Include the map legend showing energy potential scale
- Capture the toggle buttons for Solar/Wind

**How to capture:**
1. Click on the "National Map" tab
2. Wait for the map to load completely
3. Select either Solar or Wind view
4. Move the time slider to show an interesting hour (e.g., noon for solar)
5. Take a screenshot of the entire map interface
6. Save as `national-map.png` in this directory

### 4. `long-term-analysis.png`
**What to capture:**
- The Long-Term Viability Analysis view
- Show monthly average production chart
- Display annual production totals
- Include any summary statistics or metrics
- Show the historical data visualization

**How to capture:**
1. Click on the "Long-Term Analysis" tab
2. Wait for the historical data to load
3. Take a screenshot of the entire analysis section
4. Save as `long-term-analysis.png` in this directory

## Screenshot Guidelines

### Technical Requirements:
- **Format**: PNG (preferred) or JPG
- **Resolution**: At least 1920x1080 (Full HD)
- **File Size**: Keep under 500KB per image (use compression if needed)
- **Aspect Ratio**: 16:9 or native browser window size

### Quality Guidelines:
- Use a clean browser window (hide bookmarks bar, extensions)
- Ensure good contrast and readability
- Capture during daytime hours for better visibility
- Use realistic data (real addresses, reasonable capacity values)
- Make sure all text is legible
- Avoid capturing personal information

### Recommended Tools:
- **macOS**: Cmd + Shift + 4 (select area) or Cmd + Shift + 3 (full screen)
- **Windows**: Windows + Shift + S (Snipping Tool)
- **Linux**: Flameshot, GNOME Screenshot, or Spectacle
- **Browser Extensions**: Awesome Screenshot, Nimbus Screenshot

## Image Optimization

After capturing screenshots, optimize them:

```bash
# Using ImageOptim (macOS)
# Drag and drop images into ImageOptim app

# Using TinyPNG (Web)
# Upload to https://tinypng.com/

# Using command line (requires imagemagick)
convert asset-config.png -quality 85 -resize 1920x1080 asset-config.png
```

## Updating README

Once screenshots are added to this directory, they will automatically appear in the main README.md file in the "📸 Screenshots & Demo" section.

The README references these images using relative paths:
- `docs/screenshots/asset-config.png`
- `docs/screenshots/forecast-chart.png`
- `docs/screenshots/national-map.png`
- `docs/screenshots/long-term-analysis.png`

## Alternative: Use Placeholder Images

If you want to push to GitHub before adding real screenshots, you can create placeholder images:

```bash
# Create placeholder images (requires imagemagick)
convert -size 1920x1080 xc:lightgray -pointsize 72 -fill black \
  -gravity center -annotate +0+0 "Asset Configuration\nScreenshot Coming Soon" \
  asset-config.png

convert -size 1920x1080 xc:lightgray -pointsize 72 -fill black \
  -gravity center -annotate +0+0 "48-Hour Forecast\nScreenshot Coming Soon" \
  forecast-chart.png

convert -size 1920x1080 xc:lightgray -pointsize 72 -fill black \
  -gravity center -annotate +0+0 "National Energy Map\nScreenshot Coming Soon" \
  national-map.png

convert -size 1920x1080 xc:lightgray -pointsize 72 -fill black \
  -gravity center -annotate +0+0 "Long-Term Analysis\nScreenshot Coming Soon" \
  long-term-analysis.png
```

## Notes

- Screenshots should be updated whenever major UI changes are made
- Consider adding GIFs or videos for animated features (like the time slider)
- For EB2-NIW documentation, high-quality screenshots demonstrate the sophistication of your work

