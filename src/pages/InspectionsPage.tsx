import { useState } from 'react';
import PageHeader from '../components/PageHeader';
import Panel from '../components/Panel';
import StatusBadge from '../components/StatusBadge';
import { useApp } from '../context/AppContext';
import api from '../api/axiosClient';
import type { Inspection } from '../types';

function InspectionsPage() {
  const [inspectionItems, setInspectionItems] = useState<any[]>([]);
  const { currentUser, showToast, projects } = useApp();
  const [scheduleProjectId, setScheduleProjectId] = useState(projects[0]?.id || '');
  const [scheduleDate, setScheduleDate] = useState('');

  if (!currentUser) return null;

  const isAdmin = currentUser.role === 'super_admin';
  const isOfficer = currentUser.role === 'department_officer';
  const isContractor = currentUser.role === 'contractor';

  useEffect(() => {
    fetchInspections();
  }, []);

  async function fetchInspections() {
    try {
      const res = await api.get('/inspections');
      if (res.data.success) {
        setInspectionItems(res.data.data.map((item: any) => ({
          id: item.inspection_id,
          project: `Project ${item.project_id}`,
          milestone: item.milestone_id ? `Milestone ${item.milestone_id}` : 'General Inspection',
          date: item.scheduled_date,
          result: item.result === 'pending' ? 'Pending' : item.result === 'passed' ? 'Passed' : item.result === 'failed' ? 'Failed' : 'Reinspection Required',
          inspector: `Officer ${item.inspector_officer_id}`,
          failedItems: 0
        })));
      }
    } catch (e) {
      console.error(e);
    }
  }

  async function updateResult(
    inspectionId: string,
    result: Inspection['result'],
    failedItems = 0,
  ) {
    try {
      const dbResult = result === 'Passed' ? 'passed' : result === 'Failed' ? 'failed' : 'reinspection_required';
      const res = await api.post(`/inspections/${inspectionId}/save`, {
        result: dbResult,
        remarks: 'Reviewed by officer',
        checklist: []
      });
      if (res.data.success) {
        setInspectionItems((items) =>
          items.map((item) =>
            item.id === inspectionId ? { ...item, result, failedItems } : item,
          ),
        );
        showToast(`Inspection result changed to ${result}.`, 'info');
      }
    } catch (e) {
      console.error(e);
      showToast('Error saving inspection result', 'error');
    }
  }

  return (
    <div className="page-stack">
      <PageHeader
        eyebrow="QUALITY & SAFETY VERIFICATION"
        title={isAdmin ? 'Inspection Monitoring' : 'Project Inspections'}
        description={
          isAdmin
            ? 'Monitor scheduled inspections, checklist results, failed work, rework, and reinspection without performing department inspection duties.'
            : isContractor
              ? 'View inspection schedules, failed checklist items, required corrections, and reinspection deadlines.'
              : 'Schedule inspections, complete the quality checklist, record results, and create rework requests when work fails.'
        }
      />

      {isAdmin && (
        <div className="role-notice">
          <span>READ-ONLY INSPECTION OVERSIGHT</span>
          <p>
            Department Officers or authorized engineers record inspection
            results. Super Admin can only monitor compliance and delays.
          </p>
        </div>
      )}

      <div className="inspection-grid">
        {inspectionItems.map((inspection) => (
          <article className="inspection-card" key={inspection.id}>
            <div className="inspection-date">
              <span>{new Date(inspection.date).toLocaleString('en', { month: 'short' })}</span>
              <strong>{new Date(inspection.date).getDate()}</strong>
            </div>

            <div className="inspection-main">
              <div className="inspection-header">
                <div>
                  <span>{inspection.id}</span>
                  <h2>{inspection.project}</h2>
                  <p>{inspection.milestone}</p>
                </div>
                <StatusBadge status={inspection.result} />
              </div>

              <div className="inspection-meta">
                <div>
                  <span>Inspector</span>
                  <strong>{inspection.inspector}</strong>
                </div>
                <div>
                  <span>Failed items</span>
                  <strong>{inspection.failedItems}</strong>
                </div>
              </div>

              <div className="inspection-checks">
                {[
                  'Drawing compliance',
                  'Material quality',
                  'Worker safety',
                  'Traffic management',
                  'Site cleanliness',
                ].map((check, index) => (
                  <span key={check} className={index < 3 ? 'passed' : ''}>
                    {index < 3 ? '✓' : '○'} {check}
                  </span>
                ))}
              </div>

              {isOfficer && (
                <div className="card-actions">
                  <button
                    className="button button-primary"
                    type="button"
                    onClick={() => updateResult(inspection.id, 'Passed')}
                  >
                    Pass inspection
                  </button>
                  <button
                    className="button button-secondary"
                    type="button"
                    onClick={() => updateResult(inspection.id, 'Failed', 2)}
                  >
                    Fail & request rework
                  </button>
                </div>
              )}

              {isContractor && inspection.result === 'Failed' && (
                <button
                  className="button button-primary"
                  type="button"
                  onClick={() => {
                    updateResult(inspection.id, 'Reinspection Required');
                    showToast('Rework evidence submitted and reinspection requested.');
                  }}
                >
                  Submit rework & request reinspection
                </button>
              )}

              {isAdmin && (
                <button
                  className="button button-secondary"
                  type="button"
                  onClick={() =>
                    showToast(
                      `Inspection ${inspection.id} monitoring note opened.`,
                      'info',
                    )
                  }
                >
                  View compliance history
                </button>
              )}
            </div>
          </article>
        ))}
      </div>

      {isOfficer && (
        <Panel title="Schedule a new inspection" subtitle="Demo scheduling interaction">
          <div className="form-grid form-grid-4">
            <label className="form-field">
              <span>Project</span>
              <select value={scheduleProjectId} onChange={(e) => setScheduleProjectId(e.target.value)}>
                {projects.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
              </select>
            </label>
            <label className="form-field">
              <span>Milestone</span>
              <input placeholder="Surface construction" />
            </label>
            <label className="form-field">
              <span>Date</span>
              <input type="date" value={scheduleDate} onChange={(e) => setScheduleDate(e.target.value)} />
            </label>
            <button
              className="button button-primary align-end"
              type="button"
              onClick={async () => {
                if(!scheduleDate) return showToast('Select a date', 'error');
                try {
                  // extracting numeric ID from PRJ-XXXXXX for simplicity
                  const pid = scheduleProjectId.replace('PRJ-', '') || '1';
                  const res = await api.post('/inspections/schedule', { projectId: pid, scheduledDate: scheduleDate });
                  if (res.data.success) {
                    showToast('Inspection scheduled.');
                    fetchInspections();
                  }
                } catch(e) {
                   showToast('Error scheduling inspection', 'error');
                }
              }}
            >
              Schedule inspection
            </button>
          </div>
        </Panel>
      )}
    </div>
  );
}

export default InspectionsPage;
