import React, { useState, useEffect } from 'react';
import {
  Ticket,
  Clock,
  CheckCircle2,
  AlertCircle,
  PlusCircle,
  Flame,
  Layers,
  FolderKanban,
  ArrowRight,
  TrendingUp,
  Bug,
  Lightbulb,
  Sparkles,
  ChevronRight,
  User
} from 'lucide-react';

export default function Dashboard({ onNavigate }) {
  const [metrics, setMetrics] = useState({
    totalTickets: 0,
    pendingTickets: 0,
    inProgressTickets: 0,
    completedTickets: 0,
    highPriority: 0,
    kindStats: { 1: 0, 2: 0, 3: 0, 4: 0 },
    priorityStats: { 1: 0, 2: 0, 3: 0 }
  });
  const [recentTickets, setRecentTickets] = useState([]);
  const [loading, setLoading] = useState(true);

  const loadDashboardData = async () => {
    try {
      if (!window.api || !window.api.query) {
        // Standalone browser fallback
        setMetrics({
          totalTickets: 5,
          pendingTickets: 2,
          inProgressTickets: 1,
          completedTickets: 1,
          highPriority: 2,
          kindStats: { 1: 1, 2: 2, 3: 1, 4: 1 },
          priorityStats: { 1: 2, 2: 2, 3: 1 }
        });
        setRecentTickets([
          {
            id: 1,
            title: 'Error al timbrar factura digital 4.0',
            project_name: 'Sistema ERP Central',
            kind_name: 'Bug',
            kind_id: 2,
            priority_name: 'Alta',
            priority_id: 1,
            status_name: 'En Desarrollo',
            status_id: 2,
            asigned_name: 'Juan Pérez'
          },
          {
            id: 2,
            title: 'Optimizar carga de imágenes en la App Móvil',
            project_name: 'Aplicación Móvil iOS / Android',
            kind_name: 'Característica',
            kind_id: 4,
            priority_name: 'Media',
            priority_id: 2,
            status_name: 'Pendiente',
            status_id: 1,
            asigned_name: 'Ana Martínez'
          }
        ]);
        setLoading(false);
        return;
      }

      // Total tickets & status counts
      const counts = await window.api.query(`
        SELECT 
          count(*) as total,
          SUM(CASE WHEN status_id = 1 THEN 1 ELSE 0 END) as pending,
          SUM(CASE WHEN status_id = 2 THEN 1 ELSE 0 END) as in_progress,
          SUM(CASE WHEN status_id = 3 THEN 1 ELSE 0 END) as completed,
          SUM(CASE WHEN priority_id = 1 AND status_id != 3 AND status_id != 4 THEN 1 ELSE 0 END) as high_priority
        FROM ticket
      `);

      // Kind stats
      const kinds = await window.api.query(`
        SELECT kind_id, count(*) as count FROM ticket GROUP BY kind_id
      `);
      const kMap = { 1: 0, 2: 0, 3: 0, 4: 0 };
      (kinds || []).forEach(k => { kMap[k.kind_id] = k.count; });

      // Priority stats
      const priorities = await window.api.query(`
        SELECT priority_id, count(*) as count FROM ticket WHERE status_id != 3 AND status_id != 4 GROUP BY priority_id
      `);
      const pMap = { 1: 0, 2: 0, 3: 0 };
      (priorities || []).forEach(p => { pMap[p.priority_id] = p.count; });

      // Recent tickets
      const rows = await window.api.query(`
        SELECT 
          t.*,
          p.name as project_name,
          k.name as kind_name,
          pri.name as priority_name,
          s.name as status_name,
          (u.name || ' ' || COALESCE(u.lastname, '')) as asigned_name
        FROM ticket t
        LEFT JOIN project p ON t.project_id = p.id
        LEFT JOIN kind k ON t.kind_id = k.id
        LEFT JOIN priority pri ON t.priority_id = pri.id
        LEFT JOIN status s ON t.status_id = s.id
        LEFT JOIN "user" u ON t.asigned_id = u.id
        ORDER BY t.id DESC
        LIMIT 6
      `);

      setMetrics({
        totalTickets: counts[0]?.total || 0,
        pendingTickets: counts[0]?.pending || 0,
        inProgressTickets: counts[0]?.in_progress || 0,
        completedTickets: counts[0]?.completed || 0,
        highPriority: counts[0]?.high_priority || 0,
        kindStats: kMap,
        priorityStats: pMap
      });
      setRecentTickets(rows || []);
    } catch (err) {
      console.error('Error loading dashboard data:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadDashboardData();
  }, []);

  const getKindBadge = (kindId, kindName) => {
    switch (Number(kindId)) {
      case 2:
        return <span className="badge badge-kind-bug"><Bug size={12} /> {kindName || 'Bug'}</span>;
      case 3:
        return <span className="badge badge-kind-sugerencia"><Lightbulb size={12} /> {kindName || 'Sugerencia'}</span>;
      case 4:
        return <span className="badge badge-kind-caracteristica"><Sparkles size={12} /> {kindName || 'Característica'}</span>;
      default:
        return <span className="badge badge-kind-ticket"><Ticket size={12} /> {kindName || 'Ticket'}</span>;
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
      {/* Banner */}
      <div style={{
        background: 'linear-gradient(135deg, #6366f1 0%, #4338ca 100%)',
        borderRadius: 'var(--radius-large)',
        padding: '24px 28px',
        color: '#ffffff',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        boxShadow: 'var(--elevation-2)'
      }}>
        <div>
          <h2 style={{ fontSize: '1.45rem', fontWeight: 800, letterSpacing: '-0.3px', margin: 0 }}>
            Panel de Control de Incidencias
          </h2>
          <p style={{ opacity: 0.9, fontSize: '0.9rem', marginTop: 4 }}>
            Bienvenido a DeskTicket. Supervise el estado de requerimientos, soporte y desarrollo de software.
          </p>
        </div>
        <div style={{ display: 'flex', gap: 10 }}>
          <button
            className="btn"
            style={{ background: '#ffffff', color: '#4338ca', fontWeight: 700 }}
            onClick={() => onNavigate('tickets', { openCreate: true })}
          >
            <PlusCircle size={18} /> Crear Ticket
          </button>
          <button
            className="btn"
            style={{ background: 'rgba(255, 255, 255, 0.18)', color: '#ffffff', border: '1px solid rgba(255,255,255,0.3)' }}
            onClick={() => onNavigate('projects')}
          >
            <FolderKanban size={18} /> Ver Proyectos
          </button>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="stats-grid">
        <div className="stat-card">
          <div className="stat-icon" style={{ background: '#e0e7ff', color: '#4f46e5' }}>
            <Ticket size={26} />
          </div>
          <div className="stat-info">
            <span className="stat-label">Total de Tickets</span>
            <span className="stat-value">{metrics.totalTickets}</span>
            <span className="stat-sub">Registrados en el sistema</span>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon" style={{ background: '#fef3c7', color: '#d97706' }}>
            <Clock size={26} />
          </div>
          <div className="stat-info">
            <span className="stat-label">Pendientes por Atender</span>
            <span className="stat-value">{metrics.pendingTickets}</span>
            <span className="stat-sub">En cola de espera</span>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon" style={{ background: '#e0f2fe', color: '#0284c7' }}>
            <Layers size={26} />
          </div>
          <div className="stat-info">
            <span className="stat-label">En Desarrollo</span>
            <span className="stat-value">{metrics.inProgressTickets}</span>
            <span className="stat-sub">En proceso de solución</span>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon" style={{ background: '#dcfce7', color: '#16a34a' }}>
            <CheckCircle2 size={26} />
          </div>
          <div className="stat-info">
            <span className="stat-label">Terminados</span>
            <span className="stat-value">{metrics.completedTickets}</span>
            <span className="stat-sub">Resueltos satisfactoriamente</span>
          </div>
        </div>
      </div>

      {/* Main Grid: Recent Tickets + Metrics */}
      <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: 24 }}>
        {/* Recent Tickets */}
        <div className="card">
          <div className="card-header">
            <div>
              <h3 className="card-title">Tickets Recientes</h3>
              <p style={{ fontSize: '0.8rem', color: 'var(--md-on-surface-variant)', marginTop: 2 }}>
                Últimas incidencias y solicitudes reportadas
              </p>
            </div>
            <button
              className="btn btn-secondary btn-sm"
              onClick={() => onNavigate('tickets')}
            >
              Ver Todos <ArrowRight size={14} />
            </button>
          </div>

          <div className="table-responsive">
            {recentTickets.length === 0 ? (
              <div style={{ padding: '40px 20px', textAlign: 'center', color: '#64748b' }}>
                <Ticket size={44} style={{ opacity: 0.4, marginBottom: 12 }} />
                <p style={{ fontWeight: 600 }}>No hay tickets registrados aún</p>
                <p style={{ fontSize: '0.85rem', marginTop: 4 }}>Cree una nueva solicitud pulsando "Crear Ticket"</p>
              </div>
            ) : (
              <table className="data-table">
                <thead>
                  <tr>
                    <th>ID</th>
                    <th>Título</th>
                    <th>Proyecto</th>
                    <th>Tipo</th>
                    <th>Prioridad</th>
                    <th>Estado</th>
                    <th>Asignado</th>
                  </tr>
                </thead>
                <tbody>
                  {recentTickets.map(t => (
                    <tr key={t.id}>
                      <td style={{ fontWeight: 700, color: 'var(--md-primary)' }}>
                        #{t.id}
                      </td>
                      <td style={{ maxWidth: 240 }}>
                        <div style={{ fontWeight: 600, fontSize: '0.88rem' }} title={t.title}>
                          {t.title}
                        </div>
                      </td>
                      <td style={{ fontSize: '0.82rem' }}>
                        {t.project_name || 'General'}
                      </td>
                      <td>
                        {getKindBadge(t.kind_id, t.kind_name)}
                      </td>
                      <td>
                        <span className={`badge badge-priority-${t.priority_id}`}>
                          {t.priority_name || 'Normal'}
                        </span>
                      </td>
                      <td>
                        <span className={`badge badge-status-${t.status_id}`}>
                          {t.status_name || 'Pendiente'}
                        </span>
                      </td>
                      <td style={{ fontSize: '0.82rem', whiteSpace: 'nowrap' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 5 }}>
                          <User size={13} color="#64748b" />
                          {t.asigned_name || 'Sin asignar'}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        </div>

        {/* Side Panel: Priority & Kind Breakdown */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
          {/* Priorities */}
          <div className="card">
            <div className="card-header">
              <h3 className="card-title">Prioridad (Activos)</h3>
            </div>
            <div className="card-body" style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <span style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: '0.88rem' }}>
                  <Flame size={16} color="#ef4444" />
                  Alta Prioridad
                </span>
                <span className="badge badge-priority-1">{metrics.priorityStats[1] || 0}</span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <span style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: '0.88rem' }}>
                  <span style={{ width: 10, height: 10, borderRadius: '50%', background: '#f59e0b' }}></span>
                  Media Prioridad
                </span>
                <span className="badge badge-priority-2">{metrics.priorityStats[2] || 0}</span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <span style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: '0.88rem' }}>
                  <span style={{ width: 10, height: 10, borderRadius: '50%', background: '#10b981' }}></span>
                  Baja Prioridad
                </span>
                <span className="badge badge-priority-3">{metrics.priorityStats[3] || 0}</span>
              </div>
            </div>
          </div>

          {/* Quick links */}
          <div className="card">
            <div className="card-header">
              <h3 className="card-title">Accesos Rápidos</h3>
            </div>
            <div className="card-body" style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
              <button
                className="btn btn-secondary"
                style={{ justifyContent: 'space-between', width: '100%', textAlign: 'left' }}
                onClick={() => onNavigate('projects')}
              >
                <span style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                  <FolderKanban size={16} color="#6366f1" /> Gestión de Proyectos
                </span>
                <ChevronRight size={16} />
              </button>
              <button
                className="btn btn-secondary"
                style={{ justifyContent: 'space-between', width: '100%', textAlign: 'left' }}
                onClick={() => onNavigate('categories')}
              >
                <span style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                  <Layers size={16} color="#0ea5e9" /> Áreas y Categorías
                </span>
                <ChevronRight size={16} />
              </button>
              <button
                className="btn btn-secondary"
                style={{ justifyContent: 'space-between', width: '100%', textAlign: 'left' }}
                onClick={() => onNavigate('reports')}
              >
                <span style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                  <TrendingUp size={16} color="#10b981" /> Reportes de Resolución
                </span>
                <ChevronRight size={16} />
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
