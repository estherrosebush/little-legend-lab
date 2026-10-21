import { useMemo, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import { useAppState } from '../context/AppState.jsx';
import { CreatureStage } from '../lib/creature.jsx';
import { CREATURE_COLORS, ITEM_SLOTS, SCENES, SHOP_ITEMS, SPECIES } from '../lib/catalog.js';
import { computeEraSummary } from '../lib/api.js';

const MAX_DIM = 1600;

async function resizeToJpeg(file) {
  const bitmap = await createImageBitmap(file);
  const scale = Math.min(1, MAX_DIM / Math.max(bitmap.width, bitmap.height));
  const width = Math.max(1, Math.round(bitmap.width * scale));
  const height = Math.max(1, Math.round(bitmap.height * scale));
  const canvas = document.createElement('canvas');
  canvas.width = width;
  canvas.height = height;
  canvas.getContext('2d').drawImage(bitmap, 0, 0, width, height);
  bitmap.close?.();
  return new Promise((resolve) => {
    canvas.toBlob((blob) => resolve(blob), 'image/jpeg', 0.85);
  });
}

export function CreaturePage({ chores, stickers }) {
  const {
    status,
    profile,
    owned,
    starBalance,
    backgrounds,
    hours,
    projects,
    updateCreature,
    toggleItem,
    uploadBackground,
    selectBackground,
    deleteBackground,
    captureSnapshot
  } = useAppState();
  const fileInputRef = useRef(null);
  const [nameDraft, setNameDraft] = useState('');
  const [editingName, setEditingName] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [capturing, setCapturing] = useState(false);
  const [message, setMessage] = useState('');
  const [eraLabel, setEraLabel] = useState('');

  const equipped = profile?.equipped || [];
  const background = useMemo(() => {
    if (!profile?.backgroundId) return null;
    const found = backgrounds.find((bg) => bg.id === profile.backgroundId);
    return found ? `/api/background-image/${found.id}` : null;
  }, [profile, backgrounds]);

  const ownedItems = SHOP_ITEMS.filter((item) => owned.includes(item.id));

  const saveName = async () => {
    const trimmed = nameDraft.trim();
    setEditingName(false);
    if (!trimmed || trimmed === profile.creatureName) return;
    try {
      await updateCreature({ creatureName: trimmed });
      setMessage('Name saved!');
    } catch (err) {
      setMessage(err.message);
    }
  };

  const handleUpload = async (event) => {
    const file = event.target.files?.[0];
    event.target.value = '';
    if (!file) return;
    setUploading(true);
    setMessage('');
    try {
      const resized = await resizeToJpeg(file);
      const row = await uploadBackground(resized);
      await selectBackground(row.id);
      setMessage('New background set!');
    } catch (err) {
      setMessage(err.message);
    } finally {
      setUploading(false);
    }
  };

  const handleCapture = async () => {
    setCapturing(true);
    setMessage('');
    try {
      await captureSnapshot({
        label: eraLabel.trim() || `Era — ${new Date().toLocaleDateString([], { month: 'long', year: 'numeric' })}`,
        kind: 'era',
        data: {
          creatureName: profile.creatureName,
          species: profile.species,
          color: profile.color,
          scene: profile.scene,
          equipped: profile.equipped,
          backgroundId: profile.backgroundId
        },
        summary: computeEraSummary({ entries: hours.entries, projects, chores, profile, stickers })
      });
      setEraLabel('');
      setMessage('Era saved to the Yearbook!');
    } catch (err) {
      setMessage(err.message);
    } finally {
      setCapturing(false);
    }
  };

  if (status === 'loading') return <p className="loading-note">Waking up your creature…</p>;
  if (!profile) return <p className="loading-note">Could not load your creature. {message}</p>;

  return (
    <div className="content-grid creature-layout">
      <section className="panel creature-showcase">
        <p className="eyebrow">Creature profile</p>
        <div className="creature-title-row">
          <h2 className="creature-title">{profile.creatureName}</h2>
          <button className="secondary tiny" onClick={() => { setEditingName(true); setNameDraft(profile.creatureName); }}>
            rename
          </button>
        </div>
        {editingName && (
          <div className="form-stack name-edit">
            <input
              value={nameDraft}
              onChange={(event) => setNameDraft(event.target.value)}
              onKeyDown={(event) => event.key === 'Enter' && saveName()}
              autoFocus
              maxLength={40}
            />
            <div className="clock-buttons">
              <button onClick={saveName}>Save name</button>
              <button className="secondary" onClick={() => setEditingName(false)}>Cancel</button>
            </div>
          </div>
        )}

        <CreatureStage creature={profile} backgroundUrl={background} height={360} />

        <div className="creature-stats">
          <span className="pill">⭐ {starBalance} stars</span>
          <span className="pill">{ownedItems.length} accessories</span>
          <span className="pill">{SPECIES.find((s) => s.id === profile.species)?.name}</span>
        </div>
        {message && <p className="feedback-note">{message}</p>}
      </section>

      <div className="creature-side">
        <section className="panel">
          <p className="eyebrow">Build my creature</p>
          <h3>Species</h3>
          <div className="chip-row">
            {SPECIES.map((species) => (
              <button
                key={species.id}
                className={`chip ${profile.species === species.id ? 'chip-active' : ''}`}
                onClick={() => updateCreature({ species: species.id })}
              >
                {species.name}
              </button>
            ))}
          </div>

          <h3>Color</h3>
          <div className="chip-row">
            {CREATURE_COLORS.map((color) => (
              <button
                key={color}
                aria-label={`Color ${color}`}
                className={`swatch ${profile.color === color ? 'swatch-active' : ''}`}
                style={{ background: color }}
                onClick={() => updateCreature({ color })}
              />
            ))}
            <label className="swatch swatch-custom" title="Custom color">
              <input
                type="color"
                value={profile.color}
                onChange={(event) => updateCreature({ color: event.target.value })}
              />
            </label>
          </div>

          <h3>Background scene</h3>
          <div className="chip-row">
            {SCENES.map((scene) => (
              <button
                key={scene.id}
                className={`chip ${!profile.backgroundId && profile.scene === scene.id ? 'chip-active' : ''}`}
                onClick={() => {
                  selectBackground(null)
                    .then(() => updateCreature({ scene: scene.id }))
                    .catch((err) => setMessage(err.message));
                }}
              >
                {scene.name}
              </button>
            ))}
          </div>
        </section>

        <section className="panel">
          <p className="eyebrow">Photo backgrounds</p>
          <h3>Use your own photos</h3>
          <p className="muted-note">Snap or upload a photo — it becomes the backdrop for your creature.</p>
          <input ref={fileInputRef} type="file" accept="image/*" hidden onChange={handleUpload} />
          <button onClick={() => fileInputRef.current?.click()} disabled={uploading}>
            {uploading ? 'Uploading…' : '📷 Upload a photo'}
          </button>

          {backgrounds.length > 0 && (
            <div className="bg-gallery">
              {backgrounds.map((bg) => (
                <div key={bg.id} className={`bg-thumb ${profile.backgroundId === bg.id ? 'bg-active' : ''}`}>
                  <button onClick={() => selectBackground(bg.id)} aria-label={`Use ${bg.label || 'photo'}`}>
                    <img src={`/api/background-image/${bg.id}`} alt={bg.label || 'Uploaded background'} />
                  </button>
                  <button className="bg-delete" onClick={() => deleteBackground(bg.id)} aria-label="Delete photo">
                    ✕
                  </button>
                </div>
              ))}
            </div>
          )}
        </section>

        <section className="panel">
          <p className="eyebrow">Wardrobe</p>
          <h3>Owned accessories</h3>
          {ownedItems.length === 0 ? (
            <p className="muted-note">
              No accessories yet — earn stars and visit the <Link to="/shop">Star Shop</Link>.
            </p>
          ) : (
            <div className="wardrobe-list">
              {ITEM_SLOTS.map((slot) => {
                const items = ownedItems.filter((item) => item.slot === slot);
                if (!items.length) return null;
                return (
                  <div key={slot} className="wardrobe-row">
                    <span className="wardrobe-slot">{slot}</span>
                    <div className="wardrobe-items">
                      {items.map((item) => (
                        <button
                          key={item.id}
                          className={`chip ${equipped.includes(item.id) ? 'chip-active' : ''}`}
                          onClick={() => toggleItem(item.id)}
                        >
                          {equipped.includes(item.id) ? '✓ ' : ''}
                          {item.name}
                        </button>
                      ))}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </section>

        <section className="panel">
          <p className="eyebrow">Yearbook</p>
          <h3>Save this era</h3>
          <p className="muted-note">
            Capture how {profile.creatureName} looks right now plus a snapshot of your progress — flip back to it anytime.
          </p>
          <div className="form-stack">
            <input
              value={eraLabel}
              onChange={(event) => setEraLabel(event.target.value)}
              placeholder={`Era — ${new Date().toLocaleDateString([], { month: 'long', year: 'numeric' })}`}
            />
            <button onClick={handleCapture} disabled={capturing}>
              {capturing ? 'Saving…' : '📸 Capture this era'}
            </button>
            <Link to="/yearbook" className="ghost-link">Open the Yearbook flipbook →</Link>
          </div>
        </section>
      </div>
    </div>
  );
}
