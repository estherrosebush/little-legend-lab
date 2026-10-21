import { useEffect, useMemo, useState } from 'react';
import { useAppState } from '../context/AppState.jsx';

const KIND_META = {
  event: { label: 'Event', icon: '📌', color: '#7cc6ff' },
  activity: { label: 'Activity', icon: '🏃', color: '#7ddf8b' },
  goal: { label: 'Goal', icon: '🎯', color: '#ffd166' }
};

function todayKey() {
  const now = new Date();
  const month = `${now.getMonth() + 1}`.padStart(2, '0');
  const day = `${now.getDate()}`.padStart(2, '0');
  return `${now.getFullYear()}-${month}-${day}`;
}

function addDays(date, amount) {
  const next = new Date(date);
  next.setDate(next.getDate() + amount);
  return next;
}

function dayKey(date) {
  const month = `${date.getMonth() + 1}`.padStart(2, '0');
  const day = `${date.getDate()}`.padStart(2, '0');
  return `${date.getFullYear()}-${month}-${day}`;
}

export function CalendarPage() {
  const { calendar, classrooms, createCalendarItem, updateCalendarItem, deleteCalendarItem, refreshCalendar, status } =
    useAppState();
  const [weekOffset, setWeekOffset] = useState(0);
  const [now, setNow] = useState(() => new Date());
  const [form, setForm] = useState({
    title: '',
    kind: 'event',
    date: todayKey(),
    time: '',
    classroomId: ''
  });
  const [error, setError] = useState('');
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    const tick = setInterval(() => setNow(new Date()), 30000);
    return () => clearInterval(tick);
  }, []);

  useEffect(() => {
    if (status !== 'ready') return undefined;
    const poll = setInterval(() => {
      refreshCalendar().catch(() => undefined);
    }, 60000);
    return () => clearInterval(poll);
  }, [status, refreshCalendar]);

  const weekStart = useMemo(() => {
    const base = addDays(new Date(), weekOffset * 7);
    const day = base.getDay();
    const sunday = addDays(base, -day);
    sunday.setHours(0, 0, 0, 0);
    return sunday;
  }, [weekOffset]);

  const weekDays = useMemo(
    () => Array.from({ length: 7 }, (_, index) => addDays(weekStart, index)),
    [weekStart]
  );

  const byDay = useMemo(() => {
    const map = new Map();
    for (const day of weekDays) map.set(dayKey(day), []);
    for (const item of calendar) {
      if (map.has(item.date)) map.get(item.date).push(item);
    }
    return map;
  }, [calendar, weekDays]);

  const openGoals = calendar.filter((item) => item.kind === 'goal' && item.done !== 'yes');
  const doneGoals = calendar.filter((item) => item.kind === 'goal' && item.done === 'yes');

  const handleCreate = async (event) => {
    event.preventDefault();
    setError('');
    if (!form.title.trim()) {
      setError('Give it a title.');
      return;
    }
    setSaving(true);
    try {
      await createCalendarItem({
        title: form.title,
        kind: form.kind,
        date: form.date,
        time: form.time,
        classroomId: form.classroomId ? Number(form.classroomId) : null
      });
      setForm({ ...form, title: '', time: '' });
    } catch (err) {
      setError(err.message);
    } finally {
      setSaving(false);
    }
  };

  const handleQuickAddToDay = async (date) => {
    const title = window.prompt('What is happening on this day?');
    if (!title || !title.trim()) return;
    try {
      await createCalendarItem({ title, kind: 'event', date, time: '' });
    } catch (err) {
      setError(err.message);
    }
  };

  const toggleDone = async (item) => {
    await updateCalendarItem(item.id, { done: item.done === 'yes' ? 'no' : 'yes' });
  };

  const removeItem = async (item) => {
    await deleteCalendarItem(item.id);
  };

  const todayToday = todayKey();

  return (
    <div className="content-grid single-column">
      <section className="panel">
        <div className="calendar-head">
          <div>
            <p className="eyebrow">Live calendar</p>
            <h2>Your week at a glance</h2>
            <small className="muted-note">
              Updated {now.toLocaleTimeString([], { hour: 'numeric', minute: '2-digit' })} · refreshes automatically
            </small>
          </div>
          <div className="week-nav">
            <button className="secondary" onClick={() => setWeekOffset((w) => w - 1)}>← Last week</button>
            <button className="secondary" onClick={() => setWeekOffset(0)}>This week</button>
            <button className="secondary" onClick={() => setWeekOffset((w) => w + 1)}>Next week →</button>
          </div>
        </div>

        <form className="form-stack calendar-create" onSubmit={handleCreate}>
          <div className="inline-fields">
            <label>
              What is it?
              <input
                value={form.title}
                onChange={(event) => setForm({ ...form, title: event.target.value })}
                placeholder="Book report due, soccer game…"
              />
            </label>
            <label>
              Kind
              <select value={form.kind} onChange={(event) => setForm({ ...form, kind: event.target.value })}>
                <option value="event">Event</option>
                <option value="activity">Activity</option>
                <option value="goal">Goal</option>
              </select>
            </label>
          </div>
          <div className="inline-fields">
            <label>
              Date
              <input
                type="date"
                value={form.date}
                onChange={(event) => setForm({ ...form, date: event.target.value })}
              />
            </label>
            <label>
              Time (optional)
              <input
                type="time"
                value={form.time}
                onChange={(event) => setForm({ ...form, time: event.target.value })}
              />
            </label>
            <label>
              Subject (optional)
              <select
                value={form.classroomId}
                onChange={(event) => setForm({ ...form, classroomId: event.target.value })}
              >
                <option value="">— none —</option>
                {classrooms.map((room) => (
                  <option key={room.id} value={room.id}>{room.emoji} {room.name}</option>
                ))}
              </select>
            </label>
          </div>
          <button type="submit" disabled={saving}>{saving ? 'Adding…' : 'Add to calendar'}</button>
          {error && <p className="feedback-note">{error}</p>}
        </form>
      </section>

      <section className="panel">
        <h3>🎯 Goals board</h3>
        {openGoals.length === 0 && doneGoals.length === 0 && (
          <p className="muted-note">No goals yet — add one above to start tracking something big.</p>
        )}
        <div className="goal-progress">
          {doneGoals.length + openGoals.length > 0 && (
            <>
              <div className="goal-bar">
                <span style={{ width: `${(doneGoals.length / (doneGoals.length + openGoals.length)) * 100}%` }} />
              </div>
              <small>{doneGoals.length} of {doneGoals.length + openGoals.length} goals crushed</small>
            </>
          )}
        </div>
        <ul className="calendar-item-list">
          {openGoals.map((item) => (
            <CalendarRow key={item.id} item={item} onToggle={toggleDone} onRemove={removeItem} />
          ))}
          {doneGoals.map((item) => (
            <CalendarRow key={item.id} item={item} onToggle={toggleDone} onRemove={removeItem} />
          ))}
        </ul>
      </section>

      <div className="week-grid">
        {weekDays.map((day) => {
          const key = dayKey(day);
          const items = byDay.get(key) || [];
          const isToday = key === todayToday;
          return (
            <section key={key} className={`panel day-card ${isToday ? 'today' : ''}`}>
              <header className="day-head">
                <div>
                  <strong>{day.toLocaleDateString([], { weekday: 'short' })}</strong>
                  <small>{day.toLocaleDateString([], { month: 'short', day: 'numeric' })}</small>
                </div>
                {isToday && <span className="pill today-pill">Today</span>}
                <button
                  className="secondary add-day"
                  onClick={() => handleQuickAddToDay(key)}
                  aria-label={`Add something on ${key}`}
                >
                  +
                </button>
              </header>
              {items.length === 0 ? (
                <p className="muted-note">Nothing planned.</p>
              ) : (
                <ul className="calendar-item-list compact">
                  {items.map((item) => (
                    <CalendarRow key={item.id} item={item} onToggle={toggleDone} onRemove={removeItem} compact />
                  ))}
                </ul>
              )}
            </section>
          );
        })}
      </div>
    </div>
  );
}

function CalendarRow({ item, onToggle, onRemove, compact }) {
  const { classrooms } = useAppState();
  const meta = KIND_META[item.kind] || KIND_META.event;
  const room = classrooms.find((classroom) => classroom.id === item.classroomId);

  return (
    <li className={`calendar-row ${item.done === 'yes' ? 'done' : ''} ${compact ? 'compact' : ''}`}>
      <div className="calendar-row-main">
        <button
          className="calendar-check"
          onClick={() => onToggle(item)}
          aria-label={item.done === 'yes' ? 'Mark as not done' : 'Mark as done'}
        >
          {item.done === 'yes' ? '✓' : ''}
        </button>
        <div>
          <strong>{item.title}</strong>
          <span className="calendar-meta">
            {item.time && <span>🕒 {item.time}</span>}
            <span style={{ color: meta.color }}>{meta.icon} {meta.label}</span>
            {room && <span>{room.emoji} {room.name}</span>}
          </span>
        </div>
      </div>
      <button className="secondary" onClick={() => onRemove(item)} aria-label={`Remove ${item.title}`}>
        ✕
      </button>
    </li>
  );
}
