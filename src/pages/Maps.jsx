import React, { useState, useEffect, useMemo } from 'react';
import clsx from 'clsx';
import { MapContainer, TileLayer, Marker, Popup, useMapEvents } from 'react-leaflet';
import Sidebar from '../components/Sidebar';
import './cssP/Maps.css';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import 'leaflet/dist/leaflet.css';
function Maps() {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [editMarqueur, setEditMarqueur] = useState(null);
  const [dataPopup, setDataPopup] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [isMobile, setIsMobile] = useState(window.innerWidth < 768);
  const [marqueurs, setMarqueurs] = useState([
    { _id: 'marqueur_1', nom: 'Site Alpha', type: 'Site', coordonnees: [48.8566, 2.3522], statut: 'Actif' },
    { _id: 'marqueur_2', nom: 'Ligne A', type: 'Ligne', coordonnees: [48.8600, 2.3500], statut: 'Inactif' },
    { _id: 'marqueur_3', nom: 'Site Beta', type: 'Site', coordonnees: [48.8500, 2.3600], statut: 'Actif' },
    { _id: 'marqueur_4', nom: 'Ligne B', type: 'Ligne', coordonnees: [48.8700, 2.3400], statut: 'Actif' },
    { _id: 'marqueur_5', nom: 'Site Gamma', type: 'Site', coordonnees: [48.8400, 2.3700], statut: 'Inactif' },
    { _id: 'marqueur_6', nom: 'Ligne C', type: 'Ligne', coordonnees: [48.8800, 2.3300], statut: 'Actif' },
    { _id: 'marqueur_7', nom: 'Site Delta', type: 'Site', coordonnees: [48.8300, 2.3800], statut: 'Actif' },
    { _id: 'marqueur_8', nom: 'Ligne D', type: 'Ligne', coordonnees: [48.8900, 2.3200], statut: 'Inactif' },
    { _id: 'marqueur_9', nom: 'Site Epsilon', type: 'Site', coordonnees: [48.8200, 2.3900], statut: 'Actif' },
    { _id: 'marqueur_10', nom: 'Ligne E', type: 'Ligne', coordonnees: [48.9000, 2.3100], statut: 'Actif' },
    { _id: 'marqueur_11', nom: 'Site Zeta', type: 'Site', coordonnees: [48.8100, 2.4000], statut: 'Inactif' },
    { _id: 'marqueur_12', nom: 'Ligne F', type: 'Ligne', coordonnees: [48.9100, 2.3000], statut: 'Actif' },
  ]);
  const [searchTerm, setSearchTerm] = useState('');
  const [searchType, setSearchType] = useState('all'); // 'all', 'site', 'ligne'
  const [currentPage, setCurrentPage] = useState(1);
  const marqueursPerPage = 10;

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

  const filteredMarqueurs = useMemo(() => {
    return marqueurs.filter((marqueur) => {
      const matchesSearch = marqueur.nom.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesType =
        searchType === 'all' ||
        (searchType === 'site' && marqueur.type === 'Site') ||
        (searchType === 'ligne' && marqueur.type === 'Ligne');
      return matchesSearch && matchesType;
    });
  }, [marqueurs, searchTerm, searchType]);

  const totalPages = Math.ceil(filteredMarqueurs.length / marqueursPerPage);
  const paginatedMarqueurs = useMemo(() => {
    const startIndex = (currentPage - 1) * marqueursPerPage;
    return filteredMarqueurs.slice(startIndex, startIndex + marqueursPerPage);
  }, [filteredMarqueurs, currentPage]);

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

  const handleSaveMarqueur = (marqueurData) => {
    try {
      const newMarqueur = {
        ...marqueurData,
        _id: `marqueur_${Date.now()}`,
        coordonnees: [
          parseFloat(marqueurData.latitude || 48.8566),
          parseFloat(marqueurData.longitude || 2.3522),
        ],
      };
      setMarqueurs([...marqueurs, newMarqueur]);
      toast.success('Marqueur créé avec succès !');
      setIsModalOpen(false);
    } catch (error) {
      toast.error('🚨 Une erreur est survenue lors de la création du marqueur');
      console.error('Erreur:', error);
    }
  };

  const handleEditMarqueur = (marqueurData) => {
    try {
      const updatedMarqueurs = marqueurs.map((marqueur) =>
        marqueur._id === editMarqueur._id
          ? {
              ...marqueurData,
              _id: editMarqueur._id,
              coordonnees: [
                parseFloat(marqueurData.latitude || marqueur.coordonnees[0]),
                parseFloat(marqueurData.longitude || marqueur.coordonnees[1]),
              ],
            }
          : marqueur
      );
      setMarqueurs(updatedMarqueurs);
      toast.success('Marqueur modifié avec succès !');
      setIsEditModalOpen(false);
      setEditMarqueur(null);
    } catch (error) {
      toast.error('🚨 Une erreur est survenue lors de la modification du marqueur');
      console.error('Erreur:', error);
    }
  };

  const handleDeleteMarqueur = (marqueurId) => {
    try {
      setMarqueurs(marqueurs.filter((marqueur) => marqueur._id !== marqueurId));
      toast.success('Marqueur supprimé avec succès !');
    } catch (error) {
      toast.error('🚨 Une erreur est survenue lors de la suppression du marqueur');
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

  const handleTypeChange = (e) => {
    setSearchType(e.target.value);
    setCurrentPage(1);
  };

  const handleOpenEditModal = (marqueur) => {
    setEditMarqueur(marqueur);
    setIsEditModalOpen(true);
  };

  const MapClickHandler = () => {
    useMapEvents({
      click(e) {
        setIsModalOpen(true);
        setEditMarqueur({
          latitude: e.latlng.lat,
          longitude: e.latlng.lng,
        });
      },
    });
    return null;
  };

  return (
    <div className='map-page'>
    <div className="mp-container" style={{ display: 'flex', minHeight: '100vh' }}>
      <Sidebar
        onToggle={handleSidebarToggle}
        className={clsx('mp-sidebar', {
          'mp-sidebar-open': sidebarOpen,
          'mp-sidebar-collapsed': !sidebarOpen,
        })}
      />
      <main
        className={clsx('mp-main-content', {
          'mp-sidebar-collapsed': !sidebarOpen || isMobile,
        })}
        style={{
          flex: 1,
          marginLeft: 0,
          paddingLeft: 0,
          marginTop: '2rem',
        }}
      >
        <div className="mp-dashboard-card">
          <div className="mp-page-header">
            <div className="mp-header-content">
              <div className="mp-title-wrapper">
                <div className="mp-title-icon-container">
                  <i className="ri-map-pin-line mp-main-icon"></i>
                </div>
                <div>
                  <h1 className="mp-main-title">
                    Gestion de Maps
                    <span className="mp-title-underline"></span>
                  </h1>
                  <p className="mp-subtitle">Visualisez et gérez vos sites et lignes sur la carte</p>
                </div>
              </div>
              <button
                className="mp-add-marqueur-btn mp-btn-primary"
                onClick={() => setIsModalOpen(true)}
                aria-label="Ajouter un nouveau marqueur"
              >
                <i className="ri-add-circle-line"></i>
                <span>Nouveau marqueur</span>
              </button>
              {isModalOpen && (
                <AddMarqueurModal
                  onClose={() => {
                    setIsModalOpen(false);
                    setEditMarqueur(null);
                  }}
                  onSave={handleSaveMarqueur}
                  initialData={editMarqueur}
                />
              )}
              {isEditModalOpen && (
                <AddMarqueurModal
                  onClose={() => {
                    setIsEditModalOpen(false);
                    setEditMarqueur(null);
                  }}
                  onSave={handleEditMarqueur}
                  initialData={editMarqueur}
                />
              )}
            </div>
          </div>

          <div className="mp-map-container">
            <MapContainer
              center={[48.8566, 2.3522]}
              zoom={13}
              style={{ height: '400px', width: '100%', borderRadius: '8px' }}
            >
              <TileLayer
                url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
              />
              {filteredMarqueurs.map((marqueur) => (
                <Marker key={marqueur._id} position={marqueur.coordonnees}>
                  <Popup>
                    <strong>{marqueur.nom}</strong>
                    <br />
                    Type: {marqueur.type}
                    <br />
                    Statut: {marqueur.statut}
                  </Popup>
                </Marker>
              ))}
              <MapClickHandler />
            </MapContainer>
          </div>

          <div className="mp-card-header">
            <div className="mp-list-header-wrapper">
              <div className="mp-list-title-container">
                <i className="ri-table-2 mp-list-icon"></i>
                <h2 className="mp-list-title">
                  Liste des Marqueurs
                  <span className="mp-marqueur-count">{filteredMarqueurs.length} marqueur(s)</span>
                </h2>
              </div>
              <div className="mp-search-filter-container">
                <div className="mp-search-box">
                  <i className="ri-search-line mp-search-icon"></i>
                  <input
                    id="marqueur-search"
                    type="text"
                    placeholder="Rechercher un marqueur..."
                    className="mp-search-input"
                    value={searchTerm}
                    onChange={handleSearchChange}
                  />
                  {searchTerm && (
                    <i
                      className="ri-close-line mp-clear-icon"
                      onClick={handleClearSearch}
                      aria-label="Effacer la recherche"
                    ></i>
                  )}
                </div>
                <div className="mp-filter-group">
                  <select
                    className="mp-type-filter"
                    value={searchType}
                    onChange={handleTypeChange}
                    aria-label="Filtrer par type"
                  >
                    <option value="all">Tous</option>
                    <option value="site">Site</option>
                    <option value="ligne">Ligne</option>
                  </select>
                  <button className="mp-btn-secondary" aria-label="Filtrer les marqueurs">
                    <i className="ri-filter-3-line"></i>
                    <span>Filtrer</span>
                  </button>
                  <button
                    className="mp-sort-btn mp-btn-secondary"
                    aria-label="Trier les marqueurs"
                  >
                    <i className="ri-arrow-up-down-line"></i>
                  </button>
                </div>
              </div>
            </div>
          </div>

          {isMobile ? (
            <div className="mp-marqueur-cards">
              {paginatedMarqueurs.length > 0 ? (
                paginatedMarqueurs.map((marqueur, i) => (
                  <div className="mp-marqueur-card" key={marqueur._id}>
                    <div className="mp-marqueur-card-header">
                      <div className="mp-marqueur-card-title">
                        <span className="mp-marqueur-number">{(currentPage - 1) * marqueursPerPage + i + 1}.</span>
                        <i className="ri-map-pin-line" />
                        <span>{marqueur.nom}</span>
                      </div>
                    </div>
                    <div className="mp-marqueur-card-body">
                      <div className="mp-marqueur-card-item">
                        <i className="ri-road-map-line" />
                        <span>{marqueur.type}</span>
                      </div>
                      <div className="mp-marqueur-card-item">
                        <i className="ri-map-pin-2-line" />
                        <span>{marqueur.coordonnees.join(', ')}</span>
                      </div>
                      <div className="mp-marqueur-card-item">
                        <i
                          className={`ri-${
                            marqueur.statut === 'Actif' ? 'flashlight-fill' : 'error-warning-fill'
                          }`}
                        />
                        <span
                          className={clsx('mp-status-badge', {
                            active: marqueur.statut === 'Actif',
                            inactive: marqueur.statut !== 'Actif',
                          })}
                        >
                          {marqueur.statut}
                        </span>
                      </div>
                      <div className="mp-marqueur-card-item">
                        <i
                          className="ri-database-2-fill"
                          onClick={handleOpenDataPopup}
                          title="Accéder aux données du marqueur"
                          aria-label="Voir les données du marqueur"
                        />
                        <span>Data</span>
                      </div>
                    </div>
                    <div className="mp-marqueur-card-footer">
                      <div className="mp-action-buttons">
                        <button
                          className="mp-action-btn edit"
                          onClick={() => handleOpenEditModal(marqueur)}
                          aria-label={`Modifier le marqueur ${marqueur.nom}`}
                        >
                          <i className="ri-edit-line" />
                        </button>
                        <button
                          className="mp-action-btn delete"
                          onClick={() => handleDeleteMarqueur(marqueur._id)}
                          aria-label={`Supprimer le marqueur ${marqueur.nom}`}
                        >
                          <i className="ri-delete-bin-line" />
                        </button>
                        <button
                          className="mp-action-btn detail"
                          title="Voir détails"
                          aria-label={`Voir les détails du marqueur ${marqueur.nom}`}
                        >
                          <i className="ri-eye-line" />
                        </button>
                      </div>
                    </div>
                  </div>
                ))
              ) : (
                <div className="mp-no-marqueurs">Aucun marqueur disponible.</div>
              )}
            </div>
          ) : (
            <div className="mp-table-responsive">
              <table className="mp-marqueurs-table">
                <thead>
                  <tr>
                    <th>Nom du Marqueur</th>
                    <th>Type</th>
                    <th>Coordonnées</th>
                    <th>Statut</th>
                    <th>Data</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {paginatedMarqueurs.length > 0 ? (
                    paginatedMarqueurs.map((marqueur, i) => (
                      <tr key={marqueur._id}>
                        <td>
                          <div className="mp-marqueur-name">
                            <span className="mp-marqueur-number">{(currentPage - 1) * marqueursPerPage + i + 1}.</span>
                            <i className="ri-map-pin-line" />
                            <div>
                              <span>{marqueur.nom}</span>
                            </div>
                          </div>
                        </td>
                        <td>
                          <div className="mp-marqueur-cell">
                            <i className="ri-road-map-line" />
                            {marqueur.type}
                          </div>
                        </td>
                        <td>
                          <div className="mp-marqueur-cell">
                            <i className="ri-map-pin-2-line" />
                            {marqueur.coordonnees.join(', ')}
                          </div>
                        </td>
                        <td>
                          <div className="mp-marqueur-cell">
                            <i
                              className={`ri-${
                                marqueur.statut === 'Actif' ? 'flashlight-fill' : 'error-warning-fill'
                              }`}
                            />
                            <span
                              className={clsx('mp-status-badge', {
                                active: marqueur.statut === 'Actif',
                                inactive: marqueur.statut !== 'Actif',
                              })}
                            >
                              {marqueur.statut}
                            </span>
                          </div>
                        </td>
                        <td>
                          <div className="mp-marqueur-cell">
                            <i
                              className="ri-database-2-fill"
                              onClick={handleOpenDataPopup}
                              title="Accéder aux données du marqueur"
                              aria-label="Voir les données du marqueur"
                            />
                          </div>
                        </td>
                        <td>
                          <div className="mp-action-buttons">
                            <button
                              className="mp-action-btn edit"
                              onClick={() => handleOpenEditModal(marqueur)}
                              aria-label={`Modifier le marqueur ${marqueur.nom}`}
                            >
                              <i className="ri-edit-line" />
                            </button>
                            <button
                              className="mp-action-btn delete"
                              onClick={() => handleDeleteMarqueur(marqueur._id)}
                              aria-label={`Supprimer le marqueur ${marqueur.nom}`}
                            >
                              <i className="ri-delete-bin-line" />
                            </button>
                            <button
                              className="mp-action-btn detail"
                              title="Voir détails"
                              aria-label={`Voir les détails du marqueur ${marqueur.nom}`}
                            >
                              <i className="ri-eye-line" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan="6" className="mp-no-marqueurs">
                        Aucun marqueur disponible.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          )}

          <div className="mp-table-footer">
            <div className="mp-pagination-info">
              Affichage {(currentPage - 1) * marqueursPerPage + 1}-
              {Math.min(currentPage * marqueursPerPage, filteredMarqueurs.length)} sur{' '}
              {filteredMarqueurs.length} marqueur(s)
            </div>
            <div className="mp-pagination-controls">
              <button
                className="mp-pagination-btn"
                onClick={() => handlePageChange(currentPage - 1)}
                disabled={currentPage === 1}
                aria-label="Page précédente"
              >
                <i className="ri-arrow-left-s-line"></i>
              </button>
              <span>{currentPage}</span>
              <button
                className="mp-pagination-btn"
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
      {dataPopup && <MarqueurDataPopup onClose={handleCloseDataPopup} />}
      <ToastContainer position="top-right" autoClose={3000} />
    </div>
    </div>
  );
}

export default Maps;