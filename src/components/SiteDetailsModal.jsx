import React from 'react';
import clsx from 'clsx';
import { RiCloseLine, RiMapPinLine, RiBuilding2Line, RiFlashlightLine, RiCalendarLine, RiInformationLine } from 'react-icons/ri';

const SiteDetailsModal = ({ site, onClose }) => {
  return (
    <div className="details-modal-overlay">
      <div className="details-modal-container">
        {/* En-tête avec bouton fermer */}
        <div className="details-modal-header">
          <div className="details-title-container">
            <RiBuilding2Line className="details-main-icon" />
            <h2>Fiche Technique du Site</h2>
          </div>
          <button onClick={onClose} className="details-close-btn">
            <RiCloseLine size={24} />
          </button>
        </div>

        {/* Corps de la modal */}
        <div className="details-modal-body">
          {/* Section Nom et Status */}
          <div className="details-card primary-card">
            <div className="details-card-header">
              <RiInformationLine className="details-card-icon" />
              <h3>Informations Principales</h3>
            </div>
            <div className="details-card-content">
              <DetailItem 
                icon={<RiBuilding2Line />}
                label="Nom du Site"
                value={site.nom}
              />
              <DetailItem 
                icon={<RiFlashlightLine />}
                label="Statut"
                value={site.status}
                status={site.status}
              />
            </div>
          </div>

          {/* Section Localisation */}
          <div className="details-card">
            <div className="details-card-header">
              <RiMapPinLine className="details-card-icon" />
              <h3>Localisation Géographique</h3>
            </div>
            <div className="details-card-content">
              <DetailItem 
                icon={<RiMapPinLine />}
                label="Ville"
                value={site.localisation?.ville || 'Non spécifiée'}
              />
              <div className="details-coords-container">
                <DetailItem 
                  icon={<span>🌐</span>}
                  label="Latitude"
                  value={site.localisation?.latitude || 'Non spécifiée'}
                  small
                />
                <DetailItem 
                  icon={<span>🌐</span>}
                  label="Longitude"
                  value={site.localisation?.longitude || 'Non spécifiée'}
                  small
                />
              </div>
            </div>
          </div>

          {/* Section Métadonnées */}
          <div className="details-card">
            <div className="details-card-header">
              <RiCalendarLine className="details-card-icon" />
              <h3>Métadonnées</h3>
            </div>
            <div className="details-card-content">
              <DetailItem 
                icon={<RiCalendarLine />}
                label="Dernière mise à jour"
                value={new Date(site.derniereMiseAJour).toLocaleDateString('fr-FR', {
                  day: '2-digit',
                  month: 'long',
                  year: 'numeric'
                })}
              />
              {/* Ajouter d'autres métadonnées si nécessaire */}
            </div>
          </div>
        </div>

        {/* Pied de page */}
        <div className="details-modal-footer">
          <button onClick={onClose} className="details-close-button">
            Fermer la fiche technique
          </button>
        </div>
      </div>
    </div>
  );
};

// Composant réutilisable pour les éléments de détail
const DetailItem = ({ icon, label, value, status, small = false }) => {
  return (
    <div className={`detail-item ${small ? 'small' : ''}`}>
      <div className="detail-icon">{icon}</div>
      <div className="detail-content">
        <span className="detail-label">{label}</span>
        <span className={clsx('detail-value', {
          'status-active': status === 'Actif',
          'status-warning': status === 'Panne',
          'status-inactive': status && status !== 'Actif' && status !== 'Panne'
        })}>
          {value}
        </span>
      </div>
    </div>
  );
};

export default SiteDetailsModal;