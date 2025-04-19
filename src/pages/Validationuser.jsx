import React, { useState, useEffect, useRef } from "react";
import "./cssP/validationuser.css";
import emailIcon from "../assets/email.png";
import Popup from "../components/Popup";
import { Dialog } from "primereact/dialog";
import PopupOff from "../components/PopupOff";
import successIcon from "../assets/success.png";
import { Button } from "primereact/button";

import { Toast } from "primereact/toast";
import axios from "axios";
import { useLocation, useNavigate } from "react-router-dom";
function Validationuser() {
  const navigate = useNavigate();
  const [verificationCode, setVerificationCode] = useState(Array(5).fill("")); // Tableau pour le code de vérification
  const location = useLocation();
  const [email, setEmail] = useState(location.state?.Data.email || "");
  const [timeLeft, setTimeLeft] = useState(120);
  const [attempts, setAttempts] = useState(0);
  const [successMessage, setSuccessMessage] = useState(""); // État pour le message de succès
  const [showPopup, setShowPopup] = useState(false); // État pour afficher le pop-up
  const [errorMessage, setErrorMessage] = useState("");
  const [showPopupOff, setShowPopupOff] = useState(false); // État pour afficher le pop-up
  const toast = useRef(null);
  const [showEmailPopup, setShowEmailPopup] = useState(false);
  const [newEmail, setNewEmail] = useState(email);
  const handleOpenEmailPopup = () => setShowEmailPopup(true);
  const handleCloseEmailPopup = () => setShowEmailPopup(false);
  const handleEmailChange = (e) => setNewEmail(e.target.value);
  const [showAccountPendingDialog, setShowAccountPendingDialog] =
    useState(false);

  const handleSaveEmail = async () => {
    try {
      console.log("Nouvel email:", newEmail);

      // Vérifier si l'email est disponible
      const checkResponse = await axios.post(
        "http://localhost:5000/api/users/VerifierEmail",
        {
          email: newEmail,
        }
      );

      if (checkResponse.data.exists) {
        toast.current.show({
          severity: "error",
          summary: "Erreur",
          detail: "Cet email est déjà utilisé.",
          life: 3000,
        });
        setErrorMessage("Cet email est déjà utilisé.");
        return; // Ne continuez pas si l'email existe déjà
      }

      // Envoyer l'email si disponible
      await axios.post("http://localhost:5000/api/users/code", {
        email: newEmail,
      });

      // Mettre à jour l'état avec le nouvel email
      setEmail(newEmail);
      setTimeLeft(120);
      setAttempts(0);
      setErrorMessage("");
      setShowEmailPopup(false);
      toast.current.show({
        severity: "success",
        summary: "Succès",
        detail: "L'email a été mis à jour avec succès!",
        life: 3000,
      });
    } catch (error) {
      console.error("Erreur:", error);
      setErrorMessage("Une erreur est survenue.");
    }
  };

  useEffect(() => {
    // Démarrer le chronomètre
    const timer = setInterval(() => {
      setTimeLeft((prevTime) => {
        if (prevTime <= 1) {
          clearInterval(timer);
          return 0; // Arrête le chronomètre à 0
        }
        return prevTime - 1; // Décompte d'une seconde
      });
    }, 1000); // 1000 ms = 1 seconde

    return () => clearInterval(timer); // Nettoyage de l'intervalle à la désinscription
  }, []);

  const formatTime = (seconds) => {
    const minutes = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${minutes < 10 ? "0" : ""}${minutes}:${
      secs < 10 ? "0" : ""
    }${secs}`;
  };
  const handleChange = (index, value) => {
    const newCode = [...verificationCode];
    newCode[index] = value;
    setVerificationCode(newCode);
  };

  const validateCode = async () => {
    const codeEntered = verificationCode.join(""); // Convertir le tableau en chaîne
    try {
      const response = await axios.post(
        "http://localhost:5000/api/users/verifecode",
        {
          email: email,
          verificationCode: codeEntered,
        }
      );

      console.log(response.data);

      if (response.data.valid) {
        const userData = {
          nom: location.state?.Data.nom,
          prenom: location.state?.Data.prenom,
          email:email,
          motDePasse: location.state?.Data.motDePasse,
          dateDeNaissance: location.state?.Data.dateDeNaissance,
          cin: location.state?.Data.cin,
          genre: location.state?.Data.genre,
          numéroDeTéléphone: location.state?.Data.numéroDeTéléphone,
        };

        const addUserResponse = await axios.post(
          "http://localhost:5000/api/users/ajoute",
          userData,
          {
            headers: {
              "Content-Type": "application/json",
            },
          }
        );

        console.log(addUserResponse.data);
        setSuccessMessage("Utilisateur créé avec succès !");
        setShowAccountPendingDialog(true); // Affichez la réponse du serveur
      } else {
        setMessage("Code de vérification invalide. Veuillez réessayer.");
      }
    } catch (error) {
      console.error("Erreur lors de la validation du code:", error);
      if (error.response) {
        console.error("Erreur de réponse:", error.response.data); // Affichez la réponse d'erreur du serveur
      }
      setAttempts(attempts + 1);
      if (attempts + 1 >= 3) {
        setErrorMessage("Vous avez atteint la limite d'essais !");
        setShowPopupOff(true);
      } else {
        setErrorMessage(`Code incorrect, ESSAIS ${attempts + 1}/3`);
      }
    }
  };

  const handleClosePopup = () => {
    setShowPopup(false); // Ferme le pop-up
  };

  const resendCode = async () => {
    try {
      await axios.post("http://localhost:5000/api/users/renvoyercode", {
        email: email,
      });
      setTimeLeft(120); // Réinitialiser le timer à 120 secondes
      setAttempts(0); // Réinitialiser les tentatives
      setErrorMessage("");
      toast.current.show({
        severity: "success",
        summary: "Succès",
        detail: "Le code a été renvoyé avec succès!",
        life: 3000,
      }); // Effacer les messages d'erreur
    } catch (error) {
      console.error("Erreur lors de l'envoi du code :", error);
    }
  };

  return (
    <div className="validation-page">
      <div className="validation-content">
        <div
          style={{
            display: "flex",
            justifyContent: "center",
            alignItems: "flex-start",
            height: "auto",
            paddingTop: "20px",
          }}
        >
          <img
            src={emailIcon}
            alt="Icône d'e-mail"
            style={{ width: "50px", height: "50px" }}
          />
        </div>

        <p style={{ textAlign: "center", marginBottom: "20px" }}>
          Vérifiez votre e-mail
        </p>
        <hr
          style={{
            width: "80%",
            margin: "20px auto",
            border: "1px solid #ccc",
          }}
        />
        <h6 style={{ textAlign: "center" }}>Le code a été envoyé à:</h6>
        <p style={{ textAlign: "center", marginBottom: "20px" }}>{email}</p>
        <p style={{ textAlign: "center", marginBottom: "20px" }}>
          Vérifiez votre boîte de réception et saisissez le code de vérification
          ci-dessous pour confirmer votre adresse e-mail. Notez bien que le code
          expirera dans : {formatTime(timeLeft)}
        </p>

        <div
          className="validation-verification-code"
          style={{
            display: "flex",
            justifyContent: "center",
            marginTop: "20px",
          }}
        >
          {verificationCode.map((code, index) => (
            <input
              key={index}
              type="text"
              maxLength={1} // Limite à un seul caractère
              className="validation-code-input"
              value={code}
              onChange={(e) => handleChange(index, e.target.value)}
              style={{
                width: "40px",
                height: "50px", // Hauteur des champs d'entrée
                margin: "0 5px",
                textAlign: "center",
                fontSize: "24px", // Taille de la police
              }} // Style pour les champs
            />
          ))}
        </div>
        {errorMessage && (
          <p style={{ color: "red", textAlign: "center", marginTop: "10px" }}>
            {errorMessage}
          </p>
        )}
        <p style={{ textAlign: "center", marginTop: "10px" }}>
          essais restantes : {3 - attempts}
        </p>

        <div
          style={{
            display: "flex",
            justifyContent: "center",
            marginTop: "20px",
          }}
        >
          <button
            className="validation-btn"
            onClick={validateCode}
            disabled={attempts >= 3 || timeLeft === 0}
            style={{
              width: "100%",
              fontSize: "1rem",
              backgroundColor: "#03e706",
              color: "#fff",
              border: "none",
              backgroundColor:
                attempts >= 3 || timeLeft === 0 ? "#ccc" : "#03e706",
              padding: "10px",
              borderRadius: "8px",
              fontWeight: 600,
              letterSpacing: "0.5px",
              textTransform: "uppercase",
              transition: "background-color 0.3s",
              cursor:
                attempts >= 3 || timeLeft === 0 ? "not-allowed" : "pointer",
            }}
            onMouseEnter={(e) =>
              (e.currentTarget.style.backgroundColor = "#fffb00")
            }
            onMouseLeave={(e) =>
              (e.currentTarget.style.backgroundColor = "#03e706")
            }
          >
            Confirmer
          </button>
        </div>

        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            width: "100%",
            marginTop: "20px",
          }}
        >
          <span
            onClick={resendCode}
            style={{ cursor: "pointer", color: "#03e706" }}
          >
            Renvoyer le code
          </span>
          <span
            onClick={handleOpenEmailPopup}
            style={{ cursor: "pointer", color: "#03e706" }}
          >
            Changer l'e-mail
          </span>
        </div>
      </div>
      <p
        style={{
          textAlign: "center",
          marginTop: "50px",
          marginLeft: "-50px",
          cursor: "pointer",
          color: "#03e706",
        }}
        onClick={() => navigate("/")}
      >
        Retour à la page de connexion
      </p>
      {showPopup && (
        <Popup
          message="Votre compte a été créé avec succès !"
          onClose={() => setShowPopup(false)}
          onConfirm={() => {
            setShowPopup(false);
            navigate("/"); // Redirige vers la page de connexion après confirmation
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
              style={{
                width: "100%",
                padding: "8px",
                marginBottom: "10px",
                borderRadius: "5px",
                border: "1px solid #ccc",
              }}
            />
            <div style={{ display: "flex", justifyContent: "space-between" }}>
              <button
                onClick={handleCloseEmailPopup}
                style={{
                  padding: "8px",
                  backgroundColor: "red",
                  color: "#fff",
                  border: "none",
                  borderRadius: "5px",
                }}
              >
                Annuler
              </button>
              <button
                onClick={handleSaveEmail}
                style={{
                  padding: "8px",
                  backgroundColor: "#03e706",
                  color: "#fff",
                  border: "none",
                  borderRadius: "5px",
                }}
              >
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
        style={{ width: "400px", textAlign: "center" }}
      >
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
          }}
        >
          <img
            src={successIcon}
            alt="Icône d'attente"
            style={{ width: "80px", height: "80px", marginBottom: "10px" }}
          />
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
      <Toast ref={toast} />
    </div>
  );
}

export default Validationuser;
