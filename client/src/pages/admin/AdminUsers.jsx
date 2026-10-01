import { useEffect, useState } from 'react';
import { userService } from '../../services';
import { getErrorMessage } from '../../services/api';
import { useToast } from '../../context/ToastContext';
import { useAuth } from '../../context/AuthContext';
import { shortDate } from '../../utils/format';
import StatePanel from '../../components/StatePanel';
import { Spinner } from '../../components/Skeleton';
import Modal from '../../components/Modal';
import useDocumentTitle from '../../hooks/useDocumentTitle';

export default function AdminUsers() {
  useDocumentTitle('Admin — Users');
  const { user: me } = useAuth();
  const toast = useToast();
  const [users, setUsers] = useState(null);
  const [error, setError] = useState(null);
  const [active, setActive] = useState(null);

  const load = () => userService.list().then((r) => setUsers(r.users)).catch((e) => setError(getErrorMessage(e)));
  useEffect(() => { load(); }, []);

  const toggleActive = async (u) => {
    try {
      await userService.update(u._id, { isActive: !u.isActive });
      toast.success(`${u.name} ${u.isActive ? 'deactivated' : 'reactivated'}.`);
      setActive(null);
      load();
    } catch (err) {
      toast.error(getErrorMessage(err));
    }
  };

  if (error) return <StatePanel tone="error" title="Couldn't load users" message={error} />;
  if (!users) return <Spinner label="Loading users" />;

  return (
    <div>
      <div className="admin-head"><h1 style={{ fontSize: 24, margin: 0 }}>Users</h1></div>
      <div className="panel">
        <table className="data-table">
          <thead><tr><th>Name</th><th>Email</th><th>Role</th><th>Joined</th><th>Status</th><th></th></tr></thead>
          <tbody>
            {users.map((u) => (
              <tr key={u._id}>
                <td>{u.name}</td>
                <td>{u.email}</td>
                <td style={{ textTransform: 'capitalize' }}>{u.role}</td>
                <td>{shortDate(u.createdAt)}</td>
                <td>{u.isActive ? <span className="status status-delivered">Active</span> : <span className="status status-cancelled">Deactivated</span>}</td>
                <td><button className="btn btn-ghost btn-sm" onClick={() => setActive(u)}>View</button></td>
              </tr>
            ))}
          </tbody>
        </table>
        <div className="data-cards">
          {users.map((u) => (
            <div className="data-card" key={u._id}>
              <div className="data-card-row"><span>Name</span><span>{u.name}</span></div>
              <div className="data-card-row"><span>Email</span><span>{u.email}</span></div>
              <div className="data-card-row"><span>Role</span><span>{u.role}</span></div>
              <div className="data-card-row"><span>Status</span><span>{u.isActive ? 'Active' : 'Deactivated'}</span></div>
              <button className="btn btn-ghost btn-sm" style={{ marginTop: 10 }} onClick={() => setActive(u)}>View</button>
            </div>
          ))}
        </div>
      </div>

      {active && (
        <Modal title={active.name} onClose={() => setActive(null)}>
          <div className="modal-body">
            <div className="summary-row"><span>Email</span><span>{active.email}</span></div>
            <div className="summary-row"><span>Role</span><span style={{ textTransform: 'capitalize' }}>{active.role}</span></div>
            <div className="summary-row"><span>Joined</span><span>{shortDate(active.createdAt)}</span></div>
            <div className="summary-row"><span>Status</span><span>{active.isActive ? 'Active' : 'Deactivated'}</span></div>
            {active._id !== me._id ? (
              <button className={`btn ${active.isActive ? 'btn-danger' : 'btn-primary'}`} style={{ marginTop: 16 }} onClick={() => toggleActive(active)}>
                {active.isActive ? 'Deactivate account' : 'Reactivate account'}
              </button>
            ) : <p className="small muted" style={{ marginTop: 16 }}>You can't change your own account status here.</p>}
          </div>
        </Modal>
      )}
    </div>
  );
}
