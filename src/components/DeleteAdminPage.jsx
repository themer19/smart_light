import React, { useState, useRef } from 'react';
import { InputTextarea } from 'primereact/inputtextarea';
import { Toast } from 'primereact/toast';
import axios from 'axios';
import 'primereact/resources/themes/saga-green/theme.css';
import 'primereact/resources/primereact.min.css';
import './DeleteAdminPage.css'; // Create this CSS file
import { RiDeleteBinLine } from 'react-icons/ri';

const DeleteAdminPage = ({ utilisateurId, utilisateurNom, onClose, onSave }) => {
  const toast = useRef(null);
  const [reason, setReason] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    try {
      await axios.delete(`http://localhost:5000/api/users/${utilisateurId}`, {
        data: { reason },
      });
      toast.current.show({
        severity: 'success',
        summary: 'Succès',
        detail: `Utilisateur ${utilisateurNom} supprimé avec succès`,
        life: 3000,
      });
      if (onSave) onSave(utilisateurId); // Pass utilisateurId to update parent state
      if (onClose) onClose();
    } catch (error) {
      console.error('Erreur lors de la suppression :', error.response?.data || error.message);
      toast.current.show({
        severity: 'error',
        summary: 'Erreur',
        detail: error.response?.data?.message || 'Erreur lors de la suppression de l’utilisateur',
        life: 3000,
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="delete-admin-modal-overlay">
      <Toast ref={toast} />
      <div className="delete-admin-container">
        <div className="delete-admin-header">
          <h2>
            <RiDeleteBinLine />
            Supprimer l’Utilisateur
          </h2>
          <button
            className="delete-admin-close-btn"
            onClick={onClose}
            aria-label="Fermer la fenêtre"
          >
            <i className="ri-close-line" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="delete-admin-form-container">
          <div className="delete-admin-content">
            <div className="delete-admin-section">
              <h3 className="delete-admin-section-title">
                <RiDeleteBinLine /> Confirmation de Suppression
              </h3>
              <p className="delete-admin-warning">
                Êtes-vous sûr de vouloir supprimer l’utilisateur <strong>{utilisateurNom}</strong> ? Cette action est irréversible.
              </p>
              <div className="delete-admin-form-group">
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
                  className="delete-admin-textarea"
                />
              </div>
            </div>
          </div>

          <div className="delete-admin-footer">
            <button
              type="button"
              className="delete-admin-cancel-btn"
              onClick={onClose}
              disabled={isLoading}
            >
              <i className="ri-close-line" /> Annuler
            </button>
            <button
              type="submit"
              className="delete-admin-confirm-btn"
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

export default DeleteAdminPage;