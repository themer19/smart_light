import React from 'react';
import Sidebar from '../components/Sidebar';
import './cssP/statique.css';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  AreaChart,
  Area,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell
} from 'recharts';

// Couleurs modernes pour le thème
const COLORS = {
  primary: '#7c3aed',
  primaryLight: '#8b5cf6',
  success: '#10b981',
  danger: '#ef4444',
  warning: '#f59e0b',
  info: '#3b82f6',
  dark: '#1e293b',
  light: '#f8fafc'
};

const data = [
  { name: 'Lun', actifs: 12, pannes: 3, visites: 45, taux: 78 },
  { name: 'Mar', actifs: 15, pannes: 1, visites: 62, taux: 82 },
  { name: 'Mer', actifs: 11, pannes: 4, visites: 38, taux: 65 },
  { name: 'Jeu', actifs: 13, pannes: 2, visites: 57, taux: 75 },
  { name: 'Ven', actifs: 17, pannes: 0, visites: 84, taux: 91 },
  { name: 'Sam', actifs: 14, pannes: 2, visites: 49, taux: 68 },
  { name: 'Dim', actifs: 16, pannes: 1, visites: 52, taux: 72 },
];

const pieData = [
  { name: 'Actifs', value: 85 },
  { name: 'Maintenance', value: 10 },
  { name: 'Inactifs', value: 5 }
];

const pieColors = [COLORS.success, COLORS.warning, COLORS.danger];

// Mini composant de carte métrique
const MetricCard = ({ title, value, change, isPositive, icon, color }) => (
  <div className="gs-metric-card" style={{ borderBottom: `3px solid ${color}` }}>
    <div className="gs-metric-icon" style={{ backgroundColor: `${color}20` }}>
      {icon}
    </div>
    <div className="gs-metric-content">
      <h4>{title}</h4>
      <p className="gs-metric-value">{value}</p>
      <p className={`gs-metric-change ${isPositive ? 'positive' : 'negative'}`}>
        {isPositive ? <i className="ri-arrow-up-line"></i> : <i className="ri-arrow-down-line"></i>}
        {change}
      </p>
    </div>
  </div>
);

