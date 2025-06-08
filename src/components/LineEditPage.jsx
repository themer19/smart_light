import React, { useState, useRef, useEffect } from 'react';
import { useParams, useLocation, useNavigate } from 'react-router-dom';
import { InputText } from 'primereact/inputtext';
import { Dropdown } from 'primereact/dropdown';
import { Button } from 'primereact/button';
import { Toast } from 'primereact/toast';
import { MapContainer, TileLayer, Marker, useMapEvents } from 'react-leaflet';
import L from 'leaflet';
import './LineManagement.css';
import 'leaflet/dist/leaflet.css';

// Corriger l'icône par défaut de Leaflet
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
  iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
});

const LineEditPage = () => {
  const { id } = useParams();
  const { state } = useLocation();
  const navigate = useNavigate();
  const toast = useRef(null);
  const [lineData, setLineData] = useState({
    name: '',
    voltage: '',
    length: '',
    conductorType: '',
    site: '',
    startPoint: { name: '', lat: null, lng: null },
    endPoint: { name: '', lat: null, lng: null },
    status: 'Active',
  });
  const [selectingPoint, setSelectingPoint] = useState(null);
  const [startMarker, setStartMarker] = useState(null);
  const [endMarker, setEndMarker] = useState(null);

  // Pré-remplir les champs
  useEffect(() => {
    if (state?.line) {
      setLineData({
        name: state.line.name || '',
        voltage: state.line.voltage || '',
        length: state.line.length || '',
        conductorType: state.line.conductorType || '',
        site: state.line.site || '',
        startPoint: state.line.startPoint || { name: '', lat: null, lng: null },
        endPoint: state.line.endPoint || { name: '', lat: null, lng: null },
        status: state.line.status || 'Active',
      });
      if (state.line.startPoint?.lat && state.line.startPoint?.lng) {
        setStartMarker([state.line.startPoint.lat, state.line.startPoint.lng]);
      }
      if (state.line.endPoint?.lat && state.line.endPoint?.lng) {
        setEndMarker([state.line.endPoint.lat, state.line.endPoint.lng]);
      }
    }
  }, [state]);

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

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    if (name === 'startPoint' || name === 'endPoint') {
      setLineData((prev) => ({
        ...prev,
        [name]: { ...prev[name], name: value },
      }));
    } else {
      setLineData((prev) => ({ ...prev, [name]: value }));
    }
  };

  const handleSave = () => {
    if (!lineData.name || !lineData.voltage || !lineData.site) {
      toast.current.show({
        severity: 'error',
        summary: 'Erreur',
        detail: 'Les champs Nom, Tension et Site sont obligatoires',
        life: 3000,
      });
      return;
    }
    if (!lineData.startPoint.lat || !lineData.endPoint.lat) {
      toast.current.show({
        severity: 'error',
        summary: 'Erreur',
        detail: "Veuillez sélectionner les localisations pour le point de départ et d'arrivée",
        life: 3000,
      });
      return;
    }

    const updatedLine = {
      _id: id,
      name: lineData.name,
      voltage: lineData.voltage,
      length: lineData.length,
      conductorType: lineData.conductorType,
      site: lineData.site,
      startPoint: lineData.startPoint,
      endPoint: lineData.endPoint,
      status: lineData.status,
    };
    navigate('/lignes', { state: { updatedLine } });
  };

  const handleCancel = () => {
    navigate('/lignes');
  };

  const MapClickHandler = () => {
    useMapEvents({
      click(e) {
        if (selectingPoint) {
          const { lat, lng } = e.latlng;
          setLineData((prev) => ({
            ...prev,
            [selectingPoint]: { ...prev[selectingPoint], lat, lng },
          }));
          if (selectingPoint === 'startPoint') {
            setStartMarker([lat, lng]);
          } else if (selectingPoint === 'endPoint') {
            setEndMarker([lat, lng]);
          }
          setSelectingPoint(null);
        }
      },
    });
    return null;
  };

  // Calculer le centre de la carte
  const center =
    lineData.startPoint.lat && lineData.endPoint.lat
      ? [
          (lineData.startPoint.lat + lineData.endPoint.lat) / 2,
          (lineData.startPoint.lng + lineData.endPoint.lng) / 2,
        ]
      : [48.8566, 2.3522]; // Paris par défaut

  return (
    <div className="modal-container">
      <Toast ref={toast} />
      <div className="modal-header">
        <h2>
          <i className="pi pi-bolt" style={{ marginRight: '10px' }} />
          Modifier la Ligne Électrique
        </h2>
        <button className="close-btn" onClick={handleCancel}>
          <i className="pi pi-times" />
        </button>
      </div>
      <div className="modal-content">
        <div className="line-form">
          <div className="form-row">
            <div className="form-group">
              <label>Nom de la ligne *</label>
              <span className="p-input-icon-left">
                <i className="pi pi-align-left" />
                <InputText
                  name="name"
                  value={lineData.name}
                  onChange={handleInputChange}
                  placeholder="Ligne principale A"
                  required
                  className="p-inputtext-sm"
                />
              </span>
            </div>
            <div className="form-group">
              <label>Tension *</label>
              <div className="dropdown-icon-wrapper">
                <i className="pi pi-bolt dropdown-icon" />
                <Dropdown
                  name="voltage"
                  value={lineData.voltage}
                  options={voltageOptions}
                  onChange={handleInputChange}
                  placeholder="Sélectionnez la tension"
                  className="p-inputtext-sm with-icon"
                  required
                />
              </div>
            </div>
          </div>
          <div className="form-row">
            <div className="form-group">
              <label>Longueur (km)</label>
              <span className="p-input-icon-left">
                <i className="pi pi-arrows-h" />
                <InputText
                  name="length"
                  value={lineData.length}
                  onChange={handleInputChange}
                  placeholder="10.5"
                  keyfilter="num"
                  className="p-inputtext-sm"
                />
              </span>
            </div>
            <div className="form-group">
              <label>Type de conducteur</label>
              <div className="dropdown-icon-wrapper">
                <i className="pi pi-cog dropdown-icon" />
                <Dropdown
                  name="conductorType"
                  value={lineData.conductorType}
                  options={conductorOptions}
                  onChange={handleInputChange}
                  placeholder="Sélectionnez le type"
                  className="p-inputtext-sm with-icon"
                />
              </div>
            </div>
          </div>
          <div className="form-row">
            <div className="form-group">
              <label>Site *</label>
              <div className="dropdown-icon-wrapper">
                <i className="pi pi-building dropdown-icon" />
                <Dropdown
                  name="site"
                  value={lineData.site}
                  options={siteOptions}
                  onChange={handleInputChange}
                  placeholder="Sélectionnez le site"
                  className="p-inputtext-sm with-icon"
                  required
                />
              </div>
            </div>
            <div className="form-group"></div> {/* Placeholder pour alignement */}
          </div>
          <div className="form-group">
            <label>
              <i className="pi pi-map icon" /> Localisation
            </label>
            <div className="map-container">
              <MapContainer
                center={center}
                zoom={13}
                style={{ height: '200px', width: '100%' }}
              >
                <TileLayer
                  url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                  attribution='© <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                />
                <MapClickHandler />
                {startMarker && <Marker position={startMarker} />}
                {endMarker && <Marker position={endMarker} />}
              </MapContainer>
            </div>
            <div className="map-controls">
              <Button
                label="Sélectionner le point de départ"
                icon="pi pi-map-marker"
                className="p-button-text p-button-sm"
                onClick={() => setSelectingPoint('startPoint')}
                disabled={selectingPoint === 'startPoint'}
              />
              <Button
                label="Sélectionner le point d'arrivée"
                icon="pi pi-map-marker"
                className="p-button-text p-button-sm"
                onClick={() => setSelectingPoint('endPoint')}
                disabled={selectingPoint === 'endPoint'}
              />
            </div>
          </div>
          <div className="form-row">
            <div className="form-group">
              <label>Point de départ</label>
              <span className="p-input-icon-left">
                <i className="pi pi-map-marker" />
                <InputText
                  name="startPoint"
                  value={lineData.startPoint.name}
                  onChange={handleInputChange}
                  placeholder="Poste source A"
                  className="p-inputtext-sm"
                />
              </span>
              <span className="p-input-icon-left">
                <i className="pi pi-globe" />
                <InputText
                  value={
                    lineData.startPoint.lat
                      ? `Lat: ${lineData.startPoint.lat}, Lng: ${lineData.startPoint.lng}`
                      : 'Non défini'
                  }
                  readOnly
                  className="p-inputtext-sm coords-input readonly-input"
                />
              </span>
            </div>
            <div className="form-group">
              <label>Point d'arrivée</label>
              <span className="p-input-icon-left">
                <i className="pi pi-map-marker" />
                <InputText
                  name="endPoint"
                  value={lineData.endPoint.name}
                  onChange={handleInputChange}
                  placeholder="Poste de distribution B"
                  className="p-inputtext-sm"
                />
              </span>
              <span className="p-input-icon-left">
                <i className="pi pi-globe" />
                <InputText
                  value={
                    lineData.endPoint.lat
                      ? `Lat: ${lineData.endPoint.lat}, Lng: ${lineData.endPoint.lng}`
                      : 'Non défini'
                  }
                  readOnly
                  className="p-inputtext-sm coords-input readonly-input"
                />
              </span>
            </div>
          </div>
          <div className="form-group">
            <label>Statut</label>
            <div className="dropdown-icon-wrapper">
              <i className="pi pi-check-circle dropdown-icon" />
              <Dropdown
                name="status"
                value={lineData.status}
                options={statusOptions}
                onChange={handleInputChange}
                className="p-inputtext-sm with-icon"
              />
            </div>
          </div>
          <div className="modal-footer">
            <Button
              label="Annuler"
              icon="pi pi-arrow-left"
              className="cancel-btn p-button-text"
              onClick={handleCancel}
            />
            <Button
              label="Modifier"
              icon="pi pi-check"
              className="submit-btn"
              onClick={handleSave}
            />
          </div>
        </div>
      </div>
    </div>
  );
};

export default LineEditPage;