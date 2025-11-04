# ⚡ GridCast Renewables

**Predictive Analytics Tool for U.S. Energy Independence**

## 🌍 Mission & National Importance

GridCast Renewables is a sophisticated analytical platform that forecasts solar and wind energy generation potential for any location in the United States. This project directly addresses critical national priorities:

- **🇺🇸 U.S. Energy Independence**: Reducing reliance on foreign energy sources
- **🌱 Clean Energy Transition**: Supporting the shift to renewable energy infrastructure
- **⚡ Grid Stability**: Enabling better planning and integration of renewable resources
- **💰 Investment Optimization**: Providing data-driven insights for renewable energy investments

## ✨ Recent Improvements (Latest Version)

### Enhanced National Energy Map

- ✅ **User Location Marker**: Blue pulsing marker shows your searched location on the map
- ✅ **Energy Potential at Your Location**: Real-time solar/wind data for your exact coordinates
- ✅ **National Average Comparison**: See how your location compares (% above/below average)
- ✅ **Visual Radius**: 50km circle around your location for context
- ✅ **Smart Popups**: Detailed information with coordinates, address, and energy metrics
- ✅ **Zoom to Location**: One-click button to center map on your location
- ✅ **⚡ INSTANT Updates**: Slider changes update map instantly (0ms) using cached data
- ✅ **⚡ Smooth Animation**: 800ms transitions between hours with no lag
- ✅ **⚡ Fast Initial Load**: All 24 hours loaded in 10-15 seconds (one-time cost)

### Improved Chart Readability

- ✅ **Optimized Label Spacing**: X-axis labels no longer overlap
- ✅ **Better Font Sizing**: Reduced font sizes for cleaner appearance (10-11px)
- ✅ **Multi-line Axis Labels**: Y-axis labels split across lines to prevent overlap
- ✅ **Increased Chart Height**: 550px for better visibility
- ✅ **Smart Label Intervals**: Shows every 3rd time label to reduce clutter
- ✅ **Improved Grid Spacing**: Better margins for all axes (60px left, 140px right, 80px bottom)

### UI/UX Enhancements

- ✅ **Modern Gradient Design**: Beautiful gradients throughout the interface
- ✅ **Responsive Layout**: Works perfectly on mobile, tablet, and desktop
- ✅ **Address Autocomplete**: Real-time suggestions using OpenStreetMap
- ✅ **Input Validation**: Clear error messages and helpful hints
- ✅ **Loading States**: Smooth animations during data fetching

## 🎯 Core Features

### 1. Site & Asset Configuration

- **Location Input**: Enter any U.S. address or GPS coordinates
- **Smart Geocoding**: Automatic address-to-coordinate conversion using OpenStreetMap Nominatim API
- **Address Autocomplete**: Real-time suggestions as you type (completely free, no API key needed)
- **Asset Types**:
  - **Solar**: DC capacity (kW), system losses (%), optional tilt/azimuth
  - **Wind**: Rated capacity (MW), hub height (m), cut-in/rated/cut-out speeds (m/s)
- **Default Values**: Pre-filled with typical residential/commercial values
- **Validation**: Real-time input validation with helpful error messages

### 2. High-Resolution Power Forecast (48 Hours)

- **Hourly Power Output**: Precise kWh/MWh predictions for next 48 hours
- **Meteorological Drivers**: Solar irradiance, cloud cover, wind speed, temperature
- **Interactive Charts**: Built with ECharts with optimized label spacing
- **Multi-Axis Visualization**:
  - Power output (kW/MW)
  - Solar irradiance (W/m²) or Wind speed (m/s)
  - Capacity factor and cloud cover (%)
- **Real-time Calculations**:
  - Total energy production forecast
  - Average capacity factor
  - Temperature corrections for solar
  - Air density corrections for wind
- **Configuration Impact**: All asset parameters (DC capacity, system losses, hub height, etc.) directly affect power calculations

### 3. National Energy Map

- **Spatial Visualization**: Heatmap across continental U.S. (~100 grid points)
- **Toggle Views**: Solar irradiance and Wind speed potential
- **Time Animation**: 24-hour slider with play/pause controls (⚡ instant updates!)
- **User Location Marker**: Blue pulsing marker at your searched location
- **Location Analytics**:
  - Real-time energy potential at your exact coordinates
  - Comparison with national average (percentage above/below)
  - 50km radius visualization around your location
  - Detailed popup with coordinates and address
- **Interactive Controls**: Zoom to location, speed controls, hour selection
- **Performance**:
  - ⚡ All 24 hours loaded in one API call (~10-15 seconds)
  - ⚡ Slider changes update instantly (0ms, from cache)
  - ⚡ Smooth 800ms animation transitions
- **Powered by**: Mapbox GL JS with custom heatmap rendering

### 4. Long-Term Viability Analysis

