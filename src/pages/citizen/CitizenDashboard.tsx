import { Link } from 'react-router-dom';
import PageHeader from '../../components/PageHeader';
import Panel from '../../components/Panel';
import ProgressBar from '../../components/ProgressBar';
import StatCard from '../../components/StatCard';
import StatusBadge from '../../components/StatusBadge';
import { useApp } from '../../context/AppContext';

function CitizenDashboard() {
  const { currentUser, projects, complaints } = useApp();
  const personalComplaints = complaints.filter(
    (complaint) => complaint.citizen === currentUser?.name,
  );
  const ongoingProjects = projects.filter(
    (project) => !['Completed', 'Archived'].includes(project.status),
  );

  return (
    <div className="page-stack">
      <PageHeader
        eyebrow="PUBLIC INFORMATION PORTAL"
        title={`Welcome, ${currentUser?.name}`}
        description="Find nearby infrastructure projects, check road conditions, review expected completion dates, and track your complaints."
        actions={
          <Link className="button button-primary" to="/complaints/new">
            Submit complaint
          </Link>
        }
      />

      <div className="stat-grid">
        <StatCard
          label="Nearby projects"
          value={ongoingProjects.length}
          detail="Current and upcoming road work"
          icon="⌖"
          tone="dark"
        />
        <StatCard
          label="Road closures"
          value={projects.filter((item) => item.roadStatus !== 'Open').length}
          detail="Partial or active construction"
          icon="!"
          tone="red"
        />
        <StatCard
          label="My complaints"
          value={personalComplaints.length}
          detail="Track every status update"
          icon="◉"
          tone="orange"
        />
        <StatCard
          label="Resolved complaints"
          value={personalComplaints.filter((item) => item.status === 'Resolved').length}
          detail="Corrections verified by an officer"
          icon="✓"
          tone="green"
        />
      </div>

      <div className="content-grid content-grid-2-1">
        <Panel
          title="Public project updates"
          subtitle="Current road condition and expected progress"
          actions={
            <Link className="text-link" to="/projects">
              Browse all →
            </Link>
          }
        >
          <div className="project-card-grid">
            {projects.slice(0, 4).map((project) => (
              <article className="project-card" key={project.id}>
                <div className="project-card-top">
                  <span>{project.area}</span>
                  <StatusBadge status={project.roadStatus} />
                </div>
                <h3>{project.name}</h3>
                <p>{project.department}</p>
                <ProgressBar value={project.progress} />
                <div className="project-card-meta">
                  <span>{project.startDate}</span>
                  <span>{project.endDate}</span>
                </div>
              </article>
            ))}
          </div>
        </Panel>

        <Panel title="My complaint activity" subtitle="Live status from responsible teams">
          {personalComplaints.length ? (
            <div className="item-list">
              {personalComplaints.map((complaint) => (
                <article className="list-card" key={complaint.id}>
                  <div className="list-card-icon">◉</div>
                  <div className="list-card-main">
                    <div className="list-card-title">
                      <strong>{complaint.id}</strong>
                      <StatusBadge status={complaint.status} />
                    </div>
                    <p>{complaint.category}</p>
                    <small>{complaint.location}</small>
                  </div>
                </article>
              ))}
            </div>
          ) : (
            <div className="empty-state">
              <span>◉</span>
              <h3>No complaints submitted</h3>
              <p>Report road damage, dust, unsafe work, or traffic blockage.</p>
            </div>
          )}
        </Panel>
      </div>
    </div>
  );
}

export default CitizenDashboard;
