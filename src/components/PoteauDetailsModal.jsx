import React from 'react';
import clsx from 'clsx';
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import L from 'leaflet';
import {
  RiCloseLine,
  RiMapPinLine,
  RiLightbulbLine,
  RiBarcodeLine,
  RiBuilding4Line,
  RiGitBranchLine,
  RiCheckboxCircleLine,
  RiPauseCircleFill,
  RiToolsFill,
  RiErrorWarningFill,
  RiSunLine,
} from 'react-icons/ri';
import 'leaflet/dist/leaflet.css';
import './PoteauDetailsModal.css';

// Fix Leaflet default icon
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-yellow.png',
  iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-yellow.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [0, -41],
  shadowSize: [41, 41],
});

const PoteauDetailsModal = ({ poteau, onClose }) => {
  if (!poteau) {
    return null; // Prevent rendering if poteau is null
  }

  // Map center
  const center = poteau?.localisation?.lat && poteau?.localisation?.lng
    ? [poteau.localisation.lat, poteau.localisation.lng]
    : [48.8566, 2.3522]; // Paris default

  // Format status
  const statusLabels = {
    Actif: 'Actif',
    Inactif: 'Inactif',
    Panne: 'Hors service',
    Maintenance: 'En maintenance',
  };

  return (
    <div className="poteau-details-modal-overlay" role="dialog" aria-labelledby="poteau-details-title">
      <div className="poteau-details-modal-container">
        {/* Header with close button */}
        <div className="poteau-details-modal-header">
          <div className="poteau-details-title-container">
            <RiLightbulbLine className="poteau-details-main-icon" />
            <h2 id="poteau-details-title">Fiche Technique du Poteau</h2>
          </div>
          <button
            onClick={onClose}
            className="poteau-details-close-btn"
            aria-label="Fermer la fiche technique"
          >
            <RiCloseLine size={24} />
          </button>
        </div>

        {/* Modal body */}
        <div className="poteau-details-modal-body">
          {/* Main Information Section */}
          <div className="poteau-details-card primary-card">
            <div className="poteau-details-card-header">
              <RiLightbulbLine className="poteau-details-card-icon" />
              <h3>Informations Principales</h3>
            </div>
            <div className="poteau-details-card-content">
              <DetailItem
                icon={<RiLightbulbLine />}
                label="Nom du Poteau"
                value={poteau?.nom || 'Non défini'}
              />
              <DetailItem
                icon={<RiBarcodeLine />}
                label="Code"
                value={poteau?.code || 'Non défini'}
              />
              <DetailItem
                icon={
                  poteau?.statut === 'Actif' ? (
                    <RiCheckboxCircleLine />
                  ) : poteau?.statut === 'Panne' ? (
                    <RiErrorWarningFill />
                  ) : poteau?.statut === 'Maintenance' ? (
                    <RiToolsFill />
                  ) : (
                    <RiPauseCircleFill />
                  )
                }
                label="Statut"
                value={statusLabels[poteau?.statut] || poteau?.statut || 'Non défini'}
                status={poteau?.statut}
              />
            </div>
          </div>

          {/* Association Section */}
          <div className="poteau-details-card">
            <div className="poteau-details-card-header">
              <RiBuilding4Line className="poteau-details-card-icon" />
              <h3>Associations</h3>
            </div>
            <div className="poteau-details-card-content">
              <DetailItem
                icon={<RiBuilding4Line />}
                label="Site Associé"
                value={poteau?.site || 'Site non attribué'}
              />
              <DetailItem
                icon={<RiGitBranchLine />}
                label="Ligne Associée"
                value={poteau?.ligne || 'Ligne non attribuée'}
              />
            </div>
          </div>

          {/* Characteristics Section */}
          <div className="poteau-details-card">
            <div className="poteau-details-card-header">
              <RiSunLine className="poteau-details-card-icon" />
              <h3>Caractéristiques</h3>
            </div>
            <div className="poteau-details-card-content">
              <DetailItem
                icon={<RiSunLine />}
                label="Niveau de Lumière"
                value={poteau?.luminosite ? `${poteau.luminosite}%` : 'Non spécifié'}
              />
            </div>
          </div>

          {/* Coordinates Section */}
          <div className="poteau-details-card">
            <div className="poteau-details-card-header">
              <RiMapPinLine className="poteau-details-card-icon" />
              <h3>Coordonnées Géographiques</h3>
            </div>
            <div className="poteau-details-card-content">
              <div className="poteau-details-coords-container">
                <DetailItem
                  icon={<RiMapPinLine />}
                  label="Latitude"
                  value={poteau?.localisation?.lat || 'Non spécifiée'}
                />
                <DetailItem
                  icon={<RiMapPinLine />}
                  label="Longitude"
                  value={poteau?.localisation?.lng || 'Non spécifiée'}
                />
              </div>
              <div className="poteau-details-map-container" aria-label="Carte de l'emplacement du poteau">
                <MapContainer center={center} zoom={13} style={{ height: '100%', width: '100%' }}>
                  <TileLayer
                    url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                    attribution='© <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                  />
                  {poteau?.localisation?.lat && poteau?.localisation?.lng && (
                    <Marker position={[poteau.localisation.lat, poteau.localisation.lng]}>
                      <Popup>{poteau.nom || 'Poteau'}</Popup>
                    </Marker>
                  )}
                </MapContainer>
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="poteau-details-modal-footer">
          <button
            onClick={onClose}
            className="poteau-details-close-button"
            aria-label="Fermer la fiche technique"
          >
            Fermer la fiche technique
          </button>
        </div>
      </div>
    </div>
  );
};

// Reusable DetailItem component
const DetailItem = ({ icon, label, value, status, small = false }) => {
  return (
    <div className={`poteau-detail-item ${small ? 'small' : ''}`}>
      <div className="poteau-detail-icon">{icon}</div>
      <div className="poteau-detail-content">
        <span className="poteau-detail-label">{label}</span>
        <span
          className={clsx('poteau-detail-value', {
            'status-actif': status === 'Actif',
            'status-panne': status === 'Panne',
            'status-maintenance': status === 'Maintenance',
            'status-inactif': status === 'Inactif',
          })}
          aria-label={`${label}: ${value}`}
        >
          {value}
        </span>
      </div>
    </div>
  );
};

export default PoteauDetailsModal;