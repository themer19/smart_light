import React, { useState, useRef } from 'react';
import { InputTextarea } from 'primereact/inputtextarea';
import { Toast } from 'primereact/toast';
import axios from 'axios';
import 'primereact/resources/themes/saga-green/theme.css';
import 'primereact/resources/primereact.min.css';
import './DeleteLinePage.css';
import { RiDeleteBinLine } from 'react-icons/ri';

const DeleteLinePage = ({ lineId, onClose, onSave }) => {
  const toast = useRef(null);
  const [reason, setReason] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    try {
      await axios.delete(`http://localhost:5000/api/ligne/${lineId}`, {
        data: { reason },
      });
      toast.current.show({
        severity: 'success',
        summary: 'Succès',
        detail: 'Ligne supprimée avec succès',
        life: 3000,
      });
      if (onSave) onSave();
      if (onClose) onClose();
    } catch (error) {
      console.error('Erreur lors de la suppression :', error.response?.data || error.message);
      toast.current.show({
        severity: 'error',
        summary: 'Erreur',
        detail: error.response?.data?.message || 'Erreur lors de la suppression de la ligne',
        life: 3000,
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="delete-line-modal-overlay">
      <Toast ref={toast} />
      <div className="delete-line-container">
        <div className="delete-line-header">
          <h2>
            <RiDeleteBinLine />
            Supprimer la Ligne
          </h2>
          <button
            className="delete-line-close-btn"
            onClick={onClose}
            aria-label="Fermer la fenêtre"
          >
            <i className="ri-close-line" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="delete-line-form-container">
          <div className="delete-line-content">
            <div className="delete-line-section">
              <h3 className="delete-line-section-title">
                <RiDeleteBinLine /> Confirmation de Suppression
              </h3>
              <p className="delete-line-warning">
                Êtes-vous sûr de vouloir supprimer cette ligne ? Cette action est irréversible.
              </p>
              <div className="delete-line-form-group">
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
                  className="delete-line-textarea"
                />
              </div>
            </div>
          </div>

          <div className="delete-line-footer">
            <button
              type="button"
              className="delete-line-cancel-btn"
              onClick={onClose}
              disabled={isLoading}
            >
              <i className="ri-close-line" /> Annuler
            </button>
            <button
              type="submit"
              className="delete-line-confirm-btn"
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

export default DeleteLinePage;