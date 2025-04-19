import React, { useState } from 'react';
import Sidebar from '../components/Sidebar';
import './cssP/acc.css';

function Accueil() {
  // Données de démonstration
  const stats = [
    { title: "Utilisateurs actifs", value: "1,248", icon: "ri-user-line", trend: "up", change: "12%", color: "bg-blue-100 text-blue-600" },
    { title: "Sites surveillés", value: "86", icon: "ri-map-pin-line", trend: "up", change: "5%", color: "bg-green-100 text-green-600" },
    { title: "Alertes aujourd'hui", value: "24", icon: "ri-alarm-warning-line", trend: "down", change: "8%", color: "bg-red-100 text-red-600" },
    { title: "Licences actives", value: "42", icon: "ri-key-line", trend: "stable", change: "0%", color: "bg-purple-100 text-purple-600" }
  ];

  const recentActivities = [
    { user: "Jean Dupont", action: "a ajouté un nouveau site", time: "Il y a 5 min", icon: "ri-add-circle-line", color: "text-blue-500" },
    { user: "Marie Petit", action: "a résolu une alerte", time: "Il y a 12 min", icon: "ri-checkbox-circle-line", color: "text-green-500" },
    { user: "Luc Durand", action: "a mis à jour les licences", time: "Il y a 25 min", icon: "ri-refresh-line", color: "text-purple-500" },
    { user: "Sophie Martin", action: "a créé un rapport", time: "Il y a 1 heure", icon: "ri-file-chart-line", color: "text-yellow-500" }
  ];

  return (
    <div className="gs-container">
      <Sidebar />
      <main className="gs-main-content">
        <div className="gs-dashboard-card">
          {/* En-tête */}
          <div className="gs-page-header">
  <div className="gs-header-content">
    <div className="gs-title-wrapper">
      <div className="gs-title-icon-container" style={{
        background: 'linear-gradient(135deg, #6366F1 0%, #8B5CF6 100%)',
        boxShadow: '0 4px 6px rgba(99, 102, 241, 0.3)'
      }}>
        <i className="ri-home-4-line gs-main-icon" style={{ color: 'white' }}></i>
      </div>
      <div>
        <h1 className="gs-main-title" style={{ color: '#1E293B' }}>
          Tableau de Bord
          <span className="gs-title-underline" style={{
            background: 'linear-gradient(90deg, #6366F1 0%, #8B5CF6 100%)',
            height: '3px',
            display: 'block',
            width: '120px',
            marginTop: '8px'
          }}></span>
        </h1>
        <p className="gs-subtitle" style={{ color: '#64748B' }}>
          Bienvenue dans votre espace de gestion
        </p>
      </div>
    </div>
    <div className="gs-header-actions">
      <div className="gs-date-selector">
        <i className="ri-calendar-line gs-date-icon"></i>
        <select className="gs-date-dropdown">
          <option>Aujourd'hui</option>
          <option>Cette semaine</option>
          <option>Ce mois</option>
        </select>
      </div>
      <button className="gs-btn-primary gs-export-btn">
        <i className="ri-download-line"></i>
        <span>Exporter le rapport</span>
      </button>
    </div>
  </div>
</div>

         {/* Statistiques */}
<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mt-8">
  {stats.map((stat, index) => (
    <div key={index} className="bg-white p-6 rounded-2xl shadow-md border border-gray-100 transition-all hover:shadow-lg">
      <div className="flex justify-between items-start">
        <div>
          <p className="text-gray-600 text-sm font-medium mb-1">{stat.title}</p>
          <h3 className="text-2xl font-bold text-gray-800">{stat.value}</h3>
        </div>
        <div className={`p-3 rounded-xl ${stat.color} bg-opacity-20`}>
          <i className={`${stat.icon} text-xl ${stat.color.replace('bg-', 'text-')}`}></i>
        </div>
      </div>
      <div className={`mt-4 flex items-center text-sm font-medium ${stat.trend === 'up' ? 'text-emerald-500' : stat.trend === 'down' ? 'text-rose-500' : 'text-gray-500'}`}>
        {stat.trend === 'up' ? (
          <i className="ri-arrow-up-s-fill mr-1"></i>
        ) : stat.trend === 'down' ? (
          <i className="ri-arrow-down-s-fill mr-1"></i>
        ) : (
          <i className="ri-arrow-right-s-line mr-1"></i>
        )}
        <span>{stat.change} vs hier</span>
      </div>
    </div>
  ))}
</div>

{/* Graphiques et contenu principal */}
<div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mt-8">
  {/* Graphique principal */}
  <div className="bg-white p-6 rounded-2xl shadow-md border border-gray-100 lg:col-span-2">
    <div className="flex justify-between items-center mb-6">
      <h3 className="font-semibold text-lg text-gray-800">Activité récente</h3>
      <select className="text-sm border border-gray-200 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500">
        <option>7 derniers jours</option>
        <option>30 derniers jours</option>
        <option>Cette année</option>
      </select>
    </div>
    <div className="h-80 bg-gradient-to-br from-gray-50 to-gray-100 rounded-xl flex items-center justify-center">
      <div className="text-center p-6">
        <i className="ri-line-chart-line text-4xl text-gray-300 mb-3"></i>
        <p className="text-gray-400 font-medium">Visualisation des données d'activité</p>
        <p className="text-gray-400 text-sm mt-1">Intégrez votre librairie de graphiques</p>
      </div>
    </div>
  </div>

  {/* Activités récentes */}
  <div className="bg-white p-6 rounded-2xl shadow-md border border-gray-100">
    <div className="flex justify-between items-center mb-6">
      <h3 className="font-semibold text-lg text-gray-800">Activités récentes</h3>
      <button className="text-indigo-600 hover:text-indigo-800 text-sm font-medium flex items-center transition-colors">
        Voir tout
        <i className="ri-arrow-right-s-line ml-1"></i>
      </button>
    </div>
    <div className="space-y-5">
      {recentActivities.map((activity, index) => (
        <div key={index} className="flex items-start group">
          <div className={`p-3 rounded-xl ${activity.color} bg-opacity-20 mr-4 flex-shrink-0`}>
            <i className={`${activity.icon} text-lg ${activity.color}`}></i>
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium text-gray-800 truncate group-hover:text-indigo-600 transition-colors">
              <span className="font-semibold">{activity.user}</span> {activity.action}
            </p>
            <p className="text-xs text-gray-500 mt-1">{activity.time}</p>
          </div>
        </div>
      ))}
    </div>
  </div>
</div>

{/* Tableau rapide */}
<div className="bg-white p-6 rounded-2xl shadow-md border border-gray-100 mt-8">
  <div className="flex justify-between items-center mb-6">
    <h3 className="font-semibold text-lg text-gray-800">Sites récemment modifiés</h3>
    <button className="text-indigo-600 hover:text-indigo-800 text-sm font-medium flex items-center transition-colors">
      Voir tous les sites
      <i className="ri-arrow-right-s-line ml-1"></i>
    </button>
  </div>
  <div className="overflow-x-auto">
    <table className="min-w-full divide-y divide-gray-200">
      <thead className="bg-gray-50">
        <tr>
          <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Nom du site</th>
          <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Localisation</th>
          <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Dernière mise à jour</th>
          <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Statut</th>
        </tr>
      </thead>
      <tbody className="bg-white divide-y divide-gray-200">
        {[1, 2, 3].map((item) => (
          <tr key={item} className="hover:bg-gray-50 transition-colors">
            <td className="px-6 py-4 whitespace-nowrap">
              <div className="flex items-center">
                <div className="flex-shrink-0 h-10 w-10 bg-indigo-50 rounded-lg flex items-center justify-center mr-4">
                  <i className="ri-building-2-line text-indigo-600"></i>
                </div>
                <div>
                  <div className="text-sm font-medium text-gray-900">Site {item}</div>
                  <div className="text-xs text-gray-500">ID: {1000 + item}</div>
                </div>
              </div>
            </td>
            <td className="px-6 py-4 whitespace-nowrap">
              <div className="text-sm text-gray-900">{['Paris', 'Lyon', 'Marseille'][item-1]}</div>
            </td>
            <td className="px-6 py-4 whitespace-nowrap">
              <div className="text-sm text-gray-500">2023-06-{15 + item}</div>
            </td>
            <td className="px-6 py-4 whitespace-nowrap">
              <span className={`px-3 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${
                item % 3 === 0 
                  ? 'bg-rose-100 text-rose-800' 
                  : item % 3 === 1 
                    ? 'bg-emerald-100 text-emerald-800' 
                    : 'bg-amber-100 text-amber-800'
              }`}>
                {item % 3 === 0 ? 'Inactif' : item % 3 === 1 ? 'Actif' : 'Maintenance'}
              </span>
            </td>
          </tr>
        ))}
      </tbody>
    </table>
  </div>
</div>
        </div>
      </main>
    </div>
  );
}

export default Accueil;