import React, { useState } from "react";
import { InputTextarea } from "primereact/inputtextarea";
import axios from "axios";
import "primereact/resources/themes/saga-green/theme.css";
import "primereact/resources/primereact.min.css";
import { toast } from "react-toastify";
import "./DeleteSitePage.css";
import { RiDeleteBinLine } from "react-icons/ri";

const DeleteSitePage = ({ siteId, onClose, onSave }) => {
  const [reason, setReason] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    try {
      await axios.delete(`http://localhost:5000/api/site/sitedel/${siteId}`, {
        data: { reason },
      });
      toast.success("Site supprimé avec succès !");
      window.location.reload();
      if (onSave) onSave(reason);
      if (onClose) onClose();

    } catch (error) {
      console.error("Erreur lors de la suppression :", error.response?.data || error.message);
      toast.error(error.response?.data?.message || "Erreur lors de la suppression du site");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="delete-site-modal-overlay">
      <div className="delete-site-container">
        <div className="delete-site-header">
          <h2>
            <RiDeleteBinLine />
            Supprimer le Site
          </h2>
          <button
            className="delete-site-close-btn"
            onClick={onClose}
            aria-label="Close window"
          >
            <i className="ri-close-line" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="delete-site-form-container">
          <div className="delete-site-content">
            <div className="delete-site-section">
              <h3 className="delete-site-section-title">
                <RiDeleteBinLine /> Confirmation de Suppression
              </h3>
              <p className="delete-site-warning">
                Êtes-vous sûr de vouloir supprimer ce site ? Cette action est irréversible.
              </p>
              <div className="delete-site-form-group">
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
                  className="delete-site-textarea"
                />
              </div>
            </div>
          </div>

          <div className="delete-site-footer">
            <button
              type="button"
              className="delete-site-cancel-btn"
              onClick={onClose}
              disabled={isLoading}
            >
              <i className="ri-close-line" /> Annuler
            </button>
            <button
              type="submit"
              className="delete-site-confirm-btn"
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

export default DeleteSitePage;