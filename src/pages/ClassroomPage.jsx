import { useState } from 'react';
import { useAppState } from '../context/AppState.jsx';

const EMOJI_CHOICES = ['📘', '➗', '🔬', '🌍', '🎨', '🎵', '🏃', '💻', '🗣️', '🧩'];
const COLOR_CHOICES = ['#b98cff', '#7cc6ff', '#7ddf8b', '#ffd166', '#ff7ca8', '#ff9a62'];

const DEFAULT_SUBJECTS = [
  { name: 'Math', emoji: '➗', color: '#7cc6ff' },
  { name: 'Reading', emoji: '📘', color: '#ffd166' },
  { name: 'Science', emoji: '🔬', color: '#7ddf8b' },
  { name: 'History', emoji: '🌍', color: '#ff9a62' },
  { name: 'Art', emoji: '🎨', color: '#ff7ca8' },
  { name: 'Writing', emoji: '🗣️', color: '#b98cff' }
];

function LinkForm({ onAdd }) {
  const [label, setLabel] = useState('');
  const [url, setUrl] = useState('');
  const [busy, setBusy] = useState(false);

  const handleSubmit = async (event) => {
    event.preventDefault();
    if (!label.trim() || !url.trim() || busy) return;
    setBusy(true);
    try {
      await onAdd({ label, url });
      setLabel('');
      setUrl('');
    } finally {
      setBusy(false);
    }
  };

  return (
    <form className="classroom-inline-form" onSubmit={handleSubmit}>
      <input
        value={label}
        onChange={(event) => setLabel(event.target.value)}
        placeholder="Link name — e.g. Khan Academy"
        aria-label="Link name"
      />
      <input
        value={url}
        onChange={(event) => setUrl(event.target.value)}
        placeholder="khanacademy.org"
        aria-label="Link URL"
      />
      <button type="submit" disabled={busy}>Add link</button>
    </form>
  );
}

function ActivityForm({ onAdd }) {
  const [title, setTitle] = useState('');
  const [busy, setBusy] = useState(false);

  const handleSubmit = async (event) => {
    event.preventDefault();
    if (!title.trim() || busy) return;
    setBusy(true);
    try {
      await onAdd({ title });
      setTitle('');
    } finally {
      setBusy(false);
    }
  };

  return (
    <form className="classroom-inline-form" onSubmit={handleSubmit}>
      <input
        value={title}
        onChange={(event) => setTitle(event.target.value)}
        placeholder="New activity or assignment…"
        aria-label="Activity title"
      />
      <button type="submit" disabled={busy}>Add activity</button>
    </form>
  );
}

function ClassroomCard({ room }) {
  const {
    updateClassroom,
    deleteClassroom,
    addClassroomLink,
    deleteClassroomLink,
    addClassroomActivity,
    toggleClassroomActivity,
    deleteClassroomActivity
  } = useAppState();
  const [expanded, setExpanded] = useState(true);
  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState({ name: room.name, emoji: room.emoji, color: room.color });
  const doneCount = room.activities.filter((activity) => activity.status === 'done').length;

  const saveEdits = async () => {
    await updateClassroom(room.id, draft);
    setEditing(false);
  };

  return (
    <section className="panel classroom-card" style={{ '--room-color': room.color }}>
      <header className="classroom-head">
        <button
          className="classroom-title"
          onClick={() => setExpanded((current) => !current)}
          aria-expanded={expanded}
        >
          <span className="classroom-emoji">{room.emoji}</span>
          <span>
            <strong>{room.name}</strong>
            <small>
              {room.links.length} link{room.links.length === 1 ? '' : 's'} · {doneCount}/{room.activities.length} activities done
            </small>
          </span>
          <span className="classroom-caret" aria-hidden="true">{expanded ? '▾' : '▸'}</span>
        </button>
        <div className="classroom-actions">
          <button className="secondary" onClick={() => setEditing((current) => !current)}>
            {editing ? 'Cancel' : 'Edit'}
          </button>
          <button
            className="secondary danger"
            onClick={() => {
              if (window.confirm(`Delete the ${room.name} classroom, including its links and activities?`)) {
                deleteClassroom(room.id);
              }
            }}
          >
            Delete
          </button>
        </div>
      </header>

      {editing && (
        <div className="classroom-edit">
          <input
            value={draft.name}
            onChange={(event) => setDraft({ ...draft, name: event.target.value })}
            placeholder="Subject name"
          />
          <div className="classroom-pickers">
            <div className="picker-row">
              {EMOJI_CHOICES.map((emoji) => (
                <button
                  key={emoji}
                  type="button"
                  className={`picker-dot ${draft.emoji === emoji ? 'picked' : ''}`}
                  onClick={() => setDraft({ ...draft, emoji })}
                >
                  {emoji}
                </button>
              ))}
            </div>
            <div className="picker-row">
              {COLOR_CHOICES.map((color) => (
                <button
                  key={color}
                  type="button"
                  aria-label={`Pick ${color}`}
                  className={`picker-dot ${draft.color === color ? 'picked' : ''}`}
                  style={{ background: color }}
                  onClick={() => setDraft({ ...draft, color })}
                />
              ))}
            </div>
          </div>
          <button onClick={saveEdits}>Save changes</button>
        </div>
      )}

      {expanded && (
        <div className="classroom-body">
          <h4>Class links</h4>
          {room.links.length ? (
            <ul className="link-list">
              {room.links.map((link) => (
                <li key={link.id}>
                  <a href={link.url} target="_blank" rel="noreferrer">🔗 {link.label}</a>
                  <button
                    className="secondary"
                    onClick={() => deleteClassroomLink(room.id, link.id)}
                    aria-label={`Remove ${link.label}`}
                  >
                    ✕
                  </button>
                </li>
              ))}
            </ul>
          ) : (
            <p className="muted-note">No links yet — add websites you use for this subject.</p>
          )}
          <LinkForm onAdd={(data) => addClassroomLink(room.id, data)} />

          <h4>Activities &amp; assignments</h4>
          {room.activities.length ? (
            <ul className="activity-list">
              {room.activities.map((activity) => (
                <li key={activity.id} className={activity.status === 'done' ? 'done' : ''}>
                  <label>
                    <input
                      type="checkbox"
                      checked={activity.status === 'done'}
                      onChange={() =>
                        toggleClassroomActivity(
                          room.id,
                          activity.id,
                          activity.status === 'done' ? 'todo' : 'done'
                        )
                      }
                    />
                    <span>{activity.title}</span>
                  </label>
                  <button
                    className="secondary"
                    onClick={() => deleteClassroomActivity(room.id, activity.id)}
                    aria-label={`Remove ${activity.title}`}
                  >
                    ✕
                  </button>
                </li>
              ))}
            </ul>
          ) : (
            <p className="muted-note">No activities yet — add work for this subject.</p>
          )}
          <ActivityForm onAdd={(data) => addClassroomActivity(room.id, data)} />
        </div>
      )}
    </section>
  );
}

