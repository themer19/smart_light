import React, { useState, useEffect, useMemo } from 'react';
import clsx from 'clsx';
import { Line } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  Filler,
} from 'chart.js';
import Sidebar from '../components/Sidebar';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import './cssP/Statistics.css';

ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend, Filler);

function Statistics() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [isMobile, setIsMobile] = useState(window.innerWidth < 768);
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const statsPerPage = 10;
  const [statsData, setStatsData] = useState([]);
  const [energyTableData, setEnergyTableData] = useState([]);

  useEffect(() => {
    let ws;
    let reconnectTimeout;
    let isMounted = true;

    const connect = () => {
      if (!isMounted) return;

      ws = new WebSocket('ws://localhost:8081');

      ws.onopen = () => {
        if (isMounted) {
          console.log('Connecté au WebSocket');
          toast.success('Connecté au serveur de données');
        }
      };

      ws.onmessage = (event) => {
        if (!isMounted) return;
        try {
          const data = JSON.parse(event.data);
          const formattedData = {
            mois: new Date(data.timestamp).toLocaleDateString('fr-FR', { month: 'short', year: 'numeric' }),
            lignesActives: 1,
            consommation: data.puissance,
            utilisateursActifs: 0,
            sites: 1,
            energieVerte: data.energieVerte || 0,
          };

          setStatsData((prev) => [...prev, formattedData].slice(-12));
          setEnergyTableData((prev) => {
            const existing = prev.find((item) => item.site === data.capteur);
            if (existing) {
              return prev.map((item) =>
                item.site === data.capteur
                  ? { ...item, consommation: data.puissance, energieVerte: data.energieVerte }
                  : item
              );
            }
            return [
              ...prev,
              {
                site: data.capteur,
                consommation: data.puissance,
                efficacite: data.puissance > 100 ? 'Basse' : data.puissance > 50 ? 'Moyenne' : 'Haute',
                typeEnergie: data.energieVerte > 50 ? 'Verte' : 'Mixte',
                empreinteCarbone: data.puissance > 100 ? 'Élevée' : data.puissance > 50 ? 'Moyenne' : 'Basse',
              },
            ].slice(-5);
          });
        } catch (error) {
          console.error('Erreur lors du traitement des données WebSocket:', error);
          toast.error('Erreur de traitement des données');
        }
      };

      ws.onerror = (error) => {
        if (isMounted) {
          console.error('Erreur WebSocket:', error);
          toast.error('Erreur de connexion WebSocket');
          ws.close();
        }
      };

      ws.onclose = () => {
        if (isMounted) {
          console.log('Connexion WebSocket fermée');
          toast.warn('Connexion WebSocket perdue');
          reconnectTimeout = setTimeout(connect, 10000);
        }
      };
    };

    connect();

    return () => {
      isMounted = false;
      if (reconnectTimeout) clearTimeout(reconnectTimeout);
      if (ws && ws.readyState === WebSocket.OPEN) ws.close();
    };
  }, []);

  useEffect(() => {
    const handleResize = () => {
      const mobile = window.innerWidth < 768;
      setIsMobile(mobile);
      if (mobile) setSidebarOpen(false);
    };
    window.addEventListener('resize', handleResize);
    handleResize();
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const filteredStats = useMemo(() => {
    return statsData.filter((stat) =>
      stat.mois.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }, [statsData, searchTerm]);

  const totalPages = Math.ceil(filteredStats.length / statsPerPage);
  const paginatedStats = useMemo(() => {
    const startIndex = (currentPage - 1) * statsPerPage;
    return filteredStats.slice(startIndex, startIndex + statsPerPage);
  }, [filteredStats, currentPage]);

  const handlePageChange = (page) => {
    if (page >= 1 && page <= totalPages) setCurrentPage(page);
  };

  const handleSidebarToggle = (isOpen) => {
    setSidebarOpen(isOpen);
  };

  const handleSearchChange = (e) => {
    setSearchTerm(e.target.value);
    setCurrentPage(1);
  };

  const handleClearSearch = () => {
    setSearchTerm('');
    setCurrentPage(1);
  };

  const metrics = useMemo(() => ({
    totalLignes: statsData.length ? statsData.reduce((sum, stat) => sum + stat.lignesActives, 0) / statsData.length : 0,
    totalConsommation: statsData.length ? statsData.reduce((sum, stat) => sum + stat.consommation, 0) / statsData.length : 0,
    totalUtilisateurs: statsData.length ? statsData.reduce((sum, stat) => sum + stat.utilisateursActifs, 0) / statsData.length : 0,
    totalSites: energyTableData.length,
    energieVerte: statsData.length ? statsData[statsData.length - 1]?.energieVerte || 0 : 0,
  }), [statsData, energyTableData]);

  const chartData = {
    labels: statsData.map((stat) => stat.mois),
    datasets: [
      {
        label: 'Consommation Énergétique (kWh)',
        data: statsData.map((stat) => stat.consommation),
        borderColor: '#4f46e5',
        backgroundColor: (context) => {
          const ctx = context.chart.ctx;
          const gradient = ctx.createLinearGradient(0, 0, 0, 300);
          gradient.addColorStop(0, 'rgba(79, 70, 229, 0.5)');
          gradient.addColorStop(1, 'rgba(79, 70, 229, 0)');
          return gradient;
        },
        fill: true,
        tension: 0.4,
        pointBackgroundColor: '#ffffff',
        pointBorderColor: '#4f46e5',
        pointBorderWidth: 3,
        pointRadius: 5,
        pointHoverRadius: 8,
        pointHoverBackgroundColor: '#4f46e5',
        pointHoverBorderColor: '#ffffff',
        pointHoverBorderWidth: 2,
        yAxisID: 'y',
      },
      {
        label: 'Lignes Actives',
        data: statsData.map((stat) => stat.lignesActives),
        borderColor: '#10b981',
        backgroundColor: 'rgba(16, 185, 129, 0.1)',
        borderWidth: 2,
        tension: 0.4,
        pointBackgroundColor: '#ffffff',
        pointBorderColor: '#10b981',
        pointBorderWidth: 3,
        pointRadius: 5,
        pointHoverRadius: 8,
        pointHoverBackgroundColor: '#10b981',
        pointHoverBorderColor: '#ffffff',
        pointHoverBorderWidth: 2,
        yAxisID: 'y1',
      },
    ],
  };

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    interaction: {
      mode: 'index',
      intersect: false,
    },
    plugins: {
      legend: {
        position: 'top',
        labels: {
          font: { size: 14, family: "'Nunito Sans', sans-serif", weight: '600' },
          color: '#1e293b',
          padding: 20,
          usePointStyle: true,
        },
      },
      title: {
        display: true,
        text: 'Consommation Énergétique et Lignes Actives',
        font: { size: 20, family: "'Nunito Sans', sans-serif", weight: '700' },
        color: '#1e293b',
        padding: { top: 10, bottom: 20 },
      },
      tooltip: {
        enabled: true,
        backgroundColor: 'rgba(0, 0, 0, 0.85)',
        titleFont: { size: 14, family: "'Nunito Sans', sans-serif", weight: '600' },
        bodyFont: { size: 12, family: "'Nunito Sans', sans-serif" },
        padding: 12,
        cornerRadius: 6,
        boxPadding: 6,
      },
    },
    scales: {
      y: {
        type: 'linear',
        display: true,
        position: 'left',
        title: {
          display: true,
          text: 'Consommation (kWh)',
          font: { size: 14, family: "'Nunito Sans', sans-serif", weight: '600' },
        },
        grid: { color: 'rgba(0, 0, 0, 0.05)' },
      },
      y1: {
        type: 'linear',
        display: true,
        position: 'right',
        title: {
          display: true,
          text: 'Lignes Actives',
          font: { size: 14, family: "'Nunito Sans', sans-serif", weight: '600' },
        },
        grid: { drawOnChartArea: false },
      },
      x: {
        grid: { display: false },
        title: {
          display: true,
          text: 'Mois',
          font: { size: 14, family: "'Nunito Sans', sans-serif", weight: '600' },
        },
      },
    },
  };

  return (
    <div className='statis-page'>
      <div className="st-container" style={{ display: 'flex', minHeight: '100vh' }}>
        <Sidebar
          onToggle={handleSidebarToggle}
          className={clsx('st-sidebar', {
            'st-sidebar-open': sidebarOpen,
            'st-sidebar-collapsed': !sidebarOpen,
          })}
        />
        <main
          className={clsx('st-main-content', {
            'st-sidebar-collapsed': !sidebarOpen || isMobile,
          })}
          style={{
            flex: 1,
            marginLeft: 0,
            paddingLeft: 0,
            marginTop: isMobile ? '1.5rem' : '2rem',
          }}
        >
          <div className="st-dashboard-card">
            <div className="st-page-header">
              <div className="st-header-content">
                <div className="st-title-wrapper">
                  <div className="st-title-icon-container">
                    <i className="ri-bar-chart-line st-main-icon"></i>
                  </div>
                  <div>
                    <h1 className="st-main-title">
                      Tableau de Bord Énergétique
                      <span className="st-title-underline"></span>
                    </h1>
                    <p className="st-subtitle">Analyse de la consommation et des performances énergétiques</p>
                  </div>
                </div>
              </div>
            </div>

            <div className="st-metrics-container">
              <div className="st-metric-card">
                <div className="st-metric-icon-container">
                  <i className="ri-plug-line st-metric-icon"></i>
                </div>
                <div>
                  <h3>{Math.round(metrics.totalLignes)}</h3>
                  <p>Lignes Actives (Moyenne)</p>
                </div>
              </div>
              <div className="st-metric-card">
                <div className="st-metric-icon-container">
                  <i className="ri-flashlight-line st-metric-icon"></i>
                </div>
                <div>
                  <h3>{Math.round(metrics.totalConsommation)} kWh</h3>
                  <p>Consommation Moyenne</p>
                </div>
              </div>
              <div className="st-metric-card">
                <div className="st-metric-icon-container">
                  <i className="ri-leaf-line st-metric-icon"></i>
                </div>
                <div>
                  <h3>{metrics.energieVerte}%</h3>
                  <p>Énergie Verte</p>
                </div>
              </div>
              <div className="st-metric-card">
                <div className="st-metric-icon-container">
                  <i className="ri-map-pin-line st-metric-icon"></i>
                </div>
                <div>
                  <h3>{metrics.totalSites}</h3>
                  <p>Sites Actifs</p>
                </div>
              </div>
            </div>

            <div className="st-chart-container">
              <Line data={chartData} options={chartOptions} />
            </div>

            <div className="st-card-header">
              <div className="st-list-header-wrapper">
                <div className="st-list-title-container">
                  <i className="ri-table-2 st-list-icon"></i>
                  <h2 className="st-list-title">
                    Analyse par Site
                    <span className="st-stat-count">{energyTableData.length} site(s)</span>
                  </h2>
                </div>
                <div className="st-search-filter-container">
                  <div className="st-search-box">
                    <i className="ri-search-line st-search-icon"></i>
                    <input
                      id="stat-search"
                      type="text"
                      placeholder="Rechercher un site..."
                      className="st-search-input"
                      value={searchTerm}
                      onChange={handleSearchChange}
                    />
                    {searchTerm && (
                      <i
                        className="ri-close-line st-clear-icon"
                        onClick={handleClearSearch}
                        aria-label="Effacer la recherche"
                      ></i>
                    )}
                  </div>
                </div>
              </div>
            </div>

            <div className="st-table-responsive">
              <table className="st-stats-table">
                <thead>
                  <tr>
                    <th>Site</th>
                    <th>Consommation (kWh)</th>
                    <th>Efficacité</th>
                    <th>Type d'Énergie</th>
                    <th>Empreinte Carbone</th>
                  </tr>
                </thead>
                <tbody>
                  {energyTableData.map((site, i) => (
                    <tr key={site.site}>
                      <td>
                        <div className="st-stat-name">
                          <span className="st-stat-number">{i + 1}.</span>
                          <i className="ri-building-2-line" />
                          <div>
                            <span>{site.site}</span>
                          </div>
                        </div>
                      </td>
                      <td>
                        <div className="st-stat-cell">
                          <i className="ri-flashlight-line" />
                          {site.consommation}
                        </div>
                      </td>
                      <td>
                        <div className={`st-stat-cell st-efficacite-${site.efficacite.toLowerCase()}`}>
                          <i className="ri-speed-up-line" />
                          {site.efficacite}
                        </div>
                      </td>
                      <td>
                        <div className={`st-stat-cell st-energie-${site.typeEnergie.toLowerCase()}`}>
                          <i className="ri-leaf-line" />
                          {site.typeEnergie}
                        </div>
                      </td>
                      <td>
                        <div className={`st-stat-cell st-carbone-${site.empreinteCarbone.toLowerCase().replace(' ', '-')}`}>
                          <i className="ri-cloudy-line" />
                          {site.empreinteCarbone}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <div className="st-card-header" style={{ marginTop: '2rem' }}>
              <div className="st-list-header-wrapper">
                <div className="st-list-title-container">
                  <i className="ri-history-line st-list-icon"></i>
                  <h2 className="st-list-title">
                    Historique Mensuel
                    <span className="st-stat-count">{filteredStats.length} période(s)</span>
                  </h2>
                </div>
              </div>
            </div>

            {isMobile ? (
              <div className="st-stat-cards">
                {paginatedStats.length > 0 ? (
                  paginatedStats.map((stat, i) => (
                    <div className="st-stat-card" key={stat.mois}>
                      <div className="st-stat-card-header">
                        <div className="st-stat-card-title">
                          <span className="st-stat-number">{(currentPage - 1) * statsPerPage + i + 1}.</span>
                          <i className="ri-calendar-line" />
                          <span>{stat.mois}</span>
                        </div>
                      </div>
                      <div className="st-stat-card-body">
                        <div className="st-stat-card-item">
                          <i className="ri-plug-line" />
                          <span>{stat.lignesActives} Lignes Actives</span>
                        </div>
                        <div className="st-stat-card-item">
                          <i className="ri-flashlight-line" />
                          <span>{stat.consommation} kWh</span>
                        </div>
                        <div className="st-stat-card-item">
                          <i className="ri-user-3-line" />
                          <span>{stat.utilisateursActifs} Utilisateurs</span>
                        </div>
                        <div className="st-stat-card-item">
                          <i className="ri-leaf-line" />
                          <span>{stat.energieVerte}% Énergie Verte</span>
                        </div>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="st-no-stats">Aucune donnée disponible.</div>
                )}
              </div>
            ) : (
              <div className="st-table-responsive">
                <table className="st-stats-table">
                  <thead>
                    <tr>
                      <th>Période</th>
                      <th>Lignes Actives</th>
                      <th>Consommation (kWh)</th>
                      <th>Utilisateurs</th>
                      <th>Énergie Verte</th>
                      <th>Sites</th>
                    </tr>
                  </thead>
                  <tbody>
                    {paginatedStats.length > 0 ? (
                      paginatedStats.map((stat, i) => (
                        <tr key={stat.mois}>
                          <td>
                            <div className="st-stat-name">
                              <span className="st-stat-number">{(currentPage - 1) * statsPerPage + i + 1}.</span>
                              <i className="ri-calendar-line" />
                              <div>
                                <span>{stat.mois}</span>
                              </div>
                            </div>
                          </td>
                          <td>
                            <div className="st-stat-cell">
                              <i className="ri-plug-line" />
                              {stat.lignesActives}
                            </div>
                          </td>
                          <td>
                            <div className="st-stat-cell">
                              <i className="ri-flashlight-line" />
                              {stat.consommation}
                            </div>
                          </td>
                          <td>
                            <div className="st-stat-cell">
                              <i className="ri-user-3-line" />
                              {stat.utilisateursActifs}
                            </div>
                          </td>
                          <td>
                            <div className="st-stat-cell">
                              <i className="ri-leaf-line" />
                              {stat.energieVerte}%
                            </div>
                          </td>
                          <td>
                            <div className="st-stat-cell">
                              <i className="ri-map-pin-line" />
                              {stat.sites}
                            </div>
                          </td>
                        </tr>
                      ))
                    ) : (
                      <tr>
                        <td colSpan="6" className="st-no-stats">
                          Aucune donnée disponible.
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            )}

            <div className="st-table-footer">
              <div className="st-pagination-info">
                Affichage {(currentPage - 1) * statsPerPage + 1}-
                {Math.min(currentPage * statsPerPage, filteredStats.length)} sur{' '}
                {filteredStats.length} période(s)
              </div>
              <div className="st-pagination-controls">
                <button
                  className="st-pagination-btn"
                  onClick={() => handlePageChange(currentPage - 1)}
                  disabled={currentPage === 1}
                  aria-label="Page précédente"
                >
                  <i className="ri-arrow-left-s-line"></i>
                </button>
                <span>{currentPage}</span>
                <button
                  className="st-pagination-btn"
                  onClick={() => handlePageChange(currentPage + 1)}
                  disabled={currentPage === totalPages}
                  aria-label="Page suivante"
                >
                  <i className="ri-arrow-right-s-line"></i>
                </button>
              </div>
            </div>
          </div>
        </main>
        <ToastContainer position="top-right" autoClose={3000} />
      </div>
    </div>
  );
}

export default Statistics;