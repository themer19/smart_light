
import React, { useState, useEffect, useRef } from 'react';
import {
  Chart,
  LineController,
  LineElement,
  PointElement,
  LinearScale,
  TimeScale,
  Title,
  Tooltip,
  Legend,
} from 'chart.js';
import 'chartjs-adapter-date-fns'; // Import the date-fns adapter
import axios from 'axios';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

// Register Chart.js components and the date-fns adapter
Chart.register(
  LineController,
  LineElement,
  PointElement,
  LinearScale,
  TimeScale,
  Title,
  Tooltip,
  Legend
);

const EnergyDashboard = () => {
  const chartRef = useRef(null);
  const chartInstance = useRef(null);
  const [energyData, setEnergyData] = useState({
    timestamps: [
      '2023-11-15T08:00:00',
      '2023-11-15T10:00:00',
      '2023-11-15T12:00:00',
      '2023-11-15T14:00:00',
      '2023-11-15T16:00:00',
      '2023-11-15T18:00:00',
      '2023-11-15T20:00:00',
    ],
    voltages: {
      an: [228.5, 230.1, 231.2, 229.8, 230.5, 229.3, 230.0],
      bn: [229.1, 230.5, 231.0, 230.2, 229.8, 230.1, 229.5],
      cn: [230.2, 229.8, 230.5, 231.0, 230.2, 229.0, 230.5],
    },
    powers: {
      total: [1250, 1850, 2250, 2100, 1950, 3200, 2800],
    },
    energy: {
      delivered: [15200, 15400, 15800, 16200, 16600, 17100, 17500],
    },
  });

  // Fetch real-time data from your backend
  useEffect(() => {
    const fetchEnergyData = async () => {
      try {
        const response = await axios.get('http://localhost:5000/api/energy/data');
        if (response.data) {
          setEnergyData(response.data);
          toast.info('Données énergétiques mises à jour', { autoClose: 2000 });
        }
      } catch (error) {
        toast.error('Erreur lors du chargement des données énergétiques');
        console.error('Fetch error:', error.response?.data || error.message);
      }
    };

    // Initial fetch
    fetchEnergyData();

    // Poll every 30 seconds for updates
    const interval = setInterval(fetchEnergyData, 30000);

    // Test toast to confirm react-toastify is working
    toast.info('Tableau de bord énergétique chargé', { autoClose: 2000 });

    return () => clearInterval(interval);
  }, []);

  // Initialize Chart.js
  useEffect(() => {
    if (chartRef.current && !chartInstance.current) {
      const ctx = chartRef.current.getContext('2d');

      chartInstance.current = new Chart(ctx, {
        type: 'line',
        data: {
          labels: energyData.timestamps,
          datasets: [
            {
              label: 'Tension A-N (V)',
              data: energyData.voltages.an,
              borderColor: '#FF6384',
              backgroundColor: 'rgba(255, 99, 132, 0.2)',
              borderWidth: 2,
              tension: 0.3,
              yAxisID: 'y',
            },
            {
              label: 'Tension B-N (V)',
              data: energyData.voltages.bn,
              borderColor: '#36A2EB',
              backgroundColor: 'rgba(54, 162, 235, 0.2)',
              borderWidth: 2,
              tension: 0.3,
              yAxisID: 'y',
            },
            {
              label: 'Tension C-N (V)',
              data: energyData.voltages.cn,
              borderColor: '#4BC0C0',
              backgroundColor: 'rgba(75, 192, 192, 0.2)',
              borderWidth: 2,
              tension: 0.3,
              yAxisID: 'y',
            },
            {
              label: 'Puissance Active (W)',
              data: energyData.powers.total,
              borderColor: '#9966FF',
              backgroundColor: 'rgba(153, 102, 255, 0.2)',
              borderWidth: 2,
              tension: 0.3,
              yAxisID: 'y1',
            },
          ],
        },
        options: {
          responsive: true,
          maintainAspectRatio: false,
          plugins: {
            legend: {
              position: 'top',
              labels: {
                boxWidth: 12,
                padding: 20,
                font: { size: 12 },
              },
            },
            tooltip: {
              mode: 'index',
              intersect: false,
              backgroundColor: 'rgba(0,0,0,0.7)',
              titleFont: { size: 14 },
              bodyFont: { size: 12 },
              padding: 12,
            },
          },
          scales: {
            x: {
              type: 'time',
              time: {
                unit: 'hour',
                tooltipFormat: 'HH:mm',
                displayFormats: {
                  hour: 'HH:mm',
                },
              },
              grid: { display: false },
              ticks: {
                maxRotation: 45,
                minRotation: 45,
              },
            },
            y: {
              position: 'left',
              title: {
                display: true,
                text: 'Tension (V)',
                font: { weight: 'bold' },
              },
              grid: { color: 'rgba(0,0,0,0.05)' },
              min: 220,
              max: 235,
            },
            y1: {
              position: 'right',
              title: {
                display: true,
                text: 'Puissance (W)',
                font: { weight: 'bold' },
              },
              grid: { drawOnChartArea: false },
              min: 0,
              max: 4000,
            },
          },
        },
      });
    }

    return () => {
      if (chartInstance.current) {
        chartInstance.current.destroy();
        chartInstance.current = null;
      }
    };
  }, [energyData]);

  return (
    <div className="energy-dashboard">
      <ToastContainer
        position="top-right"
        autoClose={5000}
        hideProgressBar={false}
        newestOnTop={false}
        closeOnClick
        rtl={false}
        pauseOnFocusLoss
        draggable
        pauseOnHover
        style={{ zIndex: 9999 }}
      />
      <header className="dashboard-header">
        <h1>Tableau de Bord Énergétique</h1>
        <p className="last-update">Dernière mise à jour: {new Date().toLocaleString()}</p>
      </header>

      <div className="chart-container">
        <canvas ref={chartRef} />
      </div>

      <div className="metrics-grid">
        <div className="metric-card voltage-card">
          <h3>Tensions Moyennes</h3>
          <div className="voltage-values">
            <div>
              <span className="voltage-label">A-N:</span>
              <span className="voltage-value">
                {energyData.voltages.an.length
                  ? (
                      energyData.voltages.an.reduce((a, b) => a + b, 0) /
                      energyData.voltages.an.length
                    ).toFixed(2)
                  : 'N/A'}
                V
              </span>
            </div>
            <div>
              <span className="voltage-label">B-N:</span>
              <span className="voltage-value">
                {energyData.voltages.bn.length
                  ? (
                      energyData.voltages.bn.reduce((a, b) => a + b, 0) /
                      energyData.voltages.bn.length
                    ).toFixed(2)
                  : 'N/A'}
                V
              </span>
            </div>
            <div>
              <span className="voltage-label">C-N:</span>
              <span className="voltage-value">
                {energyData.voltages.cn.length
                  ? (
                      energyData.voltages.cn.reduce((a, b) => a + b, 0) /
                      energyData.voltages.cn.length
                    ).toFixed(2)
                  : 'N/A'}
                V
              </span>
            </div>
          </div>
        </div>

        <div className="metric-card power-card">
          <h3>Puissance</h3>
          <div className="power-values">
            <div>
              <span className="power-label">Actuelle:</span>
              <span className="power-value">
                {energyData.powers.total.length
                  ? energyData.powers.total.slice(-1)[0]
                  : 'N/A'}{' '}
                W
              </span>
            </div>
            <div>
              <span className="power-label">Max:</span>
              <span className="power-value">
                {energyData.powers.total.length
                  ? Math.max(...energyData.powers.total)
                  : 'N/A'}{' '}
                W
              </span>
            </div>
            <div>
              <span className="power-label">Min:</span>
              <span className="power-value">
                {energyData.powers.total.length
                  ? Math.min(...energyData.powers.total)
                  : 'N/A'}{' '}
                W
              </span>
            </div>
          </div>
        </div>

        <div className="metric-card energy-card">
          <h3>Énergie Délivrée</h3>
          <div className="energy-value">
            {energyData.energy.delivered.length
              ? energyData.energy.delivered.slice(-1)[0]
              : 'N/A'}{' '}
            Wh
          </div>
          <div className="energy-trend">
            {energyData.energy.delivered.length
              ? `+${
                  energyData.energy.delivered.slice(-1)[0] -
                  energyData.energy.delivered[0]
                } Wh aujourd'hui`
              : 'N/A'}
          </div>
        </div>
      </div>

      <style jsx>{`
        .energy-dashboard {
          max-width: 1200px;
          margin: 0 auto;
          padding: 20px;
          font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
          color: #333;
        }

        .dashboard-header {
          margin-bottom: 30px;
          text-align: center;
        }

        .dashboard-header h1 {
          color: #2c3e50;
          margin-bottom: 5px;
          font-size: 28px;
        }

        .last-update {
          color: #7f8c8d;
          font-size: 14px;
        }

        .chart-container {
          position: relative;
          height: 500px;
          margin-bottom: 40px;
          background: white;
          border-radius: 8px;
          box-shadow: 0 2px 10px rgba(0, 0, 0, 0.05);
          padding: 20px;
        }

        .metrics-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
          gap: 20px;
          margin-top: 20px;
        }

        .metric-card {
          background: white;
          border-radius: 8px;
          padding: 20px;
          box-shadow: 0 2px 10px rgba(0, 0, 0, 0.05);
        }

        .metric-card h3 {
          margin-top: 0;
          color: #2c3e50;
          font-size: 18px;
          border-bottom: 1px solid #eee;
          padding-bottom: 10px;
          margin-bottom: 15px;
        }

        .voltage-values div {
          display: flex;
          justify-content: space-between;
          margin-bottom: 8px;
        }

        .voltage-label {
          color: #7f8c8d;
        }

        .voltage-value {
          font-weight: bold;
          color: #2c3e50;
        }

        .power-values div {
          display: flex;
          justify-content: space-between;
          margin-bottom: 8px;
        }

        .power-label {
          color: #7f8c8d;
        }

        .power-value {
          font-weight: bold;
          color: #2c3e50;
        }

        .energy-value {
          font-size: 24px;
          font-weight: bold;
          color: #27ae60;
          text-align: center;
          margin: 15px 0;
        }

        .energy-trend {
          text-align: center;
          color: #7f8c8d;
          font-size: 14px;
        }

        @media (max-width: 768px) {
          .chart-container {
            height: 400px;
          }

          .metrics-grid {
            grid-template-columns: 1fr;
          }
        }
      `}</style>
    </div>
  );
};

export default EnergyDashboard;
