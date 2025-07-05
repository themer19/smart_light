import React, { useState, useEffect, useMemo, useRef } from 'react';
import clsx from 'clsx';
import { MapContainer, TileLayer, Marker, Popup, useMap, Circle, Polyline, useMapEvents } from 'react-leaflet';
import L from 'leaflet';
import Sidebar from '../components/Sidebar';
import './cssP/Maps.css';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import 'leaflet/dist/leaflet.css';

const siteIcon = new L.Icon({
  iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-blue.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41],
});

const ligneIcon = new L.Icon({
  iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-red.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41],
});

const poteauIcon = new L.Icon({
  iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-yellow.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41],
});

const startPointIcon = new L.Icon({
  iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-green.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41],
});

const endPointIcon = new L.Icon({
  iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-orange.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41],
});

function CenterMapButton() {
  const map = useMap();
  const handleCenterMap = () => {
    map.setView([36.8065, 10.1815], 13);
    toast.info('Carte recentrée sur Tunis');
  };
  return (
    <button
      className="mp-center-map-btn mp-btn-secondary"
      onClick={handleCenterMap}
      style={{ position: 'absolute', top: '10px', right: '10px', zIndex: 1000 }}
    >
      <i className="ri-focus-3-line"></i> Recentrer
    </button>
  );
}

function MapRef({ setMapRef }) {
  const map = useMap();
  setMapRef(map);
  return null;
}

