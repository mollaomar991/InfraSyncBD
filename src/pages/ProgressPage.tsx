import { useState, type FormEvent, useEffect } from 'react';
import LoadingButton from '../components/LoadingButton';
import PageHeader from '../components/PageHeader';
import Panel from '../components/Panel';
import ProgressBar from '../components/ProgressBar';
import StatusBadge from '../components/StatusBadge';
import { useApp } from '../context/AppContext';

function ProgressPage() {
  const { currentUser, projects, updateProjectProgress, showToast } = useApp();
  const [selectedProjectId, setSelectedProjectId] = useState('');
  
  useEffect(() => {
    if (projects.length > 0 && !selectedProjectId) {
      chooseProject(projects[0].id);
    }
  }, [projects, selectedProjectId]);
  const selectedProject = projects.find((project) => project.id === selectedProjectId);
  const [progress, setProgress] = useState(selectedProject?.progress || 0);
  const [financialProgress, setFinancialProgress] = useState(35);
  const [completedWork, setCompletedWork] = useState('');
  const [remainingWork, setRemainingWork] = useState('');
  const [delayReason, setDelayReason] = useState('');
  const [loading, setLoading] = useState(false);

  if (!currentUser) return null;

  const isContractor = currentUser.role === 'contractor';

  function chooseProject(projectId: string) {
    setSelectedProjectId(projectId);
    const project = projects.find((item) => item.id === projectId);
    setProgress(project?.progress || 0);
    setFinancialProgress(Math.max(0, (project?.progress || 0) - 5));
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setLoading(true);

    const formData = new FormData(event.currentTarget);
    formData.append('projectId', selectedProjectId);
    // Include the state values not natively caught by basic form inputs or if names are missing
    formData.set('physicalProgress', progress.toString());
    formData.set('financialProgress', financialProgress.toString());
    formData.set('completedWork', completedWork);
    formData.set('remainingWork', remainingWork);
    formData.set('delayReason', delayReason);

    try {
      await updateProjectProgress(selectedProjectId, formData);
      showToast(
        isContractor
          ? 'Progress update submitted to the server for review.'
          : 'Progress review decision saved.',
      );
      setCompletedWork('');
      setRemainingWork('');
      setDelayReason('');
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="page-stack">
      <PageHeader
        eyebrow="CONTRACTOR, PROGRESS & DELAY MANAGEMENT"
        title={isContractor ? 'Submit Construction Progress' : 'Review Project Progress'}
        description={
          isContractor
            ? 'Submit physical progress, financial progress, work completed, remaining work, site evidence, and delay information.'
            : 'Compare planned and actual progress, accept evidence, request corrections, and escalate project delays.'
        }
      />

      <div className="content-grid content-grid-2-1">
        <Panel title="Project progress" subtitle="Planned versus actual construction delivery">
          <div className="form-grid single-column">
            <label className="form-field">
              <span>Project</span>
              <select
                value={selectedProjectId}
                onChange={(event) => chooseProject(event.target.value)}
              >
                {projects.map((project) => (
                  <option value={project.id} key={project.id}>
                    {project.name}
                  </option>
                ))}
              </select>
            </label>

            {selectedProject && (
              <div className="progress-comparison">
                <div>
                  <span>Planned progress</span>
                  <strong>{selectedProject.plannedProgress}%</strong>
                  <ProgressBar value={selectedProject.plannedProgress} compact />
                </div>
                <div>
                  <span>Actual progress</span>
                  <strong>{progress}%</strong>
                  <ProgressBar value={progress} compact />
                </div>
                <div className="delay-box">
                  <span>Schedule variance</span>
                  <strong>
                    {Math.max(0, selectedProject.plannedProgress - progress)}%
                  </strong>
                  <StatusBadge
                    status={
                      selectedProject.plannedProgress - progress >= 10
                        ? 'Delayed'
                        : 'On Track'
                    }
                  />
                </div>
              </div>
            )}

            <form onSubmit={handleSubmit} className="form-grid">
              <label className="form-field">
                <span>Physical progress (%)</span>
                <input
                  type="number"
                  min="0"
                  max="100"
                  value={progress}
                  onChange={(event) => setProgress(Number(event.target.value))}
                  required
                />
              </label>

              <label className="form-field">
                <span>Financial progress (%)</span>
                <input
                  type="number"
                  min="0"
                  max="100"
                  value={financialProgress}
                  onChange={(event) =>
                    setFinancialProgress(Number(event.target.value))
                  }
                  required
                />
              </label>

              <label className="form-field full-field">
                <span>Work completed</span>
                <textarea
                  value={completedWork}
                  onChange={(event) => setCompletedWork(event.target.value)}
                  placeholder="Road excavation and base preparation completed."
                  required
                />
              </label>

              <label className="form-field full-field">
                <span>Remaining work</span>
                <textarea
                  value={remainingWork}
                  onChange={(event) => setRemainingWork(event.target.value)}
                  placeholder="Surface construction and road marking remain."
                  required
                />
              </label>

              <label className="form-field full-field">
                <span>Delay reason or current problem</span>
                <select
                  value={delayReason}
                  onChange={(event) => setDelayReason(event.target.value)}
                >
                  <option value="">No delay reason</option>
                  <option>Heavy rain</option>
                  <option>Material shortage</option>
                  <option>Equipment failure</option>
                  <option>Worker shortage</option>
                  <option>Utility conflict</option>
                  <option>Approval delay</option>
                  <option>Unexpected underground line</option>
                </select>
              </label>

              <label className="form-field full-field">
                <span>Site photographs and evidence</span>
                <input type="file" name="photo" multiple />
              </label>

              <div className="full-field">
                <LoadingButton
                  type="submit"
                  fullWidth
                  loading={loading}
                  loadingText={
                    isContractor ? 'Submitting progress evidence…' : 'Saving review…'
                  }
                >
                  {isContractor ? 'Submit progress update' : 'Accept progress update'}
                </LoadingButton>
              </div>
            </form>
          </div>
        </Panel>

        <Panel title="Progress rules" subtitle="Automatic prototype checks">
          <ul className="check-list">
            <li>Progress must remain between 0% and 100%.</li>
            <li>Contractors cannot approve their own updates.</li>
            <li>A 10% planned-versus-actual gap marks a project delayed.</li>
            <li>Delay reports include reason, duration, evidence, and recovery plan.</li>
            <li>Progress history remains available for project audit.</li>
          </ul>
        </Panel>
      </div>
    </div>
  );
}

export default ProgressPage;
