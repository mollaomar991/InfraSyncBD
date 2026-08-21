import { useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import PageHeader from '../components/PageHeader';
import Panel from '../components/Panel';
import StatusBadge from '../components/StatusBadge';
import { useApp } from '../context/AppContext';
import type { Complaint } from '../types';

function ComplaintsPage() {
  const [statusFilter, setStatusFilter] = useState('All');
  const { currentUser, complaints, updateComplaintStatus, showToast } = useApp();

  if (!currentUser) return null;

  const visibleComplaints = useMemo(() => {
    const roleFiltered =
      currentUser.role === 'citizen'
        ? complaints.filter((complaint) => complaint.citizen === currentUser.name)
        : currentUser.role === 'contractor'
          ? complaints.filter(
              (complaint) =>
                complaint.assignedTo === currentUser.organization ||
                complaint.assignedTo === 'Delta Infrastructure Ltd.',
            )
          : complaints;

    return roleFiltered.filter(
      (complaint) => statusFilter === 'All' || complaint.status === statusFilter,
    );
  }, [complaints, currentUser, statusFilter]);

  const isAdmin = currentUser.role === 'super_admin';
  const isOfficer = currentUser.role === 'department_officer';
  const isContractor = currentUser.role === 'contractor';
  const isCitizen = currentUser.role === 'citizen';

  function setStatus(complaint: Complaint, status: Complaint['status']) {
    updateComplaintStatus(complaint.id, status);
  }

  return (
    <div className="page-stack">
      <PageHeader
        eyebrow="CITIZEN PORTAL & COMPLAINT MANAGEMENT"
        title={isAdmin ? 'Complaint Monitoring' : 'Complaint Management'}
        description={
          isAdmin
            ? 'Monitor complaint category, location, responsible department, contractor, status, priority, and resolution time across the system.'
            : isCitizen
              ? 'Track every status change and review responses or correction evidence for your submitted complaints.'
              : isContractor
                ? 'Review assigned complaints, correct the issue, and upload evidence for Department Officer verification.'
                : 'Review public complaints, assign responsible users, verify correction evidence, and provide final resolution.'
        }
        actions={
          isCitizen ? (
            <Link className="button button-primary" to="/complaints/new">
              + Submit complaint
            </Link>
          ) : undefined
        }
      />

      {isAdmin && (
        <div className="role-notice">
          <span>ADMIN MONITORING</span>
          <p>
            Super Admin may send reminders or identify the correct responsible
            department, but the Department Officer gives the final complaint
            resolution.
          </p>
        </div>
      )}

      <Panel>
        <div className="filter-bar">
          <div className="segmented-control scrollable">
            {[
              'All',
              'Submitted',
              'Under Review',
              'Assigned',
              'In Progress',
              'Resolved',
              'Closed',
            ].map((status) => (
              <button
                key={status}
                type="button"
                className={statusFilter === status ? 'active' : ''}
                onClick={() => setStatusFilter(status)}
              >
                {status}
              </button>
            ))}
          </div>
          <span className="result-count">{visibleComplaints.length} records</span>
        </div>
      </Panel>

      <div className="complaint-grid">
        {visibleComplaints.map((complaint) => (
          <article className="complaint-card" key={complaint.id}>
            <header>
              <div>
                <span>{complaint.id}</span>
                <h2>{complaint.category}</h2>
                <p>{complaint.project}</p>
              </div>
              <div className="complaint-statuses">
                <StatusBadge status={complaint.priority} />
                <StatusBadge status={complaint.status} />
              </div>
            </header>

            <div className="complaint-location">
              <span>⌖</span>
              <div>
                <strong>{complaint.location}</strong>
                <small>Submitted {complaint.submittedDate}</small>
              </div>
            </div>

            <p className="complaint-description">{complaint.description}</p>

            <div className="detail-list compact-details">
              <div>
                <span>Citizen</span>
                <strong>{complaint.citizen}</strong>
              </div>
              <div>
                <span>Department</span>
                <strong>{complaint.department}</strong>
              </div>
              <div>
                <span>Assigned to</span>
                <strong>{complaint.assignedTo}</strong>
              </div>
            </div>

            {(isOfficer || isContractor || isAdmin) && (
              <div className="card-actions">
                {isOfficer && (
                  <>
                    <button
                      className="button button-primary"
                      type="button"
                      onClick={() => setStatus(complaint, 'Assigned')}
                    >
                      Assign complaint
                    </button>
                    <button
                      className="button button-secondary"
                      type="button"
                      onClick={() => setStatus(complaint, 'Resolved')}
                    >
                      Verify & resolve
                    </button>
                  </>
                )}
                {isContractor && (
                  <button
                    className="button button-primary"
                    type="button"
                    onClick={() => {
                      setStatus(complaint, 'In Progress');
                      showToast('Correction evidence submitted for officer review.');
                    }}
                  >
                    Submit correction evidence
                  </button>
                )}
                {isAdmin && (
                  <button
                    className="button button-secondary"
                    type="button"
                    onClick={() =>
                      showToast(
                        `Reminder sent for complaint ${complaint.id}.`,
                        'warning',
                      )
                    }
                  >
                    Send reminder
                  </button>
                )}
              </div>
            )}
          </article>
        ))}
      </div>

      {!visibleComplaints.length && (
        <div className="empty-state large">
          <span>◉</span>
          <h3>No complaint records</h3>
          <p>No complaints match the selected status.</p>
        </div>
      )}
    </div>
  );
}

export default ComplaintsPage;
