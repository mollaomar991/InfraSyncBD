import { useEffect, useMemo, useState, type ChangeEvent, type FormEvent } from 'react';
import api from '../api/axiosClient';
import PageHeader from '../components/PageHeader';
import Panel from '../components/Panel';
import { useApp } from '../context/AppContext';

type MaterialPrediction = {
  predicted_intensity_kg_per_m2: number;
  estimated_total_kg: number;
  estimated_total_tonnes: number;
  model_r2?: number;
  estimated_50kg_bags?: number;
  estimated_brick_count?: number;
  brick_weight_assumption_kg_each?: number;
};

type MaterialResult = {
  total_floor_area_m2: number;
  materials: Record<string, MaterialPrediction>;
  important_note?: string;
};

type HistoryRow = {
  estimate_id: number;
  estimate_type: string;
  output_json: any;
  created_at: string;
};

const initialInput = {
  total_floor_area_m2: 1000,
  floors: 3,
  construction_year: 2026,
  building_type: 'residential',
  structure_type: 'RC_unspecified',
  function_type: 'R_unspecified',
  country: 'Bangladesh',
  region: 'Dhaka',
  urban_rural: 'urban',
  brick_weight_kg: 3,
};

function MaterialEstimatorPage() {
  const { currentUser, projects } = useApp();
  const [selectedProjectId, setSelectedProjectId] = useState('');
  const [input, setInput] = useState(initialInput);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [result, setResult] = useState<MaterialResult | null>(null);
  const [history, setHistory] = useState<HistoryRow[]>([]);

  const eligibleProjects = useMemo(() => {
    if (currentUser?.role === 'contractor') {
      return projects.filter((project) => project.contractor === currentUser.organization);
    }
    if (currentUser?.role === 'department_officer') {
      return projects.filter((project) => project.department === currentUser.organization);
    }
    return [];
  }, [currentUser, projects]);

  useEffect(() => {
    if (!selectedProjectId && eligibleProjects[0]?.dbId) {
      setSelectedProjectId(String(eligibleProjects[0].dbId));
    }
  }, [eligibleProjects, selectedProjectId]);

  useEffect(() => {
    if (!selectedProjectId) {
      setHistory([]);
      return;
    }
    api.get(`/ai/project/${selectedProjectId}`)
      .then((response) => setHistory(response.data?.data || []))
      .catch(() => setHistory([]));
  }, [selectedProjectId]);

  function handleChange(event: ChangeEvent<HTMLInputElement | HTMLSelectElement>) {
    const { name, value } = event.target;
    const numeric = ['total_floor_area_m2', 'floors', 'construction_year', 'brick_weight_kg'];
    setInput((current) => ({ ...current, [name]: numeric.includes(name) ? Number(value) : value }));
    setResult(null);
  }

  async function submit(event: FormEvent) {
    event.preventDefault();
    setError('');
    if (!selectedProjectId) {
      setError('Select a project first so the material estimate can be connected to it.');
      return;
    }
    setLoading(true);
    try {
      const response = await api.post('/ai/material-estimate', {
        ...input,
        projectId: Number(selectedProjectId),
      });
      setResult(response.data.data);
      const historyResponse = await api.get(`/ai/project/${selectedProjectId}`);
      setHistory(historyResponse.data?.data || []);
    } catch (requestError: any) {
      setError(requestError.response?.data?.message || 'Material estimation failed. Check the Python AI environment and inputs.');
    } finally {
      setLoading(false);
    }
  }

  const selectedProject = eligibleProjects.find((project) => String(project.dbId) === selectedProjectId);

  return (
    <div className="page-stack">
      <PageHeader
        eyebrow="AI CONSTRUCTION PLANNING"
        title="Construction Material Estimator"
        description="Available to Department Officers and Contractors. Estimate brick, cement, aggregate, and steel from the trained material-intensity models and save the result directly to a project."
      />

      <div className="ai-model-banner material-banner">
        <div>
          <span className="ai-model-kicker">AI MODEL 2</span>
          <strong>Project-linked material quantity planning</strong>
          <small>Predicted kg/m² intensity is multiplied by total gross floor area. Use engineering BOQ verification before procurement.</small>
        </div>
        <span className="ai-model-score">4 trained targets</span>
      </div>

      <form onSubmit={submit} className="content-grid content-grid-2-1 ai-material-layout">
        <Panel title="Project + building inputs" subtitle="The estimate will be saved in this project's AI history">
          <div className="form-grid">
            <label className="form-field full-field">
              <span>Connected project *</span>
              <select value={selectedProjectId} onChange={(e) => { setSelectedProjectId(e.target.value); setResult(null); }} required>
                <option value="">Select a project</option>
                {eligibleProjects.map((project) => (
                  <option key={project.id} value={project.dbId}>{project.id} · {project.name}</option>
                ))}
              </select>
              {!eligibleProjects.length && <small>No project owned/assigned to this account is currently available.</small>}
            </label>

            <label className="form-field"><span>Total gross floor area (m²) *</span><input type="number" min="1" step="any" name="total_floor_area_m2" value={input.total_floor_area_m2} onChange={handleChange} required /></label>
            <label className="form-field"><span>Number of floors</span><input type="number" min="0" step="any" name="floors" value={input.floors} onChange={handleChange} /></label>
            <label className="form-field"><span>Construction year</span><input type="number" min="1900" max="2035" name="construction_year" value={input.construction_year} onChange={handleChange} /></label>
            <label className="form-field"><span>Average brick weight (kg)</span><input type="number" min="0.1" step="0.1" name="brick_weight_kg" value={input.brick_weight_kg} onChange={handleChange} /></label>

            <label className="form-field"><span>Building type</span><input name="building_type" value={input.building_type} onChange={handleChange} placeholder="residential" /></label>
            <label className="form-field"><span>Structure type</span><select name="structure_type" value={input.structure_type} onChange={handleChange}><option value="RC_unspecified">Reinforced concrete</option><option value="M_brick">Masonry / brick</option><option value="T_traditional">Traditional</option><option value="Unspecified">Unspecified</option></select></label>
            <label className="form-field"><span>Function type</span><select name="function_type" value={input.function_type} onChange={handleChange}><option value="R_unspecified">Residential</option><option value="R_SFH_unspecified">Single-family residential</option><option value="NR_civic">Civic / public</option><option value="NR_unspecified">Non-residential</option><option value="Unspecified">Unspecified</option></select></label>
            <label className="form-field"><span>Country</span><input name="country" value={input.country} onChange={handleChange} /></label>
            <label className="form-field"><span>Region</span><input name="region" value={input.region} onChange={handleChange} /></label>
            <label className="form-field"><span>Urban / rural</span><select name="urban_rural" value={input.urban_rural} onChange={handleChange}><option value="urban">Urban</option><option value="rural">Rural</option><option value="Unspecified">Unspecified</option></select></label>
          </div>

          {error && <div className="inline-alert danger ai-alert">{error}</div>}
          <div className="ai-estimate-actions">
            <button className="button button-primary" type="submit" disabled={loading || !eligibleProjects.length}>{loading ? 'Running material models…' : 'Estimate & save to project'}</button>
            <small>{selectedProject ? `Saving to ${selectedProject.id} · ${selectedProject.name}` : 'Select a project to continue.'}</small>
          </div>
        </Panel>

        <Panel title="Model guidance" subtitle="How to use this result">
          <ul className="check-list">
            <li>Brick count uses the brick-weight assumption entered here.</li>
            <li>Cement bags use 50 kg per bag.</li>
            <li>Aggregate is the dataset's combined aggregate target and must not be described as pure sand.</li>
            <li>Model quality varies by material; the cards show each test R².</li>
            <li>Use this for early planning, then verify with the project's engineering BOQ.</li>
          </ul>
        </Panel>
      </form>

      {result && (
        <Panel title="AI material estimate" subtitle={`Saved to ${selectedProject?.id || 'selected project'} · ${result.total_floor_area_m2.toLocaleString()} m² gross floor area`}>
          <div className="material-result-grid">
            {Object.entries(result.materials).map(([name, material]) => (
              <article className="material-result-card" key={name}>
                <div className="material-result-head"><span>{name}</span><small>R² {typeof material.model_r2 === 'number' ? material.model_r2.toFixed(2) : 'N/A'}</small></div>
                {name === 'brick' && <strong>{Math.round(material.estimated_brick_count || 0).toLocaleString()} bricks</strong>}
                {name === 'cement' && <strong>{Math.round(material.estimated_50kg_bags || 0).toLocaleString()} bags</strong>}
                {name !== 'brick' && name !== 'cement' && <strong>{material.estimated_total_tonnes.toLocaleString(undefined, { maximumFractionDigits: 2 })} tonnes</strong>}
                <p>{material.estimated_total_kg.toLocaleString(undefined, { maximumFractionDigits: 0 })} kg total</p>
                <small>{material.predicted_intensity_kg_per_m2.toFixed(2)} kg/m² predicted intensity</small>
              </article>
            ))}
          </div>
          {result.important_note && <div className="inline-alert warning ai-alert">{result.important_note}</div>}
        </Panel>
      )}

      <Panel title="Saved AI history" subtitle="Latest AI estimates linked to the selected project">
        {history.length ? (
          <div className="ai-history-list">
            {history.slice(0, 8).map((item) => (
              <div className="ai-history-item" key={item.estimate_id}>
                <div><strong>{item.estimate_type === 'materials' ? 'Material quantity estimate' : 'Budget estimate'}</strong><small>{new Date(item.created_at).toLocaleString()}</small></div>
                <span>#{item.estimate_id}</span>
              </div>
            ))}
          </div>
        ) : <p className="muted-copy">No saved AI estimates for this selected project yet.</p>}
      </Panel>
    </div>
  );
}

export default MaterialEstimatorPage;
