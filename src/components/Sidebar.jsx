import React, { useState, useEffect } from "react";
import "./cssC/Sidebar.css";
import { Link, useLocation } from "react-router-dom";
import "remixicon/fonts/remixicon.css";
import imaged from "../assets/homme.png";
import imaged1 from "../assets/projecteur.png";
const Sidebar = () => {
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [darkMode, setDarkMode] = useState(false);
  const [activeLink, setActiveLink] = useState("Dashboard");

  useEffect(() => {
    const savedTheme = localStorage.getItem("selected-theme");
    if (savedTheme === "dark") {
      setDarkMode(true);
      document.body.classList.add("dark-theme");
    }
  }, []);

  const toggleSidebar = () => setSidebarOpen(!sidebarOpen);

  const toggleTheme = () => {
    const newDarkMode = !darkMode;
    setDarkMode(newDarkMode);
    document.body.classList.toggle("dark-theme");
    localStorage.setItem("selected-theme", newDarkMode ? "dark" : "light");
    localStorage.setItem(
      "selected-icon",
      newDarkMode ? "ri-sun-fill" : "ri-moon-clear-fill"
    );
  };

  const menuItems = [
    {
      title: "Menu",
      items: [
        { icon: "ri-home-4-fill", text: "Accueil" , path: "/Accueil"},
        { icon: "ri-map-line", text: "Gestion des sites", path: "/Sites" },
        { icon: "ri-map-pin-line", text: "Gestionnaire de lignes", path: "/Lignes" },
        { icon: "ri-lightbulb-flash-line", text: "Poteaux d'éclairage", path: "/Poteaux" },
        { icon: "ri-bar-chart-box-fill", text: "Statistics" , path: "/Statistics"},
        { icon: "ri-lightbulb-line", text: "Gestionnaire d'éclairage" , path: "/Eclairage"},
        { icon: "ri-map-2-line", text: "Maps" , path: "/Maps"},
        { icon: "ri-key-fill", text: " Gestionnaire de licences", path: "/Licences" },
        { icon: "ri-user-settings-line", text: " Gestionnaire d'utilisateurs", path: "/Utilisateurs" },
      ],
    },
  ];

  return (
    <div className={`sidebar-component ${darkMode ? "dark-theme" : ""}`}>
      <header
        className={`sidebar-header ${sidebarOpen ? "sidebar-left-pd" : ""}`}
      >
        <div className="sidebar-header__container">
          <a href="#" className="sidebar-header__logo">
            <img src={imaged1} className="icon-image" alt="logo" />
            <span>Lux Board</span>
          </a>

          {/* Barre de recherche */}
          <div className="sidebar-header__search">
            <input type="text" placeholder="Rechercher..." />
            <i className="ri-search-line"></i>
          </div>

          {/* Icône de notification + menu */}
          <div className="sidebar-header__right">
            <button className="sidebar-header__icon">
              <i className="ri-notification-3-line"></i>
            </button>
            <button className="sidebar-header__icon">
              <i className="ri-mail-line"></i>
            </button>
            <button className="sidebar-header__icon" onClick={toggleSidebar}>
              <i className="ri-settings-2-line"></i>
            </button>
            <button className="sidebar-header__toggle" onClick={toggleSidebar}>
              <i className="ri-menu-line"></i>
            </button>
          </div>
        </div>
      </header>

      <nav className={`sidebar-nav ${sidebarOpen ? "sidebar-show" : ""}`}>
        <div className="sidebar-nav__container">
          <div className="sidebar-nav__user">
            <div className="sidebar-nav__img">
              <img src={imaged} alt="Profile" />
            </div>
            <div className="sidebar-nav__info">
              <h3>Rix Methil</h3>
              <span>rix123@email.com</span>
            </div>
          </div>

          <div className="sidebar-nav__content">
            {menuItems.map((section, index) => (
              <div key={index}>
                <h3 className="sidebar-nav__title">{section.title}</h3>
                <div className="sidebar-nav__list">
                  {section.items.map((item, i) => (
                     <Link
                     key={i}
                     to={item.path}
                     className={`sidebar-nav__link ${
                       activeLink === item.path ? "sidebar-active-link" : ""
                     }`}
                     onClick={() => setActiveLink(item.path)}
                   >
                     <i className={item.icon}></i>
                     <span>{item.text}</span>
                   </Link>
                  ))}
                </div>
              </div>
            ))}
          </div>

          <div className="sidebar-nav__actions">
            <button onClick={toggleTheme}>
              <i
                className={`ri-${
                  darkMode ? "sun" : "moon"
                }-fill sidebar-nav__link sidebar-nav__theme`}
              >
                <span>Theme</span>
              </i>
            </button>
            <button className="sidebar-nav__link">
              <i className="ri-logout-box-r-fill"></i>
              <span>Déconnexion</span>
            </button>
          </div>
        </div>
      </nav>

      <main
        className={`sidebar-main sidebar-container ${
          sidebarOpen ? "sidebar-left-pd" : ""
        }`}
      >
      </main>
    </div>
  );
};

export default Sidebar;
