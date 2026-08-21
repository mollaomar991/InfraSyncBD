import { Link } from 'react-router-dom';

function NotFoundPage() {
  return (
    <div className="not-found-page">
      <div className="not-found-road"><span /><span /><span /></div>
      <span className="page-eyebrow">ERROR 404</span>
      <h1>That road does not exist.</h1>
      <p>The requested page is outside the InfraSync BD route map.</p>
      <Link className="road-button road-button-primary" to="/dashboard">Return to Dashboard</Link>
    </div>
  );
}

export default NotFoundPage;
