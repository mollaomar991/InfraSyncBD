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
  const { departments, addDepartment, showToast } = useApp();

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!form.name || !form.type || !form.office || !form.contact) return;

    setLoading(true);
    await new Promise((resolve) => window.setTimeout(resolve, 750));
    addDepartment({
      id: `DEP-${String(departments.length + 1).padStart(2, '0')}`,
      ...form,
      status: 'Active',
    });
    setLoading(false);
    setForm(emptyDepartment);
    setShowForm(false);
  }

  return (
    <div className="page-stack">
      <PageHeader
        eyebrow="OFFICIAL ORGANIZATION DIRECTORY"
        title="Government Departments"
        description="Create and maintain the official departments available to Department Officer registration."
        action={<button className="road-button road-button-primary" onClick={() => setShowForm(true)}>+ Add Department</button>}
      />

      <section className="department-card-grid">
        {departments.map((department, index) => (
          <article className="department-card card-enter" key={department.id} style={{ animationDelay: `${index * 60}ms` }}>
            <header><div className="department-icon">◆</div><div><span>{department.id}</span><h2>{department.name}</h2><p>{department.type}</p></div><StatusBadge value={department.status} /></header>
            <div className="detail-list detail-list-compact">
              <div><span>Office address</span><strong>{department.office}</strong></div>
              <div><span>Contact</span><strong>{department.contact}</strong></div>
            </div>
            <footer><button type="button" className="road-button road-button-secondary" onClick={() => showToast(`${department.name} edit form opened in demo mode.`, 'info')}>Edit Details</button><button type="button" className="text-link" onClick={() => showToast(`Officer directory opened for ${department.name}.`, 'info')}>View Officers →</button></footer>
          </article>
        ))}
      </section>

      {showForm && (
        <div className="modal-backdrop" onClick={() => setShowForm(false)}>
          <form className="modal-card department-modal" onSubmit={handleSubmit} onClick={(event: MouseEvent<HTMLFormElement>) => event.stopPropagation()}>
            <div className="hazard-strip" />
            <button type="button" className="drawer-close" onClick={() => setShowForm(false)}>×</button>
            <span className="page-eyebrow">NEW OFFICIAL DEPARTMENT</span>
            <h2>Add department record</h2>
            <p>Officers can register only under an existing active department.</p>
            <div className="standard-form-grid">
              <label className="form-field form-field-wide"><span>Department name *</span><input value={form.name} onChange={(event) => setForm({ ...form, name: event.target.value })} required /></label>
              <label className="form-field"><span>Department type *</span><input value={form.type} onChange={(event) => setForm({ ...form, type: event.target.value })} placeholder="Road, Water, Utility..." required /></label>
              <label className="form-field"><span>Contact information *</span><input value={form.contact} onChange={(event) => setForm({ ...form, contact: event.target.value })} required /></label>
              <label className="form-field form-field-wide"><span>Office address *</span><input value={form.office} onChange={(event) => setForm({ ...form, office: event.target.value })} required /></label>
            </div>
            <LoadingButton type="submit" block loading={loading} loadingText="Creating department...">Create Department</LoadingButton>
          </form>
        </div>
      )}
    </div>
  );
}

export default DepartmentsPage;
