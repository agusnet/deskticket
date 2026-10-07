import React, { useState, useEffect } from 'react';
import { UserCheck, Plus, Edit2, Trash2, Shield, User, X, RefreshCw } from 'lucide-react';

export default function Users({ currentUser }) {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);

  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [formData, setFormData] = useState({
    username: '',
    name: '',
    lastname: '',
    email: '',
    password: '',
    kind: 2, // 1: Admin, 2: Técnico
    is_active: 1
  });

  const loadUsers = async () => {
    setLoading(true);
    try {
      if (!window.api || !window.api.query) {
        setUsers([
          { id: 1, username: 'admin', name: 'Administrador', lastname: 'General', email: 'admin@deskticket.com', kind: 1, is_active: 1 },
          { id: 2, username: 'soporte', name: 'Juan', lastname: 'Pérez García', email: 'soporte@deskticket.com', kind: 2, is_active: 1 }
        ]);
        setLoading(false);
        return;
      }

      const rows = await window.api.query(`
        SELECT 
          u.*,
          (SELECT count(*) FROM ticket t WHERE t.asigned_id = u.id) as assigned_tickets
        FROM "user" u 
        ORDER BY u.id ASC
      `);
      setUsers(rows || []);
    } catch (err) {
      console.error('Error loading users:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadUsers();
  }, []);

  const handleOpenCreate = () => {
    setEditingId(null);
    setFormData({
      username: '',
      name: '',
      lastname: '',
      email: '',
      password: '',
      kind: 2,
      is_active: 1
    });
    setIsModalOpen(true);
  };

  const handleOpenEdit = (u) => {
    setEditingId(u.id);
    setFormData({
      username: u.username || '',
      name: u.name || '',
      lastname: u.lastname || '',
      email: u.email || '',
      password: '',
      kind: u.kind || 2,
      is_active: u.is_active ?? 1
    });
    setIsModalOpen(true);
  };

  const handleSave = async (e) => {
    e.preventDefault();
    if (!formData.username.trim()) {
      alert('El nombre de usuario es obligatorio');
      return;
    }

    try {
      if (window.api && window.api.execute) {
        if (editingId) {
          if (formData.password) {
            await window.api.execute(`
              UPDATE "user" SET 
                username = ?, name = ?, lastname = ?, email = ?, password = ?, kind = ?, is_active = ?
              WHERE id = ?
            `, [
              formData.username, formData.name, formData.lastname, formData.email,
              formData.password, formData.kind, formData.is_active, editingId
            ]);
          } else {
            await window.api.execute(`
              UPDATE "user" SET 
                username = ?, name = ?, lastname = ?, email = ?, kind = ?, is_active = ?
              WHERE id = ?
            `, [
              formData.username, formData.name, formData.lastname, formData.email,
              formData.kind, formData.is_active, editingId
            ]);
          }
        } else {
          if (!formData.password) {
            alert('Debe especificar una contraseña para el nuevo usuario');
            return;
          }
          await window.api.execute(`
            INSERT INTO "user" (username, name, lastname, email, password, kind, is_active, created_at)
            VALUES (?, ?, ?, ?, ?, ?, ?, datetime('now'))
          `, [
            formData.username, formData.name, formData.lastname, formData.email,
            formData.password, formData.kind, formData.is_active
          ]);
        }
      }
      setIsModalOpen(false);
      loadUsers();
    } catch (err) {
      console.error('Error saving user:', err);
      alert('Error al guardar el usuario (puede que el nombre de usuario ya esté en uso).');
    }
  };

  const handleDelete = async (uId) => {
    if (uId === 1) {
      alert('No se puede eliminar el usuario administrador principal.');
      return;
    }
    if (!window.confirm('¿Está seguro de eliminar este usuario?')) return;
    try {
      if (window.api && window.api.execute) {
        await window.api.execute('DELETE FROM "user" WHERE id = ?', [uId]);
        loadUsers();
      }
    } catch (err) {
      console.error('Error deleting user:', err);
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 14 }}>
        <div>
          <h2 style={{ fontSize: '1.35rem', fontWeight: 700, color: 'var(--md-on-surface)' }}>
            Personal y Técnicos de Soporte
          </h2>
          <p style={{ fontSize: '0.85rem', color: 'var(--md-on-surface-variant)' }}>
            Administradores y agentes asignados a la resolución de tickets.
          </p>
        </div>

        <div style={{ display: 'flex', gap: 10 }}>
          <button className="btn btn-secondary" onClick={loadUsers}>
            <RefreshCw size={16} /> Refrescar
          </button>
          <button className="btn btn-primary" onClick={handleOpenCreate}>
            <Plus size={18} /> Nuevo Usuario
          </button>
        </div>
      </div>

      {/* Users Table */}
      <div className="card">
        <div className="table-responsive">
          <table className="data-table">
            <thead>
              <tr>
                <th>Usuario</th>
                <th>Nombre Completo</th>
                <th>Correo Electrónico</th>
                <th>Rol / Permiso</th>
                <th>Tickets Asignados</th>
                <th>Estado</th>
                <th style={{ textAlign: 'right' }}>Acciones</th>
              </tr>
            </thead>
            <tbody>
              {users.map((u) => (
                <tr key={u.id}>
                  <td>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8, fontWeight: 700, color: 'var(--md-primary)' }}>
                      <User size={16} />
                      {u.username}
                    </div>
                  </td>
                  <td>
                    <div style={{ fontWeight: 600 }}>{u.name} {u.lastname}</div>
                  </td>
                  <td style={{ color: '#64748b' }}>{u.email || 'Sin correo'}</td>
                  <td>
                    {u.kind === 1 ? (
                      <span className="badge" style={{ background: '#ede9fe', color: '#6d28d9', border: '1px solid #ddd6fe' }}>
                        <Shield size={12} /> Administrador
                      </span>
                    ) : (
                      <span className="badge" style={{ background: '#e0f2fe', color: '#0369a1' }}>
                        Técnico de Soporte
                      </span>
                    )}
                  </td>
                  <td>
                    <span style={{ fontWeight: 600 }}>{u.assigned_tickets || 0} tickets</span>
                  </td>
                  <td>
                    <span className={`badge ${u.is_active ? 'badge-status-3' : 'badge-status-4'}`}>
                      {u.is_active ? 'Activo' : 'Inactivo'}
                    </span>
                  </td>
                  <td style={{ textAlign: 'right' }}>
                    <div style={{ display: 'inline-flex', alignItems: 'center', gap: 4 }}>
                      <button className="btn-icon" onClick={() => handleOpenEdit(u)} title="Editar">
                        <Edit2 size={16} />
                      </button>
                      {u.id !== 1 && (
                        <button className="btn-icon" style={{ color: '#dc2626' }} onClick={() => handleDelete(u.id)} title="Eliminar">
                          <Trash2 size={16} />
                        </button>
                      )}
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
                {editingId ? 'Editar Usuario' : 'Crear Nuevo Usuario'}
              </h3>
              <button className="btn-icon" onClick={() => setIsModalOpen(false)}>
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleSave}>
              <div className="modal-body">
                <div className="form-group">
                  <label className="form-label">Nombre de Usuario (Login) *</label>
                  <input
                    type="text"
                    className="form-input"
                    value={formData.username}
                    onChange={(e) => setFormData({ ...formData, username: e.target.value })}
                    required
                  />
                </div>

                <div className="form-row">
                  <div className="form-group">
                    <label className="form-label">Nombre</label>
                    <input
                      type="text"
                      className="form-input"
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    />
                  </div>

                  <div className="form-group">
                    <label className="form-label">Apellidos</label>
                    <input
                      type="text"
                      className="form-input"
                      value={formData.lastname}
                      onChange={(e) => setFormData({ ...formData, lastname: e.target.value })}
                    />
                  </div>
                </div>

                <div className="form-group">
                  <label className="form-label">Correo Electrónico</label>
                  <input
                    type="email"
                    className="form-input"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  />
                </div>

                <div className="form-group">
                  <label className="form-label">
                    {editingId ? 'Nueva Contraseña (dejar en blanco para no modificar)' : 'Contraseña *'}
                  </label>
                  <input
                    type="password"
                    className="form-input"
                    placeholder="••••••••"
                    value={formData.password}
                    onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                    required={!editingId}
                  />
                </div>

                <div className="form-row">
                  <div className="form-group">
                    <label className="form-label">Rol del Usuario</label>
                    <select
                      className="form-select"
                      value={formData.kind}
                      onChange={(e) => setFormData({ ...formData, kind: parseInt(e.target.value) })}
                    >
                      <option value={2}>Técnico / Soporte</option>
                      <option value={1}>Administrador General</option>
                    </select>
                  </div>

                  <div className="form-group">
                    <label className="form-label">Estado</label>
                    <select
                      className="form-select"
                      value={formData.is_active}
                      onChange={(e) => setFormData({ ...formData, is_active: parseInt(e.target.value) })}
                    >
                      <option value={1}>Activo</option>
                      <option value={0}>Inactivo</option>
                    </select>
                  </div>
                </div>
              </div>

              <div className="modal-footer">
                <button type="button" className="btn btn-secondary" onClick={() => setIsModalOpen(false)}>
                  Cancelar
                </button>
                <button type="submit" className="btn btn-primary">
                  {editingId ? 'Guardar Cambios' : 'Crear Usuario'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
