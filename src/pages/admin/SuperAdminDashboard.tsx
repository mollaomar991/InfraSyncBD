import { Link } from 'react-router-dom';
import PageHeader from '../../components/PageHeader';
import Panel from '../../components/Panel';
import ProgressBar from '../../components/ProgressBar';
import StatCard from '../../components/StatCard';
import StatusBadge from '../../components/StatusBadge';
import { useApp } from '../../context/AppContext';

function SuperAdminDashboard() {
  const { users, projects, complaints, registrations, approvals, conflicts, contractors } = useApp();
  const delayedProjects = projects.filter(
    (project) => project.status === 'Delayed',
  ).length;
  const pendingAccounts = registrations.filter(
    (registration) => registration.status === 'Pending Verification',
  ).length;
  const pendingApprovals = approvals.filter(
    (approval) => approval.status === 'Pending',
  ).length;
  const openComplaints = complaints.filter(
    (complaint) => !['Resolved', 'Closed'].includes(complaint.status),
  ).length;

  return (
    <div className="page-stack">
      <PageHeader
        eyebrow="SYSTEM OVERSIGHT"
        title="Super Admin Dashboard"
        description="Monitor account verification, department activity, project compliance, delays, conflicts, contractors, complaints, and inspections across the platform."
        actions={
          <Link className="button button-primary" to="/verification">
            Review registrations
          </Link>
        }
      />



      <div className="stat-grid">
        <StatCard
          label="Pending accounts"
          value={pendingAccounts}
          detail="Officer and contractor reviews"
          icon="✓"
          tone="orange"
        />
        <StatCard
          label="Active users"
          value={users.filter((user) => user.accountStatus === 'Active').length}
          detail="Across all four roles"
          icon="●"
          tone="dark"
        />
        <StatCard
          label="Total projects"
          value={projects.length}
          detail={`${delayedProjects} currently delayed`}
          icon="▤"
          tone="blue"
        />
        <StatCard
          label="Conflict alerts"
          value={conflicts.length}
          detail={`${conflicts.filter((item) => item.level === 'High').length} high priority`}
          icon="!"
          tone="red"
        />
        <StatCard
          label="Pending approvals"
          value={pendingApprovals}
          detail="Admin can send reminders"
          icon="◷"
          tone="orange"
        />
        <StatCard
          label="Open complaints"
          value={openComplaints}
          detail="Monitored across departments"
          icon="◉"
          tone="red"
        />
      </div>

      <div className="content-grid content-grid-2-1">
        <Panel
          title="Pending account verification"
          subtitle="Approve, reject, or request documents from public registrations."
          actions={
            <Link className="text-link" to="/verification">
              Open queue →
            </Link>
          }
        >
          <div className="table-wrap">
            <table>
              <thead>
                <tr>
                  <th>Applicant</th>
                  <th>Role</th>
                  <th>Organization</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                {registrations.slice(0, 4).map((registration) => (
                  <tr key={registration.id}>
                    <td>
                      <strong>{registration.name}</strong>
                      <small>{registration.email}</small>
                    </td>
                    <td>{registration.role}</td>
                    <td>{registration.organization}</td>
                    <td>
                      <StatusBadge status={registration.status} />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Panel>

        <Panel title="System health" subtitle="Prototype operational indicators">
          <div className="metric-list">
            <ProgressBar value={92} label="Project data completeness" />
            <ProgressBar value={78} label="Approvals on time" />
            <ProgressBar value={84} label="Complaint resolution" />
            <ProgressBar value={73} label="Inspection compliance" />
          </div>
        </Panel>
      </div>

      <div className="content-grid content-grid-2">
        <Panel title="Priority conflict alerts" subtitle="Read-only admin monitoring">
          <div className="item-list">
            {conflicts.slice(0, 3).map((conflict) => (
              <article className="list-card" key={conflict.id}>
                <div className="list-card-icon danger">!</div>
                <div className="list-card-main">
                  <div className="list-card-title">
                    <strong>{conflict.project}</strong>
                    <StatusBadge status={conflict.level} />
                  </div>
                  <p>{conflict.reason}</p>
                  <small>{conflict.departments}</small>
                </div>
              </article>
            ))}
          </div>
        </Panel>

        <Panel title="Contractor risk watch" subtitle="Performance monitoring only">
          <div className="item-list">
            {contractors.map((contractor) => (
              <article className="list-card" key={contractor.id}>
                <div className="list-card-icon">▲</div>
                <div className="list-card-main">
                  <div className="list-card-title">
                    <strong>{contractor.name}</strong>
                    <StatusBadge status={`${contractor.risk} risk`} />
                  </div>
                  <p>
                    Performance {contractor.performance}% · Safety{' '}
                    {contractor.safety}%
                  </p>
                  <small>{contractor.delayedProjects} delayed projects</small>
                </div>
              </article>
            ))}
          </div>
        </Panel>
      </div>
    </div>
  );
}

export default SuperAdminDashboard;
