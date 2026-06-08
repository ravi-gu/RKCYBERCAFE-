import React, { useEffect, useState } from "react";
import { createRoot } from "react-dom/client";
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer } from "recharts";
import { LayoutDashboard, Video, Wand2, CalendarDays, DollarSign, LogOut } from "lucide-react";
import "./style.css";

const API = "http://localhost:5000/api";

function App() {
  const [user, setUser] = useState(JSON.parse(localStorage.getItem("user") || "null"));
  const [page, setPage] = useState("dashboard");

  if (!user) return <Login onLogin={setUser} />;

  return (
    <div className="app">
      <aside className="sidebar">
        <h1>CreatorHub</h1>
        <button onClick={() => setPage("dashboard")}><LayoutDashboard size={18}/> Dashboard</button>
        <button onClick={() => setPage("videos")}><Video size={18}/> Videos</button>
        <button onClick={() => setPage("ai")}><Wand2 size={18}/> AI Tools</button>
        <button onClick={() => setPage("planner")}><CalendarDays size={18}/> Planner</button>
        <button onClick={() => setPage("earnings")}><DollarSign size={18}/> Earnings</button>
        <button className="logout" onClick={() => { localStorage.clear(); location.reload(); }}>
          <LogOut size={18}/> Logout
        </button>
      </aside>

      <main className="main">
        <header className="topbar">
          <div>
            <h2>{page.toUpperCase()}</h2>
            <p>Welcome, {user.name}</p>
          </div>
          <span className="badge">Creator Studio</span>
        </header>

        {page === "dashboard" && <Dashboard />}
        {page === "videos" && <Videos />}
        {page === "ai" && <AITools />}
        {page === "planner" && <Planner />}
        {page === "earnings" && <Earnings />}
      </main>
    </div>
  );
}

function Login({ onLogin }) {
  const [email, setEmail] = useState("");

  async function submit(e) {
    e.preventDefault();
    const res = await fetch(`${API}/login`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email })
    });
    const data = await res.json();
    localStorage.setItem("user", JSON.stringify(data.user));
    onLogin(data.user);
  }

  return (
    <div className="login">
      <form onSubmit={submit} className="login-card">
        <h1>CreatorHub Studio</h1>
        <p>Login to manage your creator channel</p>
        <input placeholder="Email" value={email} onChange={e => setEmail(e.target.value)} />
        <input placeholder="Password" type="password" />
        <button>Login</button>
      </form>
    </div>
  );
}

function Dashboard() {
  const [data, setData] = useState(null);

  useEffect(() => {
    fetch(`${API}/dashboard`).then(r => r.json()).then(setData);
  }, []);

  if (!data) return <p>Loading...</p>;

  return (
    <>
      <div className="cards">
        <Card title="Subscribers" value={data.subscribers} />
        <Card title="Views" value={data.totalViews} />
        <Card title="Watch Time" value={data.watchTime} />
        <Card title="Earnings" value={`$${data.totalEarnings}`} />
      </div>
      <section className="panel">
        <h3>Weekly Views</h3>
        <ResponsiveContainer width="100%" height={300}>
          <BarChart data={data.chart}>
            <XAxis dataKey="day" />
            <YAxis />
            <Tooltip />
            <Bar dataKey="views" />
          </BarChart>
        </ResponsiveContainer>
      </section>
    </>
  );
}

function Card({ title, value }) {
  return (
    <div className="card">
      <p>{title}</p>
      <h2>{value}</h2>
    </div>
  );
}

