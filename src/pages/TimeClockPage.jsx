import { useEffect, useState } from 'react';
import { useAppState } from '../context/AppState.jsx';
import { computeHourTotals, formatClock, formatDay, formatMinutes } from '../lib/api.js';

const SUBJECTS = ['Math', 'Reading', 'Writing', 'Science', 'History', 'Art', 'Music', 'Coding', 'Life skills', 'Other'];

function useElapsed(open) {
  const [now, setNow] = useState(Date.now());
  useEffect(() => {
    if (!open) return undefined;
    setNow(Date.now());
    const timer = setInterval(() => setNow(Date.now()), 30000);
    return () => clearInterval(timer);
  }, [open]);
  if (!open) return '';
  const minutes = Math.max(0, Math.round((now - new Date(open.startedAt).getTime()) / 60000));
  return formatMinutes(minutes);
}

export function TimeClockPage() {
  const { hours, clockIn, clockOut, deleteEntry, status } = useAppState();
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState('');
  const [note, setNote] = useState('');
  const [subject, setSubject] = useState('');
  const open = hours.open;
  const elapsed = useElapsed(open);
  const totals = computeHourTotals(hours.entries);

  const handleClockIn = async () => {
    setBusy(true);
    setMessage('');
    try {
      await clockIn(subject);
      setMessage('Clocked in — the timer is running!');
    } catch (err) {
      setMessage(err.message);
    } finally {
      setBusy(false);
    }
  };

  const handleClockOut = async () => {
    setBusy(true);
    setMessage('');
    try {
      const entry = await clockOut({ note, subject });
      setMessage(`Session saved — ${formatMinutes(entry.minutes || 0)} logged!`);
      setNote('');
    } catch (err) {
      setMessage(err.message);
    } finally {
      setBusy(false);
    }
  };

  if (status === 'loading') return <p className="loading-note">Loading your time clock…</p>;

  return (
    <div className="content-grid single-column">
      <section className="panel clock-panel">
        <p className="eyebrow">Homeschool time clock</p>
        <h2>{open ? 'The timer is running. You’ve got this!' : 'Ready to start learning?'}</h2>

        <div className="clock-live">
          {open ? (
            <div className="clock-live-card">
              <span className="timer-clock">{elapsed}</span>
              <p>since {formatClock(open.startedAt)}</p>
            </div>
          ) : (
            <div className="clock-live-card">
              <span className="timer-clock">—</span>
              <p>not clocked in yet</p>
            </div>
          )}
          <div className="clock-totals">
            <div className="stat-chip">
              <strong>{formatMinutes(totals.todayMinutes)}</strong>
              <span>today</span>
            </div>
            <div className="stat-chip">
              <strong>{formatMinutes(totals.weekMinutes)}</strong>
              <span>last 7 days</span>
            </div>
            <div className="stat-chip">
              <strong>{formatMinutes(totals.totalMinutes)}</strong>
              <span>all time</span>
            </div>
          </div>
        </div>

        <div className="clock-controls">
          <div className="inline-fields">
            <label>
              Subject (optional)
              <select value={subject} onChange={(event) => setSubject(event.target.value)}>
                <option value="">—</option>
                {SUBJECTS.map((item) => (
                  <option key={item} value={item}>{item}</option>
                ))}
              </select>
            </label>
            <label>
              What are you working on? (optional)
              <input
                value={note}
                onChange={(event) => setNote(event.target.value)}
                placeholder="Fractions chapter 4, owl pellet dissection…"
                disabled={Boolean(open)}
              />
            </label>
          </div>
          <div className="clock-buttons">
            <button onClick={handleClockIn} disabled={busy || Boolean(open)}>
              ⏱ Clock in
            </button>
            <button className="secondary" onClick={handleClockOut} disabled={busy || !open}>
              ⏹ Clock out & save
            </button>
          </div>
          {message && <p className="feedback-note">{message}</p>}
        </div>
      </section>

      <section className="panel">
        <p className="eyebrow">Learning log</p>
        <h2>Recent sessions</h2>
        {hours.entries.filter((entry) => entry.endedAt).length === 0 ? (
          <p className="muted-note">No sessions yet — clock in to start your log.</p>
        ) : (
          <div className="entry-list">
            {hours.entries
              .filter((entry) => entry.endedAt)
              .map((entry) => (
                <div key={entry.id} className="entry-row">
                  <div className="entry-main">
                    <strong>
                      {formatDay(entry.startedAt)} · {formatClock(entry.startedAt)} – {formatClock(entry.endedAt)}
                    </strong>
                    <span>
                      {[entry.subject, entry.note].filter(Boolean).join(' — ') || 'Learning time'}
                    </span>
                  </div>
                  <span className="reward-badge">{formatMinutes(entry.minutes)}</span>
                  <button className="secondary entry-delete" onClick={() => deleteEntry(entry.id)} aria-label="Delete entry">
                    ✕
                  </button>
                </div>
              ))}
          </div>
        )}
      </section>
    </div>
  );
}
