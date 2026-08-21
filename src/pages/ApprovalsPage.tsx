import { useState } from 'react';
import PageHeader from '../components/PageHeader';
import Panel from '../components/Panel';
import StatusBadge from '../components/StatusBadge';
import { useApp } from '../context/AppContext';
import { approvals as initialApprovals } from '../data/mockData';
import type { Approval } from '../types';

function ApprovalsPage() {
  const [approvalItems, setApprovalItems] = useState<Approval[]>(initialApprovals);
  const { currentUser, showToast } = useApp();

  if (!currentUser) return null;

  const isAdmin = currentUser.role === 'super_admin';

  function changeDecision(
    approvalId: string,
    status: Approval['status'],
  ) {
    setApprovalItems((items) =>
      items.map((item) => (item.id === approvalId ? { ...item, status } : item)),
    );
    showToast(`Approval decision saved as ${status}.`, 'info');
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
                    ) : (
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