function Maps() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [isMobile, setIsMobile] = useState(window.innerWidth < 768);
  const [marqueurs, setMarqueurs] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [searchType, setSearchType] = useState('all');
  const [searchStatus, setSearchStatus] = useState('all');
  const [currentPage, setCurrentPage] = useState(1);
  const [mapZoom, setMapZoom] = useState(13);
  const [showHeatmap, setShowHeatmap] = useState(false);
  const mapRef = useRef(null);
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

  useEffect(() => {
    const fetchMarqueurs = async () => {
      let allMarqueurs = [];
      try {
        console.log('Début de la récupération des marqueurs...');

        try {
          const sitesResponse = await fetch('http://localhost:5000/api/site/allsite');
          console.log('Réponse sites:', sitesResponse.status, sitesResponse.url);
          if (!sitesResponse.ok) {
            throw new Error(`Erreur site: ${sitesResponse.status} ${sitesResponse.statusText}`);
          }
          const sites = await sitesResponse.json();
          console.log('Données sites:', sites);
          allMarqueurs = [
            ...allMarqueurs,
            ...sites.map(s => ({
              _id: s._id,
              nom: s.nom || 'Site sans nom',
              type: 'Site',
              coordonnees: s.localisation ? [s.localisation.latitude, s.localisation.longitude] : [36.8065, 10.1815],
              statut: s.status || 'Actif',
            })),
          ];
        } catch (error) {
          console.error('Erreur lors de la récupération des sites:', error);
          toast.warn('Impossible de charger les sites');
        }

        try {
          const lignesResponse = await fetch('http://localhost:5000/api/ligne');
          console.log('Réponse lignes:', lignesResponse.status, lignesResponse.url);
          if (!lignesResponse.ok) {
            throw new Error(`Erreur ligne: ${lignesResponse.status} ${lignesResponse.statusText}`);
          }
          const lignes = await lignesResponse.json();
          console.log('Données lignes:', lignes);
          lignes.forEach(l => {
            if (l.startPoint) {
              allMarqueurs.push({
                _id: `${l._id}-start`,
                nom: `${l.nom_L || 'Ligne sans nom'} - Départ`,
                type: 'Ligne',
                pointType: 'start',
                coordonnees: [l.startPoint.lat, l.startPoint.lng],
                statut: l.status || 'Actif',
              });
            }
            if (l.endPoint) {
              allMarqueurs.push({
                _id: `${l._id}-end`,
                nom: `${l.nom_L || 'Ligne sans nom'} - Arrivée`,
                type: 'Ligne',
                pointType: 'end',
                coordonnees: [l.endPoint.lat, l.endPoint.lng],
                statut: l.status || 'Actif',
              });
            }
          });
        } catch (error) {
          console.error('Erreur lors de la récupération des lignes:', error);
          toast.warn('Impossible de charger les lignes');
        }

        try {
          const poteauxResponse = await fetch('http://localhost:5000/api/poteau');
          console.log('Réponse poteaux:', poteauxResponse.status, poteauxResponse.url);
          if (!poteauxResponse.ok) {
            throw new Error(`Erreur poteau: ${poteauxResponse.status} ${poteauxResponse.statusText}`);
          }
          const poteaux = await poteauxResponse.json();
          console.log('Données poteaux:', poteaux);
          allMarqueurs = [
            ...allMarqueurs,
            ...poteaux.map(p => ({
              _id: p._id,
              nom: p.nom || 'Poteau sans nom',
              type: 'Poteau',
              coordonnees: p.coordonnees ? [p.coordonnees.latitude, p.coordonnees.longitude] : [36.8065, 10.1815],
              statut: p.status || 'Actif',
            })),
          ];
        } catch (error) {
          console.error('Erreur lors de la récupération des poteaux:', error);
          toast.warn('Impossible de charger les poteaux');
        }

        console.log('Marqueurs combinés:', allMarqueurs);
        setMarqueurs(allMarqueurs);
      } catch (error) {
        toast.error('Erreur lors du chargement des marqueurs');
        console.error('Erreur globale:', error);
      }
    };

    fetchMarqueurs();
  }, []);

  const filteredMarqueurs = useMemo(() => {
    return marqueurs.filter((marqueur) => {
      const matchesSearch = marqueur.nom ? marqueur.nom.toLowerCase().includes(searchTerm.toLowerCase()) : false;
      const matchesType =
        searchType === 'all' ||
        (searchType === 'site' && marqueur.type === 'Site') ||
        (searchType === 'ligne' && marqueur.type === 'Ligne') ||
        (searchType === 'poteau' && marqueur.type === 'Poteau');
      const matchesStatus =
        searchStatus === 'all' ||
        (searchStatus === 'actif' && marqueur.statut.toLowerCase() === 'actif') ||
        (searchStatus === 'inactif' && marqueur.statut.toLowerCase() !== 'actif');
      return matchesSearch && matchesType && matchesStatus;
    });
  }, [marqueurs, searchTerm, searchType, searchStatus]);

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

  const handleStatusChange = (e) => {
    setSearchStatus(e.target.value);
    setCurrentPage(1);
  };

  const toggleHeatmap = () => {
    setShowHeatmap(!showHeatmap);
    toast.info(showHeatmap ? 'Heatmap désactivée' : 'Heatmap activée');
  };

  const centerOnMarker = (coords) => {
    if (mapRef.current) {
      mapRef.current.setView(coords, 15);
      toast.info(`Carte recentrée sur ${coords.join(', ')}`);
    }
  };

  return (
    <div className="map-page">
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
          style={{ flex: 1, marginLeft: 0, paddingLeft: 0, marginTop: '2rem' }}
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
                    <p className="mp-subtitle">Visualisez et gérez vos sites, lignes et poteaux sur la carte de Tunis</p>
                  </div>
                </div>
                <div className="mp-header-actions">
                  <button
                    className="mp-btn-secondary mp-heatmap-toggle"
                    onClick={toggleHeatmap}
                    aria-label="Basculer la heatmap"
                  >
                    <i className={showHeatmap ? 'ri-fire-fill' : 'ri-fire-line'}></i>
                    <span>{showHeatmap ? 'Masquer Heatmap' : 'Afficher Heatmap'}</span>
                  </button>
                </div>
              </div>
              <div className="mp-legend">
                <h3>Légende</h3>
                <div className="mp-legend-item">
                  <span className="mp-legend-color mp-site-color"></span> Site
                </div>
                <div className="mp-legend-item">
                  <span className="mp-legend-color mp-ligne-color"></span> Trajet de Ligne
                </div>
                <div className="mp-legend-item">
                  <span className="mp-legend-color mp-start-point-color"></span> Point de Départ (Ligne)
                </div>
                <div className="mp-legend-item">
                  <span className="mp-legend-color mp-end-point-color"></span> Point d'Arrivée (Ligne)
                </div>
                <div className="mp-legend-item">
                  <span className="mp-legend-color mp-poteau-color"></span> Poteau
                </div>
              </div>
            </div>

            <div className="mp-map-container">
              <MapContainer
                center={[36.8065, 10.1815]}
                zoom={mapZoom}
                style={{ height: '500px', width: '100%', borderRadius: '8px' }}
              >
                <MapRef setMapRef={(map) => (mapRef.current = map)} />
                <TileLayer
                  url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                  attribution='© <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                />
                {filteredMarqueurs.map((marqueur) => (
                  <Marker
                    key={marqueur._id}
                    position={marqueur.coordonnees}
                    icon={
                      marqueur.type === 'Site' ? siteIcon :
                      marqueur.type === 'Ligne' && marqueur.pointType === 'start' ? startPointIcon :
                      marqueur.type === 'Ligne' && marqueur.pointType === 'end' ? endPointIcon :
                      marqueur.type === 'Ligne' ? ligneIcon :
                      poteauIcon
                    }
                  >
                    <Popup>
                      <strong>{marqueur.nom}</strong>
                      <br />
                      Type: {marqueur.type}{marqueur.pointType ? ` (${marqueur.pointType === 'start' ? 'Départ' : 'Arrivée'})` : ''}
                      <br />
                      Statut: {marqueur.statut}
                      <br />
                      Coordonnées: {marqueur.coordonnees.join(', ')}
                    </Popup>
                    {showHeatmap && (
                      <Circle
                        center={marqueur.coordonnees}
                        radius={mapZoom > 12 ? 200 : 500}
                        pathOptions={{
                          color: marqueur.type === 'Site' ? 'blue' :
                                 marqueur.type === 'Ligne' && marqueur.pointType === 'start' ? 'green' :
                                 marqueur.type === 'Ligne' && marqueur.pointType === 'end' ? 'orange' :
                                 marqueur.type === 'Ligne' ? 'red' : 'yellow',
                          fillColor: marqueur.type === 'Site' ? 'blue' :
                                     marqueur.type === 'Ligne' && marqueur.pointType === 'start' ? 'green' :
                                     marqueur.type === 'Ligne' && marqueur.pointType === 'end' ? 'orange' :
                                     marqueur.type === 'Ligne' ? 'red' : 'yellow',
                          fillOpacity: 0.2,
                        }}
                      />
                    )}
                  </Marker>
                ))}
                {filteredMarqueurs
                  .filter(m => m.type === 'Ligne' && m.pointType === 'start')
                  .map(startMarker => {
                    const endMarker = filteredMarqueurs.find(m => m._id === startMarker._id.replace('-start', '-end'));
                    if (endMarker) {
                      return (
                        <Polyline
                          key={`${startMarker._id}-line`}
                          positions={[startMarker.coordonnees, endMarker.coordonnees]}
                          color="red"
                          weight={3}
                          opacity={0.7}
                        />
                      );
                    }
                    return null;
                  })}
                <CenterMapButton />
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
                      <option value="poteau">Poteau</option>
                    </select>
                    <select
                      className="mp-type-filter"
                      value={searchStatus}
                      onChange={handleStatusChange}
                      aria-label="Filtrer par statut"
                    >
                      <option value="all">Tous Statuts</option>
                      <option value="actif">Actif</option>
                      <option value="inactif">Inactif</option>
                    </select>
                    <button className="mp-btn-secondary" aria-label="Filtrer les marqueurs">
                      <i className="ri-filter-3-line"></i>
                      <span>Filtrer</span>
                    </button>
                  </div>
                </div>
              </div>
            </div>

            {isMobile ? (
              <div className="mp-marqueur-cards">
                {paginatedMarqueurs.length > 0 ? (
                  paginatedMarqueurs.map((marqueur, i) => (
                    <div
                      className="mp-marqueur-card"
                      key={marqueur._id}
                      onClick={() => centerOnMarker(marqueur.coordonnees)}
                      style={{ cursor: 'pointer' }}
                    >
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
                          <span>{marqueur.type}{marqueur.pointType ? ` (${marqueur.pointType === 'start' ? 'Départ' : 'Arrivée'})` : ''}</span>
                        </div>
                        <div className="mp-marqueur-card-item">
                          <i className="ri-map-pin-2-line" />
                          <span>{marqueur.coordonnees.join(', ')}</span>
                        </div>
                        <div className="mp-marqueur-card-item">
                          <i
                            className={`ri-${
                              marqueur.statut.toLowerCase() === 'actif' ? 'flashlight-fill' : 'error-warning-fill'
                            }`}
                          />
                          <span
                            className={clsx('mp-status-badge', {
                              active: marqueur.statut.toLowerCase() === 'actif',
                              inactive: marqueur.statut.toLowerCase() !== 'actif',
                            })}
                          >
                            {marqueur.statut}
                          </span>
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
                    </tr>
                  </thead>
                  <tbody>
                    {paginatedMarqueurs.length > 0 ? (
                      paginatedMarqueurs.map((marqueur, i) => (
                        <tr
                          key={marqueur._id}
                          onClick={() => centerOnMarker(marqueur.coordonnees)}
                          style={{ cursor: 'pointer' }}
                        >
                          <td>
                            <div className="mp-marqueur-name">
                              <span className="mp-marqueur-number">{(currentPage - 1) * marqueursPerPage + i + 1}.</span>
                              <i className="ri-map-pin-line" />
                              <span>{marqueur.nom}</span>
                            </div>
                          </td>
                          <td>
                            <div className="mp-marqueur-cell">
                              <i className="ri-road-map-line" />
                              {marqueur.type}{marqueur.pointType ? ` (${marqueur.pointType === 'start' ? 'Départ' : 'Arrivée'})` : ''}
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
                                  marqueur.statut.toLowerCase() === 'actif' ? 'flashlight-fill' : 'error-warning-fill'
                                }`}
                              />
                              <span
                                className={clsx('mp-status-badge', {
                                  active: marqueur.statut.toLowerCase() === 'actif',
                                  inactive: marqueur.statut.toLowerCase() !== 'actif',
                                })}
                              >
                                {marqueur.statut}
                              </span>
                            </div>
                          </td>
                        </tr>
                      ))
                    ) : (
                      <tr>
                        <td colSpan="4" className="mp-no-marqueurs">
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
                  onClick={() => handlePageChange(1)}
                  disabled={currentPage === 1}
                  aria-label="Première page"
                >
                  <i className="ri-skip-back-line"></i>
                </button>
                <button
                  className="mp-pagination-btn"
                  onClick={() => handlePageChange(currentPage - 1)}
                  disabled={currentPage === 1}
                  aria-label="Page précédente"
                >
                  <i className="ri-arrow-left-s-line"></i>
                </button>
                {Array.from({ length: totalPages }, (_, i) => i + 1)
                  .filter(
                    (page) =>
                      page === 1 ||
                      page === totalPages ||
                      (page >= currentPage - 1 && page <= currentPage + 1)
                  )
                  .map((page) => (
                    <button
                      key={page}
                      className={clsx('mp-pagination-btn', {
                        'mp-pagination-btn-active': page === currentPage,
                      })}
                      onClick={() => handlePageChange(page)}
                      aria-label={`Page ${page}`}
                    >
                      {page}
                    </button>
                  ))}
                <button
                  className="mp-pagination-btn"
                  onClick={() => handlePageChange(currentPage + 1)}
                  disabled={currentPage === totalPages}
                  aria-label="Page suivante"
                >
                  <i className="ri-arrow-right-s-line"></i>
                </button>
                <button
                  className="mp-pagination-btn"
                  onClick={() => handlePageChange(totalPages)}
                  disabled={currentPage === totalPages}
                  aria-label="Dernière page"
                >
                  <i className="ri-skip-forward-line"></i>
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

export default Maps;