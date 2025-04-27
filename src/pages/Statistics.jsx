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

ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend);
function Statistics() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [isMobile, setIsMobile] = useState(window.innerWidth < 768);
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const statsPerPage = 10;

  const statsData = [
    { mois: 'Jan 2025', lignesActives: 120, licencesActives: 80, utilisateursActifs: 50, sites: 10 },
    { mois: 'Fév 2025', lignesActives: 125, licencesActives: 82, utilisateursActifs: 52, sites: 10 },
    { mois: 'Mar 2025', lignesActives: 130, licencesActives: 85, utilisateursActifs: 55, sites: 11 },
    { mois: 'Avr 2025', lignesActives: 135, licencesActives: 87, utilisateursActifs: 57, sites: 11 },
    { mois: 'Mai 2025', lignesActives: 140, licencesActives: 90, utilisateursActifs: 60, sites: 12 },
    { mois: 'Juin 2025', lignesActives: 145, licencesActives: 92, utilisateursActifs: 62, sites: 12 },
    { mois: 'Juil 2025', lignesActives: 150, licencesActives: 95, utilisateursActifs: 65, sites: 13 },
    { mois: 'Août 2025', lignesActives: 155, licencesActives: 97, utilisateursActifs: 67, sites: 13 },
    { mois: 'Sep 2025', lignesActives: 160, licencesActives: 100, utilisateursActifs: 70, sites: 14 },
    { mois: 'Oct 2025', lignesActives: 165, licencesActives: 102, utilisateursActifs: 72, sites: 14 },
    { mois: 'Nov 2025', lignesActives: 170, licencesActives: 105, utilisateursActifs: 75, sites: 15 },
    { mois: 'Déc 2025', lignesActives: 175, licencesActives: 107, utilisateursActifs: 77, sites: 15 },
  ];

  const metrics = {
    totalLignes: statsData.reduce((sum, stat) => sum + stat.lignesActives, 0) / statsData.length,
    totalLicences: statsData.reduce((sum, stat) => sum + stat.licencesActives, 0) / statsData.length,
    totalUtilisateurs: statsData.reduce((sum, stat) => sum + stat.utilisateursActifs, 0) / statsData.length,
    totalSites: statsData[statsData.length - 1].sites,
  };

  useEffect(() => {
    const handleResize = () => {
      const mobile = window.innerWidth < 768;
      setIsMobile(mobile);
      if (mobile) {
        setSidebarOpen(false);
      }
    };

    window.addEventListener('resize', handleResize);
    handleResize();
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const filteredStats = useMemo(() => {
    return statsData.filter((stat) =>
      stat.mois.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }, [searchTerm]);

  const totalPages = Math.ceil(filteredStats.length / statsPerPage);
  const paginatedStats = useMemo(() => {
    const startIndex = (currentPage - 1) * statsPerPage;
    return filteredStats.slice(startIndex, startIndex + statsPerPage);
  }, [filteredStats, currentPage]);

  const handlePageChange = (page) => {
    if (page >= 1 && page <= totalPages) {
      setCurrentPage(page);
    }
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

  const chartData = {
    labels: statsData.map((stat) => stat.mois),
    datasets: [
      {
        label: 'Lignes Actives',
        data: statsData.map((stat) => stat.lignesActives),
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
      },
      {
        label: 'Licences Actives',
        data: statsData.map((stat) => stat.licencesActives),
        borderColor: '#10b981',
        backgroundColor: (context) => {
          const ctx = context.chart.ctx;
          const gradient = ctx.createLinearGradient(0, 0, 0, 300);
          gradient.addColorStop(0, 'rgba(16, 185, 129, 0.5)');
          gradient.addColorStop(1, 'rgba(16, 185, 129, 0)');
          return gradient;
        },
        fill: true,
        tension: 0.4,
        pointBackgroundColor: '#ffffff',
        pointBorderColor: '#10b981',
        pointBorderWidth: 3,
        pointRadius: 5,
        pointHoverRadius: 8,
        pointHoverBackgroundColor: '#10b981',
        pointHoverBorderColor: '#ffffff',
        pointHoverBorderWidth: 2,
      },
    ],
  };

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    animation: {
      duration: 1500,
      easing: 'easeInOutQuart',
      onComplete: function () {
        this.options.animation.duration = 0; // Disable animation after first render
      },
    },
    plugins: {
      legend: {
        position: 'top',
        labels: {
          font: {
            size: 14,
            family: "'Nunito Sans', sans-serif",
            weight: '600',
          },
          color: '#1e293b',
          padding: 20,
          usePointStyle: true,
        },
      },
      title: {
        display: true,
        text: 'Évolution des Lignes et Licences Actives',
        font: {
          size: 20,
          family: "'Nunito Sans', sans-serif",
          weight: '700',
        },
        color: '#1e293b',
        padding: {
          top: 10,
          bottom: 20,
        },
      },
      tooltip: {
        enabled: true,
        backgroundColor: 'rgba(0, 0, 0, 0.85)',
        titleFont: {
          size: 14,
          family: "'Nunito Sans', sans-serif",
          weight: '600',
        },
        bodyFont: {
          size: 12,
          family: "'Nunito Sans', sans-serif",
        },
        padding: 12,
        cornerRadius: 6,
        boxPadding: 6,
      },
    },
    scales: {
      y: {
        beginAtZero: true,
        grid: {
          color: 'rgba(0, 0, 0, 0.05)',
          borderDash: [5, 5],
        },
        ticks: {
          font: {
            size: 12,
            family: "'Nunito Sans', sans-serif",
          },
          color: '#4a5568',
          padding: 10,
        },
        title: {
          display: true,
          text: 'Nombre',
          font: {
            size: 14,
            family: "'Nunito Sans', sans-serif",
            weight: '600',
          },
          color: '#1e293b',
        },
      },
      x: {
        grid: {
          display: false,
        },
        ticks: {
          font: {
            size: 12,
            family: "'Nunito Sans', sans-serif",
          },
          color: '#4a5568',
          padding: 10,
        },
        title: {
          display: true,
          text: 'Mois',
          font: {
            size: 14,
            family: "'Nunito Sans', sans-serif",
            weight: '600',
          },
          color: '#1e293b',
        },
      },
    },
    elements: {
      line: {
        borderWidth: 3,
      },
      point: {
        hitRadius: 10,
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
                    Gestion des Statistiques
                    <span className="st-title-underline"></span>
                  </h1>
                  <p className="st-subtitle">Analysez les performances et tendances de vos données</p>
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
                <i className="ri-file-text-line st-metric-icon"></i>
              </div>
              <div>
                <h3>{Math.round(metrics.totalLicences)}</h3>
                <p>Licences Actives (Moyenne)</p>
              </div>
            </div>
            <div className="st-metric-card">
              <div className="st-metric-icon-container">
                <i className="ri-user-3-line st-metric-icon"></i>
              </div>
              <div>
                <h3>{Math.round(metrics.totalUtilisateurs)}</h3>
                <p>Utilisateurs Actifs (Moyenne)</p>
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
                  Liste des Statistiques
                  <span className="st-stat-count">{filteredStats.length} période(s)</span>
                </h2>
              </div>
              <div className="st-search-filter-container">
                <div className="st-search-box">
                  <i className="ri-search-line st-search-icon"></i>
                  <input
                    id="stat-search"
                    type="text"
                    placeholder="Rechercher une période..."
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
                <div className="st-filter-group">
                  <button className="st-btn-secondary" aria-label="Filtrer les statistiques">
                    <i className="ri-filter-3-line"></i>
                    <span>Filtrer</span>
                  </button>
                  <button
                    className="st-sort-btn st-btn-secondary"
                    aria-label="Trier les statistiques"
                  >
                    <i className="ri-arrow-up-down-line"></i>
                  </button>
                </div>
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
                        <i className="ri-bar-chart-line" />
                        <span>{stat.mois}</span>
                      </div>
                    </div>
                    <div className="st-stat-card-body">
                      <div className="st-stat-card-item">
                        <i className="ri-plug-line" />
                        <span>{stat.lignesActives} Lignes Actives</span>
                      </div>
                      <div className="st-stat-card-item">
                        <i className="ri-file-text-line" />
                        <span>{stat.licencesActives} Licences Actives</span>
                      </div>
                      <div className="st-stat-card-item">
                        <i className="ri-user-3-line" />
                        <span>{stat.utilisateursActifs} Utilisateurs Actifs</span>
                      </div>
                      <div className="st-stat-card-item">
                        <i className="ri-map-pin-line" />
                        <span>{stat.sites} Sites</span>
                      </div>
                    </div>
                  </div>
                ))
              ) : (
                <div className="st-no-stats">Aucune statistique disponible.</div>
              )}
            </div>
          ) : (
            <div className="st-table-responsive">
              <table className="st-stats-table">
                <thead>
                  <tr>
                    <th>Période</th>
                    <th>Lignes Actives</th>
                    <th>Licences Actives</th>
                    <th>Utilisateurs Actifs</th>
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
                            <i className="ri-bar-chart-line" />
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
                            <i className="ri-file-text-line" />
                            {stat.licencesActives}
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
                            <i className="ri-map-pin-line" />
                            {stat.sites}
                          </div>
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan="5" className="st-no-stats">
                        Aucune statistique disponible.
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