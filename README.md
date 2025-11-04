# ⚡ GridCast Renewables

**Predictive Analytics Tool for U.S. Energy Independence**

## 🌍 Mission & National Importance

GridCast Renewables is a sophisticated analytical platform that forecasts solar and wind energy generation potential for any location in the United States. This project directly addresses critical national priorities:

- **🇺🇸 U.S. Energy Independence**: Reducing reliance on foreign energy sources
- **🌱 Clean Energy Transition**: Supporting the shift to renewable energy infrastructure
- **⚡ Grid Stability**: Enabling better planning and integration of renewable resources
- **💰 Investment Optimization**: Providing data-driven insights for renewable energy investments

## 🎯 Core Features

### 1. Site & Asset Configuration
- Location Input: Enter any U.S. address or GPS coordinates
- Asset Types: Solar (DC capacity) and Wind (rated capacity, hub height)
- Geocoding: Automatic address-to-coordinate conversion

### 2. High-Resolution Power Forecast (48 Hours)
- Hourly Power Output: Precise kWh/MWh predictions
- Meteorological Drivers: Solar irradiance, cloud cover, wind speed
- Interactive Charts: Built with ECharts
- Capacity Factor: Real-time asset utilization

### 3. National Energy Map
- Spatial Visualization: Heatmap across continental U.S.
- Toggle Views: Solar and Wind potential
- Time Animation: 24-hour slider
- Powered by Mapbox GL JS

### 4. Long-Term Viability Analysis
- Historical Data: 5+ years of weather data
- Monthly Averages: Energy production estimates
- Annual Production: Total yearly forecast
- Investment Insights: Financial viability data

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
- Open-Meteo Geocoding API

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
git clone https://github.com/yourusername/gridcast-renewables.git
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

Get a free token at https://www.mapbox.com/

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