function Videos() {
  const [videos, setVideos] = useState([]);
  const [form, setForm] = useState({ title: "", description: "" });

  const load = () => fetch(`${API}/videos`).then(r => r.json()).then(setVideos);
  useEffect(load, []);

  async function addVideo(e) {
    e.preventDefault();
    await fetch(`${API}/videos`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(form)
    });
    setForm({ title: "", description: "" });
    load();
  }

  async function remove(id) {
    await fetch(`${API}/videos/${id}`, { method: "DELETE" });
    load();
  }

  return (
    <>
      <form className="panel form" onSubmit={addVideo}>
        <input placeholder="Video title" value={form.title} onChange={e => setForm({...form, title: e.target.value})} required />
        <input placeholder="Description" value={form.description} onChange={e => setForm({...form, description: e.target.value})} />
        <button>Add Video</button>
      </form>

      <div className="grid">
        {videos.map(v => (
          <div className="video-card" key={v.id}>
            <img src={v.thumbnail} />
            <div>
              <h3>{v.title}</h3>
              <p>{v.description}</p>
              <small>{v.status} · {v.views} views · {v.likes} likes</small>
              <button className="danger" onClick={() => remove(v.id)}>Delete</button>
            </div>
          </div>
        ))}
      </div>
    </>
  );
}

function AITools() {
  const [topic, setTopic] = useState("");
  const [titles, setTitles] = useState([]);
  const [description, setDescription] = useState("");

  async function generateTitles() {
    const res = await fetch(`${API}/ai/title`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ topic })
    });
    const data = await res.json();
    setTitles(data.titles);
  }

  async function generateDescription() {
    const res = await fetch(`${API}/ai/description`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ topic })
    });
    const data = await res.json();
    setDescription(data.description);
  }

  return (
    <section className="panel">
      <h3>AI Creator Tools</h3>
      <input placeholder="Enter video topic" value={topic} onChange={e => setTopic(e.target.value)} />
      <div className="row">
        <button onClick={generateTitles}>Generate Titles</button>
        <button onClick={generateDescription}>Generate Description</button>
      </div>

      {titles.length > 0 && (
        <div>
          <h4>Title Ideas</h4>
          {titles.map(t => <p className="idea" key={t}>{t}</p>)}
        </div>
      )}

      {description && (
        <div>
          <h4>Description</h4>
          <pre>{description}</pre>
        </div>
      )}
    </section>
  );
}

function Planner() {
  const [items, setItems] = useState([]);
  const [form, setForm] = useState({ title: "", date: "" });

  const load = () => fetch(`${API}/planner`).then(r => r.json()).then(setItems);
  useEffect(load, []);

  async function add(e) {
    e.preventDefault();
    await fetch(`${API}/planner`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(form)
    });
    setForm({ title: "", date: "" });
    load();
  }

  async function remove(id) {
    await fetch(`${API}/planner/${id}`, { method: "DELETE" });
    load();
  }

  return (
    <section className="panel">
      <form className="form" onSubmit={add}>
        <input placeholder="Task" value={form.title} onChange={e => setForm({...form, title: e.target.value})} required />
        <input type="date" value={form.date} onChange={e => setForm({...form, date: e.target.value})} required />
        <button>Add Task</button>
      </form>
      {items.map(i => (
        <div className="list-item" key={i.id}>
          <span>{i.title} — {i.date}</span>
          <button className="danger" onClick={() => remove(i.id)}>Delete</button>
        </div>
      ))}
    </section>
  );
}

function Earnings() {
  const [items, setItems] = useState([]);
  const [form, setForm] = useState({ source: "", amount: "", date: "" });

  const load = () => fetch(`${API}/earnings`).then(r => r.json()).then(setItems);
  useEffect(load, []);

  async function add(e) {
    e.preventDefault();
    await fetch(`${API}/earnings`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(form)
    });
    setForm({ source: "", amount: "", date: "" });
    load();
  }

  const total = items.reduce((sum, item) => sum + Number(item.amount), 0);

  return (
    <section className="panel">
      <h3>Total Earnings: ${total}</h3>
      <form className="form" onSubmit={add}>
        <input placeholder="Source" value={form.source} onChange={e => setForm({...form, source: e.target.value})} required />
        <input placeholder="Amount" type="number" value={form.amount} onChange={e => setForm({...form, amount: e.target.value})} required />
        <input type="date" value={form.date} onChange={e => setForm({...form, date: e.target.value})} required />
        <button>Add Earning</button>
      </form>
      {items.map(i => (
        <div className="list-item" key={i.id}>
          <span>{i.source} — ${i.amount} — {i.date}</span>
        </div>
      ))}
    </section>
  );
}

createRoot(document.getElementById("root")).render(<App />);
