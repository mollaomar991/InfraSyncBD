import { useState, useEffect } from 'react';
import PageHeader from '../components/PageHeader';
import Panel from '../components/Panel';
import StatusBadge from '../components/StatusBadge';
import { useApp } from '../context/AppContext';
import api from '../api/axiosClient';

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

function CoordinationPage() {
  const [requests, setRequests] = useState<CoordinationRequest[]>([]);
  const [comment, setComment] = useState('');
  const { showToast } = useApp();

  // Fetch coordination requests from real API
  useEffect(() => {
    async function fetchRequests() {
      try {
        const res = await api.get('/coordination');
        if (res.data.success) {
          // Map database fields to frontend type
          const mapped = res.data.data.map((row: any) => ({
            id: row.coordination_id.toString(),
            project: row.project_name || 'Unknown Project',
            sender: row.sender_department || 'Unknown',
            receiver: row.receiver_department || 'Unknown',
            proposedDate: row.suggested_start_date ? new Date(row.suggested_start_date).toLocaleDateString() : '',
            requiredResponse: row.suggested_end_date ? new Date(row.suggested_end_date).toLocaleDateString() : '',
            comment: row.notes || '',
            status: row.status === 'pending' ? 'Pending'
              : row.status === 'accepted' ? 'Accepted'
              : row.status === 'changes_requested' ? 'Change Requested'
              : 'Rejected',
          }));
          setRequests(mapped);
        }
      } catch (error) {
        console.error('Error fetching coordination requests:', error);
      }
    }
    fetchRequests();
  }, []);

  async function respond(
    requestId: string,
    status: CoordinationRequest['status'],
  ) {
    try {
      // Map frontend status back to database enum
      const dbStatus = status === 'Accepted' ? 'accepted'
        : status === 'Change Requested' ? 'changes_requested'
        : 'rejected';

      await api.put(`/coordination/${requestId}/respond`, {
        status: dbStatus,
        notes: comment || undefined,
      });

      setRequests((items) =>
        items.map((item) =>
          item.id === requestId
            ? { ...item, status, comment: comment || item.comment }
            : item,
        ),
      );
      setComment('');
      showToast(`Coordination response saved as ${status}.`, 'info');
    } catch (error) {
      console.error('Error responding to coordination:', error);
      showToast('Failed to respond.', 'error');
    }
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
