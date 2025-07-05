// src/Eclairage.jsx
import React, { useState, useEffect, useMemo, useCallback } from 'react';
import clsx from 'clsx';
import { MapContainer, TileLayer, Marker, Popup, useMap, Tooltip } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import 'leaflet.markercluster/dist/MarkerCluster.css';
import 'leaflet.markercluster/dist/MarkerCluster.Default.css';
import MarkerClusterGroup from 'react-leaflet-markercluster';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import Sidebar from '../components/Sidebar';
import AddPlanificationModal from '../components/AddPlanificationModal';
import EditPlanificationModal from '../components/EditPlanificationModal';
import DeletePlanificationModal from '../components/DeletePlanificationModal';
import EclairageDataPopup from '../components/EclairageDataPopup';
import axios from 'axios';
import './cssP/Eclairage.css';
import { debounce } from 'lodash';

delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
  iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
});

const activeIconSvg = `
<svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
  <path d="M12 2C8.13 2 5 5.13 5 9C5 14.25 12 22 12 22C12 22 19 14.25 19 9C19 5.13 15.87 2 12 2ZM12 11.5C10.62 11.5 9.5 10.38 9.5 9C9.5 7.62 10.62 6.5 12 6.5C13.38 6.5 14.5 7.62 14.5 9C14.5 10.38 13.38 11.5 12 11.5Z" fill="#22C55E"/>
</svg>
`;

const inactiveIconSvg = `
<svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
  <path d="M12 2C8.13 2 5 5.13 5 9C5 14.25 12 22 12 22C12 22 19 14.25 19 9C19 5.13 15.87 2 12 2ZM12 11.5C10.62 11.5 9.5 10.38 9.5 9C9.5 7.62 10.62 6.5 12 6.5C13.38 6.5 14.5 7.62 14.5 9C14.5 10.38 13.38 11.5 12 11.5Z" fill="#EF4444"/>
</svg>
`;

const activeIcon = L.divIcon({
  className: 'custom-marker active',
  html: activeIconSvg,
  iconSize: [24, 24],
  iconAnchor: [12, 24],
  popupAnchor: [0, -24],
});

const inactiveIcon = L.divIcon({
  className: 'custom-marker inactive',
  html: inactiveIconSvg,
  iconSize: [24, 24],
  iconAnchor: [12, 24],
  popupAnchor: [0, -24],
});

function MarkerCluster({ markers }) {
  const map = useMap();

  return (
    <MarkerClusterGroup
      spiderfyOnMaxZoom={true}
      showCoverageOnHover={true}
      zoomToBoundsOnClick={true}
    >
      {markers.map((marker, index) => (
        <Marker
          key={index}
          position={[marker.latitude, marker.longitude]}
          icon={marker.isActive ? activeIcon : inactiveIcon}
          eventHandlers={{
            mouseover: e => e.target.getElement()?.classList.add('marker-hover'),
            mouseout: e => e.target.getElement()?.classList.remove('marker-hover'),
          }}
        >
          <Popup>{marker.popupContent}</Popup>
          <Tooltip>{marker.tooltipContent}</Tooltip>
        </Marker>
      ))}
    </MarkerClusterGroup>
  );
}

function MapSearch({ searchTerm }) {
  const map = useMap();

  useEffect(() => {
    if (searchTerm) {
      fetch(`https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(searchTerm + ', Tunisia')}&format=json&limit=1`)
        .then(response => response.json())
        .then(data => {
          if (data.length > 0) {
            const { lat, lon } = data[0];
            map.setView([parseFloat(lat), parseFloat(lon)], 14);
          } else {
            toast.error('Zone non trouvée');
          }
        })
        .catch(error => {
          toast.error('Erreur lors de la recherche');
          console.error('Erreur de recherche:', error);
        });
    }
  }, [searchTerm, map]);

  return null;
}

