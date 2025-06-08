import React, { useState, useRef, useEffect } from 'react';
import { InputText } from 'primereact/inputtext';
import { Dropdown } from 'primereact/dropdown';
import { Toast } from 'primereact/toast';
import axios from 'axios';
import 'primereact/resources/themes/saga-green/theme.css';
import 'primereact/resources/primereact.min.css';
import './AddLicencePage.css';

const AddLicencePage = ({ onClose, onSave, utilisateurNom, utilisateurId ,utilisateurEmail}) => {
  const toast = useRef(null);
  const [licenceData, setLicenceData] = useState({
    nom: '',
    responsable: '',
    statut: 'Active',
    type: 'Public',
    cleLicence: '',
    zone: '',
    dateExpiration: '',
    lampadairesMax: '',
    identifiantUnique: '',
    appareils: [],
    utilisateurId: utilisateurId || '',
  });
  const [newAppareil, setNewAppareil] = useState({ nom: '', identifiant: '' });
  const [isLoading, setIsLoading] = useState(false);

  const responsableOptions = [
    { label: 'Admin', value: 'Admin' },
    { label: 'Technicien', value: 'Technicien' },
    { label: 'Superviseur', value: 'Superviseur' },
  ];

  const statutOptions = [
    { label: 'Active', value: 'Active' },
    { label: 'Inactive', value: 'Inactive' },
  ];

  const zoneOptions = [
    { label: 'Zone Urbaine A', value: 'Zone Urbaine A' },
    { label: 'Zone Urbaine B', value: 'Zone Urbaine B' },
    { label: 'Zone Rurale C', value: 'Zone Rurale C' },
  ];

  const typeOptions = [
    { label: 'Public', value: 'Public' },
    { label: 'Privé', value: 'Privé' },
    { label: 'Résidentiel', value: 'Résidentiel' },
  ];

  useEffect(() => {
    const fetchLicenceKeys = async () => {
      try {
        const res = await axios.get('http://localhost:5000/api/licences/key');
        const { cleLicence, identifiantUnique } = res.data;

        const now = new Date();
        const nextYear = new Date(now.setFullYear(now.getFullYear() + 1));
        const dateExpiration = nextYear.toISOString().split('T')[0];
        setLicenceData((prev) => ({
          ...prev,
          cleLicence,
          identifiantUnique,
          dateExpiration,
        }));
      } catch (error) {
        console.error('Erreur lors de la génération de la clé :', error.response?.data || error.message);
        toast.current?.show({
          severity: 'error',
          summary: 'Erreur',
          detail: 'Impossible de générer une clé de licence',
          life: 3000,
        });
      }
    };

    fetchLicenceKeys();
  }, []);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    if (name === 'lampadairesMax') {
      const numValue = parseInt(value);
      setLicenceData((prev) => ({
        ...prev,
        [name]: isNaN(numValue) || numValue < 0 ? '' : numValue,
      }));
    } else {
      setLicenceData((prev) => ({ ...prev, [name]: value }));
    }
  };

  const handleAppareilChange = (e) => {
    const { name, value } = e.target;
    setNewAppareil((prev) => ({ ...prev, [name]: value }));
  };

  const addAppareil = () => {
    if (!newAppareil.nom || !newAppareil.identifiant) {
      toast.current.show({
        severity: 'error',
        summary: 'Erreur',
        detail: "Le nom et l'identifiant de l'appareil sont obligatoires",
        life: 3000,
      });
      return;
    }
    setLicenceData((prev) => ({
      ...prev,
      appareils: [...prev.appareils, { ...newAppareil }],
    }));
    setNewAppareil({ nom: '', identifiant: '' });
  };

  const removeAppareil = (index) => {
    setLicenceData((prev) => ({
      ...prev,
      appareils: prev.appareils.filter((_, i) => i !== index),
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const { nom, responsable, statut, type, cleLicence, zone, dateExpiration, lampadairesMax, identifiantUnique, utilisateurId } = licenceData;

    if (!nom || !responsable || !statut || !type || !cleLicence || !zone || !dateExpiration || !lampadairesMax || !identifiantUnique || !utilisateurId) {
      toast.current.show({
        severity: 'error',
        summary: 'Erreur',
        detail: 'Tous les champs obligatoires doivent être remplis',
        life: 3000,
      });
      return;
    }

    setIsLoading(true);
    try {
      console.log('Envoi des données à l\'API :', licenceData);
      const res = await axios.post('http://localhost:5000/api/licences/', licenceData);
      
      if (utilisateurEmail) {
        try {
          await axios.post('http://localhost:5000/api/users/envoyer-info-licence', {
            email: utilisateurEmail,
            licenceType: type,
            nomClient: utilisateurNom
          });
          
          console.log('Email de licence envoyé avec succès');
        } catch (emailError) {
          console.error('Erreur lors de l\'envoi de l\'email:', emailError);
          // Ne pas bloquer le flux principal pour une erreur d'email
          toast.current.show({
            severity: 'warn',
            summary: 'Avertissement',
            detail: 'Licence créée mais échec de l\'envoi de l\'email',
            life: 3000,
          });
        }
      }
      toast.current.show({
        severity: 'success',
        summary: 'Succès',
        detail: utilisateurNom ? 'Licence attribuée avec succès' : 'Licence ajoutée avec succès',
        life: 3000,
      });

      if (onSave) onSave(res.data);
      if (onClose) onClose();
    } catch (error) {
      console.error('Erreur lors de l\'enregistrement :', error.response?.data || error.message);
      toast.current.show({
        severity: 'error',
        summary: 'Erreur',
        detail: error.response?.data?.message || 'Erreur lors de l\'ajout de la licence',
        life: 3000,
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="add-licence-modal-overlay">
      <Toast ref={toast} />
      <div className="add-licence-container">
        <div className="add-licence-header">
          <h2>
            <i className="ri-key-2-line" />
            {utilisateurNom ? `Attribuer une Licence à ${utilisateurNom}` : 'Ajouter une Nouvelle Licence'}
          </h2>
          <button
            className="add-licence-close-btn"
            onClick={onClose}
            aria-label="Fermer la fenêtre"
          >
            <i className="ri-close-line" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="add-licence-form-container">
          <div className="add-licence-content">
            <div className="add-licence-section">
              <h3 className="add-licence-section-title">
                <i className="ri-information-line" /> Informations générales
              </h3>
              <div className="add-licence-form-grid">
                <div className="add-licence-form-group">
                  <label htmlFor="nom">
                    <i className="ri-text" /> Nom de la licence *
                  </label>
                  <InputText
                    id="nom"
                    name="nom"
                    value={licenceData.nom}
                    onChange={handleInputChange}
                    placeholder="Licence Éclairage Pro"
                    required
                  />
                </div>

                <div className="add-licence-form-group">
                  <label htmlFor="responsable">
                    <i className="ri-user-3-line" /> Rôle *
                  </label>
                  <Dropdown
                    id="responsable"
                    name="responsable"
                    value={licenceData.responsable}
                    options={responsableOptions}
                    onChange={handleInputChange}
                    placeholder="Sélectionnez le rôle"
                    required
                  />
                </div>

                <div className="add-licence-form-group">
                  <label htmlFor="statut">
                    <i className="ri-checkbox-circle-line" /> Statut *
                  </label>
                  <Dropdown
                    id="statut"
                    name="statut"
                    value={licenceData.statut}
                    options={statutOptions}
                    onChange={handleInputChange}
                    placeholder="Sélectionnez le statut"
                    required
                  />
                </div>

                <div className="add-licence-form-group">
                  <label htmlFor="type">
                    <i className="ri-building-line" /> Type *
                  </label>
                  <Dropdown
                    id="type"
                    name="type"
                    value={licenceData.type}
                    options={typeOptions}
                    onChange={handleInputChange}
                    placeholder="Sélectionnez le type"
                    required
                  />
                </div>

                <div className="add-licence-form-group">
                  <label htmlFor="zone">
                    <i className="ri-map-pin-line" /> Zone *
                  </label>
                  <Dropdown
                    id="zone"
                    name="zone"
                    value={licenceData.zone}
                    options={zoneOptions}
                    onChange={handleInputChange}
                    placeholder="Sélectionnez la zone"
                    required
                  />
                </div>
              </div>
            </div>

            <div className="add-licence-section">
              <h3 className="add-licence-section-title">
                <i className="ri-settings-3-line" /> Détails techniques
              </h3>
              <div className="add-licence-form-grid">
                <div className="add-licence-form-group">
                  <label htmlFor="cleLicence">
                    <i className="ri-key-2-line" /> Clé de licence *
                  </label>
                  <InputText
                    id="cleLicence"
                    name="cleLicence"
                    value={licenceData.cleLicence}
                    onChange={handleInputChange}
                    readOnly
                    required
                  />
                </div>

                <div className="add-licence-form-group">
                  <label htmlFor="identifiantUnique">
                    <i className="ri-fingerprint-line" /> Identifiant Unique *
                  </label>
                  <InputText
                    id="identifiantUnique"
                    name="identifiantUnique"
                    value={licenceData.identifiantUnique}
                    onChange={handleInputChange}
                    readOnly
                    required
                  />
                </div>

                <div className="add-licence-form-group">
                  <label htmlFor="dateExpiration">
                    <i className="ri-calendar-line" /> Date d'expiration *
                  </label>
                  <InputText
                    id="dateExpiration"
                    name="dateExpiration"
                    type="date"
                    value={licenceData.dateExpiration}
                    onChange={handleInputChange}
                    required
                  />
                </div>

                <div className="add-licence-form-group">
                  <label htmlFor="lampadairesMax">
                    <i className="ri-lightbulb-line" /> Lampadaires maximum *
                  </label>
                  <InputText
                    id="lampadairesMax"
                    name="lampadairesMax"
                    value={licenceData.lampadairesMax}
                    onChange={handleInputChange}
                    placeholder="15"
                    keyfilter="int"
                    required
                  />
                </div>
              </div>
            </div>
          </div>

          <div className="add-licence-footer">
            <button
              type="button"
              className="add-licence-cancel-btn"
              onClick={onClose}
              disabled={isLoading}
            >
              <i className="ri-close-line" /> Annuler
            </button>
            <button
              type="submit"
              className="add-licence-save-btn"
              disabled={isLoading}
            >
              {isLoading ? (
                <>
                  <i className="ri-loader-4-line spin" /> Enregistrement...
                </>
              ) : (
                <>
                  <i className="ri-save-line" /> Enregistrer
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AddLicencePage;