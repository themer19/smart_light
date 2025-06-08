import React from 'react';
import PropTypes from 'prop-types';
import clsx from 'clsx';
import { RiCloseLine, RiMapPinLine, RiBuilding2Line, RiFlashlightLine, RiCalendarLine, RiInformationLine } from 'react-icons/ri';
import './SiteDetailsModal.css';

// Centralized status labels for consistency with LineDetailsModal
const statusLabels = {
  Actif: 'Actif',
  Panne: 'Hors service',
  Maintenance: 'En maintenance',
};

// Reusable DetailItem component
const DetailItem = ({ icon, label, value, status, small = false }) => {
  return (
    <div className={`site-detail-item ${small ? 'small' : ''}`}>
      <div className="site-detail-icon">{icon}</div>
      <div className="site-detail-content">
        <span className="site-detail-label">{label}</span>
        <span
          className={clsx('site-detail-value', {
            'status-active': status === 'Actif',
            'status-warning': status === 'Panne',
            'status-maintenance': status === 'Maintenance',
          })}
        >
          {value}
        </span>
      </div>
    </div>
  );
};

DetailItem.propTypes = {
  icon: PropTypes.node.isRequired,
  label: PropTypes.string.isRequired,
  value: PropTypes.string.isRequired,
  status: PropTypes.string,
  small: PropTypes.bool,
};

const SiteDetailsModal = ({ site, onClose }) => {
  // Fallback for empty site
  if (!site) {
    return null;
  }

  return (
    <div className="site-details-modal-overlay">
      <div className="site-details-modal-container">
        {/* Section: Header */}
        <div className="site-details-modal-header">
          <div className="site-details-title-container">
            <RiBuilding2Line className="site-details-main-icon" />
            <h2>Fiche Technique du Site</h2>
          </div>
          <button onClick={onClose} className="site-details-close-btn">
            <RiCloseLine size={24} />
          </button>
        </div>

        {/* Section: Body */}
        <div className="site-details-modal-body">
          {/* Card: Main Information */}
          <div className="site-details-card primary-card">
            <div className="site-details-card-header">
              <RiInformationLine className="site-details-card-icon" />
              <h3>Informations Principales</h3>
            </div>
            <div className="site-details-card-content">
              <DetailItem
                icon={<RiBuilding2Line />}
                label="Nom du Site"
                value={site.nom || 'Non spécifié'}
              />
              <DetailItem
                icon={<RiFlashlightLine />}
                label="Statut"
                value={statusLabels[site.status] || site.status || 'Non spécifié'}
                status={site.status}
              />
            </div>
          </div>

          {/* Card: Geographic Location */}
          <div className="site-details-card">
            <div className="site-details-card-header">
              <RiMapPinLine className="site-details-card-icon" />
              <h3>Localisation Géographique</h3>
            </div>
            <div className="site-details-card-content">
              <DetailItem
                icon={<RiMapPinLine />}
                label="Ville"
                value={site.localisation?.ville || 'Non spécifiée'}
              />
              <div className="site-details-coords-container">
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

          {/* Card: Metadata */}
          <div className="site-details-card">
            <div className="site-details-card-header">
              <RiCalendarLine className="site-details-card-icon" />
              <h3>Métadonnées</h3>
            </div>
            <div className="site-details-card-content">
              <DetailItem
                icon={<RiCalendarLine />}
                label="Dernière mise à jour"
                value={
                  site.derniereMiseAJour
                    ? new Date(site.derniereMiseAJour).toLocaleDateString('fr-FR', {
                        day: '2-digit',
                        month: 'long',
                        year: 'numeric',
                      })
                    : 'Non spécifiée'
                }
              />
            </div>
          </div>
        </div>

        {/* Section: Footer */}
        <div className="site-details-modal-footer">
          <button onClick={onClose} className="site-details-close-button">
            Fermer la fiche technique
          </button>
        </div>
      </div>
    </div>
  );
};

SiteDetailsModal.propTypes = {
  site: PropTypes.shape({
    nom: PropTypes.string,
    status: PropTypes.string,
    localisation: PropTypes.shape({
      ville: PropTypes.string,
      latitude: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
      longitude: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
    }),
    derniereMiseAJour: PropTypes.string,
  }),
  onClose: PropTypes.func.isRequired,
};

SiteDetailsModal.defaultProps = {
  site: {
    nom: 'Non spécifié',
    status: 'Non spécifié',
    localisation: {
      ville: 'Non spécifiée',
      latitude: 'Non spécifiée',
      longitude: 'Non spécifiée',
    },
    derniereMiseAJour: null,
  },
};

export default SiteDetailsModal;