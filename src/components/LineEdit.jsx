import React, { useState, useRef, useEffect } from 'react';
import { InputText } from 'primereact/inputtext';
import { Dropdown } from 'primereact/dropdown';
import { MapContainer, TileLayer, Marker, useMapEvents } from 'react-leaflet';
import L from 'leaflet';
import axios from 'axios';
import PropTypes from 'prop-types';
import { toast } from 'react-toastify';
import 'leaflet/dist/leaflet.css';
import 'react-toastify/dist/ReactToastify.css';
import './LineEdit.css';

const lineIcon = new L.Icon({
  iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
  iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [0, -41],
  shadowSize: [41, 41],
});

const LineEdit = ({ visible, onHide, line, onSave }) => {
  const mapRef = useRef(null);
  const [lineData, setLineData] = useState({
    nom_L: '',
    code: '',
    type: 'Basse Tension',
    lengthKm: '',
    type_conducteur: '',
    site: '',
    status: 'Active',
    description: '',
    startPoint: { name: '', lat: null, lng: null },
    endPoint: { name: '', lat: null, lng: null },
    nombrePoteaux: null,
  });
  const [selectingPoint, setSelectingPoint] = useState(null);
  const [startMarker, setStartMarker] = useState(null);
  const [endMarker, setEndMarker] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [siteOptions, setSiteOptions] = useState([]);
  const [loadingSites, setLoadingSites] = useState(false);

  const toastConfig = {
    position: 'top-right',
    autoClose: 3000,
    hideProgressBar: false,
    closeOnClick: true,
    pauseOnHover: true,
    draggable: true,
  };

  const mapVoltageToOption = (voltage) => {
    const voltageMap = {
      'basse tension': 'Basse Tension',
      'moyenne tension': 'Moyenne Tension',
      'haute tension': 'Haute Tension',
      'très haute tension': 'Très Haute Tension',
      bt: 'Basse Tension',
      mt: 'Moyenne Tension',
      ht: 'Haute Tension',
      tht: 'Très Haute Tension',
    };
    const normalizedVoltage = voltage?.toLowerCase().trim();
    const mappedValue = voltageMap[normalizedVoltage] || 'Basse Tension';
    if (!mappedValue && voltage) {
      toast.warn(`La tension "${voltage}" n'est pas valide. Utilisation de Basse Tension par défaut.`, toastConfig);
    }
    return mappedValue;
  };

  const validateConductorType = (conductorType) => {
    const validTypes = ['Cuivre', 'Aluminium', 'ACSR', 'AAAC'];
    const normalizedType = conductorType?.trim();
    return validTypes.includes(normalizedType) ? normalizedType : '';
  };

  useEffect(() => {
    const fetchSites = async () => {
      setLoadingSites(true);
      try {
        const response = await axios.get('http://localhost:5000/api/site/allsite');
        const sites = response.data.map((site) => ({
          label: site.nom,
          value: site._id,
        }));
        setSiteOptions(sites);
        if (visible && !lineData.site && sites.length > 0) {
          setLineData((prev) => ({ ...prev, site: sites[0].value }));
        }
        if (sites.length === 0) {
          toast.warn('Aucun site disponible. Veuillez ajouter un site.', toastConfig);
        }
      } catch (error) {
        toast.error('Impossible de charger les sites.', toastConfig);
        console.error('Erreur fetchSites:', error);
      } finally {
        setLoadingSites(false);
      }
    };

    if (visible && line) {
      fetchSites();
      setLineData({
        nom_L: line.nom_L || '',
        code: line.code || '',
        type: mapVoltageToOption(line.type) || 'Basse Tension',
        lengthKm: line.lengthKm || '',
        type_conducteur: validateConductorType(line.type_conducteur),
        site: line.site?._id || (typeof line.site === 'string' ? line.site : ''),
        status: line.status || 'Active',
        description: line.description || '',
        startPoint: line.startPoint || { name: '', lat: null, lng: null },
        endPoint: line.endPoint || { name: '', lat: null, lng: null },
        nombrePoteaux: line.nombrePoteaux || 0,
      });
      setStartMarker(line.startPoint?.lat ? [line.startPoint.lat, line.startPoint.lng] : null);
      setEndMarker(line.endPoint?.lat ? [line.endPoint.lat, line.endPoint.lng] : null);
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'auto';
    }

    return () => {
      document.body.style.overflow = 'auto';
    };
  }, [visible, line]);

  useEffect(() => {
    if (visible && mapRef.current) {
      setTimeout(() => {
        mapRef.current.invalidateSize();
      }, 100);
    }
  }, [visible]);

  const voltageOptions = [
    { label: 'Basse Tension (BT)', value: 'Basse Tension' },
    { label: 'Moyenne Tension (MT)', value: 'Moyenne Tension' },
    { label: 'Haute Tension (HT)', value: 'Haute Tension' },
    { label: 'Très Haute Tension (THT)', value: 'Très Haute Tension' },
  ];

  const conductorOptions = [
    { label: 'Cuivre', value: 'Cuivre' },
    { label: 'Aluminium', value: 'Aluminium' },
    { label: 'ACSR', value: 'ACSR' },
    { label: 'AAAC', value: 'AAAC' },
  ];

  const statusOptions = [
    { label: 'Active', value: 'Active' },
    { label: 'En maintenance', value: 'Maintenance' },
    { label: 'Hors service', value: 'Inactive' },
  ];

  const handleInputChange = (e) => {
    const { name, value } = e.target || e;
    if (name === 'startPoint' || name === 'endPoint') {
      setLineData((prev) => ({
        ...prev,
        [name]: { ...prev[name], name: value },
      }));
    } else {
      setLineData((prev) => ({ ...prev, [name]: value }));
    }
  };

  const handleUpdate = async () => {
    if (!line?._id || !lineData.nom_L || !lineData.type || !lineData.site) {
      toast.error('Les champs Nom, Type et Site sont obligatoires.', toastConfig);
      return;
    }
    if (!lineData.startPoint.lat || !lineData.endPoint.lat) {
      toast.error("Veuillez sélectionner les localisations pour le point de départ et d'arrivée.", toastConfig);
      return;
    }

    try {
      const payload = {
        nom_L: lineData.nom_L,
        code: lineData.code,
        type: lineData.type,
        lengthKm: parseFloat(lineData.lengthKm) || null,
        type_conducteur: lineData.type_conducteur,
        site: lineData.site,
        status: lineData.status,
        description: lineData.description,
        startPoint: {
          name: lineData.startPoint.name || 'Point de départ',
          lat: lineData.startPoint.lat,
          lng: lineData.startPoint.lng,
        },
        endPoint: {
          name: lineData.endPoint.name || 'Point d\'arrivée',
          lat: lineData.endPoint.lat,
          lng: lineData.endPoint.lng,
        },
        nombrePoteaux: parseInt(lineData.nombrePoteaux) || 0,
      };
      console.log('Update payload:', JSON.stringify(payload, null, 2));
      const { data } = await axios.put(`http://localhost:5000/api/ligne/${line._id}`, payload);
      toast.success('Ligne mise à jour avec succès.', toastConfig);
      if (typeof onSave === 'function') {
        await onSave({ ...data, _id: line._id });
      }
      onHide(); // Close immediately after success
    } catch (error) {
      const errorMessage = error.response?.data?.message || 'Échec de la mise à jour.';
      console.error('Update error:', {
        message: errorMessage,
        status: error.response?.status,
        data: error.response?.data,
      });
      toast.error(errorMessage, toastConfig);
    }
  };

  const MapClickHandler = () => {
    useMapEvents({
      click(e) {
        if (selectingPoint) {
          const { lat, lng } = e.latlng;
          setLineData((prev) => ({
            ...prev,
            [selectingPoint]: {
              ...prev[selectingPoint],
              lat,
              lng,
              name: prev[selectingPoint].name || (selectingPoint === 'startPoint' ? 'Point de départ' : 'Point d\'arrivée'),
            },
          }));
          if (selectingPoint === 'startPoint') {
            setStartMarker([lat, lng]);
          } else if (selectingPoint === 'endPoint') {
            setEndMarker([lat, lng]);
          }
          setSelectingPoint(null);
          toast.success(`Point ${selectingPoint === 'startPoint' ? 'de départ' : 'd\'arrivée'} sélectionné.`, toastConfig);
        }
      },
    });
    return null;
  };

  const handleSearch = async () => {
    if (!searchQuery) {
      toast.warn('Veuillez entrer une adresse à rechercher.', toastConfig);
      return;
    }

    try {
      const response = await fetch(
        `https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(searchQuery)}&format=json&limit=1&countrycodes=TN`
      );
      const data = await response.json();
      if (data.length > 0) {
        const { lat, lon } = data[0];
        const latLng = [parseFloat(lat), parseFloat(lon)];
        if (mapRef.current) {
          mapRef.current.setView(latLng, 13);
        }
        setLineData((prev) => ({
          ...prev,
          startPoint: { ...prev.startPoint, lat: latLng[0], lng: latLng[1], name: searchQuery },
        }));
        setStartMarker(latLng);
        toast.success('Localisation trouvée.', toastConfig);
      } else {
        toast.error('Aucune adresse trouvée pour cette recherche en Tunisie.', toastConfig);
      }
    } catch (error) {
      toast.error('Erreur lors de la recherche d’adresse.', toastConfig);
      console.error('Erreur handleSearch:', error);
    }
  };

  const handleResetMarkers = () => {
    setLineData((prev) => ({
      ...prev,
      startPoint: { name: '', lat: null, lng: null },
      endPoint: { name: '', lat: null, lng: null },
    }));
    setStartMarker(null);
    setEndMarker(null);
    setSearchQuery('');
    toast.info('Marqueurs et coordonnées réinitialisés.', toastConfig);
  };

  const handleOverlayClick = (e) => {
    if (e.target === e.currentTarget) {
      console.log('Overlay clicked, closing modal.');
      onHide();
    }
  };

  const handleClose = () => {
    console.log('Close button clicked, closing modal.');
    onHide();
  };

  if (!visible) return null;

  return (
    <div className="line-edit-modal-overlay visible" onClick={handleOverlayClick}>
      <div className="line-edit-modal-container">
        <div className="line-edit-modal-header">
          <div className="line-edit-header-content">
            <i className="pi pi-bolt line-edit-header-icon" />
            <h2>Modifier la Ligne Électrique</h2>
          </div>
          <button className="line-edit-close-btn" onClick={handleClose}>
            <i className="pi pi-times" />
          </button>
        </div>
        <div className="line-edit-modal-body">
          <div className="line-edit-form-grid">
            <div className="line-edit-form-group">
              <label className="line-edit-form-label">
                <i className="pi pi-align-left" /> Nom de la ligne *
              </label>
              <InputText
                name="nom_L"
                value={lineData.nom_L}
                onChange={handleInputChange}
                placeholder="Ligne principale A"
                className="line-edit-form-input"
                required
              />
            </div>
            <div className="line-edit-form-group">
              <label className="line-edit-form-label">
                <i className="pi pi-tag" /> Code
              </label>
              <InputText
                name="code"
                value={lineData.code}
                placeholder="LINE1234567890"
                className="line-edit-form-input line-edit-coords-input"
                readOnly
              />
            </div>
            <div className="line-edit-form-group">
              <label className="line-edit-form-label">
                <i className="pi pi-bolt" /> Tension *
              </label>
              <Dropdown
                name="type"
                value={lineData.type}
                options={voltageOptions}
                onChange={(e) => handleInputChange({ target: { name: 'type', value: e.value } })}
                placeholder="Sélectionnez la tension"
                className="line-edit-form-dropdown"
                required
              />
            </div>
            <div className="line-edit-form-group">
              <label className="line-edit-form-label">
                <i className="pi pi-arrows-h" /> Longueur (km)
              </label>
              <InputText
                name="lengthKm"
                value={lineData.lengthKm}
                onChange={handleInputChange}
                placeholder="10.5"
                keyfilter="num"
                className="line-edit-form-input"
              />
            </div>
            <div className="line-edit-form-group">
              <label className="line-edit-form-label">
                <i className="pi pi-wifi" /> Type de conducteur
              </label>
              <Dropdown
                name="type_conducteur"
                value={lineData.type_conducteur}
                options={conductorOptions}
                onChange={(e) => handleInputChange({ target: { name: 'type_conducteur', value: e.value } })}
                placeholder="Sélectionnez le type"
                className="line-edit-form-dropdown"
              />
            </div>
            <div className="line-edit-form-group">
              <label className="line-edit-form-label">
                <i className="pi pi-check-circle" /> Statut
              </label>
              <Dropdown
                name="status"
                value={lineData.status}
                options={statusOptions}
                onChange={(e) => handleInputChange({ target: { name: 'status', value: e.value } })}
                className="line-edit-form-dropdown"
              />
            </div>
            <div className="line-edit-form-group">
              <label className="line-edit-form-label">
                <i className="pi pi-list" /> Nombre de poteaux
              </label>
              <InputText
                name="nombrePoteaux"
                value={lineData.nombrePoteaux}
                onChange={handleInputChange}
                placeholder="0"
                keyfilter="int"
                className="line-edit-form-input"
              />
            </div>
            <div className="line-edit-form-group">
              <label className="line-edit-form-label">
                <i className="pi pi-building" /> Site *
              </label>
              <Dropdown
                name="site"
                value={lineData.site}
                options={siteOptions}
                onChange={(e) => handleInputChange({ target: { name: 'site', value: e.value } })}
                placeholder={loadingSites ? 'Chargement...' : 'Sélectionnez le site'}
                className="line-edit-form-dropdown"
                required
                disabled={loadingSites}
              />
            </div>
            <div className="line-edit-form-group line-edit-map-section">
              <label className="line-edit-form-label">
                <i className="pi pi-map" /> Carte
              </label>
              <div className="line-edit-map-search">
                <InputText
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Rechercher une adresse en Tunisie"
                  className="line-edit-form-input"
                  onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
                />
                <button className="line-edit-btn line-edit-btn-search" onClick={handleSearch}>
                  <i className="pi pi-search" /> Rechercher
                </button>
              </div>
              <div className="line-edit-map-container">
                <MapContainer
                  center={
                    lineData.startPoint?.lat && lineData.endPoint?.lat
                      ? [(lineData.startPoint.lat + lineData.endPoint.lat) / 2, (lineData.startPoint.lng + lineData.endPoint.lng) / 2]
                      : [36.8065, 10.1815]
                  }
                  zoom={8}
                  style={{ height: '400px', width: '100%' }}
                  ref={mapRef}
                >
                  <TileLayer
                    url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                    attribution='© <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                  />
                  <MapClickHandler />
                  {startMarker && <Marker position={startMarker} icon={lineIcon} />}
                  {endMarker && <Marker position={endMarker} icon={lineIcon} />}
                </MapContainer>
              </div>
              <div className="line-edit-map-controls">
                <button
                  className="line-edit-btn line-edit-btn-select"
                  onClick={() => setSelectingPoint('startPoint')}
                  disabled={selectingPoint === 'startPoint'}
                >
                  <i className="pi pi-map-marker" /> Sélectionner le point de départ
                </button>
                <button
                  className="line-edit-btn line-edit-btn-select"
                  onClick={() => setSelectingPoint('endPoint')}
                  disabled={selectingPoint === 'endPoint'}
                >
                  <i className="pi pi-map-marker" /> Sélectionner le point d'arrivée
                </button>
                <button className="line-edit-btn line-edit-btn-reset" onClick={handleResetMarkers}>
                  <i className="pi pi-refresh" /> Réinitialiser les marqueurs
                </button>
              </div>
              <div className="line-edit-coords-grid">
                <div className="line-edit-form-group">
                  <label className="line-edit-form-label">
                    <i className="pi pi-map-marker" /> Point de départ
                  </label>
                  <InputText
                    name="startPoint"
                    value={lineData.startPoint.name}
                    onChange={handleInputChange}
                    placeholder="Point de départ A"
                    className="line-edit-form-input"
                  />
                  <InputText
                    value={
                      lineData.startPoint.lat
                        ? `Lat: ${lineData.startPoint.lat.toFixed(6)}, Lng: ${lineData.startPoint.lng.toFixed(6)}`
                        : 'Non défini'
                    }
                    readOnly
                    className="line-edit-form-input line-edit-coords-input"
                  />
                </div>
                <div className="line-edit-form-group">
                  <label className="line-edit-form-label">
                    <i className="pi pi-map-marker" /> Point d'arrivée
                  </label>
                  <InputText
                    name="endPoint"
                    value={lineData.endPoint.name}
                    onChange={handleInputChange}
                    placeholder="Point d'arrivée B"
                    className="line-edit-form-input"
                  />
                  <InputText
                    value={
                      lineData.endPoint.lat
                        ? `Lat: ${lineData.endPoint.lat.toFixed(6)}, Lng: ${lineData.endPoint.lng.toFixed(6)}`
                        : 'Non défini'
                    }
                    readOnly
                    className="line-edit-form-input line-edit-coords-input"
                  />
                </div>
              </div>
            </div>
            <div className="line-edit-form-group">
              <label className="line-edit-form-label">
                <i className="pi pi-file" /> Description
              </label>
              <InputText
                name="description"
                value={lineData.description}
                onChange={handleInputChange}
                placeholder="Description de la ligne"
                className="line-edit-form-input"
              />
            </div>
          </div>
        </div>
        <div className="line-edit-modal-footer">
          <button className="line-edit-cancel-btn" onClick={handleClose}>
            Annuler
          </button>
          <button className="line-edit-submit-btn" onClick={handleUpdate}>
            Mettre à jour
          </button>
        </div>
      </div>
    </div>
  );
};

LineEdit.propTypes = {
  visible: PropTypes.bool.isRequired,
  onHide: PropTypes.func.isRequired,
  line: PropTypes.shape({
    _id: PropTypes.string,
    nom_L: PropTypes.string,
    code: PropTypes.string,
    type: PropTypes.string,
    lengthKm: PropTypes.oneOfType([PropTypes.number, PropTypes.string]),
    type_conducteur: PropTypes.string,
    site: PropTypes.oneOfType([PropTypes.string, PropTypes.object]),
    status: PropTypes.string,
    description: PropTypes.string,
    startPoint: PropTypes.object,
    endPoint: PropTypes.object,
    nombrePoteaux: PropTypes.number,
  }).isRequired,
  onSave: PropTypes.func,
};

LineEdit.defaultProps = {
  onSave: () => {},
};

export default LineEdit;