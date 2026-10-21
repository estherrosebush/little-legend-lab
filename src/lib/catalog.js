export const SPECIES = [
  { id: 'axolotl', name: 'Axolotl' },
  { id: 'mooncat', name: 'Moon Cat' },
  { id: 'starfox', name: 'Star Fox' },
  { id: 'dragonling', name: 'Dragonling' },
  { id: 'merbunny', name: 'Merbunny' }
];

export const CREATURE_COLORS = [
  '#b98cff',
  '#ff9ecb',
  '#7cc6ff',
  '#7ddf8b',
  '#ffd166',
  '#fcbf95',
  '#ff8db1',
  '#9df3e5'
];

export const SCENES = [
  { id: 'aurora', name: 'Aurora', css: 'linear-gradient(165deg, #a18cff 0%, #83d7ff 60%, #c9f0ff 100%)' },
  { id: 'sunset', name: 'Sunset', css: 'linear-gradient(165deg, #ff9a8b 0%, #ff6a88 55%, #ffcc7c 100%)' },
  { id: 'ocean', name: 'Ocean', css: 'linear-gradient(165deg, #2193b0 0%, #6dd5ed 100%)' },
  { id: 'starry', name: 'Starry', css: 'linear-gradient(165deg, #23246b 0%, #6a4c93 70%, #b8a7e8 100%)' }
];

export const ITEM_SLOTS = ['Back', 'Hat', 'Eyes', 'Neck', 'Held', 'Aura'];

export const SHOP_ITEMS = [
  { id: 'balloon', name: 'Balloon', slot: 'Held', price: 6 },
  { id: 'party-hat', name: 'Party Hat', slot: 'Hat', price: 8 },
  { id: 'beanie', name: 'Cozy Beanie', slot: 'Hat', price: 10 },
  { id: 'cozy-scarf', name: 'Cozy Scarf', slot: 'Neck', price: 10 },
  { id: 'cool-shades', name: 'Cool Shades', slot: 'Eyes', price: 12 },
  { id: 'heart-necklace', name: 'Heart Necklace', slot: 'Neck', price: 12 },
  { id: 'star-glasses', name: 'Star Glasses', slot: 'Eyes', price: 14 },
  { id: 'star-wand', name: 'Star Wand', slot: 'Held', price: 16 },
  { id: 'headphones', name: 'Headphones', slot: 'Hat', price: 16 },
  { id: 'flower-crown', name: 'Flower Crown', slot: 'Hat', price: 15 },
  { id: 'wizard-hat', name: 'Wizard Hat', slot: 'Hat', price: 18 },
  { id: 'hero-cape', name: 'Hero Cape', slot: 'Back', price: 20 },
  { id: 'fairy-wings', name: 'Fairy Wings', slot: 'Back', price: 22 },
  { id: 'crown', name: 'Royal Crown', slot: 'Hat', price: 25 },
  { id: 'sparkle-aura', name: 'Sparkle Aura', slot: 'Aura', price: 30 }
];

export function findShopItem(itemId) {
  return SHOP_ITEMS.find((item) => item.id === itemId) || null;
}

export function findScene(sceneId) {
  return SCENES.find((scene) => scene.id === sceneId) || SCENES[0];
}

export function isSpeciesValid(speciesId) {
  return SPECIES.some((species) => species.id === speciesId);
}

export function isColorValid(color) {
  return typeof color === 'string' && /^#[0-9a-fA-F]{6}$/.test(color);
}
