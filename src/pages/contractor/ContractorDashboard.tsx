import { Link } from 'react-router-dom';
import PageHeader from '../../components/PageHeader';
import Panel from '../../components/Panel';
import ProgressBar from '../../components/ProgressBar';
import StatCard from '../../components/StatCard';
import StatusBadge from '../../components/StatusBadge';
import { useApp } from '../../context/AppContext';
import { inspections, restorations } from '../../data/mockData';

function ContractorDashboard() {
  const { currentUser, projects, complaints } = useApp();
  const assignedProjects = projects.filter(
    (project) => project.contractor === currentUser?.organization,
  );
  const displayedProjects = assignedProjects.length
    ? assignedProjects
    : projects.slice(0, 2);
  const assignedComplaints = complaints.filter(
    (complaint) => complaint.assignedTo === currentUser?.organization,
  );

  return (
    <div className="page-stack">
      <PageHeader
        eyebrow="CONSTRUCTION DELIVERY"
        title="Contractor Dashboard"
        description="View assigned projects, submit physical and financial progress, respond to complaints, complete rework, and submit road restoration evidence."
        actions={
          <Link className="button button-primary" to="/progress">
            Submit progress
          </Link>
        }
      />

      <div className="stat-grid">
        <StatCard
          label="Assigned projects"
          value={displayedProjects.length}
          detail="Official assignments"
          icon="▤"
          tone="dark"
        />
        <StatCard
          label="Active work"
          value={displayedProjects.filter((item) => item.status !== 'Completed').length}
          detail="Construction in progress"
          icon="▲"
          tone="orange"
        />
        <StatCard
          label="Complaint tasks"
          value={assignedComplaints.length || 1}
          detail="Correction evidence required"
          icon="◉"
          tone="red"
        />
        <StatCard
          label="Inspection items"
          value={inspections.filter((item) => item.result !== 'Passed').length}
          detail="Scheduled or conditional"
          icon="◎"
          tone="blue"
        />
        <StatCard
          label="Restoration rework"
          value={restorations.filter((item) => item.status === 'Rework Required').length}
          detail="Repair before completion"
          icon="▰"
          tone="red"
        />
      </div>

      <div className="content-grid content-grid-2-1">
        <Panel title="Assigned project progress" subtitle="Your active construction workload">
          <div className="project-card-grid">
            {displayedProjects.map((project) => (
              <article className="project-card" key={project.id}>
                <div className="project-card-top">
                  <span>{project.id}</span>
                  <StatusBadge status={project.status} />
                </div>
                <h3>{project.name}</h3>
                <p>{project.department}</p>
                <ProgressBar value={project.progress} />
                <div className="project-card-meta">
                  <span>Planned {project.plannedProgress}%</span>
                  <span>Actual {project.progress}%</span>
                </div>
              </article>
            ))}
          </div>
        </Panel>

        <Panel title="Next site actions" subtitle="Evidence and compliance tasks">
          <div className="timeline-list">
            <Link to="/progress" className="timeline-item">
              <span className="timeline-dot danger" />
              <div>
                <strong>Submit weekly progress</strong>
                <small>Include site photographs</small>
              </div>
            </Link>
            <Link to="/complaints" className="timeline-item">
              <span className="timeline-dot warning" />
              <div>
                <strong>Clear blocked road lane</strong>
                <small>Complaint CMP-26081</small>
              </div>
            </Link>
            <Link to="/inspections" className="timeline-item">
              <span className="timeline-dot info" />
              <div>
                <strong>Prepare inspection site</strong>
                <small>Base preparation milestone</small>
              </div>
            </Link>
          </div>
        </Panel>
      </div>
    </div>
  );
}

export default ContractorDashboard;
