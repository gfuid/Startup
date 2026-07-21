import React, { useState, useEffect } from 'react';
import { adminApi } from '../context/AdminAuthContext';
import { Plus, Edit2, Trash2, Check, X } from 'lucide-react';

export default function Services() {
    const [services, setServices] = useState([]);
    const [loading, setLoading] = useState(true);
    
    // Modal states
    const [modalOpen, setModalOpen] = useState(false);
    const [editingService, setEditingService] = useState(null);
    const [submitting, setSubmitting] = useState(false);

    // Form states
    const [name, setName] = useState('');
    const [category, setCategory] = useState('plumbing');
    const [description, setDescription] = useState('');
    const [price, setPrice] = useState('');
    const [unit, setUnit] = useState('visit');
    const [duration, setDuration] = useState('1-2 hours');
    const [includes, setIncludes] = useState('');
    const [featured, setFeatured] = useState(false);
    const [isActive, setIsActive] = useState(true);

    const categories = ['plumbing', 'electrical', 'ac_repair', 'cleaning', 'carpentry', 'painting', 'appliance', 'other'];
    const units = ['visit', 'hour', 'project'];

    const fetchServices = async () => {
        try {
            const response = await adminApi.get('/admin/services');
            if (response.data && response.data.services) {
                setServices(response.data.services);
            }
        } catch (err) {
            console.error('Failed to fetch services:', err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchServices();
    }, []);

    const openCreateModal = () => {
        setEditingService(null);
        setName('');
        setCategory('plumbing');
        setDescription('');
        setPrice('');
        setUnit('visit');
        setDuration('1-2 hours');
        setIncludes('');
        setFeatured(false);
        setIsActive(true);
        setModalOpen(true);
    };

    const openEditModal = (service) => {
        setEditingService(service);
        setName(service.name);
        setCategory(service.category);
        setDescription(service.description);
        setPrice(service.price);
        setUnit(service.unit || 'visit');
        setDuration(service.duration || '1-2 hours');
        setIncludes(service.includes ? service.includes.join(', ') : '');
        setFeatured(service.featured || false);
        setIsActive(service.isActive !== undefined ? service.isActive : true);
        setModalOpen(true);
    };

    const handleFormSubmit = async (e) => {
        e.preventDefault();
        if (!name || !description || !price) {
            alert('Please fill out all required fields');
            return;
        }

        setSubmitting(true);
        
        const payload = {
            name,
            category,
            description,
            price: Number(price),
            unit,
            duration,
            includes: includes.split(',').map(item => item.trim()).filter(Boolean),
            featured,
            isActive
        };

        try {
            if (editingService) {
                const response = await adminApi.put(`/admin/services/${editingService._id}`, payload);
                if (response.data.success) {
                    setServices(services.map(s => s._id === editingService._id ? response.data.service : s));
                    setModalOpen(false);
                }
            } else {
                const response = await adminApi.post('/admin/services', payload);
                if (response.data.success) {
                    setServices([response.data.service, ...services]);
                    setModalOpen(false);
                }
            }
        } catch (err) {
            console.error('Failed to save service:', err);
            alert(err.response?.data?.message || 'Error occurred while saving service');
        } finally {
            setSubmitting(false);
        }
    };

    const handleDeleteService = async (serviceId) => {
        if (!window.confirm('Are you sure you want to delete this service?')) return;

        try {
            const response = await adminApi.delete(`/admin/services/${serviceId}`);
            if (response.data.success) {
                setServices(services.filter(s => s._id !== serviceId));
            }
        } catch (err) {
            console.error('Failed to delete service:', err);
            alert('Failed to delete service.');
        }
    };

    if (loading) {
        return (
            <div className="loading-container">
                <div className="spinner"></div>
                <p>Loading services...</p>
            </div>
        );
    }

    return (
        <div className="card-panel">
            <div className="card-panel-header">
                <h2 className="panel-title">Services Catalog</h2>
                <button className="btn-primary" onClick={openCreateModal}>
                    <Plus size={18} />
                    <span>Create New Service</span>
                </button>
            </div>

            <div className="table-wrapper">
                <table className="admin-table">
                    <thead>
                        <tr>
                            <th>Service Name</th>
                            <th>Category</th>
                            <th>Pricing</th>
                            <th>Duration</th>
                            <th>Status</th>
                            <th>Featured</th>
                            <th style={{ textAlign: 'right' }}>Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        {services.length > 0 ? (
                            services.map((service) => (
                                <tr key={service._id}>
                                    <td style={{ fontWeight: 600 }}>{service.name}</td>
                                    <td style={{ textTransform: 'capitalize' }}>{service.category.replace('_', ' ')}</td>
                                    <td>₹{service.price} / {service.unit || 'visit'}</td>
                                    <td>{service.duration || 'N/A'}</td>
                                    <td>
                                        <span className={`badge-status ${service.isActive ? 'active' : 'inactive'}`}>
                                            {service.isActive ? 'Active' : 'Hidden'}
                                        </span>
                                    </td>
                                    <td>
                                        {service.featured ? (
                                            <span style={{ color: 'var(--warning)', fontWeight: 600, fontSize: '13px' }}>★ Featured</span>
                                        ) : (
                                            <span style={{ opacity: 0.4, fontSize: '13px' }}>No</span>
                                        )}
                                    </td>
                                    <td style={{ textAlign: 'right' }}>
                                        <div className="action-icon-group" style={{ justifyContent: 'flex-end' }}>
                                            <button 
                                                className="action-icon-btn" 
                                                onClick={() => openEditModal(service)}
                                                title="Edit Service"
                                            >
                                                <Edit2 size={14} />
                                            </button>
                                            <button 
                                                className="action-icon-btn delete" 
                                                onClick={() => handleDeleteService(service._id)}
                                                title="Delete Service"
                                            >
                                                <Trash2 size={14} />
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            ))
                        ) : (
                            <tr>
                                <td colSpan="7" style={{ textAlign: 'center', color: 'var(--text-secondary)' }}>
                                    No services available.
                                </td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>

            {/* Creation/Edit Modal */}
            {modalOpen && (
                <div className="admin-modal-overlay">
                    <form className="admin-modal" onSubmit={handleFormSubmit}>
                        <h3 className="modal-header">
                            {editingService ? `Edit service: ${editingService.name}` : 'Create New Service Package'}
                        </h3>

                        <div className="form-group">
                            <label className="form-label">Service Package Name *</label>
                            <input
                                type="text"
                                className="form-input"
                                placeholder="e.g. Standard Kitchen Deep Cleaning"
                                value={name}
                                onChange={(e) => setName(e.target.value)}
                                required
                            />
                        </div>

                        <div className="form-row">
                            <div className="form-group">
                                <label className="form-label">Category *</label>
                                <select 
                                    className="form-select"
                                    value={category}
                                    onChange={(e) => setCategory(e.target.value)}
                                >
                                    {categories.map(cat => (
                                        <option key={cat} value={cat}>{cat.replace('_', ' ').toUpperCase()}</option>
                                    ))}
                                </select>
                            </div>

                            <div className="form-group">
                                <label className="form-label">Unit of Billing *</label>
                                <select 
                                    className="form-select"
                                    value={unit}
                                    onChange={(e) => setUnit(e.target.value)}
                                >
                                    {units.map(u => (
                                        <option key={u} value={u}>{u.toUpperCase()}</option>
                                    ))}
                                </select>
                            </div>
                        </div>

                        <div className="form-row">
                            <div className="form-group">
                                <label className="form-label">Base Fee (INR) *</label>
                                <input
                                    type="number"
                                    className="form-input"
                                    placeholder="499"
                                    value={price}
                                    onChange={(e) => setPrice(e.target.value)}
                                    required
                                    min="0"
                                />
                            </div>

                            <div className="form-group">
                                <label className="form-label">Duration Estimate *</label>
                                <input
                                    type="text"
                                    className="form-input"
                                    placeholder="e.g. 1.5 - 2 hours"
                                    value={duration}
                                    onChange={(e) => setDuration(e.target.value)}
                                />
                            </div>
                        </div>

                        <div className="form-group">
                            <label className="form-label">Description *</label>
                            <textarea
                                className="form-input"
                                placeholder="Detail what the service package covers..."
                                value={description}
                                onChange={(e) => setDescription(e.target.value)}
                                required
                            />
                        </div>

                        <div className="form-group">
                            <label className="form-label">Package Inclusions (comma-separated)</label>
                            <input
                                type="text"
                                className="form-input"
                                placeholder="Floor vacuuming, Cabinet cleaning, Dusting"
                                value={includes}
                                onChange={(e) => setIncludes(e.target.value)}
                            />
                        </div>

                        <div style={{ display: 'flex', gap: '24px', margin: '10px 0 20px 0' }}>
                            <label style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer', fontSize: '14px' }}>
                                <input
                                    type="checkbox"
                                    checked={featured}
                                    onChange={(e) => setFeatured(e.target.checked)}
                                />
                                Promote as Featured Package
                            </label>

                            <label style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer', fontSize: '14px' }}>
                                <input
                                    type="checkbox"
                                    checked={isActive}
                                    onChange={(e) => setIsActive(e.target.checked)}
                                />
                                Publish Service (Active)
                            </label>
                        </div>

                        <div className="modal-footer">
                            <button type="button" className="btn-secondary" onClick={() => setModalOpen(false)}>
                                <X size={16} />
                                <span>Cancel</span>
                            </button>
                            <button type="submit" className="btn-primary" disabled={submitting}>
                                <Check size={16} />
                                <span>{submitting ? 'Saving...' : 'Save Package'}</span>
                            </button>
                        </div>
                    </form>
                </div>
            )}
        </div>
    );
}
