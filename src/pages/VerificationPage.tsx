import { useState, type MouseEvent } from 'react';
import LoadingButton from '../components/LoadingButton';
import PageHeader from '../components/PageHeader';
import StatusBadge from '../components/StatusBadge';
import { useApp } from '../context/AppContext';
import type { AccountStatus, Registration } from '../types';

function VerificationPage() {
  const [selectedRegistration, setSelectedRegistration] = useState<Registration | null>(null);
  const [processingId, setProcessingId] = useState('');
  const { registrations, updateRegistrationStatus, showToast } = useApp();

  async function decide(registration: Registration, status: AccountStatus) {
    setProcessingId(registration.id);
    await updateRegistrationStatus(registration.id, status);
    setProcessingId('');
    setSelectedRegistration(null);
  }

  return (
    <div className="page-stack">
      <PageHeader
        eyebrow="ACCOUNT VERIFICATION"
        title="Officer and Contractor Registrations"
        description="Review submitted identity, employment and license documents before activating access."
      />

      <section className="verification-summary page-enter">
        <div><span>Pending</span><strong>{registrations.filter((item) => item.status === 'Pending Verification').length}</strong></div>
        <div><span>More documents</span><strong>{registrations.filter((item) => item.status === 'More Documents Requested').length}</strong></div>
        <div><span>Approved</span><strong>{registrations.filter((item) => item.status === 'Active').length}</strong></div>
        <div><span>Rejected</span><strong>{registrations.filter((item) => item.status === 'Rejected').length}</strong></div>
      </section>

      <section className="content-card verification-table-card page-enter">
        <div className="table-responsive">
          <table className="data-table">
            <thead><tr><th>Applicant</th><th>Role</th><th>Organization</th><th>Submitted</th><th>Documents</th><th>Status</th><th>Action</th></tr></thead>
            <tbody>
              {registrations.map((registration) => (
                <tr key={registration.id}>
                  <td><span className="table-id">{registration.id}</span><strong>{registration.name}</strong><small>{registration.email}</small></td>
                  <td>{registration.role}</td>
                  <td><strong>{registration.organization}</strong><small>{registration.designation}</small></td>
                  <td>{registration.submittedDate}</td>
                  <td><span className="document-count">▧ {registration.documentCount} files</span></td>
                  <td><StatusBadge value={registration.status} /></td>
                  <td><button className="road-button road-button-secondary" onClick={() => setSelectedRegistration(registration)}>Review Application</button></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      {selectedRegistration && (
        <div className="drawer-backdrop" onClick={() => setSelectedRegistration(null)}>
          <aside className="verification-drawer" onClick={(event: MouseEvent<HTMLElement>) => event.stopPropagation()}>
            <div className="hazard-strip" />
            <button className="drawer-close" onClick={() => setSelectedRegistration(null)}>×</button>
            <span className="page-eyebrow">{selectedRegistration.id}</span>
            <h2>{selectedRegistration.name}</h2>
            <p>{selectedRegistration.role} registration</p>
            <div className="detail-list">
              <div><span>Email</span><strong>{selectedRegistration.email}</strong></div>
              <div><span>Organization</span><strong>{selectedRegistration.organization}</strong></div>
              <div><span>Designation</span><strong>{selectedRegistration.designation}</strong></div>
              <div><span>Submitted</span><strong>{selectedRegistration.submittedDate}</strong></div>
            </div>
            <div className="verification-document-list">
              {Array.from({ length: selectedRegistration.documentCount }).map((_, index) => (
                <article key={index}><span>PDF</span><div><strong>Verification document {index + 1}</strong><small>Uploaded with registration</small></div><button type="button" onClick={() => showToast(`Document ${index + 1} preview opened.`, 'info')}>Preview</button></article>
              ))}
            </div>
            <label className="form-field"><span>Review comment</span><textarea rows={4} placeholder="Add an approval, rejection or additional-document reason." /></label>
            <div className="verification-actions">
              <LoadingButton block loading={processingId === selectedRegistration.id} loadingText="Approving..." onClick={() => decide(selectedRegistration, 'Active')}>Approve Account</LoadingButton>
              <button className="road-button road-button-secondary road-button-block" onClick={() => decide(selectedRegistration, 'More Documents Requested')}>Request More Documents</button>
              <button className="road-button road-button-danger road-button-block" onClick={() => decide(selectedRegistration, 'Rejected')}>Reject Application</button>
            </div>
          </aside>
        </div>
      )}
    </div>
  );
}

export default VerificationPage;
