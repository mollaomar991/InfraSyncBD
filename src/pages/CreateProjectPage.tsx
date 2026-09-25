import { useEffect, useState, type ChangeEvent, type FormEvent } from 'react';
import { useNavigate } from 'react-router-dom';
import { CircleMarker, MapContainer, Marker, Polyline, TileLayer, useMap, useMapEvents } from 'react-leaflet';
import api from '../api/axiosClient';
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
  coordinates: [],
};

const initialBudgetAiInput: Record<string, string | number> = {
  Project_Type: 'ASPHALT',
  Project_Year: 2024,
  Number_of_BOQ_Items: 73,
  Excavation_CY: 429,
  Base_Stone_Ton: 50,
  Asphalt_Ton: 748,
  Concrete_Pavement_SY: 0,
  Drainage_Pipe_LF: 59,
  Drainage_Inlets_Each: 2,
  Pavement_Marking_LF: 6806,
  Guard_Rail_LF: 0,
  Riprap_Ton: 42,
  Grassing_SY: 670,
};

const budgetFieldLabels: Record<string, string> = {
  Number_of_BOQ_Items: 'Number of BOQ items',
  Project_Year: 'Model cost year (2018–2024)',
  Excavation_CY: 'Excavation (C.Y.)',
  Base_Stone_Ton: 'Base stone (tons)',
  Asphalt_Ton: 'Asphalt (tons)',
  Concrete_Pavement_SY: 'Concrete pavement (S.Y.)',
  Drainage_Pipe_LF: 'Drainage pipe (L.F.)',
  Drainage_Inlets_Each: 'Drainage inlets (each)',
  Pavement_Marking_LF: 'Pavement marking (L.F.)',
  Guard_Rail_LF: 'Guard rail (L.F.)',
  Riprap_Ton: 'Riprap / stone (tons)',
  Grassing_SY: 'Grassing (S.Y.)',
};

const projectTypeToAiType: Record<string, string> = {
  'Road Construction': 'ASPHALT',
  'Road Repair': 'ASPHALT',
  'Water Pipeline': 'UTILITY-WATER',
  'Drainage': 'DRAINAGE-PIPE',
  'Bridge Repair': 'BRIDGE',
  'Gas Pipeline': 'Uncategorized Project',
  'Electricity Cable': 'Uncategorized Project',
  'Fiber Cable': 'Uncategorized Project',
  'Emergency Excavation': 'GRADING/EXCAVATION',
};

type BudgetAiResult = {
  estimated_budget_usd: number;
  estimated_budget_bdt: number;
  exchange_rate_usd_to_bdt: number;
  model_r2?: number;
  training_projects?: number;
};

function MapClickHandler({ onAddPoint }: { onAddPoint: (latlng: [number, number]) => void }) {
  useMapEvents({
    click(e) {
      onAddPoint([e.latlng.lat, e.latlng.lng]);
    },
  });
  return null;
}

function MapCenterUpdater({ center }: { center: [number, number] }) {
  const map = useMap();
  map.setView(center, map.getZoom());
  return null;
}

