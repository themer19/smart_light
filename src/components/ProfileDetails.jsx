import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { 
  RiUserLine, RiCalendarLine, RiMailLine, RiPhoneLine, 
  RiHome4Line, RiShieldUserLine, RiCheckboxCircleLine, 
  RiFileTextLine, RiTimeLine, RiCloseLine, RiArrowDownSLine 
} from 'react-icons/ri';
import defaultProfileImage from '../assets/homme2.png';
import './ProfileDetails.css';

const DetailField = ({ label, value, icon: Icon, emptyText = 'Non défini', format }) => (
  <div className="profile-details-field">
    <label className="field-label">{label}</label>
    <div className={`profile-details-value ${!value ? 'profile-details-value-empty' : ''}`}>
      <Icon className="field-icon" />
      <span className="field-value">{value ? (format ? format(value) : value) : emptyText}</span>
    </div>
  </div>
);

const StatusField = ({ estActif }) => (
  <div className="profile-details-field">
    <label className="field-label">Statut</label>
    <div className={`profile-details-value ${estActif === undefined ? 'profile-details-value-empty' : ''}`}>
      <RiCheckboxCircleLine className="field-icon" />
      <span className={`profile-details-status-badge ${estActif ? 'active' : 'inactive'}`}>
        {estActif === undefined ? 'Non défini' : estActif ? 'Actif' : 'Inactif'}
      </span>
    </div>
  </div>
);

const ProfileDetails = ({ onClose, onEdit, profileData }) => {
  const [licences, setLicences] = useState([]);
  const [selectedLicence, setSelectedLicence] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Formater les dates
  const formatDate = (dateStr) => {
    if (!dateStr) return 'Non défini';
    const date = new Date(dateStr);
    return date.toLocaleDateString('fr-FR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
    });
  };

  // Gérer le changement de licence sélectionnée
  const handleLicenceChange = (e) => {
    const selected = licences.find((l) => l._id === e.target.value) || null;
    setSelectedLicence(selected);
  };

  // Formater le champ licence comme liste déroulante
  const formatLicence = (licences) => {
    if (!licences || licences.length === 0) {
      return <span className="profile-details-value-empty">Aucune licence</span>;
    }

    return (
      <div className="licence-select-wrapper">
        <div className="licence-select-container">
          <select
            className="licence-select"
            value={selectedLicence?._id || ''}
            onChange={handleLicenceChange}
            aria-label="Sélectionner une licence"
          >
            <option value="">Toutes les licences ({licences.length})</option>
            {licences.map((licence) => (
              <option key={licence._id} value={licence._id}>
                {licence.nom || `Licence ${licence._id.slice(-4)}`} • {licence.statut || 'Statut inconnu'} • {licence.identifiantUnique ? `N°: ${licence.identifiantUnique}` : 'Sans numéro'}
              </option>
            ))}
          </select>
          <RiArrowDownSLine className="licence-select-icon" />
        </div>
        
        {licences.length > 1 && (
          <div className="licence-count-badge">
            <span>{licences.length} licences disponibles</span>
          </div>
        )}
      </div>
    );
  };

  // Récupérer les licences depuis l'API
  useEffect(() => {
    const fetchLicences = async () => {
      if (!profileData.licence || !Array.isArray(profileData.licence) || profileData.licence.length === 0) {
        setLicences([]);
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        const response = await axios.post('http://localhost:5000/api/licences/by-ids', {
          ids: profileData.licence,
        });
        setLicences(response.data);
        // Sélectionner la première licence par défaut si disponible
        if (response.data.length > 0) {
          setSelectedLicence(response.data[0]);
        }
        setLoading(false);
      } catch (err) {
        console.error('Erreur lors de la récupération des licences:', err);
        setError('Impossible de charger les licences.');
        setLoading(false);
      }
    };

    fetchLicences();
  }, [profileData.licence]);

  // Gestion des états de chargement et d'erreur
  if (loading) {
    return (
      <div className="profile-details-overlay">
        <div className="profile-details-container">
          <div className="profile-details-content">
            <p>Chargement des licences...</p>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="profile-details-overlay">
        <div className="profile-details-container">
          <div className="profile-details-content">
            <p>{error}</p>
            <button className="profile-details-close-btn" onClick={onClose}>
              <RiCloseLine />
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="profile-details-overlay">
      <div className="profile-details-container">
        {/* En-tête */}
        <div className="profile-details-header">
          <h2>
            <RiUserLine className="header-icon" />
            Détails du Profil
          </h2>
          <button
            className="profile-details-close-btn"
            onClick={onClose}
            aria-label="Fermer les détails du profil"
          >
            <RiCloseLine />
          </button>
        </div>

        <div className="profile-details-content">
          <div className="profile-details-form">
            <div className="profile-details-profile-picture">
              <img
                src={profileData.photo || defaultProfileImage}
                alt="Photo de profil"
                className="profile-details-profile-image"
              />
            </div>

            <div className="profile-details-section">
              <h3 className="profile-details-section-title">Informations personnelles</h3>
              <div className="profile-details-field-list">
                <DetailField label="Nom" value={profileData.nom} icon={RiUserLine} />
                <DetailField label="Prénom" value={profileData.prenom} icon={RiUserLine} />
                <DetailField
                  label="Date de naissance"
                  value={profileData.dateNaissance}
                  icon={RiCalendarLine}
                  format={formatDate}
                />
              </div>
            </div>

            <div className="profile-details-section">
              <h3 className="profile-details-section-title">Contact</h3>
              <div className="profile-details-field-list">
                <DetailField label="Email" value={profileData.email} icon={RiMailLine} />
                <DetailField label="Téléphone" value={profileData.telephone} icon={RiPhoneLine} />
                <DetailField label="Adresse" value={profileData.adresse} icon={RiHome4Line} />
              </div>
            </div>

            <div className="profile-details-section">
              <h3 className="profile-details-section-title">Professionnel</h3>
              <div className="profile-details-field-list">
                <DetailField label="Rôle" value={profileData.role} icon={RiShieldUserLine} />
                <StatusField estActif={profileData.estActif} />
                <div className="profile-details-field">
                  <label className="field-label">Licence</label>
                  <div
                    className={`profile-details-value ${!licences || licences.length === 0 ? 'profile-details-value-empty' : ''}`}
                  >
                    <RiFileTextLine className="field-icon" />
                    {formatLicence(licences)}
                  </div>
                </div>
              </div>
            </div>

            <div className="profile-details-section">
              <h3 className="profile-details-section-title">Activité</h3>
              <div className="profile-details-field-list">
                <DetailField
                  label="Date de création du compte"
                  value={profileData.dateCreation}
                  icon={RiTimeLine}
                  format={formatDate}
                />
                <DetailField
                  label="Dernière connexion"
                  value={profileData.derniereConnexion}
                  icon={RiTimeLine}
                  format={formatDate}
                />
              </div>
            </div>
          </div>
        </div>

        <div className="profile-details-footer">
          <button className="profile-details-edit-btn" onClick={onClose}>
          Fermer
          </button>
        </div>
      </div>
    </div>
  );
};

export default ProfileDetails;