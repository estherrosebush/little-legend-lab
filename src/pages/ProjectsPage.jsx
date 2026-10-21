import { useState } from 'react';
import { useAppState } from '../context/AppState.jsx';
import { formatDay } from '../lib/api.js';

const SUBJECTS = ['Math', 'Reading', 'Writing', 'Science', 'History', 'Art', 'Music', 'Coding', 'Life skills', 'Other'];
const COLUMNS = [
  { id: 'planned', title: 'Idea shelf', accent: 'purple' },
  { id: 'active', title: 'In progress', accent: 'blue' },
  { id: 'done', title: 'Finished!', accent: 'green' }
];
const NEXT_STATUS = { planned: 'active', active: 'done', done: 'planned' };
const STATUS_LABEL = { planned: 'Shelve it', active: 'Mark finished', done: 'Back to ideas' };

export function ProjectsPage() {
  const { projects, addProject, updateProject, deleteProject, status } = useAppState();
  const [form, setForm] = useState({ title: '', subject: 'Other', description: '' });
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState('');

  const handleSubmit = async (event) => {
    event.preventDefault();
    if (!form.title.trim()) return;
    setBusy(true);
    setMessage('');
    try {
      await addProject(form);
      setForm({ title: '', subject: 'Other', description: '' });
      setMessage('Project added!');
    } catch (err) {
      setMessage(err.message);
    } finally {
      setBusy(false);
    }
  };

  const advance = async (project) => {
    try {
      await updateProject(project.id, { status: NEXT_STATUS[project.status] || 'planned' });
    } catch (err) {
      setMessage(err.message);
    }
  };

  if (status === 'loading') return <p className="loading-note">Loading your projects…</p>;

  return (
    <div className="content-grid single-column">
      <section className="panel">
        <p className="eyebrow">Project organizer</p>
        <h2>Every big idea gets a home.</h2>

        <form className="form-stack project-form" onSubmit={handleSubmit}>
          <div className="inline-fields">
            <label>
              Project name
              <input
                value={form.title}
                onChange={(event) => setForm({ ...form, title: event.target.value })}
                placeholder="Build a volcano model"
              />
            </label>
            <label>
              Subject
              <select
                value={form.subject}
                onChange={(event) => setForm({ ...form, subject: event.target.value })}
              >
                {SUBJECTS.map((item) => (
                  <option key={item} value={item}>{item}</option>
                ))}
              </select>
            </label>
          </div>
          <label>
            Notes
            <textarea
              value={form.description}
              onChange={(event) => setForm({ ...form, description: event.target.value })}
              placeholder="What do you need? What does done look like?"
            />
          </label>
          <button type="submit" disabled={busy}>+ Add project</button>
          {message && <p className="feedback-note">{message}</p>}
        </form>
      </section>

      <div className="project-board">
        {COLUMNS.map((column) => {
          const items = projects.filter((project) => project.status === column.id);
          return (
            <section key={column.id} className={`panel project-column ${column.accent}`}>
              <p className="eyebrow">{column.title} ({items.length})</p>
              {items.length === 0 ? (
                <p className="muted-note">Nothing here yet.</p>
              ) : (
                <div className="project-list">
                  {items.map((project) => (
                    <article key={project.id} className="project-card">
                      <div className="project-top">
                        <h3>{project.title}</h3>
                        {project.subject && <span className="pill">{project.subject}</span>}
                      </div>
                      {project.description && <p>{project.description}</p>}
                      <footer className="project-foot">
                        <small>added {formatDay(project.createdAt)}</small>
                        <div className="project-actions">
                          <button className="secondary" onClick={() => advance(project)}>
                            {STATUS_LABEL[project.status]}
                          </button>
                          <button className="secondary" onClick={() => deleteProject(project.id)} aria-label="Delete project">
                            ✕
                          </button>
                        </div>
                      </footer>
                    </article>
                  ))}
                </div>
              )}
            </section>
          );
        })}
      </div>
    </div>
  );
}
