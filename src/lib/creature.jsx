import { findScene } from './catalog.js';

function clampChannel(value) {
  return Math.max(0, Math.min(255, Math.round(value)));
}

export function shade(hex, percent) {
  const num = parseInt(hex.slice(1), 16);
  const channels = [(num >> 16) & 255, (num >> 8) & 255, num & 255];
  const target = percent > 0 ? 255 : 0;
  const amount = Math.abs(percent) / 100;
  const mixed = channels.map((c) => clampChannel(c + (target - c) * amount));
  return `#${mixed.map((c) => c.toString(16).padStart(2, '0')).join('')}`;
}

export function starPath(cx, cy, outer, inner, rotation = 0) {
  const points = [];
  for (let i = 0; i < 10; i += 1) {
    const radius = i % 2 === 0 ? outer : inner;
    const angle = (Math.PI / 5) * i - Math.PI / 2 + (rotation * Math.PI) / 180;
    points.push(`${(cx + radius * Math.cos(angle)).toFixed(1)} ${(cy + radius * Math.sin(angle)).toFixed(1)}`);
  }
  return `M ${points.join(' L ')} Z`;
}

function SpeciesFeatures({ species, color }) {
  const outline = shade(color, -45);
  const light = shade(color, 45);
  if (species === 'mooncat') {
    return (
      <g>
        <path d="M160 152 Q 196 152 192 118 Q 190 104 176 102" fill="none" stroke={outline} strokeWidth="11" strokeLinecap="round" />
        <path d="M78 60 L96 24 L106 60 Z" fill={color} stroke={outline} strokeWidth="3" />
        <path d="M142 60 L124 24 L114 60 Z" fill={color} stroke={outline} strokeWidth="3" />
        <path d="M86 54 L96 34 L100 56 Z" fill="#ffb7d5" />
        <path d="M134 54 L124 34 L120 56 Z" fill="#ffb7d5" />
      </g>
    );
  }
  if (species === 'starfox') {
    return (
      <g>
        <path d="M160 158 Q 206 138 196 94 Q 188 132 156 132 Z" fill={color} stroke={outline} strokeWidth="3" />
        <path d="M196 94 Q 190 112 176 120 Q 194 116 199 102 Z" fill={light} />
        <path d="M74 60 L90 14 L108 56 Z" fill={color} stroke={outline} strokeWidth="3" />
        <path d="M146 60 L130 14 L112 56 Z" fill={color} stroke={outline} strokeWidth="3" />
        <path d="M86 26 L90 14 L96 24 Z" fill="#fff" opacity="0.85" />
        <path d="M134 26 L130 14 L124 24 Z" fill="#fff" opacity="0.85" />
      </g>
    );
  }
  if (species === 'dragonling') {
    return (
      <g>
        <path d="M158 166 Q 192 158 188 126 Q 182 146 154 146 Z" fill={color} stroke={outline} strokeWidth="3" />
        <path d="M180 146 L186 136 L188 148 Z" fill="#f7d154" />
        <path d="M50 128 Q 30 96 40 90 Q 56 96 62 118 Z" fill={shade(color, 20)} stroke={outline} strokeWidth="3" />
        <path d="M170 128 Q 190 96 180 90 Q 164 96 158 118 Z" fill={shade(color, 20)} stroke={outline} strokeWidth="3" />
        <path d="M84 50 Q 80 34 88 28 Q 92 42 98 52 Z" fill="#f7d154" stroke={outline} strokeWidth="2.5" />
        <path d="M136 50 Q 140 34 132 28 Q 128 42 122 52 Z" fill="#f7d154" stroke={outline} strokeWidth="2.5" />
      </g>
    );
  }
  if (species === 'merbunny') {
    return (
      <g>
        <ellipse cx="92" cy="38" rx="11" ry="27" fill={color} stroke={outline} strokeWidth="3" transform="rotate(-8 92 38)" />
        <ellipse cx="128" cy="38" rx="11" ry="27" fill={color} stroke={outline} strokeWidth="3" transform="rotate(8 128 38)" />
        <ellipse cx="92" cy="42" rx="5" ry="17" fill="#ffb7d5" transform="rotate(-8 92 42)" />
        <ellipse cx="128" cy="42" rx="5" ry="17" fill="#ffb7d5" transform="rotate(8 128 42)" />
      </g>
    );
  }
  const gill = shade(color, -12);
  return (
    <g>
      <ellipse cx="66" cy="76" rx="16" ry="6.5" fill={gill} stroke={outline} strokeWidth="2" transform="rotate(-32 66 76)" />
      <ellipse cx="60" cy="94" rx="17" ry="6.5" fill={gill} stroke={outline} strokeWidth="2" />
      <ellipse cx="66" cy="112" rx="16" ry="6.5" fill={gill} stroke={outline} strokeWidth="2" transform="rotate(32 66 112)" />
      <ellipse cx="154" cy="76" rx="16" ry="6.5" fill={gill} stroke={outline} strokeWidth="2" transform="rotate(32 154 76)" />
      <ellipse cx="160" cy="94" rx="17" ry="6.5" fill={gill} stroke={outline} strokeWidth="2" />
      <ellipse cx="154" cy="112" rx="16" ry="6.5" fill={gill} stroke={outline} strokeWidth="2" transform="rotate(-32 154 112)" />
    </g>
  );
}

