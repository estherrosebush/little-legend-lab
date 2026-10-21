import { useMemo, useState } from 'react';
import { useAppState } from '../context/AppState.jsx';
import { formatDayLong } from '../lib/api.js';

const STEP_GUIDE = [
  {
    id: 'question',
    title: '1. Ask a real question',
    tip: 'Good research starts with something you genuinely wonder. Make it specific — "How do octopuses change color?" beats "octopuses".'
  },
  {
    id: 'sources',
    title: '2. Find trustworthy sources',
    tip: 'Look for sites that end in .gov, .edu, or well-known museums and encyclopedias. Write down WHERE every fact comes from — that is your citation.'
  },
  {
    id: 'notes',
    title: '3. Take notes in your own words',
    tip: 'Never copy whole sentences. Read it, close the tab, then write what you remember. That is how real researchers avoid plagiarism.'
  },
  {
    id: 'hypothesis',
    title: '4. Make a hypothesis',
    tip: 'Before you dig deep, guess what you think the answer is. Being wrong is great — that is how discoveries happen.'
  },
  {
    id: 'findings',
    title: '5. Record your findings',
    tip: 'What did you actually learn? Does it match your hypothesis? Write it like you are teaching a friend.'
  },
  {
    id: 'next',
    title: '6. Ask the next question',
    tip: 'Every answer opens a new door. What do you want to investigate next?'
  }
];

