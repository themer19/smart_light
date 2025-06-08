import React, { useState, useRef } from "react";
import "./cssP/login.css";
import "bootstrap/dist/css/bootstrap.min.css";
import "react-toastify/dist/ReactToastify.css"; // react-toastify styles
import hommeImage from "../assets/homme.png";
import hommeImage2 from "../assets/ajouter-un-utilisateur.png";
import { Dialog } from "primereact/dialog";
import { Button } from "primereact/button";
import { Mail, User, Lock, Calendar, Phone, IdCard } from "lucide-react";
import { ToastContainer, toast } from "react-toastify";
import { useNavigate } from "react-router-dom";
import "primereact/resources/themes/lara-light-indigo/theme.css";
import "primereact/resources/primereact.min.css";
import axios from "axios";

function Login() {
  const navigate = useNavigate();
  const [isActive, setIsActive] = useState(true);
  const [loading, setLoading] = useState(false);
  const [displayDialog, setDisplayDialog] = useState(false);
  const [email, setEmail] = useState("");
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

  // Reusable toast function
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

  // Handle input changes
  const handleChange = (e, type) => {
    if (type === "login") {
      setLoginData({ ...loginData, [e.target.name]: e.target.value });
    } else {
      setRegisterData({ ...registerData, [e.target.name]: e.target.value });
    }
  };

  // Handle login
  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);

    if (!loginData.email) {
      showToast("error", "L'e-mail est vide.");
      setLoading(false);
      return;
    }
    if (!loginData.motDePasse) {
      showToast("error", "Le mot de passe est vide.");
      setLoading(false);
      return;
    }

    try {
      const response = await axios.post(
        "http://localhost:5000/api/users/login",
        loginData,
        { headers: { "Content-Type": "application/json" } }
      );

      showToast("success", "Connexion réussie !", { autoClose: 3000 });
      localStorage.setItem("token", response.data.token);
      navigate("/dashboard");
    } catch (error) {
      const errorMessage =
        error.response?.data?.message || "Erreur de connexion. Vérifiez vos identifiants.";
      showToast("error", errorMessage);
    } finally {
      setLoading(false);
    }
  };

  // Handle registration
  const handleRegister = async (e) => {
    e.preventDefault();
    setLoading(true);

    const emptyFields = [];
    if (!registerData.nom) emptyFields.push("Nom");
    if (!registerData.prenom) emptyFields.push("Prénom");
    if (!registerData.email) {
      emptyFields.push("E-mail");
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(registerData.email)) {
      showToast("error", "L'e-mail n'est pas valide.");
      setLoading(false);
      return;
    }
    if (!registerData.motDePasse) {
      emptyFields.push("Mot de passe");
    } else if (
      !/(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[\W_]).{8,}/.test(
        registerData.motDePasse
      )
    ) {
      showToast(
        "error",
        "Le mot de passe doit contenir au moins 8 caractères, une majuscule, une minuscule, un chiffre et un symbole.",
        { autoClose: 6000 }
      );
      setLoading(false);
      return;
    }
    if (registerData.motDePasse !== registerData.CmotDePasse) {
      showToast("error", "Les mots de passe ne correspondent pas.");
      setLoading(false);
      return;
    }
    if (!registerData.dateDeNaissance) emptyFields.push("Date de naissance");
    if (!registerData.genre) emptyFields.push("Genre");
    if (!registerData.numéroDeTéléphone) {
      emptyFields.push("Numéro de téléphone");
    } else if (!/^\d{8}$/.test(registerData.numéroDeTéléphone)) {
      showToast("error", "Le numéro de téléphone doit contenir exactement 8 chiffres.");
      setLoading(false);
      return;
    }
    if (!registerData.cin) {
      emptyFields.push("CIN");
    } else if (!/^[01][0-9]{7}$/.test(registerData.cin)) {
      showToast(
        "error",
        "Le CIN doit commencer par 0 ou 1, contenir exactement 8 chiffres et ne doit contenir que des chiffres."
      );
      setLoading(false);
      return;
    }

    if (emptyFields.length > 0) {
      showToast("warning", `Les champs suivants sont vides : ${emptyFields.join(", ")}`);
      setLoading(false);
      return;
    }

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

  // Handle forgot password
  const handleForgotPassword = () => {
    setDisplayDialog(true);
  };

  const fermeDialogHide = () => {
    setDisplayDialog(false);
    setEmail("");
  };

  const handleEmailChange = (e) => {
    setEmail(e.target.value);
  };

  const miseajourMP = async () => {
    if (loading) return;
    if (!email) {
      showToast("error", "L'e-mail est vide.");
      setLoading(false);
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

  return (
    <div className="login-page">
      <div>
        <div className="titre">
          <h1>Bienvenue chez LuxBoard</h1>
        </div>
        <div
          className={`content justify-content-center align-items-center d-flex shadow-lg ${
            isActive ? "active" : ""
          }`}
        >
          {/* Formulaire de Connexion */}
          <div className="col-md-6 right-box">
            <form onSubmit={handleLogin}>
              <div className="header-text mb-4">
                <h1>Connexion</h1>
              </div>
              <div className="input-group mb-3">
                <span className="input-group-text bg-light">
                  <Mail size={20} />
                </span>
                <input
                  type="email"
                  name="email"
                  placeholder="E-mail"
                  value={loginData.email}
                  onChange={(e) => handleChange(e, "login")}
                  className="form-control form-control-lg bg-light fs-6"
                  required
                  aria-label="E-mail"
                />
              </div>
              <div className="input-group mb-3">
                <span className="input-group-text bg-light">
                  <Lock size={20} />
                </span>
                <input
                  type="password"
                  name="motDePasse"
                  placeholder="Mot de passe"
                  value={loginData.motDePasse}
                  onChange={(e) => handleChange(e, "login")}
                  className="form-control form-control-lg bg-light fs-6"
                  required
                  aria-label="Mot de passe"
                />
              </div>
              <div className="input-group mb-5 d-flex justify-content-center">
                <div className="form-check">
                  <input type="checkbox" className="form-check-input" id="formcheck" />
                  <label htmlFor="formcheck" className="form-check-label">
                    Se souvenir de moi
                  </label>
                  <div className="forgot">
                    <small>
                      <a href="#" onClick={handleForgotPassword}>
                        Mot de passe oublié ?
                      </a>
                    </small>
                  </div>
                </div>
              </div>
              <div className="input-group mb-3 justify-content-center">
                <button
                  className="btn"
                  type="submit"
                  disabled={loading}
                  style={{
                    width: "50%",
                    fontSize: "1rem",
                    backgroundColor: "#03e706",
                    color: "#fff",
                    border: "none",
                    padding: "10px",
                    borderRadius: "8px",
                    fontWeight: 600,
                    letterSpacing: "0.5px",
                    textTransform: "uppercase",
                    transition: "background-color 0.3s",
                  }}
                  onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = "#fffb00")}
                  onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = "#03e706")}
                >
                  {loading ? "Connexion en cours..." : "Connexion"}
                </button>
              </div>
            </form>
          </div>

          {/* Formulaire d'inscription */}
          <div className="col-md-6 right-box">
            <form onSubmit={handleRegister}>
              <div className="header-text mb-4">
                <h1>Inscription</h1>
              </div>
              <div
                style={{
                  maxHeight: "300px",
                  overflowY: "auto",
                  padding: "10px",
                  border: "1px solid #ccc",
                  width: "100%",
                }}
              >
                <div className="input-group mb-3">
                  <span className="input-group-text bg-light">
                    <User size={20} />
                  </span>
                  <input
                    type="text"
                    placeholder="Nom"
                    name="nom"
                    value={registerData.nom}
                    onChange={(e) => handleChange(e, "register")}
                    className="form-control form-control-lg bg-light fs-6"
                    required
                    aria-label="Nom"
                  />
                </div>
                <div className="input-group mb-3">
                  <span className="input-group-text bg-light">
                    <User size={20} />
                  </span>
                  <input
                    type="text"
                    placeholder="Prénom"
                    name="prenom"
                    value={registerData.prenom}
                    onChange={(e) => handleChange(e, "register")}
                    className="form-control form-control-lg bg-light fs-6"
                    required
                    aria-label="Prénom"
                  />
                </div>
                <div className="input-group mb-3">
                  <span className="input-group-text bg-light">
                    <Mail size={20} />
                  </span>
                  <input
                    type="email"
                    placeholder="E-mail"
                    name="email"
                    value={registerData.email}
                    onChange={(e) => handleChange(e, "register")}
                    className="form-control form-control-lg bg-light fs-6"
                    required
                    aria-label="E-mail"
                  />
                </div>
                <div className="input-group mb-3">
                  <span className="input-group-text bg-light">
                    <Lock size={20} />
                  </span>
                  <input
                    type="password"
                    name="motDePasse"
                    placeholder="Mot de passe"
                    value={registerData.motDePasse}
                    onChange={(e) => handleChange(e, "register")}
                    className="form-control form-control-lg bg-light fs-6"
                    required
                    aria-label="Mot de passe"
                  />
                </div>
                <div className="input-group mb-3">
                  <span className="input-group-text bg-light">
                    <Lock size={20} />
                  </span>
                  <input
                    type="password"
                    name="CmotDePasse"
                    placeholder="Confirmer le mot de passe"
                    value={registerData.CmotDePasse}
                    onChange={(e) => handleChange(e, "register")}
                    className="form-control form-control-lg bg-light fs-6"
                    required
                    aria-label="Confirmer le mot de passe"
                  />
                </div>
                <div className="mb-3">
                  <small className="form-text text-muted" style={{ textAlign: "center" }}>
                    Sélectionnez votre date de naissance
                  </small>
                  <div className="input-group">
                    <span className="input-group-text bg-light">
                      <Calendar size={20} />
                    </span>
                    <input
                      type="date"
                      name="dateDeNaissance"
                      value={registerData.dateDeNaissance}
                      onChange={(e) => handleChange(e, "register")}
                      className="form-control form-control-lg bg-light fs-6"
                      required
                      aria-label="Date de naissance"
                    />
                  </div>
                </div>
                <div className="input-group mb-3">
                  <span className="input-group-text bg-light">
                    <Phone size={20} />
                  </span>
                  <input
                    type="tel"
                    name="numéroDeTéléphone"
                    placeholder="Numéro de téléphone"
                    value={registerData.numéroDeTéléphone}
                    onChange={(e) => handleChange(e, "register")}
                    className="form-control form-control-lg bg-light fs-6"
                    required
                    aria-label="Numéro de téléphone"
                  />
                </div>
                <div className="input-group mb-3">
                  <span className="input-group-text bg-light">
                    <IdCard size={20} />
                  </span>
                  <input
                    type="text"
                    placeholder="CIN"
                    name="cin"
                    value={registerData.cin}
                    onChange={(e) => handleChange(e, "register")}
                    className="form-control form-control-lg bg-light fs-6"
                    maxLength={8}
                    required
                    aria-label="CIN"
                  />
                </div>
                <div className="input-group mb-3">
                  <span className="input-group-text bg-light">
                    <User size={20} />
                  </span>
                  <select
                    name="genre"
                    value={registerData.genre}
                    onChange={(e) => handleChange(e, "register")}
                    className="form-control form-control-lg bg-light fs-6"
                    required
                    aria-label="Genre"
                  >
                    <option value="">Choisissez genre</option>
                    <option value="homme">Homme</option>
                    <option value="femme">Femme</option>
                  </select>
                </div>
                <div className="input-group mb-3 justify-content-center">
                  <button
                    className="btn"
                    type="submit"
                    disabled={loading}
                    style={{
                      width: "100%",
                      fontSize: "1rem",
                      backgroundColor: "#03e706",
                      color: "#fff",
                      border: "none",
                      padding: "10px",
                      borderRadius: "8px",
                      fontWeight: 600,
                      letterSpacing: "0.5px",
                      textTransform: "uppercase",
                      transition: "background-color 0.3s",
                    }}
                    onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = "#fffb00")}
                    onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = "#03e706")}
                  >
                    {loading ? "Inscription en cours..." : "S'inscrire"}
                  </button>
                </div>
              </div>
            </form>
          </div>

          <div className="switch-content">
            <div className="switch">
              <div className="switch-panel switch-right">
                <div className="icon-text-container">
                  <div className="icon-container">
                    <img src={hommeImage2} alt="Icône d'inscription" className="icon" />
                  </div>
                  <h1>Bienvenue !</h1>
                  <p>Saisissez vos coordonnées précises.</p>
                </div>
                <div style={{ position: "relative", top: "90px" }}>
                  <div
                    className="svg-container"
                    onClick={() => setIsActive(true)}
                    style={{ display: "flex", alignItems: "center", marginBottom: "15px" }}
                  >
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      width="30"
                      height="30"
                      fill="currentColor"
                      className="bi bi-arrow-bar-left"
                      viewBox="0 0 16 16"
                    >
                      <path
                        fillRule="evenodd"
                        d="M12.5 15a.5.5 0 0 1-.5-.5v-13a.5.5 0 0 1 1 0v13a.5.5 0 0 1-.5.5M10 8a.5.5 0 0 1-.5.5H3.707l2.147 2.146a.5.5 0 0 1-.708.708l-3-3a.5.5 0 0 1 0-.708l3-3a.5.5 0 1 1 .708.708L3.707 7.5H9.5a.5.5 0 0 1 .5.5"
                      />
                    </svg>
                    <span style={{ color: "white", fontSize: "16px", fontFamily: "Arial" }}>
                      Connexion
                    </span>
                  </div>
                </div>
              </div>
              <div className="switch-panel switch-left">
                <div className="icon-text-container">
                  <div className="icon-container">
                    <img src={hommeImage} alt="Icône de connexion" className="icon" />
                  </div>
                  <h1>Salut !</h1>
                  <p>Nous sommes heureux de vous revoir</p>
                </div>
                <div style={{ position: "relative", top: "90px" }}>
                  <div
                    className="svg-container"
                    onClick={() => setIsActive(false)}
                    style={{ display: "flex", alignItems: "center", marginBottom: "15px" }}
                  >
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      width="30"
                      height="30"
                      fill="currentColor"
                      className="bi bi-arrow-bar-right svg-bottom-right"
                      viewBox="0 0 16 16"
                      style={{ marginRight: "-130px" }}
                    >
                      <path
                        fillRule="evenodd"
                        d="M6 8a.5.5 0 0 0 .5.5h5.793l-2.147 2.146a.5.5 0 0 0 .708.708l3-3a.5.5 0 0 0 0-.708l-3-3a.5.5 0 0 0-.708.708L12.293 7.5H6.5A.5.5 0 0 0 6 8m-2.5 7a.5.5 0 0 1-.5-.5v-13a.5.5 0 0 1 1 0v13a.5.5 0 0 1-.5.5"
                      />
                    </svg>
                    <span style={{ color: "white", fontSize: "16px", fontFamily: "Arial" }}>
                      Créer un compte
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
        <Dialog
          header="Réinitialiser le mot de passe"
          visible={displayDialog}
          style={{ width: "90vw", maxWidth: "500px" }}
          onHide={fermeDialogHide}
        >
          <div>
            <label htmlFor="email">
              Veuillez entrer votre e-mail pour recevoir un lien vous permettant de modifier votre mot de passe :
            </label>
            <div style={{ position: "relative", marginTop: "20px" }}>
              <span
                style={{
                  position: "absolute",
                  left: "10px",
                  top: "50%",
                  transform: "translateY(-50%)",
                  color: "#aaa",
                }}
              >
                <Mail size={20} />
              </span>
              <input
                id="email"
                type="email"
                value={email}
                onChange={handleEmailChange}
                placeholder="E-mail"
                style={{
                  width: "100%",
                  padding: "10px 10px 10px 40px",
                  marginTop: "10px",
                  border: "1px solid #ccc",
                  borderRadius: "4px",
                  boxShadow: "0 2px 5px rgba(0,0,0,0.1)",
                  transition: "border-color 0.3s",
                }}
                onFocus={(e) => (e.currentTarget.style.borderColor = "#03e706")}
                onBlur={(e) => (e.currentTarget.style.borderColor = "#ccc")}
                aria-label="E-mail pour réinitialisation"
              />
            </div>
            <div style={{ marginTop: "20px", display: "flex", justifyContent: "flex-end" }}>
              <Button
                label={loading ? "Envoi en cours..." : "Envoyer"}
                onClick={miseajourMP}
                disabled={loading}
                style={{
                  backgroundColor: "#03e706",
                  color: "#fff",
                  border: "none",
                  padding: "10px 20px",
                  borderRadius: "8px",
                  transition: "background-color 0.3s",
                }}
                onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = "#fffb00")}
                onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = "#03e706")}
              />
              <Button
                label="Annuler"
                onClick={fermeDialogHide}
                style={{
                  marginLeft: "10px",
                  backgroundColor: "#ccc",
                  color: "#fff",
                  border: "none",
                  padding: "10px 20px",
                  borderRadius: "8px",
                  transition: "background-color 0.3s",
                }}
                onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = "#aaa")}
                onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = "#ccc")}
              />
            </div>
          </div>
        </Dialog>
        <ToastContainer
          position="top-center"
          autoClose={5000}
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
    </div>
  );
}

export default Login;