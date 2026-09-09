import { useState } from 'react';
import PageHeader from '../components/PageHeader';
import Panel from '../components/Panel';
import StatusBadge from '../components/StatusBadge';
import { useApp } from '../context/AppContext';
import { conflicts as initialConflicts } from '../data/mockData';
import type { Conflict } from '../types';

function ConflictsPage() {
  const [conflictItems, setConflictItems] = useState<Conflict[]>(initialConflicts);
  const [levelFilter, setLevelFilter] = useState('All');
  const { currentUser, showToast } = useApp();

  if (!currentUser) return null;

  const isAdmin = currentUser.role === 'super_admin';
  const filteredConflicts = conflictItems.filter(
    (item) => levelFilter === 'All' || item.level === levelFilter,
  );

  function updateConflict(conflictId: string, status: string) {
    setConflictItems((items) =>
      items.map((item) => (item.id === conflictId ? { ...item, status } : item)),
    );
    showToast(`Conflict changed to ${status}.`, 'info');
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
