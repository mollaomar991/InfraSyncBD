import { useMemo, useState, type MouseEvent } from 'react';
import { Link } from 'react-router-dom';
import PageHeader from '../components/PageHeader';
import Panel from '../components/Panel';
import ProgressBar from '../components/ProgressBar';
import StatusBadge from '../components/StatusBadge';
import { useApp } from '../context/AppContext';
import type { Project } from '../types';
import { formatCurrency, roleLabel } from '../utils';

function ProjectsPage() {
  const [searchText, setSearchText] = useState('');
  const [statusFilter, setStatusFilter] = useState('All');
  const [selectedProject, setSelectedProject] = useState<Project | null>(null);
  const { currentUser, projects } = useApp();

  if (!currentUser) return null;

  const roleProjects = useMemo(() => {
    if (currentUser.role === 'department_officer') {
      const ownProjects = projects.filter(
        (project) => project.department === currentUser.organization,
      );
      return ownProjects.length ? ownProjects : projects;
    }

    if (currentUser.role === 'contractor') {
      const assignedProjects = projects.filter(
        (project) => project.contractor === currentUser.organization,
      );
      return assignedProjects.length ? assignedProjects : projects.slice(0, 2);
    }

    return projects;
  }, [currentUser, projects]);

  const filteredProjects = roleProjects.filter((project) => {
    const searchValue = searchText.trim().toLowerCase();
    const matchesSearch =
      !searchValue ||
      [
        project.id,
        project.name,
        project.area,
        project.road,
        project.department,
        project.contractor,
      ]
        .join(' ')
        .toLowerCase()
        .includes(searchValue);
    const matchesStatus =
      statusFilter === 'All' || project.status === statusFilter;

    return matchesSearch && matchesStatus;
  });

  const isAdmin = currentUser.role === 'super_admin';
  const isCitizen = currentUser.role === 'citizen';

  return (
    <div className="page-stack">
      <PageHeader
        eyebrow={isAdmin ? 'PROJECT OVERSIGHT' : 'PROJECT LIFECYCLE'}
        title={isAdmin ? 'Project Monitor' : 'Infrastructure Projects'}
        description={
          isAdmin
            ? 'View project budget, schedule, conflicts, approvals, contractors, progress, complaints, inspection, and restoration without editing department work.'
            : isCitizen
              ? 'Search public projects by road, area, department, contractor, status, or year.'
              : `Projects available to the ${roleLabel(currentUser.role)} portal.`
        }
        actions={
          currentUser.role === 'department_officer' ? (
            <Link className="button button-primary" to="/projects/new">
              + Create project
            </Link>
          ) : undefined
        }
      />

      {isAdmin && (
        <div className="role-notice">
          <span>READ-ONLY ADMIN VIEW</span>
          <p>
            Super Admin can monitor project compliance but cannot create,
            edit, approve, assign, inspect, restore, or complete projects.
          </p>
        </div>
      )}

      <Panel>
        <div className="filter-bar">
          <label className="search-box">
            <input
              value={searchText}
              onChange={(event) => setSearchText(event.target.value)}
              placeholder="Search project, road, area, department…"
            />
          </label>
          <label className="select-box">
            <span>Status</span>
            <select
              value={statusFilter}
              onChange={(event) => setStatusFilter(event.target.value)}
            >
              <option value="All">All</option>
              {Array.from(new Set(projects.map((p) => p.status))).map(
                (status) => (
                  <option key={status} value={status}>
                    {status}
                  </option>
                ),
              )}
            </select>
          </label>
          <div className="filter-meta">
            {filteredProjects.length} project
            {filteredProjects.length === 1 ? '' : 's'}
          </div>
        </div>
      </Panel>

      <div className="project-list-grid">
        {filteredProjects.map((project) => (
          <article className="project-showcase-card" key={project.id}>
            <div className="project-showcase-stripe" />
            <div className="project-showcase-header">
              <div>
                <span>{project.id}</span>
                <h2>{project.name}</h2>
                <p>
                  {project.road}, {project.area}
                </p>
              </div>
              <StatusBadge status={project.status} />
            </div>

            <div className="project-status-row">
              <StatusBadge status={project.conflictLevel + ' conflict'} />
              <StatusBadge status={project.approvalStatus} />
              <StatusBadge status={project.roadStatus} />
            </div>

            <ProgressBar value={project.progress} label="Physical progress" />

            <div className="project-info-grid">
              <div>
                <span>Department</span>
                <strong>{project.department}</strong>
              </div>
              <div>
                <span>Contractor</span>
                <strong>{project.contractor}</strong>
              </div>
              <div>
                <span>Budget</span>
                <strong>{formatCurrency(project.budget)}</strong>
              </div>
              <div>
                <span>Expected completion</span>
                <strong>{project.endDate}</strong>
              </div>
            </div>

            <div className="card-actions">
              <button
                className="button button-secondary"
                type="button"
                onClick={() => setSelectedProject(project)}
              >
                View details
              </button>
              <Link className="button button-ghost" to="/map">
                View on map
              </Link>
            </div>
          </article>
        ))}
      </div>

      {!filteredProjects.length && (
        <div className="empty-state large">
          <span>⌕</span>
          <h3>No matching projects</h3>
          <p>Try a different road, area, department, or status filter.</p>
        </div>
      )}

      {selectedProject && (
        <div
          className="modal-backdrop"
          role="presentation"
          onMouseDown={() => setSelectedProject(null)}
        >
          <article
            className="modal-card"
            role="dialog"
            aria-modal="true"
            aria-label="Project details"
            onMouseDown={(event: MouseEvent<HTMLElement>) => event.stopPropagation()}
          >
            <div className="modal-hazard" />
            <button
              className="modal-close"
              type="button"
              onClick={() => setSelectedProject(null)}
            >
              ×
            </button>
            <span className="page-eyebrow">{selectedProject.id}</span>
            <h2>{selectedProject.name}</h2>
            <p className="modal-description">{selectedProject.description}</p>
            <div className="project-status-row">
              <StatusBadge status={selectedProject.status} />
              <StatusBadge status={selectedProject.conflictLevel} />
              <StatusBadge status={selectedProject.roadStatus} />
            </div>
            <div className="detail-list">
              <div>
                <span>Project type</span>
                <strong>{selectedProject.type}</strong>
              </div>
              <div>
                <span>Responsible department</span>
                <strong>{selectedProject.department}</strong>
              </div>
              <div>
                <span>Assigned contractor</span>
                <strong>{selectedProject.contractor}</strong>
              </div>
              <div>
                <span>Schedule</span>
                <strong>
                  {selectedProject.startDate} → {selectedProject.endDate}
                </strong>
              </div>
            </div>
            <ProgressBar value={selectedProject.progress} />
          </article>
        </div>
      )}
    </div>
  );
}

export default ProjectsPage;
