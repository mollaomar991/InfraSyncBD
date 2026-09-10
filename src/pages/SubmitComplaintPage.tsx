import { useState, type FormEvent } from 'react';
import { useNavigate } from 'react-router-dom';
import LoadingButton from '../components/LoadingButton';
import PageHeader from '../components/PageHeader';
import Panel from '../components/Panel';
import { useApp } from '../context/AppContext';
import api from '../api/axiosClient';
const initialForm = {
  projectId: '',
  category: 'road_damage',
  locationAddress: '',
  description: '',
};

function SubmitComplaintPage() {
  const [form, setForm] = useState(initialForm);
  const [loading, setLoading] = useState(false);
  const { projects, showToast } = useApp();
  const navigate = useNavigate();

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setLoading(true);

    const formData = new FormData(event.currentTarget);
    formData.append('projectId', form.projectId);
    formData.append('category', form.category);
    formData.append('locationAddress', form.locationAddress);
    formData.append('description', form.description);

    try {
      const res = await api.post('/complaints/submit', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      if (res.data.success) {
        showToast('Complaint submitted with Ticket: ' + res.data.ticketNo, 'success');
        navigate('/complaints');
      }
    } catch (e) {
      console.error(e);
      showToast('Failed to submit complaint', 'error');
    } finally {
      setLoading(false);
    }
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
                value={form.projectId}
                onChange={(event) =>
                  setForm((current) => ({ ...current, projectId: event.target.value }))
                }
                required
              >
                <option value="">Select a public project</option>
                {projects.map((project) => (
                  <option key={project.id} value={project.id}>
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
                <option value="road_damage">Road Damage</option>
                <option value="dust_pollution">Dust</option>
                <option value="noise_violation">Noise</option>
                <option value="waterlogging">Waterlogging</option>
                <option value="unsafe_construction">Unsafe Construction</option>
                <option value="project_delay">Project Delay</option>
                <option value="illegal_excavation">Illegal Excavation</option>
                <option value="traffic_blockage">Traffic Blockage</option>
                <option value="construction_waste">Construction Waste</option>
              </select>
            </label>

            <label className="form-field">
              <span>Location *</span>
              <input
                value={form.locationAddress}
                onChange={(event) =>
                  setForm((current) => ({ ...current, locationAddress: event.target.value }))
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
              <input type="file" name="photo" accept="image/*" />
              <small>Upload photo evidence of the issue.</small>
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
