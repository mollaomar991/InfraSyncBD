import { useState, type ChangeEvent, type FormEvent } from 'react';
import { useNavigate } from 'react-router-dom';
import LoadingButton from '../components/LoadingButton';
import PageHeader from '../components/PageHeader';
import Panel from '../components/Panel';
import { useApp } from '../context/AppContext';
import { MapContainer, TileLayer, Polyline, Marker, useMapEvents, useMap, CircleMarker } from 'react-leaflet';
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

// Map click listener component
function MapClickHandler({ onAddPoint }: { onAddPoint: (latlng: [number, number]) => void }) {
  useMapEvents({
    click(e) {
      onAddPoint([e.latlng.lat, e.latlng.lng]);
    },
  });
  return null;
}

// Map center updater component
function MapCenterUpdater({ center }: { center: [number, number] }) {
  const map = useMap();
  map.setView(center, map.getZoom());
  return null;
}

function CreateProjectPage() {
  const [form, setForm] = useState(initialForm);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [mapCenter, setMapCenter] = useState<[number, number]>([23.8103, 90.4125]);
  const { addProject } = useApp();
  const navigate = useNavigate();

  function handleChange(
    event: ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>,
  ) {
    const { name, value } = event.target;
    const numericFields = ['budget'];

    setForm((currentForm) => ({
      ...currentForm,
      [name]: numericFields.includes(name) ? Number(value) : value,
    }));
  }

  function handleAddPoint(latlng: [number, number]) {
    setForm((current) => ({
      ...current,
      coordinates: [...current.coordinates, latlng],
    }));
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

      <form onSubmit={handleSubmit} className="page-stack form-layout">
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
              
              <div style={{ display: 'flex', gap: '1rem', marginBottom: '1rem' }}>
                <label className="form-field" style={{ flex: 1 }}>
                  <span>Search Latitude</span>
                  <input
                    type="number"
                    step="0.0001"
                    value={mapCenter[0]}
                    onChange={(e) => setMapCenter([Number(e.target.value), mapCenter[1]])}
                  />
                </label>
                <label className="form-field" style={{ flex: 1 }}>
                  <span>Search Longitude</span>
                  <input
                    type="number"
                    step="0.0001"
                    value={mapCenter[1]}
                    onChange={(e) => setMapCenter([mapCenter[0], Number(e.target.value)])}
                  />
                </label>
              </div>

              <div style={{ height: '550px', width: '100%', borderRadius: '8px', overflow: 'hidden', border: '1px solid #334155' }}>
                <MapContainer center={mapCenter} zoom={12} scrollWheelZoom style={{ height: '100%', width: '100%' }}>
                  <MapCenterUpdater center={mapCenter} />
                  <TileLayer
                    attribution='&copy; Google Maps'
                    url="https://mt1.google.com/vt/lyrs=y&x={x}&y={y}&z={z}"
                    maxZoom={21}
                  />
                  <MapClickHandler onAddPoint={handleAddPoint} />
                  
                  {/* Visual indicator for the search location */}
                  <CircleMarker 
                    center={mapCenter} 
                    radius={8} 
                    pathOptions={{ color: '#3b82f6', fillColor: '#3b82f6', fillOpacity: 0.5, weight: 2 }} 
                  />

                  {form.coordinates.length > 0 && (
                    <>
                      <Polyline positions={form.coordinates} pathOptions={{ color: '#ef4444', weight: 4 }} />
                      {form.coordinates.map((coord, idx) => (
                        <Marker key={idx} position={coord} />
                      ))}
                    </>
                  )}
                </MapContainer>
              </div>

              <div className="coordinate-preview" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div>
                  <span>Points selected</span>
                  <strong>{form.coordinates.length} points</strong>
                  <small>Click on the map to draw the road line.</small>
                </div>
                {form.coordinates.length > 0 && (
                  <button type="button" onClick={handleClearCoordinates} style={{ padding: '4px 12px', background: '#334155', color: '#fff', border: 'none', borderRadius: '4px', cursor: 'pointer' }}>
                    Clear Map
                  </button>
                )}
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
