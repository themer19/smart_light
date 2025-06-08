import React, { useState, useEffect, useMemo } from 'react';
import clsx from 'clsx';
import Sidebar from '../components/Sidebar';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import AddLicencePage from '../components/AddLicencePage';
import ProfileDetails from '../components/ProfileDetails';
import './cssP/Utilisateurs.css';

function Utilisateurs() {
  const [isAddLicenceModalOpen, setIsAddLicenceModalOpen] = useState(false);
  const [selectedUtilisateur, setSelectedUtilisateur] = useState(null);
  const [isProfileDetailsOpen, setIsProfileDetailsOpen] = useState(false);
  const [selectedProfile, setSelectedProfile] = useState(null);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [isMobile, setIsMobile] = useState(window.innerWidth < 768);
  const [utilisateurs, setUtilisateurs] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const utilisateursPerPage = 10;

  const capitalize = (str) =>
    str
      ?.toLowerCase()
      .split(' ')
      .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
      .join(' ');

  useEffect(() => {
    const fetchUtilisateurs = async () => {
      try {
        const response = await fetch('http://localhost:5000/api/users/alluser');
        if (!response.ok) {
          throw new Error('Erreur lors de la récupération des utilisateurs');
        }
        const data = await response.json();
        setUtilisateurs(data);
      } catch (error) {
        console.error('Erreur:', error);
        toast.error('🚨 Impossible de charger les utilisateurs depuis l’API');
      }
    };

    fetchUtilisateurs();
  }, []);

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
        utilisateur.email.toLowerCase().includes(searchTerm.toLowerCase())
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

  const handleDeleteUtilisateur = async (utilisateurId) => {
    try {
      await axios.delete(`http://localhost:5000/api/users/${utilisateurId}`);
      setUtilisateurs((prevUtilisateurs) =>
        prevUtilisateurs.filter((utilisateur) => utilisateur._id !== utilisateurId)
      );
      toast.success('Utilisateur supprimé avec succès !');
    } catch (error) {
      toast.error('🚨 Une erreur est survenue lors de la suppression de l\'utilisateur');
      console.error('Erreur:', error);
    }
  };

  const handleToggleStatus = (utilisateur) => {
    if (utilisateur.statut === 'Actif') {
      const updatedUtilisateurs = utilisateurs.map((u) =>
        u._id === utilisateur._id ? { ...u, statut: 'Inactif', licence: null } : u
      );
      setUtilisateurs(updatedUtilisateurs);
      toast.success('Utilisateur désactivé avec succès !');
    } else {
      setSelectedUtilisateur(utilisateur);
      setIsAddLicenceModalOpen(true);
    }
  };

  const handleAssignLicence = (licenceData) => {
    if (!selectedUtilisateur) {
      console.log('Nouvelle licence non assignée:', licenceData);
      toast.success('Licence ajoutée avec succès !');
      setIsAddLicenceModalOpen(false);
      return;
    }
    try {
      const updatedUtilisateurs = utilisateurs.map((utilisateur) =>
        utilisateur._id === selectedUtilisateur._id
          ? {
              ...utilisateur,
              statut: licenceData.statut === 'Active' ? 'Actif' : 'Inactif',
              licence: licenceData,
            }
          : utilisateur
      );
      setUtilisateurs(updatedUtilisateurs);
      toast.success('Utilisateur activé et licence attribuée avec succès !');
      setIsAddLicenceModalOpen(false);
      setSelectedUtilisateur(null);
    } catch (error) {
      toast.error('🚨 Une erreur est survenue lors de l\'attribution de la licence');
      console.error('Erreur:', error);
    }
  };

  const handleViewDetails = (utilisateur) => {
    setSelectedProfile({
      nom: utilisateur.nom,
      prenom: utilisateur.prenom,
      email: utilisateur.email,
      telephone: utilisateur.numéroDeTéléphone, // Non disponible dans les données
      role: utilisateur.role,
      statut: utilisateur.statut,
      photo: null,
      dateNaissance : utilisateur.dateDeNaissance,
      adresse : utilisateur.adresse,
      statut : utilisateur.estActif,
      dateCreation : utilisateur.crééLe,
      licence : utilisateur.license,
    });
    setIsProfileDetailsOpen(true);
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

  const handleOpenAddLicenceModal = () => {
    console.log('Opening AddLicencePage Modal');
    setIsAddLicenceModalOpen(true);
    setSelectedUtilisateur(null);
  };

  return (
    <div className="utilisateur-page">
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
                          <span> {capitalize(`${utilisateur.prenom} ${utilisateur.nom}`)}</span>
                        </div>
                      </div>
                      <div className="us-utilisateur-card-body">
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
                              utilisateur.statut === 'Actif' ? 'flashlight-fill' : 'error-warning-fill'
                            }`}
                          />
                          <span
                            className={clsx('us-status-badge', {
                              active: utilisateur.statut === 'Actif',
                              inactive: utilisateur.statut === 'Inactif',
                            })}
                          >
                            {utilisateur.statut}
                          </span>
                          <button
                            className="us-toggle-status-btn"
                            onClick={() => handleToggleStatus(utilisateur)}
                            aria-label={`${
                              utilisateur.statut === 'Actif' ? 'Désactiver' : 'Activer'
                            } l'utilisateur ${utilisateur.nom}`}
                          >
                            <i
                              className={`ri-${
                                utilisateur.statut === 'Actif' ? 'pause-circle-line' : 'play-circle-line'
                              }`}
                            />
                          </button>
                        </div>
                      </div>
                      <div className="us-utilisateur-card-footer">
                        <div className="us-action-buttons">
                          <button
                            className="us-action-btn delete"
                            onClick={() => handleDeleteUtilisateur(utilisateur._id)}
                            aria-label={`Supprimer l'utilisateur ${utilisateur.nom}`}
                          >
                            <i className="ri-delete-bin-line" />
                          </button>
                          <button
                            className="us-action-btn detail"
                            onClick={() => handleViewDetails(utilisateur)}
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
                      <th>
                        <div className="us-table-header">
                          <i className="ri-user-line" />
                          <span>Nom de l'Utilisateur</span>
                        </div>
                      </th>
                      <th>
                        <div className="us-table-header">
                          <i className="ri-shield-user-line" />
                          <span>Rôle</span>
                        </div>
                      </th>
                      <th>
                        <div className="us-table-header">
                          <i className="ri-mail-line" />
                          <span>Email</span>
                        </div>
                      </th>
                      <th>
                        <div className="us-table-header">
                          <i className="ri-checkbox-circle-line" />
                          <span>Statut</span>
                        </div>
                      </th>
                      <th>
                        <div className="us-table-header">
                          <i className="ri-settings-3-line" />
                          <span>Actions</span>
                        </div>
                      </th>
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
                              <span>{capitalize(`${utilisateur.prenom} ${utilisateur.nom}`)}</span>
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
      utilisateur.estActif ? 'flashlight-fill' : 'error-warning-fill'
    }`}
  />
  <span
    className={clsx('us-status-badge', {
      active: utilisateur.estActif,
      inactive: !utilisateur.estActif,
    })}
  >
    {utilisateur.estActif ? 'Actif' : 'Inactif'}
  </span>
  <button
    className="us-toggle-status-btn"
    onClick={() => handleToggleStatus(utilisateur)}
    aria-label={`${
      utilisateur.estActif ? 'Désactiver' : 'Activer'
    } l'utilisateur ${utilisateur.nom}`}
  >
    <i
      className={`ri-${
        utilisateur.estActif ? 'pause-circle-line' : 'play-circle-line'
      }`}
    />
  </button>
</div>
                          </td>
                          <td>
                            <div className="us-action-buttons">
                              <button
                                className="us-action-btn delete"
                                onClick={() => handleDeleteUtilisateur(utilisateur._id)}
                                aria-label={`Supprimer l'utilisateur ${utilisateur.nom}`}
                              >
                                <i className="ri-delete-bin-line" />
                              </button>
                              <button
                                className="us-action-btn detail"
                                onClick={() => handleViewDetails(utilisateur)}
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
                        <td colSpan="5" className="us-no-utilisateurs">
                          Aucun utilisateur disponible.
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            )}

{isAddLicenceModalOpen && (
  <AddLicencePage
    onClose={() => {
      setIsAddLicenceModalOpen(false);
      setSelectedUtilisateur(null);
    }}
    onSave={handleAssignLicence}
    utilisateurNom={
      selectedUtilisateur
        ? capitalize(`${selectedUtilisateur.prenom} ${selectedUtilisateur.nom}`)
        : null
    }
    utilisateurId={selectedUtilisateur?._id}
    utilisateurEmail={selectedUtilisateur?.email}
  />
)}


            {isProfileDetailsOpen && (
              <ProfileDetails
                onClose={() => {
                  setIsProfileDetailsOpen(false);
                  setSelectedProfile(null);
                }}
                onEdit={(profileData) => {
                  console.log('Modifier le profil:', profileData);
                  toast.info('Fonctionnalité de modification à implémenter');
                }}
                profileData={selectedProfile}
              />
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
        <ToastContainer position="top-right" autoClose={3000} />
      </div>
    </div>
  );
}

export default Utilisateurs;