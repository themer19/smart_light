import React, { useState } from 'react';
import Sidebar from '../components/Sidebar';
import './cssP/test.css';

function Licences() {
  const [searchTerm, setSearchTerm] = useState('');
  
  // Données de démonstration pour les licences
  const licences = [
    {
      id: 1,
      logiciel: 'Adobe Creative Cloud',
      type: 'Abonnement',
      cle: 'ADB-CC-2023-XXXX',
      sites: 3,
      expiration: '2023-12-31',
      status: 'active'
    },
    {
      id: 2,
      logiciel: 'Microsoft Office 365',
      type: 'Entreprise',
      cle: 'MS-365-ENT-XXXX',
      sites: 15,
      expiration: '2024-06-30',
      status: 'active'
    },
    {
      id: 3,
      logiciel: 'AutoCAD 2023',
      type: 'Perpétuelle',
      cle: 'AUTOD-23-PERP-XX',
      sites: 2,
      expiration: 'Illimitée',
      status: 'expiree'
    },
    {
      id: 4,
      logiciel: 'Windows Server 2019',
      type: 'Volume',
      cle: 'WIN-SRV-2019-XX',
      sites: 5,
      expiration: '2025-01-15',
      status: 'active'
    },
    {
      id: 5,
      logiciel: 'VMware vSphere',
      type: 'Abonnement',
      cle: 'VMW-VS-ENT-XXXX',
      sites: 8,
      expiration: '2023-09-30',
      status: 'bientot_expiree'
    }
  ];

  const filteredLicences = licences.filter(licence => 
    licence.logiciel.toLowerCase().includes(searchTerm.toLowerCase()) ||
    licence.cle.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const getStatusStyle = (status) => {
    switch(status) {
      case 'active':
        return { bg: '#D1FAE5', text: '#065F46', icon: 'ri-checkbox-circle-fill', color: '#10B981' };
      case 'expiree':
        return { bg: '#FEE2E2', text: '#991B1B', icon: 'ri-close-circle-fill', color: '#EF4444' };
      case 'bientot_expiree':
        return { bg: '#FEF3C7', text: '#92400E', icon: 'ri-alert-fill', color: '#F59E0B' };
      default:
        return { bg: '#E5E7EB', text: '#1F2937', icon: 'ri-question-fill', color: '#6B7280' };
    }
  };

  return (
    <div className="gs-container">
      <Sidebar />
      <main className="gs-main-content">
        <div className="gs-dashboard-card">
          {/* En-tête */}
          <div className="gs-page-header">
            <div className="gs-header-content">
              <div className="gs-title-wrapper">
                <div className="gs-title-icon-container" style={{background: 'linear-gradient(135deg, #3b82f6 0%, #1d4ed8 100%)'}}>
                  <i className="ri-key-2-line gs-main-icon"></i>
                </div>
                <div>
                  <h1 className="gs-main-title">
                    Gestionnaire de Licences
                    <span className="gs-title-underline" style={{background: 'linear-gradient(90deg, #3b82f6 0%, #1d4ed8 100%)'}}></span>
                  </h1>
                  <p className="gs-subtitle">Suivez et contrôlez toutes vos licences logicielles</p>
                </div>
              </div>
              <button className="gs-add-site-btn gs-btn-primary" style={{background: 'linear-gradient(135deg, #3b82f6 0%, #1d4ed8 100%)'}}>
                <i className="ri-file-add-line"></i>
                <span>Nouvelle licence</span>
              </button>
            </div>
          </div>

          {/* Section Liste */}
          <div className="gs-card-header">
            <div className="gs-list-header-wrapper">
              <div className="gs-list-title-container">
                <i className="ri-license-line gs-list-icon" style={{color: '#3b82f6', backgroundColor: '#dbeafe'}}></i>
                <h2 className="gs-list-title">
                  Licences Actives
                  <span className="gs-site-count" style={{backgroundColor: '#dbeafe', color: '#1d4ed8'}}>
                    {licences.length} licence{licences.length !== 1 ? 's' : ''}
                  </span>
                </h2>
              </div>
              <div className="gs-search-filter-container">
                <div className="gs-search-box">
                  <i className="ri-search-line gs-search-icon"></i>
                  <input 
                    type="text" 
                    placeholder="Rechercher une licence..." 
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
          
          {/* Tableau des licences */}
          <div className="gs-table-responsive">
            <table className="gs-sites-table">
              <thead>
                <tr>
                  <th>Logiciel</th>
                  <th>Type</th>
                  <th>Clé de licence</th>
                  <th>Sites</th>
                  <th>Expiration</th>
                  <th>Statut</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredLicences.map((licence) => {
                  const statusStyle = getStatusStyle(licence.status);
                  return (
                    <tr key={licence.id}>
                      <td>
                        <div style={{ display: 'flex', alignItems: 'center' }}>
                          <i className="ri-computer-line" style={{ 
                            color: '#3B82F6', 
                            marginRight: '8px',
                            fontSize: '1.2rem'
                          }} />
                          {licence.logiciel}
                        </div>
                      </td>
                      
                      <td>
                        <span style={{
                          padding: '4px 8px',
                          borderRadius: '6px',
                          backgroundColor: '#EFF6FF',
                          color: '#1D4ED8',
                          fontSize: '0.85rem',
                          fontWeight: 500
                        }}>
                          {licence.type}
                        </span>
                      </td>

                      <td>
                        <div style={{ 
                          fontFamily: 'monospace',
                          color: '#6B7280',
                          fontSize: '0.9rem'
                        }}>
                          {licence.cle}
                        </div>
                      </td>

                      <td>
                        <div style={{ 
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          width: '32px',
                          height: '32px',
                          borderRadius: '50%',
                          backgroundColor: '#E0E7FF',
                          color: '#4F46E5',
                          fontWeight: 600
                        }}>
                          {licence.sites}
                        </div>
                      </td>

                      <td>
                        <div style={{ display: 'flex', alignItems: 'center' }}>
                          <i className="ri-calendar-line" style={{ 
                            color: '#6B7280',
                            marginRight: '8px'
                          }} />
                          {licence.expiration}
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
                              padding: '4px 10px',
                              borderRadius: '9999px',
                              fontSize: '0.75rem',
                              fontWeight: 600,
                              backgroundColor: statusStyle.bg,
                              color: statusStyle.text,
                              textTransform: 'capitalize'
                            }}
                          >
                            {licence.status === 'active' ? 'Active' : 
                             licence.status === 'expiree' ? 'Expirée' : 'Bientôt expirée'}
                          </span>
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
                  );
                })}
              </tbody>
            </table>
          </div>
          
          <div className="gs-table-footer">
            <div className="gs-pagination-info">
              Affichage 1-{filteredLicences.length} sur {filteredLicences.length} licences
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
  );
}

export default Licences;