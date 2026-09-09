import { useState } from 'react';
import LoadingButton from '../components/LoadingButton';
import PageHeader from '../components/PageHeader';
import StatusBadge from '../components/StatusBadge';
import { useApp } from '../context/AppContext';
import { contractors } from '../data/mockData';

function ContractorsPage() {
  const [selectedContractor, setSelectedContractor] = useState('');
  const [selectedProject, setSelectedProject] = useState('');
  const [assigning, setAssigning] = useState(false);
  const { currentUser, projects, showToast } = useApp();
  const isAdmin = currentUser?.role === 'super_admin';
  const isOfficer = currentUser?.role === 'department_officer';

  async function assignContractor() {
    if (!selectedContractor || !selectedProject) {
      showToast('Select both a project and a contractor.', 'warning');
      return;
    }

    setAssigning(true);
    await new Promise((resolve) => window.setTimeout(resolve, 850));
    setAssigning(false);
    showToast(`${selectedContractor} assigned to ${selectedProject}.`);
    setSelectedContractor('');
    setSelectedProject('');
  }

  return (
    <div className="page-stack">
      <PageHeader
        eyebrow={isAdmin ? 'CONTRACTOR PERFORMANCE MONITOR' : 'VERIFIED CONTRACTOR SELECTION'}
        title={isAdmin ? 'Contractor Performance' : 'Contractors'}
        description={
          isAdmin
            ? 'Monitor license status, delays, complaints, safety and risk. Super Admin does not assign contractors to projects.'
            : 'Compare verified contractors by experience, performance, safety, workload and risk before project assignment.'
        }
      />

      {isOfficer && (
        <section className="assignment-panel content-card page-enter">
          <div className="assignment-panel-heading">
            <span>PROJECT ASSIGNMENT</span>
            <h2>Assign a verified contractor</h2>
            <p>Only projects with Final Approved status should receive a contractor.</p>
          </div>
          <label className="form-field">
            <span>Approved project</span>
            <select value={selectedProject} onChange={(event) => setSelectedProject(event.target.value)}>
              <option value="">Select project</option>
              {projects.filter((project) => project.approvalStatus === 'Final Approved').map((project) => (
                <option key={project.id} value={project.name}>{project.name}</option>
              ))}
            </select>
          </label>
          <label className="form-field">
            <span>Verified contractor</span>
            <select value={selectedContractor} onChange={(event) => setSelectedContractor(event.target.value)}>
              <option value="">Select contractor</option>
              {contractors.filter((contractor) => contractor.risk !== 'Blacklisted' && contractor.licenseStatus !== 'Expired').map((contractor) => (
                <option key={contractor.id} value={contractor.name}>{contractor.name}</option>
              ))}
            </select>
          </label>
          <LoadingButton loading={assigning} loadingText="Assigning..." onClick={assignContractor}>
            Confirm Assignment
          </LoadingButton>
        </section>
      )}

      <section className="contractor-card-grid">
        {contractors.map((contractor, index) => (
          <article className="contractor-card card-enter" key={contractor.id} style={{ animationDelay: `${index * 70}ms` }}>
            <header>
              <div className="contractor-logo">▲</div>
              <div><span>{contractor.id}</span><h2>{contractor.name}</h2><p>{contractor.licenseStatus}</p></div>
              <StatusBadge value={`${contractor.risk} risk`} />
            </header>

            <div className="score-row">
              <div className="score-block"><span>Performance</span><strong>{contractor.performance}</strong><div><i style={{ width: `${contractor.performance}%` }} /></div></div>
              <div className="score-block"><span>Safety</span><strong>{contractor.safety}</strong><div><i style={{ width: `${contractor.safety}%` }} /></div></div>
            </div>

            <div className="contractor-metrics">
              <div><strong>{contractor.activeProjects}</strong><span>Active projects</span></div>
              <div><strong>{contractor.completedProjects}</strong><span>Completed</span></div>
              <div><strong>{contractor.delayedProjects}</strong><span>Delayed</span></div>
              <div><strong>{contractor.failedInspections}</strong><span>Failed inspections</span></div>
              <div><strong>{contractor.complaints}</strong><span>Complaints</span></div>
            </div>

            <footer>
              <button className="road-button road-button-secondary" type="button" onClick={() => showToast(`${contractor.name} performance report opened.`, 'info')}>View Performance</button>
              {isOfficer && contractor.risk !== 'High' && (
                <button className="road-button road-button-primary" type="button" onClick={() => setSelectedContractor(contractor.name)}>Select for Assignment</button>
              )}
              {isAdmin && <span className="monitor-only-label">OVERSIGHT ONLY</span>}
            </footer>
          </article>
        ))}
      </section>
    </div>
  );
}

export default ContractorsPage;
