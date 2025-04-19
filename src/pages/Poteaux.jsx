import React from 'react'
import Sidebar from '../components/Sidebar';
import './cssP/test.css';
function Poteaux() {
  return (
    <div className="gs-container">
    <Sidebar />
    <main className="gs-main-content">
      <div className="gs-dashboard-card">
        {/* Titre "Gestion des Sites" amélioré */}
        <div className="gs-page-header">
  <div className="gs-header-content">
    <div className="gs-title-wrapper">
      <div className="gs-title-icon-container" style={{background: 'linear-gradient(135deg, #f59e0b 0%, #b45309 100%)'}}>
        <i className="ri-lightbulb-line gs-main-icon"></i>
      </div>
      <div>
        <h1 className="gs-main-title">
          Gestion des Poteaux
          <span className="gs-title-underline" style={{background: 'linear-gradient(90deg, #f59e0b 0%, #b45309 100%)'}}></span>
        </h1>
        <p className="gs-subtitle">Administrez l'ensemble de vos poteaux d'éclairage</p>
      </div>
    </div>
    <button className="gs-add-site-btn gs-btn-primary" style={{background: 'linear-gradient(135deg, #f59e0b 0%, #b45309 100%)'}}>
      <i className="ri-add-circle-line"></i>
      <span>Nouveau poteau</span>
    </button>
  </div>
</div>

{/* Titre "Liste des Poteaux" amélioré */}
<div className="gs-card-header">
  <div className="gs-list-header-wrapper">
    <div className="gs-list-title-container">
      <i className="ri-list-check-2 gs-list-icon" style={{color: '#f59e0b', backgroundColor: '#fef9c3'}}></i>
      <h2 className="gs-list-title">
        Liste des Poteaux
        <span className="gs-site-count" style={{backgroundColor: '#fef9c3', color: '#b45309'}}>42 poteaux</span>
      </h2>
    </div>
    <div className="gs-search-filter-container">
      <div className="gs-search-box">
        <i className="ri-search-line gs-search-icon"></i>
        <input 
          type="text" 
          placeholder="Rechercher un poteau..." 
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
        <th>ID du poteau</th>
        <th>reference</th>
        <th>Code</th>
        <th>Site</th>
        <th>Ligne</th>
        <th>Localisation</th>
        <th>Données</th>
        <th>Connexion</th>
        <th>Statut</th>
        <th>Niveau lumière</th>
        <th>Actions</th>
      </tr>
    </thead>
    <tbody>
      {[...Array(5)].map((_, i) => {
        const status = i % 2 === 0 ? 'actif' : 'inactif';
        const alert = i % 3 === 0 ? 'critique' : i % 2 === 0 ? 'warning' : 'ok';
        const connection = i % 4 === 0 ? 'instable' : 'stable';
        
        return (
          <tr key={i}>
            {/* Nom */}
            <td>
              <div style={{ display: 'flex', alignItems: 'center' }}>
                <i className="ri-lightbulb-line" style={{ 
                  color: '#f59e0b',
                  marginRight: '8px',
                  fontSize: '1.2rem'
                }} />
                SL150W00000{i+1}
              </div>
            </td>
            
            {/* Description */}
            <td>Smart Lumax 150W - Prototype {i+1}</td>
            
            {/* Code */}
            <td>
  <div 
    style={{
      maxWidth: '150px',
      overflowX: 'auto',
      whiteSpace: 'nowrap',
      backgroundColor: '#fef9c3',
      borderRadius: '4px',
      padding: '4px 8px',
      fontFamily: 'monospace',
      color: '#b45309',
      scrollbarWidth: 'thin',
      cursor: 'pointer',
      position: 'relative'
    }}
    title="FFFFF1000019E{i+1}" // Tooltip complet au survol
    onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#fef08a'}
    onMouseLeave={(e) => e.currentTarget.style.backgroundColor = '#fef9c3'}
  >
    FFFFFF1000019E{i+1}
  </div>
</td>
            
            {/* Site */}
            <td>Charguia {i+1}</td>
            
            {/* Ligne */}
            <td>Ligne {i+1}</td>
            
            {/* Localisation */}
            <td>
              <div style={{ display: 'flex', alignItems: 'center' }}>
                <i className="ri-map-pin-2-fill" style={{ 
                  color: '#ef4444',
                  marginRight: '8px',
                  cursor: 'pointer'
                }} />
                Zone {['A', 'B', 'C', 'D', 'E'][i]}
              </div>
            </td>
            
            {/* Données */}
            <td>
              <i className="ri-database-2-line" style={{
                color: '#06b6d4',
                cursor: 'pointer',
                fontSize: '1.3rem'
              }} />
            </td>
            
            
            
            {/* Connexion */}
            <td>
              <span style={{
                display: 'inline-flex',
                alignItems: 'center',
                padding: '4px 8px',
                borderRadius: '12px',
                backgroundColor: connection === 'instable' ? '#fef3c7' : '#ecfdf5',
                color: connection === 'instable' ? '#d97706' : '#059669'
              }}>
                <i className={`ri-${connection === 'instable' ? 'wifi-off-line' : 'wifi-line'}`} 
                   style={{ marginRight: '4px' }} />
                {connection === 'instable' ? 'Instable' : 'Stable'}
              </span>
            </td>
            
            {/* Statut */}
            <td>
              <span style={{
                display: 'inline-flex',
                alignItems: 'center',
                padding: '4px 8px',
                borderRadius: '12px',
                backgroundColor: status === 'actif' ? '#ecfdf5' : '#fee2e2',
                color: status === 'actif' ? '#059669' : '#dc2626'
              }}>
                <i className={`ri-${status === 'actif' ? 'checkbox-circle-fill' : 'close-circle-fill'}`} 
                   style={{ marginRight: '4px' }} />
                {status === 'actif' ? 'Actif' : 'Inactif'}
              </span>
            </td>
            
            {/* Niveau lumière */}
            <td>
              <div style={{
                width: '100%',
                backgroundColor: '#e2e8f0',
                borderRadius: '4px',
                height: '8px'
              }}>
                <div style={{
                  width: `${Math.floor(Math.random() * 60) + 40}%`,
                  height: '100%',
                  backgroundColor: '#f59e0b',
                  borderRadius: '4px'
                }}></div>
              </div>
              <span style={{ fontSize: '0.8rem', marginTop: '4px', display: 'inline-block' }}>
                {Math.floor(Math.random() * 60) + 40}%
              </span>
            </td>
            
            {/* Actions */}
            <td>
              <div className="gs-action-buttons" style={{ display: 'flex', gap: '0.5rem' }}>
                <button style={{ 
                  background: 'none',
                  border: 'none',
                  color: '#3b82f6',
                  cursor: 'pointer',
                  padding: '0.5rem',
                  borderRadius: '50%',
                  transition: 'all 0.2s'
                }}
                onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#dbeafe'}
                onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'transparent'}>
                  <i className="ri-edit-line" style={{ fontSize: '1.2rem' }} />
                </button>
                
                <button style={{ 
                  background: 'none',
                  border: 'none',
                  color: '#ef4444',
                  cursor: 'pointer',
                  padding: '0.5rem',
                  borderRadius: '50%',
                  transition: 'all 0.2s'
                }}
                onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#fee2e2'}
                onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'transparent'}>
                  <i className="ri-delete-bin-line" style={{ fontSize: '1.2rem' }} />
                </button>

                <button style={{ 
                  background: 'none',
                  border: 'none',
                  color: '#06b6d4',
                  cursor: 'pointer',
                  padding: '0.5rem',
                  borderRadius: '50%',
                  transition: 'all 0.2s'
                }}
                onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#ecfeff'}
                onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'transparent'}>
                  <i className="ri-eye-line" style={{ fontSize: '1.2rem' }} />
                </button>
              </div>
            </td>
          </tr>
        );
      })}
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

export default Poteaux
