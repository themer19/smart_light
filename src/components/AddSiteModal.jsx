import { useState, useRef, useEffect } from 'react';
import { InputText } from 'primereact/inputtext';
import { Button } from 'primereact/button';
import { Toast } from 'primereact/toast';
import { MapContainer, TileLayer, Marker, useMapEvents } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import './AddSiteModal.css';

const customIcon = new L.Icon({
  iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
  iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41]
});

const LocationPicker = ({ onLocationSelect }) => {
  const [position, setPosition] = useState(null);

  useMapEvents({
    click(e) {
      setPosition(e.latlng);
      onLocationSelect(e.latlng);
    },
  });

  return position ? <Marker position={position} icon={customIcon} /> : null;
};

const AddSiteModal = ({ onClose, onSave }) => {
  const mapRef = useRef(null);
  const toast = useRef(null);
  const [formData, setFormData] = useState({
    nom: '',
    localisation: '',
    status: 'Actif',
    dateInstallation: '',
    description: '',
    location: null
  });
  const [searchQuery, setSearchQuery] = useState('');
  const [suggestions, setSuggestions] = useState([]);
  const [activeTab, setActiveTab] = useState('details');
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (searchQuery.length > 2) {
      const timer = setTimeout(async () => {
        try {
          const response = await fetch(
            `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(searchQuery)}&countrycodes=fr&limit=5`
          );
          const data = await response.json();
          setSuggestions(data.map(result => result.display_name));
        } catch (error) {
          toast.current.show({
            severity: 'error',
            summary: 'Erreur',
            detail: 'Erreur lors de la recherche géographique',
            life: 3000,
          });
        }
      }, 500);
      return () => clearTimeout(timer);
    } else {
      setSuggestions([]);
    }
  }, [searchQuery]);

  const handleLocationSelect = (latlng) => {
    setFormData(prev => ({
      ...prev,
      location: { lat: latlng.lat, lng: latlng.lng }
    }));
  };

  const handleSuggestionClick = async (suggestion) => {
    setSearchQuery(suggestion);
    setSuggestions([]);
    try {
      const response = await fetch(
        `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(suggestion)}&countrycodes=fr&limit=1`
      );
      const data = await response.json();
      if (data.length > 0) {
        const { lat, lon } = data[0];
        setFormData(prev => ({
          ...prev,
          location: { lat: parseFloat(lat), lng: parseFloat(lon) },
          localisation: suggestion
        }));
        mapRef.current.flyTo([lat, lon], 15);
        toast.current.show({
          severity: 'success',
          summary: 'Succès',
          detail: 'Localisation trouvée',
          life: 3000,
        });
      } else {
        toast.current.show({
          severity: 'error',
          summary: 'Erreur',
          detail: 'Aucune localisation trouvée',
          life: 3000,
        });
      }
    } catch (error) {
      toast.current.show({
        severity: 'error',
        summary: 'Erreur',
        detail: 'Erreur lors de la recherche géographique',
        life: 3000,
      });
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.nom || !formData.status || !formData.dateInstallation) {
      toast.current.show({
        severity: 'error',
        summary: 'Erreur',
        detail: 'Veuillez remplir tous les champs obligatoires (Nom, Statut, Date d’installation)',
        life: 3000,
      });
      return;
    }
    if (!formData.location) {
      toast.current.show({
        severity: 'error',
        summary: 'Erreur',
        detail: 'Veuillez sélectionner une position sur la carte',
        life: 3000,
      });
      return;
    }

    setIsLoading(true);
    try {
      await onSave(formData);
      toast.current.show({
        severity: 'success',
        summary: 'Succès',
        detail: 'Site enregistré avec succès',
        life: 3000,
      });
      onClose();
    } catch (error) {
      toast.current.show({
        severity: 'error',
        summary: 'Erreur',
        detail: 'Erreur lors de l’enregistrement',
        life: 3000,
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <>
      <Toast ref={toast} />
      <div className="add-site-modal-overlay">
        <div className="add-site-modal-container">
          <div className="add-site-modal-header">
            <h2><i className="pi pi-map-marker" /> Ajouter un Nouveau Site</h2> 
            <button className="add-site-close-btn" onClick={onClose}><i className="pi pi-times" /></button>
          </div>

          <div className="add-site-modal-tabs">
            <button 
              className={`add-site-tab ${activeTab === 'details' ? 'active' : ''}`}
              onClick={() => setActiveTab('details')}
            >
              <i className="pi pi-file" /> Informations de base
            </button>
            <button 
              className={`add-site-tab ${activeTab === 'location' ? 'active' : ''}`}
              onClick={() => setActiveTab('location')}
            >
              <i className="pi pi-map" /> Position sur la carte
            </button>
          </div>

          <form onSubmit={handleSubmit}>
            <div className="add-site-modal-content">
              {activeTab === 'details' && (
                <>
                  <div className="add-site-form-group">
                    <label><i className="pi pi-building" /> Nom du site *</label>
                    <div className="add-site-input-icon-wrapper">
                      <i className="pi pi-building" />
                      <input
                        type="text"
                        value={formData.nom}
                        onChange={(e) => setFormData({...formData, nom: e.target.value})}
                        required
                      />
                    </div>
                  </div>

                  <div className="add-site-form-row">
                    <div className="add-site-form-group">
                      <label><i className="pi pi-check-circle" /> Statut</label>
                      <div className="add-site-input-icon-wrapper">
                        <i className="pi pi-check-circle" />
                        <select
                          value={formData.status}
                          onChange={(e) => setFormData({...formData, status: e.target.value})}
                          required
                        >
                          <option value="Actif">Actif</option>
                          <option value="Panne">Panne</option>
                          <option value="Maintenance">Maintenance</option>
                        </select>
                      </div>
                    </div>

                    <div className="add-site-form-group">
                      <label><i className="pi pi-calendar" /> Date d'installation</label>
                      <div className="add-site-input-icon-wrapper">
                        <i className="pi pi-calendar" />
                        <input
                          type="date"
                          value={formData.dateInstallation}
                          onChange={(e) => setFormData({...formData, dateInstallation: e.target.value})}
                          required
                        />
                      </div>
                    </div>
                  </div>

                  <div className="add-site-form-group">
                    <label><i className="pi pi-file" /> Description</label>
                    <div className="add-site-input-icon-wrapper">
                      <i className="pi pi-file" />
                      <textarea
                        value={formData.description}
                        onChange={(e) => setFormData({...formData, description: e.target.value})}
                        rows="3"
                      />
                    </div>
                  </div>
                </>
              )}

              {activeTab === 'location' && (
                <div className="add-site-map-section">
                  <div className="add-site-map-search">
                    <span className="add-site-p-input-icon-left">
                      <i className="pi pi-search" />
                      <InputText
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        placeholder="Rechercher une adresse..."
                        className="p-inputtext-sm"
                        onKeyPress={(e) => e.key === 'Enter' && handleSuggestionClick(searchQuery)}
                      />
                    </span>
                    <Button
                      icon="pi pi-search"
                      className="p-button-text p-button-sm"
                      onClick={() => handleSuggestionClick(searchQuery)}
                      tooltip="Rechercher"
                    />
                    {suggestions.length > 0 && (
                      <div className="add-site-suggestions-dropdown">
                        {suggestions.map((suggestion, index) => (
                          <div 
                            key={index}
                            className="add-site-suggestion-item"
                            onClick={() => handleSuggestionClick(suggestion)}
                          >
                            <i className="pi pi-map-marker" /> {suggestion}
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                  
                  <div className="add-site-map-container">
                    <MapContainer
                      center={[33.8869, 9.5375]}
                      zoom={7}
                      scrollWheelZoom={true}
                      style={{ height: '400px' }}
                      ref={mapRef}
                    >
                      <TileLayer
                        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                        attribution='© <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                      />
                      <LocationPicker onLocationSelect={handleLocationSelect} />
                      {formData.location && <Marker position={[formData.location.lat, formData.location.lng]} icon={customIcon} />}
                    </MapContainer>
                  </div>
                  <div className="add-site-coordinates-info">
                    {formData.location ? (
                      <p>
                        <i className="pi pi-map-marker" /> Position sélectionnée: 
                        <br />
                        <i className="pi pi-globe" /> Latitude: {formData.location.lat.toFixed(4)}
                        <br />
                        <i className="pi pi-globe" /> Longitude: {formData.location.lng.toFixed(4)}
                      </p>
                    ) : (
                      <p><i className="pi pi-map-marker" /> Cliquez sur la carte pour sélectionner une position</p>
                    )}
                  </div>
                </div>
              )}
            </div>

            <div className="add-site-modal-footer">
              <button 
                type="button" 
                className="add-site-cancel-btn"
                onClick={onClose}
                disabled={isLoading}
              >
                <i className="pi pi-times" /> Annuler
              </button>
              <button 
                type="submit" 
                className="add-site-submit-btn"
                disabled={!formData.location || isLoading}
              >
                {isLoading ? (
                  <>
                    <i className="pi pi-spin add-site-pi-spin" /> Enregistrement...
                  </>
                ) : (
                  <>
                    <i className="pi pi-check" /> Enregistrer le site
                  </>
                )}
              </button>
            </div>
          </form>
        </div>
      </div>
    </>
  );
};

export default AddSiteModal;