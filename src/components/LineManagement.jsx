import React, { useState, useRef, useEffect } from 'react';
import { InputText } from 'primereact/inputtext';
import { Dropdown } from 'primereact/dropdown';
import { MapContainer, TileLayer, Marker, Popup, useMapEvents } from 'react-leaflet';
import L from 'leaflet';
import axios from 'axios';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import './LineManagement.css';
import 'leaflet/dist/leaflet.css';

// Fix Leaflet default icon for markers
const lineIcon = new L.Icon({
  iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [0, -41],
  shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
  shadowSize: [41, 41],
});

// Generate unique code
const generateCode = () => `LINE${Date.now().toString(16).toUpperCase()}`;

const LineManagement = ({ visible, onHide, onSave }) => {
  const mapRef = useRef(null);
  const [lineData, setLineData] = useState({
    name: '',
    voltage: '',
    length: '',
    conductorType: '',
    description: '',
    site: '',
    startPoint: { name: '', lat: null, lng: null },
    endPoint: { name: '', lat: null, lng: null },
    status: 'Active',
    code: '',
  });
  const [selectingPoint, setSelectingPoint] = useState(null);
  const [startMarker, setStartMarker] = useState(null);
  const [endMarker, setEndMarker] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [siteOptions, setSiteOptions] = useState([]);

  // Fetch sites and generate code
  useEffect(() => {
    const fetchSites = async () => {
      try {
        const response = await axios.get('http://localhost:5000/api/site/allsite');
        setSiteOptions(
          response.data.map((site) => ({
            label: site.nom,
            value: site._id,
            icon: 'ri-building-4-line',
          }))
        );
      } catch (error) {
        toast.error('Impossible de charger les sites', {
          position: 'top-right',
          autoClose: 3000,
          hideProgressBar: false,
          closeOnClick: true,
          pauseOnHover: true,
          draggable: true,
        });
        console.error('Fetch sites error:', error);
      }
    };

    const fetchGeneratedCode = async () => {
      try {
        const response = await axios.get('http://localhost:5000/api/ligne/generate-code');
        setLineData((prev) => ({ ...prev, code: response.data.code }));
      } catch (error) {
        toast.error('Impossible de générer le code', {
          position: 'top-right',
          autoClose: 3000,
          hideProgressBar: false,
          closeOnClick: true,
          pauseOnHover: true,
          draggable: true,
        });
        console.error('Fetch code error:', error);
      }
    };

    if (visible) {
      fetchSites();
      fetchGeneratedCode();
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'auto';
    }
    return () => {
      document.body.style.overflow = 'auto';
    };
  }, [visible]);

  // Invalidate map size when modal becomes visible
  useEffect(() => {
    if (visible && mapRef.current) {
      setTimeout(() => {
        mapRef.current.invalidateSize();
      }, 100);
    }
  }, [visible]);

  const voltageOptions = [
    { label: 'Basse Tension (BT)', value: 'Basse Tension', icon: 'ri-flashlight-line' },
    { label: 'Moyenne Tension (MT)', value: 'Moyenne Tension', icon: 'ri-flashlight-line' },
    { label: 'Haute Tension (HT)', value: 'Haute Tension', icon: 'ri-flashlight-line' },
    { label: 'Très Haute Tension (THT)', value: 'Très Haute Tension', icon: 'ri-flashlight-line' },
  ];

  const conductorOptions = [
    { label: 'Cuivre', value: 'copper', icon: 'ri-copper-coin-line' },
    { label: 'Aluminium', value: 'aluminum', icon: 'ri-copper-coin-line' },
    { label: 'ACSR', value: 'acsr', icon: 'ri-copper-coin-line' },
    { label: 'AAAC', value: 'aaac', icon: 'ri-copper-coin-line' },
  ];

  const statusOptions = [
    { label: 'Active', value: 'Active', icon: 'ri-checkbox-circle-line' },
    { label: 'En maintenance', value: 'Maintenance', icon: 'ri-tools-line' },
    { label: 'Hors service', value: 'Inactive', icon: 'ri-close-circle-line' },
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

  const handleSave = async () => {
    if (!lineData.name || !lineData.voltage || !lineData.site || !lineData.code) {
      toast.error('Les champs Nom, Tension, Site et Code sont obligatoires', {
        position: 'top-right',
        autoClose: 3000,
        hideProgressBar: false,
        closeOnClick: true,
        pauseOnHover: true,
        draggable: true,
      });
      return;
    }
    if (!lineData.startPoint.lat || !lineData.endPoint.lat) {
      toast.error("Veuillez sélectionner les localisations pour le point de départ et d'arrêt", {
        position: 'top-right',
        autoClose: 3000,
        hideProgressBar: false,
        closeOnClick: true,
        pauseOnHover: true,
        draggable: true,
      });
      return;
    }

    try {
      const payload = {
        name: lineData.name,
        code: lineData.code,
        voltage: lineData.voltage,
        length: parseFloat(lineData.length) || null,
        conductorType: lineData.conductorType,
        site: lineData.site,
        status: lineData.status,
        description: lineData.description,
        startPoint: {
          name: lineData.startPoint.name || 'Point de départ',
          lat: lineData.startPoint.lat,
          lng: lineData.startPoint.lng,
        },
        endPoint: {
          name: lineData.endPoint.name || 'Point d\'arrêt',
          lat: lineData.endPoint.lat,
          lng: lineData.endPoint.lng,
        },
      };
      const response = await axios.post('http://localhost:5000/api/ligne', payload);
      toast.success('Ligne enregistrée avec succès', {
        position: 'top-right',
        autoClose: 3000,
        hideProgressBar: false,
        closeOnClick: true,
        pauseOnHover: true,
        draggable: true,
      });
      onSave(response.data);
      setLineData({
        name: '',
        code: '',
        voltage: '',
        length: '',
        conductorType: '',
        description: '',
        site: '',
        status: 'Active',
        startPoint: { name: '', lat: null, lng: null },
        endPoint: { name: '', lat: null, lng: null },
      });
      setStartMarker(null);
      setEndMarker(null);
      setSearchQuery('');
      setTimeout(() => onHide(), 3000); // Close modal after toast duration
    } catch (error) {
      const errorMessage = error.response?.data?.error || 'Erreur lors de l\'enregistrement';
      console.error('Save error:', errorMessage);
      if (errorMessage.includes('E11000 duplicate key')) {
        toast.error('Le code existe déjà. Veuillez réessayer.', {
          position: 'top-right',
          autoClose: 3000,
          hideProgressBar: false,
          closeOnClick: true,
          pauseOnHover: true,
          draggable: true,
        });
        try {
          const response = await axios.get('http://localhost:5000/api/ligne/generate-code');
          setLineData((prev) => ({ ...prev, code: response.data.code }));
        } catch (err) {
          toast.error('Impossible de générer un nouveau code', {
            position: 'top-right',
            autoClose: 3000,
            hideProgressBar: false,
            closeOnClick: true,
            pauseOnHover: true,
            draggable: true,
          });
        }
      } else {
        toast.error(errorMessage, {
          position: 'top-right',
          autoClose: 3000,
          hideProgressBar: false,
          closeOnClick: true,
          pauseOnHover: true,
          draggable: true,
        });
      }
    }
  };

  const MapClickHandler = () => {
    useMapEvents({
      click(e) {
        if (selectingPoint) {
          const { lat, lng } = e.latlng;
          console.log(`Map clicked for ${selectingPoint}:`, { lat, lng });
          setLineData((prev) => {
            const newState = {
              ...prev,
              [selectingPoint]: {
                ...prev[selectingPoint],
                lat,
                lng,
                name: prev[selectingPoint].name || (selectingPoint === 'startPoint' ? 'Point de départ' : 'Point d\'arrêt'),
              },
            };
            console.log('Updated lineData:', newState);
            return newState;
          });
          const markerPos = [lat, lng];
          if (selectingPoint === 'startPoint') {
            setStartMarker(markerPos);
            console.log('Start marker set:', markerPos);
          } else if (selectingPoint === 'endPoint') {
            setEndMarker(markerPos);
            console.log('End marker set:', markerPos);
          }
          setSelectingPoint(null);
          toast.success(`Point ${selectingPoint === 'startPoint' ? 'de départ' : 'd\'arrêt'} sélectionné`, {
            position: 'top-right',
            autoClose: 3000,
            hideProgressBar: false,
            closeOnClick: true,
            pauseOnHover: true,
            draggable: true,
          });
        }
      },
    });
    return null;
  };

  const handleSearch = async () => {
    if (!searchQuery.trim()) {
      toast.warn('Veuillez entrer une adresse à rechercher', {
        position: 'top-right',
        autoClose: 3000,
        hideProgressBar: false,
        closeOnClick: true,
        pauseOnHover: true,
        draggable: true,
      });
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
        toast.success('Localisation trouvée', {
          position: 'top-right',
          autoClose: 3000,
          hideProgressBar: false,
          closeOnClick: true,
          pauseOnHover: true,
          draggable: true,
        });
      } else {
        toast.error('Aucune localisation trouvée pour cette adresse en Tunisie', {
          position: 'top-right',
          autoClose: 3000,
          hideProgressBar: false,
          closeOnClick: true,
          pauseOnHover: true,
          draggable: true,
        });
      }
    } catch (error) {
      toast.error('Erreur lors de la recherche. Vérifiez votre connexion.', {
        position: 'top-right',
        autoClose: 3000,
        hideProgressBar: false,
        closeOnClick: true,
        pauseOnHover: true,
        draggable: true,
      });
      console.error('Search error:', error);
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
    toast.info('Marqueurs et coordonnées réinitialisés', {
      position: 'top-right',
      autoClose: 3000,
      hideProgressBar: false,
      closeOnClick: true,
      pauseOnHover: true,
      draggable: true,
    });
  };

  const dropdownItemTemplate = (option) => (
    <div className="ligne-dropdown-item">
      <i className={`${option.icon} ligne-dropdown-icon`} />
      <span>{option.label}</span>
    </div>
  );

  const dropdownValueTemplate = (option, props) => {
    if (option) {
      return (
        <div className="ligne-dropdown-item">
          <i className={`${option.icon} ligne-dropdown-icon`} />
          <span>{option.label}</span>
        </div>
      );
    }
    return <span>{props.placeholder}</span>;
  };

  return (
    <div className="ligne-modal-overlay" style={{ display: visible ? 'flex' : 'none' }}>
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
      <div className="ligne-modal-container">
        <div className="ligne-modal-header">
          <div className="ligne-header-content">
            <i className="ri-bolt-line ligne-header-icon" />
            <h2>Gestion des Lignes Électriques</h2>
          </div>
          <button className="ligne-close-btn" onClick={onHide}>
            <i className="ri-close-line" />
          </button>
        </div>

        <div className="ligne-modal-body">
          <div className="ligne-form-grid">
            <div className="ligne-form-group">
              <label className="ligne-form-label">
                <i className="ri-align-left" /> Nom de la ligne *
              </label>
              <span className="p-input-icon-left">
                <i className="ri-align-left" />
                <InputText
                  name="name"
                  value={lineData.name}
                  onChange={handleInputChange}
                  placeholder="Ligne principale A"
                  className="ligne-form-input"
                  required
                />
              </span>
            </div>

            <div className="ligne-form-group">
              <label className="ligne-form-label">
                <i className="ri-barcode-line" /> Code *
              </label>
              <span className="p-input-icon-left">
                <i className="ri-barcode-line" />
                <InputText
                  name="code"
                  value={lineData.code}
                  onChange={handleInputChange}
                  placeholder="LINE1234567890"
                  className="ligne-form-input"
                  readOnly
                />
              </span>
            </div>

            <div className="ligne-form-group">
              <label className="ligne-form-label">
                <i className="ri-flashlight-line" /> Tension *
              </label>
              <Dropdown
                name="voltage"
                value={lineData.voltage}
                options={voltageOptions}
                onChange={handleInputChange}
                placeholder="Sélectionnez la tension"
                className="ligne-form-dropdown"
                optionLabel="label"
                itemTemplate={dropdownItemTemplate}
                valueTemplate={dropdownValueTemplate}
                required
              />
            </div>

            <div className="ligne-form-group">
              <label className="ligne-form-label">
                <i className="ri-building-4-line" /> Site associé *
              </label>
              <Dropdown
                name="site"
                value={lineData.site}
                options={siteOptions}
                onChange={handleInputChange}
                placeholder="Sélectionnez le site"
                className="ligne-form-dropdown"
                optionLabel="label"
                itemTemplate={dropdownItemTemplate}
                valueTemplate={dropdownValueTemplate}
                required
              />
            </div>

            <div className="ligne-form-group">
              <label className="ligne-form-label">
                <i className="ri-arrows-h" /> Longueur (km)
              </label>
              <span className="p-input-icon-left">
                <i className="ri-arrows-h" />
                <InputText
                  name="length"
                  value={lineData.length}
                  onChange={handleInputChange}
                  placeholder="10.5"
                  className="ligne-form-input"
                  keyfilter="num"
                />
              </span>
            </div>

            <div className="ligne-form-group">
              <label className="ligne-form-label">
                <i className="ri-copper-coin-line" /> Type de conducteur
              </label>
              <Dropdown
                name="conductorType"
                value={lineData.conductorType}
                options={conductorOptions}
                onChange={handleInputChange}
                placeholder="Sélectionnez le type"
                className="ligne-form-dropdown"
                optionLabel="label"
                itemTemplate={dropdownItemTemplate}
                valueTemplate={dropdownValueTemplate}
              />
            </div>

            <div className="ligne-form-group">
              <label className="ligne-form-label">
                <i className="ri-file-text-line" /> Description
              </label>
              <span className="p-input-icon-left">
                <i className="ri-file-text-line" />
                <InputText
                  name="description"
                  value={lineData.description}
                  onChange={handleInputChange}
                  placeholder="Description de la ligne"
                  className="ligne-form-input"
                />
              </span>
            </div>

            <div className="ligne-form-group">
              <label className="ligne-form-label">
                <i className="ri-checkbox-circle-line" /> Statut
              </label>
              <Dropdown
                name="status"
                value={lineData.status}
                onChange={handleInputChange}
                options={statusOptions}
                placeholder="Sélectionnez le statut"
                className="ligne-form-dropdown"
                optionLabel="label"
                itemTemplate={dropdownItemTemplate}
                valueTemplate={dropdownValueTemplate}
              />
            </div>

            <div className="ligne-form-group ligne-map-section">
              <label className="ligne-form-label">
                <i className="ri-map-pin-line" /> Localisation
              </label>
              <div className="ligne-map-search">
                <span className="p-input-icon-left">
                  <i className="ri-search-line" />
                  <InputText
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Rechercher une adresse en Tunisie"
                    className="ligne-form-input"
                    onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
                  />
                </span>
                <button className="ligne-btn ligne-btn-search" onClick={handleSearch}>
                  <i className="pi pi-search" /> Rechercher
                </button>
              </div>
              <div className="ligne-map-container">
                <MapContainer
                  center={[36.8065, 10.1815]} // Center on Tunis, Tunisia
                  zoom={8} // Zoom level for country view
                  style={{ height: '300px', width: '100%' }}
                  ref={mapRef}
                >
                  <TileLayer
                    url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                    attribution='© <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                  />
                  <MapClickHandler />
                  {startMarker && (
                    <Marker position={startMarker} icon={lineIcon}>
                      <Popup>Point de départ</Popup>
                    </Marker>
                  )}
                  {endMarker && (
                    <Marker position={endMarker} icon={lineIcon}>
                      <Popup>Point d'arrêt</Popup>
                    </Marker>
                  )}
                </MapContainer>
              </div>
              <div className="ligne-map-controls">
                <button
                  className="ligne-btn ligne-btn-select"
                  onClick={() => setSelectingPoint('startPoint')}
                  disabled={selectingPoint === 'startPoint'}
                >
                  <i className="pi pi-map-marker" /> Sélectionner le point de départ
                </button>
                <button
                  className="ligne-btn ligne-btn-select"
                  onClick={() => setSelectingPoint('endPoint')}
                  disabled={selectingPoint === 'endPoint'}
                >
                  <i className="pi pi-map-marker" /> Sélectionner le point d'arrêt
                </button>
                <button className="ligne-btn ligne-btn-reset" onClick={handleResetMarkers}>
                  <i className="pi pi-refresh" /> Réinitialiser les marqueurs
                </button>
              </div>
              <div className="ligne-coords-grid">
                <div className="ligne-form-group">
                  <label className="ligne-form-label">Point de départ</label>
                  <span className="p-input-icon-left">
                    <i className="ri-map-pin-line" />
                    <InputText
                      name="startPoint"
                      value={lineData.startPoint.name}
                      onChange={handleInputChange}
                      placeholder="Poste source A"
                      className="ligne-form-input"
                    />
                  </span>
                  <span className="p-input-icon-left">
                    <i className="ri-map-pin-line" />
                    <InputText
                      value={
                        lineData.startPoint.lat && lineData.startPoint.lng
                          ? `Lat: ${lineData.startPoint.lat.toFixed(6)}, Lng: ${lineData.startPoint.lng.toFixed(6)}`
                          : 'Non défini'
                      }
                      readOnly
                      className="ligne-form-input ligne-coords-input"
                    />
                  </span>
                </div>
                <div className="ligne-form-group">
                  <label className="ligne-form-label">Point d'arrêt</label>
                  <span className="p-input-icon-left">
                    <i className="ri-map-pin-line" />
                    <InputText
                      name="endPoint"
                      value={lineData.endPoint.name}
                      onChange={handleInputChange}
                      placeholder="Poste de distribution B"
                      className="ligne-form-input"
                    />
                  </span>
                  <span className="p-input-icon-left">
                    <i className="ri-map-pin-line" />
                    <InputText
                      value={
                        lineData.endPoint.lat && lineData.endPoint.lng
                          ? `Lat: ${lineData.endPoint.lat.toFixed(6)}, Lng: ${lineData.endPoint.lng.toFixed(6)}`
                          : 'Non défini'
                      }
                      readOnly
                      className="ligne-form-input ligne-coords-input"
                    />
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="ligne-modal-footer">
          <button className="ligne-cancel-btn" onClick={onHide}>
            Annuler
          </button>
          <button className="ligne-submit-btn" onClick={handleSave}>
            Enregistrer
          </button>
        </div>
      </div>
    </div>
  );
};

export default LineManagement;