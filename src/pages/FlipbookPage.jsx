import { useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { useAppState } from '../context/AppState.jsx';
import { CreatureRender } from '../lib/creature.jsx';
import { findScene } from '../lib/catalog.js';
import { computeYearSummary, formatDayLong, formatMinutes } from '../lib/api.js';

function SummaryRows({ summary }) {
  const rows = [
    ['Learning time logged', formatMinutes(summary.totalMinutes)],
    ['Sessions completed', summary.entriesCount],
    ['Quests finished', `${summary.questsDone} of ${summary.questsTotal ?? '—'}`],
    ['Projects finished', summary.projectsDone],
    ['Stars earned', `⭐ ${summary.starsEarned}`],
    ['Stars spent in the shop', `⭐ ${summary.starsSpent}`],
    ['Badges earned', summary.badges]
  ];
  return (
    <ul className="summary-rows">
      {rows.map(([label, value]) => (
        <li key={label}>
          <span>{label}</span>
          <strong>{value}</strong>
        </li>
      ))}
    </ul>
  );
}

function NotesEditor({ snapshot, onSave }) {
  const [notes, setNotes] = useState(snapshot.notes || '');
  const [saved, setSaved] = useState(false);
  const [busy, setBusy] = useState(false);

  const save = async () => {
    setBusy(true);
    try {
      await onSave(snapshot.id, { notes });
      setSaved(true);
      setTimeout(() => setSaved(false), 2200);
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="notes-editor">
      <label>
        My notes about this era
        <textarea
          value={notes}
          onChange={(event) => setNotes(event.target.value)}
          placeholder="What was this season like? What did I love? What do I want to remember?"
        />
      </label>
      <div className="notes-actions">
        <button className="secondary" onClick={save} disabled={busy}>
          {busy ? 'Saving…' : 'Save notes'}
        </button>
        {saved && <span className="saved-note">Saved ✓</span>}
      </div>
    </div>
  );
}

export function FlipbookPage({ chores, stickers }) {
  const {
    status,
    profile,
    backgrounds,
    snapshots,
    hours,
    projects,
    captureSnapshot,
    updateSnapshot,
    deleteSnapshot
  } = useAppState();
  const [page, setPage] = useState(-1);
  const [flip, setFlip] = useState('');
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState('');

  const backgroundById = useMemo(() => {
    const map = new Map();
    for (const bg of backgrounds) map.set(bg.id, `/api/background-image/${bg.id}`);
    return map;
  }, [backgrounds]);

  const pages = snapshots.length + 1; // + cover
  const indexToSnapshot = (index) => snapshots[index - 1];

  const turn = (direction) => {
    const next = Math.max(-1, Math.min(pages - 1, page + direction));
    if (next === page) return;
    setFlip(direction > 0 ? 'flip-forward' : 'flip-back');
    setPage(next);
    setTimeout(() => setFlip(''), 450);
  };

  const createYearReview = async () => {
    setBusy(true);
    setMessage('');
    try {
      await captureSnapshot({
        label: `Year in review — ${new Date().getFullYear()}`,
        kind: 'year',
        data: {
          creatureName: profile?.creatureName,
          species: profile?.species,
          color: profile?.color,
          scene: profile?.scene,
          equipped: profile?.equipped,
          backgroundId: profile?.backgroundId
        },
        summary: computeYearSummary({ entries: hours.entries, projects, profile, stickers })
      });
      setMessage('Year in review page created!');
      setPage(snapshots.length);
    } catch (err) {
      setMessage(err.message);
    } finally {
      setBusy(false);
    }
  };

  if (status === 'loading') return <p className="loading-note">Opening the Yearbook…</p>;

  const snapshot = indexToSnapshot(page);
  const yearSnapshots = snapshots.filter((s) => s.kind === 'year');

  return (
    <div className="content-grid single-column">
      <section className="panel yearbook-head">
        <div>
          <p className="eyebrow">Yearbook</p>
          <h2>The flipbook of every version of you.</h2>
          <p className="muted-note">
            Capture eras from your <Link to="/pet">creature page</Link> — then flip back through your year
            with summaries and notes.
          </p>
        </div>
        <div className="yearbook-actions">
          <button onClick={createYearReview} disabled={busy || !profile}>
            {busy ? 'Building…' : '✨ Create year-in-review page'}
          </button>
          {yearSnapshots.length > 0 && (
            <button
              className="secondary"
              onClick={() => {
                setFlip('flip-forward');
                setPage(snapshots.indexOf(yearSnapshots[yearSnapshots.length - 1]) + 1);
                setTimeout(() => setFlip(''), 450);
              }}
            >
              Jump to review
            </button>
          )}
        </div>
        {message && <p className="feedback-note">{message}</p>}
      </section>

      <div className={`flipbook ${flip}`}>
        {snapshot ? (
          <div className="flip-spread" key={snapshot.id}>
            <div className="flip-page flip-left">
              <p className="eyebrow">{snapshot.kind === 'year' ? 'Year in review' : 'Creature era'}</p>
              <h3>{snapshot.label || formatDayLong(snapshot.createdAt)}</h3>
              <small className="flip-date">{formatDayLong(snapshot.createdAt)}</small>
              <div className="flip-creature">
                <CreatureStageLite data={snapshot.data} backgroundUrl={snapshot.data?.backgroundId ? backgroundById.get(snapshot.data.backgroundId) : null} />
              </div>
            </div>
            <div className="flip-page flip-right">
              <p className="eyebrow">Progress summary</p>
              <SummaryRows summary={snapshot.summary || {}} />
              {snapshot.kind === 'year' && snapshot.summary?.byMonth?.length > 0 && (
                <div className="month-bars">
                  {snapshot.summary.byMonth.map((month) => (
                    <div key={month.label} className="month-bar-row">
                      <span>{month.label}</span>
                      <div className="month-bar-track">
                        <div
                          className="month-bar-fill"
                          style={{ width: `${Math.min(100, Math.round((month.minutes / Math.max(1, ...snapshot.summary.byMonth.map((m) => m.minutes))) * 100))}%` }}
                        />
                      </div>
                      <small>{formatMinutes(month.minutes)}</small>
                    </div>
                  ))}
                </div>
              )}
              {snapshot.kind === 'year' && snapshot.summary?.completedProjects?.length > 0 && (
                <div className="done-projects">
                  <p className="eyebrow">Projects finished this year</p>
                  <ul>
                    {snapshot.summary.completedProjects.map((title) => (
                      <li key={title}>{title}</li>
                    ))}
                  </ul>
                </div>
              )}
              <NotesEditor snapshot={snapshot} onSave={updateSnapshot} />
              <button className="secondary flip-delete" onClick={() => deleteSnapshot(snapshot.id)}>
                Remove this page
              </button>
            </div>
          </div>
        ) : (
          <div className="flip-spread flip-cover">
            <div className="flip-page flip-left cover-left">
              <p className="eyebrow">Legend Lab</p>
              <h2 className="cover-title">{profile?.creatureName ? `${profile.creatureName}'s Yearbook` : 'My Yearbook'}</h2>
              <p className="cover-year">{new Date().getFullYear()}</p>
              {profile && (
                <div className="cover-creature">
                  <CreatureRender species={profile.species} color={profile.color} equipped={profile.equipped} size={220} />
                </div>
              )}
            </div>
            <div className="flip-page flip-right">
              <p className="eyebrow">How this works</p>
              <ol className="mini-list">
                <li>Build your creature and give it accessories from the Star Shop.</li>
                <li>Capture an "era" whenever you grow or change — a new look, a new season.</li>
                <li>At the end of the year, create the year-in-review page.</li>
                <li>Flip through the book anytime to remember every version of you.</li>
              </ol>
              {snapshots.length === 0 ? (
                <div className="cover-cta">
                  <p className="muted-note">No pages yet — capture your first era to start the book!</p>
                  <Link className="ghost-link" to="/pet">Go capture an era →</Link>
                </div>
              ) : (
                <button onClick={() => turn(1)}>Open the book →</button>
              )}
            </div>
          </div>
        )}
      </div>

      <div className="flip-controls">
        <button className="secondary" onClick={() => turn(-1)} disabled={page === -1}>
          ← Back
        </button>
        <span className="flip-indicator">
          {page === -1 ? 'Cover' : `Page ${page} of ${pages - 1}`}
        </span>
        <button className="secondary" onClick={() => turn(1)} disabled={page >= pages - 1}>
          Next →
        </button>
      </div>
    </div>
  );
}

function CreatureStageLite({ data, backgroundUrl }) {
  const scene = findScene(data?.scene);
  return (
    <div className="creature-stage flip-stage" style={{ height: 300, ...(backgroundUrl ? {} : { background: scene.css }) }}>
      {backgroundUrl && <img src={backgroundUrl} alt="" className="creature-photo-bg" />}
      <CreatureRender
        species={data?.species}
        color={data?.color}
        equipped={data?.equipped || []}
        size={230}
        className="creature-main"
      />
    </div>
  );
}
