import React, { useState, useRef } from 'react';
import { InputText } from 'primereact/inputtext';
import { Toast } from 'primereact/toast';
import axios from 'axios';
import 'primereact/resources/themes/saga-green/theme.css';
import 'primereact/resources/primereact.min.css';
import './SuspendLicencePage.css';
import { RiPauseLine } from 'react-icons/ri';

const SuspendLicencePage = ({ licenceId, onClose, onSave }) => {
  const toast = useRef(null);
  const [formData, setFormData] = useState({
    reason: '',
  });
  const [isLoading, setIsLoading] = useState(false);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    try {
      await axios.put(`http://localhost:5000/api/licences/${licenceId}/suspend`, {
        reason: formData.reason,
      });
      toast.current.show({
        severity: 'success',
        summary: 'Succès',
        detail: 'Licence suspendue avec succès',
        life: 3000,
      });
      if (onSave) onSave();
      if (onClose) onClose();
    } catch (error) {
      console.error('Erreur lors de la suspension :', error.response?.data || error.message);
      toast.current.show({
        severity: 'error',
        summary: 'Erreur',
        detail: error.response?.data?.message || 'Erreur lors de la suspension de la licence',
        life: 3000,
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="suspend-licence-modal-overlay">
      <Toast ref={toast} />
      <div className="suspend-licence-container">
        <div className="suspend-licence-header">
          <h2>
            <RiPauseLine />
            Suspendre la Licence
          </h2>
          <button
            className="suspend-licence-close-btn"
            onClick={onClose}
            aria-label="Fermer la fenêtre"
          >
            <i className="ri-close-line" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="suspend-licence-form-container">
          <div className="suspend-licence-content">
            <div className="suspend-licence-section">
              <h3 className="suspend-licence-section-title">
                <RiPauseLine /> Détails de la Suspension
              </h3>
              <div className="suspend-licence-form-grid">
                <div className="suspend-licence-form-group">
                  <label htmlFor="reason">
                    <i className="ri-text" /> Raison de la suspension (optionnel)
                  </label>
                  <InputText
                    id="reason"
                    name="reason"
                    value={formData.reason}
                    onChange={handleInputChange}
                    placeholder="Entrez la raison de la suspension"
                  />
                </div>
              </div>
            </div>
          </div>

          <div className="suspend-licence-footer">
            <button
              type="button"
              className="suspend-licence-cancel-btn"
              onClick={onClose}
              disabled={isLoading}
            >
              <i className="ri-close-line" /> Annuler
            </button>
            <button
              type="submit"
              className="suspend-licence-save-btn"
              disabled={isLoading}
            >
              {isLoading ? (
                <>
                  <i className="ri-loader-4-line spin" /> Enregistrement...
                </>
              ) : (
                <>
                  <RiPauseLine /> Suspendre
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default SuspendLicencePage;