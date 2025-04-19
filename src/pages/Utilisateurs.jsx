import React, { useState } from 'react';
import Sidebar from '../components/Sidebar';
import './cssP/test.css';

function Utilisateurs() {
  const [searchTerm, setSearchTerm] = useState('');
  
  // Données de démonstration pour les utilisateurs
  const utilisateurs = [
    {
      id: 1,
      nom: 'Dupont',
      prenom: 'Jean',
      email: 'jean.dupont@example.com',
      role: 'Administrateur',
      derniereConnexion: '2023-06-15 09:42',
      status: 'actif'
    },
    {
      id: 2,
      nom: 'Martin',
      prenom: 'Sophie',
      email: 'sophie.martin@example.com',
      role: 'Éditeur',
      derniereConnexion: '2023-06-14 14:30',
      status: 'actif'
    },
    {
      id: 3,
      nom: 'Bernard',
      prenom: 'Pierre',
      email: 'pierre.bernard@example.com',
      role: 'Contributeur',
      derniereConnexion: '2023-06-10 11:15',
      status: 'inactif'
    },
    {
      id: 4,
      nom: 'Petit',
      prenom: 'Marie',
      email: 'marie.petit@example.com',
      role: 'Lecteur',
      derniereConnexion: '2023-05-28 16:20',
      status: 'suspendu'
    },
    {
      id: 5,
      nom: 'Durand',
      prenom: 'Luc',
      email: 'luc.durand@example.com',
      role: 'Modérateur',
      derniereConnexion: '2023-06-15 08:05',
      status: 'actif'
    }
  ];

  const filteredUsers = utilisateurs.filter(user => 
    user.nom.toLowerCase().includes(searchTerm.toLowerCase()) ||
    user.prenom.toLowerCase().includes(searchTerm.toLowerCase()) ||
    user.email.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const getStatusStyle = (status) => {
    switch(status) {
      case 'actif':
        return { bg: '#D1FAE5', text: '#065F46', icon: 'ri-user-follow-fill', color: '#10B981' };
      case 'inactif':
        return { bg: '#E5E7EB', text: '#4B5563', icon: 'ri-user-unfollow-line', color: '#6B7280' };
      case 'suspendu':
        return { bg: '#FEE2E2', text: '#991B1B', icon: 'ri-user-forbid-line', color: '#EF4444' };
      default:
        return { bg: '#E5E7EB', text: '#1F2937', icon: 'ri-user-line', color: '#6B7280' };
    }
  };

  const getRoleStyle = (role) => {
    switch(role) {
      case 'Administrateur':
        return { bg: '#DBEAFE', text: '#1E40AF', icon: 'ri-shield-user-fill' };
      case 'Modérateur':
        return { bg: '#E0F2FE', text: '#0369A1', icon: 'ri-user-star-fill' };
      case 'Éditeur':
        return { bg: '#D1FAE5', text: '#047857', icon: 'ri-edit-2-fill' };
      case 'Contributeur':
        return { bg: '#FEF3C7', text: '#92400E', icon: 'ri-team-fill' };
      case 'Lecteur':
        return { bg: '#ECFDF5', text: '#059669', icon: 'ri-eye-fill' };
      default:
        return { bg: '#E5E7EB', text: '#4B5563', icon: 'ri-user-line' };
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
                <div className="gs-title-icon-container" style={{background: 'linear-gradient(135deg, #10b981 0%, #047857 100%)'}}>
                  <i className="ri-user-settings-line gs-main-icon"></i>
                </div>
                <div>
                  <h1 className="gs-main-title">
                    Gestionnaire d'Utilisateurs
                    <span className="gs-title-underline" style={{background: 'linear-gradient(90deg, #10b981 0%, #047857 100%)'}}></span>
                  </h1>
                  <p className="gs-subtitle">Administrez les accès et permissions de votre organisation</p>
                </div>
              </div>
              <button className="gs-add-site-btn gs-btn-primary" style={{background: 'linear-gradient(135deg, #10b981 0%, #047857 100%)'}}>
                <i className="ri-user-add-line"></i>
                <span>Nouvel utilisateur</span>
              </button>
            </div>
          </div>

          {/* Section Liste */}
          <div className="gs-card-header">
            <div className="gs-list-header-wrapper">
              <div className="gs-list-title-container">
                <i className="ri-team-line gs-list-icon" style={{color: '#10b981', backgroundColor: '#d1fae5'}}></i>
                <h2 className="gs-list-title">
                  Utilisateurs Actifs
                  <span className="gs-site-count" style={{backgroundColor: '#d1fae5', color: '#047857'}}>
                    {utilisateurs.filter(u => u.status === 'actif').length} actifs
                  </span>
                </h2>
              </div>
              <div className="gs-search-filter-container">
                <div className="gs-search-box">
                  <i className="ri-search-line gs-search-icon"></i>
                  <input 
                    type="text" 
                    placeholder="Rechercher un utilisateur..." 
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
                  <button className="gs-export-btn gs-btn-secondary">
                    <i className="ri-download-line"></i>
                    <span>Exporter</span>
                  </button>
                </div>
              </div>
            </div>
          </div>
          
          {/* Tableau des utilisateurs */}
          <div className="gs-table-responsive">
            <table className="gs-sites-table">
              <thead>
                <tr>
                  <th>Utilisateur</th>
                  <th>Email</th>
                  <th>Rôle</th>
                  <th>Dernière connexion</th>
                  <th>Statut</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredUsers.map((user) => {
                  const statusStyle = getStatusStyle(user.status);
                  const roleStyle = getRoleStyle(user.role);
                  return (
                    <tr key={user.id}>
                      <td>
                        <div style={{ display: 'flex', alignItems: 'center' }}>
                          <div style={{
                            width: '36px',
                            height: '36px',
                            borderRadius: '50%',
                            backgroundColor: '#ECFDF5',
                            color: '#10B981',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            marginRight: '12px',
                            fontWeight: 600
                          }}>
                            {user.prenom.charAt(0)}{user.nom.charAt(0)}
                          </div>
                          <div>
                            <div style={{ fontWeight: 500 }}>{user.prenom} {user.nom}</div>
                            <div style={{ fontSize: '0.8rem', color: '#6B7280' }}>ID: {user.id}</div>
                          </div>
                        </div>
                      </td>
                      
                      <td>
                        <div style={{ display: 'flex', alignItems: 'center' }}>
                          <i className="ri-mail-line" style={{ 
                            color: '#6B7280',
                            marginRight: '8px'
                          }} />
                          <span style={{ fontSize: '0.9rem' }}>{user.email}</span>
                        </div>
                      </td>

                      <td>
                        <div style={{ display: 'flex', alignItems: 'center' }}>
                          <i className={roleStyle.icon} style={{ 
                            color: roleStyle.text,
                            marginRight: '8px'
                          }} />
                          <span style={{
                            padding: '4px 8px',
                            borderRadius: '6px',
                            backgroundColor: roleStyle.bg,
                            color: roleStyle.text,
                            fontSize: '0.85rem',
                            fontWeight: 500
                          }}>
                            {user.role}
                          </span>
                        </div>
                      </td>

                      <td>
                        <div style={{ display: 'flex', alignItems: 'center' }}>
                          <i className="ri-time-line" style={{ 
                            color: '#6B7280',
                            marginRight: '8px'
                          }} />
                          <span style={{ fontSize: '0.9rem' }}>{user.derniereConnexion}</span>
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
                            {user.status === 'actif' ? 'Actif' : 
                             user.status === 'inactif' ? 'Inactif' : 'Suspendu'}
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

                          <button style={{ 
                            background: 'none',
                            border: 'none',
                            color: '#10B981',
                            cursor: 'pointer',
                            padding: '0.5rem',
                            borderRadius: '50%',
                            transition: 'all 0.2s'
                          }}
                          onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#ECFDF5'}
                          onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'transparent'}>
                            <i className="ri-settings-3-line" style={{ fontSize: '1.2rem' }} />
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
              Affichage 1-{filteredUsers.length} sur {filteredUsers.length} utilisateurs
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

export default Utilisateurs;