- **Historical Data**: 5+ years of weather data from NASA POWER and Open-Meteo
- **Monthly Averages**: Energy production estimates for each month
- **Annual Production**: Total yearly forecast (kWh/year or MWh/year)
- **Capacity Factor Analysis**: Monthly and annual capacity factor calculations
- **Seasonal Insights**: Identify best and worst performing months
- **Investment Metrics**: Data-driven insights for financial viability assessment

## ⚙️ How Configuration Affects Calculations

All asset configuration parameters directly impact the power output calculations:

### Solar Configuration Impact

**DC Capacity (kW)**:

- Directly scales power output: `Power ∝ DC_Capacity`
- Example: Doubling from 5kW to 10kW doubles the power output

**System Losses (%)**:

- Reduces efficiency: `Efficiency = (100 - Losses) / 100`
- Example: 14% losses → 86% efficiency, 30% losses → 70% efficiency
- Typical range: 10-20% (includes inverter, wiring, soiling losses)

### Wind Configuration Impact

**Rated Capacity (MW)**:

- Maximum power output at rated wind speed
- Scales the entire power curve proportionally

**Hub Height (m)**:

- Higher hub = stronger winds via power law extrapolation
- Example: 80m → 120m can increase power by 15-25%
- Formula: `v₂ = v₁ × (h₂/h₁)^0.14`

**Cut-in Speed (m/s)**:

- Minimum wind speed to start generating power
- Lower cut-in = more operating hours

**Rated Speed (m/s)**:

- Wind speed at which turbine reaches maximum power
- Affects the power curve slope

**Cut-out Speed (m/s)**:

- Maximum safe operating wind speed
- Turbine shuts down above this for safety

### Testing Configuration Changes

Try these experiments to see real-time impacts:

1. **Solar**: Change DC Capacity from 7kW to 14kW → Power output doubles
2. **Solar**: Change System Losses from 14% to 30% → Power output decreases ~18%
3. **Wind**: Change Hub Height from 80m to 120m → Power output increases ~20%
4. **Wind**: Change Rated Capacity from 1.5MW to 3.0MW → Max power doubles

## 🔬 Scientific Models & Formulas

### Solar Power Model (NREL PVWatts)

Basic Power Calculation:
\`\`\`
P = (G / G_STC) × P_DC × η_system
\`\`\`

Where:

- P = AC power output (kW)
- G = Solar irradiance (W/m²)
- G_STC = 1000 W/m² (Standard Test Condition)
- P_DC = DC capacity (kW)
- η_system = System efficiency (typically 86%)

Temperature Correction:
\`\`\`
P_adjusted = P × [1 + γ × (T_cell - T_STC)]
T_cell ≈ T_ambient + (NOCT - 20) × (G / 800)
\`\`\`

**References:**

- NREL PVWatts Calculator: https://pvwatts.nrel.gov/
- Duffie & Beckman (2013). Solar Engineering of Thermal Processes

### Wind Power Model

Wind Speed Extrapolation (Power Law):
\`\`\`
v₂ = v₁ × (h₂ / h₁)^α
\`\`\`

Where:

- v₁ = wind speed at reference height (m/s)
- v₂ = wind speed at hub height (m/s)
- α = 0.14 (open terrain) or 0.2-0.25 (urban)

Power Curve (Four Regions):

1. Below cut-in: P = 0
2. Cut-in to rated: P = P_rated × [(v³ - v_cut-in³) / (v_rated³ - v_cut-in³)]
3. Rated to cut-out: P = P_rated
4. Above cut-out: P = 0

**References:**

- Manwell et al. (2009). Wind Energy Explained
- IEC 61400-12-1: Wind turbine power performance

## 🏗️ Technical Architecture

### System Architecture Diagram

```mermaid
graph TB
    subgraph "Frontend Layer"
        UI[User Interface<br/>Next.js 16 + TypeScript]
        ACF[AssetConfigForm<br/>Location & Asset Input]
        PFC[PowerForecastChart<br/>ECharts Visualization]
        NEM[NationalEnergyMap<br/>Mapbox GL JS]
        LTA[LongTermAnalysis<br/>Historical Data View]
    end

    subgraph "API Layer - Next.js Routes"
        GEO[/api/geocode<br/>Address → Coordinates]
        FC[/api/forecast<br/>48-Hour Power Forecast]
        LT[/api/long-term<br/>Historical Analysis]
        NM[/api/national-map<br/>Grid Data Generation]
    end

    subgraph "Business Logic"
        WC[Weather Client<br/>API Integration]
        SM[Solar Model<br/>NREL PVWatts]
        WM[Wind Model<br/>Power Law + Curve]
    end

    subgraph "External APIs"
        NOM[Nominatim API<br/>OpenStreetMap Geocoding]
        OM[Open-Meteo API<br/>Weather Forecast & Historical]
        NASA[NASA POWER API<br/>Solar & Meteorological Data]
        MB[Mapbox API<br/>Map Tiles & Rendering]
    end

    UI --> ACF
    UI --> PFC
    UI --> NEM
    UI --> LTA

    ACF --> GEO
    ACF --> FC
    ACF --> LT
    NEM --> NM

    GEO --> WC
    FC --> WC
    LT --> WC
    NM --> WC

    WC --> SM
    WC --> WM

    GEO --> NOM
    WC --> OM
    WC --> NASA
    NEM --> MB
