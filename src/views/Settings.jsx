import React, { useState, useEffect } from 'react';
import { Settings as SettingsIcon, Save, Database, Building2, CheckCircle2, RefreshCw, Tag, Flame } from 'lucide-react';

export default function Settings() {
  const [settings, setSettings] = useState({
    title: 'DeskTicket',
    company_name: 'HelpDesk Solutions',
    admin_email: 'admin@deskticket.com'
  });
  const [saved, setSaved] = useState(false);
  const [loading, setLoading] = useState(true);

  const loadSettings = async () => {
    setLoading(true);
    try {
      if (window.api && window.api.query) {
        const rows = await window.api.query('SELECT * FROM setting');
        const map = { ...settings };
        (rows || []).forEach(r => {
          map[r.name] = r.val;
        });
        setSettings(map);
      }
    } catch (err) {
      console.error('Error loading settings:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadSettings();
  }, []);

  const handleSave = async (e) => {
    e.preventDefault();
    try {
      if (window.api && window.api.execute) {
        for (const [key, val] of Object.entries(settings)) {
          await window.api.execute(`
            INSERT INTO setting (name, label, val) 
            VALUES (?, ?, ?)
            ON CONFLICT(name) DO UPDATE SET val = excluded.val
          `, [key, key, val]);
        }
      }
      setSaved(true);
      setTimeout(() => setSaved(false), 3000);
    } catch (err) {
      console.error('Error saving settings:', err);
      alert('Error al guardar configuración');
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
      {/* Header */}
      <div>
        <h2 style={{ fontSize: '1.35rem', fontWeight: 700, color: 'var(--md-on-surface)' }}>
          Configuración del Sistema
        </h2>
        <p style={{ fontSize: '0.85rem', color: 'var(--md-on-surface-variant)' }}>
          Parámetros de la mesa de ayuda, datos de la empresa y base de datos local.
        </p>
      </div>

      {saved && (
        <div style={{
          background: '#d1fae5',
          border: '1px solid #a7f3d0',
          color: '#065f46',
          padding: '12px 18px',
          borderRadius: 'var(--radius-medium)',
          display: 'flex',
          alignItems: 'center',
          gap: 10
        }}>
          <CheckCircle2 size={18} />
          <strong>¡Configuración guardada exitosamente!</strong>
        </div>
      )}

      <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: 24 }}>
        {/* Form */}
        <div className="card">
          <div className="card-header">
            <h3 className="card-title">Parámetros de la Mesa de Ayuda</h3>
          </div>
          <form onSubmit={handleSave}>
            <div className="card-body" style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
              <div className="form-group">
                <label className="form-label">Título del Sistema</label>
                <input
                  type="text"
                  className="form-input"
                  value={settings.title}
                  onChange={(e) => setSettings({ ...settings, title: e.target.value })}
                />
              </div>

              <div className="form-group">
                <label className="form-label">Nombre de la Empresa u Organización</label>
                <input
                  type="text"
                  className="form-input"
                  value={settings.company_name}
                  onChange={(e) => setSettings({ ...settings, company_name: e.target.value })}
                />
              </div>

              <div className="form-group">
                <label className="form-label">Correo Administrativo de Notificaciones</label>
                <input
                  type="email"
                  className="form-input"
                  value={settings.admin_email}
                  onChange={(e) => setSettings({ ...settings, admin_email: e.target.value })}
                />
              </div>

              <div style={{ marginTop: 10 }}>
                <button type="submit" className="btn btn-primary">
                  <Save size={18} /> Guardar Cambios
                </button>
              </div>
            </div>
          </form>
        </div>

        {/* Database & Environment Info */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
          <div className="card">
            <div className="card-header">
              <h3 className="card-title">Base de Datos Local</h3>
            </div>
            <div className="card-body" style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                <Database size={22} color="#6366f1" />
                <div>
                  <div style={{ fontWeight: 600 }}>SQLite 3 Integrado</div>
                  <div style={{ fontSize: '0.78rem', color: '#64748b' }}>deskticket.db</div>
                </div>
              </div>
              <p style={{ fontSize: '0.82rem', color: '#64748b', lineHeight: 1.4 }}>
                Todos los tickets, proyectos e historiales se almacenan localmente en su disco duro de manera rápida y segura sin depender de internet o servidores externos.
              </p>
            </div>
          </div>

          <div className="card">
            <div className="card-header">
              <h3 className="card-title">Acerca de DeskTicket</h3>
            </div>
            <div className="card-body" style={{ fontSize: '0.85rem', display: 'flex', flexDirection: 'column', gap: 8 }}>
              <div><strong>Versión:</strong> 1.0.0</div>
              <div><strong>Arquitectura:</strong> Electron + Vite + React 19</div>
              <div><strong>Base de Datos:</strong> SQLite3</div>
              <div><strong>Esquema:</strong> Supportix v2</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
