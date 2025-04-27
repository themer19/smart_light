import { useState, useRef, useEffect } from 'react';
import { MapContainer, TileLayer, Marker, useMapEvents } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import './AddSiteModal.css'

const customIcon = new L.Icon({
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41]
});

const LocationPicker = ({ onLocationSelect, initialPosition }) => {
  const [position, setPosition] = useState(initialPosition);
  const map = useMapEvents({
    click(e) {
      setPosition(e.latlng);
      onLocationSelect(e.latlng);
    },
  });

  // Centre la carte sur la position initiale
  useEffect(() => {
    if (initialPosition) {
      map.flyTo(initialPosition, 15);
    }
  }, [initialPosition, map]);

  return position ? <Marker position={position} icon={customIcon} /> : null;
};

const EditSiteModal = ({ onClose, onSave, initialData }) => {
  const mapRef = useRef(null);
  const [formData, setFormData] = useState({
    nom: initialData.nom || '',
    localisation: initialData.localisation || '',
    status: initialData.status || 'Actif',
    dateInstallation: initialData.dateInstallation || '',
    description: initialData.description || '',
    location: initialData.localisation 
      ? { 
          lat: initialData.localisation.latitude, 
          lng: initialData.localisation.longitude 
        } 
      : null
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
            `https://nominatim.openstreetmap.org/search?format=json&q=${searchQuery}&countrycodes=fr&limit=5`
          );
          const data = await response.json();
          setSuggestions(data.map(result => result.display_name));
        } catch (error) {
          console.error("Erreur de géocodage:", error);
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
        `https://nominatim.openstreetmap.org/search?format=json&q=${suggestion}&countrycodes=fr&limit=1`
      );
      const data = await response.json();
      if (data.length > 0) {
        const { lat, lon } = data[0];
        setFormData(prev => ({
          ...prev,
          location: { lat: parseFloat(lat), lng: parseFloat(lon) }
        }));
        mapRef.current.flyTo([lat, lon], 15);
      }
    } catch (error) {
      console.error("Erreur de géocodage:", error);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.location) {
      alert('Veuillez sélectionner une position sur la carte');
      return;
    }

    setIsLoading(true);
    try {
      const siteData = {
        ...formData,
        localisation: {
          latitude: formData.location.lat,
          longitude: formData.location.lng
        }
      };
      await onSave(siteData);
      onClose();
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="modal-overlay">
      <div className="modal-container">
        <div className="modal-header">
          <h2>✏️ Modifier le Site</h2>
          <button className="close-btn" onClick={onClose}>&times;</button>
        </div>

        <div className="modal-tabs">
          <button 
            className={`tab ${activeTab === 'details' ? 'active' : ''}`}
            onClick={() => setActiveTab('details')}
          >
            📋 Informations de base
          </button>
          <button 
            className={`tab ${activeTab === 'location' ? 'active' : ''}`}
            onClick={() => setActiveTab('location')}
          >
            🗺️ Position sur la carte
          </button>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="modal-content">
            {activeTab === 'details' && (
              <>
                <div className="form-group">
                  <label>Nom du site *</label>
                  <input
                    type="text"
                    value={formData.nom}
                    onChange={(e) => setFormData({...formData, nom: e.target.value})}
                    required
                  />
                </div>

                <div className="form-row">
                  <div className="form-group">
                    <label>Statut</label>
                    <select
                      value={formData.status}
                      onChange={(e) => setFormData({...formData, status: e.target.value})}
                    >
                      <option value="Actif">Actif</option>
                      <option value="Panne">Panne</option>
                      <option value="Maintenance">Maintenance</option>
                    </select>
                  </div>

                  <div className="form-group">
                    <label>Date d'installation</label>
                    <input
                      type="date"
                      value={formData.dateInstallation}
                      onChange={(e) => setFormData({...formData, dateInstallation: e.target.value})}
                    />
                  </div>
                </div>

                <div className="form-group">
                  <label>Description</label>
                  <textarea
                    value={formData.description}
                    onChange={(e) => setFormData({...formData, description: e.target.value})}
                    rows="3"
                  />
                </div>
              </>
            )}

            {activeTab === 'location' && (
              <div className="map-section">
                <div className="map-container">
                  <MapContainer
                    center={formData.location || [33.8869, 9.5375]}
                    zoom={formData.location ? 15 : 7}
                    scrollWheelZoom={true}
                    style={{ height: '400px' }}
                    ref={mapRef}
                  >
                    <TileLayer
                      url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                      attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                    />
                    <LocationPicker 
                      onLocationSelect={handleLocationSelect} 
                      initialPosition={formData.location}
                    />
                  </MapContainer>
                </div>
                <div className="coordinates-info">
                  {formData.location ? (
                    <p>
                      Position actuelle: 
                      <br />
                      Latitude: {formData.location.lat.toFixed(4)}
                      <br />
                      Longitude: {formData.location.lng.toFixed(4)}
                    </p>
                  ) : (
                    <p>Cliquez sur la carte pour sélectionner une nouvelle position</p>
                  )}
                </div>
              </div>
            )}
          </div>

          <div className="modal-footer">
            <button 
              type="button" 
              className="cancel-btn"
              onClick={onClose}
              disabled={isLoading}
            >
              Annuler
            </button>
            <button 
              type="submit" 
              className="submit-btn"
              disabled={isLoading}
            >
              {isLoading ? 'Enregistrement...' : 'Mettre à jour'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default EditSiteModal;