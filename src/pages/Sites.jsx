import React from 'react'
import Sidebar from '../components/Sidebar';
import './cssP/test.css';
function Sites() {
  return (
    <div className="gs-container">
    <Sidebar />
    <main className="gs-main-content">
      <div className="gs-dashboard-card">
        {/* Titre "Gestion des Sites" amélioré */}
        <div className="gs-page-header">
          <div className="gs-header-content">
            <div className="gs-title-wrapper">
              <div className="gs-title-icon-container">
                <i className="ri-global-line gs-main-icon"></i>
              </div>
              <div>
                <h1 className="gs-main-title">
                  Gestion des Sites
                  <span className="gs-title-underline"></span>
                </h1>
                <p className="gs-subtitle">Administrez l'ensemble de vos sites distants</p>
              </div>
            </div>
            <button className="gs-add-site-btn gs-btn-primary">
              <i className="ri-add-circle-line"></i>
              <span>Nouveau site</span>
            </button>
          </div>
        </div>
        
        {/* Titre "Liste des Sites" amélioré */}
        <div className="gs-card-header">
          <div className="gs-list-header-wrapper">
            <div className="gs-list-title-container">
              <i className="ri-table-2 gs-list-icon"></i>
              <h2 className="gs-list-title">
                Liste des Sites
                <span className="gs-site-count">15 sites</span>
              </h2>
            </div>
            <div className="gs-search-filter-container">
              <div className="gs-search-box">
                <i className="ri-search-line gs-search-icon"></i>
                <input 
                  type="text" 
                  placeholder="Rechercher un site..." 
                  className="gs-search-input"
                />
                <i className="ri-close-line gs-clear-icon"></i>
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
        
        <div className="gs-table-responsive">
          <table className="gs-sites-table">
            <thead>
              <tr>
                <th>Nom du Site</th>
                <th>Localisation</th>
                <th>Status</th>
                <th>Data</th>
                <th>Dernière Mise à Jour</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
{[...Array(5)].map((_, i) => (
  <tr key={i}>
    <td>
      <div style={{ display: 'flex', alignItems: 'center' }}>
        <i className="ri-building-2-fill" style={{ 
          color: '#4C51BF', 
          marginRight: '8px',
          fontSize: '1.2rem'
        }} />
        Site {i + 1}
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
        title={`Localisation: ${['Paris', 'Lyon', 'Marseille', 'Bordeaux', 'Lille'][i]}`} />
        {['Paris', 'Lyon', 'Marseille', 'Bordeaux', 'Lille'][i]}
      </div>
    </td>

    <td>
<div style={{ display: 'flex', alignItems: 'center' }}>
  <i
    className={`ri-${i % 2 === 0 ? 'flashlight-fill' : 'error-warning-fill'}`}
    style={{
      color: i % 2 === 0 ? '#48BB78' : '#E53E3E', // vert si actif, rouge si panne
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
      backgroundColor: i % 2 === 0 ? '#C6F6D5' : '#FED7D7',
      color: i % 2 === 0 ? '#22543D' : '#822727'
    }}
  >
    {i % 2 === 0 ? 'Actif' : 'Panne'}
  </span>
</div>
</td>


    <td>
      <i className="ri-database-2-fill" style={{ 
        color: '#667EEA',
        fontSize: '1.3rem',
        cursor: 'pointer',
        transition: 'transform 0.2s'
      }} 
      onMouseEnter={(e) => e.currentTarget.style.transform = 'scale(1.2)'}
      onMouseLeave={(e) => e.currentTarget.style.transform = 'scale(1)'}
      title="Accéder aux données techniques" />
    </td>

    <td>
      <div style={{ display: 'flex', alignItems: 'center' }}>
        <i className="ri-history-line" style={{ 
          color: '#718096',
          marginRight: '8px'
        }} />
        2023-06-{10 + i}
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
        onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'transparent'}>
          <i className="ri-delete-bin-line" style={{ fontSize: '1.2rem' }} />
        </button>
      </div>
    </td>
  </tr>
))}
</tbody>
          </table>
        </div>
        
        <div className="gs-table-footer">
          <div className="gs-pagination-info">
            Affichage 1-5 sur 15 sites
          </div>
          <div className="gs-pagination-controls">
            <button className="gs-pagination-btn">
              <i className="ri-arrow-left-s-line"></i>
            </button>
            <span>1</span>
            <button className="gs-pagination-btn">
              <i className="ri-arrow-right-s-line"></i>
            </button>
          </div>
        </div>
      </div>
    </main>
  </div>
  )
}

export default Sites
