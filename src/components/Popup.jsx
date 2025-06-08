import React from "react";
import "./cssC/po.css"; // Ajoutez des styles pour le pop-up
import echeIcon from "../assets/success.png";

const Popup = ({ message, onClose, onConfirm, isOpen }) => {
  // Ne pas afficher le pop-up si isOpen est faux
  if (!isOpen) return null;

  return (
    <div className="popup-overlay">
      <div className="popup-content">
        <span className="popup-close" onClick={onClose}>
          &times;
        </span>
        <img src={echeIcon} alt="Succès" className="popup-icon" />
        <h2>Succès</h2>
        <p>{message}</p>
        <button className="popup-button" onClick={onConfirm}>
          OK
        </button>
      </div>
    </div>
  );
};

export default Popup;
