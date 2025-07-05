import React, { useState, useEffect, useMemo } from 'react';
import clsx from 'clsx';
import axios from 'axios';
import { debounce } from 'lodash';
import Sidebar from '../components/Sidebar';
import KnobPopup from '../components/KwhPopline';
import LineManagement from '../components/LineManagement';
import LineDetailsModal from '../components/LineDetailsModal';
import LineEdit from '../components/LineEdit';
import DeleteLinePage from '../components/DeleteLinePage';
import { ToastContainer, toast } from 'react-toastify';
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
  const [poteauxCounts, setPoteauxCounts] = useState({});
  const [loadingCounts, setLoadingCounts] = useState(false);
  const linesPerPage = 10;

  const fetchLines = async () => {
    try {
      setLoadingCounts(true);
      const response = await axios.get(`http://localhost:5000/api/ligne?t=${Date.now()}`, {
        headers: { 'Cache-Control': 'no-cache' }
      });
      const fetchedLines = Array.isArray(response.data) ? response.data : [];
      console.log('Fetched lines:', JSON.stringify(fetchedLines, null, 2));
      setLines([...fetchedLines]); // Ensure new array reference

      const countPromises = fetchedLines.map(async (line) => {
        try {
          const countResponse = await axios.get(`http://localhost:5000/api/poteau/ligne/${line._id}/count`, {
            headers: { 'Cache-Control': 'no-cache' }
          });
          console.log(`Count for line ${line._id}:`, countResponse.data);
          return { ligneId: line._id, count: countResponse.data.count || 0 };
        } catch (error) {
          console.error(`Error fetching count for line ${line._id}:`, error.message);
          if (error.response && error.response.status !== 404) {
            toast.error(`Erreur lors du chargement des poteaux pour la ligne ${line.nom_L}`);
          }
          return { ligneId: line._id, count: 0 };
        }
      });

      const counts = await Promise.all(countPromises);
      console.log('All counts:', counts);
      const countsMap = counts.reduce((acc, { ligneId, count }) => {
        acc[ligneId] = count;
        return acc;
      }, {});
      console.log('Poteaux counts:', countsMap);
      setPoteauxCounts(countsMap);

      const totalPages = Math.ceil(fetchedLines.length / linesPerPage);
      console.log('Total pages:', totalPages, 'Current page:', currentPage);
      if (currentPage > totalPages && totalPages > 0) {
        console.log('Adjusting currentPage to:', totalPages);
        setCurrentPage(totalPages);
      } else if (fetchedLines.length === 0) {
        console.log('No lines, resetting currentPage to 1');
        setCurrentPage(1);
      }
    } catch (error) {
      console.error('Fetch lines error:', error.response?.data || error.message);
      toast.error('🚨 Erreur lors du chargement des lignes');
    } finally {
      setLoadingCounts(false);
    }
  };

  useEffect(() => {
    fetchLines();

    const handleResize = () => {
      const mobile = window.innerWidth < 768;
      setIsMobile(mobile);
      if (mobile) setSidebarOpen(false);
    };

    window.addEventListener('resize', handleResize);
    handleResize();
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  useEffect(() => {
    console.log('Lines state updated:', lines);
    console.log('Poteaux counts updated:', poteauxCounts);
    console.log('Current page:', currentPage);
  }, [lines, poteauxCounts, currentPage]);

  const debouncedSearch = useMemo(
    () =>
      debounce((value) => {
        console.log('Search term updated:', value);
        setSearchTerm(value);
        setCurrentPage(1);
      }, 300),
    []
  );

  const filteredLines = useMemo(() => {
    const filtered = lines.filter(
      (line) =>
        (line.nom_L || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
        (line.site?.nom || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
        String(poteauxCounts[line._id] || 0).includes(searchTerm.toLowerCase())
    );
    console.log('Filtered lines:', filtered);
    return filtered;
  }, [lines, searchTerm, poteauxCounts]);

  const totalPages = Math.ceil(filteredLines.length / linesPerPage);
  const paginatedLines = useMemo(() => {
    const startIndex = (currentPage - 1) * linesPerPage;
    const paginated = filteredLines.slice(startIndex, startIndex + linesPerPage);
    console.log('Paginated lines:', paginated);
    return paginated;
  }, [filteredLines, currentPage]);

  const handlePageChange = (page) => {
    if (page >= 1 && page <= totalPages) {
      console.log('Changing page to:', page);
      setCurrentPage(page);
    }
  };

  const handleOpenKwhPopup = (line) => {
    console.log('Opening KwhPopup for line:', line._id, line.nom_L);
    setSelectedLine(line);
    setKwhPopup(true);
  };

  const handleCloseKwhPopup = () => {
    console.log('Closing KwhPopup:', selectedLine);
    setKwhPopup(false);
    setSelectedLine(null);
  };

  const handleEditLine = async (updatedLine) => {
    if (!updatedLine?._id) {
      console.error('Invalid line data:', updatedLine);
      toast.error('🚨 Données de ligne invalides');
      return;
    }
    try {
      await axios.put(`http://localhost:5000/api/ligne/${updatedLine._id}`, updatedLine);
      await fetchLines();
      toast.success('Ligne mise à jour avec succès !');
      setIsEditModalOpen(false);
      setEditLine(null);
    } catch (error) {
      console.error('Edit line error:', error.response?.data || error.message);
      toast.error('🚨 Erreur lors de la mise à jour de la ligne');
    }
  };

  const handleDeleteLine = async (lineId, reason) => {
    console.log('handleDeleteLine called with lineId:', lineId, 'Reason:', reason);
    try {
      // Rely on DeleteLinePage to perform the deletion
      await new Promise(resolve => setTimeout(resolve, 500)); // Ensure backend sync
      await fetchLines();
      toast.success('Ligne supprimée avec succès !');
      setShowDeleteModal(false);
      setDeleteLineId(null);
    } catch (error) {
      console.error('Error refreshing lines after deletion:', error.response?.data || error.message);
      toast.error(`🚨 Erreur lors du rafraîchissement des lignes: ${error.response?.data?.message || error.message}`);
    }
  };

  const handleOpenDetailsModal = (line) => {
    const mappedLine = {
      _id: line._id,
      nom_L: line.nom_L,
      type: line.type,
      lengthKm: line.lengthKm || '0',
      site: line.site?.nom || 'Site non attribué',
      startPoint: line.startPoint || { name: 'Point A', lat: 36.8065, lng: 10.1815 },
      endPoint: line.endPoint || { name: 'Point B', lat: 36.8100, lng: 10.1900 },
      status: line.status,
      nombrePoteaux: poteauxCounts[line._id] || 0,
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
    debouncedSearch(e.target.value);
  };

  const handleClearSearch = () => {
    debouncedSearch('');
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
      startPoint: line.startPoint || { name: 'Point A', lat: 36.8065, lng: 10.1815 },
      endPoint: line.endPoint || { name: 'Point B', lat: 36.8100, lng: 10.1900 },
      status: line.status,
      nombrePoteaux: poteauxCounts[line._id] || 0,
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
                          <span>{loadingCounts ? 'Chargement...' : (poteauxCounts[line._id] || 0)} poteaux</span>
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
                <table className="sm-lines-table" key={lines.length}>
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
                              {loadingCounts ? 'Chargement...' : (poteauxCounts[line._id] || 0)} poteaux
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
            onSave={() => fetchLines()}
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