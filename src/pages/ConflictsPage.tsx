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
  const { currentUser, showToast } = useApp();

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
                <button
                  className="button button-primary"
                  type="button"
                  onClick={() =>
                    updateConflict(conflict.id, 'Coordination Request Sent')
                  }
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
              </div>
            )}
          </article>
        ))}
      </div>
    </div>
  );
}

export default ConflictsPage;
