import { useState, useEffect } from 'react';
import PageHeader from '../components/PageHeader';
import Panel from '../components/Panel';
import StatusBadge from '../components/StatusBadge';
import { useApp } from '../context/AppContext';
import api from '../api/axiosClient';
import type { Approval } from '../types';

function ApprovalsPage() {
  const [approvalItems, setApprovalItems] = useState<Approval[]>([]);
  const { currentUser, showToast, refreshProjects } = useApp();

  // Fetch approvals from real API
  useEffect(() => {
    async function fetchApprovals() {
      try {
        const res = await api.get('/approvals');
        if (res.data.success) {
          // Map database fields to frontend Approval type
          const mapped = res.data.data.map((row: any) => {
            // Calculate pending days from created_at
            const createdDate = new Date(row.created_at);
            const today = new Date();
            const diffDays = Math.floor((today.getTime() - createdDate.getTime()) / (1000 * 60 * 60 * 24));

            return {
              id: row.approval_id.toString(),
              project: row.project_name || 'Unknown Project',
              department: row.approving_department || 'Unknown',
              officer: row.reviewed_by_officer_id ? `Officer #${row.reviewed_by_officer_id}` : 'Awaiting',
              pendingDays: diffDays,
              status: row.decision === 'pending' ? 'Pending'
                : row.decision === 'approved' ? 'Approved'
                : row.decision === 'modification_requested' ? 'Change Requested'
                : 'Rejected',
              impact: row.project_status || '',
            };
          });
          setApprovalItems(mapped);
        }
      } catch (error) {
        console.error('Error fetching approvals:', error);
      }
    }
    fetchApprovals();
  }, []);

  if (!currentUser) return null;

  const isAdmin = currentUser.role === 'super_admin';

  async function changeDecision(
    approvalId: string,
    status: Approval['status'],
  ) {
    try {
      // Map frontend status back to database enum
      const dbDecision = status === 'Approved' ? 'approved'
        : status === 'Change Requested' ? 'modification_requested'
        : 'rejected';

      await api.post(`/approvals/${approvalId}/vote`, {
        decision: dbDecision,
        comments: '',
      });

      setApprovalItems((items) =>
        items.map((item) => (item.id === approvalId ? { ...item, status } : item)),
      );
      showToast(`Approval decision saved as ${status}.`, 'info');
      await refreshProjects();
    } catch (error) {
      console.error('Error voting on approval:', error);
      showToast('Failed to save decision.', 'error');
    }
  }

  return (
    <div className="page-stack">
      <PageHeader
        eyebrow={isAdmin ? 'APPROVAL DELAY MONITOR' : 'MULTI-DEPARTMENT APPROVAL'}
        title={isAdmin ? 'Pending Approval Oversight' : 'Project Approvals'}
        description={
          isAdmin
            ? 'Monitor approvals pending for more than seven days and send reminders. Super Admin does not make technical approval decisions.'
            : 'Review final project information, GIS location, conflict resolution, documents, and coordination decisions.'
        }
      />

      {isAdmin && (
        <div className="role-notice">
          <span>REMINDER AUTHORITY ONLY</span>
          <p>
            Approval, rejection, date suggestions, and change requests belong
            to verified Department Officers from required departments.
          </p>
        </div>
      )}

      <div className="approval-summary">
        <div>
          <span>Pending</span>
          <strong>{approvalItems.filter((item) => item.status === 'Pending').length}</strong>
        </div>
        <div>
          <span>Over 7 days</span>
          <strong>{approvalItems.filter((item) => item.pendingDays > 7).length}</strong>
        </div>
        <div>
          <span>Approved</span>
          <strong>{approvalItems.filter((item) => item.status === 'Approved').length}</strong>
        </div>
        <div>
          <span>Changes requested</span>
          <strong>
            {approvalItems.filter((item) => item.status === 'Change Requested').length}
          </strong>
        </div>
      </div>

      <Panel title="Approval requests" subtitle="Every decision remains in approval history">
        <div className="table-wrap">
          <table>
            <thead>
              <tr>
                <th>Project</th>
                <th>Reviewing department</th>
                <th>Officer</th>
                <th>Pending</th>
                <th>Status</th>
                <th>Action</th>
              </tr>
            </thead>
            <tbody>
              {approvalItems.map((approval) => (
                <tr key={approval.id}>
                  <td>
                    <strong>{approval.project}</strong>
                    <small>{approval.impact}</small>
                  </td>
                  <td>{approval.department}</td>
                  <td>{approval.officer}</td>
                  <td>
                    <span className={approval.pendingDays > 7 ? 'days-overdue' : ''}>
                      {approval.pendingDays} days
                    </span>
                  </td>
                  <td>
                    <StatusBadge status={approval.status} />
                  </td>
                  <td>
                    {isAdmin ? (
                      <button
                        className="table-action"
                        type="button"
                        onClick={() =>
                          showToast(
                            `Reminder sent to ${approval.department}.`,
                            'warning',
                          )
                        }
                      >
                        Send reminder
                      </button>
                    ) : approval.status === 'Pending' ? (
                      <div className="table-action-group">
                        <button
                          type="button"
                          onClick={() => changeDecision(approval.id, 'Approved')}
                        >
                          Approve
                        </button>
                        <button
                          type="button"
                          onClick={() =>
                            changeDecision(approval.id, 'Change Requested')
                          }
                        >
                          Request change
                        </button>
                      </div>
                    ) : (
                      <span style={{ color: '#888', fontStyle: 'italic', fontSize: '0.85rem' }}>
                        Decision recorded
                      </span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Panel>
    </div>
  );
}

export default ApprovalsPage;
