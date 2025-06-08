import React, { useState, useEffect, useMemo } from 'react';
import clsx from 'clsx';
import Sidebar from '../components/Sidebar';
import AddSiteModal from '../components/AddSiteModal';
import EditSiteModal from '../components/EditSiteModal';
import DeleteSitePage from '../components/DeleteSitePage';
import KnobPopup from '../components/KwhPop';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import './cssP/Sites.css';
import SiteDetailsModal from '../components/SiteDetailsModal';

function Sites() {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [editSite, setEditSite] = useState(null);
  const [kwhPopup, setKwhPopup] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [isMobile, setIsMobile] = useState(window.innerWidth < 768);
  const [sites, setSites] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [isLoading, setIsLoading] = useState(true);
  const [isTableLoading, setIsTableLoading] = useState(true);
  const [isGeocoding, setIsGeocoding] = useState(false);
  const [detailsModalOpen, setDetailsModalOpen] = useState(false);
  const [selectedSite, setSelectedSite] = useState(null);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [deleteSiteId, setDeleteSiteId] = useState(null);
  const sitesPerPage = 10;

  const handleOpenDetails = (site) => {
    setSelectedSite(site);
    setDetailsModalOpen(true);
  };

  const handleCloseDetails = () => {
    setDetailsModalOpen(false);
    setSelectedSite(null);
  };

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

  const fetchSites = async () => {
    setIsLoading(true);
    setIsTableLoading(true);
    try {
      const response = await fetch('http://localhost:5000/api/site/allsite');
      if (!response.ok) {
        throw new Error('Erreur réseau');
      }

      const data = await response.json();
      setIsGeocoding(true);

      const sitesWithCity = await Promise.all(
        data.map(async (site) => {
          if (site.localisation?.latitude && site.localisation?.longitude) {
            try {
              const res = await fetch(
                `https://api.opencagedata.com/geocode/v1/json?q=${site.localisation.latitude}+${site.localisation.longitude}&key=07388b5ec43e4f438eeb55f70311a79d`
              );
              const geo = await res.json();
              const city =
                geo.results[0]?.components?.city ||
                geo.results[0]?.components?.town ||
                geo.results[0]?.components?.village ||
                'Ville inconnue';

              return {
                ...site,
                localisation: {
                  ...site.localisation,
                  ville: city,
                },
              };
            } catch (geoError) {
              console.error('Erreur géocodage:', geoError);
              return {
                ...site,
                localisation: {
                  ...site.localisation,
                  ville: 'Ville inconnue',
                },
              };
            }
          }
          return site;
        })
      );

      setSites(sitesWithCity);
    } catch (error) {
      console.error('Erreur fetch:', error);
      toast.error('Erreur lors du chargement des sites');
    } finally {
      setIsLoading(false);
      setIsTableLoading(false);
      setIsGeocoding(false);
    }
  };

  useEffect(() => {
    fetchSites();
  }, []);

  const filteredSites = useMemo(() => {
    return sites.filter(
      (site) =>
        site.nom.toLowerCase().includes(searchTerm.toLowerCase()) ||
        site.localisation?.ville?.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }, [sites, searchTerm]);

  const totalPages = Math.ceil(filteredSites.length / sitesPerPage);
  const paginatedSites = useMemo(() => {
    const startIndex = (currentPage - 1) * sitesPerPage;
    return filteredSites.slice(startIndex, startIndex + sitesPerPage);
  }, [filteredSites, currentPage]);

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

  const handleSaveSite = async (siteData) => {
    if (!siteData.location || !siteData.location.lat || !siteData.location.lng) {
      toast.error('La localisation est obligatoire');
      return;
    }

    const dataToSend = {
      ...siteData,
      localisation: {
        latitude: siteData.location.lat,
        longitude: siteData.location.lng,
      },
    };

    try {
      const response = await fetch('http://localhost:5000/api/site/site', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(dataToSend),
      });

      if (response.ok) {
        toast.success('Site créé avec succès!');
        setIsModalOpen(false);
        await fetchSites();
      } else {
        const errorData = await response.json();
        toast.error(errorData.message || 'Échec de la création');
      }
    } catch (error) {
      toast.error('Erreur réseau');
      console.error('Erreur:', error);
    }
  };

  const handleEditSite = async (siteData) => {
    if (!siteData.location || !siteData.location.lat || !siteData.location.lng) {
      toast.error('La localisation est obligatoire');
      return;
    }

    const dataToSend = {
      ...siteData,
      localisation: {
        latitude: siteData.location.lat,
        longitude: siteData.location.lng,
      },
    };

    try {
      const response = await fetch(`http://localhost:5000/api/site/sitemise/${editSite._id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(dataToSend),
      });

      if (response.ok) {
        toast.success('Site modifié avec succès!');
        setIsEditModalOpen(false);
        setEditSite(null);
        await fetchSites();
      } else {
        const errorData = await response.json();
        toast.error(errorData.message || 'Échec de la modification');
      }
    } catch (error) {
      toast.error('Erreur réseau');
      console.error('Erreur:', error);
    }
  };

 const handleDeleteSite = async (siteId, reason) => {
  try {
    const response = await fetch(`http://localhost:5000/api/site/sitedel/${siteId}`, {
      method: 'DELETE',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ reason }),
    });

    if (response.ok) {
      setSites(sites.filter((site) => site._id !== siteId));
      setShowDeleteModal(false);
      setDeleteSiteId(null);
      window.location.reload(); // Reload the page after successful deletion
    } else {
      const errorData = await response.json();
    }
  } catch (error) {
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

  const handleOpenEditModal = (site) => {
    setEditSite(site);
    setIsEditModalOpen(true);
  };

  return (
    <div className="sites-page">
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
                    <i className="ri-global-line sm-main-icon"></i>
                  </div>
                  <div>
                    <h1 className="sm-main-title">
                      Gestion des Sites
                      <span className="sm-title-underline"></span>
                    </h1>
                    <p className="sm-subtitle">Administrez l'ensemble de vos sites distants</p>
                  </div>
                </div>
                <button
                  className="sm-add-site-btn sm-btn-primary"
                  onClick={() => setIsModalOpen(true)}
                  aria-label="Ajouter un nouveau site"
                >
                  <i className="ri-add-circle-line"></i>
                  <span>Nouveau site</span>
                </button>
                {isModalOpen && (
                  <AddSiteModal onClose={() => setIsModalOpen(false)} onSave={handleSaveSite} />
                )}
                {isEditModalOpen && (
                  <EditSiteModal
                    onClose={() => {
                      setIsEditModalOpen(false);
                      setEditSite(null);
                    }}
                    onSave={handleEditSite}
                    initialData={editSite}
                  />
                )}
                {detailsModalOpen && (
                  <SiteDetailsModal 
                    site={selectedSite} 
                    onClose={handleCloseDetails} 
                  />
                )}
                {showDeleteModal && deleteSiteId && (
                  <DeleteSitePage
                    siteId={deleteSiteId}
                    onClose={() => {
                      setShowDeleteModal(false);
                      setDeleteSiteId(null);
                    }}
                    onSave={(reason) => handleDeleteSite(deleteSiteId, reason)}
                  />
                )}
              </div>
            </div>

            <div className="sm-card-header">
              <div className="sm-list-header-wrapper">
                <div className="sm-list-title-container">
                  <i className="ri-table-2 sm-list-icon"></i>
                  <h2 className="sm-list-title">
                    Liste des Sites
                    <span className="sm-site-count">{filteredSites.length} site(s)</span>
                  </h2>
                </div>
                <div className="sm-search-filter-container">
                  <div className="sm-search-box">
                    <i className="ri-search-line sm-search-icon"></i>
                    <input
                      id="site-search"
                      type="text"
                      placeholder="Rechercher un site..."
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
                    <button className="sm-btn-secondary" aria-label="Filtrer les sites">
                      <i className="ri-filter-3-line"></i>
                      <span>Filtrer</span>
                    </button>
                    <button
                      className="sm-sort-btn sm-btn-secondary"
                      aria-label="Trier les sites"
                    >
                      <i className="ri-arrow-up-down-line"></i>
                    </button>
                  </div>
                </div>
              </div>
            </div>

            {isMobile ? (
              <div className="sm-line-cards">
                {isTableLoading ? (
                  <div className="sm-loading-container">
                    <div className="sm-loading-spinner"></div>
                    <p>Chargement des sites...</p>
                  </div>
                ) : paginatedSites.length > 0 ? (
                  paginatedSites.map((site, i) => (
                    <div className="sm-line-card" key={site._id}>
                      <div className="sm-line-card-header">
                        <div className="sm-line-card-title">
                          <span className="sm-site-number">{(currentPage - 1) * sitesPerPage + i + 1}.</span>
                          <i className="ri-building-2-fill" />
                          <span>{site.nom}</span>
                        </div>
                      </div>
                      <div className="sm-line-card-body">
                        <div className="sm-line-card-item">
                          <i className="ri-map-pin-2-fill" />
                          <span>{site.localisation?.ville || 'Ville inconnue'}</span>
                        </div>
                        <div className="sm-line-card-item">
                          <i
                            className={`ri-${
                              site.status === 'Actif'
                                ? 'flashlight-fill'
                                : site.status === 'Panne'
                                ? 'error-warning-fill'
                                : 'settings-3-fill'
                            }`}
                          />
                          <span
                            className={clsx('sm-status-badge', {
                              active: site.status === 'Actif',
                              inactive: site.status !== 'Actif',
                            })}
                          >
                            {site.status}
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
                        <div className="sm-line-card-item">
                          <i className="ri-history-line" />
                          <span>
                            {new Date(site.derniereMiseAJour).toLocaleDateString('fr-FR')}
                          </span>
                        </div>
                      </div>
                      <div className="sm-line-card-footer">
                        <div className="sm-action-buttons">
                          <button
                            className="sm-action-btn edit"
                            onClick={() => handleOpenEditModal(site)}
                            aria-label={`Modifier le site ${site.nom}`}
                          >
                            <i className="ri-edit-line" />
                          </button>
                          <button
                            className="sm-action-btn delete"
                            onClick={() => {
                              setDeleteSiteId(site._id);
                              setShowDeleteModal(true);
                            }}
                            aria-label={`Supprimer le site ${site.nom}`}
                          >
                            <i className="ri-delete-bin-line" />
                          </button>
                          <button
                            className="sm-action-btn detail"
                            onClick={() => handleOpenDetails(site)}
                            title="Voir détails"
                            aria-label={`Voir les détails du site ${site.nom}`}
                          >
                            <i className="ri-eye-line" />
                          </button>
                        </div>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="sm-no-lines">Aucun site disponible.</div>
                )}
              </div>
            ) : (
              <div className="sm-table-responsive">
                <table className="sm-lines-table">
                  <thead>
                    <tr>
                      <th>
                        <div className="table-header-with-icon">
                          <i className="ri-building-line" />
                          <span>Nom du Site</span>
                        </div>
                      </th>
                      <th>
                        <div className="table-header-with-icon">
                          <i className="ri-map-pin-line" />
                          <span>Localisation</span>
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
                          <i className="ri-history-line" />
                          <span>Dernière Mise à Jour</span>
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
                    {isTableLoading ? (
                      <tr>
                        <td colSpan="6" className="sm-table-loading">
                          <div className="sm-table-spinner"></div>
                          <span>Chargement des données...</span>
                        </td>
                      </tr>
                    ) : paginatedSites.length > 0 ? (
                      paginatedSites.map((site, i) => (
                        <tr key={site._id}>
                          <td>
                            <div className="sm-line-name">
                              <span className="sm-site-number">{(currentPage - 1) * sitesPerPage + i + 1}.</span>
                              <i className="ri-building-2-fill" />
                              <div>
                                <span>{site.nom}</span>
                              </div>
                            </div>
                          </td>
                          <td>
                            <div className="sm-site-cell">
                              <i className="ri-map-pin-2-fill" />
                              {site.localisation?.ville || 'Ville inconnue'}
                            </div>
                          </td>
                          <td>
                            <div className="sm-zone-cell">
                              <i
                                className={`ri-${
                                  site.status === 'Actif'
                                    ? 'flashlight-fill'
                                    : site.status === 'Panne'
                                    ? 'error-warning-fill'
                                    : 'settings-3-fill'
                                }`}
                              />
                              <span
                                className={clsx('sm-status-badge', {
                                  active: site.status === 'Actif',
                                  inactive: site.status !== 'Actif',
                                })}
                              >
                                {site.status}
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
                            <div className="sm-points-cell">
                              <i className="ri-history-line" />
                              {new Date(site.derniereMiseAJour).toLocaleDateString('fr-FR')}
                            </div>
                          </td>
                          <td>
                            <div className="sm-action-buttons">
                              <button
                                className="sm-action-btn edit"
                                onClick={() => handleOpenEditModal(site)}
                                aria-label={`Modifier le site ${site.nom}`}
                              >
                                <i className="ri-edit-line" />
                              </button>
                              <button
                                className="sm-action-btn delete"
                                onClick={() => {
                                  setDeleteSiteId(site._id);
                                  setShowDeleteModal(true);
                                }}
                                aria-label={`Supprimer le site ${site.nom}`}
                              >
                                <i className="ri-delete-bin-line" />
                              </button>
                              <button
                                className="sm-action-btn detail"
                                onClick={() => handleOpenDetails(site)}
                                title="Voir détails"
                                aria-label={`Voir les détails du site ${site.nom}`}
                              >
                                <i className="ri-eye-line" />
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))
                    ) : (
                      <tr>
                        <td colSpan="6" className="sm-no-lines">
                          Aucun site disponible.
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            )}

            <div className="sm-table-footer">
              <div className="sm-pagination-info">
                Affichage {(currentPage - 1) * sitesPerPage + 1}-
                {Math.min(currentPage * sitesPerPage, filteredSites.length)} sur{' '}
                {filteredSites.length} site(s)
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
        />
      </div>
    </div>
  );
}

export default Sites;