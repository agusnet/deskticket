import React, { useState, useEffect } from 'react';
import {
  BarChart3,
  Ticket,
  CheckCircle2,
  Clock,
  Printer,
  TrendingUp,
  User,
  FolderKanban,
  Flame,
  Bug,
  Lightbulb,
  Sparkles
} from 'lucide-react';

export default function Reports() {
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    total: 0,
    pending: 0,
    inProgress: 0,
    completed: 0,
    canceled: 0,
    byProject: [],
    byAgent: [],
    byKind: [],
    byPriority: []
  });

  const loadReportData = async () => {
    setLoading(true);
    try {
      if (!window.api || !window.api.query) {
        setStats({
          total: 5,
          pending: 2,
          inProgress: 1,
          completed: 1,
          canceled: 1,
          byProject: [
            { project_name: 'Sistema ERP Central', total: 2, completed: 1 },
            { project_name: 'Aplicación Móvil iOS / Android', total: 1, completed: 0 }
          ],
          byAgent: [
            { agent_name: 'Juan Pérez García', total: 3, completed: 1 },
            { agent_name: 'Ana Martínez Silva', total: 2, completed: 0 }
          ],
          byKind: [
            { kind_name: 'Bug', count: 2 },
            { kind_name: 'Ticket', count: 1 },
            { kind_name: 'Sugerencia', count: 1 },
            { kind_name: 'Característica', count: 1 }
          ],
          byPriority: [
            { priority_name: 'Alta', count: 2 },
            { priority_name: 'Media', count: 2 },
            { priority_name: 'Baja', count: 1 }
          ]
        });
        setLoading(false);
        return;
      }

      // Overall counts
      const counts = await window.api.query(`
        SELECT 
          count(*) as total,
          SUM(CASE WHEN status_id = 1 THEN 1 ELSE 0 END) as pending,
          SUM(CASE WHEN status_id = 2 THEN 1 ELSE 0 END) as in_progress,
          SUM(CASE WHEN status_id = 3 THEN 1 ELSE 0 END) as completed,
          SUM(CASE WHEN status_id = 4 THEN 1 ELSE 0 END) as canceled
        FROM ticket
      `);

      // By Project
      const projectRows = await window.api.query(`
        SELECT 
          COALESCE(p.name, 'Sin Proyecto') as project_name,
          count(t.id) as total,
          SUM(CASE WHEN t.status_id = 3 THEN 1 ELSE 0 END) as completed
        FROM ticket t
        LEFT JOIN project p ON t.project_id = p.id
        GROUP BY t.project_id
        ORDER BY total DESC
      `);

      // By Agent
      const agentRows = await window.api.query(`
        SELECT 
          COALESCE(u.name || ' ' || COALESCE(u.lastname, ''), 'Sin Asignar') as agent_name,
          count(t.id) as total,
          SUM(CASE WHEN t.status_id = 3 THEN 1 ELSE 0 END) as completed
        FROM ticket t
        LEFT JOIN "user" u ON t.asigned_id = u.id
        GROUP BY t.asigned_id
        ORDER BY total DESC
      `);

      // By Kind
      const kindRows = await window.api.query(`
        SELECT k.name as kind_name, count(t.id) as count
        FROM kind k
        LEFT JOIN ticket t ON t.kind_id = k.id
        GROUP BY k.id
        ORDER BY count DESC
      `);

      // By Priority
      const priorityRows = await window.api.query(`
        SELECT pr.name as priority_name, count(t.id) as count
        FROM priority pr
        LEFT JOIN ticket t ON t.priority_id = pr.id
        GROUP BY pr.id
        ORDER BY pr.id ASC
      `);

      setStats({
        total: counts[0]?.total || 0,
        pending: counts[0]?.pending || 0,
        inProgress: counts[0]?.in_progress || 0,
        completed: counts[0]?.completed || 0,
        canceled: counts[0]?.canceled || 0,
        byProject: projectRows || [],
        byAgent: agentRows || [],
        byKind: kindRows || [],
        byPriority: priorityRows || []
      });
    } catch (err) {
      console.error('Error loading reports:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadReportData();
  }, []);

  const handlePrint = () => {
    window.print();
  };

  const resolutionRate = stats.total > 0 ? Math.round((stats.completed / stats.total) * 100) : 0;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 14 }}>
        <div>
          <h2 style={{ fontSize: '1.35rem', fontWeight: 700, color: 'var(--md-on-surface)' }}>
            Reportes y Rendimiento de Mesa de Ayuda
          </h2>
          <p style={{ fontSize: '0.85rem', color: 'var(--md-on-surface-variant)' }}>
            Estadísticas de resolución de incidencias, carga de trabajo por técnico y proyectos críticos.
          </p>
        </div>

        <button className="btn btn-secondary" onClick={handlePrint}>
          <Printer size={16} /> Imprimir Reporte
        </button>
      </div>

      {/* KPI Cards */}
      <div className="stats-grid">
        <div className="stat-card">
          <div className="stat-icon" style={{ background: '#e0e7ff', color: '#4f46e5' }}>
            <Ticket size={26} />
          </div>
          <div className="stat-info">
            <span className="stat-label">Total de Casos</span>
            <span className="stat-value">{stats.total}</span>
            <span className="stat-sub">Tickets recibidos</span>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon" style={{ background: '#dcfce7', color: '#16a34a' }}>
            <CheckCircle2 size={26} />
          </div>
          <div className="stat-info">
            <span className="stat-label">Tickets Resueltos</span>
            <span className="stat-value">{stats.completed}</span>
            <span className="stat-sub">{resolutionRate}% tasa de resolución</span>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon" style={{ background: '#fef3c7', color: '#d97706' }}>
            <Clock size={26} />
          </div>
          <div className="stat-info">
            <span className="stat-label">En Cola Activa</span>
            <span className="stat-value">{stats.pending + stats.inProgress}</span>
            <span className="stat-sub">{stats.pending} pendientes, {stats.inProgress} en curso</span>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon" style={{ background: '#fee2e2', color: '#dc2626' }}>
            <Flame size={26} />
          </div>
          <div className="stat-info">
            <span className="stat-label">Casos Cancelados</span>
            <span className="stat-value">{stats.canceled}</span>
            <span className="stat-sub">Descartados o duplicados</span>
          </div>
        </div>
      </div>

      {/* Tables Breakdown */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 24 }}>
        {/* By Project */}
        <div className="card">
          <div className="card-header">
            <h3 className="card-title">Carga por Proyecto</h3>
          </div>
          <div className="table-responsive">
            <table className="data-table">
              <thead>
                <tr>
                  <th>Proyecto</th>
                  <th>Total</th>
                  <th>Completados</th>
                  <th>Efectividad</th>
                </tr>
              </thead>
              <tbody>
                {stats.byProject.map((p, idx) => (
                  <tr key={idx}>
                    <td style={{ fontWeight: 600 }}>{p.project_name}</td>
                    <td>{p.total}</td>
                    <td style={{ color: '#16a34a', fontWeight: 600 }}>{p.completed}</td>
                    <td>
                      <span className="badge" style={{ background: '#f1f5f9' }}>
                        {p.total > 0 ? Math.round((p.completed / p.total) * 100) : 0}%
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* By Agent */}
        <div className="card">
          <div className="card-header">
            <h3 className="card-title">Productividad por Técnico</h3>
          </div>
          <div className="table-responsive">
            <table className="data-table">
              <thead>
                <tr>
                  <th>Técnico / Especialista</th>
                  <th>Asignados</th>
                  <th>Resueltos</th>
                </tr>
              </thead>
              <tbody>
                {stats.byAgent.map((a, idx) => (
                  <tr key={idx}>
                    <td style={{ fontWeight: 600 }}>{a.agent_name}</td>
                    <td>{a.total}</td>
                    <td style={{ color: '#16a34a', fontWeight: 600 }}>{a.completed}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}
