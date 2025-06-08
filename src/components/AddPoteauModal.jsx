import React, { useState, useEffect } from 'react';
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

// Icône pour le poteau (jaune)
const poteauIcon = new L.Icon({
  iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-yellow.png',
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [0, -41],
  shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
  shadowSize: [41, 41],
});

// Icône pour les points de ligne
const lineIcon = new L.Icon({
  iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
  iconSize: [30, 48],
  iconAnchor: [15, 48],
  popupAnchor: [0, -48],
  shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
  shadowSize: [41, 41],
});

// Icône pour les poteaux existants (bleu par défaut pour distinction)
const existingPoteauIcon = new L.Icon({
  iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [0, -41],
  shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
  shadowSize: [41, 41],
});

const AddPoteauModal = ({ onClose, onSave, initialData }) => {
  const mapRef = useState(null)[1]; // mapRef n'est pas utilisé correctement, mais conservé pour compatibilité
  const [poteauData, setPoteauData] = useState({
    nom: '',
    code: '',
    site: '',
    ligne: '',
    statut: 'Actif',
    luminosite: 0,
    localisation: { lat: null, lng: null },
  });
  const [siteOptions, setSiteOptions] = useState([]);
  const [ligneOptions, setLigneOptions] = useState([]);
  const [ligneMarkers, setLigneMarkers] = useState([]);
  const [existingPoteaux, setExistingPoteaux] = useState([]);
  const [selectingLocation, setSelectingLocation] = useState(false);

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
      } catch (error) {
        toast.error('Erreur : Impossible de charger les sites.');
        console.error('Erreur lors du chargement des sites:', error.response?.data || error.message);
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
      } catch (error) {
        toast.error('Erreur : Impossible de charger les lignes.');
        console.error('Erreur lors du chargement des lignes:', error.response?.data || error.message);
      }
    };

    const fetchGeneratedCode = async () => {
      try {
        const response = await axios.get('http://localhost:5000/api/poteau/generate-code');
        setPoteauData((prev) => ({
          ...prev,
          code: response.data.code.toString(),
        }));
      } catch (error) {
        toast.error('Erreur : Impossible de générer le code automatiquement.');
        console.error('Erreur lors de la génération du code:', error.response?.data || error.message);
      }
    };

    fetchSites();
    fetchLignes();
    fetchGeneratedCode();

    if (initialData) {
      setPoteauData({
        nom: initialData.nom || '',
        code: initialData.code || '',
        site: initialData.site || '',
        ligne: initialData.ligne || '',
        statut: initialData.statut || 'Actif',
        luminosite: initialData.luminosite || 0,
        localisation: initialData.localisation || { lat: null, lng: null },
      });
    }
  }, [initialData]);

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
            setExistingPoteaux(response.data.data);
          } catch (error) {
            toast.error('Erreur : Impossible de charger les poteaux.');
            console.error('Erreur lors du chargement des poteaux existants:', error.response?.data || error.message);
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
  }, [poteauData.ligne, ligneOptions]);

  const statutOptions = [
    { label: 'Actif', value: 'Actif', icon: 'ri-checkbox-circle-line' },
    { label: 'Inactif', value: 'Inactif', icon: 'ri-close-circle-line' },
  ];

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setPoteauData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSliderChange = (e) => {
    const value = e.value;
    setPoteauData((prev) => ({
      ...prev,
      luminosite: value,
    }));
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
          toast.success('Emplacement sélectionné avec succès.');
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

      console.log('Envoi des données au serveur:', JSON.stringify(payload, null, 2));
      const response = await axios.post('http://localhost:5000/api/poteau', payload);
      console.log('Réponse du serveur:', JSON.stringify(response.data, null, 2));
      onSave(response.data);
      setTimeout(() => onClose(), 500); // Délai pour permettre au toast de s'afficher
    } catch (error) {
      const errorMessage = error.response?.data?.message || 'Erreur lors de la sauvegarde du poteau.';
      toast.error(errorMessage);
      console.error('Erreur lors de l\'ajout du poteau:', error.response?.data || error.message);
    }
  };

  const dropdownItemTemplate = (option) => {
    return (
      <div className="poteau-dropdown-item">
        <i className={`${option.icon} poteau-dropdown-icon`} />
        <span>{option.label}</span>
      </div>
    );
  };

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
            <h2>{initialData ? 'Modifier le Poteau' : 'Ajouter un Poteau'}</h2>
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
                  onChange={(e) => handleSliderChange(e)}
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
                  center={[48.8566, 2.3522]}
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
                      <Popup>Nouveau Poteau</Popup>
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
              <Button
                label="Sélectionner l'emplacement"
                icon="pi pi-map-marker"
                className="p-button-text p-button-sm poteau-map-btn"
                onClick={() => setSelectingLocation(true)}
                disabled={selectingLocation}
              />
              {poteauData.localisation.lat && (
                <span className="p-input-icon-left">
                  <i className="ri-map-pin-line" />
                  <InputText
                    value={`Lat: ${poteauData.localisation.lat}, Lng: ${poteauData.localisation.lng}`}
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
            {initialData ? 'Modifier' : 'Ajouter'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default AddPoteauModal;