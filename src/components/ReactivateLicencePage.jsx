import React, { useState, useRef } from 'react';
import { InputText } from 'primereact/inputtext';
import { Toast } from 'primereact/toast';
import axios from 'axios';
import 'primereact/resources/themes/saga-green/theme.css';
import 'primereact/resources/primereact.min.css';
import './ReactivateLicencePage.css';
import { RiPlayLine } from 'react-icons/ri';

const ReactivateLicencePage = ({ licenceId, onClose, onSave }) => {
  const toast = useRef(null);
  const [formData, setFormData] = useState({
    note: '',
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
      await axios.put(`http://localhost:5000/api/licences/${licenceId}/reactivate`, {
        note: formData.note,
      });
      toast.current.show({
        severity: 'success',
        summary: 'Succès',
        detail: 'Licence réactivée avec succès',
        life: 3000,
      });
      if (onSave) onSave();
      if (onClose) onClose();
    } catch (error) {
      console.error('Erreur lors de la réactivation :', error.response?.data || error.message);
      toast.current.show({
        severity: 'error',
        summary: 'Erreur',
        detail: error.response?.data?.message || 'Erreur lors de la réactivation de la licence',
        life: 3000,
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="reactivate-licence-modal-overlay">
      <Toast ref={toast} />
      <div className="reactivate-licence-container">
        <div className="reactivate-licence-header">
          <h2>
            <RiPlayLine />
            Réactiver la Licence
          </h2>
          <button
            className="reactivate-licence-close-btn"
            onClick={onClose}
            aria-label="Fermer la fenêtre"
          >
            <i className="ri-close-line" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="reactivate-licence-form-container">
          <div className="reactivate-licence-content">
            <div className="reactivate-licence-section">
              <h3 className="reactivate-licence-section-title">
                <RiPlayLine /> Détails de la Réactivation
              </h3>
              <div className="reactivate-licence-form-grid">
                <div className="reactivate-licence-form-group">
                  <label htmlFor="note">
                    <i className="ri-text" /> Note de réactivation (optionnel)
                  </label>
                  <InputText
                    id="note"
                    name="note"
                    value={formData.note}
                    onChange={handleInputChange}
                    placeholder="Entrez une note pour la réactivation"
                  />
                </div>
              </div>
            </div>
          </div>

          <div className="reactivate-licence-footer">
            <button
              type="button"
              className="reactivate-licence-cancel-btn"
              onClick={onClose}
              disabled={isLoading}
            >
              <i className="ri-close-line" /> Annuler
            </button>
            <button
              type="submit"
              className="reactivate-licence-save-btn"
              disabled={isLoading}
            >
              {isLoading ? (
                <>
                  <i className="ri-loader-4-line spin" /> Enregistrement...
                </>
              ) : (
                <>
                  <RiPlayLine /> Réactiver
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ReactivateLicencePage;