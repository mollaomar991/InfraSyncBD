import { useState, type FormEvent, type MouseEvent } from 'react';
import LoadingButton from '../components/LoadingButton';
import PageHeader from '../components/PageHeader';
import StatusBadge from '../components/StatusBadge';
import { useApp } from '../context/AppContext';
import type { Department } from '../types';

const emptyDepartment: Omit<Department, 'id' | 'status'> = {
  name: '',
  type: '',
  office: '',
  contact: '',
};

function DepartmentsPage() {
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState(emptyDepartment);
  const [loading, setLoading] = useState(false);
  const [editingDepartment, setEditingDepartment] = useState<Department | null>(null);
  const [viewingOfficersFor, setViewingOfficersFor] = useState<Department | null>(null);
  
  const { departments, addDepartment, updateDepartment, showToast } = useApp();

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!form.name || !form.type || !form.office || !form.contact) return;

    setLoading(true);
    await new Promise((resolve) => window.setTimeout(resolve, 750));
    
    if (editingDepartment) {
      updateDepartment({
        ...editingDepartment,
        ...form,
      });
      setEditingDepartment(null);
    } else {
      addDepartment({
        id: `DEP-${String(departments.length + 1).padStart(2, '0')}`,
        ...form,
        status: 'Active',
      });
      setShowForm(false);
    }
    
    setLoading(false);
    setForm(emptyDepartment);
  }

  function openEditModal(department: Department) {
    setForm({
      name: department.name,
      type: department.type,
      office: department.office || '',
      contact: department.contact || '',
    });
    setEditingDepartment(department);
  }

  return (
    <div className="page-stack">
      <PageHeader
        eyebrow="OFFICIAL ORGANIZATION DIRECTORY"
        title="Government Departments"
        description="Create and maintain the official departments available to Department Officer registration."
        action={<button className="road-button road-button-primary" onClick={() => { setForm(emptyDepartment); setShowForm(true); }}>+ Add Department</button>}
      />

      <section className="department-card-grid">
        {departments.map((department, index) => (
          <article className="department-card card-enter" key={department.id} style={{ animationDelay: `${index * 60}ms` }}>
            <header><div className="department-icon">◆</div><div><span>{department.id}</span><h2>{department.name}</h2><p>{department.type}</p></div><StatusBadge value={department.status} /></header>
            <div className="detail-list detail-list-compact">
              <div><span>Office address</span><strong>{department.office || 'N/A'}</strong></div>
              <div><span>Contact</span><strong>{department.contact || 'N/A'}</strong></div>
            </div>
            <footer>
              <button type="button" className="road-button road-button-secondary" onClick={() => openEditModal(department)}>Edit Details</button>
              <button type="button" className="text-link" onClick={() => setViewingOfficersFor(department)}>View Officers →</button>
            </footer>
          </article>
        ))}
      </section>

      {(showForm || editingDepartment) && (
        <div className="modal-backdrop" onClick={() => { setShowForm(false); setEditingDepartment(null); }}>
          <form className="modal-card department-modal" onSubmit={handleSubmit} onClick={(event: MouseEvent<HTMLFormElement>) => event.stopPropagation()}>
            <div className="hazard-strip" />
            <button type="button" className="drawer-close" onClick={() => { setShowForm(false); setEditingDepartment(null); }}>×</button>
            <span className="page-eyebrow">{editingDepartment ? 'EDIT OFFICIAL DEPARTMENT' : 'NEW OFFICIAL DEPARTMENT'}</span>
            <h2>{editingDepartment ? 'Edit department record' : 'Add department record'}</h2>
            <p>Officers can register only under an existing active department.</p>
            <div className="standard-form-grid">
              <label className="form-field form-field-wide"><span>Department name *</span><input value={form.name} onChange={(event) => setForm({ ...form, name: event.target.value })} required /></label>
              <label className="form-field"><span>Department type *</span><input value={form.type} onChange={(event) => setForm({ ...form, type: event.target.value })} placeholder="Road, Water, Utility..." required /></label>
              <label className="form-field"><span>Contact information *</span><input value={form.contact} onChange={(event) => setForm({ ...form, contact: event.target.value })} required /></label>
              <label className="form-field form-field-wide"><span>Office address *</span><input value={form.office} onChange={(event) => setForm({ ...form, office: event.target.value })} required /></label>
            </div>
            <LoadingButton type="submit" block loading={loading} loadingText={editingDepartment ? 'Saving...' : 'Creating department...'}>{editingDepartment ? 'Save Changes' : 'Create Department'}</LoadingButton>
          </form>
        </div>
      )}

      {viewingOfficersFor && (
        <div className="modal-backdrop" onClick={() => setViewingOfficersFor(null)}>
          <div className="modal-card department-modal" onClick={(event: MouseEvent<HTMLDivElement>) => event.stopPropagation()} style={{ maxWidth: '500px' }}>
            <div className="hazard-strip" />
            <button type="button" className="drawer-close" onClick={() => setViewingOfficersFor(null)}>×</button>
            <span className="page-eyebrow">{viewingOfficersFor.id}</span>
            <h2>Officers in {viewingOfficersFor.name}</h2>
            <p style={{ marginBottom: '1.5rem' }}>Active department officers assigned to this organization.</p>
            
            <div className="timeline-list">
              <div className="timeline-item" style={{ padding: '12px', background: '#f8fafc', borderRadius: '8px' }}>
                <span className="timeline-dot info" />
                <div>
                  <strong>Eng. Salman</strong>
                  <small>salman@{viewingOfficersFor.name.toLowerCase().replace(/[^a-z]/g, '')}.gov.bd</small>
                </div>
              </div>
              <div className="timeline-item" style={{ padding: '12px', background: '#f8fafc', borderRadius: '8px', marginTop: '8px' }}>
                <span className="timeline-dot info" />
                <div>
                  <strong>Eng. Kamrul</strong>
                  <small>kamrul@{viewingOfficersFor.name.toLowerCase().replace(/[^a-z]/g, '')}.gov.bd</small>
                </div>
              </div>
            </div>
            
            <button className="button button-primary" style={{ width: '100%', marginTop: '2rem' }} onClick={() => setViewingOfficersFor(null)}>Close Directory</button>
          </div>
        </div>
      )}
    </div>
  );
}

export default DepartmentsPage;