export function CuriosityLabPage() {
  const { research, createResearch, updateResearch, deleteResearch, status } = useAppState();
  const [activeId, setActiveId] = useState(null);
  const [draft, setDraft] = useState(null);
  const [message, setMessage] = useState('');
  const [saving, setSaving] = useState(false);

  const sorted = useMemo(() => research, [research]);

  const openProject = (row) => {
    setActiveId(row.id);
    setDraft({
      topic: row.topic,
      question: row.question,
      hypothesis: row.hypothesis,
      findings: row.findings,
      nextSteps: row.nextSteps,
      notes: row.notes,
      sources: row.sources && row.sources.length ? row.sources : [{ title: '', url: '', note: '' }]
    });
    setMessage('');
  };

  const newProject = () => {
    setActiveId('new');
    setDraft({
      topic: '',
      question: '',
      hypothesis: '',
      findings: '',
      nextSteps: '',
      notes: '',
      sources: [{ title: '', url: '', note: '' }]
    });
    setMessage('');
  };

  const save = async () => {
    if (!draft) return;
    setSaving(true);
    setMessage('');
    try {
      if (activeId === 'new') {
        const row = await createResearch(draft);
        setActiveId(row.id);
      } else if (activeId) {
        await updateResearch(activeId, draft);
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
      await deleteResearch(id);
      if (activeId === id) {
        setActiveId(null);
        setDraft(null);
      }
    } catch (err) {
      setMessage(err.message);
    }
  };

  const setField = (field, value) => setDraft((current) => ({ ...current, [field]: value }));

  const setSource = (index, field, value) =>
    setDraft((current) => ({
      ...current,
      sources: current.sources.map((source, i) =>
        i === index ? { ...source, [field]: value } : source
      )
    }));

  const addSource = () =>
    setDraft((current) => ({
      ...current,
      sources: [...current.sources, { title: '', url: '', note: '' }]
    }));

  const removeSource = (index) =>
    setDraft((current) => ({
      ...current,
      sources: current.sources.length > 1
        ? current.sources.filter((_, i) => i !== index)
        : [{ title: '', url: '', note: '' }]
    }));

  const citationFor = (source) => {
    const title = source.title || 'Untitled source';
    if (source.url) {
      const host = source.url.replace(/^https?:\/\//, '').split('/')[0];
      return `${title}. ${host}${source.url ? ` — ${source.url}` : ''}`;
    }
    return title;
  };

  if (status === 'loading') return <p className="loading-note">Setting up your lab bench…</p>;

  return (
    <div className="content-grid single-column">
      <section className="panel">
        <p className="eyebrow">Curiosity lab</p>
        <h2>Research like a real scientist — questions, sources, citations, and saved progress.</h2>

        <div className="studio-toolbar">
          <button onClick={newProject}>🔬 Start a new investigation</button>
          {draft && (
            <button className="secondary" onClick={save} disabled={saving}>
              {saving ? 'Saving…' : 'Save progress'}
            </button>
          )}
        </div>
        {message && <p className="feedback-note">{message}</p>}

        <div className="step-guide">
          {STEP_GUIDE.map((step) => (
            <div key={step.id} className="step-card">
              <h4>{step.title}</h4>
              <p>{step.tip}</p>
            </div>
          ))}
        </div>
      </section>

      {draft && (
        <section className="panel">
          <p className="eyebrow">Lab notebook</p>
          <div className="form-stack">
            <label>
              Topic
              <input
                value={draft.topic}
                onChange={(event) => setField('topic', event.target.value)}
                placeholder="Octopus camouflage"
              />
            </label>
            <label>
              My question
              <textarea
                rows={2}
                value={draft.question}
                onChange={(event) => setField('question', event.target.value)}
                placeholder="How do octopuses change color so fast?"
              />
            </label>
            <label>
              My hypothesis (my best guess before researching)
              <textarea
                rows={2}
                value={draft.hypothesis}
                onChange={(event) => setField('hypothesis', event.target.value)}
                placeholder="I think their skin has special cells that reflect light…"
              />
            </label>

            <div className="source-section">
              <h3>Sources &amp; citations</h3>
              <p className="muted-note">Every fact needs a home. Where did you learn it?</p>
              {draft.sources.map((source, index) => (
                <div key={index} className="source-row">
                  <div className="inline-fields">
                    <label>
                      Source title
                      <input
                        value={source.title}
                        onChange={(event) => setSource(index, 'title', event.target.value)}
                        placeholder="National Geographic — Octopus facts"
                      />
                    </label>
                    <label>
                      Link
                      <input
                        value={source.url}
                        onChange={(event) => setSource(index, 'url', event.target.value)}
                        placeholder="https://…"
                      />
                    </label>
                  </div>
                  <div className="inline-fields">
                    <label>
                      What I learned here
                      <input
                        value={source.note}
                        onChange={(event) => setSource(index, 'note', event.target.value)}
                        placeholder="Chromatophores are tiny color sacs"
                      />
                    </label>
                    <button type="button" className="secondary" onClick={() => removeSource(index)}>
                      Remove
                    </button>
                  </div>
                </div>
              ))}
              <button type="button" className="secondary" onClick={addSource}>+ Add another source</button>
            </div>

            <label>
              My findings — in my own words
              <textarea
                rows={5}
                value={draft.findings}
                onChange={(event) => setField('findings', event.target.value)}
                placeholder="What did you learn? Does it match your hypothesis?"
              />
            </label>
            <label>
              Lab notes (extra observations, sketches ideas, things to double-check)
              <textarea
                rows={3}
                value={draft.notes}
                onChange={(event) => setField('notes', event.target.value)}
                placeholder="Fun facts, weird details, things that surprised me…"
              />
            </label>
            <label>
              Next question
              <textarea
                rows={2}
                value={draft.nextSteps}
                onChange={(event) => setField('nextSteps', event.target.value)}
                placeholder="Can cuttlefish do this too? How fast can they switch?"
              />
            </label>

            <div className="citation-preview">
              <h4>Bibliography (auto-built from your sources)</h4>
              <ol>
                {draft.sources
                  .filter((source) => source.title || source.url)
                  .map((source, index) => (
                    <li key={index}>{citationFor(source)}</li>
                  ))}
                {!draft.sources.some((source) => source.title || source.url) && (
                  <li className="muted-note">Add sources above and your bibliography builds itself.</li>
                )}
              </ol>
            </div>
          </div>
        </section>
      )}

      <section className="panel">
        <p className="eyebrow">Investigation archive</p>
        <h3>{sorted.length} saved {sorted.length === 1 ? 'investigation' : 'investigations'}</h3>
        <div className="shelf-grid">
          {sorted.map((row) => (
            <article
              key={row.id}
              className={`shelf-card ${activeId === row.id ? 'active' : ''}`}
              onClick={() => openProject(row)}
            >
              <h4>{row.topic || 'Untitled investigation'}</h4>
              <p>{row.question || 'No question yet…'}</p>
              <small>{row.sources?.length || 0} source(s) · Edited {formatDayLong(row.updatedAt)}</small>
              <button
                className="danger"
                onClick={(event) => {
                  event.stopPropagation();
                  if (window.confirm('Delete this investigation?')) remove(row.id);
                }}
              >
                Delete
              </button>
            </article>
          ))}
          {!sorted.length && <p className="muted-note">No investigations yet — big questions are waiting.</p>}
        </div>
      </section>
    </div>
  );
}
