import { useState, useEffect } from 'react';
import PageHeader from '../components/PageHeader';
import Panel from '../components/Panel';
import StatusBadge from '../components/StatusBadge';
import { useApp } from '../context/AppContext';
import api from '../api/axiosClient';
import type { Conflict } from '../types';

function ConflictsPage() {
  const [conflictItems, setConflictItems] = useState<Conflict[]>([]);
  const [levelFilter, setLevelFilter] = useState('All');
  const [selectedConflictId, setSelectedConflictId] = useState<string | null>(null);
  const [suggestedStartDate, setSuggestedStartDate] = useState('');
  const [suggestedEndDate, setSuggestedEndDate] = useState('');
  const [notes, setNotes] = useState('');
  const { currentUser, showToast, refreshProjects } = useApp();

  // Fetch conflicts from real API
  useEffect(() => {
    async function fetchConflicts() {
      try {
        const res = await api.get('/conflicts');
        if (res.data.success) {
          // Map database fields to frontend Conflict type
          const mapped = res.data.data.map((row: any) => ({
            id: row.conflict_id.toString(),
            level: row.conflict_level.charAt(0).toUpperCase() + row.conflict_level.slice(1),
            project: row.project_name || 'Unknown Project',
            conflictingProject: row.conflicting_project_name || 'Unknown Project',
            departments: `${row.project_department || ''} ↔ ${row.conflicting_department || ''}`,
            location: 'Same road / nearby area',
            overlap: row.created_at ? new Date(row.created_at).toLocaleDateString() : '',
            reason: row.conflict_reason,
            recommendation: row.recommended_sequence,
            status: row.resolution_status.charAt(0).toUpperCase() + row.resolution_status.slice(1).replace('_', ' '),
          }));
          setConflictItems(mapped);
        }
      } catch (error) {
        console.error('Error fetching conflicts:', error);
      }
    }
    fetchConflicts();
  }, []);

  if (!currentUser) return null;

  const isAdmin = currentUser.role === 'super_admin';
  const filteredConflicts = conflictItems.filter(
    (item) => levelFilter === 'All' || item.level === levelFilter,
  );

  async function updateConflict(conflictId: string, status: string) {
    try {
      if (status === 'Resolved') {
        await api.put(`/conflicts/${conflictId}/resolve`);
      }
      setConflictItems((items) =>
        items.map((item) => (item.id === conflictId ? { ...item, status } : item)),
      );
      showToast(`Conflict changed to ${status}.`, 'info');
    } catch (error) {
      console.error('Error updating conflict:', error);
      showToast('Failed to update conflict.', 'error');
    }
  }

  async function submitCoordination() {
    if (!selectedConflictId || !suggestedStartDate || !suggestedEndDate) {
      showToast('Please provide both start and end dates.', 'error');
      return;
    }
    
    try {
      await api.post(`/conflicts/${selectedConflictId}/coordinate`, {
        suggestedStartDate,
        suggestedEndDate,
        notes,
      });
      
      setConflictItems((items) =>
        items.map((item) => (item.id === selectedConflictId ? { ...item, status: 'Coordination Request Sent' } : item)),
      );
      
      showToast('Coordination request sent. Awaiting department approval.', 'info');
      await refreshProjects();
      
      // Reset and close modal
      setSelectedConflictId(null);
      setSuggestedStartDate('');
      setSuggestedEndDate('');
      setNotes('');
    } catch (error) {
      console.error('Error sending coordination request:', error);
      showToast('Failed to send coordination request.', 'error');
    }
  }

  return (
    <div className="page-stack">
      <PageHeader
        eyebrow="INTERDEPARTMENTAL COORDINATION"
        title={isAdmin ? 'Conflict Monitoring' : 'Project Conflict Detection'}
        description={
          isAdmin
            ? 'Monitor location and schedule conflicts across departments. Technical resolution remains with involved Department Officers.'
            : 'Review conflicts created from the same road, nearby coordinates, overlapping dates, utility corridors, and recently repaired roads.'
        }
      />

      {isAdmin && (
        <div className="role-notice">
          <span>MONITORING ONLY</span>
          <p>
            Super Admin can view conflict level, departments, location,
            recommendation, and resolution status but cannot set the technical
            work sequence.
          </p>
        </div>
      )}

      <Panel>
        <div className="filter-bar">
          <div className="segmented-control">
            {['All', 'High', 'Medium', 'Low'].map((level) => (
              <button
                key={level}
                type="button"
                className={levelFilter === level ? 'active' : ''}
                onClick={() => setLevelFilter(level)}
              >
                {level}
              </button>
            ))}
          </div>
          <span className="result-count">{filteredConflicts.length} alerts</span>
        </div>
      </Panel>

      <div className="conflict-grid">
        {filteredConflicts.map((conflict) => (
          <article
            className={`conflict-card conflict-${conflict.level.toLowerCase()}`}
            key={conflict.id}
          >
            <header>
              <div className="conflict-level-icon">!</div>
              <div>
                <span>{conflict.id}</span>
                <h2>{conflict.level} Conflict</h2>
              </div>
              <StatusBadge status={conflict.status} />
            </header>

            <div className="conflict-projects">
              <div>
                <span>Project</span>
                <strong>{conflict.project}</strong>
              </div>
              <span className="conflict-arrow">↔</span>
              <div>
                <span>Conflicting project</span>
                <strong>{conflict.conflictingProject}</strong>
              </div>
            </div>

            <div className="detail-list compact-details">
              <div>
                <span>Departments</span>
                <strong>{conflict.departments}</strong>
              </div>
              <div>
                <span>Location</span>
                <strong>{conflict.location}</strong>
              </div>
              <div>
                <span>Date overlap</span>
                <strong>{conflict.overlap}</strong>
              </div>
              <div>
                <span>Reason</span>
                <strong>{conflict.reason}</strong>
              </div>
            </div>

            <div className="recommendation-box">
              <span>System recommendation</span>
              <p>{conflict.recommendation}</p>
            </div>

            {!isAdmin && (
              <div className="card-actions">
                {conflict.status === 'Active' || conflict.status === 'Detected' ? (
                  <>
                      <button
                        className="button button-primary"
                        type="button"
                        onClick={() => setSelectedConflictId(conflict.id)}
                      >
                      Send coordination request
                    </button>
                    <button
                      className="button button-secondary"
                      type="button"
                      onClick={() => updateConflict(conflict.id, 'Resolved')}
                    >
                      Mark resolved
                    </button>
                  </>
                ) : (
                  <span style={{ color: '#888', fontStyle: 'italic', fontSize: '0.85rem' }}>
                    {conflict.status === 'Under coordination' || conflict.status === 'Coordination Request Sent' 
                      ? 'Coordination request sent' 
                      : 'Conflict resolved'}
                  </span>
                )}
              </div>
            )}
          </article>
        ))}
      </div>

      {selectedConflictId && (
        <div className="modal-backdrop">
          <div className="modal-card">
            <h2>Send Coordination Request</h2>
            <p style={{ marginBottom: '1.5rem', color: '#666' }}>
              Propose a new schedule for this work so the other department can review it.
            </p>
            
            <form
              onSubmit={(e) => {
                e.preventDefault();
                submitCoordination();
              }}
              className="form-grid"
            >
              <label className="form-field">
                <span>Proposed Start Date</span>
                <input
                  type="date"
                  value={suggestedStartDate}
                  onChange={(e) => setSuggestedStartDate(e.target.value)}
                  required
                />
              </label>

              <label className="form-field">
                <span>Response Due Date</span>
                <input
                  type="date"
                  value={suggestedEndDate}
                  onChange={(e) => setSuggestedEndDate(e.target.value)}
                  required
                />
              </label>

              <label className="form-field" style={{ gridColumn: '1 / -1' }}>
                <span>Additional Notes/Comments (Optional)</span>
                <textarea
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder="Example: We plan to work at night to minimize disruption. Please confirm."
                  rows={3}
                />
              </label>

              <div className="form-actions" style={{ gridColumn: '1 / -1', marginTop: '1rem' }}>
                <button
                  type="button"
                  className="button button-ghost"
                  onClick={() => setSelectedConflictId(null)}
                >
                  Cancel
                </button>
                <button type="submit" className="button button-primary">
                  Send Request
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

export default ConflictsPage;
