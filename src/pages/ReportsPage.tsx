import PageHeader from '../components/PageHeader';
import StatCard from '../components/StatCard';
import StatusBadge from '../components/StatusBadge';
import { useApp } from '../context/AppContext';
import { conflicts, contractors, inspections } from '../data/mockData';
import { formatCurrency } from '../utils';

function ReportsPage() {
  const { projects, complaints } = useApp();
  const totalBudget = projects.reduce((sum, project) => sum + project.budget, 0);
  const completedProjects = projects.filter((project) => project.status === 'Completed').length;
  const delayedProjects = projects.filter((project) => project.status === 'Delayed').length;
  const resolvedComplaints = complaints.filter((complaint) => ['Resolved', 'Closed'].includes(complaint.status)).length;

  const departmentCounts = projects.reduce<Record<string, number>>((counts, project) => {
    counts[project.department] = (counts[project.department] || 0) + 1;
    return counts;
  }, {});
  const maxDepartmentCount = Math.max(...Object.values(departmentCounts), 1);

  const complaintCategories = complaints.reduce<Record<string, number>>((counts, complaint) => {
    counts[complaint.category] = (counts[complaint.category] || 0) + 1;
    return counts;
  }, {});
  const maxComplaintCount = Math.max(...Object.values(complaintCategories), 1);

  return (
    <div className="page-stack">
      <PageHeader eyebrow="REPORTS AND ANALYTICS" title="Infrastructure Performance Reports" description="Review project, conflict, contractor, complaint, budget, and inspection indicators." action={<button className="road-button road-button-primary" onClick={() => window.print()}>⇩ Export Report</button>} />

      <section className="stats-grid stats-grid-six">
        <StatCard label="Total Projects" value={projects.length} note={`${completedProjects} completed`} icon="▤" tone="blue" />
        <StatCard label="Approved Budget" value={formatCurrency(totalBudget)} note="Across visible projects" icon="৳" tone="orange" delay={70} />
        <StatCard label="Delayed Projects" value={delayedProjects} note="Below planned progress" icon="↘" tone="red" delay={140} />
        <StatCard label="Total Conflicts" value={conflicts.length} note={`${conflicts.filter((item) => item.status === 'Resolved').length} resolved`} icon="!" tone="red" delay={210} />
        <StatCard label="Complaints Resolved" value={`${resolvedComplaints}/${complaints.length}`} note="Public issue performance" icon="◉" tone="green" delay={280} />
        <StatCard label="Passed Inspections" value={inspections.filter((item) => item.result.includes('Passed')).length} note="Quality checks passed" icon="◎" tone="green" delay={350} />
      </section>

      <section className="report-grid">
        <article className="content-card chart-card page-enter">
          <header className="content-card-header"><div><h2>Projects by department</h2><p>Current project distribution.</p></div><StatusBadge value="Live data" /></header>
          <div className="horizontal-chart">
            {Object.entries(departmentCounts).map(([department, count]) => (
              <div className="chart-row" key={department}>
                <span>{department}</span>
                <div><i style={{ width: `${(count / maxDepartmentCount) * 100}%` }} /></div>
                <strong>{count}</strong>
              </div>
            ))}
          </div>
        </article>

        <article className="content-card chart-card page-enter">
          <header className="content-card-header"><div><h2>Complaint categories</h2><p>Public reports by issue type.</p></div></header>
          <div className="vertical-bar-chart">
            {Object.entries(complaintCategories).map(([category, count]) => (
              <div className="vertical-bar" key={category}>
                <strong>{count}</strong>
                <div><i style={{ height: `${Math.max(24, (count / maxComplaintCount) * 100)}%` }} /></div>
                <span>{category}</span>
              </div>
            ))}
          </div>
        </article>

        <article className="content-card chart-card page-enter">
          <header className="content-card-header"><div><h2>Contractor performance</h2><p>Performance and safety comparison.</p></div></header>
          <div className="contractor-report-list">
            {contractors.map((contractor) => (
              <div key={contractor.id}>
                <div><strong>{contractor.name}</strong><StatusBadge value={`${contractor.risk} risk`} /></div>
                <span>Performance <b>{contractor.performance}</b></span><div className="report-track"><i style={{ width: `${contractor.performance}%` }} /></div>
                <span>Safety <b>{contractor.safety}</b></span><div className="report-track report-track-safety"><i style={{ width: `${contractor.safety}%` }} /></div>
              </div>
            ))}
          </div>
        </article>

        <article className="content-card chart-card page-enter">
          <header className="content-card-header"><div><h2>Quality verification</h2><p>Inspection outcomes.</p></div></header>
          <div className="quality-donut-wrap">
            <div className="quality-donut"><div><strong>{inspections.filter((item) => item.result.includes('Passed')).length}</strong><span>passed</span></div></div>
            <div className="quality-legend">
              <span><i className="quality-good" /> Passed inspections <strong>{inspections.filter((item) => item.result.includes('Passed')).length}</strong></span>
              <span><i className="quality-bad" /> Failed inspections <strong>{inspections.filter((item) => item.result === 'Failed').length}</strong></span>
              <span><i className="quality-warning" /> Scheduled inspections <strong>{inspections.filter((item) => item.result === 'Scheduled').length}</strong></span>
            </div>
          </div>
        </article>
      </section>

      <section className="content-card page-enter">
        <header className="content-card-header"><div><h2>Project budget overview</h2><p>Approved budget and progress indicators.</p></div></header>
        <div className="table-responsive">
          <table className="data-table"><thead><tr><th>Project</th><th>Department</th><th>Budget</th><th>Progress</th><th>Conflict</th><th>Status</th></tr></thead><tbody>{projects.map((project) => <tr key={project.id}><td><span className="table-id">{project.id}</span><strong>{project.name}</strong></td><td>{project.department}</td><td>{formatCurrency(project.budget)}</td><td><strong>{project.progress}%</strong></td><td><StatusBadge value={project.conflictLevel} /></td><td><StatusBadge value={project.status} /></td></tr>)}</tbody></table>
        </div>
      </section>
    </div>
  );
}

export default ReportsPage;
