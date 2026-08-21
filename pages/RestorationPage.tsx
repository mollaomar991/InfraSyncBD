import { useState } from 'react';
import PageHeader from '../components/PageHeader';
import Panel from '../components/Panel';
import StatusBadge from '../components/StatusBadge';
import { useApp } from '../context/AppContext';
import { restorations as initialRestorations } from '../data/mockData';
import type { Restoration } from '../types';

function RestorationPage() {
  const [restorationItems, setRestorationItems] =
    useState<Restoration[]>(initialRestorations);
  const { currentUser, showToast } = useApp();

  if (!currentUser) return null;

  const isAdmin = currentUser.role === 'super_admin';
  const isOfficer = currentUser.role === 'department_officer';
  const isContractor = currentUser.role === 'contractor';

  function updateStatus(
    restorationId: string,
    status: Restoration['status'],
  ) {
    setRestorationItems((items) =>
      items.map((item) =>
        item.id === restorationId ? { ...item, status } : item,
      ),
    );
    showToast(`Restoration status changed to ${status}.`, 'info');
  }

  return (
    <div className="page-stack">
      <PageHeader
        eyebrow="ROAD RESTORATION VERIFICATION"
        title={isAdmin ? 'Restoration Monitoring' : 'Road Restoration'}
        description={
          isAdmin
            ? 'Monitor restoration submissions, defects, rework, approval status, and contractor restoration performance.'
            : isContractor
              ? 'Upload before-and-after evidence, complete the contractor checklist, and respond to restoration rework.'
              : 'Inspect restored roads, complete the checklist, request rework, and approve restoration before final project completion.'
        }
      />

      {isAdmin && (
        <div className="role-notice">
          <span>RESTORATION OVERSIGHT</span>
          <p>
            The Department Officer or engineer performs the restoration
            inspection and gives approval. Super Admin monitors the result only.
          </p>
        </div>
      )}

      <div className="restoration-grid">
        {restorationItems.map((restoration) => (
          <article className="restoration-card" key={restoration.id}>
            <header>
              <div>
                <span>{restoration.id}</span>
                <h2>{restoration.project}</h2>
                <p>{restoration.contractor}</p>
              </div>
              <StatusBadge status={restoration.status} />
            </header>

            <div className="before-after">
              <div className="restoration-photo before">
                <span>BEFORE</span>
                <strong>Excavated road</strong>
              </div>
              <div className="restoration-arrow">→</div>
              <div className="restoration-photo after">
                <span>AFTER</span>
                <strong>Restored surface</strong>
              </div>
            </div>

            <div className="restoration-checklist">
              <div>
                <span>Road surface</span>
                <strong>{restoration.surface}</strong>
              </div>
              <div>
                <span>Drainage</span>
                <strong>{restoration.drainage}</strong>
              </div>
              <div>
                <span>Road markings</span>
                <strong>{restoration.markings}</strong>
              </div>
              <div>
                <span>Public safety</span>
                <strong>{restoration.safety}</strong>
              </div>
            </div>

            <div className="card-actions">
              {isOfficer && (
                <>
                  <button
                    className="button button-primary"
                    type="button"
                    onClick={() =>
                      updateStatus(restoration.id, 'Restoration Approved')
                    }
                  >
                    Approve restoration
                  </button>
                  <button
                    className="button button-secondary"
                    type="button"
                    onClick={() => updateStatus(restoration.id, 'Rework Required')}
                  >
                    Request rework
                  </button>
                </>
              )}

              {isContractor && (
                <button
                  className="button button-primary"
                  type="button"
                  onClick={() => {
                    updateStatus(restoration.id, 'Submitted for Verification');
                    showToast('New restoration evidence submitted.');
                  }}
                >
                  Upload evidence & resubmit
                </button>
              )}

              {isAdmin && (
                <button
                  className="button button-secondary"
                  type="button"
                  onClick={() =>
                    showToast(
                      `Restoration ${restoration.id} history opened.`,
                      'info',
                    )
                  }
                >
                  View restoration history
                </button>
              )}
            </div>
          </article>
        ))}
      </div>

      {(isOfficer || isContractor) && (
        <Panel title="Restoration completion checklist" subtitle="All items must pass before project completion">
          <div className="checklist-grid">
            {[
              'Excavation filled',
              'Soil properly compacted',
              'Road surface level',
              'Pavement repaired',
              'Drainage clear',
              'Construction waste removed',
              'Road markings restored',
              'Safe for vehicles',
              'Safe for pedestrians',
            ].map((item) => (
              <label key={item}>
                <input type="checkbox" />
                <span>{item}</span>
              </label>
            ))}
          </div>
        </Panel>
      )}
    </div>
  );
}

export default RestorationPage;
