import React, { useState, useEffect, useMemo } from 'react';
import clsx from 'clsx';
import Sidebar from '../components/Sidebar';

import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import './cssP/Utilisateurs.css';

function Utilisateurs() {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [editUtilisateur, setEditUtilisateur] = useState(null);
  const [dataPopup, setDataPopup] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [isMobile, setIsMobile] = useState(window.innerWidth < 768);
  const [utilisateurs, setUtilisateurs] = useState([
    { _id: 'utilisateur_1', nom: 'Jean Dupont', role: 'Admin', site: { nom: 'Site Alpha' }, email: 'jean.dupont@example.com', statut: 'Actif' },
    { _id: 'utilisateur_2', nom: 'Marie Martin', role: 'Technicien', site: { nom: 'Site Beta' }, email: 'marie.martin@example.com', statut: 'Inactif' },
    { _id: 'utilisateur_3', nom: 'Pierre Lefèvre', role: 'Superviseur', site: { nom: 'Site Gamma' }, email: 'pierre.lefevre@example.com', statut: 'Actif' },
    { _id: 'utilisateur_4', nom: 'Sophie Dubois', role: 'Admin', site: { nom: 'Site Alpha' }, email: 'sophie.dubois@example.com', statut: 'Suspendu' },
    { _id: 'utilisateur_5', nom: 'Luc Durand', role: 'Technicien', site: { nom: 'Site Delta' }, email: 'luc.durand@example.com', statut: 'Actif' },
    { _id: 'utilisateur_6', nom: 'Claire Renault', role: 'Superviseur', site: { nom: 'Site Beta' }, email: 'claire.renault@example.com', statut: 'Inactif' },
    { _id: 'utilisateur_7', nom: 'Antoine Morel', role: 'Admin', site: { nom: 'Site Gamma' }, email: 'antoine.morel@example.com', statut: 'Actif' },
    { _id: 'utilisateur_8', nom: 'Emma Bernard', role: 'Technicien', site: { nom: 'Site Delta' }, email: 'emma.bernard@example.com', statut: 'Suspendu' },
    { _id: 'utilisateur_9', nom: 'Louis Gauthier', role: 'Superviseur', site: { nom: 'Site Alpha' }, email: 'louis.gauthier@example.com', statut: 'Actif' },
    { _id: 'utilisateur_10', nom: 'Julie Roy', role: 'Admin', site: { nom: 'Site Beta' }, email: 'julie.roy@example.com', statut: 'Inactif' },
    { _id: 'utilisateur_11', nom: 'Thomas Lemoine', role: 'Technicien', site: { nom: 'Site Gamma' }, email: 'thomas.lemoine@example.com', statut: 'Actif' },
    { _id: 'utilisateur_12', nom: 'Alice Petit', role: 'Superviseur', site: { nom: 'Site Delta' }, email: 'alice.petit@example.com', statut: 'Suspendu' },
  ]);
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const utilisateursPerPage = 10;

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

  const filteredUtilisateurs = useMemo(() => {
    return utilisateurs.filter(
      (utilisateur) =>
        utilisateur.nom.toLowerCase().includes(searchTerm.toLowerCase()) ||
        utilisateur.role.toLowerCase().includes(searchTerm.toLowerCase()) ||
        utilisateur.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (utilisateur.site?.nom || '').toLowerCase().includes(searchTerm.toLowerCase())
    );
  }, [utilisateurs, searchTerm]);

  const totalPages = Math.ceil(filteredUtilisateurs.length / utilisateursPerPage);
  const paginatedUtilisateurs = useMemo(() => {
    const startIndex = (currentPage - 1) * utilisateursPerPage;
    return filteredUtilisateurs.slice(startIndex, startIndex + utilisateursPerPage);
  }, [filteredUtilisateurs, currentPage]);

  const handlePageChange = (page) => {
    if (page >= 1 && page <= totalPages) {
      setCurrentPage(page);
    }
  };

  const handleOpenDataPopup = () => {
    setDataPopup(false);
    setTimeout(() => {
      setDataPopup(true);
    }, 10);
  };

  const handleCloseDataPopup = () => {
    setDataPopup(false);
  };

  const handleSaveUtilisateur = (utilisateurData) => {
    try {
      const newUtilisateur = {
        ...utilisateurData,
        _id: `utilisateur_${Date.now()}`,
        site: { nom: utilisateurData.site || 'Site non attribué' },
      };
      setUtilisateurs([...utilisateurs, newUtilisateur]);
      toast.success('Utilisateur créé avec succès !');
      setIsModalOpen(false);
    } catch (error) {
      toast.error('🚨 Une erreur est survenue lors de la création de l\'utilisateur');
      console.error('Erreur:', error);
    }
  };

  const handleEditUtilisateur = (utilisateurData) => {
    try {
      const updatedUtilisateurs = utilisateurs.map((utilisateur) =>
        utilisateur._id === editUtilisateur._id
          ? { ...utilisateurData, _id: editUtilisateur._id, site: { nom: utilisateurData.site || 'Site non attribué' } }
          : utilisateur
      );
      setUtilisateurs(updatedUtilisateurs);
      toast.success('Utilisateur modifié avec succès !');
      setIsEditModalOpen(false);
      setEditUtilisateur(null);
    } catch (error) {
      toast.error('🚨 Une erreur est survenue lors de la modification de l\'utilisateur');
      console.error('Erreur:', error);
    }
  };

  const handleDeleteUtilisateur = (utilisateurId) => {
    try {
      setUtilisateurs(utilisateurs.filter((utilisateur) => utilisateur._id !== utilisateurId));
      toast.success('Utilisateur supprimé avec succès !');
    } catch (error) {
      toast.error('🚨 Une erreur est survenue lors de la suppression de l\'utilisateur');
      console.error('Erreur:', error);
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

  const handleOpenEditModal = (utilisateur) => {
    setEditUtilisateur(utilisateur);
    setIsEditModalOpen(true);
  };

  return (
    <div className='utilisateur-page'>
    <div className="us-container" style={{ display: 'flex', minHeight: '100vh' }}>
      <Sidebar
        onToggle={handleSidebarToggle}
        className={clsx('us-sidebar', {
          'us-sidebar-open': sidebarOpen,
          'us-sidebar-collapsed': !sidebarOpen,
        })}
      />
      <main
        className={clsx('us-main-content', {
          'us-sidebar-collapsed': !sidebarOpen || isMobile,
        })}
        style={{
          flex: 1,
          marginLeft: 0,
          paddingLeft: 0,
          marginTop: '2rem',
        }}
      >
        <div className="us-dashboard-card">
          <div className="us-page-header">
            <div className="us-header-content">
              <div className="us-title-wrapper">
                <div className="us-title-icon-container">
                  <i className="ri-user-3-line us-main-icon"></i>
                </div>
                <div>
                  <h1 className="us-main-title">
                    Gestionnaire d'Utilisateurs
                    <span className="us-title-underline"></span>
                  </h1>
                  <p className="us-subtitle">Administrez l'ensemble de vos utilisateurs</p>
                </div>
              </div>
              <button
                className="us-add-utilisateur-btn us-btn-primary"
                onClick={() => setIsModalOpen(true)}
                aria-label="Ajouter un nouvel utilisateur"
              >
                <i className="ri-add-circle-line"></i>
                <span>Nouvel utilisateur</span>
              </button>
              {isModalOpen && (
                <AddUtilisateurModal onClose={() => setIsModalOpen(false)} onSave={handleSaveUtilisateur} />
              )}
              {isEditModalOpen && (
                <AddUtilisateurModal
                  onClose={() => {
                    setIsEditModalOpen(false);
                    setEditUtilisateur(null);
                  }}
                  onSave={handleEditUtilisateur}
                  initialData={editUtilisateur}
                />
              )}
            </div>
          </div>

          <div className="us-card-header">
            <div className="us-list-header-wrapper">
              <div className="us-list-title-container">
                <i className="ri-table-2 us-list-icon"></i>
                <h2 className="us-list-title">
                  Liste des Utilisateurs
                  <span className="us-utilisateur-count">{filteredUtilisateurs.length} utilisateur(s)</span>
                </h2>
              </div>
              <div className="us-search-filter-container">
                <div className="us-search-box">
                  <i className="ri-search-line us-search-icon"></i>
                  <input
                    id="utilisateur-search"
                    type="text"
                    placeholder="Rechercher un utilisateur..."
                    className="us-search-input"
                    value={searchTerm}
                    onChange={handleSearchChange}
                  />
                  {searchTerm && (
                    <i
                      className="ri-close-line us-clear-icon"
                      onClick={handleClearSearch}
                      aria-label="Effacer la recherche"
                    ></i>
                  )}
                </div>
                <div className="us-filter-group">
                  <button className="us-btn-secondary" aria-label="Filtrer les utilisateurs">
                    <i className="ri-filter-3-line"></i>
                    <span>Filtrer</span>
                  </button>
                  <button
                    className="us-sort-btn us-btn-secondary"
                    aria-label="Trier les utilisateurs"
                  >
                    <i className="ri-arrow-up-down-line"></i>
                  </button>
                </div>
              </div>
            </div>
          </div>

          {isMobile ? (
            <div className="us-utilisateur-cards">
              {paginatedUtilisateurs.length > 0 ? (
                paginatedUtilisateurs.map((utilisateur, i) => (
                  <div className="us-utilisateur-card" key={utilisateur._id}>
                    <div className="us-utilisateur-card-header">
                      <div className="us-utilisateur-card-title">
                        <span className="us-utilisateur-number">{(currentPage - 1) * utilisateursPerPage + i + 1}.</span>
                        <i className="ri-user-3-line" />
                        <span>{utilisateur.nom}</span>
                      </div>
                    </div>
                    <div className="us-utilisateur-card-body">
                      <div className="us-utilisateur-card-item">
                        <i className="ri-home-4-line" />
                        <span>{utilisateur.site?.nom || 'Site non attribué'}</span>
                      </div>
                      <div className="us-utilisateur-card-item">
                        <i className="ri-shield-user-line" />
                        <span>{utilisateur.role}</span>
                      </div>
                      <div className="us-utilisateur-card-item">
                        <i className="ri-mail-line" />
                        <span>{utilisateur.email}</span>
                      </div>
                      <div className="us-utilisateur-card-item">
                        <i
                          className={`ri-${
                            utilisateur.statut === 'Actif'
                              ? 'flashlight-fill'
                              : utilisateur.statut === 'Inactif'
                              ? 'error-warning-fill'
                              : 'settings-3-fill'
                          }`}
                        />
                        <span
                          className={clsx('us-status-badge', {
                            active: utilisateur.statut === 'Actif',
                            inactive: utilisateur.statut !== 'Actif',
                          })}
                        >
                          {utilisateur.statut}
                        </span>
                      </div>
                      <div className="us-utilisateur-card-item">
                        <i
                          className="ri-database-2-fill"
                          onClick={handleOpenDataPopup}
                          title="Accéder aux données de l'utilisateur"
                          aria-label="Voir les données de l'utilisateur"
                        />
                        <span>Data</span>
                      </div>
                    </div>
                    <div className="us-utilisateur-card-footer">
                      <div className="us-action-buttons">
                        <button
                          className="us-action-btn edit"
                          onClick={() => handleOpenEditModal(utilisateur)}
                          aria-label={`Modifier l'utilisateur ${utilisateur.nom}`}
                        >
                          <i className="ri-edit-line" />
                        </button>
                        <button
                          className="us-action-btn delete"
                          onClick={() => handleDeleteUtilisateur(utilisateur._id)}
                          aria-label={`Supprimer l'utilisateur ${utilisateur.nom}`}
                        >
                          <i className="ri-delete-bin-line" />
                        </button>
                        <button
                          className="us-action-btn detail"
                          title="Voir détails"
                          aria-label={`Voir les détails de l'utilisateur ${utilisateur.nom}`}
                        >
                          <i className="ri-eye-line" />
                        </button>
                      </div>
                    </div>
                  </div>
                ))
              ) : (
                <div className="us-no-utilisateurs">Aucun utilisateur disponible.</div>
              )}
            </div>
          ) : (
            <div className="us-table-responsive">
              <table className="us-utilisateurs-table">
                <thead>
                  <tr>
                    <th>Nom de l'Utilisateur</th>
                    <th>Site associé</th>
                    <th>Rôle</th>
                    <th>Email</th>
                    <th>Statut</th>
                    <th>Data</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {paginatedUtilisateurs.length > 0 ? (
                    paginatedUtilisateurs.map((utilisateur, i) => (
                      <tr key={utilisateur._id}>
                        <td>
                          <div className="us-utilisateur-name">
                            <span className="us-utilisateur-number">{(currentPage - 1) * utilisateursPerPage + i + 1}.</span>
                            <i className="ri-user-3-line" />
                            <div>
                              <span>{utilisateur.nom}</span>
                            </div>
                          </div>
                        </td>
                        <td>
                          <div className="us-utilisateur-cell">
                            <i className="ri-home-4-line" />
                            {utilisateur.site?.nom || 'Site non attribué'}
                          </div>
                        </td>
                        <td>
                          <div className="us-utilisateur-cell">
                            <i className="ri-shield-user-line" />
                            {utilisateur.role}
                          </div>
                        </td>
                        <td>
                          <div className="us-utilisateur-cell">
                            <i className="ri-mail-line" />
                            {utilisateur.email}
                          </div>
                        </td>
                        <td>
                          <div className="us-utilisateur-cell">
                            <i
                              className={`ri-${
                                utilisateur.statut === 'Actif'
                                  ? 'flashlight-fill'
                                  : utilisateur.statut === 'Inactif'
                                  ? 'error-warning-fill'
                                  : 'settings-3-fill'
                              }`}
                            />
                            <span
                              className={clsx('us-status-badge', {
                                active: utilisateur.statut === 'Actif',
                                inactive: utilisateur.statut !== 'Actif',
                              })}
                            >
                              {utilisateur.statut}
                            </span>
                          </div>
                        </td>
                        <td>
                          <div className="us-utilisateur-cell">
                            <i
                              className="ri-database-2-fill"
                              onClick={handleOpenDataPopup}
                              title="Accéder aux données de l'utilisateur"
                              aria-label="Voir les données de l'utilisateur"
                            />
                          </div>
                        </td>
                        <td>
                          <div className="us-action-buttons">
                            <button
                              className="us-action-btn edit"
                              onClick={() => handleOpenEditModal(utilisateur)}
                              aria-label={`Modifier l'utilisateur ${utilisateur.nom}`}
                            >
                              <i className="ri-edit-line" />
                            </button>
                            <button
                              className="us-action-btn delete"
                              onClick={() => handleDeleteUtilisateur(utilisateur._id)}
                              aria-label={`Supprimer l'utilisateur ${utilisateur.nom}`}
                            >
                              <i className="ri-delete-bin-line" />
                            </button>
                            <button
                              className="us-action-btn detail"
                              title="Voir détails"
                              aria-label={`Voir les détails de l'utilisateur ${utilisateur.nom}`}
                            >
                              <i className="ri-eye-line" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan="7" className="us-no-utilisateurs">
                        Aucun utilisateur disponible.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          )}

          <div className="us-table-footer">
            <div className="us-pagination-info">
              Affichage {(currentPage - 1) * utilisateursPerPage + 1}-
              {Math.min(currentPage * utilisateursPerPage, filteredUtilisateurs.length)} sur{' '}
              {filteredUtilisateurs.length} utilisateur(s)
            </div>
            <div className="us-pagination-controls">
              <button
                className="us-pagination-btn"
                onClick={() => handlePageChange(currentPage - 1)}
                disabled={currentPage === 1}
                aria-label="Page précédente"
              >
                <i className="ri-arrow-left-s-line"></i>
              </button>
              <span>{currentPage}</span>
              <button
                className="us-pagination-btn"
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
      {dataPopup && <UtilisateurDataPopup onClose={handleCloseDataPopup} />}
      <ToastContainer position="top-right" autoClose={3000} />
    </div>
    </div>
  );
}
export default Utilisateurs;