function Statistics() {
  return (
    <div className="gs-container">
      <Sidebar />
      <main className="gs-main-content">
        <div className="gs-dashboard-card">
          {/* En-tête amélioré */}
          <div className="gs-page-header">
            <div className="gs-header-content">
              <div className="gs-title-wrapper">
                <div className="gs-title-icon-container" style={{ background: `linear-gradient(135deg, ${COLORS.primaryLight} 0%, ${COLORS.primary} 100%)` }}>
                  <i className="ri-bar-chart-2-line gs-main-icon"></i>
                </div>
                <div>
                  <h1 className="gs-main-title">
                    Tableau de Bord Statistique
                    <span className="gs-title-underline" style={{ background: `linear-gradient(90deg, ${COLORS.primaryLight} 0%, ${COLORS.primary} 100%)` }}></span>
                  </h1>
                  <p className="gs-subtitle">Analysez les données clés de votre activité en temps réel</p>
                </div>
              </div>
              <div className="gs-period-selector">
                <button className="gs-period-btn active">24h</button>
                <button className="gs-period-btn">7j</button>
                <button className="gs-period-btn">30j</button>
                <button className="gs-period-btn">
                  <i className="ri-calendar-line"></i> Personnalisé
                </button>
              </div>
            </div>
          </div>

          {/* Section des mini-cartes métriques */}
          <div className="gs-metrics-container">
            <MetricCard 
              title="Sites Actifs" 
              value="142" 
              change="12% vs hier" 
              isPositive={true}
              icon={<i className="ri-checkbox-circle-line" style={{ color: COLORS.success }}></i>}
              color={COLORS.success}
            />
            <MetricCard 
              title="Pannes" 
              value="8" 
              change="5% vs hier" 
              isPositive={false}
              icon={<i className="ri-alert-line" style={{ color: COLORS.danger }}></i>}
              color={COLORS.danger}
            />
            <MetricCard 
              title="Visites" 
              value="1,245" 
              change="23% vs hier" 
              isPositive={true}
              icon={<i className="ri-user-line" style={{ color: COLORS.info }}></i>}
              color={COLORS.info}
            />
            <MetricCard 
              title="Taux de réussite" 
              value="89%" 
              change="3% vs hier" 
              isPositive={true}
              icon={<i className="ri-percent-line" style={{ color: COLORS.warning }}></i>}
              color={COLORS.warning}
            />
          </div>

          {/* Graphiques */}
          <div className="gs-charts-grid">
            <div className="gs-chart-card">
              <div className="gs-card-header">
                <h3>Activité des sites (7 jours)</h3>
                <div className="gs-chart-legend">
                  <span><div className="gs-legend-dot" style={{ backgroundColor: COLORS.success }}></div> Actifs</span>
                  <span><div className="gs-legend-dot" style={{ backgroundColor: COLORS.danger }}></div> Pannes</span>
                </div>
              </div>
              <div className="gs-chart-container">
                <ResponsiveContainer width="100%" height={300}>
                  <AreaChart data={data}>
                    <defs>
                      <linearGradient id="colorActifs" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor={COLORS.success} stopOpacity={0.8}/>
                        <stop offset="95%" stopColor={COLORS.success} stopOpacity={0}/>
                      </linearGradient>
                      <linearGradient id="colorPannes" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor={COLORS.danger} stopOpacity={0.8}/>
                        <stop offset="95%" stopColor={COLORS.danger} stopOpacity={0}/>
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                    <XAxis dataKey="name" axisLine={false} tickLine={false} />
                    <YAxis axisLine={false} tickLine={false} />
                    <Tooltip 
                      contentStyle={{
                        borderRadius: '8px',
                        border: 'none',
                        boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)'
                      }}
                    />
                    <Area type="monotone" dataKey="actifs" stroke={COLORS.success} fillOpacity={1} fill="url(#colorActifs)" />
                    <Area type="monotone" dataKey="pannes" stroke={COLORS.danger} fillOpacity={1} fill="url(#colorPannes)" />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </div>

            <div className="gs-chart-card">
              <div className="gs-card-header">
                <h3>Visites quotidiennes</h3>
              </div>
              <div className="gs-chart-container">
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={data}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                    <XAxis dataKey="name" axisLine={false} tickLine={false} />
                    <YAxis axisLine={false} tickLine={false} />
                    <Tooltip 
                      contentStyle={{
                        borderRadius: '8px',
                        border: 'none',
                        boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)'
                      }}
                    />
                    <Bar dataKey="visites" radius={[4, 4, 0, 0]} fill={COLORS.primaryLight} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>

            <div className="gs-chart-card">
              <div className="gs-card-header">
                <h3>Statut des sites</h3>
              </div>
              <div className="gs-chart-container">
                <ResponsiveContainer width="100%" height={300}>
                  <PieChart>
                    <Pie
                      data={pieData}
                      cx="50%"
                      cy="50%"
                      innerRadius={60}
                      outerRadius={90}
                      paddingAngle={5}
                      dataKey="value"
                    >
                      {pieData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={pieColors[index]} />
                      ))}
                    </Pie>
                    <Tooltip 
                      contentStyle={{
                        borderRadius: '8px',
                        border: 'none',
                        boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)'
                      }}
                    />
                    <Legend />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            </div>

            <div className="gs-chart-card">
              <div className="gs-card-header">
                <h3>Taux de réussite (%)</h3>
              </div>
              <div className="gs-chart-container">
                <ResponsiveContainer width="100%" height={300}>
                  <LineChart data={data}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                    <XAxis dataKey="name" axisLine={false} tickLine={false} />
                    <YAxis axisLine={false} tickLine={false} domain={[50, 100]} />
                    <Tooltip 
                      contentStyle={{
                        borderRadius: '8px',
                        border: 'none',
                        boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)'
                      }}
                    />
                    <Line 
                      type="monotone" 
                      dataKey="taux" 
                      stroke={COLORS.info} 
                      strokeWidth={3}
                      dot={{ 
                        fill: COLORS.info,
                        strokeWidth: 2,
                        r: 5,
                        stroke: '#fff'
                      }}
                      activeDot={{ 
                        r: 7, 
                        fill: '#fff',
                        stroke: COLORS.info,
                        strokeWidth: 3
                      }}
                    />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  )
}

export default Statistics