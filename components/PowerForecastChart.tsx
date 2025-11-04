"use client";

import { useEffect, useRef } from "react";
import * as echarts from "echarts";
import { PowerForecast } from "@/types";
import {
  formatDateTime,
  formatPower,
  formatEnergy,
} from "@/lib/utils/formatters";

interface PowerForecastChartProps {
  forecast: PowerForecast;
}

export default function PowerForecastChart({
  forecast,
}: PowerForecastChartProps) {
  const chartRef = useRef<HTMLDivElement>(null);
  const chartInstance = useRef<echarts.ECharts | null>(null);

  useEffect(() => {
    if (!chartRef.current) return;

    // Initialize chart
    if (!chartInstance.current) {
      chartInstance.current = echarts.init(chartRef.current);
    }

    const chart = chartInstance.current;

    // Prepare data
    const times = forecast.outputs.map((o) => o.time);
    const powers = forecast.outputs.map((o) => o.power);
    const capacities = forecast.outputs.map((o) => o.capacity || 0);

    // Meteorological data
    const isSolar = forecast.asset.type === "solar";
    const meteoData = isSolar
      ? forecast.meteorologicalData.map((d) => d.solarIrradiance || 0)
      : forecast.meteorologicalData.map((d) => d.windSpeed || 0);

    const cloudCover = isSolar
      ? forecast.meteorologicalData.map((d) => d.cloudCover || 0)
      : [];

    // Calculate total energy
    const totalEnergy = powers.reduce((sum, p) => sum + p, 0);
    const avgCapacity =
      capacities.reduce((sum, c) => sum + c, 0) / capacities.length;

    const unit = isSolar ? "kW" : "MW";
    const energyUnit = isSolar ? "kWh" : "MWh";

    // Chart configuration
    const option: echarts.EChartsOption = {
      title: {
        text: `${isSolar ? "Solar" : "Wind"} Power Forecast - Next 48 Hours`,
        subtext: `Total Energy: ${totalEnergy.toFixed(
          2
        )} ${energyUnit} | Avg Capacity Factor: ${avgCapacity.toFixed(1)}%`,
        left: "center",
      },
      tooltip: {
        trigger: "axis",
        axisPointer: {
          type: "cross",
        },
        formatter: function (params: any) {
          let result = `<strong>${formatDateTime(
            params[0].axisValue
          )}</strong><br/>`;
          params.forEach((param: any) => {
            result += `${param.marker} ${
              param.seriesName
            }: ${param.value.toFixed(2)} ${
              param.seriesName.includes("Power")
                ? unit
                : param.seriesName.includes("Irradiance")
                ? "W/m²"
                : param.seriesName.includes("Wind")
                ? "m/s"
                : "%"
            }<br/>`;
          });
          return result;
        },
      },
      legend: {
        data: isSolar
          ? [
              "Power Output",
              "Capacity Factor",
              "Solar Irradiance",
              "Cloud Cover",
            ]
          : ["Power Output", "Capacity Factor", "Wind Speed"],
        top: 40,
      },
      grid: {
        left: "3%",
        right: "4%",
        bottom: "3%",
        containLabel: true,
      },
      xAxis: {
        type: "category",
        boundaryGap: false,
        data: times,
        axisLabel: {
          formatter: (value: string) => {
            const date = new Date(value);
            return `${
              date.getMonth() + 1
            }/${date.getDate()} ${date.getHours()}:00`;
          },
          rotate: 45,
        },
      },
      yAxis: [
        {
          type: "value",
          name: `Power (${unit})`,
          position: "left",
          axisLabel: {
            formatter: "{value}",
          },
        },
        {
          type: "value",
          name: isSolar ? "Irradiance (W/m²)" : "Wind Speed (m/s)",
          position: "right",
          axisLabel: {
            formatter: "{value}",
          },
        },
        {
          type: "value",
          name: "Percentage (%)",
          position: "right",
          offset: 60,
          axisLabel: {
            formatter: "{value}%",
          },
          max: 100,
        },
      ],
      series: [
        {
          name: "Power Output",
          type: "line" as const,
          data: powers,
          smooth: true,
          yAxisIndex: 0,
          itemStyle: {
            color: isSolar ? "#f59e0b" : "#3b82f6",
          },
          areaStyle: {
            color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [
              {
                offset: 0,
                color: isSolar
                  ? "rgba(245, 158, 11, 0.3)"
                  : "rgba(59, 130, 246, 0.3)",
              },
              {
                offset: 1,
                color: isSolar
                  ? "rgba(245, 158, 11, 0.05)"
                  : "rgba(59, 130, 246, 0.05)",
              },
            ]),
          },
        },
        {
          name: "Capacity Factor",
          type: "line" as const,
          data: capacities,
          smooth: true,
          yAxisIndex: 2,
          itemStyle: {
            color: "#10b981",
          },
        },
        {
          name: isSolar ? "Solar Irradiance" : "Wind Speed",
          type: "line" as const,
          data: meteoData,
          smooth: true,
          yAxisIndex: 1,
          itemStyle: {
            color: isSolar ? "#ef4444" : "#8b5cf6",
          },
        },
        ...(isSolar
          ? [
              {
                name: "Cloud Cover",
                type: "line" as const,
                data: cloudCover,
                smooth: true,
                yAxisIndex: 2,
                itemStyle: {
                  color: "#6b7280",
                },
              },
            ]
          : []),
      ],
    };

    chart.setOption(option);

    // Handle resize
    const handleResize = () => {
      chart.resize();
    };
    window.addEventListener("resize", handleResize);

    return () => {
      window.removeEventListener("resize", handleResize);
    };
  }, [forecast]);

  useEffect(() => {
    return () => {
      if (chartInstance.current) {
        chartInstance.current.dispose();
        chartInstance.current = null;
      }
    };
  }, []);

  return (
    <div className="bg-white p-6 rounded-lg shadow-md">
      <div ref={chartRef} style={{ width: "100%", height: "500px" }} />
    </div>
  );
}
