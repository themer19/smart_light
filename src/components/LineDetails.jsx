import React from 'react';
import { Dialog } from 'primereact/dialog';
import { InputText } from 'primereact/inputtext';
import { Button } from 'primereact/button';
import { MapContainer, TileLayer, Marker } from 'react-leaflet';
import L from 'leaflet';
import './LineManagement.css'; // Réutiliser le même CSS
import 'leaflet/dist/leaflet.css';

// Corriger l'icône par défaut de Leaflet
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
  iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
});

const LineDetails = ({ visible, onHide, line }) => {
  // Options pour afficher les labels des Dropdown
  const voltageOptions = [
    { label: 'Basse Tension (BT)', value: 'BT' },
    { label: 'Moyenne Tension (MT)', value: 'MT' },
    { label: 'Haute Tension (HT)', value: 'HT' },
    { label: 'Très Haute Tension (THT)', value: 'THT' },
  ];

  const conductorOptions = [
    { label: 'Cuivre', value: 'copper' },
    { label: 'Aluminium', value: 'aluminum' },
    { label: 'ACSR', value: 'acsr' },
    { label: 'AAAC', value: 'aaac' },
  ];

  const siteOptions = [
    { label: 'Site A', value: 'site_a' },
    { label: 'Site B', value: 'site_b' },
    { label: 'Site C', value: 'site_c' },
    { label: 'Site D', value: 'site_d' },
  ];

  const statusOptions = [
    { label: 'Active', value: 'Active' },
    { label: 'En maintenance', value: 'Maintenance' },
    { label: 'Hors service', value: 'Inactive' },
  ];

  // Trouver les labels pour les valeurs
  const getLabel = (value, options) => {
    const option = options.find((opt) => opt.value === value);
    return option ? option.label : value || 'Non défini';
  };

  // Calculer le centre de la carte
  const center =
    line?.startPoint?.lat && line?.endPoint?.lat
      ? [
          (line.startPoint.lat + line.endPoint.lat) / 2,
          (line.startPoint.lng + line.endPoint.lng) / 2,
        ]
      : [48.8566, 2.3522]; // Paris par défaut

  return (
    <Dialog
      header={
        <div className="modal-header">
          <h2>
            <i className="pi pi-bolt" style={{ marginRight: '10px' }} />
            Détails de la Ligne Électrique
          </h2>
          <button className="close-btn" onClick={onHide}>
            <i className="pi pi-times" />
          </button>
        </div>
      }
      visible={visible}
      style={{ width: '650px' }}
      onHide={onHide}
      className="line-management-dialog"
      contentClassName="modal-container"
      closable={false}
    >
      <div className="modal-content">
        <div className="line-form">
          <div className="form-row">
            <div className="form-group">
              <label>Nom de la ligne</label>
              <span className="p-input-icon-left">
                <i className="pi pi-align-left" />
                <InputText
                  value={line?.name || 'Non défini'}
                  readOnly
                  className="p-inputtext-sm readonly-input"
                />
              </span>
            </div>

            <div className="form-group">
              <label>Tension</label>
              <span className="p-input-icon-left">
                <i className="pi pi-bolt" />
                <InputText
                  value={getLabel(line?.voltage, voltageOptions)}
                  readOnly
                  className="p-inputtext-sm readonly-input"
                />
              </span>
            </div>
          </div>

          <div className="form-row">
            <div className="form-group">
              <label>Longueur (km)</label>
              <span className="p-input-icon-left">
                <i className="pi pi-arrows-h" />
                <InputText
                  value={line?.lengthKm || 'Non défini'}
                  readOnly
                  className="p-inputtext-sm readonly-input"
                />
              </span>
            </div>

            <div className="form-group">
              <label>Type de conducteur</label>
              <span className="p-input-icon-left">
                <i className="pi pi-cog" />
                <InputText
                  value={getLabel(line?.conductorType, conductorOptions)}
                  readOnly
                  className="p-inputtext-sm readonly-input"
                />
              </span>
            </div>
          </div>

          <div className="form-row">
            <div className="form-group">
              <label>Site</label>
              <span className="p-input-icon-left">
                <i className="pi pi-building" />
                <InputText
                  value={getLabel(line?.site, siteOptions)}
                  readOnly
                  className="p-inputtext-sm readonly-input"
                />
              </span>
            </div>
            <div className="form-group"></div> {/* Placeholder pour alignement */}
          </div>

          <div className="form-group">
            <label>
              <i className="pi pi-map icon" /> Localisation
            </label>
            <div className="map-container">
              <MapContainer center={center} zoom={13} style={{ height: '200px', width: '100%' }}>
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
              </MapContainer>
            </div>
          </div>

          <div className="form-row">
            <div className="form-group">
              <label>Point de départ</label>
              <span className="p-input-icon-left">
                <i className="pi pi-map-marker" />
                <InputText
                  value={line?.startPoint?.name || 'Non défini'}
                  readOnly
                  className="p-inputtext-sm readonly-input"
                />
              </span>
              <span className="p-input-icon-left">
                <i className="pi pi-globe" />
                <InputText
                  value={
                    line?.startPoint?.lat
                      ? `Lat: ${line.startPoint.lat}, Lng: ${line.startPoint.lng}`
                      : 'Non défini'
                  }
                  readOnly
                  className="p-inputtext-sm readonly-input coords-input"
                />
              </span>
            </div>

            <div className="form-group">
              <label>Point d'arrivée</label>
              <span className="p-input-icon-left">
                <i className="pi pi-map-marker" />
                <InputText
                  value={line?.endPoint?.name || 'Non défini'}
                  readOnly
                  className="p-inputtext-sm readonly-input"
                />
              </span>
              <span className="p-input-icon-left">
                <i className="pi pi-globe" />
                <InputText
                  value={
                    line?.endPoint?.lat
                      ? `Lat: ${line.endPoint.lat}, Lng: ${line.endPoint.lng}`
                      : 'Non défini'
                  }
                  readOnly
                  className="p-inputtext-sm readonly-input coords-input"
                />
              </span>
            </div>
          </div>

          <div className="form-group">
            <label>Statut</label>
            <span className="p-input-icon-left">
              <i className="pi pi-check-circle" />
              <InputText
                value={getLabel(line?.status, statusOptions)}
                readOnly
                className="p-inputtext-sm readonly-input"
              />
            </span>
          </div>

          <div className="modal-footer">
            <Button
              label="Retour"
              icon="pi pi-arrow-left"
              className="cancel-btn p-button-text"
              onClick={onHide}
            />
          </div>
        </div>
      </div>
    </Dialog>
  );
};
export default LineDetails;
