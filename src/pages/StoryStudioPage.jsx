import { useEffect, useMemo, useRef, useState } from 'react';
import { useAppState } from '../context/AppState.jsx';
import { formatDayLong } from '../lib/api.js';

const IDEA_PROMPTS = [
  'A character who can only tell the truth on Tuesdays…',
  'The library where every book is a door…',
  'What if the family pet could talk for one day?',
  'A map that redraws itself every night…',
  'Two rivals forced to work on the same project…',
  'A letter arrives from the future…',
  'The day gravity got 10% weaker…',
  'A town where everyone keeps one big secret…'
];

const STARTER_SECTIONS = [
  { label: 'Chapter 1', hint: 'Set the scene. Where are we, and who are we following?' },
  { label: 'Chapter 2', hint: 'Give your hero a problem worth solving.' },
  { label: 'Chapter 3', hint: 'Add a twist nobody sees coming.' },
  { label: 'The End', hint: 'How does your hero change by the last page?' }
];

export function StoryStudioPage() {
  const { stories, createStory, updateStory, deleteStory, status } = useAppState();
  const [activeId, setActiveId] = useState(null);
  const [draft, setDraft] = useState(null);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState('');
  const [search, setSearch] = useState('');
  const [filter, setFilter] = useState('all');
  const saveTimer = useRef(null);

  const visible = useMemo(() => {
    const query = search.trim().toLowerCase();
    return stories.filter((story) => {
      const kindOk = filter === 'all' || story.kind === filter;
      const textOk =
        !query ||
        story.title.toLowerCase().includes(query) ||
        (story.content || '').toLowerCase().includes(query);
      return kindOk && textOk;
    });
  }, [stories, search, filter]);

  const openStory = (story) => {
    setActiveId(story.id);
    setDraft({ title: story.title, content: story.content || '', kind: story.kind });
    setMessage('');
  };

  const newStory = (kind) => {
    setActiveId('new');
    const skeleton =
      kind === 'story'
        ? STARTER_SECTIONS.map((section) => `${section.label}\n\n    `).join('\n')
        : '';
    setDraft({ title: kind === 'story' ? 'Untitled story' : 'Idea board', content: skeleton, kind });
    setMessage('');
  };

  useEffect(() => {
    return () => {
      if (saveTimer.current) window.clearTimeout(saveTimer.current);
    };
  }, []);

  const scheduleSave = (nextDraft) => {
    setDraft(nextDraft);
    if (saveTimer.current) window.clearTimeout(saveTimer.current);
    saveTimer.current = window.setTimeout(() => save(nextDraft), 1200);
  };

  const save = async (theDraft = draft) => {
    if (!theDraft || !theDraft.title.trim()) return;
    setSaving(true);
    setMessage('');
    try {
      if (activeId === 'new') {
        const row = await createStory(theDraft);
        setActiveId(row.id);
      } else if (activeId) {
        await updateStory(activeId, theDraft);
      }
      setMessage(`Saved ${new Date().toLocaleTimeString([], { hour: 'numeric', minute: '2-digit' })}`);
    } catch (err) {
      setMessage(err.message);
    } finally {
      setSaving(false);
    }
  };

  const remove = async (id) => {
    try {
      await deleteStory(id);
      if (activeId === id) {
        setActiveId(null);
        setDraft(null);
      }
    } catch (err) {
      setMessage(err.message);
    }
  };

  const insertPrompt = () => {
    const prompt = IDEA_PROMPTS[Math.floor(Math.random() * IDEA_PROMPTS.length)];
    setDraft((current) =>
      current
        ? { ...current, content: `${current.content ? `${current.content}\n\n` : ''}★ ${prompt}\n` }
        : current
    );
  };

  if (status === 'loading') return <p className="loading-note">Opening your writing shelf…</p>;

  const wordCount = draft ? draft.content.trim().split(/\s+/).filter(Boolean).length : 0;

  return (
    <div className="content-grid single-column">
      <section className="panel">
        <p className="eyebrow">Story studio</p>
        <h2>Your writing desk — save stories, edit anytime, and pin down brilliant ideas.</h2>

        <div className="studio-toolbar">
          <button onClick={() => newStory('story')}>✍️ New story</button>
          <button onClick={() => newStory('idea')}>💡 New idea board</button>
          {draft && (
            <>
              <button className="secondary" onClick={insertPrompt}>🎲 Add a spark</button>
              <button className="secondary" onClick={() => save()} disabled={saving}>
                {saving ? 'Saving…' : 'Save now'}
              </button>
            </>
          )}
        </div>
        {message && <p className="feedback-note">{message}</p>}

        {draft ? (
          <div className="editor-stack">
            <div className="inline-fields">
              <label>
                Title
                <input
                  value={draft.title}
                  onChange={(event) => scheduleSave({ ...draft, title: event.target.value })}
                  placeholder="The Midnight Library Door"
                />
              </label>
              <label>
                Type
                <select
                  value={draft.kind}
                  onChange={(event) => scheduleSave({ ...draft, kind: event.target.value })}
                >
                  <option value="story">Story / chapter</option>
                  <option value="idea">Brainstorm ideas</option>
                </select>
              </label>
            </div>
            <textarea
              className="story-editor"
              value={draft.content}
              onChange={(event) => scheduleSave({ ...draft, content: event.target.value })}
              placeholder={
                draft.kind === 'story'
                  ? 'Once upon a time… (your work saves automatically as you type)'
                  : 'Brainstorm freely! Ideas, character sketches, plot twists, lists of names…'
              }
              rows={16}
            />
            <div className="editor-meta">
              <span>{wordCount} words</span>
              {draft.kind === 'story' && (
                <button className="secondary" onClick={() => {
                  const next = STARTER_SECTIONS.find(
                    (section) => !draft.content.includes(section.label)
                  );
                  if (!next) return;
                  const stamp = `${draft.content.trimEnd()}\n\n${next.label}\n\n    `;
                  scheduleSave({ ...draft, content: stamp });
                }}>+ Next section</button>
              )}
              {activeId !== 'new' && (
                <button
                  className="danger"
                  onClick={() => {
                    if (window.confirm('Delete this forever?')) remove(activeId);
                  }}
                >
                  Delete
                </button>
              )}
            </div>
          </div>
        ) : (
          <p className="muted-note">Pick a story from your shelf below, or start something new.</p>
        )}
      </section>

      <section className="panel">
        <p className="eyebrow">Your shelf</p>
        <h3>{stories.length} saved {stories.length === 1 ? 'piece' : 'pieces'}</h3>
        <div className="inline-fields shelf-filters">
          <label>
            Search
            <input
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              placeholder="Search titles and text…"
            />
          </label>
          <label>
            Show
            <select value={filter} onChange={(event) => setFilter(event.target.value)}>
              <option value="all">Everything</option>
              <option value="story">Stories only</option>
              <option value="idea">Idea boards only</option>
            </select>
          </label>
        </div>

        <div className="shelf-grid">
          {visible.map((story) => (
            <article
              key={story.id}
              className={`shelf-card ${activeId === story.id ? 'active' : ''}`}
              onClick={() => openStory(story)}
            >
              <span className="pill">{story.kind === 'story' ? 'story' : 'ideas'}</span>
              <h4>{story.title}</h4>
              <p>{(story.content || '').trim().slice(0, 120) || 'Empty page, full of potential…'}</p>
              <small>Edited {formatDayLong(story.updatedAt)}</small>
            </article>
          ))}
          {!visible.length && <p className="muted-note">Nothing here yet — write your first line above!</p>}
        </div>
      </section>
    </div>
  );
}
