import { useEffect, useState } from 'react';
import { productService, categoryService } from '../../services';
import { getErrorMessage } from '../../services/api';
import { useToast } from '../../context/ToastContext';
import { money } from '../../utils/format';
import Modal from '../../components/Modal';
import StatePanel from '../../components/StatePanel';
import { Spinner } from '../../components/Skeleton';
import { TrashIcon } from '../../components/Icons';
import useDocumentTitle from '../../hooks/useDocumentTitle';

const empty = { name: '', description: '', price: '', discountPrice: '', category: '', stock: '', featured: false, images: '' };

export default function AdminProducts() {
  useDocumentTitle('Admin — Products');
  const toast = useToast();
  const [result, setResult] = useState(null);
  const [categories, setCategories] = useState([]);
  const [error, setError] = useState(null);
  const [editing, setEditing] = useState(null); // null | 'new' | product
  const [form, setForm] = useState(empty);
  const [formError, setFormError] = useState(null);
  const [saving, setSaving] = useState(false);
  const [search, setSearch] = useState('');

  const load = () => productService.list({ limit: 50, search: search || undefined }).then(setResult).catch((e) => setError(getErrorMessage(e)));
  useEffect(() => { load(); }, [search]);
  useEffect(() => { categoryService.list().then((r) => setCategories(r.categories)); }, []);

  const openNew = () => { setForm(empty); setFormError(null); setEditing('new'); };
  const openEdit = (p) => {
    setForm({ name: p.name, description: p.description, price: p.price, discountPrice: p.discountPrice || '', category: p.category?._id, stock: p.stock, featured: p.featured, images: p.images.join(', ') });
    setFormError(null);
    setEditing(p);
  };

  const submit = async (e) => {
    e.preventDefault();
    setFormError(null); setSaving(true);
    try {
      const body = {
        name: form.name, description: form.description, price: Number(form.price),
        discountPrice: form.discountPrice ? Number(form.discountPrice) : null,
        category: form.category, stock: Number(form.stock), featured: form.featured,
        images: form.images.split(',').map((s) => s.trim()).filter(Boolean),
      };
      if (editing === 'new') { await productService.create(body); toast.success('Product created.'); }
      else { await productService.update(editing._id, body); toast.success('Product updated.'); }
      setEditing(null);
      load();
    } catch (err) {
      setFormError(getErrorMessage(err));
    } finally {
      setSaving(false);
    }
  };

  const remove = async (p) => {
    if (!window.confirm(`Delete "${p.name}"? This cannot be undone.`)) return;
    try { await productService.remove(p._id); toast.success('Product deleted.'); load(); }
    catch (err) { toast.error(getErrorMessage(err)); }
  };

  return (
    <div>
      <div className="admin-head">
        <h1 style={{ fontSize: 24, margin: 0 }}>Products</h1>
        <div style={{ display: 'flex', gap: 10 }}>
          <input className="search-input" placeholder="Search products" value={search} onChange={(e) => setSearch(e.target.value)} />
          <button className="btn btn-primary" onClick={openNew}>Add product</button>
        </div>
      </div>

      {error && <StatePanel tone="error" title="Couldn't load products" message={error} />}
      {!error && !result && <Spinner label="Loading products" />}
      {result && (
        <div className="panel">
          <table className="data-table">
            <thead><tr><th></th><th>Name</th><th>Category</th><th>Price</th><th>Stock</th><th>Featured</th><th></th></tr></thead>
            <tbody>
              {result.products.map((p) => (
                <tr key={p._id}>
                  <td><img className="table-thumb" src={p.images[0]} alt="" /></td>
                  <td>{p.name}</td>
                  <td>{p.category?.name}</td>
                  <td>{money(p.finalPrice ?? p.price)}</td>
                  <td>{p.stock}</td>
                  <td>{p.featured ? 'Yes' : '—'}</td>
                  <td className="table-actions">
                    <button className="btn btn-ghost btn-sm" onClick={() => openEdit(p)}>Edit</button>
                    <button className="btn btn-danger btn-sm" onClick={() => remove(p)}><TrashIcon width={14} height={14} /></button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          <div className="data-cards">
            {result.products.map((p) => (
              <div className="data-card" key={p._id}>
                <div style={{ display: 'flex', gap: 12, alignItems: 'center', marginBottom: 8 }}>
                  <img className="table-thumb" src={p.images[0]} alt="" />
                  <strong>{p.name}</strong>
                </div>
                <div className="data-card-row"><span>Category</span><span>{p.category?.name}</span></div>
                <div className="data-card-row"><span>Price</span><span>{money(p.finalPrice ?? p.price)}</span></div>
                <div className="data-card-row"><span>Stock</span><span>{p.stock}</span></div>
                <div className="table-actions" style={{ marginTop: 10 }}>
                  <button className="btn btn-ghost btn-sm" onClick={() => openEdit(p)}>Edit</button>
                  <button className="btn btn-danger btn-sm" onClick={() => remove(p)}>Delete</button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {editing && (
        <Modal title={editing === 'new' ? 'Add product' : `Edit ${editing.name}`} onClose={() => setEditing(null)}>
          <div className="modal-body">
            {formError && <div className="form-alert" role="alert">{formError}</div>}
            <form onSubmit={submit} noValidate>
              <div className="field"><label htmlFor="pname">Name</label><input id="pname" required value={form.name} onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))} /></div>
              <div className="field"><label htmlFor="pdesc">Description</label><textarea id="pdesc" rows={3} required value={form.description} onChange={(e) => setForm((f) => ({ ...f, description: e.target.value }))} /></div>
              <div className="field-row">
                <div className="field"><label htmlFor="pprice">Price</label><input id="pprice" type="number" min="0" step="0.01" required value={form.price} onChange={(e) => setForm((f) => ({ ...f, price: e.target.value }))} /></div>
                <div className="field"><label htmlFor="pdisc">Discount price</label><input id="pdisc" type="number" min="0" step="0.01" value={form.discountPrice} onChange={(e) => setForm((f) => ({ ...f, discountPrice: e.target.value }))} /></div>
              </div>
              <div className="field-row">
                <div className="field"><label htmlFor="pcat">Category</label>
                  <select id="pcat" required value={form.category} onChange={(e) => setForm((f) => ({ ...f, category: e.target.value }))}>
                    <option value="" disabled>Choose…</option>
                    {categories.map((c) => <option key={c._id} value={c._id}>{c.name}</option>)}
                  </select>
                </div>
                <div className="field"><label htmlFor="pstock">Stock</label><input id="pstock" type="number" min="0" required value={form.stock} onChange={(e) => setForm((f) => ({ ...f, stock: e.target.value }))} /></div>
              </div>
              <div className="field"><label htmlFor="pimg">Image URLs (comma-separated)</label><input id="pimg" required value={form.images} onChange={(e) => setForm((f) => ({ ...f, images: e.target.value }))} /></div>
              <label style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 18 }}>
                <input type="checkbox" checked={form.featured} onChange={(e) => setForm((f) => ({ ...f, featured: e.target.checked }))} /> Featured product
              </label>
              <button className="btn btn-primary btn-block" disabled={saving}>{saving ? 'Saving…' : editing === 'new' ? 'Create product' : 'Save changes'}</button>
            </form>
          </div>
        </Modal>
      )}
    </div>
  );
}
