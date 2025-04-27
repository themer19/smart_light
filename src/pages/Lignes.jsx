import React, { useState, useEffect, useMemo } from 'react';
import clsx from 'clsx';
import Sidebar from '../components/Sidebar';
import KnobPopup from '../components/KwhPop';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import './cssP/Lignes.css';

function Lignes() {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [editLine, setEditLine] = useState(null);
  const [kwhPopup, setKwhPopup] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [isMobile, setIsMobile] = useState(window.innerWidth < 768);
  const [lines, setLines] = useState([
    { _id: 'ligne_1', nom: 'Ligne A', type: 'Aérienne', site: { nom: 'Site Alpha' }, tension: '220', status: 'Actif' },
    { _id: 'ligne_2', nom: 'Ligne B', type: 'Souterraine', site: { nom: 'Site Beta' }, tension: '380', status: 'Panne' },
    { _id: 'ligne_3', nom: 'Ligne C', type: 'Aérienne', site: { nom: 'Site Gamma' }, tension: '110', status: 'Maintenance' },
    { _id: 'ligne_4', nom: 'Ligne D', type: 'Souterraine', site: { nom: 'Site Alpha' }, tension: '220', status: 'Actif' },
    { _id: 'ligne_5', nom: 'Ligne E', type: 'Aérienne', site: { nom: 'Site Delta' }, tension: '380', status: 'Panne' },
    { _id: 'ligne_6', nom: 'Ligne F', type: 'Souterraine', site: { nom: 'Site Beta' }, tension: '110', status: 'Actif' },
    { _id: 'ligne_7', nom: 'Ligne G', type: 'Aérienne', site: { nom: 'Site Gamma' }, tension: '220', status: 'Maintenance' },
    { _id: 'ligne_8', nom: 'Ligne H', type: 'Souterraine', site: { nom: 'Site Delta' }, tension: '380', status: 'Actif' },
    { _id: 'ligne_9', nom: 'Ligne I', type: 'Aérienne', site: { nom: 'Site Alpha' }, tension: '110', status: 'Panne' },
    { _id: 'ligne_10', nom: 'Ligne J', type: 'Souterraine', site: { nom: 'Site Beta' }, tension: '220', status: 'Actif' },
    { _id: 'ligne_11', nom: 'Ligne K', type: 'Aérienne', site: { nom: 'Site Gamma' }, tension: '380', status: 'Actif' },
    { _id: 'ligne_12', nom: 'Ligne L', type: 'Souterraine', site: { nom: 'Site Delta' }, tension: '110', status: 'Maintenance' },
  ]);
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const linesPerPage = 10;

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

  const filteredLines = useMemo(() => {
    return lines.filter(
      (line) =>
        line.nom.toLowerCase().includes(searchTerm.toLowerCase()) ||
        line.type.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (line.site?.nom || '').toLowerCase().includes(searchTerm.toLowerCase())
    );
  }, [lines, searchTerm]);

  const totalPages = Math.ceil(filteredLines.length / linesPerPage);
  const paginatedLines = useMemo(() => {
    const startIndex = (currentPage - 1) * linesPerPage;
    return filteredLines.slice(startIndex, startIndex + linesPerPage);
  }, [filteredLines, currentPage]);

  const handlePageChange = (page) => {
    if (page >= 1 && page <= totalPages) {
      setCurrentPage(page);
    }
  };

  const handleOpenKwhPopup = () => {
    setKwhPopup(false);
    setTimeout(() => {
      setKwhPopup(true);
    }, 10);
  };

  const handleCloseKwhPopup = () => {
    setKwhPopup(false);
  };

  const handleSaveLine = (lineData) => {
    try {
      const newLine = {
        ...lineData,
        _id: `ligne_${Date.now()}`,
        site: { nom: lineData.site || 'Site non attribué' },
      };
      setLines([...lines, newLine]);
      toast.success('Ligne créée avec succès !');
      setIsModalOpen(false);
    } catch (error) {
      toast.error('🚨 Une erreur est survenue lors de la création de la ligne');
      console.error('Erreur:', error);
    }
  };

  const handleEditLine = (lineData) => {
    try {
      const updatedLines = lines.map((line) =>
        line._id === editLine._id
          ? { ...lineData, _id: editLine._id, site: { nom: lineData.site || 'Site non attribué' } }
          : line
      );
      setLines(updatedLines);
      toast.success('Ligne modifiée avec succès !');
      setIsEditModalOpen(false);
      setEditLine(null);
    } catch (error) {
      toast.error('🚨 Une erreur est survenue lors de la modification de la ligne');
      console.error('Erreur:', error);
    }
  };

  const handleDeleteLine = (lineId) => {
    try {
      setLines(lines.filter((line) => line._id !== lineId));
      toast.success('Ligne supprimée avec succès !');
    } catch (error) {
      toast.error('🚨 Une erreur est survenue lors de la suppression de la ligne');
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

  const handleOpenEditModal = (line) => {
    setEditLine(line);
    setIsEditModalOpen(true);
  };

  return (
    <div class="lignes-page">
    <div className="sm-container" style={{ display: 'flex', minHeight: '100vh' }}>
      <Sidebar
        onToggle={handleSidebarToggle}
        className={clsx('sm-sidebar', {
          'sm-sidebar-open': sidebarOpen,
          'sm-sidebar-collapsed': !sidebarOpen,
        })}
      />
      <main
        className={clsx('sm-main-content', {
          'sm-sidebar-collapsed': !sidebarOpen || isMobile,
        })}
        style={{
          flex: 1,
          marginLeft: 0,
          paddingLeft: 0,
          marginTop: '2rem',
        }}
      >
        <div className="sm-dashboard-card">
          <div className="sm-page-header">
            <div className="sm-header-content">
              <div className="sm-title-wrapper">
                <div className="sm-title-icon-container">
                  <i className="ri-node-tree sm-main-icon"></i>
                </div>
                <div>
                  <h1 className="sm-main-title">
                    Gestion des Lignes
                    <span className="sm-title-underline"></span>
                  </h1>
                  <p className="sm-subtitle">Administrez l'ensemble de vos lignes électriques</p>
                </div>
              </div>
              <button
                className="sm-add-line-btn sm-btn-primary"
                onClick={() => setIsModalOpen(true)}
                aria-label="Ajouter une nouvelle ligne"
              >
                <i className="ri-add-circle-line"></i>
                <span>Nouvelle ligne</span>
              </button>
              {isModalOpen && (
                <AddLineModal onClose={() => setIsModalOpen(false)} onSave={handleSaveLine} />
              )}
              {isEditModalOpen && (
                <AddLineModal
                  onClose={() => {
                    setIsEditModalOpen(false);
                    setEditLine(null);
                  }}
                  onSave={handleEditLine}
                  initialData={editLine}
                />
              )}
            </div>
          </div>

          <div className="sm-card-header">
            <div className="sm-list-header-wrapper">
              <div className="sm-list-title-container">
                <i className="ri-table-2 sm-list-icon"></i>
                <h2 className="sm-list-title">
                  Liste des Lignes
                  <span className="sm-line-count">{filteredLines.length} ligne(s)</span>
                </h2>
              </div>
              <div className="sm-search-filter-container">
                <div className="sm-search-box">
                  <i className="ri-search-line sm-search-icon"></i>
                  <input
                    id="line-search"
                    type="text"
                    placeholder="Rechercher une ligne..."
                    className="sm-search-input"
                    value={searchTerm}
                    onChange={handleSearchChange}
                  />
                  {searchTerm && (
                    <i
                      className="ri-close-line sm-clear-icon"
                      onClick={handleClearSearch}
                      aria-label="Effacer la recherche"
                    ></i>
                  )}
                </div>
                <div className="sm-filter-group">
                  <button className="sm-btn-secondary" aria-label="Filtrer les lignes">
                    <i className="ri-filter-3-line"></i>
                    <span>Filtrer</span>
                  </button>
                  <button
                    className="sm-sort-btn sm-btn-secondary"
                    aria-label="Trier les lignes"
                  >
                    <i className="ri-arrow-up-down-line"></i>
                  </button>
                </div>
              </div>
            </div>
          </div>

          {isMobile ? (
            <div className="sm-line-cards">
              {paginatedLines.length > 0 ? (
                paginatedLines.map((line, i) => (
                  <div className="sm-line-card" key={line._id}>
                    <div className="sm-line-card-header">
                      <div className="sm-line-card-title">
                        <span className="sm-line-number">{(currentPage - 1) * linesPerPage + i + 1}.</span>
                        <i className="ri-flashlight-fill" />
                        <span>{line.nom}</span>
                      </div>
                    </div>
                    <div className="sm-line-card-body">
                      <div className="sm-line-card-item">
                        <i className="ri-home-4-line" />
                        <span>{line.site?.nom || 'Site non attribué'}</span>
                      </div>
                      <div className="sm-line-card-item">
                        <i className="ri-cpu-line" />
                        <span>{line.type}</span>
                      </div>
                      <div className="sm-line-card-item">
                        <i
                          className={`ri-${
                            line.status === 'Actif'
                              ? 'flashlight-fill'
                              : line.status === 'Panne'
                              ? 'error-warning-fill'
                              : 'settings-3-fill'
                          }`}
                        />
                        <span
                          className={clsx('sm-status-badge', {
                            active: line.status === 'Actif',
                            inactive: line.status !== 'Actif',
                          })}
                        >
                          {line.status}
                        </span>
                      </div>
                      <div className="sm-line-card-item">
                        <i
                          className="ri-database-2-fill"
                          onClick={handleOpenKwhPopup}
                          title="Accéder aux données techniques"
                          aria-label="Voir les données techniques"
                        />
                        <span>Data</span>
                      </div>
                    </div>
                    <div className="sm-line-card-footer">
                      <div className="sm-action-buttons">
                        <button
                          className="sm-action-btn edit"
                          onClick={() => handleOpenEditModal(line)}
                          aria-label={`Modifier la ligne ${line.nom}`}
                        >
                          <i className="ri-edit-line" />
                        </button>
                        <button
                          className="sm-action-btn delete"
                          onClick={() => handleDeleteLine(line._id)}
                          aria-label={`Supprimer la ligne ${line.nom}`}
                        >
                          <i className="ri-delete-bin-line" />
                        </button>
                        <button
                          className="sm-action-btn detail"
                          title="Voir détails"
                          aria-label={`Voir les détails de la ligne ${line.nom}`}
                        >
                          <i className="ri-eye-line" />
                        </button>
                      </div>
                    </div>
                  </div>
                ))
              ) : (
                <div className="sm-no-lines">Aucune ligne disponible.</div>
              )}
            </div>
          ) : (
            <div className="sm-table-responsive">
              <table className="sm-lines-table">
                <thead>
                  <tr>
                    <th>Nom de la Ligne</th>
                    <th>Site associé</th>
                    <th>Type</th>
                    <th>Tension</th>
                    <th>Status</th>
                    <th>Data</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {paginatedLines.length > 0 ? (
                    paginatedLines.map((line, i) => (
                      <tr key={line._id}>
                        <td>
                          <div className="sm-line-name">
                            <span className="sm-line-number">{(currentPage - 1) * linesPerPage + i + 1}.</span>
                            <i className="ri-flashlight-fill" />
                            <div>
                              <span>{line.nom}</span>
                            </div>
                          </div>
                        </td>
                        <td>
                          <div className="sm-site-cell">
                            <i className="ri-home-4-line" />
                            {line.site?.nom || 'Site non attribué'}
                          </div>
                        </td>
                        <td>
                          <div className="sm-type-cell">
                            <i className="ri-cpu-line" />
                            {line.type}
                          </div>
                        </td>
                        <td>
                          <div className="sm-tension-cell">
                            <i className="ri-battery-2-charge-line" />
                            {line.tension || 'N/A'} V
                          </div>
                        </td>
                        <td>
                          <div className="sm-zone-cell">
                            <i
                              className={`ri-${
                                line.status === 'Actif'
                                  ? 'flashlight-fill'
                                  : line.status === 'Panne'
                                  ? 'error-warning-fill'
                                  : 'settings-3-fill'
                              }`}
                            />
                            <span
                              className={clsx('sm-status-badge', {
                                active: line.status === 'Actif',
                                inactive: line.status !== 'Actif',
                              })}
                            >
                              {line.status}
                            </span>
                          </div>
                        </td>
                        <td>
                          <div className="sm-points-cell">
                            <i
                              className="ri-database-2-fill"
                              onClick={handleOpenKwhPopup}
                              title="Accéder aux données techniques"
                              aria-label="Voir les données techniques"
                            />
                          </div>
                        </td>
                        <td>
                          <div className="sm-action-buttons">
                            <button
                              className="sm-action-btn edit"
                              onClick={() => handleOpenEditModal(line)}
                              aria-label={`Modifier la ligne ${line.nom}`}
                            >
                              <i className="ri-edit-line" />
                            </button>
                            <button
                              className="sm-action-btn delete"
                              onClick={() => handleDeleteLine(line._id)}
                              aria-label={`Supprimer la ligne ${line.nom}`}
                            >
                              <i className="ri-delete-bin-line" />
                            </button>
                            <button
                              className="sm-action-btn detail"
                              title="Voir détails"
                              aria-label={`Voir les détails de la ligne ${line.nom}`}
                            >
                              <i className="ri-eye-line" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan="7" className="sm-no-lines">
                        Aucune ligne disponible.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          )}

          <div className="sm-table-footer">
            <div className="sm-pagination-info">
              Affichage {(currentPage - 1) * linesPerPage + 1}-
              {Math.min(currentPage * linesPerPage, filteredLines.length)} sur{' '}
              {filteredLines.length} ligne(s)
            </div>
            <div className="sm-pagination-controls">
              <button
                className="sm-pagination-btn"
                onClick={() => handlePageChange(currentPage - 1)}
                disabled={currentPage === 1}
                aria-label="Page précédente"
              >
                <i className="ri-arrow-left-s-line"></i>
              </button>
              <span>{currentPage}</span>
              <button
                className="sm-pagination-btn"
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
      {kwhPopup && <KnobPopup onClose={handleCloseKwhPopup} />}
      <ToastContainer position="top-right" autoClose={3000} />
    </div></div>
  );
}

export default Lignes;