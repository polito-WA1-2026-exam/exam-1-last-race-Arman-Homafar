import { Link } from 'react-router-dom';

function NotFoundPage() {
  return (
    <section className="narrow-panel">
      <h1>Page not found</h1>
      <p className="muted">This route is not part of the Last Race application.</p>
      <Link to="/" className="button primary">Back to instructions</Link>
    </section>
  );
}

export default NotFoundPage;
