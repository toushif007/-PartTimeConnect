import React, { useState, useEffect } from 'react';
import { FolderTree, Plus, Edit, Trash2, CheckCircle, XCircle } from 'lucide-react';
import api from '../../services/api';
import Sidebar from '../../components/common/Sidebar';
import Loader from '../../components/common/Loader';
import Modal from '../../components/common/Modal';

const CategoriesManagement = () => {
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);

  // Modal State
  const [modalOpen, setModalOpen] = useState(false);
  const [editingCategory, setEditingCategory] = useState(null);
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [icon, setIcon] = useState('Briefcase');
  const [submitting, setSubmitting] = useState(false);

  const fetchCategories = async () => {
    try {
      const res = await api.get('/categories?includeInactive=true');
      if (res.success && res.data) {
        setCategories(res.data);
      }
    } catch (err) {
      console.warn('Error fetching categories:', err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCategories();
  }, []);

  const openCreateModal = () => {
    setEditingCategory(null);
    setName('');
    setDescription('');
    setIcon('Briefcase');
    setModalOpen(true);
  };

  const openEditModal = (cat) => {
    setEditingCategory(cat);
    setName(cat.name);
    setDescription(cat.description || '');
    setIcon(cat.icon || 'Briefcase');
    setModalOpen(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!name.trim()) return alert('Please enter a category name.');

    setSubmitting(true);
    try {
      if (editingCategory) {
        const res = await api.put(`/categories/${editingCategory._id}`, {
          name,
          description,
          icon,
        });
        if (res.success) {
          setModalOpen(false);
          fetchCategories();
        }
      } else {
        const res = await api.post('/categories', {
          name,
          description,
          icon,
        });
        if (res.success) {
          setModalOpen(false);
          fetchCategories();
        }
      }
    } catch (err) {
      alert(err.message || 'Error saving category');
    } finally {
      setSubmitting(false);
    }
  };

  const handleToggleActive = async (cat) => {
    try {
      const res = await api.put(`/categories/${cat._id}`, {
        isActive: !cat.isActive,
      });
      if (res.success) {
        setCategories((prev) =>
          prev.map((c) => (c._id === cat._id ? { ...c, isActive: !cat.isActive } : c))
        );
      }
    } catch (err) {
      alert(err.message || 'Failed to update category status');
    }
  };

  const handleDelete = async (catId, catName) => {
    if (!window.confirm(`Delete category "${catName}"?`)) return;

    try {
      const res = await api.delete(`/categories/${catId}`);
      if (res.success) {
        setCategories(categories.filter((c) => c._id !== catId));
      }
    } catch (err) {
      alert(err.message || 'Failed to delete category');
    }
  };

  if (loading) return <Loader message="Loading categories..." />;

  return (
    <div className="dashboard-layout">
      <Sidebar />
      <main className="dashboard-main">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem', marginBottom: '2rem' }}>
          <div>
            <h1 style={{ fontSize: '1.85rem', fontWeight: '800', color: 'var(--slate-900)' }}>
              Job Categories Management
            </h1>
            <p style={{ color: 'var(--slate-500)', fontSize: '0.95rem' }}>
              Create, rename, and manage classification categories for part-time listings.
            </p>
          </div>

          <button onClick={openCreateModal} className="btn btn-primary">
            <Plus size={18} /> Add Category
          </button>
        </div>

        <div className="card" style={{ padding: '1.5rem' }}>
          <div className="table-responsive">
            <table className="table">
              <thead>
                <tr>
                  <th>Category Name</th>
                  <th>Slug URL</th>
                  <th>Description</th>
                  <th>Status</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {categories.map((cat) => (
                  <tr key={cat._id}>
                    <td>
                      <div style={{ fontWeight: '700', color: 'var(--slate-900)' }}>{cat.name}</div>
                    </td>
                    <td>
                      <code style={{ fontSize: '0.8rem', background: 'var(--slate-100)', padding: '2px 6px', borderRadius: '4px' }}>
                        {cat.slug}
                      </code>
                    </td>
                    <td style={{ fontSize: '0.85rem', color: 'var(--slate-600)', maxWidth: '300px' }}>
                      {cat.description || 'No description provided'}
                    </td>
                    <td>
                      <button
                        onClick={() => handleToggleActive(cat)}
                        style={{
                          background: 'none',
                          border: 'none',
                          cursor: 'pointer',
                          display: 'flex',
                          alignItems: 'center',
                          gap: '6px',
                          fontWeight: '700',
                          fontSize: '0.75rem',
                          color: cat.isActive ? '#10b981' : '#94a3b8',
                        }}
                      >
                        {cat.isActive ? <CheckCircle size={14} /> : <XCircle size={14} />}
                        {cat.isActive ? 'Active' : 'Inactive'}
                      </button>
                    </td>
                    <td>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                        <button
                          onClick={() => openEditModal(cat)}
                          className="btn btn-secondary btn-sm"
                          style={{ padding: '6px' }}
                          title="Edit Category"
                        >
                          <Edit size={14} />
                        </button>
                        <button
                          onClick={() => handleDelete(cat._id, cat.name)}
                          className="btn btn-danger btn-sm"
                          style={{ padding: '6px', background: 'transparent', color: '#ef4444', border: '1px solid #fecaca' }}
                          title="Delete Category"
                        >
                          <Trash2 size={14} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Create / Edit Modal */}
        <Modal
          isOpen={modalOpen}
          onClose={() => setModalOpen(false)}
          title={editingCategory ? 'Edit Category' : 'Create New Category'}
          footer={
            <>
              <button className="btn btn-secondary" onClick={() => setModalOpen(false)}>
                Cancel
              </button>
              <button className="btn btn-primary" onClick={handleSubmit} disabled={submitting}>
                {submitting ? 'Saving...' : editingCategory ? 'Save Changes' : 'Create Category'}
              </button>
            </>
          }
        >
          <form onSubmit={handleSubmit}>
            <div className="form-group">
              <label className="form-label">Category Name *</label>
              <input
                type="text"
                required
                className="form-input"
                placeholder="e.g. AI & Machine Learning"
                value={name}
                onChange={(e) => setName(e.target.value)}
              />
            </div>

            <div className="form-group">
              <label className="form-label">Description</label>
              <textarea
                className="form-textarea"
                rows="3"
                placeholder="Brief summary of roles in this category..."
                value={description}
                onChange={(e) => setDescription(e.target.value)}
              />
            </div>
          </form>
        </Modal>
      </main>
    </div>
  );
};

export default CategoriesManagement;
