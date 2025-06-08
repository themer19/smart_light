import React, { useState, useRef, useEffect } from 'react';
import { InputText } from 'primereact/inputtext';
import { Dropdown } from 'primereact/dropdown';
import { Toast } from 'primereact/toast';
import axios from 'axios';
import 'primereact/resources/themes/saga-green/theme.css';
import 'primereact/resources/primereact.min.css';
import './EditLicencePage.css';
import { RiEditLine } from 'react-icons/ri';

const EditLicencePage = ({ licenceId, licenceData, onClose, onSave }) => {
  const toast = useRef(null);
  const [formData, setFormData] = useState({
    nom: '',
    type: '',
    zone: '',
  });
  const [isLoading, setIsLoading] = useState(false);

  // Define valid type options (adjust based on your schema)
  const typeOptions = [
    { label: 'Commercial', value: 'Commercial' },
    { label: 'Résidentiel', value: 'Résidentiel' },
    { label: 'Public', value: 'Public' },
  ];

  useEffect(() => {
    if (licenceData) {
      setFormData({
        nom: licenceData.nom || '',
        type: licenceData.type || '',
        zone: licenceData.zone || '',
      });
    }
  }, [licenceData]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleDropdownChange = (e) => {
    setFormData((prev) => ({ ...prev, type: e.value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const { nom, type, zone } = formData;

    if (!nom || !type || !zone) {
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
      const response = await axios.put(`http://localhost:5000/api/licences/${licenceId}`, {
        nom,
        type,
        zone,
      });
      toast.current.show({
        severity: 'success',
        summary: 'Succès',
        detail: 'Licence modifiée avec succès',
        life: 3000,
      });
      if (onSave) onSave(response.data);
      if (onClose) onClose();
    } catch (error) {
      console.error('Erreur lors de la modification :', error.response?.data || error.message);
      const errorMessage = error.response?.data?.message || 'Erreur lors de la modification de la licence';
      if (errorMessage.includes('is not a valid enum value')) {
        toast.current.show({
          severity: 'error',
          summary: 'Erreur',
          detail: 'Type de licence invalide. Veuillez sélectionner une option valide.',
          life: 3000,
        });
      } else {
        toast.current.show({
          severity: 'error',
          summary: 'Erreur',
          detail: errorMessage,
          life: 3000,
        });
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="edit-licence-modal-overlay">
      <Toast ref={toast} />
      <div className="edit-licence-container">
        <div className="edit-licence-header">
          <h2>
            <RiEditLine />
            Modifier la Licence
          </h2>
          <button
            className="edit-licence-close-btn"
            onClick={onClose}
            aria-label="Fermer la fenêtre"
          >
            <i className="ri-close-line" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="edit-licence-form-container">
          <div className="edit-licence-content">
            <div className="edit-licence-section">
              <h3 className="edit-licence-section-title">
                <RiEditLine /> Informations de la Licence
              </h3>
              <div className="edit-licence-form-grid">
                <div className="edit-licence-form-group">
                  <label htmlFor="nom">
                    <i className="ri-file-text-line" /> Nom *
                  </label>
                  <InputText
                    id="nom"
                    name="nom"
                    value={formData.nom}
                    onChange={handleInputChange}
                    placeholder="Nom de la licence"
                    required
                  />
                </div>
                <div className="edit-licence-form-group">
                  <label htmlFor="type">
                    <i className="ri-list-check" /> Type *
                  </label>
                  <Dropdown
                    id="type"
                    name="type"
                    value={formData.type}
                    options={typeOptions}
                    onChange={handleDropdownChange}
                    placeholder="Sélectionnez le type de licence"
                    required
                  />
                </div>
                <div className="edit-licence-form-group">
                  <label htmlFor="zone">
                    <i className="ri-map-pin-line" /> Zone *
                  </label>
                  <InputText
                    id="zone"
                    name="zone"
                    value={formData.zone}
                    onChange={handleInputChange}
                    placeholder="Zone géographique"
                    required
                  />
                </div>
              </div>
            </div>
          </div>

          <div className="edit-licence-footer">
            <button
              type="button"
              className="edit-licence-cancel-btn"
              onClick={onClose}
              disabled={isLoading}
            >
              <i className="ri-close-line" /> Annuler
            </button>
            <button
              type="submit"
              className="edit-licence-save-btn"
              disabled={isLoading}
            >
              {isLoading ? (
                <>
                  <i className="ri-loader-4-line spin" /> Enregistrement...
                </>
              ) : (
                <>
                  <RiEditLine /> Enregistrer
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default EditLicencePage;