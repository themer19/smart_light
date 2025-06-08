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

const LineEdit = ({ visible, onClose, line, onSave }) => {
  const mapRef = useRef(null);
  const [lineData, setLineData] = useState({
    nom_Ligne: '',
    code: '',
    type: 'Basse Tension',
    longueurKm: '',
    typeConducteur: '',
    siteId: '',
    statut: 'Active',
    description: '',
    posteSource: { nom: '', lat: null, lng: null },
    postePointe: { nom: '', lat: null, lng: null },
    nombrePoteaux: null,
  });
  const [selectingPoint, setSelectingPoint] = useState(null);
  const [sourceMarker, setSourceMarker] = useState(null);
  const [pointeMarker, setPointeMarker] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [siteOptions, setSiteOptions] = useState([]);
  const [loadingSites, setLoadingSites] = useState(false);

  const showToast = (severity, summary, detail) => {
    const toastOptions = { autoClose: 3000 };
    if (severity === 'success') {
      toast.success(detail, toastOptions);
    } else if (severity === 'error') {
      toast.error(`🚨 ${detail}`, toastOptions);
    } else if (severity === 'warn') {
      toast.warn(detail, toastOptions);
    } else {
      console.warn('Invalid toast severity:', severity);
      toast.info(detail, toastOptions);
    }
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
      showToast('warn', 'Tension non reconnue', `La tension "${voltage}" n'est pas valide. Utilisation de Basse Tension par défaut.`);
    }
    return mappedValue;
  };

  const validateConductorType = (conductorType) => {
    const validTypes = ['Cuivre', 'Aluminium', 'ACSR', 'AAAC'];
    const normalizedType = conductorType?.trim();
    return normalizedType || '';
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
        if (visible && !lineData.siteId && sites.length > 0) {
          setLineData((prev) => ({ ...prev, siteId: sites[0].value }));
        }
        if (sites.length === 0) {
          showToast('warn', 'Aucun site', 'Aucun site disponible. Veuillez ajouter un site.');
        }
      } catch (error) {
        showToast('error', 'Erreur de chargement', 'Impossible de charger les sites.');
        console.error('Erreur fetchSites:', error);
      } finally {
        setLoadingSites(false);
      }
    };

    if (visible && line) {
      fetchSites();
      setLineData({
        nom_Ligne: line.nom_L || '',
        code: line.code || '',
        type: mapVoltageToOption(line.type) || 'Basse Tension',
        longueurKm: line.lengthKm || '',
        typeConducteur: validateConductorType(line.type_conducteur),
        siteId: line.site?._id || (typeof line.site === 'string' ? line.site : ''),
        statut: line.status || 'Active',
        description: line.description || '',
        posteSource: line.startPoint || { nom: '', lat: null, lng: null },
        postePointe: line.endPoint || { nom: '', lat: null, lng: null },
        nombrePoteaux: line.nombrePoteaux || 0,
      });
      setSourceMarker(line.startPoint?.lat ? [line.startPoint.lat, line.startPoint.lng] : null);
      setPointeMarker(line.endPoint?.lat ? [line.endPoint.lat, line.endPoint.lng] : null);
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'auto';
    }

    return () => {
      document.body.style.overflow = 'auto';
    };
  }, [visible, line]);

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
    if (name === 'posteSource' || name === 'postePointe') {
      setLineData((prev) => ({
        ...prev,
        [name]: { ...prev[name], nom: value },
      }));
    } else {
      setLineData((prev) => ({ ...prev, [name]: value }));
    }
  };

  const handleUpdate = async () => {
    if (!line?._id || !lineData.nom_Ligne || !lineData.type || !lineData.siteId) {
      showToast('error', 'Erreur', 'Données requises manquantes');
      return;
    }

    try {
      const payload = {
        nom_L: lineData.nom_Ligne,
        code: lineData.code,
        type: lineData.type,
        lengthKm: lineData.longueurKm,
        type_conducteur: lineData.typeConducteur,
        site: lineData.siteId,
        status: lineData.statut,
        description: lineData.description,
        startPoint: lineData.posteSource,
        endPoint: lineData.postePointe,
        nombrePoteaux: lineData.nombrePoteaux,
      };
      const { data } = await axios.put(`http://localhost:5000/api/ligne/${line._id}`, payload);
      showToast('success', 'Succès', 'Ligne mise à jour');
      if (typeof onSave === 'function') {
        await onSave({ ...data, _id: line._id });
      }
      setTimeout(onClose, 600);
    } catch (error) {
      console.error('Erreur détaillée:', error);
      showToast('error', 'Erreur', error.response?.data?.message || 'Échec de la mise à jour');
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
              nom: prev[selectingPoint].nom || (selectingPoint === 'posteSource' ? 'Poste Source' : 'Poste Pointe'),
            },
          }));
          if (selectingPoint === 'posteSource') {
            setSourceMarker([lat, lng]);
          } else if (selectingPoint === 'postePointe') {
            setPointeMarker([lat, lng]);
          }
          setSelectingPoint(null);
        }
      },
    });
    return null;
  };

  const handleSearch = async () => {
    if (!searchQuery) {
      showToast('warn', 'Recherche vide', 'Veuillez entrer une adresse à rechercher.');
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
          posteSource: { ...prev.posteSource, lat: latLng[0], lng: latLng[1], nom: searchQuery },
        }));
        setSourceMarker(latLng);
        showToast('success', 'Localisation trouvée', 'L’adresse a été localisée avec succès.');
      } else {
        showToast('error', 'Aucune localisation', 'Aucune adresse trouvée pour cette recherche en Tunisie.');
      }
    } catch (error) {
      showToast('error', 'Erreur de recherche', 'Erreur lors de la recherche d’adresse.');
      console.error('Erreur handleSearch:', error);
    }
  };

  const handleResetMarkers = () => {
    setLineData((prev) => ({
      ...prev,
      posteSource: { nom: '', lat: null, lng: null },
      postePointe: { nom: '', lat: null, lng: null },
    }));
    setSourceMarker(null);
    setPointeMarker(null);
    setSearchQuery('');
    showToast('info', 'Réinitialisation', 'Marqueurs et coordonnées réinitialisés');
  };

  const handleOverlayClick = (e) => {
    if (e.target === e.currentTarget) {
      onClose();
    }
  };

  const handleCloseClick = (e) => {
    e.stopPropagation();
    onClose();
  };

  const handleCancelClick = (e) => {
    e.stopPropagation();
    onClose();
  };

  if (!visible) return null;

  return (
    <div className={`line-edit-modal-overlay ${visible ? 'visible' : ''}`} onClick={handleOverlayClick}>
      <div className="line-edit-modal-container">
        <div className="line-edit-modal-header">
          <div className="line-edit-header-content">
            <i className="pi pi-bolt line-edit-header-icon" />
            <h2>Modifier la Ligne Électrique</h2>
          </div>
          <button className="line-edit-close-btn" onClick={handleCloseClick}>
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
                name="nom_Ligne"
                value={lineData.nom_Ligne}
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
                name="longueurKm"
                value={lineData.longueurKm}
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
                name="typeConducteur"
                value={lineData.typeConducteur}
                options={conductorOptions}
                onChange={(e) => handleInputChange({ target: { name: 'typeConducteur', value: e.value } })}
                placeholder="Sélectionnez le type"
                className="line-edit-form-dropdown"
              />
            </div>
            <div className="line-edit-form-group">
              <label className="line-edit-form-label">
                <i className="pi pi-check-circle" /> Statut
              </label>
              <Dropdown
                name="statut"
                value={lineData.statut}
                options={statusOptions}
                onChange={(e) => handleInputChange({ target: { name: 'statut', value: e.value } })}
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
                name="siteId"
                value={lineData.siteId}
                options={siteOptions}
                onChange={(e) => handleInputChange({ target: { name: 'siteId', value: e.value } })}
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
                    lineData.posteSource?.lat && lineData.postePointe?.lat
                      ? [(lineData.posteSource.lat + lineData.postePointe.lat) / 2, (lineData.posteSource.lng + lineData.postePointe.lng) / 2]
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
                  {sourceMarker && <Marker position={sourceMarker} icon={lineIcon} />}
                  {pointeMarker && <Marker position={pointeMarker} icon={lineIcon} />}
                </MapContainer>
              </div>
              <div className="line-edit-map-controls">
                <button
                  className="line-edit-btn line-edit-btn-select"
                  onClick={() => setSelectingPoint('posteSource')}
                  disabled={selectingPoint === 'posteSource'}
                >
                  <i className="pi pi-map-marker" /> Sélectionner le poste source
                </button>
                <button
                  className="line-edit-btn line-edit-btn-select"
                  onClick={() => setSelectingPoint('postePointe')}
                  disabled={selectingPoint === 'postePointe'}
                >
                  <i className="pi pi-map-marker" /> Sélectionner le poste pointe
                </button>
                <button className="line-edit-btn line-edit-btn-reset" onClick={handleResetMarkers}>
                  <i className="pi pi-refresh" /> Réinitialiser les marqueurs
                </button>
              </div>
              <div className="line-edit-coords-grid">
                <div className="line-edit-form-group">
                  <label className="line-edit-form-label">
                    <i className="pi pi-map-marker" /> Poste Source
                  </label>
                  <InputText
                    name="posteSource"
                    value={lineData.posteSource.nom}
                    onChange={handleInputChange}
                    placeholder="Poste source A"
                    className="line-edit-form-input"
                  />
                  <InputText
                    value={
                      lineData.posteSource.lat
                        ? `Lat: ${lineData.posteSource.lat.toFixed(6)}, Lng: ${lineData.posteSource.lng.toFixed(6)}`
                        : 'Non défini'
                    }
                    readOnly
                    className="line-edit-form-input line-edit-coords-input"
                  />
                </div>
                <div className="line-edit-form-group">
                  <label className="line-edit-form-label">
                    <i className="pi pi-map-marker" /> Poste de distribution
                  </label>
                  <InputText
                    name="postePointe"
                    value={lineData.postePointe.nom}
                    onChange={handleInputChange}
                    placeholder="Poste de distribution B"
                    className="line-edit-form-input"
                  />
                  <InputText
                    value={
                      lineData.postePointe.lat
                        ? `Lat: ${lineData.postePointe.lat.toFixed(6)}, Lng: ${lineData.postePointe.lng.toFixed(6)}`
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
          <button className="line-edit-cancel-btn" onClick={handleCancelClick}>
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
  onClose: PropTypes.func.isRequired,
  line: PropTypes.shape({
    _id: PropTypes.string,
    nom_L: PropTypes.string,
    code: PropTypes.string,
    type: PropTypes.string,
    lengthKm: PropTypes.number,
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