export function ClassroomPage() {
  const { classrooms, createClassroom } = useAppState();
  const [newRoom, setNewRoom] = useState({ name: '', emoji: '📘', color: '#b98cff' });
  const [error, setError] = useState('');

  const handleCreate = async (event) => {
    event.preventDefault();
    setError('');
    if (!newRoom.name.trim()) {
      setError('Give your classroom a name.');
      return;
    }
    try {
      await createClassroom(newRoom);
      setNewRoom({ name: '', emoji: '📘', color: '#b98cff' });
    } catch (err) {
      setError(err.message);
    }
  };

  return (
    <div className="content-grid single-column">
      <section className="panel">
        <p className="eyebrow">Digital classrooms</p>
        <h2>Every subject, its own room.</h2>
        <p className="muted-note">
          Set up each subject with its own look, links, and activities — like having a locker for
          every class.
        </p>

        <form className="form-stack classroom-create" onSubmit={handleCreate}>
          <div className="inline-fields">
            <label>
              Subject name
              <input
                value={newRoom.name}
                onChange={(event) => setNewRoom({ ...newRoom, name: event.target.value })}
                placeholder="Math, Science, Piano…"
              />
            </label>
            <label>
              Pick an icon
              <select
                value={newRoom.emoji}
                onChange={(event) => setNewRoom({ ...newRoom, emoji: event.target.value })}
              >
                {EMOJI_CHOICES.map((emoji) => (
                  <option key={emoji} value={emoji}>{emoji}</option>
                ))}
              </select>
            </label>
          </div>
          <div className="picker-row">
            {COLOR_CHOICES.map((color) => (
              <button
                key={color}
                type="button"
                aria-label={`Pick ${color}`}
                className={`picker-dot ${newRoom.color === color ? 'picked' : ''}`}
                style={{ background: color }}
                onClick={() => setNewRoom({ ...newRoom, color })}
              />
            ))}
          </div>
          <button type="submit">Create classroom</button>
          {error && <p className="feedback-note">{error}</p>}
        </form>

        {!classrooms.length && (
          <div className="starter-rooms">
            <p>Quick start — tap a subject to create it:</p>
            <div className="picker-row wrap">
              {DEFAULT_SUBJECTS.map((subject) => (
                <button
                  key={subject.name}
                  className="starter-chip"
                  onClick={() => createClassroom(subject)}
                >
                  {subject.emoji} {subject.name}
                </button>
              ))}
            </div>
          </div>
        )}
      </section>

      {classrooms.map((room) => (
        <ClassroomCard key={room.id} room={room} />
      ))}
    </div>
  );
}