// added ai model-1 ui
// i fix this something
// Refined project list UI and improved project status display
function CreateProjectPage() {
  const [form, setForm] = useState(initialForm);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [mapCenter, setMapCenter] = useState<[number, number]>([23.8103, 90.4125]);
  const [budgetAiInput, setBudgetAiInput] = useState(initialBudgetAiInput);
  const [budgetProjectTypes, setBudgetProjectTypes] = useState<string[]>(['ASPHALT', 'BRIDGE', 'DRAINAGE-PIPE', 'UTILITY-WATER', 'Uncategorized Project']);
  const [budgetAiLoading, setBudgetAiLoading] = useState(false);
  const [budgetAiError, setBudgetAiError] = useState('');
  const [budgetAiResult, setBudgetAiResult] = useState<BudgetAiResult | null>(null);
  const { addProject } = useApp();
  const navigate = useNavigate();

  useEffect(() => {
    api.get('/ai/metadata')
      .then((response) => {
        const types = response.data?.data?.budget?.projectTypes;
        if (Array.isArray(types) && types.length) setBudgetProjectTypes(types);
      })
      .catch(() => {
        // The estimator will show its own error if the backend/Python service is unavailable.
      });
  }, []);

  function handleChange(event: ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) {
    const { name, value } = event.target;
    const numericFields = ['budget'];

    setForm((currentForm) => ({
      ...currentForm,
      [name]: numericFields.includes(name) ? Number(value) : value,
    }));

    if (name === 'type') {
      setBudgetAiInput((current) => ({
        ...current,
        Project_Type: projectTypeToAiType[value] || 'Uncategorized Project',
      }));
    }
  }

  function handleBudgetAiChange(event: ChangeEvent<HTMLInputElement | HTMLSelectElement>) {
    const { name, value } = event.target;
    setBudgetAiInput((current) => ({
      ...current,
      [name]: name === 'Project_Type' ? value : Number(value),
    }));
    setBudgetAiResult(null);
  }

  async function estimateBudget() {
    setBudgetAiLoading(true);
    setBudgetAiError('');
    try {
      const response = await api.post('/ai/budget-estimate', budgetAiInput);
      const result = response.data.data as BudgetAiResult;
      setBudgetAiResult(result);
      setForm((current) => ({ ...current, budget: Math.round(result.estimated_budget_bdt) }));
    } catch (requestError: any) {
      const details = requestError.response?.data?.details;
      const detailText = Array.isArray(details) ? ` ${details.join(' · ')}` : '';
      setBudgetAiError(`${requestError.response?.data?.message || 'AI budget estimation failed.'}${detailText}`);
    } finally {
      setBudgetAiLoading(false);
    }
  }

  function handleAddPoint(latlng: [number, number]) {
    setForm((current) => ({ ...current, coordinates: [...current.coordinates, latlng] }));
  }

  function handleClearCoordinates() {
    setForm((current) => ({ ...current, coordinates: [] }));
  }

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError('');

    if (form.coordinates.length === 0) {
      setError('Please click on the map to draw the project location.');
      return;
    }
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
      try {
        await addProject({
          ...form,
          aiBudgetEstimate: budgetAiResult
            ? { input: budgetAiInput, prediction: budgetAiResult }
            : undefined,
        });
        navigate('/projects');
      } finally {
        setLoading(false);
      }
    }, 500);
  }

  return (
    <div className="page-stack">
      <PageHeader
        eyebrow="PROJECT & GIS MANAGEMENT"
        title="Create Infrastructure Project"
        description="Use the trained BOQ AI model to review a planning budget first, then create the project and save the estimate with the project record."
      />

      <div className="workflow-steps">
        <div className="workflow-step active"><span>1</span><strong>AI budget + details</strong></div>
        <div className="workflow-step"><span>2</span><strong>GIS location</strong></div>
        <div className="workflow-step"><span>3</span><strong>Conflict check</strong></div>
        <div className="workflow-step"><span>4</span><strong>Coordination</strong></div>
      </div>

      <form onSubmit={handleSubmit} className="page-stack form-layout">
        <Panel
          title="AI Model 1 · BOQ Budget Estimator"
          subtitle="Estimate the project budget before creation. A successful prediction automatically fills the normal BDT budget field below."
        >
          <div className="ai-model-banner">
            <div>
              <span className="ai-model-kicker">TRAINED NEURAL NETWORK</span>
              <strong>Planning-support budget prediction</strong>
              <small>Model output is USD and is converted by the backend using the configured USD→BDT rate.</small>
            </div>
            <span className="ai-model-score">R² ≈ 0.72</span>
          </div>

          <div className="form-grid ai-form-grid">
            <label className="form-field full-field">
              <span>AI project category *</span>
              <select name="Project_Type" value={String(budgetAiInput.Project_Type)} onChange={handleBudgetAiChange}>
                {budgetProjectTypes.map((type) => <option key={type}>{type}</option>)}
              </select>
              <small>This category belongs to the training dataset and may differ from the InfraSync project type.</small>
            </label>

            {Object.keys(budgetFieldLabels).map((field) => (
              <label className="form-field" key={field}>
                <span>{budgetFieldLabels[field]}</span>
                <input
                  type="number"
                  name={field}
                  value={Number(budgetAiInput[field])}
                  onChange={handleBudgetAiChange}
                  min="0"
                  step="any"
                />
              </label>
            ))}
          </div>

          {budgetAiError && <div className="inline-alert danger ai-alert">{budgetAiError}</div>}

          <div className="ai-estimate-actions">
            <button className="button button-primary" type="button" onClick={estimateBudget} disabled={budgetAiLoading}>
              {budgetAiLoading ? 'Running AI model…' : 'Estimate budget with AI'}
            </button>
            <small>The officer can still edit the final project budget after reviewing the prediction.</small>
          </div>

          {budgetAiResult && (
            <div className="ai-result-grid">
              <div className="ai-result-card"><span>AI estimate (USD)</span><strong>${budgetAiResult.estimated_budget_usd.toLocaleString(undefined, { maximumFractionDigits: 0 })}</strong></div>
              <div className="ai-result-card featured"><span>AI estimate (BDT)</span><strong>৳{budgetAiResult.estimated_budget_bdt.toLocaleString(undefined, { maximumFractionDigits: 0 })}</strong></div>
              <div className="ai-result-card"><span>Conversion used</span><strong>1 USD = ৳{budgetAiResult.exchange_rate_usd_to_bdt}</strong></div>
            </div>
          )}
        </Panel>

        <Panel title="Project information" subtitle="Review the AI-filled budget and complete the project fields">
          <div className="form-grid">
            <label className="form-field full-field">
              <span>Project name *</span>
              <input name="name" value={form.name} onChange={handleChange} placeholder="Mirpur 12 Road Reconstruction" required />
            </label>

            <label className="form-field">
              <span>Project type *</span>
              <select name="type" value={form.type} onChange={handleChange}>
                <option>Road Construction</option><option>Road Repair</option><option>Water Pipeline</option>
                <option>Gas Pipeline</option><option>Electricity Cable</option><option>Fiber Cable</option>
                <option>Drainage</option><option>Bridge Repair</option><option>Emergency Excavation</option>
              </select>
            </label>

            <label className="form-field">
              <span>Estimated budget (BDT) *</span>
              <input type="number" name="budget" value={form.budget || ''} onChange={handleChange} min="0" placeholder="20000000" required />
              {budgetAiResult && <small className="ai-filled-note">AI-filled · editable by officer</small>}
            </label>

            <label className="form-field"><span>Start date *</span><input type="date" name="startDate" value={form.startDate} onChange={handleChange} required /></label>
            <label className="form-field"><span>Expected completion *</span><input type="date" name="endDate" value={form.endDate} onChange={handleChange} required /></label>
            <label className="form-field"><span>Road name *</span><input name="road" value={form.road} onChange={handleChange} placeholder="Pallabi Main Road" required /></label>
            <label className="form-field"><span>Area *</span><input name="area" value={form.area} onChange={handleChange} placeholder="Mirpur 12" required /></label>

            <label className="form-field full-field">
              <span>Project description *</span>
              <textarea name="description" value={form.description} onChange={handleChange} placeholder="Describe the planned work, road impact, and required utility coordination." required />
            </label>

            <label className="form-field full-field">
              <span>Project documents</span>
              <input type="file" multiple />
              <small>Select proposal, drawing, BOQ, schedule, utility plan, or budget files. This frontend demo does not upload them to a server.</small>
            </label>
          </div>
        </Panel>

        <div className="page-stack compact-stack">
          <Panel title="GIS coordinates" subtitle="Dhaka map location for conflict checking">
            <div className="form-grid single-column">
              <div style={{ display: 'flex', gap: '1rem', marginBottom: '1rem' }}>
                <label className="form-field" style={{ flex: 1 }}><span>Search Latitude</span><input type="number" step="0.0001" value={mapCenter[0]} onChange={(e) => setMapCenter([Number(e.target.value), mapCenter[1]])} /></label>
                <label className="form-field" style={{ flex: 1 }}><span>Search Longitude</span><input type="number" step="0.0001" value={mapCenter[1]} onChange={(e) => setMapCenter([mapCenter[0], Number(e.target.value)])} /></label>
              </div>

              <div style={{ height: '550px', width: '100%', borderRadius: '8px', overflow: 'hidden', border: '1px solid #334155' }}>
                <MapContainer center={mapCenter} zoom={12} scrollWheelZoom style={{ height: '100%', width: '100%' }}>
                  <MapCenterUpdater center={mapCenter} />
                  <TileLayer attribution="&copy; Google Maps" url="https://mt1.google.com/vt/lyrs=y&x={x}&y={y}&z={z}" maxZoom={21} />
                  <MapClickHandler onAddPoint={handleAddPoint} />
                  <CircleMarker center={mapCenter} radius={8} pathOptions={{ color: '#3b82f6', fillColor: '#3b82f6', fillOpacity: 0.5, weight: 2 }} />
                  {form.coordinates.length > 0 && <><Polyline positions={form.coordinates} pathOptions={{ color: '#ef4444', weight: 4 }} />{form.coordinates.map((coord, idx) => <Marker key={idx} position={coord} />)}</>}
                </MapContainer>
              </div>

              <div className="coordinate-preview" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div><span>Points selected</span><strong>{form.coordinates.length} points</strong><small>Click on the map to draw the road line.</small></div>
                {form.coordinates.length > 0 && <button type="button" onClick={handleClearCoordinates} style={{ padding: '4px 12px', background: '#334155', color: '#fff', border: 'none', borderRadius: '4px', cursor: 'pointer' }}>Clear Map</button>}
              </div>
            </div>
          </Panel>

          <Panel title="AI + project rules" subtitle="Before formal submission">
            <ul className="check-list">
              <li>The AI budget is planning support, not an approved engineering estimate.</li>
              <li>If used, the AI budget prediction is saved with this project for traceability.</li>
              <li>Material quantities can be estimated later from AI Materials by officers and assigned contractors.</li>
              <li>Construction still follows the normal conflict, approval, contractor, inspection, and progress workflows.</li>
            </ul>
          </Panel>

          {error && <div className="inline-alert danger">{error}</div>}
          <LoadingButton type="submit" fullWidth loading={loading} loadingText="Saving project draft…">Save project as draft</LoadingButton>
        </div>
      </form>
    </div>
  );
}

export default CreateProjectPage;
