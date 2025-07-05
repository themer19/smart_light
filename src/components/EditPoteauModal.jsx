import React, { useState, useEffect, useRef } from 'react';
import { InputText } from 'primereact/inputtext';
import { Dropdown } from 'primereact/dropdown';
import { Button } from 'primereact/button';
import { Slider } from 'primereact/slider';
import { MapContainer, TileLayer, Marker, Popup, useMapEvents } from 'react-leaflet';
import L from 'leaflet';
import axios from 'axios';
import { toast } from 'react-toastify';
import './AddPoteau.css';
import 'leaflet/dist/leaflet.css';

const poteauIcon = new L.Icon({
  iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-yellow.png',
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [0, -41],
  shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
  shadowSize: [41, 41],
});

const lineIcon = new L.Icon({
  iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
  iconSize: [30, 48],
  iconAnchor: [15, 48],
  popupAnchor: [0, -48],
  shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
  shadowSize: [41, 41],
});

const existingPoteauIcon = new L.Icon({
  iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [0, -41],
  shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
  shadowSize: [41, 41],
});

const EditPoteauModal = ({ onClose, onSave, initialData }) => {
  const mapRef = useRef(null);
  const [poteauData, setPoteauData] = useState({
    _id: '',
    nom: '',
    code: '',
    site: '',
    ligne: '',
    statut: 'Actif',
    luminosite: 0,
    localisation: { lat: 36.8065, lng: 10.1815 }, // Default to Tunisia
  });
  const [siteOptions, setSiteOptions] = useState([]);
  const [ligneOptions, setLigneOptions] = useState([]);
  const [ligneMarkers, setLigneMarkers] = useState([]);
  const [existingPoteaux, setExistingPoteaux] = useState([]);
  const [selectingLocation, setSelectingLocation] = useState(false);

  useEffect(() => {
    console.log('initialData received:', JSON.stringify(initialData, null, 2));
    if (initialData) {
      setPoteauData({
        _id: initialData._id || '',
        nom: initialData.nom || '',
        code: initialData.code || '',
        site: initialData.site?._id || initialData.site || '',
        ligne: initialData.ligne?._id || initialData.ligne || '',
        statut: initialData.statut || 'Actif',
        luminosite: initialData.luminosite || initialData.niveauLumiere || 0,
        localisation: initialData.localisation || { lat: 36.8065, lng: 10.1815 },
      });
    }
  }, [initialData]);

  useEffect(() => {
    const fetchSites = async () => {
      try {
        const response = await axios.get('http://localhost:5000/api/site/allsite');
        const sites = response.data.map((site) => ({
          label: site.nom,
          value: site._id,
          icon: 'ri-building-4-line',
        }));
        setSiteOptions(sites);
        console.log('Sites fetched:', sites);
      } catch (error) {
        toast.error('Erreur lors du chargement des sites.');
        console.error('Error fetching sites:', error.response?.data || error.message);
      }
    };

    const fetchLignes = async () => {
      try {
        const response = await axios.get('http://localhost:5000/api/ligne');
        const lignes = response.data.map((ligne) => ({
          label: ligne.nom_L,
          value: ligne._id,
          startPoint: ligne.startPoint,
          endPoint: ligne.endPoint,
          icon: 'ri-git-branch-line',
        }));
        setLigneOptions(lignes);
        console.log('Lignes fetched:', lignes);
      } catch (error) {
        toast.error('Erreur lors du chargement des lignes.');
        console.error('Error fetching lignes:', error.response?.data || error.message);
      }
    };

    fetchSites();
    fetchLignes();
  }, []);

  useEffect(() => {
    if (poteauData.ligne) {
      const selectedLigne = ligneOptions.find((option) => option.value === poteauData.ligne);
      if (selectedLigne && selectedLigne.startPoint && selectedLigne.endPoint) {
        const markers = [];
        if (selectedLigne.startPoint.lat && selectedLigne.startPoint.lng) {
          markers.push({
            position: [selectedLigne.startPoint.lat, selectedLigne.startPoint.lng],
            label: selectedLigne.startPoint.name || 'Point de départ',
          });
        }
        if (selectedLigne.endPoint.lat && selectedLigne.endPoint.lng) {
          markers.push({
            position: [selectedLigne.endPoint.lat, selectedLigne.endPoint.lng],
            label: selectedLigne.endPoint.name || 'Point d’arrivée',
          });
        }
        setLigneMarkers(markers);

        const fetchPoteaux = async () => {
          try {
            const response = await axios.get('http://localhost:5000/api/poteaux/map', {
              params: { ligneId: poteauData.ligne },
            });
            setExistingPoteaux(
              response.data.data.filter((poteau) => poteau.id !== initialData?._id)
            );
            console.log('Existing poteaux fetched:', response.data.data);
          } catch (error) {
            console.error('Error fetching existing poteaux:', error.response?.data || error.message);
          }
        };
        fetchPoteaux();
      } else {
        setLigneMarkers([]);
        setExistingPoteaux([]);
      }
    } else {
      setLigneMarkers([]);
      setExistingPoteaux([]);
    }
  }, [poteauData.ligne, ligneOptions, initialData]);

  useEffect(() => {
    if (mapRef.current && poteauData.localisation.lat && poteauData.localisation.lng) {
      mapRef.current.setView([poteauData.localisation.lat, poteauData.localisation.lng], 13);
    }
  }, [poteauData.localisation]);

  const statutOptions = [
    { label: 'Actif', value: 'Actif', icon: 'ri-checkbox-circle-line' },
    { label: 'Inactif', value: 'Inactif', icon: 'ri-close-circle-line' },
  ];

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setPoteauData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSliderChange = (e) => {
    setPoteauData((prev) => ({ ...prev, luminosite: e.value }));
  };

  const clearLocation = () => {
    setPoteauData((prev) => ({
      ...prev,
      localisation: { lat: 36.8065, lng: 10.1815 },
    }));
    toast.info('Emplacement réinitialisé.');
  };

  const MapClickHandler = () => {
    useMapEvents({
      click(e) {
        if (selectingLocation) {
          const { lat, lng } = e.latlng;
          setPoteauData((prev) => ({
            ...prev,
            localisation: { lat, lng },
          }));
          setSelectingLocation(false);
          toast.success('Emplacement sélectionné.');
        }
      },
    });
    return null;
  };

  const handleSave = async () => {
    if (!poteauData.nom || !poteauData.code || !poteauData.site || !poteauData.ligne) {
      toast.error('Les champs Nom, Code, Site et Ligne sont obligatoires.');
      return;
    }
    if (poteauData.luminosite < 0 || poteauData.luminosite > 100) {
      toast.error('Le niveau de lumière doit être entre 0 et 100%.');
      return;
    }
    if (!poteauData.localisation.lat || !poteauData.localisation.lng) {
      toast.error('Veuillez sélectionner un emplacement sur la carte.');
      return;
    }

    try {
      const payload = {
        nom: poteauData.nom,
        code: poteauData.code,
        site: poteauData.site,
        ligne: poteauData.ligne,
        statut: poteauData.statut,
        luminosite: poteauData.luminosite,
        localisation: {
          lat: poteauData.localisation.lat,
          lng: poteauData.localisation.lng,
        },
      };

      console.log('Sending payload:', JSON.stringify(payload, null, 2));
      const response = await axios.put(`http://localhost:5000/api/poteau/${poteauData._id}`, payload);
      console.log('Server response:', JSON.stringify(response.data, null, 2));
      toast.success('Poteau modifié avec succès.');
      onSave(response.data);
      setTimeout(() => onClose(), 500);
    } catch (error) {
      const errorMessage = error.response?.data?.message || 'Erreur lors de la modification du poteau.';
      toast.error(errorMessage);
      console.error('Error updating poteau:', error.response?.data || error.message);
    }
  };

  const dropdownItemTemplate = (option) => (
    <div className="poteau-dropdown-item">
      <i className={`${option.icon} poteau-dropdown-icon`} />
      <span>{option.label}</span>
    </div>
  );

  const dropdownValueTemplate = (option, props) => {
    if (option) {
      return (
        <div className="poteau-dropdown-item">
          <i className={`${option.icon} poteau-dropdown-icon`} />
          <span>{option.label}</span>
        </div>
      );
    }
    return <span>{props.placeholder}</span>;
  };

  return (
    <div className="poteau-modal-overlay">
      <div className="poteau-modal-container">
        <div className="poteau-modal-header">
          <div className="poteau-header-content">
            <i className="ri-lightbulb-line poteau-header-icon" />
            <h2>Modifier le Poteau</h2>
          </div>
          <button className="poteau-close-btn" onClick={onClose}>
            <i className="ri-close-line" />
          </button>
        </div>

        <div className="poteau-modal-body">
          <div className="poteau-form-grid">
            <div className="poteau-form-group">
              <label className="poteau-form-label">
                <i className="ri-align-left" /> Nom du poteau *
              </label>
              <span className="p-input-icon-left">
                <i className="ri-align-left" />
                <InputText
                  name="nom"
                  value={poteauData.nom}
                  onChange={handleInputChange}
                  placeholder="Poteau A"
                  className="poteau-form-input"
                  required
                />
              </span>
            </div>

            <div className="poteau-form-group">
              <label className="poteau-form-label">
                <i className="ri-barcode-line" /> Code *
              </label>
              <span className="p-input-icon-left">
                <i className="ri-barcode-line" />
                <InputText
                  name="code"
                  value={poteauData.code}
                  onChange={handleInputChange}
                  placeholder="PT-1001"
                  className="poteau-form-input"
                  required
                  readOnly
                />
              </span>
            </div>

            <div className="poteau-form-group">
              <label className="poteau-form-label">
                <i className="ri-building-4-line" /> Site associé *
              </label>
              <Dropdown
                name="site"
                value={poteauData.site}
                options={siteOptions}
                onChange={handleInputChange}
                placeholder="Sélectionnez le site"
                className="poteau-form-dropdown"
                optionLabel="label"
                itemTemplate={dropdownItemTemplate}
                valueTemplate={dropdownValueTemplate}
                required
              />
            </div>

            <div className="poteau-form-group">
              <label className="poteau-form-label">
                <i className="ri-git-branch-line" /> Ligne associée *
              </label>
              <Dropdown
                name="ligne"
                value={poteauData.ligne}
                options={ligneOptions}
                onChange={handleInputChange}
                placeholder="Sélectionnez la ligne"
                className="poteau-form-dropdown"
                optionLabel="label"
                itemTemplate={dropdownItemTemplate}
                valueTemplate={dropdownValueTemplate}
                required
              />
            </div>

            <div className="poteau-form-group">
              <label className="poteau-form-label">
                <i className="ri-checkbox-circle-line" /> Statut
              </label>
              <Dropdown
                name="statut"
                value={poteauData.statut}
                options={statutOptions}
                onChange={handleInputChange}
                placeholder="Sélectionnez le statut"
                className="poteau-form-dropdown"
                optionLabel="label"
                itemTemplate={dropdownItemTemplate}
                valueTemplate={dropdownValueTemplate}
              />
            </div>

            <div className="poteau-form-group">
              <label className="poteau-form-label">
                <i className="ri-sun-line poteau-luminosite-icon" /> Niveau de Lumière (%)
              </label>
              <div className="poteau-slider-container">
                <Slider
                  value={poteauData.luminosite}
                  onChange={handleSliderChange}
                  min={0}
                  max={100}
                  step={1}
                  className="poteau-form-slider"
                />
                <div className="poteau-slider-value-container">
                  <span className="poteau-slider-value">{poteauData.luminosite}%</span>
                </div>
              </div>
            </div>

            <div className="poteau-form-group poteau-map-section">
              <label className="poteau-form-label">
                <i className="ri-map-pin-line" /> Emplacement
              </label>
              <div className="poteau-map-container">
                <MapContainer
                  center={[poteauData.localisation.lat, poteauData.localisation.lng]}
                  zoom={13}
                  style={{ height: '300px', width: '100%' }}
                  whenCreated={(map) => (mapRef.current = map)}
                >
                  <TileLayer
                    url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                    attribution='© <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                  />
                  <MapClickHandler />
                  {poteauData.localisation.lat && poteauData.localisation.lng && (
                    <Marker
                      position={[poteauData.localisation.lat, poteauData.localisation.lng]}
                      icon={poteauIcon}
                    >
                      <Popup>Poteau en cours de modification</Popup>
                    </Marker>
                  )}
                  {ligneMarkers.map((marker, index) => (
                    <Marker key={index} position={marker.position} icon={lineIcon}>
                      <Popup>{marker.label}</Popup>
                    </Marker>
                  ))}
                  {existingPoteaux.map((poteau) => (
                    <Marker
                      key={poteau.id}
                      position={[poteau.lat, poteau.lng]}
                      icon={existingPoteauIcon}
                    >
                      <Popup>{poteau.nom}</Popup>
                    </Marker>
                  ))}
                </MapContainer>
              </div>
              <div className="poteau-map-buttons">
                <Button
                  label="Sélectionner l'emplacement"
                  icon="pi pi-map-marker"
                  className="p-button-text p-button-sm poteau-map-btn blue-btn"
                  onClick={() => setSelectingLocation(true)}
                  disabled={selectingLocation}
                />
                <Button
                  label="Réinitialiser l'emplacement"
                  icon="pi pi-refresh"
                  className="p-button-text p-button-sm poteau-map-btn"
                  onClick={clearLocation}
                />
              </div>
              {poteauData.localisation.lat && poteauData.localisation.lng && (
                <span className="p-input-icon-left">
                  <i className="ri-map-pin-line" />
                  <InputText
                    value={`Lat: ${poteauData.localisation.lat.toFixed(6)}, Lng: ${poteauData.localisation.lng.toFixed(6)}`}
                    readOnly
                    className="poteau-form-input poteau-coords-input"
                  />
                </span>
              )}
            </div>
          </div>
        </div>

        <div className="poteau-modal-footer">
          <button className="poteau-cancel-btn" onClick={onClose}>
            Annuler
          </button>
          <button className="poteau-submit-btn" onClick={handleSave}>
            Modifier
          </button>
        </div>
      </div>
    </div>
  );
};

export default EditPoteauModal;