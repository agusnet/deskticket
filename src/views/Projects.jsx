import React, { useState, useEffect } from 'react';
import { FolderKanban, Plus, Edit2, Trash2, Search, X, RefreshCw, Ticket, CheckCircle2 } from 'lucide-react';

export default function Projects() {
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');

  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [formData, setFormData] = useState({ name: '', description: '' });

  const loadProjects = async () => {
    setLoading(true);
    try {
      if (!window.api || !window.api.query) {
        setProjects([
          { id: 1, name: 'Sistema ERP Central', description: 'Plataforma empresarial de contabilidad.', total_tickets: 2, pending_tickets: 1 },
          { id: 2, name: 'Aplicación Móvil iOS / Android', description: 'App para clientes finales.', total_tickets: 1, pending_tickets: 1 },
          { id: 3, name: 'Portal Web Corporativo', description: 'Sitio web principal.', total_tickets: 1, pending_tickets: 1 },
          { id: 4, name: 'Infraestructura y Redes', description: 'Servidores y redes.', total_tickets: 1, pending_tickets: 1 }
        ]);
        setLoading(false);
        return;
      }

      const rows = await window.api.query(`
        SELECT 
          p.*,
          (SELECT count(*) FROM ticket t WHERE t.project_id = p.id) as total_tickets,
          (SELECT count(*) FROM ticket t WHERE t.project_id = p.id AND t.status_id = 1) as pending_tickets
        FROM project p
        ORDER BY p.name ASC
      `);
      setProjects(rows || []);
    } catch (err) {
      console.error('Error loading projects:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadProjects();
  }, []);

  const handleOpenCreate = () => {
    setEditingId(null);
    setFormData({ name: '', description: '' });
    setIsModalOpen(true);
  };

  const handleOpenEdit = (p) => {
    setEditingId(p.id);
    setFormData({ name: p.name || '', description: p.description || '' });
    setIsModalOpen(true);
  };

  const handleSave = async (e) => {
    e.preventDefault();
    if (!formData.name.trim()) return;

    try {
      if (window.api && window.api.execute) {
        if (editingId) {
          await window.api.execute('UPDATE project SET name = ?, description = ? WHERE id = ?', [formData.name.trim(), formData.description, editingId]);
        } else {
          await window.api.execute('INSERT INTO project (name, description) VALUES (?, ?)', [formData.name.trim(), formData.description]);
        }
      }
      setIsModalOpen(false);
      loadProjects();
    } catch (err) {
      console.error('Error saving project:', err);
      alert('Error al guardar el proyecto');
    }
  };

  const handleDelete = async (pId) => {
    if (!window.confirm('¿Está seguro de eliminar este proyecto? Los tickets asociados quedarán sin proyecto asignado.')) return;
    try {
      if (window.api && window.api.execute) {
        await window.api.execute('DELETE FROM project WHERE id = ?', [pId]);
        loadProjects();
      }
    } catch (err) {
      console.error('Error deleting project:', err);
    }
  };

  const filteredProjects = projects.filter(p =>
    (p.name && p.name.toLowerCase().includes(searchTerm.toLowerCase())) ||
    (p.description && p.description.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 14 }}>
        <div>
          <h2 style={{ fontSize: '1.35rem', fontWeight: 700, color: 'var(--md-on-surface)' }}>
            Proyectos y Sistemas
          </h2>
          <p style={{ fontSize: '0.85rem', color: 'var(--md-on-surface-variant)' }}>
            Gestión de aplicaciones, módulos o servicios a los que se asocian los tickets.
          </p>
        </div>

        <div style={{ display: 'flex', gap: 10 }}>
          <button className="btn btn-secondary" onClick={loadProjects}>
            <RefreshCw size={16} /> Refrescar
          </button>
          <button className="btn btn-primary" onClick={handleOpenCreate}>
            <Plus size={18} /> Nuevo Proyecto
          </button>
        </div>
      </div>

      {/* Filter */}
      <div className="card" style={{ padding: '14px 20px' }}>
        <div className="filter-bar">
          <div className="search-box" style={{ flex: 1 }}>
            <Search size={18} color="#64748b" />
            <input
              type="text"
              placeholder="Buscar proyecto..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <span style={{ fontSize: '0.85rem', color: '#64748b' }}>
            Total: <strong>{filteredProjects.length}</strong> proyectos
          </span>
        </div>
      </div>

      {/* Table */}
      <div className="card">
        <div className="table-responsive">
          <table className="data-table">
            <thead>
              <tr>
                <th style={{ width: 80 }}>ID</th>
                <th>Nombre del Proyecto</th>
                <th>Descripción</th>
                <th>Tickets Activos</th>
                <th>Pendientes</th>
                <th style={{ textAlign: 'right' }}>Acciones</th>
              </tr>
            </thead>
            <tbody>
              {filteredProjects.map((p) => (
                <tr key={p.id}>
                  <td style={{ color: '#64748b', fontWeight: 600 }}>#{p.id}</td>
                  <td>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8, fontWeight: 700, color: 'var(--md-on-surface)' }}>
                      <FolderKanban size={18} color="var(--md-primary)" />
                      {p.name}
                    </div>
                  </td>
                  <td style={{ maxWidth: 320, fontSize: '0.85rem', color: '#475569' }}>
                    {p.description || 'Sin descripción'}
                  </td>
                  <td>
                    <span className="badge" style={{ background: '#e0e7ff', color: '#4338ca' }}>
                      <Ticket size={12} /> {p.total_tickets || 0} tickets
                    </span>
                  </td>
                  <td>
                    <span className="badge" style={{ background: '#fef3c7', color: '#b45309' }}>
                      {p.pending_tickets || 0} pendientes
                    </span>
                  </td>
                  <td style={{ textAlign: 'right' }}>
                    <div style={{ display: 'inline-flex', alignItems: 'center', gap: 4 }}>
                      <button className="btn-icon" onClick={() => handleOpenEdit(p)} title="Editar">
                        <Edit2 size={16} />
                      </button>
                      <button className="btn-icon" style={{ color: '#dc2626' }} onClick={() => handleDelete(p.id)} title="Eliminar">
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal */}
      {isModalOpen && (
        <div className="modal-overlay">
          <div className="modal-content">
            <div className="modal-header">
              <h3 className="modal-title">
                {editingId ? 'Editar Proyecto' : 'Crear Nuevo Proyecto'}
              </h3>
              <button className="btn-icon" onClick={() => setIsModalOpen(false)}>
                <X size={20} />
              </button>
            </div>
            <form onSubmit={handleSave}>
              <div className="modal-body">
                <div className="form-group">
                  <label className="form-label">Nombre del Proyecto *</label>
                  <input
                    type="text"
                    className="form-input"
                    placeholder="Ej. App Android, Web Corporativa..."
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    required
                    autoFocus
                  />
                </div>
                <div className="form-group">
                  <label className="form-label">Descripción</label>
                  <textarea
                    rows={3}
                    className="form-input"
                    placeholder="Objetivo y alcance del proyecto..."
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  />
                </div>
              </div>
              <div className="modal-footer">
                <button type="button" className="btn btn-secondary" onClick={() => setIsModalOpen(false)}>
                  Cancelar
                </button>
                <button type="submit" className="btn btn-primary">
                  {editingId ? 'Guardar Cambios' : 'Crear Proyecto'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
