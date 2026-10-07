import React, { useState, useEffect } from 'react';
import {
  Ticket,
  Plus,
  Search,
  Filter,
  CheckCircle2,
  Clock,
  AlertCircle,
  XCircle,
  Eye,
  Edit2,
  Trash2,
  Bug,
  Lightbulb,
  Sparkles,
  Layers,
  FolderKanban,
  User,
  X,
  RefreshCw,
  Flame,
  FileText
} from 'lucide-react';

export default function Tickets({ initialOpenCreate = false, currentUser }) {
  const [tickets, setTickets] = useState([]);
  const [projects, setProjects] = useState([]);
  const [categories, setCategories] = useState([]);
  const [kinds, setKinds] = useState([]);
  const [statuses, setStatuses] = useState([]);
  const [priorities, setPriorities] = useState([]);
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);

  // Filters
  const [searchTerm, setSearchTerm] = useState('');
  const [projectFilter, setProjectFilter] = useState('ALL');
  const [categoryFilter, setCategoryFilter] = useState('ALL');
  const [kindFilter, setKindFilter] = useState('ALL');
  const [priorityFilter, setPriorityFilter] = useState('ALL');
  const [statusFilter, setStatusFilter] = useState('ALL');

  // Modals
  const [isModalOpen, setIsModalOpen] = useState(initialOpenCreate);
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);
  const [selectedTicket, setSelectedTicket] = useState(null);
  const [editingId, setEditingId] = useState(null);

  // Form State
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    project_id: '',
    category_id: '',
    kind_id: 1,
    priority_id: 1,
    status_id: 1,
    asigned_id: ''
  });

  const loadData = async () => {
    setLoading(true);
    try {
      if (!window.api || !window.api.query) {
        // Fallback for testing
        setTickets([
          {
            id: 1,
            title: 'Error al timbrar factura digital 4.0',
            description: 'El servicio SAT regresa código de error 301 cuando el RFC incluye caracteres especiales.',
            created_at: '2026-10-01 10:00:00',
            updated_at: '2026-10-01 11:30:00',
            kind_id: 2,
            kind_name: 'Bug',
            priority_id: 1,
            priority_name: 'Alta',
            status_id: 2,
            status_name: 'En Desarrollo',
            project_id: 1,
            project_name: 'Sistema ERP Central',
            category_id: 1,
            category_name: 'Desarrollo / Backend',
            asigned_id: 2,
            asigned_name: 'Juan Pérez García',
            creator_name: 'Administrador'
          },
          {
            id: 2,
            title: 'Optimizar carga de imágenes en la App Móvil',
            description: 'Las fotos de perfil tardan más de 3 segundos en mostrarse.',
            created_at: '2026-10-01 14:00:00',
            updated_at: '2026-10-01 14:00:00',
            kind_id: 4,
            kind_name: 'Característica',
            priority_id: 2,
            priority_name: 'Media',
            status_id: 1,
            status_name: 'Pendiente',
            project_id: 2,
            project_name: 'Aplicación Móvil iOS / Android',
            category_id: 2,
            category_name: 'Diseño / Frontend',
            asigned_id: 3,
            asigned_name: 'Ana Martínez Silva',
            creator_name: 'Administrador'
          }
        ]);
        setProjects([
          { id: 1, name: 'Sistema ERP Central' },
          { id: 2, name: 'Aplicación Móvil iOS / Android' }
        ]);
        setCategories([
          { id: 1, name: 'Desarrollo / Backend' },
          { id: 2, name: 'Diseño / Frontend' }
        ]);
        setKinds([
          { id: 1, name: 'Ticket' },
          { id: 2, name: 'Bug' },
          { id: 3, name: 'Sugerencia' },
          { id: 4, name: 'Característica' }
        ]);
        setStatuses([
          { id: 1, name: 'Pendiente' },
          { id: 2, name: 'En Desarrollo' },
          { id: 3, name: 'Terminado' },
          { id: 4, name: 'Cancelado' }
        ]);
        setPriorities([
          { id: 1, name: 'Alta' },
          { id: 2, name: 'Media' },
          { id: 3, name: 'Baja' }
        ]);
        setUsers([
          { id: 1, name: 'Administrador', lastname: 'General' },
          { id: 2, name: 'Juan', lastname: 'Pérez García' },
          { id: 3, name: 'Ana', lastname: 'Martínez Silva' }
        ]);
        setLoading(false);
        return;
      }

      // SQLite queries
      const ticketRows = await window.api.query(`
        SELECT 
          t.*,
          p.name as project_name,
          c.name as category_name,
          k.name as kind_name,
          pri.name as priority_name,
          s.name as status_name,
          (u_asigned.name || ' ' || COALESCE(u_asigned.lastname, '')) as asigned_name,
          (u_creator.name || ' ' || COALESCE(u_creator.lastname, '')) as creator_name
        FROM ticket t
        LEFT JOIN project p ON t.project_id = p.id
        LEFT JOIN category c ON t.category_id = c.id
        LEFT JOIN kind k ON t.kind_id = k.id
        LEFT JOIN priority pri ON t.priority_id = pri.id
        LEFT JOIN status s ON t.status_id = s.id
        LEFT JOIN "user" u_asigned ON t.asigned_id = u_asigned.id
        LEFT JOIN "user" u_creator ON t.user_id = u_creator.id
        ORDER BY t.id DESC
      `);

      const pRows = await window.api.query('SELECT * FROM project ORDER BY name ASC');
      const cRows = await window.api.query('SELECT * FROM category ORDER BY name ASC');
      const kRows = await window.api.query('SELECT * FROM kind ORDER BY id ASC');
      const sRows = await window.api.query('SELECT * FROM status ORDER BY id ASC');
      const prRows = await window.api.query('SELECT * FROM priority ORDER BY id ASC');
      const uRows = await window.api.query('SELECT id, name, lastname, username FROM "user" WHERE is_active = 1 ORDER BY name ASC');

      setTickets(ticketRows || []);
      setProjects(pRows || []);
      setCategories(cRows || []);
      setKinds(kRows || []);
      setStatuses(sRows || []);
      setPriorities(prRows || []);
      setUsers(uRows || []);

      if (pRows && pRows.length > 0 && !formData.project_id) {
        setFormData(prev => ({ ...prev, project_id: pRows[0].id }));
      }
      if (cRows && cRows.length > 0 && !formData.category_id) {
        setFormData(prev => ({ ...prev, category_id: cRows[0].id }));
      }
    } catch (err) {
      console.error('Error loading tickets data:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleOpenCreate = () => {
    setEditingId(null);
    setFormData({
      title: '',
      description: '',
      project_id: projects[0]?.id || '',
      category_id: categories[0]?.id || '',
      kind_id: 1,
      priority_id: 1,
      status_id: 1,
      asigned_id: users[0]?.id || ''
    });
    setIsModalOpen(true);
  };

  const handleOpenEdit = (t) => {
    setEditingId(t.id);
    setFormData({
      title: t.title || '',
      description: t.description || '',
      project_id: t.project_id || '',
      category_id: t.category_id || '',
      kind_id: t.kind_id || 1,
      priority_id: t.priority_id || 1,
      status_id: t.status_id || 1,
      asigned_id: t.asigned_id || ''
    });
    setIsModalOpen(true);
  };

  const handleSave = async (e) => {
    e.preventDefault();
    if (!formData.title.trim()) {
      alert('El título del ticket es requerido');
      return;
    }

    try {
      if (window.api && window.api.execute) {
        if (editingId) {
          await window.api.execute(`
            UPDATE ticket SET 
              title = ?, description = ?, project_id = ?, category_id = ?, 
              kind_id = ?, priority_id = ?, status_id = ?, asigned_id = ?, updated_at = datetime('now')
            WHERE id = ?
          `, [
            formData.title, formData.description, formData.project_id || null, formData.category_id || null,
            formData.kind_id, formData.priority_id, formData.status_id, formData.asigned_id || null,
            editingId
          ]);
        } else {
          const creatorId = currentUser?.id || 1;
          await window.api.execute(`
            INSERT INTO ticket (
              title, description, project_id, category_id, kind_id, 
              priority_id, status_id, asigned_id, user_id, created_at, updated_at
            ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, datetime('now'), datetime('now'))
          `, [
            formData.title, formData.description, formData.project_id || null, formData.category_id || null,
            formData.kind_id, formData.priority_id, formData.status_id, formData.asigned_id || null,
            creatorId
          ]);
        }
      }
      setIsModalOpen(false);
      loadData();
    } catch (err) {
      console.error('Error saving ticket:', err);
      alert('Error al guardar ticket');
    }
  };

  const handleQuickStatusChange = async (ticketId, nextStatusId) => {
    try {
      if (window.api && window.api.execute) {
        await window.api.execute(
          'UPDATE ticket SET status_id = ?, updated_at = datetime(\'now\') WHERE id = ?',
          [nextStatusId, ticketId]
        );
        loadData();
      }
    } catch (err) {
      console.error('Error changing ticket status:', err);
    }
  };

  const handleDelete = async (ticketId) => {
    if (!window.confirm('¿Está seguro de eliminar este ticket permanentemente?')) return;
    try {
      if (window.api && window.api.execute) {
        await window.api.execute('DELETE FROM ticket WHERE id = ?', [ticketId]);
        loadData();
      }
    } catch (err) {
      console.error('Error deleting ticket:', err);
    }
  };

  // Filter tickets
  const filteredTickets = tickets.filter(t => {
    const term = searchTerm.toLowerCase();
    const matchesSearch = 
      (t.title && t.title.toLowerCase().includes(term)) ||
      (t.description && t.description.toLowerCase().includes(term)) ||
      String(t.id).includes(term) ||
      (t.asigned_name && t.asigned_name.toLowerCase().includes(term));

    const matchesProject = projectFilter === 'ALL' || String(t.project_id) === String(projectFilter);
    const matchesCategory = categoryFilter === 'ALL' || String(t.category_id) === String(categoryFilter);
    const matchesKind = kindFilter === 'ALL' || String(t.kind_id) === String(kindFilter);
    const matchesPriority = priorityFilter === 'ALL' || String(t.priority_id) === String(priorityFilter);
    const matchesStatus = statusFilter === 'ALL' || String(t.status_id) === String(statusFilter);

    return matchesSearch && matchesProject && matchesCategory && matchesKind && matchesPriority && matchesStatus;
  });

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
    <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 14 }}>
        <div>
          <h2 style={{ fontSize: '1.35rem', fontWeight: 700, color: 'var(--md-on-surface)' }}>
            Mesa de Tickets e Incidencias
          </h2>
          <p style={{ fontSize: '0.85rem', color: 'var(--md-on-surface-variant)' }}>
            Administración de solicitudes de soporte, reporte de bugs y nuevas características.
          </p>
        </div>

        <div style={{ display: 'flex', gap: 10 }}>
          <button className="btn btn-secondary" onClick={loadData}>
            <RefreshCw size={16} /> Refrescar
          </button>
          <button className="btn btn-primary" onClick={handleOpenCreate}>
            <Plus size={18} /> Crear Nuevo Ticket
          </button>
        </div>
      </div>

      {/* Filters Bar */}
      <div className="card" style={{ padding: '14px 20px' }}>
        <div className="filter-bar">
          <div className="search-box" style={{ flex: 1, minWidth: 220 }}>
            <Search size={18} color="#64748b" />
            <input
              type="text"
              placeholder="Buscar por ID (#1), título, descripción o asignado..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>

          <select
            className="form-select"
            value={projectFilter}
            onChange={(e) => setProjectFilter(e.target.value)}
          >
            <option value="ALL">Todos los Proyectos</option>
            {projects.map(p => (
              <option key={p.id} value={p.id}>{p.name}</option>
            ))}
          </select>

          <select
            className="form-select"
            value={kindFilter}
            onChange={(e) => setKindFilter(e.target.value)}
          >
            <option value="ALL">Todos los Tipos</option>
            {kinds.map(k => (
              <option key={k.id} value={k.id}>{k.name}</option>
            ))}
          </select>

          <select
            className="form-select"
            value={priorityFilter}
            onChange={(e) => setPriorityFilter(e.target.value)}
          >
            <option value="ALL">Todas las Prioridades</option>
            {priorities.map(pr => (
              <option key={pr.id} value={pr.id}>{pr.name}</option>
            ))}
          </select>

          <select
            className="form-select"
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
          >
            <option value="ALL">Todos los Estados</option>
            {statuses.map(s => (
              <option key={s.id} value={s.id}>{s.name}</option>
            ))}
          </select>
        </div>
      </div>

      {/* Tickets Table */}
      <div className="card">
        <div className="table-responsive">
          {filteredTickets.length === 0 ? (
            <div style={{ padding: '48px 20px', textAlign: 'center', color: '#64748b' }}>
              <Ticket size={48} style={{ opacity: 0.35, marginBottom: 12 }} />
              <p style={{ fontWeight: 600 }}>No se encontraron tickets con los filtros actuales</p>
              <p style={{ fontSize: '0.85rem', marginTop: 4 }}>Cambie los criterios o cree un nuevo ticket.</p>
            </div>
          ) : (
            <table className="data-table">
              <thead>
                <tr>
                  <th style={{ width: 60 }}>ID</th>
                  <th>Título & Descripción</th>
                  <th>Proyecto & Área</th>
                  <th>Tipo</th>
                  <th>Prioridad</th>
                  <th>Estado</th>
                  <th>Asignado</th>
                  <th style={{ textAlign: 'right' }}>Acciones</th>
                </tr>
              </thead>
              <tbody>
                {filteredTickets.map(t => (
                  <tr key={t.id}>
                    <td>
                      <span style={{ fontWeight: 800, color: 'var(--md-primary)', fontSize: '0.92rem' }}>
                        #{t.id}
                      </span>
                    </td>
                    <td style={{ maxWidth: 280 }}>
                      <div style={{ fontWeight: 600, color: 'var(--md-on-surface)', fontSize: '0.9rem' }}>
                        {t.title}
                      </div>
                      {t.description && (
                        <div style={{
                          fontSize: '0.78rem',
                          color: '#64748b',
                          whiteSpace: 'nowrap',
                          overflow: 'hidden',
                          textOverflow: 'ellipsis',
                          marginTop: 2
                        }}>
                          {t.description}
                        </div>
                      )}
                    </td>
                    <td>
                      <div style={{ fontWeight: 500, fontSize: '0.84rem' }}>
                        {t.project_name || 'Sin Proyecto'}
                      </div>
                      <div style={{ fontSize: '0.75rem', color: '#6366f1' }}>
                        {t.category_name || 'General'}
                      </div>
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
                      <select
                        className={`badge badge-status-${t.status_id}`}
                        style={{ border: 'none', cursor: 'pointer', paddingRight: 6 }}
                        value={t.status_id}
                        onChange={(e) => handleQuickStatusChange(t.id, parseInt(e.target.value))}
                        title="Cambiar estado rápidamente"
                      >
                        {statuses.map(s => (
                          <option key={s.id} value={s.id} style={{ background: '#fff', color: '#000' }}>
                            {s.name}
                          </option>
                        ))}
                      </select>
                    </td>
                    <td style={{ whiteSpace: 'nowrap' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: '0.84rem' }}>
                        <User size={14} color="#6366f1" />
                        <span>{t.asigned_name || 'Sin asignar'}</span>
                      </div>
                    </td>
                    <td style={{ textAlign: 'right', whiteSpace: 'nowrap' }}>
                      <div style={{ display: 'inline-flex', alignItems: 'center', gap: 4 }}>
                        <button
                          className="btn-icon"
                          onClick={() => {
                            setSelectedTicket(t);
                            setIsDetailModalOpen(true);
                          }}
                          title="Ver Detalle Completo"
                        >
                          <Eye size={17} />
                        </button>
                        <button
                          className="btn-icon"
                          onClick={() => handleOpenEdit(t)}
                          title="Editar Ticket"
                        >
                          <Edit2 size={17} />
                        </button>
                        <button
                          className="btn-icon"
                          style={{ color: '#dc2626' }}
                          onClick={() => handleDelete(t.id)}
                          title="Eliminar Ticket"
                        >
                          <Trash2 size={17} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>

      {/* Modal: Crear / Editar Ticket */}
      {isModalOpen && (
        <div className="modal-overlay">
          <div className="modal-content wide">
            <div className="modal-header">
              <h3 className="modal-title">
                {editingId ? `Editar Ticket #${editingId}` : 'Crear Nuevo Ticket'}
              </h3>
              <button className="btn-icon" onClick={() => setIsModalOpen(false)}>
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleSave}>
              <div className="modal-body">
                <div className="form-group">
                  <label className="form-label">Título del Ticket *</label>
                  <input
                    type="text"
                    className="form-input"
                    placeholder="Describa brevemente el problema o requerimiento..."
                    value={formData.title}
                    onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                    required
                    autoFocus
                  />
                </div>

                <div className="form-row">
                  <div className="form-group">
                    <label className="form-label">Proyecto Asociado</label>
                    <select
                      className="form-select"
                      value={formData.project_id}
                      onChange={(e) => setFormData({ ...formData, project_id: e.target.value })}
                    >
                      <option value="">-- Sin Proyecto --</option>
                      {projects.map(p => (
                        <option key={p.id} value={p.id}>{p.name}</option>
                      ))}
                    </select>
                  </div>

                  <div className="form-group">
                    <label className="form-label">Área / Categoría</label>
                    <select
                      className="form-select"
                      value={formData.category_id}
                      onChange={(e) => setFormData({ ...formData, category_id: e.target.value })}
                    >
                      <option value="">-- Sin Categoría --</option>
                      {categories.map(c => (
                        <option key={c.id} value={c.id}>{c.name}</option>
                      ))}
                    </select>
                  </div>
                </div>

                <div className="form-row-3">
                  <div className="form-group">
                    <label className="form-label">Tipo de Solicitud</label>
                    <select
                      className="form-select"
                      value={formData.kind_id}
                      onChange={(e) => setFormData({ ...formData, kind_id: parseInt(e.target.value) })}
                    >
                      {kinds.map(k => (
                        <option key={k.id} value={k.id}>{k.name}</option>
                      ))}
                    </select>
                  </div>

                  <div className="form-group">
                    <label className="form-label">Prioridad</label>
                    <select
                      className="form-select"
                      value={formData.priority_id}
                      onChange={(e) => setFormData({ ...formData, priority_id: parseInt(e.target.value) })}
                    >
                      {priorities.map(pr => (
                        <option key={pr.id} value={pr.id}>{pr.name}</option>
                      ))}
                    </select>
                  </div>

                  <div className="form-group">
                    <label className="form-label">Estado</label>
                    <select
                      className="form-select"
                      value={formData.status_id}
                      onChange={(e) => setFormData({ ...formData, status_id: parseInt(e.target.value) })}
                    >
                      {statuses.map(s => (
                        <option key={s.id} value={s.id}>{s.name}</option>
                      ))}
                    </select>
                  </div>
                </div>

                <div className="form-group">
                  <label className="form-label">Asignar a Técnico / Especialista</label>
                  <select
                    className="form-select"
                    value={formData.asigned_id}
                    onChange={(e) => setFormData({ ...formData, asigned_id: e.target.value })}
                  >
                    <option value="">-- Sin Asignar --</option>
                    {users.map(u => (
                      <option key={u.id} value={u.id}>
                        {u.name} {u.lastname} ({u.username})
                      </option>
                    ))}
                  </select>
                </div>

                <div className="form-group">
                  <label className="form-label">Descripción Detallada / Pasos para reproducir</label>
                  <textarea
                    rows={4}
                    className="form-input"
                    placeholder="Incluya mensajes de error, URLs, contexto o capturas..."
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
                  {editingId ? 'Guardar Cambios' : 'Crear Ticket'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal: Detalle Completo de Ticket */}
      {isDetailModalOpen && selectedTicket && (
        <div className="modal-overlay">
          <div className="modal-content wide">
            <div className="modal-header">
              <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                <span style={{ fontSize: '1.2rem', fontWeight: 800, color: 'var(--md-primary)' }}>
                  #{selectedTicket.id}
                </span>
                <h3 className="modal-title">{selectedTicket.title}</h3>
              </div>
              <button className="btn-icon" onClick={() => setIsDetailModalOpen(false)}>
                <X size={20} />
              </button>
            </div>

            <div className="modal-body">
              {/* Badges bar */}
              <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap', alignItems: 'center' }}>
                {getKindBadge(selectedTicket.kind_id, selectedTicket.kind_name)}
                <span className={`badge badge-priority-${selectedTicket.priority_id}`}>
                  Prioridad: {selectedTicket.priority_name}
                </span>
                <span className={`badge badge-status-${selectedTicket.status_id}`}>
                  Estado: {selectedTicket.status_name}
                </span>
              </div>

              {/* Grid Metadata */}
              <div style={{
                background: '#f8fafc',
                border: '1px solid #e2e8f0',
                borderRadius: 'var(--radius-medium)',
                padding: 16,
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))',
                gap: 14
              }}>
                <div>
                  <span style={{ fontSize: '0.75rem', color: '#64748b' }}>Proyecto</span>
                  <p style={{ fontWeight: 600 }}>{selectedTicket.project_name || 'Sin Proyecto'}</p>
                </div>
                <div>
                  <span style={{ fontSize: '0.75rem', color: '#64748b' }}>Categoría / Área</span>
                  <p style={{ fontWeight: 600 }}>{selectedTicket.category_name || 'General'}</p>
                </div>
                <div>
                  <span style={{ fontSize: '0.75rem', color: '#64748b' }}>Reportado por</span>
                  <p style={{ fontWeight: 600 }}>{selectedTicket.creator_name || 'Sistema'}</p>
                </div>
                <div>
                  <span style={{ fontSize: '0.75rem', color: '#64748b' }}>Asignado a</span>
                  <p style={{ fontWeight: 600, color: 'var(--md-primary)' }}>
                    {selectedTicket.asigned_name || 'Sin Asignar'}
                  </p>
                </div>
                <div>
                  <span style={{ fontSize: '0.75rem', color: '#64748b' }}>Fecha de Reporte</span>
                  <p style={{ fontWeight: 500, fontSize: '0.85rem' }}>{selectedTicket.created_at}</p>
                </div>
                <div>
                  <span style={{ fontSize: '0.75rem', color: '#64748b' }}>Última Actualización</span>
                  <p style={{ fontWeight: 500, fontSize: '0.85rem' }}>{selectedTicket.updated_at || selectedTicket.created_at}</p>
                </div>
              </div>

              {/* Description */}
              <div>
                <h4 style={{ fontSize: '0.88rem', fontWeight: 700, color: '#334155', marginBottom: 6 }}>
                  Descripción de la Incidencia
                </h4>
                <div style={{
                  background: '#ffffff',
                  border: '1px solid #e2e8f0',
                  borderRadius: 'var(--radius-medium)',
                  padding: 16,
                  fontSize: '0.92rem',
                  lineHeight: 1.6,
                  whiteSpace: 'pre-wrap',
                  color: '#1e293b'
                }}>
                  {selectedTicket.description || 'Sin descripción detallada.'}
                </div>
              </div>
            </div>

            <div className="modal-footer">
              <button className="btn btn-secondary" onClick={() => setIsDetailModalOpen(false)}>
                Cerrar
              </button>
              <button
                className="btn btn-primary"
                onClick={() => {
                  setIsDetailModalOpen(false);
                  handleOpenEdit(selectedTicket);
                }}
              >
                <Edit2 size={16} /> Editar Ticket
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
