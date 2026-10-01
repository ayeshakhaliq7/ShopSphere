import { Link } from 'react-router-dom';

/** Empty / error / not-found panel. Every state names what happened and offers a next step. */
export default function StatePanel({ icon, title, message, actionLabel, actionTo, onAction, tone = 'neutral' }) {
  return (
    <div className={`state-panel state-${tone}`} role={tone === 'error' ? 'alert' : undefined}>
      {icon && <div className="state-icon">{icon}</div>}
      <h2>{title}</h2>
      {message && <p>{message}</p>}
      {actionLabel && (actionTo
        ? <Link className="btn btn-primary" to={actionTo}>{actionLabel}</Link>
        : <button className="btn btn-primary" onClick={onAction}>{actionLabel}</button>)}
    </div>
  );
}
