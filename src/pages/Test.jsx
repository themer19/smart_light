import { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { MapContainer, TileLayer, Marker, useMapEvents } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import './cssP/test2.css';

// Import des images pour les marqueurs
import markerIcon2x from 'leaflet/dist/images/marker-icon-2x.png';
import markerIcon from 'leaflet/dist/images/marker-icon.png';
import markerShadow from 'leaflet/dist/images/marker-shadow.png';

// Configuration des icônes Leaflet
const customIcon = new L.Icon({
  iconUrl: markerIcon,
  iconRetinaUrl: markerIcon2x,
  shadowUrl: markerShadow,
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41]
});

// Composant pour sélectionner la localisation
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

const Test = () => {
  const navigate = useNavigate();
  const mapRef = useRef(null);
  const [formData, setFormData] = useState({
    siteName: '',
    address: '',
    status: '',
    installationDate: '',
    description: '',
    contact: '',
    location: null
  });

  const [searchQuery, setSearchQuery] = useState('');
  const [suggestions, setSuggestions] = useState([]);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Géocodage des adresses
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
    setIsSubmitting(true);
    
    try {
      // Ici vous enverriez les données à votre API
      console.log('Données du site:', formData);
      
      // Simuler un délai d'envoi
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      navigate('/sites');
    } catch (error) {
      console.error("Erreur lors de l'envoi:", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="modern-add-site">
      <div className="form-header">
        <h1>📍 Ajouter un Nouveau Site</h1>
        <p>Remplissez les détails du site et positionnez-le sur la carte</p>
      </div>

      <div className="form-container">
        <div className="form-section">
          <div className="form-card">
            <h2>📋 Informations de base</h2>
            
            <form onSubmit={handleSubmit}>
              <div className="form-group">
                <label>Nom du site *</label>
                <input
                  type="text"
                  value={formData.siteName}
                  onChange={(e) => setFormData({...formData, siteName: e.target.value})}
                  placeholder="Entrez le nom du site"
                  required
                />
              </div>

              <div className="form-group">
                <label>Adresse *</label>
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Rechercher une adresse"
                />
                {suggestions.length > 0 && (
                  <ul className="suggestions-list">
                    {suggestions.map((item, index) => (
                      <li 
                        key={index} 
                        onClick={() => handleSuggestionClick(item)}
                        title="Cliquer pour sélectionner"
                      >
                        {item}
                      </li>
                    ))}
                  </ul>
                )}
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label>Statut *</label>
                  <select
                    value={formData.status}
                    onChange={(e) => setFormData({...formData, status: e.target.value})}
                    required
                  >
                    <option value="">Sélectionnez</option>
                    <option value="Actif">Actif</option>
                    <option value="Panne">Panne</option>
                    <option value="Maintenance">Maintenance</option>
                  </select>
                </div>

                <div className="form-group">
                  <label>Date d'installation *</label>
                  <input
                    type="date"
                    value={formData.installationDate}
                    onChange={(e) => setFormData({...formData, installationDate: e.target.value})}
                    required
                  />
                </div>
              </div>

              <div className="form-group">
                <label>Description</label>
                <textarea
                  value={formData.description}
                  onChange={(e) => setFormData({...formData, description: e.target.value})}
                  placeholder="Description du site"
                  rows="3"
                ></textarea>
              </div>
            </form>
          </div>

         
        </div>

        <div className="map-section">
          <div className="map-card">
            <h2>🗺️ Position sur la carte</h2>
            <div className="map-container">
              <MapContainer
                center={[46.603354, 1.888334]}
                zoom={6}
                scrollWheelZoom={true}
                style={{ height: '100%', width: '100%', borderRadius: '8px' }}
                ref={mapRef}
              >
                <TileLayer
                  url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                  attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                />
                <LocationPicker onLocationSelect={handleLocationSelect} />
              </MapContainer>
            </div>
            <div className="map-coordinates">
              {formData.location ? (
                <p>
                  ✅ Position sélectionnée: 
                  Lat: {formData.location.lat.toFixed(4)}, Lng: {formData.location.lng.toFixed(4)}
                </p>
              ) : (
                <p>ℹ️ Cliquez sur la carte pour positionner le site</p>
              )}
            </div>
          </div>
        </div>
      </div>

      <div className="form-actions">
        <button 
          type="button" 
          className="cancel-btn"
          onClick={() => {
            if(window.confirm('Annuler la création de ce site ?')) {
              navigate('/sites');
            }
          }}
          disabled={isSubmitting}
        >
          Annuler
        </button>
        <button 
          type="submit" 
          className="submit-btn"
          onClick={handleSubmit}
          disabled={!formData.location || isSubmitting}
        >
          {isSubmitting ? 'Enregistrement...' : '💾 Enregistrer le Site'}
        </button>
      </div>
    </div>
  );
};

export default Test;