function Face() {
  return (
    <g>
      <ellipse cx="96" cy="93" rx="7.5" ry="10" fill="#2d2142" />
      <ellipse cx="124" cy="93" rx="7.5" ry="10" fill="#2d2142" />
      <circle cx="98.6" cy="89.4" r="2.6" fill="#fff" />
      <circle cx="126.6" cy="89.4" r="2.6" fill="#fff" />
      <ellipse cx="85" cy="107" rx="6" ry="3.6" fill="#ff8db1" opacity="0.5" />
      <ellipse cx="135" cy="107" rx="6" ry="3.6" fill="#ff8db1" opacity="0.5" />
      <path d="M103 106 Q 110 113 117 106" stroke="#2d2142" strokeWidth="3" fill="none" strokeLinecap="round" />
    </g>
  );
}

const ACCESSORY_ART = {
  'party-hat': (
    <g>
      <path d="M110 6 L88 60 Q 110 68 132 60 Z" fill="#ff8db1" stroke="#d95f8d" strokeWidth="2.5" />
      <circle cx="104" cy="40" r="3" fill="#fff" opacity="0.9" />
      <circle cx="116" cy="30" r="3" fill="#fff" opacity="0.9" />
      <circle cx="110" cy="50" r="3" fill="#fff" opacity="0.9" />
      <circle cx="110" cy="8" r="6.5" fill="#ffd166" />
    </g>
  ),
  beanie: (
    <g>
      <path d="M76 60 Q 76 28 110 28 Q 144 28 144 60 Z" fill="#4fb8c9" stroke="#35939f" strokeWidth="2.5" />
      <rect x="70" y="56" width="80" height="13" rx="6.5" fill="#3d99a8" />
      <circle cx="110" cy="28" r="7.5" fill="#fff" />
    </g>
  ),
  headphones: (
    <g>
      <path d="M70 76 Q 70 34 110 34 Q 150 34 150 76" fill="none" stroke="#2d2142" strokeWidth="7" strokeLinecap="round" />
      <rect x="56" y="72" width="20" height="28" rx="9" fill="#ff5d8f" stroke="#d95f8d" strokeWidth="2.5" />
      <rect x="144" y="72" width="20" height="28" rx="9" fill="#ff5d8f" stroke="#d95f8d" strokeWidth="2.5" />
    </g>
  ),
  'flower-crown': (
    <g>
      {[
        { x: 78, y: 56, c: '#ff9ecb' },
        { x: 94, y: 45, c: '#c39bff' },
        { x: 110, y: 41, c: '#ff9ecb' },
        { x: 126, y: 45, c: '#c39bff' },
        { x: 142, y: 56, c: '#ff9ecb' }
      ].map((flower, index) => (
        <g key={index}>
          {[0, 72, 144, 216, 288].map((angle) => {
            const rad = (angle * Math.PI) / 180;
            return (
              <circle
                key={angle}
                cx={flower.x + 5 * Math.cos(rad)}
                cy={flower.y + 5 * Math.sin(rad)}
                r="3.6"
                fill={flower.c}
              />
            );
          })}
          <circle cx={flower.x} cy={flower.y} r="3" fill="#ffd166" />
        </g>
      ))}
    </g>
  ),
  crown: (
    <g>
      <path d="M80 58 L88 32 L100 50 L110 26 L120 50 L132 32 L140 58 Z" fill="#f7d154" stroke="#d9a622" strokeWidth="2.5" strokeLinejoin="round" />
      <circle cx="95" cy="48" r="2.8" fill="#ff5d8f" />
      <circle cx="110" cy="40" r="2.8" fill="#5ec6c9" />
      <circle cx="125" cy="48" r="2.8" fill="#ff5d8f" />
    </g>
  ),
  'wizard-hat': (
    <g>
      <path d="M110 4 Q 100 32 88 58 Q 110 68 132 58 Q 120 32 110 4 Z" fill="#7a5cff" stroke="#5b3fd4" strokeWidth="2.5" />
      <ellipse cx="110" cy="60" rx="37" ry="9" fill="#7a5cff" stroke="#5b3fd4" strokeWidth="2.5" />
      <rect x="92" y="44" width="34" height="7" rx="3.5" fill="#ffd166" />
      <path d={starPath(114, 24, 6, 2.4)} fill="#fff" opacity="0.9" />
    </g>
  ),
  'cool-shades': (
    <g>
      <rect x="78" y="84" width="27" height="17" rx="8" fill="#2d2142" />
      <rect x="115" y="84" width="27" height="17" rx="8" fill="#2d2142" />
      <rect x="104" y="88" width="12" height="5" rx="2.5" fill="#2d2142" />
      <rect x="82" y="88" width="11" height="3.4" rx="1.7" fill="#fff" opacity="0.55" />
      <rect x="119" y="88" width="11" height="3.4" rx="1.7" fill="#fff" opacity="0.55" />
    </g>
  ),
  'star-glasses': (
    <g>
      <path d={starPath(91, 93, 12, 5)} fill="#ffd166" stroke="#d9a622" strokeWidth="2" />
      <path d={starPath(129, 93, 12, 5)} fill="#ffd166" stroke="#d9a622" strokeWidth="2" />
      <rect x="101" y="89" width="18" height="4" rx="2" fill="#d9a622" />
    </g>
  ),
  'cozy-scarf': (
    <g>
      <rect x="80" y="116" width="60" height="16" rx="8" fill="#ff5d73" stroke="#d84b60" strokeWidth="2.5" />
      <rect x="118" y="128" width="15" height="27" rx="7" fill="#ff5d73" stroke="#d84b60" strokeWidth="2.5" transform="rotate(-8 125 141)" />
      <line x1="121" y1="152" x2="121" y2="157" stroke="#fff" strokeWidth="2" strokeLinecap="round" />
      <line x1="128" y1="151" x2="128" y2="156" stroke="#fff" strokeWidth="2" strokeLinecap="round" />
    </g>
  ),
  'heart-necklace': (
    <g>
      <path d="M84 116 Q 110 130 136 116" fill="none" stroke="#d9a622" strokeWidth="2.4" />
      <path d="M110 128 c -3 -5 -11 -3 -11 3 c 0 5 7 8 11 12 c 4 -4 11 -7 11 -12 c 0 -6 -8 -8 -11 -3 Z" fill="#ff5d8f" stroke="#d95f8d" strokeWidth="1.6" />
    </g>
  ),
  'fairy-wings': (
    <g opacity="0.82">
      <path d="M68 118 Q 34 82 28 112 Q 26 136 66 132 Z" fill="#cfe9ff" stroke="#9fc8e8" strokeWidth="2.5" />
      <path d="M68 132 Q 42 150 48 164 Q 62 166 74 148 Z" fill="#e2f3ff" stroke="#9fc8e8" strokeWidth="2.5" />
      <path d="M152 118 Q 186 82 192 112 Q 194 136 154 132 Z" fill="#cfe9ff" stroke="#9fc8e8" strokeWidth="2.5" />
      <path d="M152 132 Q 178 150 172 164 Q 158 166 146 148 Z" fill="#e2f3ff" stroke="#9fc8e8" strokeWidth="2.5" />
    </g>
  ),
  'hero-cape': (
    <g>
      <path d="M76 114 Q 110 104 144 114 L 162 194 Q 136 186 110 194 Q 84 202 58 194 Z" fill="#7a5cff" stroke="#5b3fd4" strokeWidth="2.5" />
      <path d={starPath(110, 156, 9, 3.6)} fill="#ffd166" opacity="0.9" />
    </g>
  ),
  'star-wand': (
    <g>
      <line x1="148" y1="152" x2="166" y2="118" stroke="#a8734a" strokeWidth="5" strokeLinecap="round" />
      <path d={starPath(170, 106, 14, 5.6)} fill="#ffd166" stroke="#d9a622" strokeWidth="2" />
      <circle cx="184" cy="92" r="3" fill="#fff" opacity="0.9" />
      <circle cx="157" cy="98" r="2.2" fill="#fff" opacity="0.8" />
    </g>
  ),
  balloon: (
    <g>
      <path d="M150 150 Q 158 120 160 90" fill="none" stroke="#2d2142" strokeWidth="2" opacity="0.4" />
      <ellipse cx="160" cy="66" rx="16" ry="20" fill="#ff5d73" stroke="#d84b60" strokeWidth="2.5" />
      <ellipse cx="154" cy="58" rx="4" ry="6" fill="#fff" opacity="0.5" />
      <path d="M156 86 L164 86 L160 92 Z" fill="#d84b60" />
    </g>
  ),
  'sparkle-aura': (
    <g className="creature-aura">
      <circle cx="110" cy="128" r="90" fill="none" stroke="#ffd166" strokeWidth="3" strokeDasharray="5 12" opacity="0.85" strokeLinecap="round" />
      <path d={starPath(110, 36, 7, 2.8)} fill="#ffd166" />
      <path d={starPath(202, 128, 6, 2.4)} fill="#ffd166" />
      <path d={starPath(110, 220, 6, 2.4)} fill="#ffd166" />
      <path d={starPath(18, 128, 6, 2.4)} fill="#ffd166" />
    </g>
  )
};

