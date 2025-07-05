import React, { useState, useEffect, useMemo } from 'react';
import clsx from 'clsx';
import Sidebar from '../components/Sidebar';
import AddPoteauModal from '../components/AddPoteauModal';
import EditPoteau from '../components/EditPoteauModal';
import PoteauDetails from '../components/PoteauDetailsModal';
import DeletePoteau from '../components/DeletePoteauPage';
import axios from 'axios';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import './cssP/Poteaux.css';

function Poteaux() {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isDetailsOpen, setIsDetailsOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [editPoteau, setEditPoteau] = useState(null);
  const [selectedPoteau, setSelectedPoteau] = useState(null);
  const [poteauIdToDelete, setPoteauIdToDelete] = useState(null);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [isMobile, setIsMobile] = useState(window.innerWidth < 768);
  const [poteaux, setPoteaux] = useState([]);
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const poteauxPerPage = 10;

  const fetchPoteaux = async () => {
    setLoading(true);
    try {
      const response = await axios.get('http://localhost:5000/api/poteau');
      setPoteaux(response.data);
    } catch (error) {
      toast.error('Erreur : Impossible de charger les poteaux.');
      console.error('Erreur lors du chargement des poteaux:', error.response?.data || error.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPoteaux();
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

  const filteredPoteaux = useMemo(() => {
    return poteaux.filter(
      (poteau) =>
        (poteau.nom || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
        (poteau.code || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
        (poteau.site?.nom || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
        (poteau.ligne?.nom_L || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
        String(poteau.luminosite || poteau.niveauLumiere || '').includes(searchTerm.toLowerCase())
    );
  }, [poteaux, searchTerm]);

  const totalPages = Math.ceil(filteredPoteaux.length / poteauxPerPage);
  const paginatedPoteaux = useMemo(() => {
    const startIndex = (currentPage - 1) * poteauxPerPage;
    return filteredPoteaux.slice(startIndex, startIndex + poteauxPerPage);
  }, [filteredPoteaux, currentPage]);

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

  const handleOpenEditModal = (poteau) => {
    setEditPoteau({
      _id: poteau._id,
      nom: poteau.nom,
      code: poteau.code,
      site: poteau.site?._id || '',
      ligne: poteau.ligne?._id || '',
      statut: poteau.statut,
      luminosite: poteau.luminosite || poteau.niveauLumiere || 0,
      localisation: poteau.localisation || { lat: null, lng: null },
    });
    setIsEditModalOpen(true);
  };

  const handleOpenDetails = (poteau) => {
    setSelectedPoteau({
      nom: poteau.nom,
      code: poteau.code,
      site: poteau.site?.nom || 'Site non attribué',
      ligne: poteau.ligne?.nom_L || 'Ligne non attribuée',
      statut: poteau.statut,
      luminosite: poteau.luminosite || poteau.niveauLumiere || 0,
      localisation: poteau.localisation || { lat: null, lng: null },
    });
    setIsDetailsOpen(true);
  };

  const handleOpenDeleteModal = (poteau) => {
    setPoteauIdToDelete(poteau._id);
    setIsDeleteModalOpen(true);
  };

  const handlePoteauAdded = (newPoteau) => {
    fetchPoteaux();
    toast.success('Poteau créé avec succès !');
  };

  const handlePoteauEdited = (updatedPoteau) => {
    fetchPoteaux();
    setIsEditModalOpen(false);
    setEditPoteau(null);
    toast.success('Poteau modifié avec succès !');
  };

  const handlePoteauDeleted = () => {
    fetchPoteaux();
    setIsDeleteModalOpen(false);
    setPoteauIdToDelete(null);
    toast.success('Poteau supprimé avec succès !');
  };

  return (
    <div className="poteaux-page">
      <div className="pt-container" style={{ display: 'flex', minHeight: '100vh' }}>
        <Sidebar
          onToggle={handleSidebarToggle}
          className={clsx({
            'pt-sidebar-open': sidebarOpen,
            'pt-sidebar-collapsed': !sidebarOpen,
          })}
        />
        <main
          className={clsx('pt-main-content', {
            'pt-sidebar-collapsed': !sidebarOpen || isMobile,
          })}
          style={{
            flex: 1,
            marginLeft: 0,
            paddingLeft: 0,
            marginTop: '2rem',
          }}
        >
          <div className="pt-dashboard-card">
            <div className="pt-page-header">
              <div className="pt-header-content">
                <div className="pt-title-wrapper">
                  <div className="pt-title-icon-container">
                    <i className="ri-lightbulb-line pt-main-icon"></i>
                  </div>
                  <div>
                    <h1 className="pt-main-title">
                      Gestion des Poteaux
                      <span className="pt-title-underline"></span>
                    </h1>
                    <p className="pt-subtitle">Administrez l'ensemble de vos poteaux électriques</p>
                  </div>
                </div>
                <button
                  className="pt-add-poteau-btn pt-btn-primary"
                  onClick={() => setIsModalOpen(true)}
                  aria-label="Ajouter un nouveau poteau"
                >
                  <i className="ri-add-circle-line"></i>
                  <span>Nouveau poteau</span>
                </button>
                {isModalOpen && (
                  <AddPoteauModal
                    onClose={() => setIsModalOpen(false)}
                    onSave={handlePoteauAdded}
                  />
                )}
                {isEditModalOpen && (
                  <EditPoteau
                    onClose={() => {
                      setIsEditModalOpen(false);
                      setEditPoteau(null);
                    }}
                    onSave={handlePoteauEdited}
                    poteauData={editPoteau}
                  />
                )}
                {isDetailsOpen && (
                  <PoteauDetails
                    onClose={() => {
                      setIsDetailsOpen(false);
                      setSelectedPoteau(null);
                    }}
                    poteau={selectedPoteau}
                  />
                )}
                {isDeleteModalOpen && (
                  <DeletePoteau
                    onClose={() => {
                      setIsDeleteModalOpen(false);
                      setPoteauIdToDelete(null);
                    }}
                    onSave={handlePoteauDeleted}
                    poteauId={poteauIdToDelete}
                  />
                )}
              </div>
            </div>

            <div className="pt-card-header">
              <div className="pt-list-header-wrapper">
                <div className="pt-list-title-container">
                  <i className="ri-table-2 pt-list-icon"></i>
                  <h2 className="pt-list-title">
                    Liste des Poteaux
                    <span className="pt-poteau-count">{filteredPoteaux.length} poteau(x)</span>
                  </h2>
                </div>
                <div className="pt-search-filter-container">
                  <div className="pt-search-box">
                    <i className="ri-search-line pt-search-icon"></i>
                    <input
                      id="poteau-search"
                      type="text"
                      placeholder="Rechercher un poteau..."
                      className="pt-search-input"
                      value={searchTerm}
                      onChange={handleSearchChange}
                    />
                    {searchTerm && (
                      <i
                        className="ri-close-line pt-clear-icon"
                        onClick={handleClearSearch}
                        aria-label="Clear search"
                      />
                    )}
                  </div>
                  <div className="pt-filter-group">
                    <button className="pt-btn-secondary" aria-label="Filtrer les poteaux">
                      <i className="ri-filter-3-line"></i>
                      <span>Filtrer</span>
                    </button>
                    <button
                      className="pt-sort-btn pt-btn-secondary"
                      aria-label="Trier les poteaux"
                    >
                      <i className="ri-arrow-up-down-line"></i>
                    </button>
                  </div>
                </div>
              </div>
            </div>

            {isMobile ? (
              <div className="pt-poteau-cards">
                {loading ? (
                  <div className="pt-loading">Chargement des poteaux...</div>
                ) : paginatedPoteaux.length > 0 ? (
                  paginatedPoteaux.map((poteau, i) => (
                    <div className="pt-poteau-card" key={poteau._id}>
                      <div className="pt-poteau-card-header">
                        <div className="pt-poteau-card-title">
                          <span className="pt-poteau-number">{(currentPage - 1) * poteauxPerPage + i + 1}.</span>
                          <i className="ri-lightbulb-line" />
                          <span>{poteau.nom}</span>
                        </div>
                      </div>
                      <div className="pt-poteau-card-body">
                        <div className="pt-poteau-card-item">
                          <i className="ri-barcode-line" />
                          <span>{poteau.code}</span>
                        </div>
                        <div className="pt-poteau-card-item">
                          <i className="ri-home-4-line" />
                          <span>{poteau.site?.nom || 'Site non attribué'}</span>
                        </div>
                        <div className="pt-poteau-card-item">
                          <i className="ri-route-line" />
                          <span>{poteau.ligne?.nom_L || 'Ligne non attribuée'}</span>
                        </div>
                        <div className="pt-poteau-card-item">
                          <i className="ri-sun-line" />
                          <div className="pt-luminosite-container">
                            <div
                              className="pt-luminosite-bar"
                              style={{ width: `${poteau.luminosite || poteau.niveauLumiere || 0}%` }}
                            ></div>
                            <span>{poteau.luminosite || poteau.niveauLumiere || 0}%</span>
                          </div>
                        </div>
                        <div className="pt-poteau-card-item">
                          <i
                            className={`ri-${
                              poteau.statut === 'Actif' ? 'flashlight-fill' : 'error-warning-fill'
                            }`}
                          />
                          <span
                            className={clsx('pt-status-badge', {
                              active: poteau.statut === 'Actif',
                              inactive: poteau.statut !== 'Actif',
                            })}
                          >
                            {poteau.statut}
                          </span>
                        </div>
                      </div>
                      <div className="pt-poteau-card-footer">
                        <div className="pt-action-buttons">
                          <button
                            className="pt-action-btn edit"
                            onClick={() => handleOpenEditModal(poteau)}
                            aria-label={`Modifier le poteau ${poteau.nom}`}
                          >
                            <i className="ri-edit-line" />
                          </button>
                          <button
                            className="pt-action-btn delete"
                            onClick={() => handleOpenDeleteModal(poteau)}
                            aria-label={`Supprimer le poteau ${poteau.nom}`}
                          >
                            <i className="ri-delete-bin-line" />
                          </button>
                          <button
                            className="pt-action-btn detail"
                            onClick={() => handleOpenDetails(poteau)}
                            title="Voir détails"
                            aria-label={`Voir les détails du poteau ${poteau.nom}`}
                          >
                            <i className="ri-eye-line" />
                          </button>
                        </div>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="pt-no-poteaux">Aucun poteau disponible.</div>
                )}
              </div>
            ) : (
              <div className="pt-table-responsive">
                <table className="pt-poteaux-table">
                  <thead>
                    <tr>
                      <th>
                        <i className="ri-lightbulb-line pt-table-icon"></i> Nom du Poteau
                      </th>
                      <th>
                        <i className="ri-barcode-line pt-table-icon"></i> Code
                      </th>
                      <th>
                        <i className="ri-home-4-line pt-table-icon"></i> Site associé
                      </th>
                      <th>
                        <i className="ri-route-line pt-table-icon"></i> Ligne associée
                      </th>
                      <th>
                        <i className="ri-sun-line pt-table-icon"></i> Niveau de Lumière
                      </th>
                      <th>
                        <i className="ri-flashlight-fill pt-table-icon"></i> Statut
                      </th>
                      <th>
                        <i className="ri-settings-3-line pt-table-icon"></i> Actions
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {loading ? (
                      <tr>
                        <td colSpan="7" className="pt-loading">
                          Chargement des poteaux...
                        </td>
                      </tr>
                    ) : paginatedPoteaux.length > 0 ? (
                      paginatedPoteaux.map((poteau, i) => (
                        <tr key={poteau._id}>
                          <td>
                            <div className="pt-poteau-name">
                              <span className="pt-poteau-number">{(currentPage - 1) * poteauxPerPage + i + 1}.</span>
                              <i className="ri-lightbulb-line" />
                              <div>
                                <span>{poteau.nom}</span>
                              </div>
                            </div>
                            </td>
                          <td>
                            <div className="pt-poteau-cell">
                              <i className="ri-barcode-line" />
                              {poteau.code}
                            </div>
                          </td>
                          <td>
                            <div className="pt-poteau-cell">
                              <i className="ri-home-4-line" />
                              {poteau.site?.nom || 'Site non attribué'}
                            </div>
                          </td>
                          <td>
                            <div className="pt-poteau-cell">
                              <i className="ri-route-line" />
                              {poteau.ligne?.nom_L || 'Ligne non attribuée'}
                            </div>
                          </td>
                          <td>
                            <div className="pt-poteau-cell">
                              <i className="ri-sun-line" />
                              <div className="pt-luminosite-container">
                                <div
                                  className="pt-luminosite-bar"
                                  style={{ width: `${poteau.luminosite || poteau.niveauLumiere || 0}%` }}
                                ></div>
                                <span>{poteau.luminosite || poteau.niveauLumiere || 0}%</span>
                              </div>
                            </div>
                          </td>
                          <td>
                            <div className="pt-poteau-cell">
                              <i
                                className={`ri-${
                                  poteau.statut === 'Actif' ? 'flashlight-fill' : 'error-warning-fill'
                                }`}
                              />
                              <span
                                className={clsx('pt-status-badge', {
                                  active: poteau.statut === 'Actif',
                                  inactive: poteau.statut !== 'Actif',
                                })}
                              >
                                {poteau.statut}
                              </span>
                            </div>
                          </td>
                          <td>
                            <div className="pt-action-buttons">
                              <button
                                className="pt-action-btn edit"
                                onClick={() => handleOpenEditModal(poteau)}
                                aria-label={`Modifier le poteau ${poteau.nom}`}
                              >
                                <i className="ri-edit-line" />
                              </button>
                              <button
                                className="pt-action-btn delete"
                                onClick={() => handleOpenDeleteModal(poteau)}
                                aria-label={`Supprimer le poteau ${poteau.nom}`}
                              >
                                <i className="ri-delete-bin-line" />
                              </button>
                              <button
                                className="pt-action-btn detail"
                                onClick={() => handleOpenDetails(poteau)}
                                title="Voir détails"
                                aria-label={`Voir les détails du poteau ${poteau.nom}`}
                              >
                                <i className="ri-eye-line" />
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))
                    ) : (
                      <tr>
                        <td colSpan="7" className="pt-no-poteaux">
                          Aucun poteau disponible.
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            )}

            <div className="pt-table-footer">
              <div className="pt-pagination-info">
                Affichage {(currentPage - 1) * poteauxPerPage + 1}-
                {Math.min(currentPage * poteauxPerPage, filteredPoteaux.length)} sur{' '}
                {filteredPoteaux.length} poteau(x)
              </div>
              <div className="pt-pagination-controls">
                <button
                  className="pt-pagination-btn"
                  onClick={() => handlePageChange(currentPage - 1)}
                  disabled={currentPage === 1}
                  aria-label="Page précédente"
                >
                  <i className="ri-arrow-left-s-line"></i>
                </button>
                <span>{currentPage}</span>
                <button
                  className="pt-pagination-btn"
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
        <ToastContainer
          position="top-right"
          autoClose={3000}
          hideProgressBar={false}
          newestOnTop={false}
          closeOnClick
          rtl={false}
          pauseOnFocusLoss
          draggable
          pauseOnHover
          style={{ zIndex: 9999 }}
        />
      </div>
    </div>
  );
}

export default Poteaux;