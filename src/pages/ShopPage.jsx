import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useAppState } from '../context/AppState.jsx';
import { CreatureRender } from '../lib/creature.jsx';
import { SHOP_ITEMS, ITEM_SLOTS } from '../lib/catalog.js';

export function ShopPage() {
  const { status, profile, owned, starBalance, purchase, toggleItem } = useAppState();
  const [busyId, setBusyId] = useState(null);
  const [message, setMessage] = useState('');

  const handlePurchase = async (item) => {
    setBusyId(item.id);
    setMessage('');
    try {
      await purchase(item.id);
      setMessage(`${item.name} is yours! Equip it on your creature.`);
    } catch (err) {
      setMessage(err.message);
    } finally {
      setBusyId(null);
    }
  };

  if (status === 'loading') return <p className="loading-note">Opening the Star Shop…</p>;
  if (!profile) return <p className="loading-note">Could not load the shop. {message}</p>;

  return (
    <div className="content-grid single-column">
      <section className="panel shop-header">
        <div>
          <p className="eyebrow">Star shop</p>
          <h2>Spend your stars on shiny things.</h2>
          <p className="muted-note">
            Earn stars by finishing quests and from your parent — then dress up{' '}
            <Link to="/pet">{profile.creatureName}</Link>.
          </p>
        </div>
        <div className="wallet-chip">
          <span className="wallet-star">⭐</span>
          <strong>{starBalance}</strong>
          <span>stars to spend</span>
        </div>
      </section>

      {message && (
        <div className="panel shop-message">
          <p className="feedback-note">{message}</p>
        </div>
      )}

      <div className="shop-grid">
        {ITEM_SLOTS.flatMap((slot) => SHOP_ITEMS.filter((item) => item.slot === slot)).map((item) => {
          const isOwned = owned.includes(item.id);
          const isEquipped = (profile.equipped || []).includes(item.id);
          const affordable = starBalance >= item.price;
          return (
            <article key={item.id} className="panel shop-card">
              <div className="shop-preview">
                <CreatureRender equipped={[item.id]} size={150} />
              </div>
              <div className="shop-card-info">
                <h3>{item.name}</h3>
                <span className="pill">{item.slot}</span>
              </div>
              {isOwned ? (
                <div className="shop-owned">
                  <button
                    className={`chip ${isEquipped ? 'chip-active' : ''}`}
                    onClick={() => toggleItem(item.id)}
                  >
                    {isEquipped ? '✓ Equipped' : 'Equip'}
                  </button>
                </div>
              ) : (
                <button
                  className="shop-buy"
                  onClick={() => handlePurchase(item)}
                  disabled={busyId === item.id || !affordable}
                >
                  {busyId === item.id
                    ? 'Buying…'
                    : affordable
                      ? `Buy · ⭐ ${item.price}`
                      : `⭐ ${item.price}`}
                </button>
              )}
            </article>
          );
        })}
      </div>
    </div>
  );
}
