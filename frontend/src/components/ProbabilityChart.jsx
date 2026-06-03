import React from 'react';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Filler,
} from 'chart.js';
import { Line } from 'react-chartjs-2';

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Filler
);

const ProbabilityChart = ({ pdf }) => {
  const options = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        display: false,
      },
      tooltip: {
        mode: 'index',
        intersect: false,
        backgroundColor: 'rgba(20, 22, 35, 0.9)',
        titleColor: '#94a3b8',
        bodyColor: '#e2e8f0',
        borderColor: 'rgba(255, 255, 255, 0.1)',
        borderWidth: 1,
        callbacks: {
          title: (items) => `Redshift: ${items[0].label}`,
          label: (item) => `Probability: ${item.raw.toFixed(4)}`
        }
      },
    },
    scales: {
      x: {
        grid: {
          display: false,
          color: 'rgba(255, 255, 255, 0.05)',
        },
        ticks: {
          color: '#94a3b8',
          maxTicksLimit: 10,
          callback: function(val, index) {
            return Number(this.getLabelForValue(val)).toFixed(1);
          }
        },
        title: {
          display: true,
          text: 'Redshift (z)',
          color: '#94a3b8'
        }
      },
      y: {
        grid: {
          color: 'rgba(255, 255, 255, 0.05)',
        },
        ticks: {
          color: '#94a3b8',
        },
        title: {
          display: true,
          text: 'Probability Density',
          color: '#94a3b8'
        }
      },
    },
    interaction: {
      mode: 'nearest',
      axis: 'x',
      intersect: false,
    },
  };

  const data = {
    labels: pdf.z_grid.map(z => z.toFixed(3)),
    datasets: [
      {
        fill: true,
        label: 'Probability',
        data: pdf.probabilities,
        borderColor: '#8b5cf6',
        backgroundColor: 'rgba(139, 92, 246, 0.2)',
        borderWidth: 2,
        pointRadius: 0,
        pointHoverRadius: 6,
        pointBackgroundColor: '#fff',
        tension: 0.4,
      },
    ],
  };

  return (
    <div className="chart-container">
      <Line options={options} data={data} />
    </div>
  );
};

export default ProbabilityChart;
