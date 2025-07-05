import React, { useState, useEffect, useMemo } from 'react';
import clsx from 'clsx';
import axios from 'axios';
import Sidebar from '../components/Sidebar';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import './cssP/Licences.css';
import RenewLicencePage from '../components/RenewLicencePage';
import SuspendLicencePage from '../components/SuspendLicencePage';
import ReactivateLicencePage from '../components/ReactivateLicencePage';
import RegenerateKeyPage from '../components/RegenerateKeyPage';
import EditLicencePage from '../components/EditLicencePage';
import DeleteLicencePage from '../components/DeleteLicencePage';
import { 
  RiTable2, RiSearchLine, RiCloseLine, RiFilter3Line, 
  RiArrowUpDownLine, RiArrowLeftSLine, RiArrowRightSLine, 
  RiLightbulbFlashLine, RiUserStarLine, RiFlashlightFill, 
  RiHomeWifiLine, RiGlobalLine, RiFileCopyLine, RiMapPinLine, 
  RiCalendar2Line, RiAlarmWarningLine, RiSensorLine, RiPlug2Line,
  RiRefreshLine, RiPauseLine, RiPlayLine, RiEditLine, 
  RiDeleteBinLine, RiKeyLine, RiSettingsLine
} from 'react-icons/ri';

function Licences() {
  const [isDetailsOpen, setIsDetailsOpen] = useState(false);
  const [selectedLicence, setSelectedLicence] = useState(null);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [isMobile, setIsMobile] = useState(window.innerWidth < 768);
  const [licences, setLicences] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [isRenewModalOpen, setIsRenewModalOpen] = useState(false);
  const [isSuspendModalOpen, setIsSuspendModalOpen] = useState(false);
  const [isReactivateModalOpen, setIsReactivateModalOpen] = useState(false);
  const [isRegenerateModalOpen, setIsRegenerateModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [actionLicenceId, setActionLicenceId] = useState(null);
  const licencesPerPage = 5;

  const fetchLicences = async () => {
    try {
      setLoading(true);
      const response = await axios.get(`http://localhost:5000/api/licences/?t=${Date.now()}`, {
        headers: { 'Cache-Control': 'no-cache' }
      });
      const formattedLicences = Array.isArray(response.data) ? response.data.map(licence => ({
        _id: licence._id,
        nom: licence.nom || 'Licence sans nom',
        type: licence.type || 'Type non spécifié',
        site: { 
          nom: licence.utilisateurId?.ville || 'Site non spécifié',
          adresse: licence.utilisateurId?.adresse 
        },
        dateExpiration: licence.dateExpiration.split('T')[0],
        statut: licence.statut || 'Inconnu',
        appareilsAutorises: licence.lampadairesMax || 0,
        zone: licence.zone,
        cleLicence: licence.cleLicence || 'Non disponible',
        identifiantUnique: licence.identifiantUnique,
        utilisateur: {
          _id: licence.utilisateurId?._id,
          nom: `${licence.utilisateurId?.prenom || ''} ${licence.utilisateurId?.nom || ''}`.trim(),
          email: licence.utilisateurId?.email || '',
          niveauAcces: licence.utilisateurId?.role || 'Niveau inconnu',
          telephone: licence.utilisateurId?.numéroDeTéléphone,
          appareils: []
        }
      })) : [];
      console.log('Fetched licences:', JSON.stringify(formattedLicences, null, 2));
      setLicences([...formattedLicences]); // Ensure new array reference
      setLoading(false);
      
      const totalPages = Math.ceil(formattedLicences.length / licencesPerPage);
      console.log('Total pages:', totalPages, 'Current page:', currentPage);
      if (currentPage > totalPages && totalPages > 0) {
        console.log('Adjusting currentPage to:', totalPages);
        setCurrentPage(totalPages);
      } else if (formattedLicences.length === 0) {
        console.log('No licences, resetting currentPage to 1');
        setCurrentPage(1);
      }
    } catch (err) {
      console.error('Fetch licences error:', err.response?.data || err.message);
      setError(err.message);
      setLoading(false);
      toast.error('Erreur lors du chargement des licences');
    }
  };

  useEffect(() => {
    fetchLicences();

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
    console.log('Licences state updated:', licences);
    console.log('Current page:', currentPage);
  }, [licences, currentPage]);

  const handleLicenceAction = async (action, licenceId) => {
    console.log(`Initiating action: ${action} for licenceId: ${licenceId}`);
    setActionLicenceId(licenceId);
    switch(action) {
      case 'renew':
        setIsRenewModalOpen(true);
        break;
      case 'suspend':
        setIsSuspendModalOpen(true);
        break;
      case 'reactivate':
        setIsReactivateModalOpen(true);
        break;
      case 'regenerate':
        setIsRegenerateModalOpen(true);
        break;
      case 'edit':
        setIsEditModalOpen(true);
        break;
      case 'delete':
        setIsDeleteModalOpen(true);
        break;
      default:
        break;
    }
  };

  const handleActionSave = async (action) => {
    console.log(`handleActionSave called for action: ${action}`);
    try {
      // Add slight delay to ensure backend sync
      await new Promise(resolve => setTimeout(resolve, 500));
      await fetchLicences();
      toast.success(`${action.charAt(0).toUpperCase() + action.slice(1)} effectué avec succès`);
      setIsRenewModalOpen(false);
      setIsSuspendModalOpen(false);
      setIsReactivateModalOpen(false);
      setIsRegenerateModalOpen(false);
      setIsEditModalOpen(false);
      setIsDeleteModalOpen(false);
      setActionLicenceId(null);
    } catch (error) {
      console.error(`Error refreshing licences after ${action}:`, error.response?.data || error.message);
      toast.error(`Erreur lors du rafraîchissement des licences: ${error.response?.data?.message || error.message}`);
    }
  };

  const filteredLicences = useMemo(() => {
    const filtered = licences.filter(
      (licence) =>
        (licence.nom || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
        (licence.type || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
        (licence.site?.nom || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
        (licence.utilisateur?.nom || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
        (licence.utilisateur?.niveauAcces || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
        (licence.cleLicence || '').toLowerCase().includes(searchTerm.toLowerCase())
    );
    console.log('Filtered licences:', filtered);
    return filtered;
  }, [licences, searchTerm]);

  const totalPages = Math.ceil(filteredLicences.length / licencesPerPage);
  const paginatedLicences = useMemo(() => {
    const startIndex = (currentPage - 1) * licencesPerPage;
    const paginated = filteredLicences.slice(startIndex, startIndex + licencesPerPage);
    console.log('Paginated licences:', paginated);
    return paginated;
  }, [filteredLicences, currentPage]);

  const handlePageChange = (page) => {
    if (page >= 1 && page <= totalPages) {
      console.log('Changing page to:', page);
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

  const handleOpenDetails = (licence) => {
    setSelectedLicence(licence);
    setIsDetailsOpen(true);
  };

  const handleCopyKey = (e, key) => {
    e.stopPropagation();
    navigator.clipboard.writeText(key);
    toast.success('Clé copiée dans le presse-papier');
  };

  const renderAppareilsEclairage = (appareils) => {
    if (!appareils || appareils.length === 0) {
      return <div className="lc-no-devices">Aucun appareil associé</div>;
    }
    
    return appareils.map((appareil, index) => (
      <div key={index} className="lc-appareil-item">
        {appareil.type === 'Poteau' ? (
          <RiLightbulbFlashLine className="lc-appareil-icon" />
        ) : appareil.type === 'Capteur' ? (
          <RiSensorLine className="lc-appareil-icon capteur" />
        ) : (
          <RiPlug2Line className="lc-appareil-icon autre" />
        )}
        <div className="lc-appareil-info">
          <span className="lc-appareil-nom">{appareil.nom || 'Non défini'}</span>
          <span className="lc-appareil-id">{appareil.id || 'Non défini'}</span>
        </div>
      </div>
    ));
  };

  if (loading) {
    return (
      <div className="licences-page">
        <div className="lc-loading-container">
          <div className="lc-loading-spinner"></div>
          <p>Chargement des licences...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="licences-page">
        <div className="lc-error-container">
          <RiAlarmWarningLine className="lc-error-icon" />
          <p>Erreur: {error}</p>
          <button 
            className="lc-retry-btn"
            onClick={() => window.location.reload()}
          >
            Réessayer
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="licences-page">
      <div className="lc-container">
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
        >
          <div className="lc-dashboard-card">
            <div className="lc-page-header">
              <div className="lc-header-content">
                <div className="lc-title-wrapper">
                  <div className="lc-title-icon-container">
                    <i className="ri-global-line lc-main-icon"></i>
                  </div>
                  <div>
                    <h1 className="lc-main-title">
                      Gestion des Licences d'Éclairage
                      <span className="lc-title-underline"></span>
                    </h1>
                    <p className="lc-subtitle">Suivi des licences professionnelles d'éclairage public</p>
                  </div>
                </div>
              </div>
            </div>

            <div className="lc-card-header">
              <div className="lc-list-header-wrapper">
                <div className="lc-list-title-container">
                  <RiTable2 className="lc-list-icon" />
                  <h2 className="lc-list-title">
                    Liste des Licences
                    <span className="lc-licence-count">{filteredLicences.length} licence(s)</span>
                  </h2>
                </div>
                <div className="lc-search-filter-container">
                  <div className="lc-search-box">
                    <RiSearchLine className="lc-search-icon" />
                    <input
                      id="licence-search"
                      type="text"
                      placeholder="Rechercher une licence..."
                      className="lc-search-input"
                      value={searchTerm}
                      onChange={handleSearchChange}
                    />
                    {searchTerm && (
                      <RiCloseLine
                        className="lc-clear-icon"
                        onClick={handleClearSearch}
                        aria-label="Effacer la recherche"
                      />
                    )}
                  </div>
                  <div className="lc-filter-group">
                    <button className="lc-btn-secondary" aria-label="Filtrer les licences">
                      <RiFilter3Line />
                      <span>Filtrer</span>
                    </button>
                    <button
                      className="lc-sort-btn lc-btn-secondary"
                      aria-label="Trier les licences"
                    >
                      <RiArrowUpDownLine />
                    </button>
                  </div>
                </div>
              </div>
            </div>

            {isMobile ? (
              <div className="lc-licence-cards">
                {paginatedLicences.length > 0 ? (
                  paginatedLicences.map((licence, i) => (
                    <div
                      className="lc-licence-card"
                      key={licence._id}
                      onClick={() => handleOpenDetails(licence)}
                      role="button"
                      tabIndex={0}
                      aria-label={`Voir les détails de la licence ${licence.nom}`}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter' || e.key === ' ') {
                          handleOpenDetails(licence);
                        }
                      }}
                    >
                      <div className="lc-licence-card-header">
                        <div className="lc-licence-card-title">
                          <RiLightbulbFlashLine className="lc-licence-icon" />
                          <span>{licence.nom}</span>
                        </div>
                      </div>
                      <div className="lc-licence-card-body">
                        <div className="lc-licence-card-item">
                          <RiUserStarLine />
                          <span>{licence.utilisateur.nom || 'Non spécifié'}</span>
                        </div>
                        <div className="lc-licence-card-item">
                          <RiFlashlightFill className={clsx({
                            'active': licence.statut === 'Active',
                            'expired': licence.statut === 'Expirée'
                          })} />
                          <span>{licence.statut}</span>
                        </div>
                        <div className="lc-licence-card-item">
                          <RiHomeWifiLine />
                          <span>{licence.utilisateur.appareils?.length || 0}/{licence.appareilsAutorises} appareils</span>
                        </div>
                        <div className="lc-licence-card-item">
                          <RiKeyLine />
                          <span className="lc-key-value">
                            {licence.cleLicence.substring(0, 8)}...
                          </span>
                          <button 
                            className="lc-copy-btn"
                            onClick={(e) => handleCopyKey(e, licence.cleLicence)}
                            aria-label="Copier la clé"
                          >
                            <RiFileCopyLine size={14} />
                          </button>
                        </div>
                        <div className="lc-licence-card-item">
                          <RiMapPinLine />
                          <span>{licence.zone}</span>
                        </div>
                        <div className="lc-licence-card-item">
                          <RiCalendar2Line />
                          <span>{licence.dateExpiration}</span>
                          {new Date(licence.dateExpiration) < new Date() && (
                            <RiAlarmWarningLine className="lc-expiry-warning" />
                          )}
                        </div>
                      </div>
                      <div className="lc-licence-card-actions">
                        <button 
                          onClick={(e) => {
                            e.stopPropagation();
                            handleLicenceAction('renew', licence._id);
                          }}
                          className="lc-mobile-action-btn"
                          title="Renouveler"
                        >
                          <RiRefreshLine size={16} />
                        </button>
                        {licence.statut === 'Active' ? (
                          <button 
                            onClick={(e) => {
                              e.stopPropagation();
                              handleLicenceAction('suspend', licence._id);
                            }}
                            className="lc-mobile-action-btn"
                            title="Suspendre"
                          >
                            <RiPauseLine size={16} />
                          </button>
                        ) : (
                          <button 
                            onClick={(e) => {
                              e.stopPropagation();
                              handleLicenceAction('reactivate', licence._id);
                            }}
                            className="lc-mobile-action-btn"
                            title="Réactiver"
                          >
                            <RiPlayLine size={16} />
                          </button>
                        )}
                        <button 
                          onClick={(e) => {
                            e.stopPropagation();
                            handleLicenceAction('regenerate', licence._id);
                          }}
                          className="lc-mobile-action-btn"
                          title="Nouvelle clé"
                        >
                          <RiKeyLine size={16} />
                        </button>
                        <button 
                          onClick={(e) => {
                            e.stopPropagation();
                            handleLicenceAction('edit', licence._id);
                          }}
                          className="lc-mobile-action-btn"
                          title="Modifier"
                        >
                          <RiEditLine size={16} />
                        </button>
                        <button 
                          onClick={(e) => {
                            e.stopPropagation();
                            handleLicenceAction('delete', licence._id);
                          }}
                          className="lc-mobile-action-btn"
                          title="Supprimer"
                        >
                          <RiDeleteBinLine size={16} />
                        </button>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="lc-no-licences">Aucune licence disponible.</div>
                )}
              </div>
            ) : (
              <div className="lc-table-responsive">
                <table className="lc-licences-table" key={licences.length}>
                  <caption>Licences d'éclairage et leurs attributions</caption>
                  <thead>
                    <tr>
                      <th>
                        <div className="table-header-with-icon">
                          <RiLightbulbFlashLine />
                          <span>Licence</span>
                        </div>
                      </th>
                      <th>
                        <div className="table-header-with-icon">
                          <RiUserStarLine />
                          <span>Responsable</span>
                        </div>
                      </th>
                      <th>
                        <div className="table-header-with-icon">
                          <RiFlashlightFill />
                          <span>Statut</span>
                        </div>
                      </th>
                      <th>
                        <div className="table-header-with-icon">
                          <RiHomeWifiLine />
                          <span>Appareils</span>
                        </div>
                      </th>
                      <th>
                        <div className="table-header-with-icon">
                          <RiKeyLine />
                          <span>Clé de Licence</span>
                        </div>
                      </th>
                      <th>
                        <div className="table-header-with-icon">
                          <RiMapPinLine />
                          <span>Zone</span>
                        </div>
                      </th>
                      <th>
                        <div className="table-header-with-icon">
                          <RiCalendar2Line />
                          <span>Expiration</span>
                        </div>
                      </th>
                      <th>
                        <div className="table-header-with-icon">
                          <RiSettingsLine />
                          <span>Actions</span>
                        </div>
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {paginatedLicences.length > 0 ? (
                      paginatedLicences.map((licence, i) => (
                        <tr
                          key={licence._id}
                          onClick={() => handleOpenDetails(licence)}
                          role="button"
                          tabIndex={0}
                          aria-label={`Voir les détails de la licence ${licence.nom}`}
                          className="lc-licence-row"
                          onKeyDown={(e) => {
                            if (e.key === 'Enter' || e.key === ' ') {
                              handleOpenDetails(licence);
                            }
                          }}
                        >
                          <td>
                            <div className="lc-licence-name">
                              <RiLightbulbFlashLine className="lc-licence-icon" />
                              <div>
                                <strong>{licence.nom}</strong>
                                <div className="lc-licence-type">{licence.type}</div>
                              </div>
                            </div>
                          </td>
                          <td>
                            <div className="lc-user-info">
                              <RiUserStarLine />
                              <div>
                                <div>{licence.utilisateur.nom || 'Non spécifié'}</div>
                                <div className="lc-user-email">{licence.utilisateur.email || 'Aucun email'}</div>
                              </div>
                            </div>
                          </td>
                          <td>
                            <div className={clsx('lc-status-badge', {
                              'active': licence.statut === 'Active',
                              'expired': licence.statut === 'Expirée',
                              'unknown': !['Active', 'Expirée'].includes(licence.statut)
                            })}>
                              <RiFlashlightFill className="lc-status-icon" />
                              {licence.statut}
                            </div>
                          </td>
                          <td>
                            <div className="lc-devices-info">
                              <div className="lc-devices-count">
                                {licence.utilisateur.appareils?.length || 0}/{licence.appareilsAutorises}
                              </div>
                              <div className="lc-devices-list">
                                {renderAppareilsEclairage(licence.utilisateur.appareils)}
                              </div>
                            </div>
                          </td>
                          <td>
                            <div className="lc-licence-key">
                              <RiKeyLine />
                              <span className="lc-key-value">
                                {licence.cleLicence || 'Non disponible'}
                              </span>
                              <button 
                                className="lc-copy-btn"
                                onClick={(e) => handleCopyKey(e, licence.cleLicence)}
                                aria-label="Copier la clé de licence"
                              >
                                <RiFileCopyLine />
                              </button>
                            </div>
                          </td>
                          <td>
                            <div className="lc-site-info">
                              <RiMapPinLine />
                              {licence.zone}
                            </div>
                          </td>
                          <td>
                            <div className="lc-expiry-info">
                              <RiCalendar2Line />
                              <span>{licence.dateExpiration}</span>
                              {new Date(licence.dateExpiration) < new Date() && (
                                <RiAlarmWarningLine className="lc-expiry-warning" />
                              )}
                            </div>
                          </td>
                          <td className="lc-actions-cell">
                            <div className="lc-action-buttons">
                              <button 
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleLicenceAction('renew', licence._id);
                                }}
                                className="lc-action-btn renew"
                                title="Renouveler"
                              >
                                <RiRefreshLine />
                              </button>
                              {licence.statut === 'Active' ? (
                                <button 
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    handleLicenceAction('suspend', licence._id);
                                  }}
                                  className="lc-action-btn suspend"
                                  title="Suspendre"
                                >
                                  <RiPauseLine />
                                </button>
                              ) : (
                                <button 
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    handleLicenceAction('reactivate', licence._id);
                                  }}
                                  className="lc-action-btn reactivate"
                                  title="Réactiver"
                                >
                                  <RiPlayLine />
                                </button>
                              )}
                              <button 
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleLicenceAction('regenerate', licence._id);
                                }}
                                className="lc-action-btn regenerate"
                                title="Nouvelle clé"
                              >
                                <RiKeyLine />
                              </button>
                              <button 
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleLicenceAction('edit', licence._id);
                                }}
                                className="lc-action-btn edit"
                                title="Modifier"
                              >
                                <RiEditLine />
                              </button>
                              <button 
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleLicenceAction('delete', licence._id);
                                }}
                                className="lc-action-btn delete"
                                title="Supprimer"
                              >
                                <RiDeleteBinLine />
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))
                    ) : (
                      <tr>
                        <td colSpan="8" className="lc-no-licences">
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
                  <RiArrowLeftSLine />
                </button>
                <span>{currentPage} / {totalPages}</span>
                <button
                  className="lc-pagination-btn"
                  onClick={() => handlePageChange(currentPage + 1)}
                  disabled={currentPage === totalPages}
                  aria-label="Page suivante"
                >
                  <RiArrowRightSLine />
                </button>
              </div>
            </div>
          </div>
        </main>
        {isDetailsOpen && (
          <LicenceDetails
            onClose={() => {
              setIsDetailsOpen(false);
              setSelectedLicence(null);
            }}
            licenceData={selectedLicence}
          />
        )}
        {isRenewModalOpen && (
          <RenewLicencePage
            licenceId={actionLicenceId}
            licenceData={licences.find((licence) => licence._id === actionLicenceId)}
            onClose={() => {
              setIsRenewModalOpen(false);
              setActionLicenceId(null);
            }}
            onSave={() => handleActionSave('renew')}
          />
        )}
        {isSuspendModalOpen && (
          <SuspendLicencePage
            licenceId={actionLicenceId}
            onClose={() => {
              setIsSuspendModalOpen(false);
              setActionLicenceId(null);
            }}
            onSave={() => handleActionSave('suspend')}
          />
        )}
        {isReactivateModalOpen && (
          <ReactivateLicencePage
            licenceId={actionLicenceId}
            onClose={() => {
              setIsReactivateModalOpen(false);
              setActionLicenceId(null);
            }}
            onSave={() => handleActionSave('reactivate')}
          />
        )}
        {isRegenerateModalOpen && (
          <RegenerateKeyPage
            licenceId={actionLicenceId}
            onClose={() => {
              setIsRegenerateModalOpen(false);
              setActionLicenceId(null);
            }}
            onSave={() => handleActionSave('regenerate')}
          />
        )}
        {isEditModalOpen && (
          <EditLicencePage
            licenceId={actionLicenceId}
            licenceData={licences.find((licence) => licence._id === actionLicenceId)}
            onClose={() => {
              setIsEditModalOpen(false);
              setActionLicenceId(null);
            }}
            onSave={() => handleActionSave('edit')}
          />
        )}
        {isDeleteModalOpen && (
          <DeleteLicencePage
            licenceId={actionLicenceId}
            onClose={() => {
              setIsDeleteModalOpen(false);
              setActionLicenceId(null);
            }}
            onSave={() => handleActionSave('delete')}
          />
        )}
        <ToastContainer position="top-right" autoClose={3000} />
      </div>
    </div>
  );
}

export default Licences;