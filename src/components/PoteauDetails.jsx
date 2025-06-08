import React, { useState } from 'react';
import './PoteauModal.css';

const PoteauDetails = ({ onClose, onEdit, poteauData }) => {
  const [activeTab, setActiveTab] = useState('details');

  return (
    <div className="poteaux-details-overlay">
      <div className="poteaux-details-container">
        <div className="poteaux-details-header">
          <h2>
            <i className="ri-lightbulb-line" style={{ marginRight: '10px' }} />
            Détails du Poteau
          </h2>
          <button className="poteaux-details-close-btn" onClick={onClose} aria-label="Fermer la page des détails">
            <i className="ri-close-line" />
          </button>
        </div>
        <div className="poteaux-details-tabs">
          <button
            className={`poteaux-details-tab ${activeTab === 'details' ? 'active' : ''}`}
            onClick={() => setActiveTab('details')}
          >
            Détails
          </button>
          <button
            className={`poteaux-details-tab ${activeTab === 'carte' ? 'active' : ''}`}
            onClick={() => setActiveTab('carte')}
          >
            Carte
          </button>
        </div>
        <div className="poteaux-details-content">
          {activeTab === 'details' ? (
            <div className="poteaux-details-form">
              <div className="poteaux-details-section">
                <h3 className="poteaux-details-section-title">Identification</h3>
                <div className="poteaux-details-field-list">
                  <div className="poteaux-details-field">
                    <label id="nom-label">Nom du poteau</label>
                    <div
                      className={`poteaux-details-value ${!poteauData.nom ? 'poteaux-details-value-empty' : ''}`}
                      aria-describedby="nom-label"
                    >
                      <i className="ri-align-left" />
                      {poteauData.nom || 'Non défini'}
                    </div>
                  </div>
                  <div className="poteaux-details-field">
                    <label id="code-label">Code</label>
                    <div
                      className={`poteaux-details-value ${!poteauData.code ? 'poteaux-details-value-empty' : ''}`}
                      aria-describedby="code-label"
                    >
                      <i className="ri-barcode-line" />
                      {poteauData.code || 'Non défini'}
                    </div>
                  </div>
                </div>
              </div>
              <div className="poteaux-details-section">
                <h3 className="poteaux-details-section-title">Localisation</h3>
                <div className="poteaux-details-field-list">
                  <div className="poteaux-details-field">
                    <label id="site-label">Site associé</label>
                    <div
                      className={`poteaux-details-value ${!poteauData.site ? 'poteaux-details-value-empty' : ''}`}
                      aria-describedby="site-label"
                    >
                      <i className="ri-building-4-line" />
                      {poteauData.site || 'Non défini'}
                    </div>
                  </div>
                  <div className="poteaux-details-field">
                    <label id="ligne-label">Ligne associée</label>
                    <div
                      className={`poteaux-details-value ${!poteauData.ligne ? 'poteaux-details-value-empty' : ''}`}
                      aria-describedby="ligne-label"
                    >
                      <i className="ri-git-branch-line" />
                      {poteauData.ligne || 'Non défini'}
                    </div>
                  </div>
                </div>
              </div>
              <div className="poteaux-details-section">
                <h3 className="poteaux-details-section-title">État</h3>
                <div className="poteaux-details-field-list">
                  <div className="poteaux-details-field">
                    <label id="statut-label">Statut</label>
                    <div
                      className={`poteaux-details-value ${!poteauData.statut ? 'poteaux-details-value-empty' : ''}`}
                      aria-describedby="statut-label"
                    >
                      <i className="ri-checkbox-circle-line" />
                      {poteauData.statut || 'Non défini'}
                    </div>
                  </div>
                  <div className="poteaux-details-field">
                    <label id="luminosite-label">Niveau de Lumière (%)</label>
                    <div className="poteaux-details-value" aria-describedby="luminosite-label">
                      <i className="ri-sun-line" />
                      <div className="poteaux-details-luminosite-container">
                        <div
                          className="poteaux-details-luminosite-bar"
                          style={{ width: `${poteauData.luminosite ?? 0}%` }}
                        ></div>
                        <span>{poteauData.luminosite ?? '0'}%</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          ) : (
            <div className="poteaux-details-map-section">
              <div className="poteaux-details-map-container">
                <div className="poteaux-details-map-placeholder">
                  <i className="ri-map-pin-line" />
                  <p>Carte en cours de développement</p>
                </div>
              </div>
              <div className="poteaux-details-coordinates-info">
                Latitude: Non défini | Longitude: Non défini
              </div>
            </div>
          )}
        </div>
        <div className="poteaux-details-footer">
          <button
            className="poteaux-details-close-btn"
            onClick={onClose}
            aria-label="Fermer la page des détails"
          >
            Fermer
          </button>
          <button
            className="poteaux-details-edit-btn"
            onClick={() => onEdit(poteauData)}
            aria-label="Modifier le poteau"
          >
            Modifier
          </button>
        </div>
      </div>
    </div>
  );
};

export default PoteauDetails;