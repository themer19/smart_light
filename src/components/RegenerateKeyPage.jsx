import React, { useState, useRef, useEffect } from 'react';
import { InputText } from 'primereact/inputtext';
import { Toast } from 'primereact/toast';
import axios from 'axios';
import 'primereact/resources/themes/saga-green/theme.css';
import 'primereact/resources/primereact.min.css';
import './RegenerateKeyPage.css';
import { RiKeyLine } from 'react-icons/ri';

const RegenerateKeyPage = ({ licenceId, onClose, onSave }) => {
  const toast = useRef(null);
  const [formData, setFormData] = useState({
    newKey: '',
  });
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e) => {
  e.preventDefault();
  setIsLoading(true);
  try {
    const response = await axios.patch(`http://localhost:5000/api/licences/${licenceId}/regenerate-key`);
    setFormData({ newKey: response.data.newKey });
    toast.current.show({
      severity: 'success',
      summary: 'Succès',
      detail: 'Nouvelle clé générée avec succès',
      life: 3000,
    });
    if (onSave) onSave(response.data);
    if (onClose) onClose();
  } catch (error) {
    console.error('Erreur lors de la régénération :', error.response?.data || error.message);
    toast.current.show({
      severity: 'error',
      summary: 'Erreur',
      detail: error.response?.data?.message || 'Erreur lors de la régénération de la clé',
      life: 3000,
    });
  } finally {
    setIsLoading(false);
  }
};
  return (
    <div className="regenerate-key-modal-overlay">
      <Toast ref={toast} />
      <div className="regenerate-key-container">
        <div className="regenerate-key-header">
          <h2>
            <RiKeyLine />
            Régénérer la Clé de Licence
          </h2>
          <button
            className="regenerate-key-close-btn"
            onClick={onClose}
            aria-label="Fermer la fenêtre"
          >
            <i className="ri-close-line" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="regenerate-key-form-container">
          <div className="regenerate-key-content">
            <div className="regenerate-key-section">
              <h3 className="regenerate-key-section-title">
                <RiKeyLine /> Nouvelle Clé
              </h3>
              <div className="regenerate-key-form-grid">
                <div className="regenerate-key-form-group">
                  <label htmlFor="newKey">
                    <i className="ri-key-2-line" /> Nouvelle clé (sera générée)
                  </label>
                  <InputText
                    id="newKey"
                    name="newKey"
                    value={formData.newKey}
                    readOnly
                    placeholder="La clé sera affichée après génération"
                  />
                </div>
              </div>
            </div>
          </div>

          <div className="regenerate-key-footer">
            <button
              type="button"
              className="regenerate-key-cancel-btn"
              onClick={onClose}
              disabled={isLoading}
            >
              <i className="ri-close-line" /> Annuler
            </button>
            <button
              type="submit"
              className="regenerate-key-save-btn"
              disabled={isLoading}
            >
              {isLoading ? (
                <>
                  <i className="ri-loader-4-line spin" /> Enregistrement...
                </>
              ) : (
                <>
                  <RiKeyLine /> Générer
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default RegenerateKeyPage;