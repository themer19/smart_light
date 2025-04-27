import React, { useState, useEffect } from "react";
import "./cssC/Sidebar.css";
import { Link, useLocation } from "react-router-dom";
import "remixicon/fonts/remixicon.css";
import imaged from "../assets/homme.png";
import imaged1 from "../assets/projecteur.png";

const Sidebar = () => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [darkMode, setDarkMode] = useState(false);
  const [searchVisible, setSearchVisible] = useState(false);
  const location = useLocation();
  const [activeLink, setActiveLink] = useState(location.pathname);
  const [isMobile, setIsMobile] = useState(window.innerWidth < 768);

  useEffect(() => {
    const handleResize = () => {
      const mobile = window.innerWidth < 768;
      setIsMobile(mobile);
      if (mobile) {
        setSidebarOpen(false);
      }
    };

    window.addEventListener("resize", handleResize);
    handleResize();
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  useEffect(() => {
    const savedTheme = localStorage.getItem("selected-theme");
    if (savedTheme === "dark") {
      setDarkMode(true);
      document.body.classList.add("dark-theme");
    }
  }, []);

  useEffect(() => {
    setActiveLink(location.pathname);
    if (isMobile) setSidebarOpen(false);
  }, [location.pathname, isMobile]);

  const toggleSidebar = () => setSidebarOpen(!sidebarOpen);
  const toggleSearch = () => setSearchVisible(!searchVisible);
  const toggleTheme = () => {
    const newDarkMode = !darkMode;
    setDarkMode(newDarkMode);
    document.body.classList.toggle("dark-theme");
    localStorage.setItem("selected-theme", newDarkMode ? "dark" : "light");
  };

  const menuItems = [
    {
      title: "Menu",
      items: [
        { icon: "ri-home-4-fill", text: "Accueil", path: "/Accueil" },
        { icon: "ri-map-line", text: "Gestion des sites", path: "/Sites" },
        { icon: "ri-map-pin-line", text: "Gestionnaire de lignes", path: "/Lignes" },
        { icon: "ri-lightbulb-flash-line", text: "Poteaux d'éclairage", path: "/Poteaux" },
        { icon: "ri-bar-chart-box-fill", text: "Statistics", path: "/Statistics" },
        { icon: "ri-lightbulb-line", text: "Gestionnaire d'éclairage", path: "/Eclairage" },
        { icon: "ri-map-2-line", text: "Maps", path: "/Maps" },
        { icon: "ri-key-fill", text: "Gestionnaire de licences", path: "/Licences" },
        { icon: "ri-user-settings-line", text: "Gestionnaire d'utilisateurs", path: "/Utilisateurs" },
      ],
    },
  ];

  return (
    <div className={`sidebar-component ${darkMode ? "dark-theme" : ""}`}>
      <header className={`sidebar-header ${sidebarOpen ? "sidebar-left-pd" : "sidebar-left-pd-closed"}`}>
        <div className="sidebar-header__container">
          <div className="sidebar-header__left">
            <button className="sidebar-header__toggle" onClick={toggleSidebar}>
              <i className={sidebarOpen ? "ri-close-line" : "ri-menu-line"}></i>
            </button>
            <a href="#" className="sidebar-header__logo">
              <img src={imaged1} className="icon-image" alt="logo" />
              <span>Lux Board</span>
            </a>
          </div>

          {(!isMobile || searchVisible) && (
            <div className={`sidebar-header__search ${isMobile ? "sidebar-header__search--mobile" : ""}`}>
              <input type="text" placeholder="Rechercher..." />
              <i className="ri-search-line"></i>
            </div>
          )}

          <div className="sidebar-header__right">
            {!isMobile && (
              <>
                <button className="sidebar-header__icon">
                  <i className="ri-notification-3-line"></i>
                </button>
                <button className="sidebar-header__icon">
                  <i className="ri-mail-line"></i>
                </button>
              </>
            )}
            <button className="sidebar-header__icon" onClick={toggleSearch}>
              <i className="ri-search-line"></i>
            </button>
          </div>
        </div>
      </header>

      <nav className={`sidebar-nav ${sidebarOpen ? "sidebar-show" : "sidebar-icon-only"}`}>
        <div className="sidebar-nav__container">
          {!sidebarOpen && !isMobile ? (
            // Sidebar réduite : affiche seulement les icônes
            <div className="sidebar-nav__icon-list">
              {menuItems[0].items.map((item, i) => (
                <Link
                  key={i}
                  to={item.path}
                  className={`sidebar-nav__link ${
                    activeLink === item.path ? "sidebar-active-link" : ""
                  }`}
                  onClick={() => setActiveLink(item.path)}
                  title={item.text}
                >
                  <i className={item.icon}></i>
                </Link>
              ))}
              <div className="sidebar-nav__actions">
                <button
                  onClick={toggleTheme}
                  className="sidebar-nav__link sidebar-nav__theme"
                  title="Theme"
                >
                  <i className={`ri-${darkMode ? "sun" : "moon"}-fill`}></i>
                </button>
                <button className="sidebar-nav__link" title="Déconnexion">
                  <i className="ri-logout-box-r-fill"></i>
                </button>
              </div>
            </div>
          ) : (
            // Sidebar complète
            <>
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
                <button onClick={toggleTheme} className="sidebar-nav__link sidebar-nav__theme">
                  <i className={`ri-${darkMode ? "sun" : "moon"}-fill`}></i>
                  <span>Theme</span>
                </button>
                <button className="sidebar-nav__link">
                  <i className="ri-logout-box-r-fill"></i>
                  <span>Déconnexion</span>
                </button>
              </div>
            </>
          )}
        </div>
      </nav>

      {isMobile && sidebarOpen && (
        <div className="sidebar-overlay" onClick={toggleSidebar}></div>
      )}

      <main className={`sidebar-main ${sidebarOpen ? "sidebar-left-pd" : "sidebar-left-pd-closed"}`}>
        {/* Votre contenu principal ici */}
      </main>
    </div>
  );
};

export default Sidebar;