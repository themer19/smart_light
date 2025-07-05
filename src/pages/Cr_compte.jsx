import React, { useState, useEffect } from "react";
import "./cr_compte.css";

import backgroundImage2 from "../assets/creer-un-compte.png";
import backgroundImage from "../assets/bac.png";
import backgroundImage1 from "../assets/acces-securise.png";
import { Mail, User, Lock, Calendar, Phone, IdCard } from "lucide-react";
import { Dialog } from "primereact/dialog";
import { Button } from "primereact/button";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import "primereact/resources/themes/lara-light-indigo/theme.css";
import "primereact/resources/primereact.min.css";
import axios from "axios";
import { useNavigate } from "react-router-dom";

function Cr_compte() {
  const navigate = useNavigate();
  const [modeInscription, setModeInscription] = useState(false);
  const [loading, setLoading] = useState(false);
  const [displayDialog, setDisplayDialog] = useState(false);
  const [email, setEmail] = useState("");
  const [errors, setErrors] = useState({});
  const [loginData, setLoginData] = useState({ email: "", motDePasse: "" });
  const [registerData, setRegisterData] = useState({
    nom: "",
    prenom: "",
    email: "",
    motDePasse: "",
    CmotDePasse: "",
    dateDeNaissance: "",
    genre: "",
    numéroDeTéléphone: "",
    cin: "",
  });

  useEffect(() => {
    console.log("modeInscription:", modeInscription);
  }, [modeInscription]);

  const showToast = (type, message, options = {}) => {
    const toastOptions = {
      position: "top-center",
      autoClose: 5000,
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

  const handleChange = (e, type) => {
    const { name, value } = e.target;
    if (type === "login") {
      setLoginData((prev) => ({ ...prev, [name]: value }));
      setErrors((prev) => ({ ...prev, [name]: "" }));
    } else {
      setRegisterData((prev) => ({ ...prev, [name]: value }));
      setErrors((prev) => ({ ...prev, [name]: "" }));
    }
  };

  const validateLogin = () => {
    const newErrors = {};
    if (!loginData.email) newErrors.email = "L'e-mail est requis.";
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(loginData.email))
      newErrors.email = "L'e-mail est invalide.";
    if (!loginData.motDePasse) newErrors.motDePasse = "Le mot de passe est requis.";
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const validateRegister = () => {
    const newErrors = [];
    const emptyFields = {};
    if (!registerData.nom) emptyFields.nom = "Le nom est requis.";
    if (!registerData.prenom) emptyFields.prenom = "Le prénom est requis.";
    if (!registerData.email) {
      emptyFields.email = "L'e-mail est requis.";
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(registerData.email)) {
      emptyFields.email = "L'e-mail est invalide.";
    }
    if (!registerData.motDePasse) {
      emptyFields.motDePasse = "Le mot de passe est requis.";
    } else if (
      !/(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[\W_]).{8,}/.test(
        registerData.motDePasse
      )
    ) {
      emptyFields.motDePasse =
        "Le mot de passe doit inclure 8 caractères, une majuscule, une minuscule, un chiffre et un symbole.";
    }
    if (registerData.motDePasse !== registerData.CmotDePasse) {
      emptyFields.CmotDePasse = "Les mots de passe ne correspondent pas.";
    }
    if (!registerData.dateDeNaissance) emptyFields.dateDeNaissance = "";
    if (!registerData.genre) emptyFields.genre = "";
    if (!registerData.numéroDeTéléphone) {
      emptyFields.numéroDeTéléphone = "";
    } else if (!/^\d{8}$/.test(registerData.numéroDeTéléphone)) {
      emptyFields.numéroDeTéléphone = "Le numéro doit contenir 8 chiffres.";
    }
    if (!registerData.cin) {
      emptyFields.cin = "";
    } else if (!/^[01][0-9]{7}$/.test(registerData.cin)) {
      emptyFields.cin = "Le CIN doit commencer par 0 ou 1 et contenir 8 chiffres.";
    }
    const emptyFieldNames = Object.keys(emptyFields).filter(
      (key) => key !== "CmotDePasse" && emptyFields[key]
    );
    if (emptyFieldNames.length > 0) {
      newErrors.push(`Les champs suivants sont vides ou invalides : ${emptyFieldNames.join(", ")}`);
    }
    Object.keys(emptyFields).forEach((key) => {
      if (emptyFields[key]) setErrors((prev) => ({ ...prev, [key]: emptyFields[key] }));
    });
    newErrors.forEach((msg) => showToast("error", msg));
    return Object.keys(emptyFields).length === 0;
  };

  const handleLogin = async (e) => {
  e.preventDefault();
  if (!validateLogin()) return;

  setLoading(true);
  try {
    const response = await axios.post(
      "http://localhost:5000/api/users/login", 
      loginData,
      { headers: { "Content-Type": "application/json" } }
    );
    
console.log(response.data);
    localStorage.setItem("token", response.data.token);
    localStorage.setItem("userId", response.data.user.id);
    console.log(response.data.user.id);
    navigate("/Accueil");
    
  } catch (error) {
    console.error("Login error:", error);
    showToast("error", error.response?.data?.message || "Erreur de connexion");
  } finally {
    setLoading(false);
  }
};

  const handleRegister = async (e) => {
    e.preventDefault();
    if (!validateRegister()) {
      setLoading(false);
      return;
    }
    setLoading(true);
    try {
      const checkResponse = await axios.post(
        "http://localhost:5000/api/users/VerifierExistence",
        {
          cin: registerData.cin,
          email: registerData.email,
          numeroDeTelephone: registerData.numéroDeTéléphone,
        }
      );
      const messages = [];
      if (checkResponse.data.emailExists) messages.push("L'e-mail est déjà utilisé.");
      if (checkResponse.data.cinExists) messages.push("Le CIN est déjà utilisé.");
      if (checkResponse.data.numeroDeTelephoneExists)
        messages.push("Le numéro de téléphone est déjà utilisé.");
      if (messages.length > 0) {
        messages.forEach((msg) => showToast("error", msg));
        setLoading(false);
        return;
      }
      await axios.post(
        "http://localhost:5000/api/users/code",
        { email: registerData.email },
        { headers: { "Content-Type": "application/json" } }
      );
      showToast(
        "success",
        "Inscription réussie ! Un code de vérification a été envoyé à votre e-mail.",
        { autoClose: 3000 }
      );
      navigate("/validation", { state: { Data: registerData } });
    } catch (error) {
      const errorMessage =
        error.response?.data?.message || "Erreur lors de l'inscription. Vérifiez vos informations.";
      showToast("error", errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const handleForgotPassword = () => {
    setDisplayDialog(true);
  };

  const fermeDialogHide = () => {
    setDisplayDialog(false);
    setEmail("");
    setErrors((prev) => ({ ...prev, dialogEmail: "" }));
  };

  const miseajourMP = async () => {
    if (loading) return;
    if (!email) {
      setErrors((prev) => ({ ...prev, dialogEmail: "L'e-mail est requis." }));
      return;
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      setErrors((prev) => ({ ...prev, dialogEmail: "L'e-mail est invalide." }));
      return;
    }
    setLoading(true);
    try {
      await axios.post("http://localhost:5000/api/users/ForgotPassword", { email });
      showToast("success", "Un e-mail de réinitialisation a été envoyé.", {
        autoClose: 3000,
      });
      fermeDialogHide();
    } catch (error) {
      const errorMessage =
        error.response?.data?.message || "Erreur lors de l'envoi de l'e-mail.";
      showToast("error", errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const handleInscriptionClick = () => {
    console.log("S'inscrire button clicked, setting modeInscription to true");
    setModeInscription(true);
    setErrors({});
  };

  const handleConnexionClick = () => {
    console.log("Se connecter button clicked, setting modeInscription to false");
    setModeInscription(false);
    setErrors({});
  };

  return (
    <div className={`cr-compte-auth-container ${modeInscription ? "cr-compte-signup-mode" : ""}`} style={{ "--background-image": `url(${backgroundImage})` }}>
      <h1 className="cr-compte-main-title">Bienvenue chez LuxBoard</h1>
      <div className="cr-compte-forms-container">
        <div className="cr-compte-auth-forms" key={modeInscription ? "signup" : "login"}>
          {/* Formulaire de connexion */}
          <form className="cr-compte-auth-form cr-compte-login-form" onSubmit={handleLogin}>
            <div className="cr-compte-form-header">
              <img
                src={backgroundImage1}
                alt="Connexion Icon"
                className="cr-compte-form-icon"
              />
              <h2>Connexion</h2>
              <p>Accédez à votre compte en toute sécurité.</p>
            </div>

            <div className="cr-compte-form-group">
              <label htmlFor="login-email">E-mail</label>
              <div className="cr-compte-input-group">
                <span className="cr-compte-input-group-text">
                  <Mail size={20} />
                </span>
                <input
                  id="login-email"
                  type="email"
                  name="email"
                  placeholder="exemple@email.com"
                  value={loginData.email}
                  onChange={(e) => handleChange(e, "login")}
                  className="cr-compte-form-control cr-compte-form-control-lg"
                  required
                />
              </div>
              {errors.email && <p className="cr-compte-input-error">{errors.email}</p>}
            </div>

            <div className="cr-compte-form-group">
              <label htmlFor="login-password">Mot de passe</label>
              <div className="cr-compte-input-group">
                <span className="cr-compte-input-group-text">
                  <Lock size={20} />
                </span>
                <input
                  id="login-password"
                  type="password"
                  name="motDePasse"
                  placeholder="••••••••"
                  value={loginData.motDePasse}
                  onChange={(e) => handleChange(e, "login")}
                  className="cr-compte-form-control cr-compte-form-control-lg"
                  required
                />
              </div>
              {errors.motDePasse && <p className="cr-compte-input-error">{errors.motDePasse}</p>}
              <div className="cr-compte-form-options">
                <label className="cr-compte-remember-me">
                  <input type="checkbox" id="remember" />
                  <span>Se souvenir de moi</span>
                </label>
                <button type="button" className="cr-compte-forgot-password" onClick={handleForgotPassword}>
                  Mot de passe oublié ?
                </button>
              </div>
            </div>

            <button type="submit" className="cr-compte-auth-btn cr-compte-primary" disabled={loading}>
              {loading ? (
                <span className="cr-compte-btn-loader"></span>
              ) : (
                "Se connecter"
              )}
            </button>

            <div className="cr-compte-form-footer">
              <p>Pas encore de compte ?</p>
              <button type="button" className="cr-compte-switch-form" onClick={handleInscriptionClick}>
                S'inscrire
              </button>
            </div>
          </form>

          {/* Formulaire d'inscription */}
          <form className="cr-compte-auth-form cr-compte-signup-form" onSubmit={handleRegister}>
            <div className="cr-compte-form-header">
              <img
                src={backgroundImage2}
                alt="Inscription Icon"
                className="cr-compte-form-icon"
              />
              <h2>Inscription</h2>
              <p>Créez votre compte LuxBoard en quelques étapes.</p>
            </div>

            <div className="cr-compte-form-scroll">
              <div className="cr-compte-form-section">
                <h3>Informations personnelles</h3>
                <div className="cr-compte-form-row">
                  <div className="cr-compte-form-group">
                    <label htmlFor="signup-lastname">Nom</label>
                    <div className="cr-compte-input-group">
                      <span className="cr-compte-input-group-text">
                        <User size={20} />
                      </span>
                      <input
                        id="signup-lastname"
                        type="text"
                        name="nom"
                        placeholder="Votre nom"
                        value={registerData.nom}
                        onChange={(e) => handleChange(e, "register")}
                        className="cr-compte-form-control cr-compte-form-control-lg"
                        required
                      />
                    </div>
                    {errors.nom && <p className="cr-compte-input-error">{errors.nom}</p>}
                  </div>

                  <div className="cr-compte-form-group">
                    <label htmlFor="signup-firstname">Prénom</label>
                    <div className="cr-compte-input-group">
                      <span className="cr-compte-input-group-text">
                        <User size={20} />
                      </span>
                      <input
                        id="signup-firstname"
                        type="text"
                        name="prenom"
                        placeholder="Votre prénom"
                        value={registerData.prenom}
                        onChange={(e) => handleChange(e, "register")}
                        className="cr-compte-form-control cr-compte-form-control-lg"
                        required
                      />
                    </div>
                    {errors.prenom && <p className="cr-compte-input-error">{errors.prenom}</p>}
                  </div>
                </div>

                <div className="cr-compte-form-group">
                  <label htmlFor="signup-cin">CIN</label>
                  <div className="cr-compte-input-group">
                    <span className="cr-compte-input-group-text">
                      <IdCard size={20} />
                    </span>
                    <input
                      id="signup-cin"
                      type="text"
                      name="cin"
                      placeholder="12345678"
                      value={registerData.cin}
                      onChange={(e) => handleChange(e, "register")}
                      className="cr-compte-form-control cr-compte-form-control-lg"
                      maxLength={8}
                      required
                    />
                  </div>
                  {errors.cin && <p className="cr-compte-input-error">{errors.cin}</p>}
                </div>

                <div className="cr-compte-form-group">
                  <label htmlFor="signup-gender">Genre</label>
                  <div className="cr-compte-input-group">
                    <span className="cr-compte-input-group-text">
                      <User size={20} />
                    </span>
                    <select
                      id="signup-gender"
                      name="genre"
                      value={registerData.genre}
                      onChange={(e) => handleChange(e, "register")}
                      className="cr-compte-form-control cr-compte-form-control-lg"
                      required
                    >
                      <option value="">Sélectionnez votre genre</option>
                      <option value="homme">Homme</option>
                      <option value="femme">Femme</option>
                    </select>
                  </div>
                </div>

                <div className="cr-compte-form-group">
                  <label htmlFor="signup-birthdate">Date de naissance</label>
                  <div className="cr-compte-input-group">
                    <span className="cr-compte-input-group-text">
                      <Calendar size={20} />
                    </span>
                    <input
                      id="signup-birthdate"
                      type="date"
                      name="dateDeNaissance"
                      value={registerData.dateDeNaissance}
                      onChange={(e) => handleChange(e, "register")}
                      className="cr-compte-form-control cr-compte-form-control-lg"
                      required
                    />
                  </div>
                </div>
              </div>

              <div className="cr-compte-form-section">
                <h3>Coordonnées</h3>
                <div className="cr-compte-form-group">
                  <label htmlFor="signup-email">E-mail</label>
                  <div className="cr-compte-input-group">
                    <span className="cr-compte-input-group-text">
                      <Mail size={20} />
                    </span>
                    <input
                      id="signup-email"
                      type="email"
                      name="email"
                      placeholder="exemple@email.com"
                      value={registerData.email}
                      onChange={(e) => handleChange(e, "register")}
                      className="cr-compte-form-control cr-compte-form-control-lg"
                      required
                    />
                  </div>
                  {errors.email && <p className="cr-compte-input-error">{errors.email}</p>}
                </div>

                <div className="cr-compte-form-group">
                  <label htmlFor="signup-phone">Téléphone</label>
                  <div className="cr-compte-input-group">
                    <span className="cr-compte-input-group-text">
                      <Phone size={20} />
                    </span>
                    <input
                      id="signup-phone"
                      type="tel"
                      name="numéroDeTéléphone"
                      placeholder="1234567890"
                      value={registerData.numéroDeTéléphone}
                      onChange={(e) => handleChange(e, "register")}
                      className="cr-compte-form-control cr-compte-form-control-lg"
                      required
                    />
                  </div>
                  {errors.numéroDeTéléphone && <p className="cr-compte-input-error">{errors.numéroDeTéléphone}</p>}
                </div>
              </div>

              <div className="cr-compte-form-section">
                <h3>Sécurité</h3>
                <div className="cr-compte-form-group">
                  <label htmlFor="signup-password">Mot de passe</label>
                  <div className="cr-compte-input-group">
                    <span className="cr-compte-input-group-text">
                      <Lock size={20} />
                    </span>
                    <input
                      id="signup-password"
                      type="password"
                      name="motDePasse"
                      placeholder="••••••••"
                      value={registerData.motDePasse}
                      onChange={(e) => handleChange(e, "register")}
                      className="cr-compte-form-control cr-compte-form-control-lg"
                      required
                    />
                  </div>
                  {errors.motDePasse && <p className="cr-compte-input-error">{errors.motDePasse}</p>}
                </div>

                <div className="cr-compte-form-group">
                  <label htmlFor="signup-confirm-password">Confirmer le mot de passe</label>
                  <div className="cr-compte-input-group">
                    <span className="cr-compte-input-group-text">
                      <Lock size={20} />
                    </span>
                    <input
                      id="signup-confirm-password"
                      type="password"
                      name="CmotDePasse"
                      placeholder="••••••••"
                      value={registerData.CmotDePasse}
                      onChange={(e) => handleChange(e, "register")}
                      className="cr-compte-form-control cr-compte-form-control-lg"
                      required
                    />
                  </div>
                  {errors.CmotDePasse && <p className="cr-compte-input-error">{errors.CmotDePasse}</p>}
                </div>
              </div>
            </div>

            <button type="submit" className="cr-compte-auth-btn cr-compte-primary" disabled={loading}>
              {loading ? (
                <span className="cr-compte-btn-loader"></span>
              ) : (
                "S'inscrire"
              )}
            </button>

            <div className="cr-compte-form-footer">
              <p>Déjà un compte ?</p>
              <button type="button" className="cr-compte-switch-form" onClick={handleConnexionClick}>
                Se connecter
              </button>
            </div>
          </form>
        </div>
      </div>

      <Dialog
        header="Réinitialiser le mot de passe"
        visible={displayDialog}
        style={{ width: "90vw", maxWidth: "500px" }}
        onHide={fermeDialogHide}
        className="cr-compte-p-dialog"
      >
        <div className="cr-compte-p-dialog-content">
          <label htmlFor="dialog-email" className="cr-compte-input-label">
            Entrez votre e-mail pour recevoir un lien de réinitialisation :
          </label>
          <div className="cr-compte-input-group">
            <span className="cr-compte-input-group-text">
              <Mail size={20} />
            </span>
            <input
              id="dialog-email"
              type="email"
              value={email}
              onChange={(e) => {
                setEmail(e.target.value);
                setErrors((prev) => ({ ...prev, dialogEmail: "" }));
              }}
              placeholder="Entrez votre e-mail"
              className={`cr-compte-form-control cr-compte-form-control-lg ${errors.dialogEmail ? "cr-compte-is-invalid" : ""}`}
              aria-label="E-mail pour réinitialisation"
            />
          </div>
          {errors.dialogEmail && (
            <small className="cr-compte-input-error">{errors.dialogEmail}</small>
          )}
          <div className="cr-compte-p-dialog-footer">
            <Button
              label={loading ? "Envoi en cours..." : "Envoyer"}
              onClick={miseajourMP}
              disabled={loading}
              className="cr-compte-bouton cr-compte-bouton-plein"
            />
            <Button
              label="Annuler"
              onClick={fermeDialogHide}
              className="cr-compte-bouton cr-compte-bouton-transparent"
            />
          </div>
        </div>
      </Dialog>
      <ToastContainer />
    </div>
  );
}

export default Cr_compte;