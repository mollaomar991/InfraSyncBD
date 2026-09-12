import { Link } from 'react-router-dom';
import PageHeader from '../../components/PageHeader';
import Panel from '../../components/Panel';
import ProgressBar from '../../components/ProgressBar';
import StatCard from '../../components/StatCard';
import StatusBadge from '../../components/StatusBadge';
import { useApp } from '../../context/AppContext';
import { formatCurrency } from '../../utils';

function OfficerDashboard() {
  const { currentUser, projects, complaints, approvals, conflicts, inspections } = useApp();
  const departmentProjects = projects.filter(
    (project) => project.department === currentUser?.organization,
  );
  const displayedProjects = departmentProjects.length
    ? departmentProjects
    : projects.slice(0, 3);

  return (
    <div className="page-stack">
      <PageHeader
        eyebrow="DEPARTMENT OPERATIONS"
        title={`${currentUser?.organization} Dashboard`}
        description="Create projects, coordinate with departments, complete approvals, assign contractors, review progress, manage complaints, and perform inspections."
        actions={
          <Link className="button button-primary" to="/projects/new">
            + Create project
          </Link>
        }
      />



      <div className="stat-grid">
        <StatCard
          label="Department projects"
          value={displayedProjects.length}
          detail="Current and upcoming work"
          icon="▤"
          tone="dark"
        />
        <StatCard
          label="Conflict alerts"
          value={conflicts.filter((item) => item.status !== 'Resolved').length}
          detail="Require technical coordination"
          icon="!"
          tone="red"
        />
        <StatCard
          label="Pending approvals"
          value={approvals.filter((item) => item.status === 'Pending').length}
          detail="Department decisions required"
          icon="✓"
          tone="orange"
        />
        <StatCard
          label="Open complaints"
          value={complaints.filter((item) => item.status !== 'Resolved').length}
          detail="Assign and verify correction"
          icon="◉"
          tone="red"
        />
        <StatCard
          label="Upcoming inspections"
          value={inspections.filter((item) => item.result === 'Pending').length}
          detail="Milestone quality checks"
          icon="◎"
          tone="blue"
        />
      </div>

      <div className="content-grid content-grid-2-1">
        <Panel
          title="Priority department projects"
          subtitle="Planned progress compared with actual construction progress."
          actions={
            <Link className="text-link" to="/projects">
              View all →
            </Link>
          }
        >
          <div className="project-card-grid">
            {displayedProjects.map((project) => (
              <article className="project-card" key={project.id}>
                <div className="project-card-top">
                  <span>{project.id}</span>
                  <StatusBadge status={project.status} />
                </div>
                <h3>{project.name}</h3>
                <p>
                  {project.road}, {project.area}
                </p>
                <ProgressBar value={project.progress} />
                <div className="project-card-meta">
                  <span>{formatCurrency(project.budget)}</span>
                  <span>{project.endDate}</span>
                </div>
              </article>
            ))}
          </div>
        </Panel>

        <Panel title="Today’s action queue" subtitle="Operational tasks assigned to officers">
          <div className="timeline-list">
            <Link to="/coordination" className="timeline-item">
              <span className="timeline-dot danger" />
              <div>
                <strong>Respond to WASA coordination</strong>
                <small>High conflict · Mirpur 12</small>
              </div>
            </Link>
            <Link to="/approvals" className="timeline-item">
              <span className="timeline-dot warning" />
              <div>
                <strong>Review 3 pending approvals</strong>
                <small>Oldest request is 12 days</small>
              </div>
            </Link>
            <Link to="/inspections" className="timeline-item">
              <span className="timeline-dot info" />
              <div>
                <strong>Prepare base inspection</strong>
                <small>Scheduled for 14 August</small>
              </div>
            </Link>
          </div>
        </Panel>
      </div>
    </div>
  );
}

export default OfficerDashboard;
