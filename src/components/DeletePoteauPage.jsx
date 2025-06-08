import React, { useState, useRef } from 'react';
import { InputTextarea } from 'primereact/inputtextarea';
import { Toast } from 'primereact/toast';
import axios from 'axios';
import 'primereact/resources/themes/saga-green/theme.css';
import 'primereact/resources/primereact.min.css';
import './DeletePoteauPage.css';
import { RiDeleteBinLine } from 'react-icons/ri';

const DeletePoteauPage = ({ poteauId, onClose, onSave }) => {
  const toast = useRef(null);
  const [reason, setReason] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    try {
      await axios.delete(`http://localhost:5000/api/poteau/${poteauId}`, {
        data: { reason }
      });
      toast.current.show({
        severity: 'success',
        summary: 'Succès',
        detail: 'Poteau supprimé avec succès',
        life: 3000,
      });
      if (onSave) onSave();
      if (onClose) onClose();
    } catch (error) {
      console.error('Erreur lors de la suppression :', error.response?.data || error.message);
      toast.current.show({
        severity: 'error',
        summary: 'Erreur',
        detail: error.response?.data?.message || 'Erreur lors de la suppression du poteau',
        life: 3000,
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="delete-poteau-modal-overlay">
      <Toast ref={toast} />
      <div className="delete-poteau-container">
        <div className="delete-poteau-header">
          <h2>
            <RiDeleteBinLine />
            Supprimer le Poteau
          </h2>
          <button
            className="delete-poteau-close-btn"
            onClick={onClose}
            aria-label="Fermer la fenêtre"
          >
            <i className="ri-close-line" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="delete-poteau-form-container">
          <div className="delete-poteau-content">
            <div className="delete-poteau-section">
              <h3 className="delete-poteau-section-title">
                <RiDeleteBinLine /> Confirmation de Suppression
              </h3>
              <p className="delete-poteau-warning">
                Êtes-vous sûr de vouloir supprimer ce poteau ? Cette action est irréversible.
              </p>
              <div className="delete-poteau-form-group">
                <label htmlFor="reason">
                  <i className="ri-file-text-line" /> Raison de la suppression (facultatif)
                </label>
                <InputTextarea
                  id="reason"
                  name="reason"
                  value={reason}
                  onChange={(e) => setReason(e.target.value)}
                  placeholder="Indiquez la raison de la suppression..."
                  rows={4}
                  className="delete-poteau-textarea"
                />
              </div>
            </div>
          </div>

          <div className="delete-poteau-footer">
            <button
              type="button"
              className="delete-poteau-cancel-btn"
              onClick={onClose}
              disabled={isLoading}
            >
              <i className="ri-close-line" /> Annuler
            </button>
            <button
              type="submit"
              className="delete-poteau-confirm-btn"
              disabled={isLoading}
            >
              {isLoading ? (
                <>
                  <i className="ri-loader-4-line spin" /> Suppression...
                </>
              ) : (
                <>
                  <RiDeleteBinLine /> Supprimer
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default DeletePoteauPage;