import React, { useState, useEffect, useMemo } from 'react';
import clsx from 'clsx';
import Sidebar from '../components/Sidebar';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import './cssP/Licences.css';

function Licences() {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [editLicence, setEditLicence] = useState(null);
  const [dataPopup, setDataPopup] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [isMobile, setIsMobile] = useState(window.innerWidth < 768);
  const [licences, setLicences] = useState([
    { _id: 'licence_1', nom: 'Licence A', type: 'Logiciel', site: { nom: 'Site Alpha' }, dateExpiration: '2025-12-31', statut: 'Active' },
    { _id: 'licence_2', nom: 'Licence B', type: 'Matériel', site: { nom: 'Site Beta' }, dateExpiration: '2024-06-30', statut: 'Expirée' },
    { _id: 'licence_3', nom: 'Licence C', type: 'Service', site: { nom: 'Site Gamma' }, dateExpiration: '2026-03-15', statut: 'Active' },
    { _id: 'licence_4', nom: 'Licence D', type: 'Logiciel', site: { nom: 'Site Alpha' }, dateExpiration: '2025-09-01', statut: 'En attente' },
    { _id: 'licence_5', nom: 'Licence E', type: 'Matériel', site: { nom: 'Site Delta' }, dateExpiration: '2025-11-20', statut: 'Active' },
    { _id: 'licence_6', nom: 'Licence F', type: 'Service', site: { nom: 'Site Beta' }, dateExpiration: '2024-12-01', statut: 'Expirée' },
    { _id: 'licence_7', nom: 'Licence G', type: 'Logiciel', site: { nom: 'Site Gamma' }, dateExpiration: '2026-01-10', statut: 'Active' },
    { _id: 'licence_8', nom: 'Licence H', type: 'Matériel', site: { nom: 'Site Delta' }, dateExpiration: '2025-07-15', statut: 'En attente' },
    { _id: 'licence_9', nom: 'Licence I', type: 'Service', site: { nom: 'Site Alpha' }, dateExpiration: '2025-05-30', statut: 'Active' },
    { _id: 'licence_10', nom: 'Licence J', type: 'Logiciel', site: { nom: 'Site Beta' }, dateExpiration: '2024-08-20', statut: 'Expirée' },
    { _id: 'licence_11', nom: 'Licence K', type: 'Matériel', site: { nom: 'Site Gamma' }, dateExpiration: '2026-02-28', statut: 'Active' },
    { _id: 'licence_12', nom: 'Licence L', type: 'Service', site: { nom: 'Site Delta' }, dateExpiration: '2025-10-05', statut: 'En attente' },
  ]);
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const licencesPerPage = 10;

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

  const filteredLicences = useMemo(() => {
    return licences.filter(
      (licence) =>
        licence.nom.toLowerCase().includes(searchTerm.toLowerCase()) ||
        licence.type.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (licence.site?.nom || '').toLowerCase().includes(searchTerm.toLowerCase())
    );
  }, [licences, searchTerm]);

  const totalPages = Math.ceil(filteredLicences.length / licencesPerPage);
  const paginatedLicences = useMemo(() => {
    const startIndex = (currentPage - 1) * licencesPerPage;
    return filteredLicences.slice(startIndex, startIndex + licencesPerPage);
  }, [filteredLicences, currentPage]);

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

  const handleSaveLicence = (licenceData) => {
    try {
      const newLicence = {
        ...licenceData,
        _id: `licence_${Date.now()}`,
        site: { nom: licenceData.site || 'Site non attribué' },
      };
      setLicences([...licences, newLicence]);
      toast.success('Licence créée avec succès !');
      setIsModalOpen(false);
    } catch (error) {
      toast.error('🚨 Une erreur est survenue lors de la création de la licence');
      console.error('Erreur:', error);
    }
  };

  const handleEditLicence = (licenceData) => {
    try {
      const updatedLicences = licences.map((licence) =>
        licence._id === editLicence._id
          ? { ...licenceData, _id: editLicence._id, site: { nom: licenceData.site || 'Site non attribué' } }
          : licence
      );
      setLicences(updatedLicences);
      toast.success('Licence modifiée avec succès !');
      setIsEditModalOpen(false);
      setEditLicence(null);
    } catch (error) {
      toast.error('🚨 Une erreur est survenue lors de la modification de la licence');
      console.error('Erreur:', error);
    }
  };

  const handleDeleteLicence = (licenceId) => {
    try {
      setLicences(licences.filter((licence) => licence._id !== licenceId));
      toast.success('Licence supprimée avec succès !');
    } catch (error) {
      toast.error('🚨 Une erreur est survenue lors de la suppression de la licence');
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

  const handleOpenEditModal = (licence) => {
    setEditLicence(licence);
    setIsEditModalOpen(true);
  };

  return (
    <div className='licences-page'>
    <div className="lc-container" style={{ display: 'flex', minHeight: '100vh' }}>
      <Sidebar
        onToggle={handleSidebarToggle}
        className={clsx('lc-sidebar', {
          'lc-sidebar-open': sidebarOpen,
          'lc-sidebar-collapsed': !sidebarOpen,
        })}
      />
      <main
        className={clsx('lc-main-content', {
          'lc-sidebar-collapsed': !sidebarOpen || isMobile,
        })}
        style={{
          flex: 1,
          marginLeft: 0,
          paddingLeft: 0,
          marginTop: '2rem',
        }}
      >
        <div className="lc-dashboard-card">
          <div className="lc-page-header">
            <div className="lc-header-content">
              <div className="lc-title-wrapper">
                <div className="lc-title-icon-container">
                  <i className="ri-file-text-line lc-main-icon"></i>
                </div>
                <div>
                  <h1 className="lc-main-title">
                    Gestionnaire de Licences
                    <span className="lc-title-underline"></span>
                  </h1>
                  <p className="lc-subtitle">Administrez l'ensemble de vos licences</p>
                </div>
              </div>
              <button
                className="lc-add-licence-btn lc-btn-primary"
                onClick={() => setIsModalOpen(true)}
                aria-label="Ajouter une nouvelle licence"
              >
                <i className="ri-add-circle-line"></i>
                <span>Nouvelle licence</span>
              </button>
              {isModalOpen && (
                <AddLicenceModal onClose={() => setIsModalOpen(false)} onSave={handleSaveLicence} />
              )}
              {isEditModalOpen && (
                <AddLicenceModal
                  onClose={() => {
                    setIsEditModalOpen(false);
                    setEditLicence(null);
                  }}
                  onSave={handleEditLicence}
                  initialData={editLicence}
                />
              )}
            </div>
          </div>

          <div className="lc-card-header">
            <div className="lc-list-header-wrapper">
              <div className="lc-list-title-container">
                <i className="ri-table-2 lc-list-icon"></i>
                <h2 className="lc-list-title">
                  Liste des Licences
                  <span className="lc-licence-count">{filteredLicences.length} licence(s)</span>
                </h2>
              </div>
              <div className="lc-search-filter-container">
                <div className="lc-search-box">
                  <i className="ri-search-line lc-search-icon"></i>
                  <input
                    id="licence-search"
                    type="text"
                    placeholder="Rechercher une licence..."
                    className="lc-search-input"
                    value={searchTerm}
                    onChange={handleSearchChange}
                  />
                  {searchTerm && (
                    <i
                      className="ri-close-line lc-clear-icon"
                      onClick={handleClearSearch}
                      aria-label="Effacer la recherche"
                    ></i>
                  )}
                </div>
                <div className="lc-filter-group">
                  <button className="lc-btn-secondary" aria-label="Filtrer les licences">
                    <i className="ri-filter-3-line"></i>
                    <span>Filtrer</span>
                  </button>
                  <button
                    className="lc-sort-btn lc-btn-secondary"
                    aria-label="Trier les licences"
                  >
                    <i className="ri-arrow-up-down-line"></i>
                  </button>
                </div>
              </div>
            </div>
          </div>

          {isMobile ? (
            <div className="lc-licence-cards">
              {paginatedLicences.length > 0 ? (
                paginatedLicences.map((licence, i) => (
                  <div className="lc-licence-card" key={licence._id}>
                    <div className="lc-licence-card-header">
                      <div className="lc-licence-card-title">
                        <span className="lc-licence-number">{(currentPage - 1) * licencesPerPage + i + 1}.</span>
                        <i className="ri-file-text-line" />
                        <span>{licence.nom}</span>
                      </div>
                    </div>
                    <div className="lc-licence-card-body">
                      <div className="lc-licence-card-item">
                        <i className="ri-home-4-line" />
                        <span>{licence.site?.nom || 'Site non attribué'}</span>
                      </div>
                      <div className="lc-licence-card-item">
                        <i className="ri-cpu-line" />
                        <span>{licence.type}</span>
                      </div>
                      <div className="lc-licence-card-item">
                        <i className="ri-calendar-line" />
                        <span>{licence.dateExpiration}</span>
                      </div>
                      <div className="lc-licence-card-item">
                        <i
                          className={`ri-${
                            licence.statut === 'Active'
                              ? 'flashlight-fill'
                              : licence.statut === 'Expirée'
                              ? 'error-warning-fill'
                              : 'settings-3-fill'
                          }`}
                        />
                        <span
                          className={clsx('lc-status-badge', {
                            active: licence.statut === 'Active',
                            inactive: licence.statut !== 'Active',
                          })}
                        >
                          {licence.statut}
                        </span>
                      </div>
                      <div className="lc-licence-card-item">
                        <i
                          className="ri-database-2-fill"
                          onClick={handleOpenDataPopup}
                          title="Accéder aux données techniques"
                          aria-label="Voir les données techniques"
                        />
                        <span>Data</span>
                      </div>
                    </div>
                    <div className="lc-licence-card-footer">
                      <div className="lc-action-buttons">
                        <button
                          className="lc-action-btn edit"
                          onClick={() => handleOpenEditModal(licence)}
                          aria-label={`Modifier la licence ${licence.nom}`}
                        >
                          <i className="ri-edit-line" />
                        </button>
                        <button
                          className="lc-action-btn delete"
                          onClick={() => handleDeleteLicence(licence._id)}
                          aria-label={`Supprimer la licence ${licence.nom}`}
                        >
                          <i className="ri-delete-bin-line" />
                        </button>
                        <button
                          className="lc-action-btn detail"
                          title="Voir détails"
                          aria-label={`Voir les détails de la licence ${licence.nom}`}
                        >
                          <i className="ri-eye-line" />
                        </button>
                      </div>
                    </div>
                  </div>
                ))
              ) : (
                <div className="lc-no-licences">Aucune licence disponible.</div>
              )}
            </div>
          ) : (
            <div className="lc-table-responsive">
              <table className="lc-licences-table">
                <thead>
                  <tr>
                    <th>Nom de la Licence</th>
                    <th>Site associé</th>
                    <th>Type</th>
                    <th>Date d'Expiration</th>
                    <th>Statut</th>
                    <th>Data</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {paginatedLicences.length > 0 ? (
                    paginatedLicences.map((licence, i) => (
                      <tr key={licence._id}>
                        <td>
                          <div className="lc-licence-name">
                            <span className="lc-licence-number">{(currentPage - 1) * licencesPerPage + i + 1}.</span>
                            <i className="ri-file-text-line" />
                            <div>
                              <span>{licence.nom}</span>
                            </div>
                          </div>
                        </td>
                        <td>
                          <div className="lc-licence-cell">
                            <i className="ri-home-4-line" />
                            {licence.site?.nom || 'Site non attribué'}
                          </div>
                        </td>
                        <td>
                          <div className="lc-licence-cell">
                            <i className="ri-cpu-line" />
                            {licence.type}
                          </div>
                        </td>
                        <td>
                          <div className="lc-licence-cell">
                            <i className="ri-calendar-line" />
                            {licence.dateExpiration}
                          </div>
                        </td>
                        <td>
                          <div className="lc-licence-cell">
                            <i
                              className={`ri-${
                                licence.statut === 'Active'
                                  ? 'flashlight-fill'
                                  : licence.statut === 'Expirée'
                                  ? 'error-warning-fill'
                                  : 'settings-3-fill'
                              }`}
                            />
                            <span
                              className={clsx('lc-status-badge', {
                                active: licence.statut === 'Active',
                                inactive: licence.statut !== 'Active',
                              })}
                            >
                              {licence.statut}
                            </span>
                          </div>
                        </td>
                        <td>
                          <div className="lc-licence-cell">
                            <i
                              className="ri-database-2-fill"
                              onClick={handleOpenDataPopup}
                              title="Accéder aux données techniques"
                              aria-label="Voir les données techniques"
                            />
                          </div>
                        </td>
                        <td>
                          <div className="lc-action-buttons">
                            <button
                              className="lc-action-btn edit"
                              onClick={() => handleOpenEditModal(licence)}
                              aria-label={`Modifier la licence ${licence.nom}`}
                            >
                              <i className="ri-edit-line" />
                            </button>
                            <button
                              className="lc-action-btn delete"
                              onClick={() => handleDeleteLicence(licence._id)}
                              aria-label={`Supprimer la licence ${licence.nom}`}
                            >
                              <i className="ri-delete-bin-line" />
                            </button>
                            <button
                              className="lc-action-btn detail"
                              title="Voir détails"
                              aria-label={`Voir les détails de la licence ${licence.nom}`}
                            >
                              <i className="ri-eye-line" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan="7" className="lc-no-licences">
                        Aucune licence disponible.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          )}

          <div className="lc-table-footer">
            <div className="lc-pagination-info">
              Affichage {(currentPage - 1) * licencesPerPage + 1}-
              {Math.min(currentPage * licencesPerPage, filteredLicences.length)} sur{' '}
              {filteredLicences.length} licence(s)
            </div>
            <div className="lc-pagination-controls">
              <button
                className="lc-pagination-btn"
                onClick={() => handlePageChange(currentPage - 1)}
                disabled={currentPage === 1}
                aria-label="Page précédente"
              >
                <i className="ri-arrow-left-s-line"></i>
              </button>
              <span>{currentPage}</span>
              <button
                className="lc-pagination-btn"
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
      {dataPopup && <LicenceDataPopup onClose={handleCloseDataPopup} />}
      <ToastContainer position="top-right" autoClose={3000} />
    </div>
    </div>
  );
}

export default Licences;