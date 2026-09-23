import { useState, useEffect, useMemo } from 'react';
import PageHeader from '../components/PageHeader';
import Panel from '../components/Panel';
import StatusBadge from '../components/StatusBadge';
import { useApp } from '../context/AppContext';
import api from '../api/axiosClient';
import type { Inspection } from '../types';

function InspectionsPage() {
  const [inspectionItems, setInspectionItems] = useState<any[]>([]);
  const { currentUser, showToast, projects, eligibleProjects } = useApp();
  const [scheduleProjectId, setScheduleProjectId] = useState('');
  const [scheduleDate, setScheduleDate] = useState('');
  const [checkedItems, setCheckedItems] = useState<Record<string, string[]>>({});



  if (!currentUser) return null;

  const isAdmin = currentUser.role === 'super_admin';
  const isOfficer = currentUser.role === 'department_officer';
  const isContractor = currentUser.role === 'contractor';

  useEffect(() => {
    fetchInspections();
  }, []);

  useEffect(() => {
    if (eligibleProjects.length > 0 && !scheduleProjectId) {
      setScheduleProjectId(String(eligibleProjects[0].dbId));
    }
  }, [eligibleProjects, scheduleProjectId]);

  async function fetchInspections() {
    try {
      const res = await api.get('/inspections');
      if (res.data.success) {
        setInspectionItems(res.data.data.map((item: any) => ({
          id: item.inspection_id,
          projectId: item.project_id,
          project: item.project_name || `Project ${item.project_id}`,
          contractor: item.contractor_name || 'Unassigned Contractor',
          milestone: item.milestone_id ? `Milestone ${item.milestone_id}` : 'General Inspection',
          date: item.scheduled_date,
          result: item.result === 'pending' ? 'Pending' : item.result === 'under_review' ? 'Under Review' : item.result === 'passed' ? 'Passed' : item.result === 'failed' ? 'Failed' : 'Reinspection Required',
          inspector: item.inspector_name || `Officer ${item.inspector_officer_id}`,
          failedItems: 0,
          checklist: item.checklist || []
        })));
      }
    } catch (e) {
      console.error(e);
    }
  }

  const visibleInspections = useMemo(() => {
    if (isAdmin) return inspectionItems;
    const eligibleIds = new Set(eligibleProjects.map(p => p.dbId));
    return inspectionItems.filter((inspection) => eligibleIds.has(inspection.projectId));
  }, [inspectionItems, eligibleProjects, isAdmin]);

  async function updateResult(
    inspectionId: string,
    result: string,
    failedItems = 0,
    checklistToSave?: string[]
  ) {
    try {
      const dbResult = result === 'Passed' ? 'passed' : result === 'Failed' ? 'failed' : result === 'Under Review' ? 'under_review' : 'reinspection_required';
      const payload: any = {
        result: dbResult,
        remarks: 'Workflow update'
      };
      if (checklistToSave !== undefined) {
        payload.checklist = checklistToSave;
      }
      const res = await api.post(`/inspections/${inspectionId}/save`, payload);
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

  function toggleCheck(inspectionId: string, check: string) {
    setCheckedItems(prev => {
      const current = prev[inspectionId] || [];
      if (current.includes(check)) {
        return { ...prev, [inspectionId]: current.filter(c => c !== check) };
      } else {
        return { ...prev, [inspectionId]: [...current, check] };
      }
    });
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
        {visibleInspections.map((inspection) => (
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
                  <p>{inspection.contractor} · {inspection.milestone}</p>
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

              <div className="inspection-checks" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', marginTop: '1rem' }}>
                {[
                  'Drawing compliance',
                  'Material quality',
                  'Worker safety',
                  'Traffic management',
                  'Site cleanliness',
                ].map((check, index) => {
                  const hasLocalData = checkedItems[inspection.id] !== undefined;
                  const isChecked = hasLocalData ? (checkedItems[inspection.id] || []).includes(check) : inspection.checklist.includes(check);
                  
                  const isInteractive = isContractor && (inspection.result === 'Pending' || inspection.result === 'Failed');

                  if (isInteractive) {
                    return (
                      <label key={check} style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer', color: isChecked ? '#10b981' : 'inherit' }}>
                        <input 
                          type="checkbox" 
                          checked={isChecked} 
                          onChange={() => toggleCheck(inspection.id, check)} 
                          style={{ width: '16px', height: '16px', accentColor: '#10b981' }}
                        />
                        {check}
                      </label>
                    );
                  }

                  return (
                    <label key={check} className={isChecked ? 'passed' : ''} style={{ display: 'flex', alignItems: 'center', gap: '8px', color: isChecked ? '#10b981' : 'inherit' }}>
                      <input 
                        type="checkbox" 
                        checked={isChecked} 
                        readOnly 
                        disabled
                        style={{ width: '16px', height: '16px', accentColor: '#10b981' }}
                      />
                      {check}
                    </label>
                  );
                })}
              </div>

              {isOfficer && (
                <div className="card-actions" style={{ marginTop: '1.5rem' }}>
                  <button
                    className="button button-primary"
                    type="button"
                    onClick={() => updateResult(inspection.id, 'Passed')}
                    disabled={inspection.result !== 'Under Review'}
                  >
                    Pass inspection
                  </button>
                  <button
                    className="button button-secondary"
                    type="button"
                    onClick={() => {
                       updateResult(inspection.id, 'Failed', 1);
                    }}
                    disabled={inspection.result !== 'Under Review'}
                  >
                    Fail & request rework
                  </button>
                </div>
              )}

              {isContractor && (inspection.result === 'Pending' || inspection.result === 'Failed') && (
                <button
                  className="button button-primary"
                  type="button"
                  style={{ marginTop: '1.5rem' }}
                  onClick={() => {
                    const toSave = checkedItems[inspection.id] !== undefined ? checkedItems[inspection.id] : inspection.checklist;
                    updateResult(inspection.id, 'Under Review', 0, toSave);
                  }}
                >
                  Submit to Engineer for Review
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

      {!visibleInspections.length && (
        <div className="empty-state large">
          <span>◉</span>
          <h3>No inspections found</h3>
          <p>You don't have any project inspections scheduled yet.</p>
        </div>
      )}

      {isOfficer && (
        <Panel title="Schedule a new inspection" subtitle="Demo scheduling interaction">
          <div className="form-grid form-grid-4">
            <label className="form-field">
              <span>Project</span>
              <select value={scheduleProjectId} onChange={(e) => setScheduleProjectId(e.target.value)}>
                {eligibleProjects.map(p => <option key={p.dbId} value={p.dbId}>{p.id} - {p.name}</option>)}
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
                  const res = await api.post('/inspections/schedule', { projectId: Number(scheduleProjectId), scheduledDate: scheduleDate });
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
