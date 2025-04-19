import React from 'react';
import Sidebar from '../components/Sidebar';
import './cssP/test.css';

function Lignes() {
  return (
    <div className="gs-container">
      <Sidebar />
      <main className="gs-main-content">
        <div className="gs-dashboard-card">
          {/* En-tête */}
          <div className="gs-page-header">
            <div className="gs-header-content">
              <div className="gs-title-wrapper">
                <div className="gs-title-icon-container" style={{background: 'linear-gradient(135deg, #06b6d4 0%, #0e7490 100%)'}}>
                  <i className="ri-route-line gs-main-icon"></i>
                </div>
                <div>
                  <h1 className="gs-main-title">
                    Gestion des Lignes
                    <span className="gs-title-underline" style={{background: 'linear-gradient(90deg, #06b6d4 0%, #0e7490 100%)'}}></span>
                  </h1>
                  <p className="gs-subtitle">Administrez l'ensemble de vos lignes de transport</p>
                </div>
              </div>
              <button className="gs-add-site-btn gs-btn-primary" style={{background: 'linear-gradient(135deg, #06b6d4 0%, #0e7490 100%)'}}>
                <i className="ri-add-circle-line"></i>
                <span>Nouvelle ligne</span>
              </button>
            </div>
          </div>

          {/* Barre de filtres */}
          <div className="gs-card-header">
            <div className="gs-list-header-wrapper">
              <div className="gs-list-title-container">
                <i className="ri-list-check-2 gs-list-icon" style={{color: '#06b6d4', backgroundColor: '#ecfeff'}}></i>
                <h2 className="gs-list-title">
                  Liste des Lignes
                  <span className="gs-site-count" style={{backgroundColor: '#ecfeff', color: '#0e7490'}}>15 lignes</span>
                </h2>
              </div>
              <div className="gs-search-filter-container">
                <div className="gs-search-box">
                  <i className="ri-search-line gs-search-icon"></i>
                  <input 
                    type="text" 
                    placeholder="Rechercher une ligne..." 
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
          
          {/* Tableau */}
          <div className="gs-table-responsive">
            <table className="gs-sites-table">
              <thead>
                <tr>
                  <th>Nom de la ligne</th>
                  <th>Code</th>
                  <th>Statut</th>
                  <th>Site</th>
                  <th>Zone</th>
                  <th>Points</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {[...Array(5)].map((_, i) => (
                  <tr key={i}>
                    <td>
                      <div className="gs-line-name">
                        <i className="ri-route-line" style={{color: '#06b6d4'}} />
                        <div>
                          <div>Ligne {String.fromCharCode(65 + i)}</div>
                          <small>Type: Urbaine</small>
                        </div>
                      </div>
                    </td>
                    <td>
                      <span className="gs-code-badge" style={{backgroundColor: '#ecfeff', color: '#0e7490'}}>
                        LN-{1000 + i}
                      </span>
                    </td>
                    <td>
                      <span className={`gs-status-badge ${i % 2 === 0 ? 'active' : 'inactive'}`}
                        style={{
                          backgroundColor: i % 2 === 0 ? '#ccfbf1' : '#f0fdf4',
                          color: i % 2 === 0 ? '#0d9488' : '#15803d'
                        }}>
                        {i % 2 === 0 ? 'Actif' : 'Inactif'}
                      </span>
                    </td>
                    <td>
                      <div className="gs-site-cell">
                        <i className="ri-building-2-fill" style={{color: '#06b6d4'}} />
                        <span>Site {i + 1}</span>
                      </div>
                    </td>
                    <td>
                      <div className="gs-zone-cell">
                        <i className="ri-map-pin-2-fill" style={{color: '#0e7490'}} />
                        <span>{['Nord', 'Sud', 'Est', 'Ouest', 'Centre'][i]}</span>
                      </div>
                    </td>
                    <td>
                      <div className="gs-points-cell">
                        <i className="ri-node-tree" style={{color: '#0891b2'}} />
                        <span>{Math.floor(Math.random() * 20) + 5}</span>
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
        
       
        <button className="gs-action-btn detail" style={{ 
  background: 'none',
  border: 'none',
  color: '#03e706', 
  cursor: 'pointer',
  padding: '0.5rem',
  borderRadius: '50%',
  transition: 'all 0.2s'
}}
onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#ecfeff'} // Bleu très clair au survol
onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'transparent'}>
  <i className="ri-eye-line" style={{ fontSize: '1.2rem' }} title="Voir les détails" />
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
          
          {/* Pied de tableau */}
          <div className="gs-table-footer" style={{borderColor: '#e0f2fe'}}>
            <div className="gs-pagination-info" style={{color: '#0e7490'}}>
              Affichage 1-5 sur 15 lignes
            </div>
            <div className="gs-pagination-controls">
              <button className="gs-pagination-btn" style={{borderColor: '#a5f3fc'}}>
                <i className="ri-arrow-left-s-line" style={{color: '#06b6d4'}} />
              </button>
              <span style={{color: '#0e7490'}}>1</span>
              <button className="gs-pagination-btn" style={{borderColor: '#a5f3fc'}}>
                <i className="ri-arrow-right-s-line" style={{color: '#06b6d4'}} />
              </button>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}

export default Lignes;