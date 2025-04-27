
import React, { useState, useEffect, useMemo } from 'react';
import clsx from 'clsx';
import Sidebar from '../components/Sidebar'; // Placeholder: Create this component
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import './cssP/Poteaux.css';

function Poteaux() {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [editPoteau, setEditPoteau] = useState(null);
  const [dataPopup, setDataPopup] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [isMobile, setIsMobile] = useState(window.innerWidth < 768);
  const [poteaux, setPoteaux] = useState([
    { _id: 'poteau_1', nom: 'Poteau A', code: 'PT-1001', type: 'Béton', site: { nom: 'Site Alpha' }, statut: 'Actif' },
    { _id: 'poteau_2', nom: 'Poteau B', code: 'PT-1002', type: 'Métal', site: { nom: 'Site Beta' }, statut: 'Inactif' },
    { _id: 'poteau_3', nom: 'Poteau C', code: 'PT-1003', type: 'Bois', site: { nom: 'Site Gamma' }, statut: 'Actif' },
    { _id: 'poteau_4', nom: 'Poteau D', code: 'PT-1004', type: 'Béton', site: { nom: 'Site Alpha' }, statut: 'Inactif' },
    { _id: 'poteau_5', nom: 'Poteau E', code: 'PT-1005', type: 'Métal', site: { nom: 'Site Delta' }, statut: 'Actif' },
    { _id: 'poteau_6', nom: 'Poteau F', code: 'PT-1006', type: 'Bois', site: { nom: 'Site Beta' }, statut: 'Actif' },
    { _id: 'poteau_7', nom: 'Poteau G', code: 'PT-1007', type: 'Béton', site: { nom: 'Site Gamma' }, statut: 'Inactif' },
    { _id: 'poteau_8', nom: 'Poteau H', code: 'PT-1008', type: 'Métal', site: { nom: 'Site Delta' }, statut: 'Actif' },
    { _id: 'poteau_9', nom: 'Poteau I', code: 'PT-1009', type: 'Bois', site: { nom: 'Site Alpha' }, statut: 'Inactif' },
    { _id: 'poteau_10', nom: 'Poteau J', code: 'PT-1010', type: 'Béton', site: { nom: 'Site Beta' }, statut: 'Actif' },
    { _id: 'poteau_11', nom: 'Poteau K', code: 'PT-1011', type: 'Métal', site: { nom: 'Site Gamma' }, statut: 'Actif' },
    { _id: 'poteau_12', nom: 'Poteau L', code: 'PT-1012', type: 'Bois', site: { nom: 'Site Delta' }, statut: 'Inactif' },
  ]);
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const poteauxPerPage = 10;

  // Gestion de la responsivité
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

  // Handle search
  const filteredPoteaux = useMemo(() => {
    return poteaux.filter(
      (poteau) =>
        poteau.nom.toLowerCase().includes(searchTerm.toLowerCase()) ||
        poteau.code.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (poteau.site?.nom || '').toLowerCase().includes(searchTerm.toLowerCase())
    );
  }, [poteaux, searchTerm]);

  // Handle pagination
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

  const handleOpenDataPopup = () => {
    setDataPopup(false);
    setTimeout(() => {
      setDataPopup(true);
    }, 10);
  };

  const handleCloseDataPopup = () => {
    setDataPopup(false);
  };

  const handleSavePoteau = (poteauData) => {
    try {
      const newPoteau = {
        ...poteauData,
        _id: `poteau_${Date.now()}`, // Simulate unique ID
        site: { nom: poteauData.site || 'Site non attribué' }, // Simulate site object
      };
      setPoteaux([...poteaux, newPoteau]);
      toast.success('Poteau créé avec succès !');
      setIsModalOpen(false);
    } catch (error) {
      toast.error('🚨 Une erreur est survenue lors de la création du poteau');
      console.error('Erreur:', error);
    }
  };

  const handleEditPoteau = (poteauData) => {
    try {
      const updatedPoteaux = poteaux.map((poteau) =>
        poteau._id === editPoteau._id
          ? { ...poteauData, _id: editPoteau._id, site: { nom: poteauData.site || 'Site non attribué' } }
          : poteau
      );
      setPoteaux(updatedPoteaux);
      toast.success('Poteau modifié avec succès !');
      setIsEditModalOpen(false);
      setEditPoteau(null);
    } catch (error) {
      toast.error('🚨 Une erreur est survenue lors de la modification du poteau');
      console.error('Erreur:', error);
    }
  };

  const handleDeletePoteau = (poteauId) => {
    try {
      setPoteaux(poteaux.filter((poteau) => poteau._id !== poteauId));
      toast.success('Poteau supprimé avec succès !');
    } catch (error) {
      toast.error('🚨 Une erreur est survenue lors de la suppression du poteau');
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

  const handleOpenEditModal = (poteau) => {
    setEditPoteau(poteau);
    setIsEditModalOpen(true);
  };

  return (
    <div className='poteaux-page'>
    <div className="pt-container" style={{ display: 'flex', minHeight: '100vh' }}>
      <Sidebar
        onToggle={handleSidebarToggle}
        className={clsx('pt-sidebar', {
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
                <AddPoteauModal onClose={() => setIsModalOpen(false)} onSave={handleSavePoteau} />
              )}
              {isEditModalOpen && (
                <AddPoteauModal
                  onClose={() => {
                    setIsEditModalOpen(false);
                    setEditPoteau(null);
                  }}
                  onSave={handleEditPoteau}
                  initialData={editPoteau}
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
                      aria-label="Effacer la recherche"
                    ></i>
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
              {paginatedPoteaux.length > 0 ? (
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
                        <i className="ri-cpu-line" />
                        <span>{poteau.type}</span>
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
                      <div className="pt-poteau-card-item">
                        <i
                          className="ri-database-2-fill"
                          onClick={handleOpenDataPopup}
                          title="Accéder aux données techniques"
                          aria-label="Voir les données techniques"
                        />
                        <span>Data</span>
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
                          onClick={() => handleDeletePoteau(poteau._id)}
                          aria-label={`Supprimer le poteau ${poteau.nom}`}
                        >
                          <i className="ri-delete-bin-line" />
                        </button>
                        <button
                          className="pt-action-btn detail"
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
                    <th>Nom du Poteau</th>
                    <th>Code</th>
                    <th>Ligne associée</th>
                    <th>Type</th>
                    <th>Statut</th>
                    <th>Data</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {paginatedPoteaux.length > 0 ? (
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
                            <i className="ri-cpu-line" />
                            {poteau.type}
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
                          <div className="pt-poteau-cell">
                            <i
                              className="ri-database-2-fill"
                              onClick={handleOpenDataPopup}
                              title="Accéder aux données techniques"
                              aria-label="Voir les données techniques"
                            />
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
                              onClick={() => handleDeletePoteau(poteau._id)}
                              aria-label={`Supprimer le poteau ${poteau.nom}`}
                            >
                              <i className="ri-delete-bin-line" />
                            </button>
                            <button
                              className="pt-action-btn detail"
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
      {dataPopup && <PoteauDataPopup onClose={handleCloseDataPopup} />}
      <ToastContainer position="top-right" autoClose={3000} />
    </div>
    </div>
  );
}

export default Poteaux;