function Eclairage() {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [editPlanId, setEditPlanId] = useState(null);
  const [deletePlanId, setDeletePlanId] = useState(null);
  const [dataPopup, setDataPopup] = useState(null);
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [isMobile, setIsMobile] = useState(window.innerWidth < 768);
  const [searchTerm, setSearchTerm] = useState('');
  const [mapSearchTerm, setMapSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [viewMode, setViewMode] = useState('week');
  const [planifications, setPlanifications] = useState([]);
  const [lignes, setLignes] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [deactivatedDays, setDeactivatedDays] = useState({});
  const plansPerPage = 8;

  const toastConfig = useMemo(() => ({
    position: 'top-right',
    autoClose: 3000,
    hideProgressBar: false,
    closeOnClick: true,
    pauseOnHover: true,
    draggable: true,
    theme: 'colored',
    zIndex: 9999,
  }), []);

  useEffect(() => {
    const fetchData = async () => {
      setIsLoading(true);
      setError(null);
      try {
        const [planificationsResponse, lignesResponse] = await Promise.all([
          axios.get('http://localhost:5000/api/planifications'),
          axios.get('http://localhost:5000/api/ligne'),
        ]);

        if (!Array.isArray(planificationsResponse.data)) {
          throw new Error('Les données des planifications ne sont pas au format attendu');
        }
        if (!Array.isArray(lignesResponse.data)) {
          throw new Error('Les données des lignes ne sont pas au format attendu');
        }

        setPlanifications(planificationsResponse.data);
        setLignes(lignesResponse.data);

        if (planificationsResponse.data.length === 0) {
          toast.warn('Aucune planification trouvée', toastConfig);
        }
        if (lignesResponse.data.length === 0) {
          toast.warn('Aucune ligne trouvée', toastConfig);
        }
      } catch (error) {
        const errorMessage = error.response?.data?.message || 'Erreur lors du chargement des données';
        setError(errorMessage);
        toast.error(errorMessage, toastConfig);
        console.error('Fetch error:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, [toastConfig]);

  useEffect(() => {
    const handleResize = () => {
      const mobile = window.innerWidth < 768;
      setIsMobile(mobile);
      if (mobile) setSidebarOpen(false);
    };
    window.addEventListener('resize', handleResize);
    handleResize();
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const filteredPlans = useMemo(() => {
    return planifications.filter(
      plan =>
        (plan.ligne?.nom_L || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
        (plan.site?.nom || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
        (plan.frequence || '').toLowerCase().includes(searchTerm.toLowerCase())
    );
  }, [planifications, searchTerm]);

  const totalPages = Math.ceil(filteredPlans.length / plansPerPage);

  const paginatedPlans = useMemo(() => {
    const startIndex = (currentPage - 1) * plansPerPage;
    return filteredPlans.slice(startIndex, startIndex + plansPerPage);
  }, [filteredPlans, currentPage]);

  const getWeekDays = useCallback(() => {
    const today = new Date();
    const startOfWeek = new Date(today.setDate(today.getDate() - today.getDay()));
    return Array.from({ length: 7 }, (_, i) => {
      const date = new Date(startOfWeek);
      date.setDate(startOfWeek.getDate() + i);
      return date;
    });
  }, []);

  const getDayPlans = useCallback((day, forDisplay = false) => {
    const dayKey = day.toISOString().split('T')[0];
    return filteredPlans
      .filter(plan => {
        if (plan?.frequence === 'Quotidien') {
          return true;
        }
        const planDate = plan.timeSlots?.[0]?.startTime ? new Date(plan.timeSlots[0].startTime) : null;
        if (!planDate) return false;
        const normalizedDate = new Date(day);
        normalizedDate.setHours(planDate.getHours(), planDate.getMinutes(), 0, 0);
        return (
          normalizedDate.getDate() === day.getDate() &&
          normalizedDate.getMonth() === day.getMonth() &&
          normalizedDate.getFullYear() === day.getFullYear()
        );
      })
      .map(plan => ({
        ...plan,
        statut: forDisplay && deactivatedDays[dayKey] ? 'Désactivé' : plan.statut,
      }));
  }, [filteredPlans, deactivatedDays]);

  const handlePageChange = useCallback(page => {
    if (page >= 1 && page <= totalPages) {
      setCurrentPage(page);
    }
  }, [totalPages]);

  const handleSearchChange = useCallback(e => {
    setSearchTerm(e.target.value);
    setCurrentPage(1);
  }, []);

  const handleMapSearchChange = useCallback(
    debounce(e => {
      setMapSearchTerm(e.target.value);
    }, 300),
    []
  );

  const handleClearSearch = useCallback(() => {
    setSearchTerm('');
    setCurrentPage(1);
  }, []);

  const handleClearMapSearch = useCallback(() => {
    setMapSearchTerm('');
  }, []);

  const handleOpenDataPopup = useCallback(plan => setDataPopup(plan), []);
  const handleCloseDataPopup = useCallback(() => setDataPopup(null), []);

  const handleSavePlanification = useCallback(async planData => {
    try {
      const payload = {
        site: planData.site || null,
        ligne: planData.ligne || null,
        timeSlots: planData.timeSlots.map(slot => ({
          startTime: slot.startTime ? slot.startTime.toISOString() : null,
          endTime: slot.endTime ? slot.endTime.toISOString() : null,
          intensity: parseInt(slot.intensity),
        })),
        frequence: planData.frequence,
        mode: planData.mode,
        statut: planData.statut,
        repetition: planData.repetition,
        saison: planData.saison || '',
        donnees: planData.donnees || {},
      };

      const response = await axios.post('http://localhost:5000/api/planifications', payload);
      setPlanifications([...planifications, response.data]);
      toast.success('Planification ajoutée avec succès !', toastConfig);
      setIsModalOpen(false);
    } catch (error) {
      const errorMessage = error.response?.data?.message || 'Erreur lors de l\'ajout de la planification';
      toast.error(errorMessage, toastConfig);
      console.error('Error saving planification:', error.message);
    }
  }, [planifications, toastConfig]);

  const handleEditPlanification = useCallback(async planData => {
    try {
      const payload = {
        site: planData.site?._id || null,
        ligne: planData.ligne?._id || null,
        timeSlots: planData.timeSlots.map(slot => ({
          startTime: slot.startTime ? slot.startTime.toISOString() : null,
          endTime: slot.endTime ? slot.endTime.toISOString() : null,
          intensity: parseInt(slot.intensity),
        })),
        frequence: planData.frequence,
        mode: planData.mode,
        statut: planData.statut,
        repetition: planData.repetition,
        saison: planData.saison || '',
        donnees: planData.donnees || {},
      };

      const response = await axios.put(`http://localhost:5000/api/planifications/${planData._id}`, payload);
      setPlanifications(planifications.map(plan => (plan._id === planData._id ? response.data : plan)));
      toast.success('Planification modifiée avec succès !', toastConfig);
      setIsEditModalOpen(false);
      setEditPlanId(null);
    } catch (error) {
      const errorMessage = error.response?.data?.message || 'Erreur lors de la modification';
      toast.error(errorMessage, toastConfig);
      console.error('Error editing planification:', error.message);
    }
  }, [planifications, toastConfig]);

  const handleDeletePlanification = useCallback(planId => {
    setDeletePlanId(planId);
    setIsDeleteModalOpen(true);
  }, []);

  const handleDeletePlanificationConfirm = useCallback(async reason => {
    try {
      await axios.delete(`http://localhost:5000/api/planifications/${deletePlanId}`, {
        data: { reason },
      });
      setPlanifications(planifications.filter(plan => plan._id !== deletePlanId));
      setDeactivatedDays(prev => {
        const newDeactivatedDays = { ...prev };
        Object.keys(newDeactivatedDays).forEach(dayKey => {
          if (!getDayPlans(new Date(dayKey)).some(plan => plan._id !== deletePlanId)) {
            delete newDeactivatedDays[dayKey];
          }
        });
        return newDeactivatedDays;
      });
      toast.success('Planification supprimée avec succès !', toastConfig);
      setIsDeleteModalOpen(false);
      setDeletePlanId(null);
    } catch (error) {
      const errorMessage = error.response?.data?.message || 'Erreur lors de la suppression';
      toast.error(errorMessage, toastConfig);
      console.error('Error deleting planification:', error.message);
    }
  }, [deletePlanId, getDayPlans, planifications, toastConfig]);

  const handleTogglePlan = useCallback(async (plan, day = null) => {
    if (!window.confirm(`Cette action modifiera le statut de "${plan.ligne?.nom_L || plan.site?.nom || 'planification'}" pour tous les jours. Continuer ?`)) {
      return;
    }
    try {
      const response = await axios.patch(`http://localhost:5000/api/planifications/${plan._id}/toggle`);
      setPlanifications(planifications => planifications.map(p => (p._id === plan._id ? response.data : p)));
      if (day) {
        const dayKey = day.toISOString().split('T')[0];
        setDeactivatedDays(prev => {
          const newDeactivatedDays = { ...prev };
          if (response.data.statut === 'Activé' && newDeactivatedDays[dayKey]) {
            delete newDeactivatedDays[dayKey];
          }
          return newDeactivatedDays;
        });
      }
      toast.success(`Planification ${response.data.statut.toLowerCase()} avec succès !`, toastConfig);
    } catch (error) {
      const errorMessage = error.response?.data?.message || 'Erreur lors du changement de statut';
      toast.error(errorMessage, toastConfig);
      console.error('Error toggling planification:', error.message);
    }
  }, [planifications, toastConfig]);

  const handleToggleAllPlans = useCallback(async (day = null) => {
    try {
      if (day) {
        const dayKey = day.toISOString().split('T')[0];
        const plansToToggle = getDayPlans(day);
        if (plansToToggle.length === 0) {
          toast.info(`Aucun plan à basculer pour le ${day.toLocaleDateString('fr-FR')}`, toastConfig);
          return;
        }
        setDeactivatedDays(prev => {
          const newDeactivatedDays = { ...prev };
          if (newDeactivatedDays[dayKey]) {
            delete newDeactivatedDays[dayKey];
            toast.success(`Planifications du ${day.toLocaleDateString('fr-FR')} réactivées avec succès !`, toastConfig);
          } else {
            newDeactivatedDays[dayKey] = true;
            toast.success(`Planifications du ${day.toLocaleDateString('fr-FR')} désactivées avec succès !`, toastConfig);
          }
          return newDeactivatedDays;
        });
      } else {
        const plansToToggle = filteredPlans.filter(plan => plan.statut === 'Activé');
        if (plansToToggle.length === 0) {
          toast.info('Aucun plan actif à désactiver', toastConfig);
          return;
        }
        const updatedPlans = [];
        for (const plan of plansToToggle) {
          const response = await axios.patch(`http://localhost:5000/api/planifications/${plan._id}/toggle`);
          updatedPlans.push(response.data);
        }
        setPlanifications(prevPlans =>
          prevPlans.map(plan => {
            const updatedPlan = updatedPlans.find(up => up._id === plan._id);
            return updatedPlan || plan;
          })
        );
        setDeactivatedDays({});
        toast.success('Toutes les planifications désactivées avec succès !', toastConfig);
      }
    } catch (error) {
      const errorMessage = error.response?.data?.message || 'Erreur lors de la désactivation des planifications';
      toast.error(errorMessage, toastConfig);
      console.error('Error toggling all plans:', error.message);
    }
  }, [filteredPlans, getDayPlans, toastConfig]);

  const handleActivateAllPlans = useCallback(async () => {
    try {
      const plansToToggle = filteredPlans.filter(plan => plan.statut === 'Désactivé');
      if (plansToToggle.length === 0) {
        toast.info('Aucun plan désactivé à réactiver', toastConfig);
        return;
      }
      const updatedPlans = [];
      for (const plan of plansToToggle) {
        const response = await axios.patch(`http://localhost:5000/api/planifications/${plan._id}/toggle`);
        updatedPlans.push(response.data);
      }
      setPlanifications(prevPlans =>
        prevPlans.map(plan => {
          const updatedPlan = updatedPlans.find(up => up._id === plan._id);
          return updatedPlan || plan;
        })
      );
      setDeactivatedDays({});
      toast.success('Toutes les planifications réactivées avec succès !', toastConfig);
    } catch (error) {
      const errorMessage = error.response?.data?.message || 'Erreur lors de la réactivation des planifications';
      toast.error(errorMessage, toastConfig);
      console.error('Error activating all plans:', error.message);
    }
  }, [filteredPlans, toastConfig]);

  const handleEditPlan = useCallback(plan => {
    setEditPlanId(plan._id);
    setIsEditModalOpen(true);
  }, []);

  const markers = useMemo(() => {
    return lignes.map(ligne => {
      const plan = planifications.find(p => p.ligne?._id.toString() === ligne._id.toString());
      const isActive = plan?.statut === 'Activé';
      return {
        latitude: ligne.latitude || 36.8065,
        longitude: ligne.longitude || 10.1647,
        isActive,
        popupContent: (
          <div className="p-4 bg-white rounded-lg shadow-md">
            <h3 className="text-lg font-semibold text-gray-800 mb-2">
              {ligne.nom_L || 'Ligne inconnue'}
            </h3>
            <p className="text-sm text-gray-600 mb-4">
              Statut: <span className={isActive ? 'text-green-500' : 'text-red-500'}>
                {plan?.statut || 'Aucune planification'}
              </span>
            </p>
            {plan && (
              <button
                className="w-full px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 transition-colors"
                onClick={() => window.dispatchEvent(new CustomEvent('openDataPopup', { detail: { planId: plan._id } }))}
              >
                Détails
              </button>
            )}
          </div>
        ),
        tooltipContent: ligne.nom_L || 'Ligne inconnue',
      };
    });
  }, [lignes, planifications]);

  useEffect(() => {
    const handleOpenPopup = (event) => {
      const planId = event.detail.planId;
      const plan = planifications.find(p => p._id === planId);
      if (plan) handleOpenDataPopup(plan);
    };
    window.addEventListener('openDataPopup', handleOpenPopup);
    return () => window.removeEventListener('openDataPopup', handleOpenPopup);
  }, [planifications, handleOpenDataPopup]);

  return (
    <div className="eclairage-page root-plant">
      <div className="ec-container">
        <Sidebar
          onToggle={isOpen => setSidebarOpen(isOpen)}
          className={clsx('ec-sidebar', {
            'sidebar-open': sidebarOpen,
            'sidebar-collapsed': !sidebarOpen,
          })}
        />
        <main
          className={clsx('ec-main-content', {
            'sidebar-collapsed': !sidebarOpen || isMobile,
          })}
          style={{
            flex: 1,
            marginLeft: 0,
            paddingLeft: 0,
            marginTop: '2rem',
          }}
        >
          <div className="ec-dashboard-card">
            {isLoading ? (
              <div className="ec-loading">Chargement des planifications...</div>
            ) : error ? (
              <div className="ec-error">Erreur : {error}</div>
            ) : (
              <>
                <div className="ec-page-header">
                  <div className="ec-header-content">
                    <div className="ec-title-wrapper">
                      <div className="ec-title-icon-container">
                        <i className="ri-lightbulb-line ec-main-icon"></i>
                      </div>
                      <div>
                        <h1 className="ec-main-title">
                          Gestion des Plans
                          <span className="ec-title-underline"></span>
                        </h1>
                        <p className="ec-subtitle">Planification moderne des lignes</p>
                      </div>
                    </div>
                    <button
                      className="ec-btn ec-btn-primary ec-add-plan-btn"
                      onClick={() => setIsModalOpen(true)}
                      aria-label="Ajouter une planification"
                    >
                      <i className="ri-add-circle-line"></i>
                      <span>Nouveau Plan</span>
                    </button>
                  </div>
                </div>
                <div className="ec-panel-header-card">
                  <div className="ec-list-header-wrapper">
                    <div className="ec-list-title-container">
                      <i className="ri-table-line ec-list-icon"></i>
                      <h2 className="ec-list-title">
                        Liste des Plans
                        <span className="ec-site-count">{filteredPlans.length} plan(s)</span>
                      </h2>
                    </div>
                    <div className="ec-search-filter-container">
                      <div className="ec-search-box">
                        <i className="ri-search-line ec-search-icon"></i>
                        <input
                          id="plan-search"
                          type="text"
                          placeholder="Rechercher une planification..."
                          className="ec-search-input"
                          value={searchTerm}
                          onChange={handleSearchChange}
                          aria-label="Rechercher une planification"
                        />
                        {searchTerm && (
                          <i
                            className="ri-close-line ec-clear-icon"
                            onClick={handleClearSearch}
                            aria-label="Effacer la recherche"
                          />
                        )}
                      </div>
                      <div className="ec-filter-group">
                        <button className="ec-btn ec-btn-secondary" aria-label="Filtrer les planifications">
                          <i className="ri-filter-3-line"></i>
                          <span>Filtrer</span>
                        </button>
                        <button
                          className="ec-btn ec-btn-secondary ec-sort-btn"
                          aria-label="Trier les planifications"
                        >
                          <i className="ri-arrow-up-down-line"></i>
                        </button>
                        <div className="ec-view-switch">
                          <button
                            className={clsx('ec-btn ec-btn-secondary ec-view-btn', { active: viewMode === 'week' })}
                            onClick={() => setViewMode('week')}
                            aria-label="Vue semaine"
                          >
                            <i className="ri-calendar-2-line"></i>
                          </button>
                          <button
                            className={clsx('ec-btn ec-btn-secondary ec-view-btn', { active: viewMode === 'list' })}
                            onClick={() => setViewMode('list')}
                            aria-label="Vue liste"
                          >
                            <i className="ri-list-check"></i>
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="ec-map-container">
                  <h3 className="ec-section-title">
                    <i className="ri-map-pin-line"></i>
                    Carte des lignes
                  </h3>
                  <div className="ec-map-card">
                    <div className="ec-map-search-card">
                      <i className="ri-search-line ec-search-icon"></i>
                      <input
                        type="text"
                        placeholder="Rechercher une zone en Tunisie..."
                        className="search-input"
                        value={mapSearchTerm}
                        onChange={handleMapSearchChange}
                        aria-label="Rechercher une zone"
                      />
                      {mapSearchTerm && (
                        <i
                          className="ri-close-line ec-clear-icon"
                          onClick={handleClearMapSearch}
                          aria-label="Effacer la recherche"
                        />
                      )}
                    </div>
                    <MapContainer
                      center={[36.8065, 10.1647]}
                      zoom={13}
                      className="ec-map"
                      style={{ height: '400px' }}
                    >
                      <TileLayer
                        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                        attribution='© <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
                      />
                      <MapSearch searchTerm={mapSearchTerm} />
                      {markers.length > 0 ? (
                        <MarkerCluster markers={markers} />
                      ) : (
                        <Popup position={[36.8065, 10.1647]}>
                          <div className="p-4 bg-white rounded-lg shadow-md">
                            Aucune ligne avec localisation disponible
                          </div>
                        </Popup>
                      )}
                    </MapContainer>
                  </div>
                </div>

                <div className="ec-planifications-table-container">
                  <h3 className="ec-section-title">
                    <i className="ri-calendar-todo-line ec-icon"></i>
                    Planifications
                  </h3>
                  {viewMode === 'week' ? (
                    <div className="ec-week-view-table">
                      <div className="ec-week-days-header">
                        {getWeekDays().map(day => {
                          const dayKey = day.toISOString().split('T')[0];
                          return (
                            <div key={day.toISOString()} className={clsx('ec-day-column', { 'day-deactivated': deactivatedDays[dayKey] })}>
                              <div className="ec-day-label">
                                <span className="ec-day-name">{day.toLocaleDateString('fr-FR', { weekday: 'long' }).toUpperCase()}</span>
                                <span className="ec-day-date">{day.toLocaleString('fr-FR', { day: '2-digit', month: '2-digit' })}</span>
                                <button
                                  className="ec-action-btn status"
                                  onClick={() => handleToggleAllPlans(day)}
                                  aria-label={deactivatedDays[dayKey] ? `Réactiver les planifications du ${day.toLocaleDateString('fr-FR')}` : `Désactiver les planifications du ${day.toLocaleDateString('fr-FR')}`}
                                  title={deactivatedDays[dayKey] ? `Réactiver les planifications du ${day.toLocaleDateString('fr-FR')}` : `Désactiver les planifications du ${day.toLocaleDateString('fr-FR')}`}
                                >
                                  <i className={deactivatedDays[dayKey] ? 'ri-play-circle-line' : 'ri-pause-circle-line'}></i>
                                </button>
                              </div>
                            </div>
                          );
                        })}
                      </div>
                      <div className="ec-week-plans">
                        {getWeekDays().map(day => (
                          <div key={day.toISOString()} className="ec-day-column">
                            {getDayPlans(day, true).map(plan => (
                              <div key={plan._id} className="ec-plan-card">
                                <div className="ec-plan-time">
                                  <i className="ri-time-line"></i>
                                  <span>
                                    {plan.timeSlots[0]?.startTime
                                      ? new Date(plan.timeSlots[0].startTime).toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' })
                                      : 'N/A'}
                                    {' - '}
                                    {plan.timeSlots[0]?.endTime
                                      ? new Date(plan.timeSlots[0].endTime).toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' })
                                      : 'N/A'}
                                  </span>
                                </div>
                                <div className="ec-plan-details">
                                  <div className="ec-plan-title">
                                    <i className="ri-lightbulb-line"></i>
                                    <span>{plan.ligne?.nom_L || plan.site?.nom || 'Non spécifié'}</span>
                                  </div>
                                  <div className="ec-plan-meta">
                                    <span><i className="ri-repeat-line"></i> {plan.frequence || 'N/A'}</span>
                                    <span><i className="ri-settings-line"></i> {plan.mode || 'N/A'}</span>
                                    <span><i className="ri-lightbulb-flash-line"></i> {plan.timeSlots[0]?.intensity || 'N/A'}%</span>
                                  </div>
                                  <div className="ec-plan-status">
                                    <i className={`ri-${plan.statut === 'Activé' ? 'checkbox-circle-fill' : 'close-circle-fill'}`} />
                                    <span
                                      className={clsx('ec-status-label', {
                                        active: plan.statut === 'Activé',
                                        inactive: plan.statut !== 'Activé',
                                      })}
                                    >
                                      {plan.statut || 'N/A'}
                                    </span>
                                  </div>
                                  <div className="ec-action-buttons">
                                    <button
                                      className="ec-action-btn edit"
                                      onClick={() => handleEditPlan(plan)}
                                      aria-label={`Modifier ${plan.ligne?.nom_L || plan.site?.nom || 'planification'} pour le ${day.toLocaleDateString('fr-FR')}`}
                                    >
                                      <i className="ri-edit-line"></i>
                                    </button>
                                    <button
                                      className="ec-action-btn delete"
                                      onClick={() => handleDeletePlanification(plan._id)}
                                      aria-label={`Supprimer ${plan.ligne?.nom_L || plan.site?.nom || 'planification'} pour le ${day.toLocaleDateString('fr-FR')}`}
                                    >
                                      <i className="ri-delete-bin-line"></i>
                                    </button>
                                    <button
                                      className="ec-action-btn status"
                                      onClick={() => handleTogglePlan(plan, day)}
                                      aria-label={`Basculer ${plan.ligne?.nom_L || plan.site?.nom || 'planification'} pour le ${day.toLocaleDateString('fr-FR')}`}
                                    >
                                      <i className={plan.statut === 'Activé' ? 'ri-pause-line' : 'ri-play-line'}></i>
                                    </button>
                                  </div>
                                </div>
                              </div>
                            ))}
                            {!getDayPlans(day, true).length && (
                              <div className="ec-no-plans">
                                <span>Aucune planification</span>
                              </div>
                            )}
                          </div>
                        ))}
                      </div>
                    </div>
                  ) : (
                    <div className="ec-table-responsive">
                      <table className="ec-planifications-table">
                        <thead>
                          <tr>
                            <th scope="col">
                              <div className="table-header-with-icon">
                                <i className="ri-calendar-line"></i>
                                <span>Date</span>
                              </div>
                            </th>
                            <th scope="col">
                              <div className="table-header-with-icon">
                                <i className="ri-time-line"></i>
                                <span>Horaire</span>
                              </div>
                            </th>
                            <th scope="col">
                              <div className="table-header-with-icon">
                                <i className="ri-lightbulb-line"></i>
                                <span>Ligne/Site</span>
                              </div>
                            </th>
                            <th scope="col">
                              <div className="table-header-with-icon">
                                <i className="ri-repeat-line"></i>
                                <span>Fréquence</span>
                              </div>
                            </th>
                            <th scope="col">
                              <div className="table-header-with-icon">
                                <i className="ri-settings-line"></i>
                                <span>Mode</span>
                              </div>
                            </th>
                            <th scope="col">
                              <div className="table-header-with-icon">
                                <i className="ri-lightbulb-flash-line"></i>
                                <span>Intensité</span>
                              </div>
                            </th>
                            <th scope="col">
                              <div className="table-header-with-icon">
                                <i className="ri-checkbox-circle-line"></i>
                                <span>Statut</span>
                              </div>
                            </th>
                            <th scope="col">
                              <div className="table-header-with-icon">
                                <i className="ri-settings-2-line"></i>
                                <span>Actions</span>
                              </div>
                            </th>
                          </tr>
                        </thead>
                        <tbody>
                          {paginatedPlans.length > 0 ? (
                            paginatedPlans.map((plan, i) => {
                              const planDate = plan.timeSlots[0]?.startTime ? new Date(plan.timeSlots[0].startTime) : new Date();
                              const dayKey = planDate.toISOString().split('T')[0];
                              const displayStatut = deactivatedDays[dayKey] ? 'Désactivé' : plan.statut;
                              return (
                                <tr key={plan._id} className={i % 2 === 0 ? 'ec-table-row-even' : 'ec-table-row-odd'}>
                                  <td>
                                    <div className="ec-icon-cell">
                                      {plan.timeSlots[0]?.startTime
                                        ? new Date(plan.timeSlots[0].startTime).toLocaleDateString('fr-FR', {
                                            day: '2-digit',
                                            month: '2-digit',
                                            year: 'numeric',
                                          })
                                        : 'N/A'}
                                    </div>
                                  </td>
                                  <td>
                                    <div className="ec-icon-cell">
                                      <i className="ri-time-line"></i>
                                      {plan.timeSlots[0]?.startTime
                                        ? new Date(plan.timeSlots[0].startTime).toLocaleTimeString('fr-FR', {
                                            hour: '2-digit',
                                            minute: '2-digit',
                                          })
                                        : 'N/A'}{' '}
                                      -{' '}
                                      {plan.timeSlots[0]?.endTime
                                        ? new Date(plan.timeSlots[0].endTime).toLocaleTimeString('fr-FR', {
                                            hour: '2-digit',
                                            minute: '2-digit',
                                          })
                                        : 'N/A'}
                                    </div>
                                  </td>
                                  <td>
                                    <div className="ec-icon-cell">
                                      <i className="ri-lightbulb-line"></i>
                                      {plan.ligne?.nom_L || plan.site?.nom || 'Non spécifié'}
                                    </div>
                                  </td>
                                  <td>
                                    <div className="ec-icon-cell">
                                      <i className="ri-repeat-line"></i>
                                      {plan.frequence || 'N/A'}
                                    </div>
                                  </td>
                                  <td>
                                    <div className="ec-icon-cell">
                                      <i className="ri-settings-line"></i>
                                      {plan.mode || 'N/A'}
                                    </div>
                                  </td>
                                  <td>
                                    <div className="ec-icon-cell">
                                      <i className="ri-lightbulb-flash-line"></i>
                                      {plan.timeSlots[0]?.intensity || 'N/A'}%
                                    </div>
                                  </td>
                                  <td>
                                    <div className="ec-icon-cell">
                                      <i className={`ri-${displayStatut === 'Activé' ? 'checkbox-circle-fill' : 'close-circle-fill'}`} />
                                      <span
                                        className={clsx('ec-status-label', {
                                          active: displayStatut === 'Activé',
                                          inactive: displayStatut !== 'Activé',
                                        })}
                                      >
                                        {displayStatut || 'N/A'}
                                      </span>
                                    </div>
                                  </td>
                                  <td>
                                    <div className="ec-action-buttons">
                                      <button
                                        className="ec-action-btn edit"
                                        onClick={() => handleEditPlan(plan)}
                                        aria-label={`Modifier ${plan.ligne?.nom_L || plan.site?.nom || 'planification'}`}
                                      >
                                        <i className="ri-edit-line"></i>
                                      </button>
                                      <button
                                        className="ec-action-btn delete"
                                        onClick={() => handleDeletePlanification(plan._id)}
                                        aria-label={`Supprimer ${plan.ligne?.nom_L || plan.site?.nom || 'planification'}`}
                                      >
                                        <i className="ri-delete-bin-line"></i>
                                      </button>
                                      <button
                                        className="ec-action-btn status"
                                        onClick={() => handleTogglePlan(plan)}
                                        aria-label={`Basculer ${plan.ligne?.nom_L || plan.site?.nom || 'planification'}`}
                                      >
                                        <i className={displayStatut === 'Activé' ? 'ri-pause-line' : 'ri-play-line'}></i>
                                      </button>
                                    </div>
                                  </td>
                                </tr>
                              );
                            })
                          ) : (
                            <tr>
                              <td colSpan="8" className="ec-no-eclairages">
                                Aucune planification disponible.
                              </td>
                            </tr>
                          )}
                        </tbody>
                      </table>
                    </div>
                  )}

                  {isMobile && (
                    <div className="ec-planification-cards">
                      {paginatedPlans.length > 0 ? (
                        paginatedPlans.map((plan, i) => {
                          const planDate = plan.timeSlots[0]?.startTime ? new Date(plan.timeSlots[0].startTime) : new Date();
                          const dayKey = planDate.toISOString().split('T')[0];
                          const displayStatut = deactivatedDays[dayKey] ? 'Désactivé' : plan.statut;
                          return (
                            <div key={plan._id} className="ec-plan-card-mobile">
                              <div className="ec-plan-card-header">
                                <div className="ec-plan-card-title">
                                  <span className="plan-number">{(currentPage - 1) * plansPerPage + i + 1}.</span>
                                  <i className="ri-lightbulb-line"></i>
                                  <span>{plan.ligne?.nom_L || plan.site?.nom || 'Non spécifié'}</span>
                                </div>
                              </div>
                              <div className="ec-plan-card-body">
                                <div className="ec-plan-card-item">
                                  <i className="ri-time-line"></i>
                                  <span>
                                    {plan.timeSlots[0]?.startTime
                                      ? new Date(plan.timeSlots[0].startTime).toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' })
                                      : 'N/A'}{' '}
                                    -{' '}
                                    {plan.timeSlots[0]?.endTime
                                      ? new Date(plan.timeSlots[0].endTime).toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' })
                                      : 'N/A'}
                                  </span>
                                </div>
                                <div className="ec-plan-card-item">
                                  <i className="ri-repeat-line"></i>
                                  <span>{plan.frequence || 'N/A'}</span>
                                </div>
                                <div className="ec-plan-card-item">
                                  <i className="ri-settings-line"></i>
                                  <span>{plan.mode || 'N/A'}</span>
                                </div>
                                <div className="ec-plan-card-item">
                                  <i className="ri-lightbulb-flash-line"></i>
                                  <span>{plan.timeSlots[0]?.intensity || 'N/A'}%</span>
                                </div>
                                <div className="ec-plan-card-item">
                                  <i className={`ri-${displayStatut === 'Activé' ? 'checkbox-circle-fill' : 'close-circle-fill'}`} />
                                  <span
                                    className={clsx('ec-status-label', {
                                      active: displayStatut === 'Activé',
                                      inactive: displayStatut !== 'Activé',
                                    })}
                                  >
                                    {displayStatut || 'N/A'}
                                  </span>
                                </div>
                              </div>
                              <div className="ec-plan-card-footer">
                                <div className="ec-action-buttons">
                                  <button
                                    className="ec-action-btn edit"
                                    onClick={() => handleEditPlan(plan)}
                                    aria-label={`Modifier ${plan.ligne?.nom_L || plan.site?.nom || 'planification'}`}
                                  >
                                    <i className="ri-edit-line"></i>
                                  </button>
                                  <button
                                    className="ec-action-btn delete"
                                    onClick={() => handleDeletePlanification(plan._id)}
                                    aria-label={`Supprimer ${plan.ligne?.nom_L || plan.site?.nom || 'planification'}`}
                                  >
                                    <i className="ri-delete-bin-line"></i>
                                  </button>
                                  <button
                                    className="ec-action-btn status"
                                    onClick={() => handleTogglePlan(plan)}
                                    aria-label={`Basculer ${plan.ligne?.nom_L || plan.site?.nom || 'planification'}`}
                                  >
                                    <i className={displayStatut === 'Activé' ? 'ri-pause-line' : 'ri-play-line'}></i>
                                  </button>
                                </div>
                              </div>
                            </div>
                          );
                        })
                      ) : (
                        <div className="ec-no-eclairages">Aucune planification disponible.</div>
                      )}
                    </div>
                  )}

                  <div className="ec-table-footer">
                    <div className="ec-pagination-info">
                      Affichage {(currentPage - 1) * plansPerPage + 1}-
                      {Math.min(currentPage * plansPerPage, filteredPlans.length)} sur{' '}
                      {filteredPlans.length} planification(s)
                    </div>
                    <div className="ec-pagination-controls">
                      <button
                        className="ec-pagination-btn"
                        onClick={() => handlePageChange(currentPage - 1)}
                        disabled={currentPage === 1}
                        aria-label="Page précédente"
                      >
                        <i className="ri-arrow-left-s-line"></i>
                      </button>
                      <span>{currentPage}</span>
                      <button
                        className="ec-pagination-btn"
                        onClick={() => handlePageChange(currentPage + 1)}
                        disabled={currentPage === totalPages}
                        aria-label="Page suivante"
                      >
                        <i className="ri-arrow-right-s-line"></i>
                      </button>
                    </div>
                  </div>

                  {isModalOpen && (
                    <AddPlanificationModal
                      onClose={() => setIsModalOpen(false)}
                      onSave={handleSavePlanification}
                    />
                  )}

                  {isEditModalOpen && editPlanId && (
                    <EditPlanificationModal
                      planId={editPlanId}
                      onClose={() => {
                        setIsEditModalOpen(false);
                        setEditPlanId(null);
                      }}
                      onSave={handleEditPlanification}
                    />
                  )}

                  {isDeleteModalOpen && deletePlanId && (
                    <DeletePlanificationModal
                      planId={deletePlanId}
                      onClose={() => {
                        setIsDeleteModalOpen(false);
                        setDeletePlanId(null);
                      }}
                      onSave={handleDeletePlanificationConfirm}
                    />
                  )}

                  {dataPopup && (
                    <EclairageDataPopup
                      planification={dataPopup}
                      onClose={handleCloseDataPopup}
                    />
                  )}

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
                    theme="colored"
                    style={{ zIndex: 9999 }}
                  />
                </div>
              </>
            )}
          </div>
        </main>
      </div>
    </div>
  );
}

export default Eclairage;