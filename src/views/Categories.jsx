import React, { useState, useEffect } from 'react';
import { Layers, Plus, Edit2, Trash2, Search, X, RefreshCw, Ticket } from 'lucide-react';

export default function Categories() {
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');

  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [name, setName] = useState('');

  const loadCategories = async () => {
    setLoading(true);
    try {
      if (!window.api || !window.api.query) {
        setCategories([
          { id: 1, name: 'Desarrollo / Backend', ticket_count: 2 },
          { id: 2, name: 'Diseño / Frontend', ticket_count: 1 },
          { id: 3, name: 'Base de Datos', ticket_count: 1 },
          { id: 4, name: 'Soporte Técnico / Hardware', ticket_count: 1 },
          { id: 5, name: 'Seguridad', ticket_count: 0 }
        ]);
        setLoading(false);
        return;
      }

      const rows = await window.api.query(`
        SELECT 
          c.*,
          (SELECT count(*) FROM ticket t WHERE t.category_id = c.id) as ticket_count
        FROM category c
        ORDER BY c.name ASC
      `);
      setCategories(rows || []);
    } catch (err) {
      console.error('Error loading categories:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadCategories();
  }, []);

  const handleOpenCreate = () => {
    setEditingId(null);
    setName('');
    setIsModalOpen(true);
  };

  const handleOpenEdit = (c) => {
    setEditingId(c.id);
    setName(c.name || '');
    setIsModalOpen(true);
  };

  const handleSave = async (e) => {
    e.preventDefault();
    if (!name.trim()) return;

    try {
      if (window.api && window.api.execute) {
        if (editingId) {
          await window.api.execute('UPDATE category SET name = ? WHERE id = ?', [name.trim(), editingId]);
        } else {
          await window.api.execute('INSERT INTO category (name) VALUES (?)', [name.trim()]);
        }
      }
      setIsModalOpen(false);
      loadCategories();
    } catch (err) {
      console.error('Error saving category:', err);
      alert('Error al guardar la categoría');
    }
  };

  const handleDelete = async (cId) => {
    if (!window.confirm('¿Está seguro de eliminar esta categoría?')) return;
    try {
      if (window.api && window.api.execute) {
        await window.api.execute('DELETE FROM category WHERE id = ?', [cId]);
        loadCategories();
      }
    } catch (err) {
      console.error('Error deleting category:', err);
    }
  };

  const filteredCategories = categories.filter(c =>
    c.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 14 }}>
        <div>
          <h2 style={{ fontSize: '1.35rem', fontWeight: 700, color: 'var(--md-on-surface)' }}>
            Categorías y Departamentos
          </h2>
          <p style={{ fontSize: '0.85rem', color: 'var(--md-on-surface-variant)' }}>
            Áreas temáticas para clasificar el origen técnico de las incidencias.
          </p>
        </div>

        <div style={{ display: 'flex', gap: 10 }}>
          <button className="btn btn-secondary" onClick={loadCategories}>
            <RefreshCw size={16} /> Refrescar
          </button>
          <button className="btn btn-primary" onClick={handleOpenCreate}>
            <Plus size={18} /> Nueva Categoría
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
              placeholder="Buscar categoría..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <span style={{ fontSize: '0.85rem', color: '#64748b' }}>
            Total: <strong>{filteredCategories.length}</strong> categorías
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
                <th>Nombre de la Categoría</th>
                <th>Tickets Registrados</th>
                <th style={{ textAlign: 'right' }}>Acciones</th>
              </tr>
            </thead>
            <tbody>
              {filteredCategories.map((c) => (
                <tr key={c.id}>
                  <td style={{ color: '#64748b', fontWeight: 600 }}>#{c.id}</td>
                  <td>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8, fontWeight: 600 }}>
                      <Layers size={17} color="#0ea5e9" />
                      {c.name}
                    </div>
                  </td>
                  <td>
                    <span className="badge" style={{ background: '#e0f2fe', color: '#0369a1' }}>
                      <Ticket size={12} /> {c.ticket_count || 0} tickets
                    </span>
                  </td>
                  <td style={{ textAlign: 'right' }}>
                    <div style={{ display: 'inline-flex', alignItems: 'center', gap: 4 }}>
                      <button className="btn-icon" onClick={() => handleOpenEdit(c)} title="Editar">
                        <Edit2 size={16} />
                      </button>
                      <button className="btn-icon" style={{ color: '#dc2626' }} onClick={() => handleDelete(c.id)} title="Eliminar">
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
          <div className="modal-content" style={{ maxWidth: 440 }}>
            <div className="modal-header">
              <h3 className="modal-title">
                {editingId ? 'Editar Categoría' : 'Nueva Categoría'}
              </h3>
              <button className="btn-icon" onClick={() => setIsModalOpen(false)}>
                <X size={20} />
              </button>
            </div>
            <form onSubmit={handleSave}>
              <div className="modal-body">
                <div className="form-group">
                  <label className="form-label">Nombre de la Categoría *</label>
                  <input
                    type="text"
                    className="form-input"
                    placeholder="Ej. Redes, DevOps, Seguridad..."
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    autoFocus
                    required
                  />
                </div>
              </div>
              <div className="modal-footer">
                <button type="button" className="btn btn-secondary" onClick={() => setIsModalOpen(false)}>
                  Cancelar
                </button>
                <button type="submit" className="btn btn-primary">
                  {editingId ? 'Guardar Cambios' : 'Crear Categoría'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