function Accessory({ id }) {
  const art = ACCESSORY_ART[id];
  return art ? <g>{art}</g> : null;
}

const BACK_ACCESSORIES = new Set(['fairy-wings', 'hero-cape']);
const HEAD_ACCESSORIES = new Set(['party-hat', 'beanie', 'headphones', 'flower-crown', 'crown', 'wizard-hat']);
const EYE_ACCESSORIES = new Set(['cool-shades', 'star-glasses']);
const NECK_ACCESSORIES = new Set(['cozy-scarf', 'heart-necklace']);
const HELD_ACCESSORIES = new Set(['star-wand', 'balloon']);
const AURA_ACCESSORIES = new Set(['sparkle-aura']);

export function CreatureRender({
  species = 'axolotl',
  color = '#b98cff',
  equipped = [],
  size = 260,
  className = ''
}) {
  const outline = shade(color, -45);
  const belly = shade(color, 52);
  const backItems = equipped.filter((id) => BACK_ACCESSORIES.has(id));
  const headItems = equipped.filter((id) => HEAD_ACCESSORIES.has(id));
  const eyeItems = equipped.filter((id) => EYE_ACCESSORIES.has(id));
  const neckItems = equipped.filter((id) => NECK_ACCESSORIES.has(id));
  const heldItems = equipped.filter((id) => HELD_ACCESSORIES.has(id));
  const auraItems = equipped.filter((id) => AURA_ACCESSORIES.has(id));

  return (
    <svg
      viewBox="0 0 220 220"
      width={size}
      height={size}
      className={`creature-svg ${className}`.trim()}
      role="img"
      aria-label="My creature"
    >
      {auraItems.map((id) => (
        <Accessory key={id} id={id} />
      ))}
      {backItems.map((id) => (
        <Accessory key={id} id={id} />
      ))}
      <g className="creature-bob">
        <SpeciesFeatures species={species} color={color} />
        <ellipse cx="58" cy="146" rx="9" ry="13" fill={color} stroke={outline} strokeWidth="3" transform="rotate(-16 58 146)" />
        <ellipse cx="162" cy="146" rx="9" ry="13" fill={color} stroke={outline} strokeWidth="3" transform="rotate(16 162 146)" />
        <ellipse cx="88" cy="186" rx="13" ry="8" fill={color} stroke={outline} strokeWidth="3" />
        <ellipse cx="132" cy="186" rx="13" ry="8" fill={color} stroke={outline} strokeWidth="3" />
        <ellipse cx="110" cy="142" rx="54" ry="46" fill={color} stroke={outline} strokeWidth="3.5" />
        <ellipse cx="110" cy="152" rx="27" ry="23" fill={belly} />
        <circle cx="110" cy="86" r="42" fill={color} stroke={outline} strokeWidth="3.5" />
        <Face />
        {neckItems.map((id) => (
          <Accessory key={id} id={id} />
        ))}
        {eyeItems.map((id) => (
          <Accessory key={id} id={id} />
        ))}
        {headItems.map((id) => (
          <Accessory key={id} id={id} />
        ))}
        {heldItems.map((id) => (
          <Accessory key={id} id={id} />
        ))}
      </g>
    </svg>
  );
}

export function CreatureStage({ creature, backgroundUrl, scene, height = 320 }) {
  const sceneStyle = findScene(creature?.scene || 'aurora');
  return (
    <div
      className="creature-stage"
      style={{ height, ...(backgroundUrl ? {} : { background: sceneStyle.css }) }}
    >
      {backgroundUrl && <img src={backgroundUrl} alt="" className="creature-photo-bg" />}
      <CreatureRender
        species={creature?.species}
        color={creature?.color}
        equipped={creature?.equipped || []}
        size={Math.min(280, height * 0.86)}
        className="creature-main"
      />
    </div>
  );
}
