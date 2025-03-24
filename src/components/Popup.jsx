import React from "react";
import "./cssC/popup.css"; // Ajoutez des styles pour le pop-up
import successIcon from "../assets/success.png";
const Popup = ({ message, onClose , onConfirm}) => {
  return (
    <div className="popup-overlay">
      <div className="popup-content">
        <span className="popup-close" onClick={onClose}>
          &times;
        </span>
        <img src={successIcon} alt="Succès" className="popup-icon" />
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