```

**[📄 View Detailed Architecture Documentation](docs/architecture.md)**

### Technology Stack

**Frontend:**

- Next.js 16.0 with App Router
- TypeScript 5.0
- Tailwind CSS 4.0
- ECharts (charting)
- Mapbox GL JS (mapping)

**Backend:**

- Next.js API Routes (serverless)
- Axios for HTTP requests

**Data Sources:**

- Open-Meteo API (weather forecasts & historical data)
- NASA POWER API (solar & meteorological data)
- Nominatim API (geocoding)

**Deployment:**

- Vercel (serverless platform)

## 🚀 Getting Started

### Prerequisites

- Node.js 18.0+
- npm or yarn
- Mapbox account (free tier)

### Installation

1. Clone the repository
   \`\`\`bash
   git clone https://github.com/clevernat/gridcast-renewables.git
   cd gridcast-renewables
   \`\`\`

2. Install dependencies
   \`\`\`bash
   npm install
   \`\`\`

3. Configure environment variables
   \`\`\`bash
   cp .env.example .env.local
   \`\`\`

Edit \`.env.local\` and add your Mapbox token:
\`\`\`
NEXT_PUBLIC_MAPBOX_TOKEN=your_mapbox_token_here
\`\`\`

**Get API Key:**

- **Mapbox Token**: Get a free token at https://www.mapbox.com/

**Note:** Address autocomplete uses OpenStreetMap (completely free, no API key needed!)

4. Run development server
   \`\`\`bash
   npm run dev
   \`\`\`

5. Open http://localhost:3000

### Building for Production

\`\`\`bash
npm run build
npm start
\`\`\`

## 📊 Usage Examples

### Example 1: Residential Solar (California)

- Location: San Francisco, CA (37.7749°N, 122.4194°W)
- DC Capacity: 7 kW
- Expected: 18-22% capacity factor, 35-40 kWh/day (summer)

### Example 2: Commercial Wind (Texas)

- Location: Sweetwater, TX (32.4707°N, 100.4065°W)
- Rated Capacity: 2.5 MW, Hub Height: 100m
- Expected: 35-40% capacity factor, 7,500-8,500 MWh/year

## 📸 Screenshots & Demo

### 1. Asset Configuration Interface

![Asset Configuration](docs/screenshots/asset-config.png)

**Features Shown:**

- Address geocoding with automatic coordinate conversion
- Solar/Wind asset type selection
- System parameter inputs (DC capacity, hub height, etc.)
- Clean, intuitive form design

### 2. 48-Hour Power Forecast

![Power Forecast Chart](docs/screenshots/forecast-chart.png)

**Features Shown:**

- Hourly power output predictions (kWh/MWh)
- Meteorological drivers (solar irradiance, wind speed, cloud cover)
- Interactive ECharts visualization
- Capacity factor calculation
- Time-series analysis

### 3. National Energy Map

![National Energy Map](docs/screenshots/national-map.png)

**Features Shown:**

- Heatmap visualization across continental U.S.
- Toggle between Solar and Wind potential views
- 24-hour time slider animation
- Real-time energy potential calculation
- Mapbox GL JS rendering

### 4. Long-Term Viability Analysis

![Long-Term Analysis](docs/screenshots/long-term-analysis.png)

**Features Shown:**

- Monthly average energy production
- Annual production totals
- Historical weather data analysis (5+ years)
- Investment viability metrics
- Seasonal variation insights

### 🎥 Live Demo

**Coming Soon:** Live deployment URL will be added after Vercel deployment

**Try it yourself:**

1. Clone the repository
2. Follow installation instructions below
3. Run locally at `http://localhost:3000`

## 🎓 EB2-NIW Petition Documentation

### 1. Substantial Merit

- Implements peer-reviewed scientific models
- Uses authoritative data sources (NASA, NREL)
- Provides actionable insights for energy sector

### 2. National Importance

- Supports U.S. energy independence goals
- Aligns with federal clean energy objectives
- Aids grid modernization and stability
- Enables better renewable investment decisions

### 3. Well-Positioned to Advance

- Demonstrates full-stack development expertise
- Shows domain knowledge in renewable energy
- Provides open-source contribution for broader impact

## 📚 References

1. NREL PVWatts Calculator - https://pvwatts.nrel.gov/
2. Duffie & Beckman (2013). Solar Engineering of Thermal Processes
3. Manwell et al. (2009). Wind Energy Explained
4. IEC 61400-12-1:2017. Wind turbine power performance
5. NASA POWER - https://power.larc.nasa.gov/
6. Open-Meteo API - https://open-meteo.com/

## 📄 License

MIT License

## 🤝 Contributing

Contributions welcome! Please submit a Pull Request.

---

**Built with ❤️ for a sustainable energy future**
