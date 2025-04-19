import React from "react";
import "./cssC/popup.css"; // Ajoutez des styles pour le pop-up
import successIcon from "../assets/effacer.png";
const Popup = ({ message, onClose , onConfirm}) => {
  return (
    <div className="popup-overlay">
      <div className="popup-content">
        <span className="popup-close" onClick={onClose}>
          &times;
        </span>
        <img src={successIcon} alt="Succès" className="popup-icon" />
        <h2>Échec</h2>
        <p>{message}</p>
        <button className="popup-button-off" onClick={onConfirm || onClose}>
          OK
        </button>
      </div>
    </div>
  );
};

export default Popup;
