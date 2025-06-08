import React from 'react';
import clsx from 'clsx';
import { MapContainer, TileLayer, Marker, Polyline } from 'react-leaflet';
import L from 'leaflet';
import {
  RiCloseLine,
  RiMapPinLine,
  RiMapPin2Line,
  RiFlashlightLine,
  RiRulerLine,
  RiHome4Line,
  RiStackLine,
  RiInformationLine,
  RiToolsFill,
  RiPauseCircleFill,
} from 'react-icons/ri';
import 'leaflet/dist/leaflet.css';
import './LineDetailsModal.css';

// Fix Leaflet default icon
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
  iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
});

const LineDetailsModal = ({ line, onClose }) => {
  if (!line) {
    return null; // Prevent rendering if line is null
  }

  // Map center and polyline positions
  const center =
    line?.startPoint?.lat && line?.endPoint?.lat
      ? [(line.startPoint.lat + line.endPoint.lat) / 2, (line.startPoint.lng + line.endPoint.lng) / 2]
      : [48.8566, 2.3522]; // Paris default

  const polylinePositions =
    line?.startPoint?.lat && line?.endPoint?.lat
      ? [
          [line.startPoint.lat, line.startPoint.lng],
          [line.endPoint.lat, line.endPoint.lng],
        ]
      : [];

  // Format conductor type
  const conductorLabels = {
    copper: 'Cuivre',
    aluminum: 'Aluminium',
    acsr: 'ACSR',
    aaac: 'AAAC',
  };

  // Format voltage
  const voltageLabels = {
    BT: 'Basse Tension (BT)',
    MT: 'Moyenne Tension (MT)',
    HT: 'Haute Tension (HT)',
    THT: 'Très Haute Tension (THT)',
  };

  // Format status
  const statusLabels = {
    Active: 'Active',
    Panne: 'Hors service',
    Maintenance: 'En maintenance',
    Inactive: 'Inactif',
  };

  return (
    <div className="line-details-modal-overlay" role="dialog" aria-labelledby="line-details-title">
      <div className="line-details-modal-container">
        {/* Header with close button */}
        <div className="line-details-modal-header">
          <div className="line-details-title-container">
            <RiFlashlightLine className="line-details-main-icon" />
            <h2 id="line-details-title">Fiche Technique de la Ligne</h2>
          </div>
          <button
            onClick={onClose}
            className="line-details-close-btn"
            aria-label="Fermer la fiche technique"
          >
            <RiCloseLine size={24} />
          </button>
        </div>

        {/* Modal body */}
        <div className="line-details-modal-body">
          {/* Main Information Section */}
          <div className="line-details-card primary-card">
            <div className="line-details-card-header">
              <RiInformationLine className="line-details-card-icon" />
              <h3>Informations Principales</h3>
            </div>
            <div className="line-details-card-content">
              <DetailItem
                icon={<RiFlashlightLine />}
                label="Nom de la Ligne"
                value={line?.nom_L || 'Non défini'}
              />
              <DetailItem
                icon={
                  line?.status === 'Active' ? (
                    <RiFlashlightLine />
                  ) : line?.status === 'Panne' ? (
                    <RiErrorWarningFill />
                  ) : line?.status === 'Maintenance' ? (
                    <RiToolsFill />
                  ) : (
                    <RiPauseCircleFill />
                  )
                }
                label="Statut"
                value={statusLabels[line?.status] || line?.status || 'Non défini'}
                status={line?.status}
              />
              <DetailItem
                icon={<RiHome4Line />}
                label="Site Associé"
                value={line?.site || 'Site non attribué'}
              />
            </div>
          </div>

          {/* Physical Characteristics Section */}
          <div className="line-details-card">
            <div className="line-details-card-header">
              <RiRulerLine className="line-details-card-icon" />
              <h3>Caractéristiques Physiques</h3>
            </div>
            <div className="line-details-card-content">
              <DetailItem
                icon={<RiRulerLine />}
                label="Tension"
                value={voltageLabels[line?.type] || line?.type || 'Non spécifiée'}
              />
              <DetailItem
                icon={<RiRulerLine />}
                label="Longueur"
                value={line?.lengthKm ? `${line.lengthKm} km` : 'Non spécifiée'}
              />
              <DetailItem
                icon={<RiStackLine />}
                label="Nombre de Poteaux"
                value={line?.nombrePoteaux || '0'}
              />
              <DetailItem
                icon={<RiRulerLine />}
                label="Type de Conducteur"
                value={conductorLabels[line?.type_conducteur] || line?.type_conducteur || 'Non spécifié'}
              />
            </div>
          </div>

          {/* Coordinates Section */}
          <div className="line-details-card">
            <div className="line-details-card-header">
              <RiMapPinLine className="line-details-card-icon" />
              <h3>Coordonnées Géographiques</h3>
            </div>
            <div className="line-details-card-content">
              <div className="line-details-coords-container">
                <DetailItem
                  icon={<RiMapPin2Line />}
                  label="Point de Départ"
                  value={line?.startPoint?.name || 'Non défini'}
                />
                <div className="line-details-sub-coords">
                  <DetailItem
                    icon={<RiMapPin2Line />}
                    label="Latitude Début"
                    value={line?.startPoint?.lat || 'Non spécifiée'}
                    small
                  />
                  <DetailItem
                    icon={<RiMapPin2Line />}
                    label="Longitude Début"
                    value={line?.startPoint?.lng || 'Non spécifiée'}
                    small
                  />
                </div>
              </div>
              <div className="line-details-coords-container">
                <DetailItem
                  icon={<RiMapPin2Line />}
                  label="Point d'Arrivée"
                  value={line?.endPoint?.name || 'Non défini'}
                />
                <div className="line-details-sub-coords">
                  <DetailItem
                    icon={<RiMapPin2Line />}
                    label="Latitude Fin"
                    value={line?.endPoint?.lat || 'Non spécifiée'}
                    small
                  />
                  <DetailItem
                    icon={<RiMapPin2Line />}
                    label="Longitude Fin"
                    value={line?.endPoint?.lng || 'Non spécifiée'}
                    small
                  />
                </div>
              </div>
              <div className="line-details-map-container" aria-label="Carte des coordonnées de la ligne">
                <MapContainer center={center} zoom={13} style={{ height: '100%', width: '100%' }}>
                  <TileLayer
                    url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                    attribution='© <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                  />
                  {line?.startPoint?.lat && line?.startPoint?.lng && (
                    <Marker position={[line.startPoint.lat, line.startPoint.lng]} />
                  )}
                  {line?.endPoint?.lat && line?.endPoint?.lng && (
                    <Marker position={[line.endPoint.lat, line.endPoint.lng]} />
                  )}
                  {polylinePositions.length > 0 && (
                    <Polyline positions={polylinePositions} color="#1ec5f3" />
                  )}
                </MapContainer>
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="line-details-modal-footer">
          <button
            onClick={onClose}
            className="line-details-close-button"
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
    <div className={`line-detail-item ${small ? 'small' : ''}`}>
      <div className="line-detail-icon">{icon}</div>
      <div className="line-detail-content">
        <span className="line-detail-label">{label}</span>
        <span
          className={clsx('line-detail-value', {
            'status-active': status === 'Active',
            'status-panne': status === 'Panne',
            'status-maintenance': status === 'Maintenance',
            'status-inactive': status === 'Inactive',
          })}
          aria-label={`${label}: ${value}`}
        >
          {value}
        </span>
      </div>
    </div>
  );
};

export default LineDetailsModal;