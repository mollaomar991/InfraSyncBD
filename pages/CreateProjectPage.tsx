import { useState, type ChangeEvent, type FormEvent } from 'react';
import { useNavigate } from 'react-router-dom';
import LoadingButton from '../components/LoadingButton';
import PageHeader from '../components/PageHeader';
import Panel from '../components/Panel';
import { useApp } from '../context/AppContext';
import type { ProjectInput } from '../types';

const initialForm: ProjectInput = {
  name: '',
  type: 'Road Construction',
  description: '',
  budget: 0,
  startDate: '',
  endDate: '',
  road: '',
  area: '',
  latitude: 23.8103,
  longitude: 90.4125,
};

function CreateProjectPage() {
  const [form, setForm] = useState(initialForm);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const { addProject } = useApp();
  const navigate = useNavigate();

  function handleChange(
    event: ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>,
  ) {
    const { name, value } = event.target;
    const numericFields = ['budget', 'latitude', 'longitude'];

    setForm((currentForm) => ({
      ...currentForm,
      [name]: numericFields.includes(name) ? Number(value) : value,
    }));
  }

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError('');

    if (new Date(form.endDate) < new Date(form.startDate)) {
      setError('The expected completion date cannot be before the start date.');
      return;
    }

    if (form.budget < 0) {
      setError('Budget cannot be negative.');
      return;
    }

    setLoading(true);

    window.setTimeout(async () => {
      await addProject(form);
      navigate('/projects');
    }, 1200);
  }

  return (
    <div className="page-stack">
      <PageHeader
        eyebrow="PROJECT & GIS MANAGEMENT"
        title="Create Infrastructure Project"
        description="Enter the project information, schedule, budget, road location, and GIS coordinates. The new record is saved as a draft before conflict checking."
      />

      <div className="workflow-steps">
        <div className="workflow-step active">
          <span>1</span>
          <strong>Project details</strong>
        </div>
        <div className="workflow-step">
          <span>2</span>
          <strong>GIS location</strong>
        </div>
        <div className="workflow-step">
          <span>3</span>
          <strong>Conflict check</strong>
        </div>
        <div className="workflow-step">
          <span>4</span>
          <strong>Coordination</strong>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="content-grid content-grid-2-1 form-layout">
        <Panel title="Project information" subtitle="Fields required by the project module">
          <div className="form-grid">
            <label className="form-field full-field">
              <span>Project name *</span>
              <input
                name="name"
                value={form.name}
                onChange={handleChange}
                placeholder="Mirpur 12 Road Reconstruction"
                required
              />
            </label>

            <label className="form-field">
              <span>Project type *</span>
              <select name="type" value={form.type} onChange={handleChange}>
                <option>Road Construction</option>
                <option>Road Repair</option>
                <option>Water Pipeline</option>
                <option>Gas Pipeline</option>
                <option>Electricity Cable</option>
                <option>Fiber Cable</option>
                <option>Drainage</option>
                <option>Bridge Repair</option>
                <option>Emergency Excavation</option>
              </select>
            </label>

            <label className="form-field">
              <span>Estimated budget (BDT) *</span>
              <input
                type="number"
                name="budget"
                value={form.budget || ''}
                onChange={handleChange}
                min="0"
                placeholder="20000000"
                required
              />
            </label>

            <label className="form-field">
              <span>Start date *</span>
              <input
                type="date"
                name="startDate"
                value={form.startDate}
                onChange={handleChange}
                required
              />
            </label>

            <label className="form-field">
              <span>Expected completion *</span>
              <input
                type="date"
                name="endDate"
                value={form.endDate}
                onChange={handleChange}
                required
              />
            </label>

            <label className="form-field">
              <span>Road name *</span>
              <input
                name="road"
                value={form.road}
                onChange={handleChange}
                placeholder="Pallabi Main Road"
                required
              />
            </label>

            <label className="form-field">
              <span>Area *</span>
              <input
                name="area"
                value={form.area}
                onChange={handleChange}
                placeholder="Mirpur 12"
                required
              />
            </label>

            <label className="form-field full-field">
              <span>Project description *</span>
              <textarea
                name="description"
                value={form.description}
                onChange={handleChange}
                placeholder="Describe the planned work, road impact, and required utility coordination."
                required
              />
            </label>

            <label className="form-field full-field">
              <span>Project documents</span>
              <input type="file" multiple />
              <small>
                Select proposal, drawing, BOQ, schedule, utility plan, or budget
                files. This frontend demo does not upload them to a server.
              </small>
            </label>
          </div>
        </Panel>

        <div className="page-stack compact-stack">
          <Panel title="GIS coordinates" subtitle="Dhaka map location for conflict checking">
            <div className="form-grid single-column">
              <label className="form-field">
                <span>Latitude</span>
                <input
                  type="number"
                  step="0.0001"
                  name="latitude"
                  value={form.latitude}
                  onChange={handleChange}
                  required
                />
              </label>
              <label className="form-field">
                <span>Longitude</span>
                <input
                  type="number"
                  step="0.0001"
                  name="longitude"
                  value={form.longitude}
                  onChange={handleChange}
                  required
                />
              </label>
              <div className="coordinate-preview">
                <span>Selected point</span>
                <strong>
                  {form.latitude.toFixed(4)}, {form.longitude.toFixed(4)}
                </strong>
                <small>
                  Open the GIS Map after saving to verify the project marker.
                </small>
              </div>
            </div>
          </Panel>

          <Panel title="Draft rules" subtitle="Before formal submission">
            <ul className="check-list">
              <li>Only your verified department owns this project.</li>
              <li>The project begins with Draft status.</li>
              <li>Conflict checking starts after formal submission.</li>
              <li>Construction cannot begin before Final Approved status.</li>
            </ul>
          </Panel>

          {error && <div className="inline-alert danger">{error}</div>}

          <LoadingButton
            type="submit"
            fullWidth
            loading={loading}
            loadingText="Saving project draft…"
          >
            Save project as draft
          </LoadingButton>
        </div>
      </form>
    </div>
  );
}

export default CreateProjectPage;
