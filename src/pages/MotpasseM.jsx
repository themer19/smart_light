import React , { useState } from 'react'
import { useParams,useNavigate } from 'react-router-dom'; 
import './cssP/motpassem.css'
import  motpasse  from '../assets/mot-de-passe.png'
import axios from "axios";
import Popup from "../components/Popup"
function MotpasseM() {
    const [newPassword, setNewPassword] = useState("");
     const [confirmPassword, setConfirmPassword] = useState("");
     const [isPopupOpen, setIsPopupOpen] = useState(false);
     const [popupMessage, setPopupMessage] = useState("");
     const navigate = useNavigate();

     const { token } = useParams();
     const handleReset = async () => {
      if (newPassword !== confirmPassword) {
          alert("Les mots de passe ne correspondent pas.");
          return;
      }
  
      try {
          const response = await axios.post(
              'http://localhost:5000/api/users/ResetPassword',
              {
                  token: token, // Directly include the token here
                  newPassword: newPassword // Include the new password
              },
              {
                  headers: {
                      'Content-Type': 'application/json', // Ensure the content type is set to JSON
                  }
              }
          );
  
          setPopupMessage("Mot de passe réinitialisé avec succès !");
          setIsPopupOpen(true);
      } catch (error) {
          console.error("Erreur lors de la réinitialisation :", error); // Log l'erreur complète
          if (error.response && error.response.data) {
              alert(error.response.data.message); // Display the specific error message from the API
          } else {
              alert("Erreur lors de la réinitialisation du mot de passe."); 
          }
          console.log("Token:", token); // Check the token value
          console.log("New Password:", newPassword); // Check the new password value
      }
  };
  
  const closePopup = () => {
    setIsPopupOpen(false);
};

const confirmPopup = () => {
    closePopup();
    navigate('/');
};

  return (
    <div className="mdp-page"> 
      <div className='validation-content'>
      <div className="reset-container">
      <div className="icon-container">
        <img src={motpasse} alt="Icône d'e-mail" className="icon" />
      </div>
      <p className="title">Vérifiez votre e-mail</p>
      <hr className="divider" />
      <h6 className="subtitle">Entrez votre nouveau mot de passe :</h6>
      <p className="password-rules">
        N'oubliez pas de respecter les règles de sécurité : au moins 8 caractères, une majuscule, une minuscule et un chiffre.
      </p>
      <input
        type="password"
        placeholder="Nouveau mot de passe"
        className="password-input"
        value={newPassword}
        onChange={(e) => setNewPassword(e.target.value)}
      />
      <input
        type="password"
        placeholder="Confirmez le mot de passe"
        className="password-input"
        value={confirmPassword}
        onChange={(e) => setConfirmPassword(e.target.value)}
      />
      <button className="reset-button" onClick={handleReset} 
      onMouseEnter={(e) =>
                (e.currentTarget.style.backgroundColor = "#fffb00")
              }
              onMouseLeave={(e) =>
                (e.currentTarget.style.backgroundColor = "#03e706")
              }>
        Réinitialiser
      </button>
    </div>
      </div>
      <Popup 
                message={popupMessage} 
                onClose={closePopup} 
                onConfirm={confirmPopup} 
                isOpen={isPopupOpen} // Pass the popup state
            />
    </div>
  )
}

export default MotpasseM
