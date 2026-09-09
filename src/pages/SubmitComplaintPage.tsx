import { useState, type FormEvent } from 'react';
import { useNavigate } from 'react-router-dom';
import LoadingButton from '../components/LoadingButton';
import PageHeader from '../components/PageHeader';
import Panel from '../components/Panel';
import { useApp } from '../context/AppContext';
import type { ComplaintInput } from '../types';

const initialForm: ComplaintInput = {
  project: '',
  category: 'Road Damage',
  location: '',
  description: '',
};

function SubmitComplaintPage() {
  const [form, setForm] = useState(initialForm);
  const [loading, setLoading] = useState(false);
  const { projects, addComplaint } = useApp();
  const navigate = useNavigate();

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setLoading(true);

    window.setTimeout(() => {
      addComplaint(form);
      navigate('/complaints');
    }, 1100);
  }

  return (
    <div className="page-stack">
      <PageHeader
        eyebrow="PUBLIC ISSUE REPORTING"
        title="Submit a Complaint"
        description="Report road damage, dust, noise, waterlogging, unsafe construction, project delay, illegal excavation, traffic blockage, or waste."
      />

      <form onSubmit={handleSubmit} className="content-grid content-grid-2-1 form-layout">
        <Panel title="Complaint details" subtitle="A reference number is generated after submission">
          <div className="form-grid">
            <label className="form-field full-field">
              <span>Related project *</span>
              <select
                value={form.project}
                onChange={(event) =>
                  setForm((current) => ({ ...current, project: event.target.value }))
                }
                required
              >
                <option value="">Select a public project</option>
                {projects.map((project) => (
                  <option key={project.id} value={project.name}>
                    {project.name} — {project.area}
                  </option>
                ))}
              </select>
            </label>

            <label className="form-field">
              <span>Complaint category *</span>
              <select
                value={form.category}
                onChange={(event) =>
                  setForm((current) => ({ ...current, category: event.target.value }))
                }
              >
                <option>Road Damage</option>
                <option>Dust</option>
                <option>Noise</option>
                <option>Waterlogging</option>
                <option>Unsafe Construction</option>
                <option>Project Delay</option>
                <option>Illegal Excavation</option>
                <option>Traffic Blockage</option>
                <option>Construction Waste</option>
              </select>
            </label>

            <label className="form-field">
              <span>Location *</span>
              <input
                value={form.location}
                onChange={(event) =>
                  setForm((current) => ({ ...current, location: event.target.value }))
                }
                placeholder="Road, landmark, or area"
                required
              />
            </label>

            <label className="form-field full-field">
              <span>Description *</span>
              <textarea
                value={form.description}
                onChange={(event) =>
                  setForm((current) => ({
                    ...current,
                    description: event.target.value,
                  }))
                }
                placeholder="Clearly describe the problem and its effect on road users."
                required
              />
            </label>

            <label className="form-field full-field">
              <span>Photograph</span>
              <input type="file" accept="image/*" />
              <small>Frontend file selection only; no server upload is included.</small>
            </label>
          </div>
        </Panel>

        <div className="page-stack compact-stack">
          <Panel title="Complaint workflow" subtitle="You receive updates at every stage">
            <div className="vertical-workflow">
              {[
                'Submitted',
                'Under Review',
                'Assigned',
                'In Progress',
                'Resolved',
                'Closed',
              ].map((status, index) => (
                <div key={status}>
                  <span>{index + 1}</span>
                  <strong>{status}</strong>
                </div>
              ))}
            </div>
          </Panel>

          <LoadingButton
            type="submit"
            fullWidth
            loading={loading}
            loadingText="Submitting complaint…"
          >
            Submit complaint
          </LoadingButton>
        </div>
      </form>
    </div>
  );
}

export default SubmitComplaintPage;
