import React, { useState, useEffect, useCallback } from "react";
import Sidebar from "../components/Sidebar";
import { Sun, Moon, Cloud, Wind, Droplets, Search, MapPin, CloudRain, CloudSnow } from "lucide-react";
import { Line } from "react-chartjs-2";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
} from "chart.js";
import "./cssP/acc.css";

// Register Chart.js components
ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend);

function Accueil() {
  const [sidebarOpen, setSidebarOpen] = useState(window.innerWidth >= 768);
  const [isMobile, setIsMobile] = useState(window.innerWidth < 768);
  const [recentActivities, setRecentActivities] = useState([]);
  const [loadingActivities, setLoadingActivities] = useState(true);
  const [errorActivities, setErrorActivities] = useState(null);
  const [stats, setStats] = useState([]);
  const [loadingStats, setLoadingStats] = useState(true);
  const [errorStats, setErrorStats] = useState(null);
  const [chartData, setChartData] = useState({ labels: [], datasets: [] });
  const [chartPeriod, setChartPeriod] = useState("7 derniers jours");
  // New state for sites
  const [sites, setSites] = useState([]);
  const [loadingSites, setLoadingSites] = useState(true);
  const [errorSites, setErrorSites] = useState(null);

  useEffect(() => {
    const handleResize = () => {
      const mobile = window.innerWidth < 768;
      setIsMobile(mobile);
      setSidebarOpen(!mobile);
    };

    window.addEventListener("resize", handleResize);
    handleResize();
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  const handleSidebarToggle = () => {
    setSidebarOpen(!sidebarOpen);
  };

  // Fetch stats (active users, active licenses, total sites, and total lines) from APIs
  useEffect(() => {
    const fetchStats = async () => {
      setLoadingStats(true);
      setErrorStats(null);
      try {
        const usersResponse = await fetch("http://localhost:5000/api/users/active-users-count");
        if (!usersResponse.ok) {
          throw new Error("Erreur lors de la récupération des utilisateurs actifs");
        }
        const { count: activeUsersCount } = await usersResponse.json();

        const licensesResponse = await fetch("http://localhost:5000/api/licences/active-licenses-count");
        if (!licensesResponse.ok) {
          throw new Error("Erreur lors de la récupération des licences actives");
        }
        const { count: activeLicensesCount } = await licensesResponse.json();

        const sitesResponse = await fetch("http://localhost:5000/api/site/total-sites-count");
        if (!sitesResponse.ok) {
          throw new Error("Erreur lors de la récupération du nombre total de sites");
        }
        const { count: totalSitesCount } = await sitesResponse.json();

        const linesResponse = await fetch("http://localhost:5000/api/ligne/count");
        if (!linesResponse.ok) {
          throw new Error("Erreur lors de la récupération du nombre total de lignes");
        }
        const { count: totalLinesCount } = await linesResponse.json();

        setStats([
          {
            title: "Utilisateurs actifs",
            value: activeUsersCount.toLocaleString("fr-FR"),
            icon: "ri-user-line",
            trend: "up",
            change: "12%",
            color: "bg-blue-100 text-blue-600",
          },
          {
            title: "Sites surveillés",
            value: totalSitesCount.toLocaleString("fr-FR"),
            icon: "ri-map-pin-line",
            trend: "up",
            change: "5%",
            color: "bg-green-100 text-green-600",
          },
          {
            title: "Lignes",
            value: totalLinesCount.toLocaleString("fr-FR"),
            icon: "ri-route-line",
            trend: "down",
            change: "8%",
            color: "bg-red-100 text-red-600",
          },
          {
            title: "Licences actives",
            value: activeLicensesCount.toLocaleString("fr-FR"),
            icon: "ri-key-line",
            trend: "stable",
            change: "0%",
            color: "bg-purple-100 text-purple-600",
          },
        ]);
      } catch (err) {
        setErrorStats(err.message);
      } finally {
        setLoadingStats(false);
      }
    };

    fetchStats();
  }, []);

  // Fetch recent activities and chart data from API
  useEffect(() => {
    const fetchActivities = async () => {
      setLoadingActivities(true);
      setErrorActivities(null);
      try {
        const response = await fetch("http://localhost:5000/api/dele/logs");
        if (!response.ok) {
          throw new Error("Erreur lors de la récupération des logs de suppression");
        }
        const data = await response.json();

        // Recent activities list
        const sortedData = data.sort((a, b) => new Date(b.deletedAt) - new Date(a.deletedAt));
        const formattedActivities = sortedData.map((log) => {
          const date = new Date(log.deletedAt);
          const timeAgo = Math.floor((Date.now() - date) / 60000);
          const timeText =
            timeAgo < 60
              ? `Il y a ${timeAgo} min`
              : `Il y a ${Math.floor(timeAgo / 60)} heure${Math.floor(timeAgo / 60) > 1 ? "s" : ""}`;
          return {
            user: "Système",
            action: log.lineId
              ? `a supprimé une ligne (Raison: ${log.reason})`
              : log.poteauId
              ? `a supprimé un poteau (Raison: ${log.reason})`
              : `a effectué une suppression (${log.reason})`,
            time: timeText,
            icon: "ri-delete-bin-line",
            color: "text-red-600",
          };
        });
        setRecentActivities(formattedActivities);

        // Chart data aggregation
        const aggregateChartData = () => {
          const labels = [];
          const counts = [];
          const now = new Date();
          let startDate;

          if (chartPeriod === "7 derniers jours") {
            startDate = new Date(now);
            startDate.setDate(now.getDate() - 6);
            for (let i = 0; i < 7; i++) {
              const date = new Date(startDate);
              date.setDate(startDate.getDate() + i);
              labels.push(date.toLocaleDateString("fr-FR", { day: "numeric", month: "short" }));
              const dayCount = data.filter((log) => {
                const logDate = new Date(log.deletedAt);
                return (
                  logDate.getDate() === date.getDate() &&
                  logDate.getMonth() === date.getMonth() &&
                  logDate.getFullYear() === date.getFullYear()
                );
              }).length;
              counts.push(dayCount);
            }
          } else if (chartPeriod === "30 derniers jours") {
            startDate = new Date(now);
            startDate.setDate(now.getDate() - 29);
            for (let i = 0; i < 4; i++) {
              const weekStart = new Date(startDate);
              weekStart.setDate(startDate.getDate() + i * 7);
              const weekEnd = new Date(weekStart);
              weekEnd.setDate(weekStart.getDate() + 6);
              labels.push(`Sem ${i + 1}`);
              const weekCount = data.filter((log) => {
                const logDate = new Date(log.deletedAt);
                return logDate >= weekStart && logDate <= weekEnd;
              }).length;
              counts.push(weekCount);
            }
          } else if (chartPeriod === "Cette année") {
            startDate = new Date(now.getFullYear(), 0, 1);
            for (let i = 0; i < 12; i++) {
              const monthDate = new Date(now.getFullYear(), i, 1);
              labels.push(monthDate.toLocaleDateString("fr-FR", { month: "short" }));
              const monthCount = data.filter((log) => {
                const logDate = new Date(log.deletedAt);
                return logDate.getMonth() === i && logDate.getFullYear() === now.getFullYear();
              }).length;
              counts.push(monthCount);
            }
          }

          setChartData({
            labels,
            datasets: [
              {
                label: "Activités de suppression",
                data: counts,
                borderColor: "rgba(75, 192, 192, 1)",
                backgroundColor: "rgba(75, 192, 192, 0.2)",
                fill: true,
                tension: 0.4,
              },
            ],
          });
        };

        aggregateChartData();
      } catch (err) {
        setErrorActivities(err.message);
      } finally {
        setLoadingActivities(false);
      }
    };

    fetchActivities();
  }, [chartPeriod]);

  // Fetch sites from API
  useEffect(() => {
    const fetchSites = async () => {
      setLoadingSites(true);
      setErrorSites(null);
      try {
        const response = await fetch("http://localhost:5000/api/site/allsite");
        if (!response.ok) {
          throw new Error("Erreur lors de la récupération des sites");
        }
        const data = await response.json();
        setSites(data);
      } catch (err) {
        setErrorSites(err.message);
      } finally {
        setLoadingSites(false);
      }
    };

    fetchSites();
  }, []);

  // WeatherWidget component
  const WeatherWidget = React.memo(() => {
    const [location, setLocation] = useState({ latitude: 36.8, longitude: 10.18 });
    const [cityName, setCityName] = useState("Tunis, TN");
    const [weatherData, setWeatherData] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [searchQuery, setSearchQuery] = useState("");
    const [bgAnimation, setBgAnimation] = useState("clear");
    const [currentDateTime, setCurrentDateTime] = useState(new Date());

    const fetchWeatherData = useCallback(async (lat, lon) => {
      setLoading(true);
      setError(null);
      try {
        const response = await fetch(
          `https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}&current=temperature_2m,wind_speed_10m,relative_humidity_2m,is_day,weather_code,precipitation&daily=sunrise,sunset,weather_code&timezone=auto`
        );
        if (!response.ok) {
          throw new Error(`Erreur de récupération des données météo: ${response.status} ${response.statusText}`);
        }
        const data = await response.json();
        if (!data.current || !data.daily) {
          throw new Error("Données météo incomplètes reçues de l'API");
        }
        setWeatherData({
          current: data.current,
          daily: data.daily,
        });

        const code = data.current.weather_code;
        setBgAnimation(
          code === 0 || code === 1 ? "clear" :
          code >= 2 && code <= 3 ? "cloudy" :
          code >= 45 && code <= 48 ? "foggy" :
          code >= 51 && code <= 82 ? "rainy" :
          code >= 71 && code <= 75 ? "snowy" : "stormy"
        );

        if (!cityName.includes(searchQuery)) {
          try {
            const geoResponse = await fetch(
              `https://geocoding-api.open-meteo.com/v1/reverse?latitude=${lat}&longitude=${lon}&language=fr`
            );
            if (geoResponse.ok) {
              const geoData = await geoResponse.json();
              if (geoData.results && geoData.results.length > 0) {
                setCityName(`${geoData.results[0].name}, ${geoData.results[0].country_code}`);
              } else {
                setCityName("Lieu inconnu");
              }
            } else {
              setCityName("Tunis, TN");
            }
          } catch (geoErr) {
            console.warn("Erreur lors de la récupération du nom de la ville:", geoErr.message);
            setCityName("Tunis, TN");
          }
        }
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    }, [cityName, searchQuery]);

    const searchLocation = async (e) => {
      e.preventDefault();
      if (!searchQuery.trim()) {
        setError("Veuillez entrer une ville");
        return;
      }
      try {
        const response = await fetch(
          `https://geocoding-api.open-meteo.com/v1/search?name=${encodeURIComponent(
            searchQuery
          )}&count=1&language=fr&format=json`
        );
        if (!response.ok) {
          throw new Error(`Ville non trouvée: ${response.status} ${response.statusText}`);
        }
        const data = await response.json();
        if (!data.results || data.results.length === 0) {
          throw new Error("Aucun résultat trouvé pour cette ville");
        }
        const { latitude, longitude } = data.results[0];
        setLocation({ latitude, longitude });
        setCityName(`${data.results[0].name}, ${data.results[5640].country_code}`);
        fetchWeatherData(latitude, longitude);
      } catch (err) {
        setError(err.message);
      }
    };

    useEffect(() => {
      fetchWeatherData(location.latitude, location.longitude);
      const interval = setInterval(() => {
        fetchWeatherData(location.latitude, location.longitude);
      }, 300000);
      return () => clearInterval(interval);
    }, [location, fetchWeatherData]);

    useEffect(() => {
      const timer = setInterval(() => {
        setCurrentDateTime(new Date());
      }, 60000);
      return () => clearInterval(timer);
    }, []);

    const getWeatherDescription = (code) => {
      const weatherCodes = {
        0: "Ciel dégagé",
        1: "Principalement clair",
        2: "Partiellement nuageux",
        3: "Couvert",
        45: "Brouillard",
        48: "Brouillard givrant",
        51: "Bruine légère",
        53: "Bruine modérée",
        55: "Bruine dense",
        61: "Pluie légère",
        63: "Pluie modérée",
        65: "Pluie forte",
        71: "Chute de neige légère",
        73: "Chute de neige modérée",
        75: "Chute de neige forte",
        80: "Averses de pluie légères",
        81: "Averses de pluie modérées",
        82: "Averses de pluie violentes",
        95: "Orage léger ou modéré",
      };
      return weatherCodes[code] || "Conditions inconnues";
    };

    const getWeatherIcon = (code, isDay) => {
      const icons = {
        0: isDay ? <Sun size={64} /> : <Moon size={64} />,
        1: <Cloud size={64} />,
        2: <Cloud size={64} />,
        3: <Cloud size={64} />,
        45: <Cloud size={64} />,
        48: <Cloud size={64} />,
        51: <Droplets size={64} />,
        53: <Droplets size={64} />,
        55: <Droplets size={64} />,
        61: <CloudRain size={64} />,
        63: <CloudRain size={64} />,
        65: <CloudRain size={64} />,
        71: <CloudSnow size={64} />,
        73: <CloudSnow size={64} />,
        75: <CloudSnow size={64} />,
        80: <CloudRain size={64} />,
        81: <CloudRain size={64} />,
        82: <CloudRain size={64} />,
        95: <Cloud size={64} />,
      };
      return icons[code] || <Cloud size={64} />;
    };

    const formattedDate = currentDateTime.toLocaleDateString("fr-FR", {
      weekday: "long",
      day: "numeric",
      month: "long",
    });

    const formattedTime = currentDateTime.toLocaleTimeString("fr-FR", {
      hour: "2-digit",
      minute: "2-digit",
    });

    return (
      <div className={`accueil-weather-card ${bgAnimation}`}>
        <div className="accueil-weather-effects">
          {bgAnimation === "clear" && <div className="sun"></div>}
          {(bgAnimation === "cloudy" || bgAnimation === "clear") && (
            <>
              <div className="cloud cloud-1"></div>
              <div className="cloud cloud-2"></div>
              <div className="cloud cloud-3"></div>
            </>
          )}
          {(bgAnimation === "rainy" || bgAnimation === "stormy") && (
            <>
              <div className="raindrop raindrop-1"></div>
              <div className="raindrop raindrop-2"></div>
              <div className="raindrop raindrop-3"></div>
              <div className="raindrop raindrop-4"></div>
            </>
          )}
          {bgAnimation === "snowy" && (
            <>
              <div className="snowflake snowflake-1"></div>
              <div className="snowflake snowflake-2"></div>
              <div className="snowflake snowflake-3"></div>
              <div className="snowflake snowflake-4"></div>
            </>
          )}
          {bgAnimation === "foggy" && <div className="fog"></div>}
        </div>
        <div className="accueil-weather-header">
          <h3>Météo Actuelle</h3>
          <form onSubmit={searchLocation} className="accueil-weather-search">
            <div className="accueil-search-input-group">
              <MapPin size={18} className="accueil-search-icon" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Rechercher une ville..."
                className="accueil-search-input"
              />
              <button type="submit" className="accueil-search-button">
                <Search size={18} />
              </button>
            </div>
          </form>
        </div>

        {loading && (
          <div className="accueil-weather-loading">
            <div className="accueil-spinner"></div>
            <p>Chargement des données météo...</p>
          </div>
        )}

        {error && (
          <div className="accueil-weather-error">
            <p>{error}</p>
          </div>
        )}

        {weatherData && (
          <div className="accueil-weather-content">
            <div className="accueil-weather-main">
              <div className="accueil-weather-icon">
                {getWeatherIcon(
                  weatherData.current.weather_code,
                  weatherData.current.is_day
                )}
              </div>
              <div className="accueil-weather-temp">
                {Math.round(weatherData.current.temperature_2m)}°C
              </div>
              <div className="accueil-weather-desc">
                {getWeatherDescription(weatherData.current.weather_code)}
              </div>
              <div className="accueil-weather-location">
                <MapPin size={18} />
                <span>{cityName}</span>
              </div>
              <div className="accueil-weather-datetime">
                {formattedDate} à {formattedTime}
              </div>
            </div>
            <div className="accueil-weather-details">
              <div className="accueil-weather-detail">
                <Wind size={18} className="accueil-detail-icon" />
                <span>Vent</span>
                <span>{weatherData.current.wind_speed_10m} km/h</span>
              </div>
              <div className="accueil-weather-detail">
                <Droplets size={18} className="accueil-detail-icon" />
                <span>Humidité</span>
                <span>{weatherData.current.relative_humidity_2m}%</span>
              </div>
              <div className="accueil-weather-detail">
                <CloudRain size={18} className="accueil-detail-icon" />
                <span>Précipitations</span>
                <span>{weatherData.current.precipitation} mm</span>
              </div>
              <div className="accueil-weather-detail">
                <Sun size={18} className="accueil-detail-icon" />
                <span>Lever du soleil</span>
                <span>{new Date(weatherData.daily.sunrise[0]).toLocaleTimeString("fr-FR", { hour: "2-digit", minute: "2-digit" })}</span>
              </div>
              <div className="accueil-weather-detail">
                <Moon size={18} className="accueil-detail-icon" />
                <span>Coucher du soleil</span>
                <span>{new Date(weatherData.daily.sunset[0]).toLocaleTimeString("fr-FR", { hour: "2-digit", minute: "2-digit" })}</span>
              </div>
            </div>
          </div>
        )}
      </div>
    );
  });

  // Chart options
  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: "top",
      },
      title: {
        display: true,
        text: "Activités de suppression",
      },
    },
    scales: {
      y: {
        beginAtZero: true,
        title: {
          display: true,
          text: "Nombre d'activités",
        },
      },
      x: {
        title: {
          display: true,
          text: chartPeriod === "7 derniers jours" ? "Jour" : chartPeriod === "30 derniers jours" ? "Semaine" : "Mois",
        },
      },
    },
  };

  return (
    <div className="accueil-container">
      <Sidebar isOpen={sidebarOpen} onToggle={handleSidebarToggle} />
      <main className={`accueil-main ${!sidebarOpen || isMobile ? "accueil-main-collapsed" : ""}`}>
        <div className="accueil-card">
          <div className="accueil-header">
            <div className="accueil-header-content">
              <div className="accueil-title-wrapper">
                <div className="accueil-title-icon">
                  <i className="ri-home-4-line accueil-main-icon"></i>
                </div>
                <h1 className="accueil-title">Tableau de Bord</h1>
              </div>
              <div className="accueil-header-actions">
                <div className="accueil-date-selector">
                  <i className="ri-calendar-line"></i>
                  <select className="accueil-date-dropdown">
                    <option>Aujourd'hui</option>
                    <option>Cette semaine</option>
                    <option>Ce mois</option>
                  </select>
                </div>
                <button type="button" className="accueil-btn-primary">
                  <i className="ri-download-line"></i>
                  <span>Exporter le rapport</span>
                </button>
              </div>
            </div>
          </div>

          <div className="accueil-weather-section">
            <WeatherWidget />
          </div>

          <div className="accueil-stats-grid">
            {loadingStats && (
              <div className="accueil-stats-loading">
                <div className="accueil-spinner"></div>
                <p>Chargement des statistiques...</p>
              </div>
            )}
            {errorStats && (
              <div className="accueil-stats-error">
                <p>{errorStats}</p>
              </div>
            )}
            {!loadingStats && !errorStats && stats.map((stat, index) => (
              <div key={index} className="accueil-stat-card">
                <div className="accueil-stat-content">
                  <div>
                    <p className="accueil-stat-title">{stat.title}</p>
                    <h3 className="accueil-stat-value">{stat.value}</h3>
                  </div>
                  <div className={`accueil-stat-icon ${stat.color}`}>
                    <i className={stat.icon}></i>
                  </div>
                </div>
                <div className={`accueil-stat-trend ${stat.trend}`}>
                  {stat.trend === "up" ? (
                    <i className="ri-arrow-up-s-fill"></i>
                  ) : stat.trend === "down" ? (
                    <i className="ri-arrow-down-s-fill"></i>
                  ) : (
                    <i className="ri-arrow-right-s-line"></i>
                  )}
                  <span>{stat.change} vs hier</span>
                </div>
              </div>
            ))}
          </div>

          <div className="accueil-content-grid">
            <div className="accueil-chart-card">
              <div className="accueil-card-header">
                <h3>Activité récente</h3>
                <select
                  className="accueil-period-selector"
                  value={chartPeriod}
                  onChange={(e) => setChartPeriod(e.target.value)}
                >
                  <option>7 derniers jours</option>
                  <option>30 derniers jours</option>
                  <option>Cette année</option>
                </select>
              </div>
              {loadingActivities && (
                <div className="accueil-chart-placeholder">
                  <div className="accueil-spinner"></div>
                  <p>Chargement des données d'activité...</p>
                </div>
              )}
              {errorActivities && (
                <div className="accueil-chart-placeholder">
                  <p>{errorActivities}</p>
                </div>
              )}
              {!loadingActivities && !errorActivities && (
                <div style={{ height: "300px" }}>
                  <Line data={chartData} options={chartOptions} />
                </div>
              )}
            </div>

            <div className="accueil-activities-card">
              <div className="accueil-card-header">
                <h3>Activités récentes</h3>
                <button type="button" className="accueil-view-all">
                  Voir tout
                  <i className="ri-arrow-right-s-line"></i>
                </button>
              </div>
              <div className="accueil-activities-list">
                {loadingActivities && (
                  <div className="accueil-activities-loading">
                    <div className="accueil-spinner"></div>
                    <p>Chargement des activités...</p>
                  </div>
                )}
                {errorActivities && (
                  <div className="accueil-activities-error">
                    <p>{errorActivities}</p>
                  </div>
                )}
                {!loadingActivities && !errorActivities && recentActivities.length === 0 && (
                  <div className="accueil-activities-empty">
                    <p>Aucune activité récente</p>
                  </div>
                )}
                {!loadingActivities &&
                  !errorActivities &&
                  recentActivities.slice(0, 4).map((activity, index) => (
                    <div key={index} className="accueil-activity-item">
                      <div className={`accueil-activity-icon ${activity.color}`}>
                        <i className={activity.icon}></i>
                      </div>
                      <div className="accueil-activity-content">
                        <p className="accueil-activity-text">
                          <span className="accueil-activity-user">{activity.user}</span>{" "}
                          {activity.action}
                        </p>
                        <p className="accueil-activity-time">{activity.time}</p>
                      </div>
                    </div>
                  ))}
              </div>
            </div>
          </div>

          <div className="accueil-table-card">
            <div className="accueil-card-header">
              <h3>Sites récemment modifiés</h3>
              <button type="button" className="accueil-view-all">
                Voir tous les sites
                <i className="ri-arrow-right-s-line"></i>
              </button>
            </div>
            <div className="accueil-table-container">
              {loadingSites && (
                <div className="accueil-table-loading">
                  <div className="accueil-spinner"></div>
                  <p>Chargement des sites...</p>
                </div>
              )}
              {errorSites && (
                <div className="accueil-table-error">
                  <p>{errorSites}</p>
                </div>
              )}
              {!loadingSites && !errorSites && sites.length === 0 && (
                <div className="accueil-table-empty">
                  <p>Aucun site disponible</p>
                </div>
              )}
              {!loadingSites && !errorSites && sites.length > 0 && (
                <table className="accueil-table">
                  <thead>
                    <tr>
                      <th>Nom du site</th>
                      <th>Localisation</th>
                      <th>Dernière mise à jour</th>
                      <th>Statut</th>
                    </tr>
                  </thead>
                  <tbody>
                    {sites.slice(0, 3).map((site) => (
                      <tr key={site._id} className="accueil-table-row">
                        <td>
                          <div className="accueil-site-cell">
                            <div className="accueil-site-icon">
                              <i className="ri-building-2-line"></i>
                            </div>
                            <div>
                              <div className="accueil-site-name">{site.nom}</div>
                              <div className="accueil-site-id">ID: {site._id}</div>
                            </div>
                          </div>
                        </td>
                        <td>
                          <div className="accueil-site-location">
                            {`${site.localisation.latitude}, ${site.localisation.longitude}`}
                          </div>
                        </td>
                        <td>
                          <div className="accueil-site-update">
                            {new Date(site.derniereMiseAJour).toLocaleDateString("fr-FR", {
                              year: "numeric",
                              month: "short",
                              day: "numeric",
                              hour: "2-digit",
                              minute: "2-digit",
                            })}
                          </div>
                        </td>
                        <td>
                          <span
                            className={`accueil-site-status ${
                              site.status === "Actif"
                                ? "active"
                                : site.status === "En maintenance"
                                ? "maintenance"
                                : "inactive"
                            }`}
                          >
                            {site.status}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}

export default Accueil;