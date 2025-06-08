import React, { useState, useEffect, useMemo } from 'react';
import clsx from 'clsx';
import axios from 'axios';
import Sidebar from '../components/Sidebar';
import KnobPopup from '../components/KwhPopline';
import LineManagement from '../components/LineManagement';
import LineDetailsModal from '../components/LineDetailsModal';
import LineEdit from '../components/LineEdit';
import DeleteLinePage from '../components/DeleteLinePage';
import {  ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import './cssP/Lignes.css';

function Lignes() {
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [editLine, setEditLine] = useState(null);
  const [kwhPopup, setKwhPopup] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [showLineManagement, setShowLineManagement] = useState(false);
  const [showDetailsModal, setShowDetailsModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [deleteLineId, setDeleteLineId] = useState(null);
  const [selectedLine, setSelectedLine] = useState(null);
  const [isMobile, setIsMobile] = useState(window.innerWidth < 768);
  const [lines, setLines] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const linesPerPage = 10;

  const fetchLines = async () => {
    try {
      const response = await axios.get('http://localhost:5000/api/ligne');
      setLines(response.data);
      console.log('Fetched lines:', response.data);
    } catch (error) {
      console.error('Fetch lines error:', error);
      toast.error('🚨 Erreur lors du chargement des lignes');
    }
  };

  useEffect(() => {
    fetchLines();

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
        (line.nom_L || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
        (line.site?.nom || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
        String(line.nombrePoteaux || '').includes(searchTerm.toLowerCase())
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

  const handleOpenKwhPopup = (line) => {
    console.log('Opening KwhPopup for line:', line._id, line.nom_L);
    setSelectedLine(line);
    setKwhPopup(true);
  };

  const handleCloseKwhPopup = () => {
    console.log('Closing KwhPopup, selectedLine:', selectedLine);
    setKwhPopup(false);
    setSelectedLine(null);
  };

  const handleEditLine = (updatedLine) => {
  if (!updatedLine?._id) {
    console.error('Received invalid line data:', updatedLine);
    return;
  }

  setLines(prevLines => 
    prevLines.map(line => 
      line._id === updatedLine._id ? { ...line, ...updatedLine } : line
    )
  );
};

  const handleDeleteLine = async (lineId, reason) => {
    try {
      await axios.delete(`http://localhost:5000/api/ligne/${lineId}`);
      setLines(lines.filter((line) => line._id !== lineId));
      toast.success('Ligne supprimée avec succès !');
      setShowDeleteModal(false);
      setDeleteLineId(null);
      fetchLines();
    } catch (error) {
      console.error('Delete line error:', error);
      toast.error('🚨 Une erreur est survenue lors de la suppression de la ligne');
    }
  };

  const handleOpenDetailsModal = (line) => {
    const mappedLine = {
      _id: line._id,
      nom_L: line.nom_L,
      type: line.type,
      lengthKm: line.lengthKm || '0',
      site: line.site?.nom || 'Site non attribué',
      startPoint: line.startPoint || { name: 'Point A', lat: 48.8566, lng: 2.3522 },
      endPoint: line.endPoint || { name: 'Point B', lat: 48.8600, lng: 2.3600 },
      status: line.status,
      nombrePoteaux: line.nombrePoteaux || 0,
      type_conducteur: line.type_conducteur || '',
      description: line.description || '',
      code: line.code || '',
    };
    setSelectedLine(mappedLine);
    setShowDetailsModal(true);
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
    const mappedLine = {
      _id: line._id,
      nom_L: line.nom_L,
      type: line.type,
      lengthKm: line.lengthKm || '0',
      type_conducteur: line.type_conducteur || '',
      description: line.description || '',
      site: line.site?._id || '',
      startPoint: line.startPoint || { name: 'Point A', lat: 48.8566, lng: 2.3522 },
      endPoint: line.endPoint || { name: 'Point B', lat: 48.8600, lng: 2.3600 },
      status: line.status,
      nombrePoteaux: line.nombrePoteaux || 0,
      code: line.code || '',
    };
    setEditLine(mappedLine);
    setIsEditModalOpen(true);
  };

  return (
    <div className="lignes-page">
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
                  onClick={() => setShowLineManagement(true)}
                  aria-label="Ajouter une nouvelle ligne"
                >
                  <i className="ri-add-circle-line"></i>
                  <span>Nouvelle ligne</span>
                </button>
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
                          <span>{line.nom_L}</span>
                        </div>
                      </div>
                      <div className="sm-line-card-body">
                        <div className="sm-line-card-item">
                          <i className="ri-home-4-line" />
                          <span>{line.site?.nom || 'Site non attribué'}</span>
                        </div>
                        <div className="sm-line-card-item">
                          <i className="ri-pantone-line" />
                          <span>{line.nombrePoteaux || 0} poteaux</span>
                        </div>
                        <div className="sm-line-card-item">
                          <i
                            className={`ri-${
                              line.status === 'Active'
                                ? 'flashlight-fill'
                                : line.status === 'Panne'
                                ? 'error-warning-fill'
                                : 'settings-3-fill'
                            }`}
                          />
                          <span
                            className={clsx('sm-status-badge', {
                              active: line.status === 'Active',
                              inactive: line.status !== 'Active',
                            })}
                          >
                            {line.status}
                          </span>
                        </div>
                        <div className="sm-line-card-item">
                          <i
                            className="ri-database-2-fill"
                            onClick={() => handleOpenKwhPopup(line)}
                            title="Accéder aux données techniques"
                            aria-label="Voir les données techniques"
                            style={{ cursor: 'pointer', zIndex: 10 }}
                          />
                          <span>Data</span>
                        </div>
                      </div>
                      <div className="sm-line-card-footer">
                        <div className="sm-action-buttons">
                          <button
                            className="sm-action-btn edit"
                            onClick={() => handleOpenEditModal(line)}
                            aria-label={`Modifier la ligne ${line.nom_L}`}
                          >
                            <i className="ri-edit-line" />
                          </button>
                          <button
                            className="sm-action-btn delete"
                            onClick={() => {
                              setDeleteLineId(line._id);
                              setShowDeleteModal(true);
                            }}
                            aria-label={`Supprimer la ligne ${line.nom_L}`}
                          >
                            <i className="ri-delete-bin-line" />
                          </button>
                          <button
                            className="sm-action-btn detail"
                            onClick={() => handleOpenDetailsModal(line)}
                            title="Voir détails"
                            aria-label={`Voir les détails de la ligne ${line.nom_L}`}
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
                      <th>
                        <div className="table-header-with-icon">
                          <i className="ri-flashlight-line" />
                          <span>Nom de la Ligne</span>
                        </div>
                      </th>
                      <th>
                        <div className="table-header-with-icon">
                          <i className="ri-building-line" />
                          <span>Site associé</span>
                        </div>
                      </th>
                      <th>
                        <div className="table-header-with-icon">
                          <i className="ri-battery-2-charge-line" />
                          <span>Tension</span>
                        </div>
                      </th>
                      <th>
                        <div className="table-header-with-icon">
                          <i className="ri-stack-line" />
                          <span>Poteaux associés</span>
                        </div>
                      </th>
                      <th>
                        <div className="table-header-with-icon">
                          <i className="ri-checkbox-circle-line" />
                          <span>Status</span>
                        </div>
                      </th>
                      <th>
                        <div className="table-header-with-icon">
                          <i className="ri-database-2-line" />
                          <span>Data</span>
                        </div>
                      </th>
                      <th>
                        <div className="table-header-with-icon">
                          <i className="ri-settings-2-line" />
                          <span>Actions</span>
                        </div>
                      </th>
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
                                <span>{line.nom_L}</span>
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
                            <div className="sm-tension-cell">
                              <i className="ri-battery-2-charge-line" />
                              {line.type || 'N/A'}
                            </div>
                          </td>
                          <td>
                            <div className="sm-poles-cell">
                              <i className="ri-lightbulb-line" />
                              {line.nombrePoteaux || 0} poteaux
                            </div>
                          </td>
                          <td>
                            <div className="sm-zone-cell">
                              <i
                                className={`ri-${
                                  line.status === 'Active'
                                    ? 'flashlight-fill'
                                    : line.status === 'Panne'
                                    ? 'error-warning-fill'
                                    : 'settings-3-fill'
                                }`}
                              />
                              <span
                                className={clsx('sm-status-badge', {
                                  active: line.status === 'Active',
                                  inactive: line.status !== 'Active',
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
                                onClick={() => handleOpenKwhPopup(line)}
                                title="Accéder aux données techniques"
                                aria-label="Voir les données techniques"
                                style={{ cursor: 'pointer', zIndex: 10 }}
                              />
                            </div>
                          </td>
                          <td>
                            <div className="sm-action-buttons">
                              <button
                                className="sm-action-btn edit"
                                onClick={() => handleOpenEditModal(line)}
                                aria-label={`Modifier la ligne ${line.nom_L}`}
                              >
                                <i className="ri-edit-line" />
                              </button>
                              <button
                                className="sm-action-btn delete"
                                onClick={() => {
                                  setDeleteLineId(line._id);
                                  setShowDeleteModal(true);
                                }}
                                aria-label={`Supprimer la ligne ${line.nom_L}`}
                              >
                                <i className="ri-delete-bin-line" />
                              </button>
                              <button
                                className="sm-action-btn detail"
                                onClick={() => handleOpenDetailsModal(line)}
                                title="Voir détails"
                                aria-label={`Voir les détails de la ligne ${line.nom_L}`}
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
        {kwhPopup && selectedLine && (
          <KnobPopup 
            onClose={handleCloseKwhPopup}
            line={selectedLine}
            key={selectedLine._id}
          />
        )}
        {showLineManagement && (
          <LineManagement
            visible={showLineManagement}
            onHide={() => setShowLineManagement(false)}
          />
        )}
        {showDetailsModal && selectedLine && (
          <LineDetailsModal
            line={selectedLine}
            onClose={() => setShowDetailsModal(false)}
          />
        )}
        {isEditModalOpen && editLine && (
          <LineEdit
            visible={isEditModalOpen}
            onHide={() => {
              setIsEditModalOpen(false);
              setEditLine(null);
            }}
            line={editLine}
            onSave={handleEditLine}
          />
        )}
        {showDeleteModal && deleteLineId && (
          <DeleteLinePage
            lineId={deleteLineId}
            onClose={() => {
              setShowDeleteModal(false);
              setDeleteLineId(null);
            }}
            onSave={(reason) => handleDeleteLine(deleteLineId, reason)}
          />
        )}
        <ToastContainer position="top-right" autoClose={3000} />
      </div>
    </div>
  );
}

export default Lignes;