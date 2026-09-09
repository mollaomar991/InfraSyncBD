import { useState } from 'react';
import PageHeader from '../components/PageHeader';
import Panel from '../components/Panel';
import StatusBadge from '../components/StatusBadge';
import { useApp } from '../context/AppContext';

interface CoordinationRequest {
  id: string;
  project: string;
  sender: string;
  receiver: string;
  proposedDate: string;
  requiredResponse: string;
  comment: string;
  status: 'Pending' | 'Accepted' | 'Change Requested' | 'Rejected';
}

const initialRequests: CoordinationRequest[] = [
  {
    id: 'CRD-501',
    project: 'Mirpur 12 Road Reconstruction',
    sender: 'Road Department',
    receiver: 'Dhaka WASA',
    proposedDate: '2026-09-15',
    requiredResponse: '2026-08-18',
    comment: 'Confirm pipeline completion before final road construction.',
    status: 'Pending',
  },
  {
    id: 'CRD-502',
    project: 'Mirpur 12 Road Reconstruction',
    sender: 'Road Department',
    receiver: 'Gas Authority',
    proposedDate: '2026-09-15',
    requiredResponse: '2026-08-18',
    comment: 'Review the utility corridor and planned maintenance window.',
    status: 'Accepted',
  },
  {
    id: 'CRD-503',
    project: 'Dhanmondi Fiber Corridor',
    sender: 'Fiber Authority',
    receiver: 'Road Department',
    proposedDate: '2026-10-10',
    requiredResponse: '2026-08-20',
    comment: 'Fiber installation should finish before resurfacing.',
    status: 'Change Requested',
  },
];

function CoordinationPage() {
  const [requests, setRequests] = useState(initialRequests);
  const [comment, setComment] = useState('');
  const { showToast } = useApp();

  function respond(
    requestId: string,
    status: CoordinationRequest['status'],
  ) {
    setRequests((items) =>
      items.map((item) =>
        item.id === requestId
          ? { ...item, status, comment: comment || item.comment }
          : item,
      ),
    );
    setComment('');
    showToast(`Coordination response saved as ${status}.`, 'info');
  }

  return (
    <div className="page-stack">
      <PageHeader
        eyebrow="SHARED WORK SCHEDULE"
        title="Department Coordination"
        description="Review project location, dates, conflict results, utility plans, and departmental work before formal approval."
      />

      <div className="shared-timeline">
        {['WASA pipeline', 'Gas inspection', 'Fiber installation', 'Drainage repair', 'Road reconstruction'].map(
          (item, index) => (
            <div className="shared-timeline-step" key={item}>
              <span>{index + 1}</span>
              <strong>{item}</strong>
            </div>
          ),
        )}
      </div>

      <div className="content-grid content-grid-2-1">
        <Panel
          title="Coordination requests"
          subtitle="Accept, reject, suggest another date, or request project changes."
        >
          <div className="item-list">
            {requests.map((request) => (
              <article className="coordination-card" key={request.id}>
                <div className="coordination-card-header">
                  <div>
                    <span>{request.id}</span>
                    <h3>{request.project}</h3>
                  </div>
                  <StatusBadge status={request.status} />
                </div>

                <div className="coordination-route">
                  <span>{request.sender}</span>
                  <strong>→</strong>
                  <span>{request.receiver}</span>
                </div>

                <p>{request.comment}</p>
                <div className="project-info-grid small-grid">
                  <div>
                    <span>Proposed start</span>
                    <strong>{request.proposedDate}</strong>
                  </div>
                  <div>
                    <span>Response due</span>
                    <strong>{request.requiredResponse}</strong>
                  </div>
                </div>

                <div className="card-actions">
                  <button
                    className="button button-primary"
                    type="button"
                    onClick={() => respond(request.id, 'Accepted')}
                  >
                    Accept
                  </button>
                  <button
                    className="button button-secondary"
                    type="button"
                    onClick={() => respond(request.id, 'Change Requested')}
                  >
                    Request changes
                  </button>
                  <button
                    className="button button-ghost"
                    type="button"
                    onClick={() => respond(request.id, 'Rejected')}
                  >
                    Reject
                  </button>
                </div>
              </article>
            ))}
          </div>
        </Panel>

        <Panel title="Response comment" subtitle="Applied to your next decision">
          <label className="form-field">
            <span>Department comment</span>
            <textarea
              value={comment}
              onChange={(event) => setComment(event.target.value)}
              placeholder="Example: Pipeline replacement must finish first. Move road construction to November 15."
            />
          </label>
          <div className="upload-dropzone">
            <span>↑</span>
            <strong>Attach utility plan</strong>
            <p>Frontend selection only</p>
            <input type="file" />
          </div>
        </Panel>
      </div>
    </div>
  );
}

export default CoordinationPage;
