import React, { useState, useEffect } from "react";
import "./cssP/validationuser.css";
import emailIcon from "../assets/email.png";
import Popup from "../components/Popup";
import { Dialog } from "primereact/dialog";
import PopupOff from "../components/PopupOff";
import successIcon from "../assets/success.png";
import { Button } from "primereact/button";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import axios from "axios";
import { useLocation, useNavigate } from "react-router-dom";

function Validationuser() {
  const navigate = useNavigate();
  const [verificationCode, setVerificationCode] = useState(Array(5).fill(""));
  const location = useLocation();
  const [email, setEmail] = useState(location.state?.Data.email || "");
  const [timeLeft, setTimeLeft] = useState(120);
  const [attempts, setAttempts] = useState(0);
  const [successMessage, setSuccessMessage] = useState("");
  const [showPopup, setShowPopup] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [showPopupOff, setShowPopupOff] = useState(false);
  const [showEmailPopup, setShowEmailPopup] = useState(false);
  const [newEmail, setNewEmail] = useState(email);
  const [showAccountPendingDialog, setShowAccountPendingDialog] = useState(false);

  const handleOpenEmailPopup = () => setShowEmailPopup(true);
  const handleCloseEmailPopup = () => setShowEmailPopup(false);
  const handleEmailChange = (e) => setNewEmail(e.target.value);

  // Reusable toast function
  const showToast = (type, message, options = {}) => {
    const toastOptions = {
      position: "top-center",
      autoClose: 3000,
      hideProgressBar: false,
      closeOnClick: true,
      pauseOnHover: true,
      draggable: true,
      theme: "colored",
      ...options,
    };

    switch (type) {
      case "success":
        toast.success(message, toastOptions);
        break;
      case "error":
        toast.error(message, toastOptions);
        break;
      case "warning":
        toast.warn(message, toastOptions);
        break;
      case "info":
        toast.info(message, toastOptions);
        break;
      default:
        toast(message, toastOptions);
    }
  };

  const handleSaveEmail = async () => {
    try {
      const checkResponse = await axios.post(
        "http://localhost:5000/api/users/VerifierEmail",
        { email: newEmail }
      );

      if (checkResponse.data.exists) {
        showToast("error", "Cet email est déjà utilisé.");
        setErrorMessage("Cet email est déjà utilisé.");
        return;
      }

      await axios.post("http://localhost:5000/api/users/code", {
        email: newEmail,
      });

      setEmail(newEmail);
      setTimeLeft(120);
      setAttempts(0);
      setErrorMessage("");
      setShowEmailPopup(false);
      showToast("success", "L'email a été mis à jour avec succès!");
    } catch (error) {
      console.error("Erreur:", error);
      showToast("error", "Une erreur est survenue.");
      setErrorMessage("Une erreur est survenue.");
    }
  };

  useEffect(() => {
    const timer = setInterval(() => {
      setTimeLeft((prevTime) => {
        if (prevTime <= 1) {
          clearInterval(timer);
          return 0;
        }
        return prevTime - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  const formatTime = (seconds) => {
    const minutes = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${minutes < 10 ? "0" : ""}${minutes}:${secs < 10 ? "0" : ""}${secs}`;
  };

  const handleChange = (index, value) => {
    if (/^[0-9]?$/.test(value)) {
      const newCode = [...verificationCode];
      newCode[index] = value;
      setVerificationCode(newCode);
      if (value && index < 4) {
        document.querySelector(`input:nth-child(${index + 2})`).focus();
      }
    }
  };

  const validateCode = async () => {
    const codeEntered = verificationCode.join("");
    if (codeEntered.length !== 5) {
      showToast("error", "Veuillez entrer un code complet de 5 chiffres.");
      return;
    }

    try {
      const response = await axios.post(
        "http://localhost:5000/api/users/verifecode",
        {
          email: email,
          verificationCode: codeEntered,
        }
      );

      if (response.data.valid) {
        const userData = {
          nom: location.state?.Data.nom,
          prenom: location.state?.Data.prenom,
          email: email,
          motDePasse: location.state?.Data.motDePasse,
          dateDeNaissance: location.state?.Data.dateDeNaissance,
          cin: location.state?.Data.cin,
          genre: location.state?.Data.genre,
          numéroDeTéléphone: location.state?.Data.numéroDeTéléphone,
        };

        await axios.post(
          "http://localhost:5000/api/users/ajoute",
          userData,
          { headers: { "Content-Type": "application/json" } }
        );

        setSuccessMessage("Utilisateur créé avec succès !");
        setShowAccountPendingDialog(true);
      } else {
        setAttempts(attempts + 1);
        showToast("error", "Code de vérification invalide. Veuillez réessayer.");
        setErrorMessage("Code de vérification invalide. Veuillez réessayer.");
      }
    } catch (error) {
      console.error("Erreur lors de la validation du code:", error);
      setAttempts(attempts + 1);
      if (attempts + 1 >= 3) {
        showToast("error", "Vous avez atteint la limite d'essais !");
        setErrorMessage("Vous avez atteint la limite d'essais !");
        setShowPopupOff(true);
      } else {
        showToast("error", `Code incorrect, ESSAIS ${attempts + 1}/3`);
        setErrorMessage(`Code incorrect, ESSAIS ${attempts + 1}/3`);
      }
    }
  };

  const handleClosePopup = () => {
    setShowPopup(false);
  };

  const resendCode = async () => {
    try {
      await axios.post("http://localhost:5000/api/users/renvoyercode", {
        email: email,
      });
      setTimeLeft(120);
      setAttempts(0);
      setErrorMessage("");
      showToast("success", "Le code a été renvoyé avec succès!");
    } catch (error) {
      console.error("Erreur lors de l'envoi du code :", error);
      showToast("error", "Erreur lors du renvoi du code.");
    }
  };

  return (
    <div className="validation-page">
      <div className="validation-content">
        <div className="validation-email-icon">
          <img src={emailIcon} alt="Icône d'e-mail" />
        </div>

        <p className="validation-title">Vérifiez votre e-mail</p>
        <hr className="validation-divider" />
        <h6 className="validation-subtitle">Le code a été envoyé à:</h6>
        <p className="validation-email">{email}</p>
        <p className="validation-instructions">
          Vérifiez votre boîte de réception et saisissez le code de vérification
          ci-dessous pour confirmer votre adresse e-mail. Notez bien que le code
          expirera dans : {formatTime(timeLeft)}
        </p>

        <div className="validation-verification-code">
          {verificationCode.map((code, index) => (
            <input
              key={index}
              type="text"
              maxLength={1}
              className="validation-code-input"
              value={code}
              onChange={(e) => handleChange(index, e.target.value)}
            />
          ))}
        </div>
        
        {errorMessage && <p className="validation-error">{errorMessage}</p>}
        <p className="validation-attempts">Essais restants : {3 - attempts}</p>

        <div className="validation-button-container">
          <button
            className="validation-btn"
            onClick={validateCode}
            disabled={attempts >= 3 || timeLeft === 0}
          >
            Confirmer
          </button>
        </div>

        <div className="validation-links">
          <span onClick={resendCode}>Renvoyer le code</span>
          <span onClick={handleOpenEmailPopup}>Changer l'e-mail</span>
        </div>
      </div>
      
      <p className="validation-back-link" onClick={() => navigate("/")}>
        Retour à la page de connexion
      </p>

      {showPopup && (
        <Popup
          message="Votre compte a été créé avec succès !"
          onClose={() => setShowPopup(false)}
          onConfirm={() => {
            setShowPopup(false);
            navigate("/");
          }}
        />
      )}

      {showPopupOff && (
        <PopupOff
          message="Code de vérification invalide. Vous avez atteint la limite d'essais !"
          onClose={() => setShowPopupOff(false)}
          onClick={() => setShowPopupOff(false)}
        />
      )}

      {showEmailPopup && (
        <div className="popup-overlay">
          <div className="popup-content">
            <h3>Modifier l'e-mail</h3>
            <input
              type="email"
              value={newEmail}
              onChange={handleEmailChange}
              className="email-input"
            />
            <div className="popup-buttons">
              <button onClick={handleCloseEmailPopup} className="cancel-btn">
                Annuler
              </button>
              <button onClick={handleSaveEmail} className="save-btn">
                Enregistrer
              </button>
            </div>
          </div>
        </div>
      )}

      <Dialog
        header="Compte en attente"
        visible={showAccountPendingDialog}
        closable={false}
        className="account-pending-dialog"
      >
        <div className="dialog-content">
          <img src={successIcon} alt="Icône de succès" />
          <p>
            Votre compte a été créé avec succès, mais il doit être validé par
            l'administration.
          </p>
          <p>Vous recevrez un e-mail dès que votre compte sera activé.</p>
          <Button
            label="OK"
            icon="pi pi-check"
            className="p-button-success"
            onClick={() => navigate("/")}
          />
        </div>
      </Dialog>
      
      <ToastContainer
        position="top-center"
        autoClose={3000}
        hideProgressBar={false}
        newestOnTop={false}
        closeOnClick
        rtl={false}
        pauseOnFocusLoss
        draggable
        pauseOnHover
        theme="colored"
      />
    </div>
  );
}

export default Validationuser;