import React from 'react';
import '../pages/cssP/Eclairage.css';

const EclairageDataPopup = ({ lampadaire, onClose }) => {
  return (
    <div className="ec-modal-overlay">
      <div className="ec-modal-container">
        <div className="ec-modal-header">
          <h2>Détails du Lampadaire : {lampadaire.nom}</h2>
          <i className="ri-close-line" onClick={onClose} />
        </div>
        <div className="ec-modal-body">
          <p><strong>ID :</strong> : {lampadaire._id}</p>
          <p><strong>Site :</strong> : {lampadaire.site?.nom || 'Non attribué'}</p>
          <p><strong>Type :</strong> : {lampadaire.type}</p>
          <p><strong>Puissance :</strong> : {lampadaire.puissance} W</p>
          <p><strong>Statut :</strong> : {lampadaire.statut}</p>
          {lampadaire.localisation && (
            <p>
              <strong>Localisation :</strong> : Lat. {lampadaire.localisation.lat}, Lng. {lampadaire.localisation.lng}
            </p>
          )}
          <p><strong>État actuel :</strong> : {lampadaire.etat === 'allumé' ? '🟢 Allumé' : '🔴 Éteint'}</p>
        </div>
        <div className="ec-modal-footer">
          <button className="ec-btn-secondary" onClick={onClose}>
            Fermer
          </button>
        </div>
      </div>
    </div>
  );
};

export default EclairageDataPopup;