import StatePanel from '../components/StatePanel';
import useDocumentTitle from '../hooks/useDocumentTitle';

export default function NotFound() {
  useDocumentTitle('Page not found');
  return (
    <StatePanel
      icon="🧭"
      title="Page not found"
      message="The page you're looking for doesn't exist or may have moved."
      actionLabel="Back to home"
      actionTo="/"
    />
  );
}
