import React from 'react';
import { Line } from 'react-chartjs-2';
import 'chart.js/auto';

const PortfolioPerformanceChart = () => {
  const data = {
    labels: ["January", "February", "March", "April", "May", "June"], 
    datasets: [
      {
        label: "Profit/Loss",
        data: [2030, 10000, 4000, 2000, 20000, 10000], 
        fill: false,
        backgroundColor: "rgb(75, 192, 192)",
        borderColor: "rgba(75, 192, 192, 0.2)",
      },
    ],
  };

  const options = {
    scales: {
      y: {
        beginAtZero: true,
      },
    },
    plugins: {
      tooltip: {
        callbacks: {
          label: function(context) {
            let label = context.dataset.label || '';

            if (label) {
              label += ': ';
            }
            if (context.parsed.y !== null) {
              label += `$${context.parsed.y}`;
            }
            return label;
          }
        }
      }
    }
  };

  return <Line data={data} options={options} />;
};

export default PortfolioPerformanceChart;
