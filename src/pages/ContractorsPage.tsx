import { useState, useEffect } from 'react';
import LoadingButton from '../components/LoadingButton';
import PageHeader from '../components/PageHeader';
import StatusBadge from '../components/StatusBadge';
import { useApp } from '../context/AppContext';
import api from '../api/axiosClient';
import type { Contractor } from '../types';

function ContractorsPage() {
  const [contractorsList, setContractorsList] = useState<Contractor[]>([]);
  const [selectedContractorId, setSelectedContractorId] = useState('');
  const [selectedProjectId, setSelectedProjectId] = useState('');
  const [assigning, setAssigning] = useState(false);
  const { currentUser, projects, showToast } = useApp();
  
  const isAdmin = currentUser?.role === 'super_admin';
  const isOfficer = currentUser?.role === 'department_officer';

  // Fetch verified contractors from real API
  useEffect(() => {
    async function fetchContractors() {
      try {
        const res = await api.get('/contractors/verified');
        if (res.data.success) {
          // Map database fields to frontend Contractor type
          const mapped = res.data.data.map((row: any) => ({
            id: row.contractor_id.toString(),
            name: row.company_name || 'Unknown Company',
            licenseStatus: 'Active', // Assuming they are active if verified
            activeProjects: row.total_assigned_projects - row.completed_projects,
            completedProjects: row.completed_projects,
            delayedProjects: row.delayed_projects,
            performance: Math.round((row.performance_rating / 5) * 100),
            safety: Math.round((row.safety_rating / 5) * 100),
            failedInspections: 0, // Not tracked directly in this table yet
            complaints: 0, // Not tracked directly in this table yet
            risk: row.risk_level === 'low_risk' ? 'Low'
              : row.risk_level === 'medium_risk' ? 'Medium'
              : row.risk_level === 'high_risk' ? 'High'
              : 'Blacklisted',
          }));
          setContractorsList(mapped);
        }
      } catch (error) {
        console.error('Error fetching contractors:', error);
      }
    }
    fetchContractors();
  }, []);

  async function assignContractor() {
    if (!selectedContractorId || !selectedProjectId) {
      showToast('Select both a project and a contractor.', 'warning');
      return;
    }

    setAssigning(true);
    try {
      await api.post('/contractors/assign', {
        projectId: parseInt(selectedProjectId),
        contractorId: parseInt(selectedContractorId)
      });
      
      const contractorName = contractorsList.find(c => c.id === selectedContractorId)?.name || 'Contractor';
      const projectName = projects.find(p => p.id === selectedProjectId)?.name || 'Project';
      
      showToast(`${contractorName} assigned to ${projectName}.`, 'success');
      
      setSelectedContractorId('');
      setSelectedProjectId('');
      
      // Optionally re-fetch projects here or rely on AppContext to refresh
    } catch (error) {
      console.error('Error assigning contractor:', error);
      showToast('Failed to assign contractor.', 'error');
    } finally {
      setAssigning(false);
    }
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
            <select value={selectedProjectId} onChange={(event) => setSelectedProjectId(event.target.value)}>
              <option value="">Select project</option>
              {projects.filter((project) => project.approvalStatus === 'final_approved' || project.approvalStatus === 'Final Approved').map((project) => (
                <option key={project.id} value={project.id}>{project.name}</option>
              ))}
            </select>
          </label>
          <label className="form-field">
            <span>Verified contractor</span>
            <select value={selectedContractorId} onChange={(event) => setSelectedContractorId(event.target.value)}>
              <option value="">Select contractor</option>
              {contractorsList.filter((contractor) => contractor.risk !== 'Blacklisted' && contractor.licenseStatus !== 'Expired').map((contractor) => (
                <option key={contractor.id} value={contractor.id}>{contractor.name}</option>
              ))}
            </select>
          </label>
          <LoadingButton loading={assigning} loadingText="Assigning..." onClick={assignContractor}>
            Confirm Assignment
          </LoadingButton>
        </section>
      )}

      <section className="contractor-card-grid">
        {contractorsList.map((contractor, index) => (
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
                <button className="road-button road-button-primary" type="button" onClick={() => setSelectedContractorId(contractor.id)}>Select for Assignment</button>
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
