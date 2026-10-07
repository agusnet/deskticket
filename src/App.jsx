import React, { useState, useEffect } from 'react';
import {
  LayoutDashboard,
  Ticket,
  FolderKanban,
  Layers,
  BarChart3,
  UserCheck,
  Settings as SettingsIcon,
  LogOut,
  PanelLeftClose,
  PanelLeftOpen,
  Calendar
} from 'lucide-react';
import './App.css';

// Views
import Login from './views/Login';
import Dashboard from './views/Dashboard';
import Tickets from './views/Tickets';
import Projects from './views/Projects';
import Categories from './views/Categories';
import Reports from './views/Reports';
import UsersView from './views/Users';
import Settings from './views/Settings';

export default function App() {
  const [user, setUser] = useState(null);
  const [currentTab, setCurrentTab] = useState('dashboard');
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [pendingTicketCount, setPendingTicketCount] = useState(0);
  const [tabParams, setTabParams] = useState({});

  const updatePendingCount = async () => {
    try {
      if (window.api && window.api.query) {
        const rows = await window.api.query('SELECT count(*) as count FROM ticket WHERE status_id = 1');
        setPendingTicketCount(rows[0]?.count || 0);
      }
    } catch (err) {
      console.error('Error fetching pending ticket count:', err);
    }
  };

  useEffect(() => {
    if (user) {
      updatePendingCount();
      const interval = setInterval(updatePendingCount, 15000);
      return () => clearInterval(interval);
    }
  }, [user]);

  const handleNavigate = (tab, params = {}) => {
    setTabParams(params);
    setCurrentTab(tab);
    updatePendingCount();
  };

  const handleLogout = () => {
    setUser(null);
    setCurrentTab('dashboard');
  };

  if (!user) {
    return <Login onLoginSuccess={(u) => setUser(u)} />;
  }

  const navItems = [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
    {
      id: 'tickets',
      label: 'Tickets',
      icon: Ticket,
      badge: pendingTicketCount > 0 ? pendingTicketCount : null
    },
    { id: 'projects', label: 'Proyectos', icon: FolderKanban },
    { id: 'categories', label: 'Categorías', icon: Layers },
    { id: 'reports', label: 'Reportes', icon: BarChart3 },
    { id: 'users', label: 'Usuarios', icon: UserCheck },
    { id: 'settings', label: 'Configuración', icon: SettingsIcon },
  ];

  const getHeaderTitle = () => {
    switch (currentTab) {
      case 'dashboard':
        return { title: 'Dashboard General', sub: 'Métricas clave y estado de incidencias' };
      case 'tickets':
        return { title: 'Mesa de Tickets', sub: 'Gestión y seguimiento de requerimientos' };
      case 'projects':
        return { title: 'Proyectos y Sistemas', sub: 'Catálogo de aplicaciones y módulos' };
      case 'categories':
        return { title: 'Categorías de Incidencias', sub: 'Áreas y especialidades técnicas' };
      case 'reports':
        return { title: 'Reportes de Rendimiento', sub: 'Métricas de resolución y productividad' };
      case 'users':
        return { title: 'Personal y Técnicos', sub: 'Gestión de agentes y administradores' };
      case 'settings':
        return { title: 'Configuración', sub: 'Parámetros del sistema y base de datos' };
      default:
        return { title: 'DeskTicket', sub: 'Soporte y Mesa de Ayuda' };
    }
  };

  const headerInfo = getHeaderTitle();
  const todayFormatted = new Intl.DateTimeFormat('es-MX', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
    year: 'numeric'
  }).format(new Date());

  return (
    <div className="app-container">
      {/* Dark Sidebar */}
      <aside className={`sidebar ${isCollapsed ? 'collapsed' : ''}`}>
        {/* Exactly 68px header aligned with right content header */}
        <div className="sidebar-header">
          {!isCollapsed && (
            <div className="logo-area">
              <div className="logo-icon-box">
                <Ticket size={22} />
              </div>
              <div className="logo-text">
                <span className="logo-title">DeskTicket</span>
                <span className="logo-subtitle">Mesa de Ayuda</span>
              </div>
            </div>
          )}

          <button
            className="sidebar-toggle-btn"
            onClick={() => setIsCollapsed(!isCollapsed)}
            title={isCollapsed ? 'Expandir menú' : 'Colapsar menú'}
          >
            {isCollapsed ? <PanelLeftOpen size={18} /> : <PanelLeftClose size={18} />}
          </button>
        </div>

        {/* Navigation list */}
        <nav className="sidebar-nav">
          {!isCollapsed && <div className="nav-section-title">Incidencias</div>}
          {navItems.slice(0, 4).map((item) => {
            const Icon = item.icon;
            const isActive = currentTab === item.id;
            return (
              <div
                key={item.id}
                className={`nav-item ${isActive ? 'active' : ''}`}
                onClick={() => handleNavigate(item.id)}
                title={isCollapsed ? item.label : undefined}
              >
                <Icon size={20} />
                {!isCollapsed && <span>{item.label}</span>}
                {!isCollapsed && item.badge && (
                  <span className="nav-badge" title="Tickets pendientes">
                    {item.badge}
                  </span>
                )}
              </div>
            );
          })}

          {!isCollapsed && <div className="nav-section-title">Administración</div>}
          {navItems.slice(4).map((item) => {
            const Icon = item.icon;
            const isActive = currentTab === item.id;
            return (
              <div
                key={item.id}
                className={`nav-item ${isActive ? 'active' : ''}`}
                onClick={() => handleNavigate(item.id)}
                title={isCollapsed ? item.label : undefined}
              >
                <Icon size={20} />
                {!isCollapsed && <span>{item.label}</span>}
              </div>
            );
          })}
        </nav>

        {/* Footer with logged user */}
        <div className="sidebar-footer">
          <div className="user-profile">
            <div className="avatar" title={user.name || user.username}>
              {(user.name || user.username || 'A').charAt(0).toUpperCase()}
            </div>
            {!isCollapsed && (
              <div className="user-info">
                <span className="user-name">{user.name || user.username}</span>
                <span className="user-role">{user.kind === 1 ? 'Administrador' : 'Técnico'}</span>
              </div>
            )}
          </div>

          {!isCollapsed && (
            <button className="logout-btn" onClick={handleLogout} title="Cerrar Sesión">
              <LogOut size={18} />
            </button>
          )}
        </div>
      </aside>

      {/* Main Content Area */}
      <main className="main-content">
        {/* Exactly 68px header aligned with sidebar header */}
        <header className="content-header">
          <div className="header-title-box">
            <div>
              <h1 className="header-title">{headerInfo.title}</h1>
              <span className="header-subtitle">{headerInfo.sub}</span>
            </div>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
            <div style={{
              display: 'flex',
              alignItems: 'center',
              gap: 8,
              fontSize: '0.85rem',
              color: 'var(--md-on-surface-variant)',
              background: 'var(--md-surface-variant)',
              padding: '6px 14px',
              borderRadius: 'var(--radius-full)'
            }}>
              <Calendar size={15} color="var(--md-primary)" />
              <span style={{ textTransform: 'capitalize' }}>{todayFormatted}</span>
            </div>
          </div>
        </header>

        {/* Dynamic View Body */}
        <div className="content-body">
          {currentTab === 'dashboard' && (
            <Dashboard onNavigate={handleNavigate} />
          )}

          {currentTab === 'tickets' && (
            <Tickets
              initialOpenCreate={Boolean(tabParams.openCreate)}
              currentUser={user}
            />
          )}

          {currentTab === 'projects' && <Projects />}
          {currentTab === 'categories' && <Categories />}
          {currentTab === 'reports' && <Reports />}
          {currentTab === 'users' && <UsersView currentUser={user} />}
          {currentTab === 'settings' && <Settings />}
        </div>
      </main>
    </div>
  );
}
