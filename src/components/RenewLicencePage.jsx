import React, { useState, useRef, useEffect } from 'react';
import { InputText } from 'primereact/inputtext';
import { Toast } from 'primereact/toast';
import axios from 'axios';
import 'primereact/resources/themes/saga-green/theme.css';
import 'primereact/resources/primereact.min.css';
import './RenewLicencePage.css';
import { RiRefreshLine } from 'react-icons/ri';

const RenewLicencePage = ({ licenceId, licenceData, onClose, onSave }) => {
  const toast = useRef(null);
  const [formData, setFormData] = useState({
    dateExpiration: '',
    lampadairesMax: '',
  });
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    // Pré-remplir les champs avec les données de la licence
    if (licenceData) {
      const now = new Date();
      const nextYear = new Date(now.setFullYear(now.getFullYear() + 1));
      setFormData({
        dateExpiration: licenceData.dateExpiration || nextYear.toISOString().split('T')[0],
        lampadairesMax: licenceData.lampadairesMax || '',
      });
    }
  }, [licenceData]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    if (name === 'lampadairesMax') {
      const numValue = parseInt(value);
      setFormData((prev) => ({
        ...prev,
        [name]: isNaN(numValue) || numValue < 0 ? '' : numValue,
      }));
    } else {
      setFormData((prev) => ({ ...prev, [name]: value }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const { dateExpiration, lampadairesMax } = formData;

    if (!dateExpiration || !lampadairesMax) {
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
      const response = await axios.put(`http://localhost:5000/api/licences/${licenceId}/renew`, {
        dateExpiration,
        lampadairesMax,
      });
      toast.current.show({
        severity: 'success',
        summary: 'Succès',
        detail: 'Licence renouvelée avec succès',
        life: 3000,
      });
      if (onSave) onSave(response.data);
      if (onClose) onClose();
    } catch (error) {
      console.error('Erreur lors du renouvellement :', error.response?.data || error.message);
      toast.current.show({
        severity: 'error',
        summary: 'Erreur',
        detail: error.response?.data?.message || 'Erreur lors du renouvellement de la licence',
        life: 3000,
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="renew-licence-modal-overlay">
      <Toast ref={toast} />
      <div className="renew-licence-container">
        <div className="renew-licence-header">
          <h2>
            <RiRefreshLine />
            Renouveler la Licence
          </h2>
          <button
            className="renew-licence-close-btn"
            onClick={onClose}
            aria-label="Fermer la fenêtre"
          >
            <i className="ri-close-line" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="renew-licence-form-container">
          <div className="renew-licence-content">
            <div className="renew-licence-section">
              <h3 className="renew-licence-section-title">
                <RiRefreshLine /> Informations de Renouvellement
              </h3>
              <div className="renew-licence-form-grid">
                <div className="renew-licence-form-group">
                  <label htmlFor="dateExpiration">
                    <i className="ri-calendar-line" /> Date d'expiration *
                  </label>
                  <InputText
                    id="dateExpiration"
                    name="dateExpiration"
                    type="date"
                    value={formData.dateExpiration}
                    onChange={handleInputChange}
                    required
                  />
                </div>
                <div className="renew-licence-form-group">
                  <label htmlFor="lampadairesMax">
                    <i className="ri-lightbulb-line" /> Lampadaires maximum *
                  </label>
                  <InputText
                    id="lampadairesMax"
                    name="lampadairesMax"
                    value={formData.lampadairesMax}
                    onChange={handleInputChange}
                    placeholder="15"
                    keyfilter="int"
                    required
                  />
                </div>
              </div>
            </div>
          </div>

          <div className="renew-licence-footer">
            <button
              type="button"
              className="renew-licence-cancel-btn"
              onClick={onClose}
              disabled={isLoading}
            >
              <i className="ri-close-line" /> Annuler
            </button>
            <button
              type="submit"
              className="renew-licence-save-btn"
              disabled={isLoading}
            >
              {isLoading ? (
                <>
                  <i className="ri-loader-4-line spin" /> Enregistrement...
                </>
              ) : (
                <>
                  <RiRefreshLine /> Renouveler
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default RenewLicencePage;