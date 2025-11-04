'use client';

import { useEffect, useRef } from 'react';
import * as echarts from 'echarts';
import { LongTermAnalysis as LongTermAnalysisType } from '@/types';
import { formatEnergy, formatPercentage, formatNumber } from '@/lib/utils/formatters';

interface LongTermAnalysisProps {
  analysis: LongTermAnalysisType;
}

export default function LongTermAnalysis({ analysis }: LongTermAnalysisProps) {
  const chartRef = useRef<HTMLDivElement>(null);
  const chartInstance = useRef<echarts.ECharts | null>(null);

  useEffect(() => {
    if (!chartRef.current) return;

    if (!chartInstance.current) {
      chartInstance.current = echarts.init(chartRef.current);
    }

    const chart = chartInstance.current;

    const months = analysis.monthlyAverages.map(m => m.monthName);
    const production = analysis.monthlyAverages.map(m => m.averageProduction);
    const capacityFactors = analysis.monthlyAverages.map(m => m.averageCapacityFactor);

    const isSolar = analysis.asset.type === 'solar';
    const unit = isSolar ? 'kWh' : 'MWh';

    const option: echarts.EChartsOption = {
      title: {
        text: 'Monthly Average Energy Production',
        subtext: `Based on historical weather data`,
        left: 'center'
      },
      tooltip: {
        trigger: 'axis',
        axisPointer: {
          type: 'cross'
        },
        formatter: function (params: any) {
          let result = `<strong>${params[0].axisValue}</strong><br/>`;
          params.forEach((param: any) => {
            const value = param.value.toFixed(2);
            const unit_str = param.seriesName.includes('Production') ? unit : '%';
            result += `${param.marker} ${param.seriesName}: ${value} ${unit_str}<br/>`;
          });
          return result;
        }
      },
      legend: {
        data: ['Average Production', 'Capacity Factor'],
        top: 40
      },
      grid: {
        left: '3%',
        right: '4%',
        bottom: '3%',
        containLabel: true
      },
      xAxis: {
        type: 'category',
        data: months,
        axisLabel: {
          rotate: 45
        }
      },
      yAxis: [
        {
          type: 'value',
          name: `Production (${unit})`,
          position: 'left',
          axisLabel: {
            formatter: '{value}'
          }
        },
        {
          type: 'value',
          name: 'Capacity Factor (%)',
          position: 'right',
          axisLabel: {
            formatter: '{value}%'
          },
          max: 100
        }
      ],
      series: [
        {
          name: 'Average Production',
          type: 'bar',
          data: production,
          yAxisIndex: 0,
          itemStyle: {
            color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [
              { offset: 0, color: isSolar ? '#fbbf24' : '#60a5fa' },
              { offset: 1, color: isSolar ? '#f59e0b' : '#3b82f6' }
            ])
          }
        },
        {
          name: 'Capacity Factor',
          type: 'line',
          data: capacityFactors,
          yAxisIndex: 1,
          smooth: true,
          itemStyle: {
            color: '#10b981'
          },
          lineStyle: {
            width: 3
          }
        }
      ]
    };

    chart.setOption(option);

    const handleResize = () => {
      chart.resize();
    };
    window.addEventListener('resize', handleResize);

    return () => {
      window.removeEventListener('resize', handleResize);
    };
  }, [analysis]);

  useEffect(() => {
    return () => {
      if (chartInstance.current) {
        chartInstance.current.dispose();
        chartInstance.current = null;
      }
    };
  }, []);

  const isSolar = analysis.asset.type === 'solar';
  const unit = isSolar ? 'kWh' : 'MWh';

  return (
    <div className="bg-white p-6 rounded-lg shadow-md space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-gray-900 mb-4">Long-Term Viability Analysis</h2>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          <div className="bg-gradient-to-br from-blue-50 to-blue-100 p-4 rounded-lg">
            <div className="text-sm text-blue-600 font-medium">Annual Production</div>
            <div className="text-2xl font-bold text-blue-900">
              {formatNumber(Math.round(analysis.annualProduction))} {unit}
            </div>
          </div>
          
          <div className="bg-gradient-to-br from-green-50 to-green-100 p-4 rounded-lg">
            <div className="text-sm text-green-600 font-medium">Average Capacity Factor</div>
            <div className="text-2xl font-bold text-green-900">
              {formatPercentage(analysis.averageCapacityFactor)}
            </div>
          </div>
          
          <div className="bg-gradient-to-br from-purple-50 to-purple-100 p-4 rounded-lg">
            <div className="text-sm text-purple-600 font-medium">Peak Month</div>
            <div className="text-2xl font-bold text-purple-900">
              {analysis.monthlyAverages.reduce((max, m) => 
                m.averageProduction > max.averageProduction ? m : max
              ).monthName}
            </div>
          </div>
        </div>
      </div>

      <div ref={chartRef} style={{ width: '100%', height: '400px' }} />

      <div className="mt-6">
        <h3 className="text-lg font-semibold text-gray-800 mb-3">Monthly Breakdown</h3>
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Month
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Avg Production ({unit})
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Capacity Factor
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {analysis.monthlyAverages.map((month) => (
                <tr key={month.month} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                    {month.monthName}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">
                    {formatNumber(Math.round(month.averageProduction))}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">
                    {formatPercentage(month.averageCapacityFactor)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

