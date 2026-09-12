import { useMemo, useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import PageHeader from '../components/PageHeader';
import Panel from '../components/Panel';
import StatusBadge from '../components/StatusBadge';
import { useApp } from '../context/AppContext';
import api from '../api/axiosClient';

function ComplaintsPage() {
  const [statusFilter, setStatusFilter] = useState('All');
  const [apiComplaints, setApiComplaints] = useState<any[]>([]);
  const [assigningComplaint, setAssigningComplaint] = useState<any | null>(null);
  const [selectedContractor, setSelectedContractor] = useState('');
  const { currentUser, showToast, addNotification, contractors } = useApp();

  useEffect(() => {
    fetchComplaints();
  }, []);

  if (!currentUser) return null;

  async function fetchComplaints() {
    try {
      const res = await api.get('/complaints');
      if (res.data.success) {
        setApiComplaints(res.data.data.map((c: any) => ({
          id: c.complaint_ticket_no,
          project: `Project ${c.project_id || 'Unknown'}`,
          category: c.category,
          location: c.location_address,
          description: c.description,
          status: c.status === 'under_review' ? 'Under Review' : c.status === 'in_progress' ? 'In Progress' : (c.status?.charAt(0).toUpperCase() + c.status?.slice(1)) || 'Submitted',
          citizen: c.citizen_name || 'Citizen',
          citizenId: c.citizen_user_id,
          department: 'Public Works',
          assignedTo: c.assigned_contractor_id ? 'Contractor' : 'Unassigned',
          priority: 'Medium',
          submittedDate: new Date(c.created_at).toLocaleDateString()
        })));
      }
    } catch (e) {
      console.error(e);
    }
  }

  const visibleComplaints = useMemo(() => {
    const roleFiltered =
      currentUser.role === 'citizen'
        ? apiComplaints.filter((complaint) => complaint.citizenId === currentUser.id)
        : currentUser.role === 'contractor'
          ? apiComplaints.filter(
              (complaint) =>
                complaint.assignedTo === currentUser.organization ||
                complaint.assignedTo === 'Delta Infrastructure Ltd.',
            )
          : apiComplaints;

    return roleFiltered.filter(
      (complaint) => statusFilter === 'All' || complaint.status === statusFilter,
    );
  }, [apiComplaints, currentUser, statusFilter]);

  const isAdmin = currentUser.role === 'super_admin';
  const isOfficer = currentUser.role === 'department_officer';
  const isContractor = currentUser.role === 'contractor';
  const isCitizen = currentUser.role === 'citizen';

  async function setStatus(complaint: any, status: string, assignedContractorName?: string) {
    try {
       const res = await api.put(`/complaints/${complaint.id}/status`, { status });
       if (res.data.success) {
         setApiComplaints((current) => current.map(c => c.id === complaint.id ? { ...c, status, assignedTo: assignedContractorName || c.assignedTo } : c));
         showToast(`Status updated to ${status}`);
       }
    } catch(e) {
       console.error(e);
       showToast('Failed to update status', 'error');
    }
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
                      onClick={() => setAssigningComplaint(complaint)}
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
                    onClick={() => {
                      addNotification('Action Required: Complaint Reminder', `A reminder has been sent for complaint ${complaint.id} to ensure timely resolution.`, 'department_officer');
                      showToast(
                        `Reminder sent for complaint ${complaint.id}.`,
                        'warning',
                      );
                    }}
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

      {assigningComplaint && (
        <div className="modal-backdrop" onClick={() => setAssigningComplaint(null)}>
          <div className="modal-card department-modal" onClick={(e) => e.stopPropagation()} style={{ maxWidth: '400px' }}>
            <div className="hazard-strip" />
            <button type="button" className="drawer-close" onClick={() => setAssigningComplaint(null)}>×</button>
            <span className="page-eyebrow">ASSIGN CONTRACTOR</span>
            <h2>Assign Complaint</h2>
            <p>Select a contractor to assign this complaint to for correction and resolution.</p>
            
            <div className="form-grid" style={{ marginTop: '1.5rem', marginBottom: '1.5rem' }}>
              <label className="form-field full-field">
                <span>Select Contractor *</span>
                <select 
                  value={selectedContractor} 
                  onChange={(e) => setSelectedContractor(e.target.value)}
                  style={{ width: '100%', padding: '8px' }}
                >
                  <option value="">-- Choose a Contractor --</option>
                  {contractors.map(c => (
                    <option key={c.id} value={c.name}>{c.name}</option>
                  ))}
                  {contractors.length === 0 && (
                    <>
                      <option value="Delta Infrastructure Ltd.">Delta Infrastructure Ltd.</option>
                      <option value="Spectra Engineers Ltd.">Spectra Engineers Ltd.</option>
                      <option value="Toma Construction & Co.">Toma Construction & Co.</option>
                      <option value="Abdul Monem Limited">Abdul Monem Limited</option>
                      <option value="Max Infrastructure Ltd.">Max Infrastructure Ltd.</option>
                    </>
                  )}
                </select>
              </label>
            </div>
            
            <button 
              className="button button-primary" 
              style={{ width: '100%' }} 
              disabled={!selectedContractor}
              onClick={() => {
                setStatus(assigningComplaint, 'Assigned', selectedContractor);
                setAssigningComplaint(null);
                setSelectedContractor('');
              }}
            >
              Confirm Assignment
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

export default ComplaintsPage;
