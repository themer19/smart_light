import React, { useState, useEffect, useMemo } from 'react';
import clsx from 'clsx';
import Sidebar from '../components/Sidebar';
 // Placeholder: Create this component
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import './cssP/Eclairage.css';

function Eclairage() {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [editEclairage, setEditEclairage] = useState(null);
  const [dataPopup, setDataPopup] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [isMobile, setIsMobile] = useState(window.innerWidth < 768);
  const [eclairages, setEclairages] = useState([
    { _id: 'eclairage_1', nom: 'Éclairage A', type: 'LED', site: { nom: 'Site Alpha' }, puissance: '100', statut: 'Actif' },
    { _id: 'eclairage_2', nom: 'Éclairage B', type: 'Halogène', site: { nom: 'Site Beta' }, puissance: '200', statut: 'Inactif' },
    { _id: 'eclairage_3', nom: 'Éclairage C', type: 'Sodium', site: { nom: 'Site Gamma' }, puissance: '150', statut: 'Actif' },
    { _id: 'eclairage_4', nom: 'Éclairage D', type: 'LED', site: { nom: 'Site Alpha' }, puissance: '120', statut: 'Inactif' },
    { _id: 'eclairage_5', nom: 'Éclairage E', type: 'Halogène', site: { nom: 'Site Delta' }, puissance: '180', statut: 'Actif' },
    { _id: 'eclairage_6', nom: 'Éclairage F', type: 'Sodium', site: { nom: 'Site Beta' }, puissance: '130', statut: 'Actif' },
    { _id: 'eclairage_7', nom: 'Éclairage G', type: 'LED', site: { nom: 'Site Gamma' }, puissance: '110', statut: 'Inactif' },
    { _id: 'eclairage_8', nom: 'Éclairage H', type: 'Halogène', site: { nom: 'Site Delta' }, puissance: '190', statut: 'Actif' },
    { _id: 'eclairage_9', nom: 'Éclairage I', type: 'Sodium', site: { nom: 'Site Alpha' }, puissance: '140', statut: 'Inactif' },
    { _id: 'eclairage_10', nom: 'Éclairage J', type: 'LED', site: { nom: 'Site Beta' }, puissance: '160', statut: 'Actif' },
    { _id: 'eclairage_11', nom: 'Éclairage K', type: 'Halogène', site: { nom: 'Site Gamma' }, puissance: '170', statut: 'Actif' },
    { _id: 'eclairage_12', nom: 'Éclairage L', type: 'Sodium', site: { nom: 'Site Delta' }, puissance: '125', statut: 'Inactif' },
  ]);
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const eclairagesPerPage = 10;

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

  const filteredEclairages = useMemo(() => {
    return eclairages.filter(
      (eclairage) =>
        eclairage.nom.toLowerCase().includes(searchTerm.toLowerCase()) ||
        eclairage.type.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (eclairage.site?.nom || '').toLowerCase().includes(searchTerm.toLowerCase())
    );
  }, [eclairages, searchTerm]);

  const totalPages = Math.ceil(filteredEclairages.length / eclairagesPerPage);
  const paginatedEclairages = useMemo(() => {
    const startIndex = (currentPage - 1) * eclairagesPerPage;
    return filteredEclairages.slice(startIndex, startIndex + eclairagesPerPage);
  }, [filteredEclairages, currentPage]);

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

  const handleSaveEclairage = (eclairageData) => {
    try {
      const newEclairage = {
        ...eclairageData,
        _id: `eclairage_${Date.now()}`,
        site: { nom: eclairageData.site || 'Site non attribué' },
      };
      setEclairages([...eclairages, newEclairage]);
      toast.success('Éclairage créé avec succès !');
      setIsModalOpen(false);
    } catch (error) {
      toast.error('🚨 Une erreur est survenue lors de la création de l\'éclairage');
      console.error('Erreur:', error);
    }
  };

  const handleEditEclairage = (eclairageData) => {
    try {
      const updatedEclairages = eclairages.map((eclairage) =>
        eclairage._id === editEclairage._id
          ? { ...eclairageData, _id: editEclairage._id, site: { nom: eclairageData.site || 'Site non attribué' } }
          : eclairage
      );
      setEclairages(updatedEclairages);
      toast.success('Éclairage modifié avec succès !');
      setIsEditModalOpen(false);
      setEditEclairage(null);
    } catch (error) {
      toast.error('🚨 Une erreur est survenue lors de la modification de l\'éclairage');
      console.error('Erreur:', error);
    }
  };

  const handleDeleteEclairage = (eclairageId) => {
    try {
      setEclairages(eclairages.filter((eclairage) => eclairage._id !== eclairageId));
      toast.success('Éclairage supprimé avec succès !');
    } catch (error) {
      toast.error('🚨 Une erreur est survenue lors de la suppression de l\'éclairage');
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

  const handleOpenEditModal = (eclairage) => {
    setEditEclairage(eclairage);
    setIsEditModalOpen(true);
  };

  return (
    <div class="eclairage-page">
    <div className="ec-container" style={{ display: 'flex', minHeight: '100vh' }}>
      <Sidebar
        onToggle={handleSidebarToggle}
        className={clsx('ec-sidebar', {
          'ec-sidebar-open': sidebarOpen,
          'ec-sidebar-collapsed': !sidebarOpen,
        })}
      />
      <main
        className={clsx('ec-main-content', {
          'ec-sidebar-collapsed': !sidebarOpen || isMobile,
        })}
        style={{
          flex: 1,
          marginLeft: 0,
          paddingLeft: 0,
          marginTop: '2rem',
        }}
      >
        <div className="ec-dashboard-card">
          <div className="ec-page-header">
            <div className="ec-header-content">
              <div className="ec-title-wrapper">
                <div className="ec-title-icon-container">
                  <i className="ri-lightbulb-flash-line ec-main-icon"></i>
                </div>
                <div>
                  <h1 className="ec-main-title">
                    Gestionnaire d'Éclairage
                    <span className="ec-title-underline"></span>
                  </h1>
                  <p className="ec-subtitle">Administrez l'ensemble de vos systèmes d'éclairage</p>
                </div>
              </div>
              <button
                className="ec-add-eclairage-btn ec-btn-primary"
                onClick={() => setIsModalOpen(true)}
                aria-label="Ajouter un nouvel éclairage"
              >
                <i className="ri-add-circle-line"></i>
                <span>Nouvel éclairage</span>
              </button>
              {isModalOpen && (
                <AddEclairageModal onClose={() => setIsModalOpen(false)} onSave={handleSaveEclairage} />
              )}
              {isEditModalOpen && (
                <AddEclairageModal
                  onClose={() => {
                    setIsEditModalOpen(false);
                    setEditEclairage(null);
                  }}
                  onSave={handleEditEclairage}
                  initialData={editEclairage}
                />
              )}
            </div>
          </div>

          <div className="ec-card-header">
            <div className="ec-list-header-wrapper">
              <div className="ec-list-title-container">
                <i className="ri-table-2 ec-list-icon"></i>
                <h2 className="ec-list-title">
                  Liste des Éclairages
                  <span className="ec-eclairage-count">{filteredEclairages.length} éclairage(s)</span>
                </h2>
              </div>
              <div className="ec-search-filter-container">
                <div className="ec-search-box">
                  <i className="ri-search-line ec-search-icon"></i>
                  <input
                    id="eclairage-search"
                    type="text"
                    placeholder="Rechercher un éclairage..."
                    className="ec-search-input"
                    value={searchTerm}
                    onChange={handleSearchChange}
                  />
                  {searchTerm && (
                    <i
                      className="ri-close-line ec-clear-icon"
                      onClick={handleClearSearch}
                      aria-label="Effacer la recherche"
                    ></i>
                  )}
                </div>
                <div className="ec-filter-group">
                  <button className="ec-btn-secondary" aria-label="Filtrer les éclairages">
                    <i className="ri-filter-3-line"></i>
                    <span>Filtrer</span>
                  </button>
                  <button
                    className="ec-sort-btn ec-btn-secondary"
                    aria-label="Trier les éclairages"
                  >
                    <i className="ri-arrow-up-down-line"></i>
                  </button>
                </div>
              </div>
            </div>
          </div>

          {isMobile ? (
            <div className="ec-eclairage-cards">
              {paginatedEclairages.length > 0 ? (
                paginatedEclairages.map((eclairage, i) => (
                  <div className="ec-eclairage-card" key={eclairage._id}>
                    <div className="ec-eclairage-card-header">
                      <div className="ec-eclairage-card-title">
                        <span className="ec-eclairage-number">{(currentPage - 1) * eclairagesPerPage + i + 1}.</span>
                        <i className="ri-lightbulb-flash-line" />
                        <span>{eclairage.nom}</span>
                      </div>
                    </div>
                    <div className="ec-eclairage-card-body">
                      <div className="ec-eclairage-card-item">
                        <i className="ri-home-4-line" />
                        <span>{eclairage.site?.nom || 'Site non attribué'}</span>
                      </div>
                      <div className="ec-eclairage-card-item">
                        <i className="ri-cpu-line" />
                        <span>{eclairage.type}</span>
                      </div>
                      <div className="ec-eclairage-card-item">
                        <i className="ri-battery-2-charge-line" />
                        <span>{eclairage.puissance} W</span>
                      </div>
                      <div className="ec-eclairage-card-item">
                        <i
                          className={`ri-${
                            eclairage.statut === 'Actif' ? 'flashlight-fill' : 'error-warning-fill'
                          }`}
                        />
                        <span
                          className={clsx('ec-status-badge', {
                            active: eclairage.statut === 'Actif',
                            inactive: eclairage.statut !== 'Actif',
                          })}
                        >
                          {eclairage.statut}
                        </span>
                      </div>
                      <div className="ec-eclairage-card-item">
                        <i
                          className="ri-database-2-fill"
                          onClick={handleOpenDataPopup}
                          title="Accéder aux données techniques"
                          aria-label="Voir les données techniques"
                        />
                        <span>Data</span>
                      </div>
                    </div>
                    <div className="ec-eclairage-card-footer">
                      <div className="ec-action-buttons">
                        <button
                          className="ec-action-btn edit"
                          onClick={() => handleOpenEditModal(eclairage)}
                          aria-label={`Modifier l'éclairage ${eclairage.nom}`}
                        >
                          <i className="ri-edit-line" />
                        </button>
                        <button
                          className="ec-action-btn delete"
                          onClick={() => handleDeleteEclairage(eclairage._id)}
                          aria-label={`Supprimer l'éclairage ${eclairage.nom}`}
                        >
                          <i className="ri-delete-bin-line" />
                        </button>
                        <button
                          className="ec-action-btn detail"
                          title="Voir détails"
                          aria-label={`Voir les détails de l'éclairage ${eclairage.nom}`}
                        >
                          <i className="ri-eye-line" />
                        </button>
                      </div>
                    </div>
                  </div>
                ))
              ) : (
                <div className="ec-no-eclairages">Aucun éclairage disponible.</div>
              )}
            </div>
          ) : (
            <div className="ec-tableResponsive">
              <table className="ec-eclairages-table">
                <thead>
                  <tr>
                    <th>Nom de l'Éclairage</th>
                    <th>Site associé</th>
                    <th>Type</th>
                    <th>Puissance</th>
                    <th>Statut</th>
                    <th>Data</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {paginatedEclairages.length > 0 ? (
                    paginatedEclairages.map((eclairage, i) => (
                      <tr key={eclairage._id}>
                        <td>
                          <div className="ec-eclairage-name">
                            <span className="ec-eclairage-number">{(currentPage - 1) * eclairagesPerPage + i + 1}.</span>
                            <i className="ri-lightbulb-flash-line" />
                            <div>
                              <span>{eclairage.nom}</span>
                            </div>
                          </div>
                        </td>
                        <td>
                          <div className="ec-eclairage-cell">
                            <i className="ri-home-4-line" />
                            {eclairage.site?.nom || 'Site non attribué'}
                          </div>
                        </td>
                        <td>
                          <div className="ec-eclairage-cell">
                            <i className="ri-cpu-line" />
                            {eclairage.type}
                          </div>
                        </td>
                        <td>
                          <div className="ec-eclairage-cell">
                            <i className="ri-battery-2-charge-line" />
                            {eclairage.puissance} W
                          </div>
                        </td>
                        <td>
                          <div className="ec-eclairage-cell">
                            <i
                              className={`ri-${
                                eclairage.statut === 'Actif' ? 'flashlight-fill' : 'error-warning-fill'
                              }`}
                            />
                            <span
                              className={clsx('ec-status-badge', {
                                active: eclairage.statut === 'Actif',
                                inactive: eclairage.statut !== 'Actif',
                              })}
                            >
                              {eclairage.statut}
                            </span>
                          </div>
                        </td>
                        <td>
                          <div className="ec-eclairage-cell">
                            <i
                              className="ri-database-2-fill"
                              onClick={handleOpenDataPopup}
                              title="Accéder aux données techniques"
                              aria-label="Voir les données techniques"
                            />
                          </div>
                        </td>
                        <td>
                          <div className="ec-action-buttons">
                            <button
                              className="ec-action-btn edit"
                              onClick={() => handleOpenEditModal(eclairage)}
                              aria-label={`Modifier l'éclairage ${eclairage.nom}`}
                            >
                              <i className="ri-edit-line" />
                            </button>
                            <button
                              className="ec-action-btn delete"
                              onClick={() => handleDeleteEclairage(eclairage._id)}
                              aria-label={`Supprimer l'éclairage ${eclairage.nom}`}
                            >
                              <i className="ri-delete-bin-line" />
                            </button>
                            <button
                              className="ec-action-btn detail"
                              title="Voir détails"
                              aria-label={`Voir les détails de l'éclairage ${eclairage.nom}`}
                            >
                              <i className="ri-eye-line" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan="7" className="ec-no-eclairages">
                        Aucun éclairage disponible.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          )}

          <div className="ec-table-footer">
            <div className="ec-pagination-info">
              Affichage {(currentPage - 1) * eclairagesPerPage + 1}-
              {Math.min(currentPage * eclairagesPerPage, filteredEclairages.length)} sur{' '}
              {filteredEclairages.length} éclairage(s)
            </div>
            <div className="ec-pagination-controls">
              <button
                className="ec-pagination-btn"
                onClick={() => handlePageChange(currentPage - 1)}
                disabled={currentPage === 1}
                aria-label="Page précédente"
              >
                <i className="ri-arrow-left-s-line"></i>
              </button>
              <span>{currentPage}</span>
              <button
                className="ec-pagination-btn"
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
      {dataPopup && <EclairageDataPopup onClose={handleCloseDataPopup} />}
      <ToastContainer position="top-right" autoClose={3000} />
    </div>
    </div>
  );
}

export default Eclairage;