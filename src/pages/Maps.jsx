import React from 'react';
import Sidebar from '../components/Sidebar';
import './cssP/test.css';
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';

// Configuration de l'icône bleue
const BlueIcon = new L.Icon({
  iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-blue.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/0.7.7/images/marker-shadow.png',
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41]
});

function Maps() {
  // Données des sites tunisiens
  const sites = [
    { id: 1, name: 'Site Tunis', location: [36.8065, 10.1815], status: 'actif', lastUpdate: '2023-06-10' },
    { id: 2, name: 'Site Sfax', location: [34.7406, 10.7603], status: 'panne', lastUpdate: '2023-06-11' },
    { id: 3, name: 'Site Sousse', location: [35.8254, 10.6369], status: 'actif', lastUpdate: '2023-06-12' },
    { id: 4, name: 'Site Kairouan', location: [35.6712, 10.1006], status: 'maintenance', lastUpdate: '2023-06-13' },
    { id: 5, name: 'Site Gabès', location: [33.8815, 10.0982], status: 'actif', lastUpdate: '2023-06-14' },
    { id: 6, name: 'Site Bizerte', location: [37.2744, 9.8739], status: 'actif', lastUpdate: '2023-06-15' },
    { id: 7, name: 'Site Monastir', location: [35.7643, 10.8113], status: 'actif', lastUpdate: '2023-06-16' },
    { id: 8, name: 'Site Nabeul', location: [36.4561, 10.7376], status: 'panne', lastUpdate: '2023-06-17' },
    { id: 9, name: 'Site Béja', location: [36.7256, 9.1817], status: 'actif', lastUpdate: '2023-06-18' },
    { id: 10, name: 'Site Jendouba', location: [36.5, 8.7833], status: 'maintenance', lastUpdate: '2023-06-19' },
  ];

  const getStatusColor = (status) => {
    switch(status) {
      case 'actif': return '#48BB78';
      case 'panne': return '#E53E3E';
      case 'maintenance': return '#D69E2E';
      default: return '#718096';
    }
  };

  return (
    <div className="gs-container">
      <Sidebar />
      <main className="gs-main-content">
        <div className="gs-dashboard-card">
          {/* En-tête */}
          <div className="gs-page-header">
  <div className="gs-header-content">
    <div className="gs-title-wrapper">
      <div className="gs-title-icon-container" style={{background: 'linear-gradient(135deg, #ec4899 0%, #db2777 100%)'}}>
        <i className="ri-map-2-line gs-main-icon"></i>
      </div>
      <div>
        <h1 className="gs-main-title">
          Réseau Tunisien
          <span className="gs-title-underline" style={{background: 'linear-gradient(90deg, #ec4899 0%, #db2777 100%)'}}></span>
        </h1>
        <p className="gs-subtitle">Visualisation des sites à travers la Tunisie</p>
      </div>
    </div>
    <button className="gs-add-site-btn gs-btn-primary" style={{background: 'linear-gradient(135deg, #ec4899 0%, #db2777 100%)'}}>
      <i className="ri-map-add-line"></i>
      <span>Ajouter un site</span>
    </button>
  </div>
</div>

          {/* Carte centrée sur la Tunisie */}
          <div className="gs-map-container" style={{
            height: '600px',
            borderRadius: '12px',
            marginTop: '24px',
            boxShadow: '0 1px 3px rgba(0, 0, 0, 0.1)',
            overflow: 'hidden'
          }}>
            <MapContainer 
              center={[34.0, 9.0]} // Centre sur la Tunisie
              zoom={7} // Zoom adapté pour voir tout le pays
              style={{ height: '100%', width: '100%' }}
            >
              <TileLayer
                url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
              />
              
              {/* Marqueurs bleus pour tous les sites */}
              {sites.map(site => (
                <Marker 
                  key={site.id} 
                  position={site.location}
                  icon={BlueIcon} // Utilisation de l'icône bleue
                >
                  <Popup>
                    <div style={{ minWidth: '200px' }}>
                      <h3 style={{ 
                        margin: '0 0 8px 0',
                        color: '#1E293B',
                        fontSize: '1.1rem'
                      }}>
                        {site.name}
                      </h3>
                      <div style={{ 
                        display: 'flex', 
                        alignItems: 'center',
                        marginBottom: '6px'
                      }}>
                        <i className="ri-map-pin-2-fill" style={{ 
                          color: '#3B82F6',
                          marginRight: '8px'
                        }} />
                        <span>{site.location[0].toFixed(4)}, {site.location[1].toFixed(4)}</span>
                      </div>
                      <div style={{ 
                        display: 'flex', 
                        alignItems: 'center',
                        marginBottom: '6px'
                      }}>
                        <i className="ri-time-line" style={{ 
                          color: '#718096',
                          marginRight: '8px'
                        }} />
                        <span>Dernière mise à jour: {site.lastUpdate}</span>
                      </div>
                      <div style={{ 
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between'
                      }}>
                        <span style={{
                          padding: '4px 8px',
                          borderRadius: '12px',
                          backgroundColor: site.status === 'actif' ? '#C6F6D5' : 
                                         site.status === 'panne' ? '#FED7D7' : '#FEFCBF',
                          color: site.status === 'actif' ? '#22543D' : 
                                site.status === 'panne' ? '#822727' : '#744210',
                          fontSize: '0.8rem',
                          textTransform: 'capitalize'
                        }}>
                          {site.status}
                        </span>
                        <div style={{ display: 'flex', gap: '8px' }}>
                          <button style={{
                            background: '#EBF8FF',
                            color: '#4299E1',
                            border: 'none',
                            borderRadius: '50%',
                            width: '28px',
                            height: '28px',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            cursor: 'pointer'
                          }}>
                            <i className="ri-edit-line" style={{ fontSize: '0.9rem' }} />
                          </button>
                          <button style={{
                            background: '#FFF5F5',
                            color: '#F56565',
                            border: 'none',
                            borderRadius: '50%',
                            width: '28px',
                            height: '28px',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            cursor: 'pointer'
                          }}>
                            <i className="ri-delete-bin-line" style={{ fontSize: '0.9rem' }} />
                          </button>
                        </div>
                      </div>
                    </div>
                  </Popup>
                </Marker>
              ))}
            </MapContainer>
          </div>

          {/* Légende */}
          <div className="gs-map-legend" style={{ 
            display: 'flex', 
            gap: '16px',
            marginTop: '16px',
            padding: '12px',
            background: '#F8FAFC',
            borderRadius: '8px'
          }}>
            <div style={{ display: 'flex', alignItems: 'center' }}>
              <img 
                src="https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-blue.png" 
                alt="Site" 
                style={{ width: '20px', marginRight: '6px' }} 
              />
              <span>Sites tunisiens</span>
            </div>
            <div style={{ display: 'flex', alignItems: 'center' }}>
              <span style={{
                display: 'inline-block',
                width: '12px',
                height: '12px',
                borderRadius: '50%',
                backgroundColor: '#48BB78',
                marginRight: '6px'
              }}></span>
              <span>Actif</span>
            </div>
            <div style={{ display: 'flex', alignItems: 'center' }}>
              <span style={{
                display: 'inline-block',
                width: '12px',
                height: '12px',
                borderRadius: '50%',
                backgroundColor: '#E53E3E',
                marginRight: '6px'
              }}></span>
              <span>Panne</span>
            </div>
            <div style={{ display: 'flex', alignItems: 'center' }}>
              <span style={{
                display: 'inline-block',
                width: '12px',
                height: '12px',
                borderRadius: '50%',
                backgroundColor: '#D69E2E',
                marginRight: '6px'
              }}></span>
              <span>Maintenance</span>
            </div>
          </div>

          {/* Contrôles de la carte */}
          <div className="gs-table-footer" style={{ 
            marginTop: '16px',
            justifyContent: 'space-between'
          }}>
            <div className="gs-pagination-info" style={{ color: '#64748B' }}>
              {sites.length} sites affichés sur la carte
            </div>
            <div className="gs-filter-group" style={{ display: 'flex', gap: '8px' }}>
              <button className="gs-filter-btn gs-btn-secondary" style={{
                background: 'white',
                color: '#3B82F6',
                border: '1px solid #E2E8F0',
                borderRadius: '8px',
                padding: '8px 12px',
                display: 'flex',
                alignItems: 'center',
                gap: '6px',
                fontSize: '0.9rem',
                fontWeight: 500,
                cursor: 'pointer'
              }}>
                <i className="ri-filter-3-line"></i>
                <span>Filtrer par statut</span>
              </button>
              <button className="gs-sort-btn gs-btn-secondary" style={{
                background: 'white',
                color: '#3B82F6',
                border: '1px solid #E2E8F0',
                borderRadius: '8px',
                padding: '8px 12px',
                display: 'flex',
                alignItems: 'center',
                gap: '6px',
                fontSize: '0.9rem',
                fontWeight: 500,
                cursor: 'pointer'
              }}>
                <i className="ri-download-line"></i>
                <span>Exporter</span>
              </button>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}

export default Maps;