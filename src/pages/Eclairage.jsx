import React, { useState } from 'react';
import Sidebar from '../components/Sidebar';
import './cssP/test.css';

function Eclairage() {
  const [searchTerm, setSearchTerm] = useState('');
  const [lightPoints, setLightPoints] = useState([
    { id: 1, name: 'Lumière Rue Principale', location: 'Paris', status: 'actif', lastUpdate: '2023-06-10', power: '50W', type: 'LED' },
    { id: 2, name: 'Lumière Place Centrale', location: 'Lyon', status: 'panne', lastUpdate: '2023-06-11', power: '75W', type: 'Sodium' },
    { id: 3, name: 'Lumière Avenue des Champs', location: 'Marseille', status: 'actif', lastUpdate: '2023-06-12', power: '60W', type: 'LED' },
    { id: 4, name: 'Lumière Boulevard Maritime', location: 'Bordeaux', status: 'maintenance', lastUpdate: '2023-06-13', power: '100W', type: 'Halogene' },
    { id: 5, name: 'Lumière Rue du Commerce', location: 'Lille', status: 'actif', lastUpdate: '2023-06-14', power: '40W', type: 'LED' },
  ]);

  const filteredPoints = lightPoints.filter(point =>
    point.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    point.location.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleDelete = (id) => {
    setLightPoints(lightPoints.filter(point => point.id !== id));
  };

  const getStatusStyle = (status) => {
    switch (status) {
      case 'actif':
        return { bg: '#C6F6D5', text: '#22543D', icon: 'ri-flashlight-fill', color: '#48BB78' };
      case 'panne':
        return { bg: '#FED7D7', text: '#822727', icon: 'ri-error-warning-fill', color: '#E53E3E' };
      case 'maintenance':
        return { bg: '#FEFCBF', text: '#744210', icon: 'ri-tools-fill', color: '#D69E2E' };
      default:
        return { bg: '#E2E8F0', text: '#1A365D', icon: 'ri-question-fill', color: '#4299E1' };
    }
  };

  return (
    <div className="gs-container">
      <Sidebar />
      <main className="gs-main-content">
        <div className="gs-dashboard-card">
          {/* En-tête de page */}
          <div className="gs-page-header">
  <div className="gs-header-content">
    <div className="gs-title-wrapper">
      <div className="gs-title-icon-container" style={{ 
        background: 'linear-gradient(135deg, #2563EB 0%, #1E40AF 100%)',
        boxShadow: '0 4px 8px rgba(30, 64, 175, 0.2)',
        borderRadius: '12px'
      }}>
        <i className="ri-flashlight-line gs-main-icon" style={{ 
          color: 'rgba(255, 255, 255, 0.9)',
          fontSize: '1.5rem',
          textShadow: '0 0 8px rgba(255, 255, 255, 0.4)'
        }}></i>
      </div>
      <div>
        <h1 className="gs-main-title" style={{ 
          color: '#1E293B',
          fontWeight: 700,
          letterSpacing: '-0.5px'
        }}>
          Gestionnaire d'Éclairage
          <span className="gs-title-underline" style={{ 
            background: 'linear-gradient(135deg, #2563EB 0%, #1E40AF 100%)',
            height: '4px',
            borderRadius: '2px',
            display: 'block',
            width: '120px',
            marginTop: '8px'
          }}></span>
        </h1>
        <p className="gs-subtitle" style={{ 
          color: '#64748B',
          fontSize: '0.95rem',
          marginTop: '4px'
        }}>
          Contrôlez et optimisez votre réseau d'éclairage public
        </p>
      </div>
    </div>
    <button className="gs-add-site-btn gs-btn-primary" style={{ 
      background: 'linear-gradient(135deg, #2563EB 0%, #1E40AF 100%)',
      color: 'white',
      border: 'none',
      boxShadow: '0 2px 6px rgba(245, 158, 11, 0.25)',
      transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
      borderRadius: '8px',
      padding: '10px 16px',
      fontWeight: 600,
      display: 'flex',
      alignItems: 'center',
      gap: '8px'
    }}
    onMouseEnter={(e) => {
      e.currentTarget.style.transform = 'translateY(-2px)';
      e.currentTarget.style.boxShadow = '0 4px 8px rgba(245, 158, 11, 0.3)';
    }}
    onMouseLeave={(e) => {
      e.currentTarget.style.transform = 'translateY(0)';
      e.currentTarget.style.boxShadow = '0 2px 6px rgba(245, 158, 11, 0.25)';
    }}>
      <i className="ri-add-circle-line" style={{ fontSize: '1.1rem' }}></i>
      <span>Ajouter un point</span>
    </button>
  </div>
</div>

          {/* Section Liste */}
          <div className="gs-card-header">
            <div className="gs-list-header-wrapper">
              <div className="gs-list-title-container">
                <i className="ri-list-check-2 gs-list-icon" style={{ color: '#2563EB', backgroundColor: '#DBEAFE' }}></i>
                <h2 className="gs-list-title">
                  Points Lumineux
                  <span className="gs-site-count" style={{ backgroundColor: '#2563EB', color: '#DBEAFE' }}>
                    {lightPoints.length} unité{lightPoints.length !== 1 ? 's' : ''}
                  </span>
                </h2>
              </div>
              <div className="gs-search-filter-container">
                <div className="gs-search-box">
                  <i className="ri-search-line gs-search-icon"></i>
                  <input
                    type="text"
                    placeholder="Rechercher un point lumineux..."
                    className="gs-search-input"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                  />
                  {searchTerm && (
                    <i 
                      className="ri-close-line gs-clear-icon" 
                      onClick={() => setSearchTerm('')}
                      style={{ cursor: 'pointer' }}
                    />
                  )}
                </div>
                <div className="gs-filter-group">
                  <button className="gs-filter-btn gs-btn-secondary">
                    <i className="ri-filter-3-line"></i>
                    <span>Filtrer</span>
                  </button>
                  <button className="gs-sort-btn gs-btn-secondary">
                    <i className="ri-arrow-up-down-line"></i>
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* Tableau des points lumineux */}
          <div className="gs-table-responsive">
            <table className="gs-sites-table">
              <thead>
                <tr>
                  <th>Nom du Point</th>
                  <th>Localisation</th>
                  <th>Type/Puissance</th>
                  <th>Status</th>
                  <th>Dernière Mise à Jour</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredPoints.map((point) => {
                  const statusStyle = getStatusStyle(point.status);
                  return (
                    <tr key={point.id}>
                      <td>
                        <div style={{ display: 'flex', alignItems: 'center' }}>
                          <i className="ri-lightbulb-flash-fill" style={{
                            color: '#FBBF24',
                            marginRight: '8px',
                            fontSize: '1.2rem'
                          }} />
                          {point.name}
                        </div>
                      </td>

                      <td>
                        <div style={{ display: 'flex', alignItems: 'center' }}>
                          <i className="ri-map-pin-2-fill" style={{
                            color: '#F56565',
                            marginRight: '8px',
                            cursor: 'pointer',
                            transition: 'transform 0.2s'
                          }}
                            onMouseEnter={(e) => e.currentTarget.style.transform = 'scale(1.2)'}
                            onMouseLeave={(e) => e.currentTarget.style.transform = 'scale(1)'}
                            title={`Localisation: ${point.location}`}
                          />
                          {point.location}
                        </div>
                      </td>

                      <td>
                        <div style={{ display: 'flex', alignItems: 'center' }}>
                          <span className="gs-tag" style={{ backgroundColor: '#EFF6FF', color: '#3B82F6' }}>
                            {point.type}
                          </span>
                          <span className="gs-tag" style={{ backgroundColor: '#ECFDF5', color: '#059669', marginLeft: '8px' }}>
                            {point.power}
                          </span>
                        </div>
                      </td>

                      <td>
                        <div style={{ display: 'flex', alignItems: 'center' }}>
                          <i
                            className={statusStyle.icon}
                            style={{
                              color: statusStyle.color,
                              marginRight: '8px',
                              fontSize: '1.2rem'
                            }}
                          />
                          <span
                            style={{
                              padding: '0.25rem 0.75rem',
                              borderRadius: '9999px',
                              fontSize: '0.75rem',
                              fontWeight: 600,
                              backgroundColor: statusStyle.bg,
                              color: statusStyle.text,
                              textTransform: 'capitalize'
                            }}
                          >
                            {point.status}
                          </span>
                        </div>
                      </td>

                      <td>
                        <div style={{ display: 'flex', alignItems: 'center' }}>
                          <i className="ri-history-line" style={{
                            color: '#718096',
                            marginRight: '8px'
                          }} />
                          {point.lastUpdate}
                        </div>
                      </td>

                      <td>
                        <div className="gs-action-buttons" style={{ display: 'flex', gap: '0.5rem' }}>
                          <button style={{
                            background: 'none',
                            border: 'none',
                            color: '#4299E1',
                            cursor: 'pointer',
                            padding: '0.5rem',
                            borderRadius: '50%',
                            transition: 'all 0.2s'
                          }}
                            onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#EBF8FF'}
                            onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'transparent'}>
                            <i className="ri-edit-line" style={{ fontSize: '1.2rem' }} />
                          </button>

                          <button style={{
                            background: 'none',
                            border: 'none',
                            color: '#F56565',
                            cursor: 'pointer',
                            padding: '0.5rem',
                            borderRadius: '50%',
                            transition: 'all 0.2s'
                          }}
                            onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#FFF5F5'}
                            onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
                            onClick={() => handleDelete(point.id)}>
                            <i className="ri-delete-bin-line" style={{ fontSize: '1.2rem' }} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          {/* Pied de tableau */}
          <div className="gs-table-footer">
            <div className="gs-pagination-info">
              Affichage 1-{filteredPoints.length} sur {filteredPoints.length} points lumineux
            </div>
            <div className="gs-pagination-controls">
              <button className="gs-pagination-btn" disabled>
                <i className="ri-arrow-left-s-line"></i>
              </button>
              <span>1</span>
              <button className="gs-pagination-btn" disabled={filteredPoints.length <= 5}>
                <i className="ri-arrow-right-s-line"></i>
              </button>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}

export default Eclairage;