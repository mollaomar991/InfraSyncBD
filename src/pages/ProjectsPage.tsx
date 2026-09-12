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
  const [selectedEditProject, setSelectedEditProject] = useState<Project | null>(null);
  const [editStartDate, setEditStartDate] = useState('');
  const [editEndDate, setEditEndDate] = useState('');
  const [isUpdating, setIsUpdating] = useState(false);
  
  const { currentUser, projects, updateProject } = useApp();

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
              <Link className="button button-ghost" to={`/map?project=${project.id}`}>
                View on map
              </Link>
              {project.status === 'rework_required' && (
                <button
                  className="button button-primary"
                  type="button"
                  style={{ marginLeft: 'auto', backgroundColor: '#e63946', color: '#fff' }}
                  onClick={() => {
                    setSelectedEditProject(project);
                    setEditStartDate(project.startDate);
                    setEditEndDate(project.endDate);
                  }}
                >
                  Edit / Resubmit
                </button>
              )}
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

      {selectedEditProject && (
        <div
          className="modal-backdrop"
          role="presentation"
          onMouseDown={() => setSelectedEditProject(null)}
        >
          <article
            className="modal-card"
            role="dialog"
            aria-modal="true"
            aria-label="Edit project dates"
            onMouseDown={(event: MouseEvent<HTMLElement>) => event.stopPropagation()}
          >
            <div className="modal-hazard" style={{ background: 'repeating-linear-gradient(45deg, #e63946, #e63946 10px, transparent 10px, transparent 20px)' }} />
            <button
              className="modal-close"
              type="button"
              onClick={() => setSelectedEditProject(null)}
            >
              ×
            </button>
            <span className="page-eyebrow">Rework Required</span>
            <h2>Edit {selectedEditProject.id}</h2>
            <p className="modal-description">Update your project schedule to resolve conflicts and resubmit for approval.</p>
            
            <form onSubmit={async (e) => {
              e.preventDefault();
              setIsUpdating(true);
              try {
                await updateProject(selectedEditProject.id, {
                  startDate: editStartDate,
                  endDate: editEndDate,
                });
                setSelectedEditProject(null);
              } catch (error) {
                // Handled in context
              } finally {
                setIsUpdating(false);
              }
            }}>
              <div style={{ display: 'grid', gap: '1rem', marginTop: '1.5rem', marginBottom: '1.5rem' }}>
                <label className="input-group">
                  <span>New Start Date</span>
                  <input
                    type="date"
                    required
                    value={editStartDate}
                    onChange={(e) => setEditStartDate(e.target.value)}
                  />
                </label>
                
                <label className="input-group">
                  <span>New Target Completion Date</span>
                  <input
                    type="date"
                    required
                    value={editEndDate}
                    onChange={(e) => setEditEndDate(e.target.value)}
                  />
                </label>
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '1rem' }}>
                <button
                  type="button"
                  className="button button-ghost"
                  onClick={() => setSelectedEditProject(null)}
                  disabled={isUpdating}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="button button-primary"
                  disabled={isUpdating}
                >
                  {isUpdating ? 'Saving...' : 'Save & Resubmit'}
                </button>
              </div>
            </form>
          </article>
        </div>
      )}
    </div>
  );
}

export default ProjectsPage;
