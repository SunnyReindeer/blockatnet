import React from 'react';
import { Line } from 'react-chartjs-2';
import { Chart as ChartJS, CategoryScale, LinearScale, PointElement, LineElement, Tooltip, Legend } from 'chart.js';

ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, Tooltip, Legend);

const PortfolioPerformanceChart = ({ historicalData }) => {
  const chartData = {
    labels: historicalData.map(data => data.date),
    datasets: [
      {
        label: 'Portfolio Value (USD)',
        data: historicalData.map(data => data.totalUsdValue),
        fill: false,
        backgroundColor: 'rgb(75, 192, 192)',
        borderColor: 'rgba(75, 192, 192, 0.2)',
        tension: 0.1
      }
    ]
  };

  const options = {
    scales: {
      y: {
        beginAtZero: true,
        title: {
          display: true,
          text: 'Value in USD'
        }
      },
      x: {
        title: {
          display: true,
          text: 'Date'
        }
      }
    },
    plugins: {
      legend: {
        display: true,
        position: 'top',
      }
    }
  };

  return <Line data={chartData} options={options} />;
};

export default PortfolioPerformanceChart;
