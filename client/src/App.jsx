import { useEffect, useState } from 'react';

const API = (import.meta.env.VITE_API_URL || 'http://localhost:5000') + '/api/expenses';
const CATEGORIES = ['Food', 'Transport', 'Rent', 'Shopping', 'Health', 'Education', 'Other'];
const today = () => new Date().toISOString().slice(0, 10);
const empty = { title: '', amount: '', category: 'Food', date: today(), note: '' };
const money = (n) => '₹' + Number(n).toLocaleString('en-IN', { maximumFractionDigits: 2 });

export default function App() {
  const [expenses, setExpenses] = useState([]);
  const [form, setForm] = useState(empty);
  const [editId, setEditId] = useState(null);
  const [filter, setFilter] = useState('All');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  async function load() {
    try {
      setLoading(true);
      const res = await fetch(API);
      if (!res.ok) throw new Error('Could not load expenses');
      setExpenses(await res.json());
      setError('');
    } catch (e) {
      setError(e.message + '. Check that the server is running and VITE_API_URL is correct.');
    } finally {
      setLoading(false);
    }
  }
  useEffect(() => { load(); }, []);

  const change = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  async function submit(e) {
    e.preventDefault();
    const res = await fetch(editId ? `${API}/${editId}` : API, {
      method: editId ? 'PUT' : 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ ...form, amount: Number(form.amount) }),
    });
    if (!res.ok) { setError((await res.json()).message); return; }
    setForm(empty); setEditId(null); setError(''); load();
  }

  function edit(x) {
    setEditId(x._id);
    setForm({ title: x.title, amount: x.amount, category: x.category, date: x.date.slice(0, 10), note: x.note || '' });
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  async function remove(id) {
    if (!confirm('Delete this expense?')) return;
    await fetch(`${API}/${id}`, { method: 'DELETE' });
    load();
  }

  const shown = filter === 'All' ? expenses : expenses.filter((x) => x.category === filter);
  const total = shown.reduce((s, x) => s + x.amount, 0);
  const byCat = CATEGORIES.map((c) => ({ c, v: expenses.filter((x) => x.category === c).reduce((s, x) => s + x.amount, 0) })).filter((x) => x.v > 0);
  const max = Math.max(1, ...byCat.map((x) => x.v));

  return (
    <main className="wrap">
      <header>
        <h1>SpendWise</h1>
        <p>Write down what you spend, see where it goes.</p>
      </header>

      <section className="total">
        <span>{filter === 'All' ? 'Total spent' : `Spent on ${filter}`}</span>
        <strong>{money(total)}</strong>
      </section>

      {error && <p className="error" role="alert">{error}</p>}

      <div className="grid">
        <form className="panel" onSubmit={submit}>
          <h2>{editId ? 'Edit expense' : 'Add expense'}</h2>
          <label>What was it for?
            <input name="title" value={form.title} onChange={change} required placeholder="Lunch at canteen" />
          </label>
          <div className="row">
            <label>Amount (₹)
              <input name="amount" type="number" min="0.01" step="0.01" value={form.amount} onChange={change} required />
            </label>
            <label>Date
              <input name="date" type="date" value={form.date} onChange={change} required />
            </label>
          </div>
          <label>Category
            <select name="category" value={form.category} onChange={change}>
              {CATEGORIES.map((c) => <option key={c}>{c}</option>)}
            </select>
          </label>
          <label>Note (optional)
            <input name="note" value={form.note} onChange={change} />
          </label>
          <div className="row">
            <button className="primary" type="submit">{editId ? 'Save changes' : 'Add expense'}</button>
            {editId && <button type="button" onClick={() => { setEditId(null); setForm(empty); }}>Cancel</button>}
          </div>
        </form>

        <section className="panel">
          <h2>By category</h2>
          {byCat.length === 0 && <p className="muted">No spending recorded yet.</p>}
          {byCat.map(({ c, v }) => (
            <div className="bar" key={c}>
              <span>{c}</span>
              <div><i style={{ width: `${(v / max) * 100}%` }} /></div>
              <b>{money(v)}</b>
            </div>
          ))}
        </section>
      </div>

      <section className="panel">
        <div className="listhead">
          <h2>Expenses</h2>
          <select value={filter} onChange={(e) => setFilter(e.target.value)} aria-label="Filter by category">
            <option>All</option>
            {CATEGORIES.map((c) => <option key={c}>{c}</option>)}
          </select>
        </div>
        {loading && <p className="muted">Loading…</p>}
        {!loading && shown.length === 0 && <p className="muted">Nothing here yet. Add your first expense above.</p>}
        <ul>
          {shown.map((x) => (
            <li key={x._id}>
              <div>
                <strong>{x.title}</strong>
                <small>{x.category} · {new Date(x.date).toLocaleDateString('en-IN')}{x.note ? ` · ${x.note}` : ''}</small>
              </div>
              <span className="amt">{money(x.amount)}</span>
              <div className="actions">
                <button onClick={() => edit(x)}>Edit</button>
                <button className="danger" onClick={() => remove(x._id)}>Delete</button>
              </div>
            </li>
          ))}
        </ul>
      </section>
    </main>
  );
}
