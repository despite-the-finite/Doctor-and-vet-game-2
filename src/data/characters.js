/**
 * Character creator options.
 *
 * Everything is a flat list of {id, label, value} so the creator screen can
 * render any option group with the same swatch component. The hero is stored
 * as ids, and ui/avatar.js turns those ids into SVG.
 */

export const SKIN_TONES = [
  { id: 'skin1', value: '#ffe0c2', shade: '#f6c9a0' },
  { id: 'skin2', value: '#fdd0a8', shade: '#eeb583' },
  { id: 'skin3', value: '#e8b183', shade: '#d09763' },
  { id: 'skin4', value: '#c98a5b', shade: '#ad7047' },
  { id: 'skin5', value: '#9a6238', shade: '#7f4e2a' },
  { id: 'skin6', value: '#6d4326', shade: '#57341c' },
];

export const HAIR_COLORS = [
  { id: 'hair-black',  value: '#2f2a33' },
  { id: 'hair-brown',  value: '#6b4326' },
  { id: 'hair-blonde', value: '#f0c15c' },
  { id: 'hair-ginger', value: '#e2703a' },
  { id: 'hair-grey',   value: '#b9bcc9' },
  { id: 'hair-pink',   value: '#ff85b6' },
  { id: 'hair-blue',   value: '#4fb7f0' },
  { id: 'hair-mint',   value: '#48d3ae' },
];

/** Hair shapes are drawn in ui/avatar.js — ids must match the switch there. */
export const HAIR_STYLES = [
  { id: 'short',   label: 'Short' },
  { id: 'curly',   label: 'Curly' },
  { id: 'bun',     label: 'Bun' },
  { id: 'ponytail',label: 'Ponytail' },
  { id: 'long',    label: 'Long' },
  { id: 'braids',  label: 'Braids' },
  { id: 'afro',    label: 'Afro' },
  { id: 'hijab',   label: 'Headscarf' },
  { id: 'buzz',    label: 'Buzz' },
];

export const SCRUB_COLORS = [
  { id: 'scrub-blue',   value: '#4fb7f0' },
  { id: 'scrub-mint',   value: '#48d3ae' },
  { id: 'scrub-coral',  value: '#ff8b7d' },
  { id: 'scrub-grape',  value: '#b48cf5' },
  { id: 'scrub-sun',    value: '#ffcd5c' },
  { id: 'scrub-pink',   value: '#ff9ec4' },
  { id: 'scrub-navy',   value: '#41639b' },
];

export const COAT_COLORS = [
  { id: 'coat-white',  value: '#ffffff', label: 'Classic' },
  { id: 'coat-cream',  value: '#fff3dc', label: 'Cream' },
  { id: 'coat-mint',   value: '#dcfbee', label: 'Minty' },
  { id: 'coat-sky',    value: '#dff1ff', label: 'Sky' },
  { id: 'coat-pink',   value: '#ffe3ee', label: 'Blossom' },
  { id: 'coat-none',   value: null,      label: 'No coat' },
];

export const SHOE_COLORS = [
  { id: 'shoe-white', value: '#ffffff' },
  { id: 'shoe-red',   value: '#ff6b5b' },
  { id: 'shoe-blue',  value: '#3f8fe0' },
  { id: 'shoe-green', value: '#46c98d' },
  { id: 'shoe-black', value: '#3a3f57' },
  { id: 'shoe-rainbow', value: 'rainbow' },
];

export const GLASSES = [
  { id: 'none',   label: 'None',   icon: '🚫' },
  { id: 'round',  label: 'Round',  icon: '👓' },
  { id: 'square', label: 'Square', icon: '🕶️' },
  { id: 'star',   label: 'Stars',  icon: '⭐' },
];

/** Free starter accessories. Shop accessories are appended at runtime. */
export const ACCESSORIES = [
  { id: 'none',       label: 'None',        icon: '🚫' },
  { id: 'stetho',     label: 'Stethoscope', icon: '🩺' },
  { id: 'headband',   label: 'Headband',    icon: '🎀' },
  { id: 'freckles',   label: 'Freckles',    icon: '🟤' },
];

export const ACCESSORY_LABELS = {
  crown: { id: 'crown', label: 'Crown', icon: '👑' },
  cape: { id: 'cape', label: 'Cape', icon: '🦸' },
  flower: { id: 'flower', label: 'Flower', icon: '🌸' },
  badge: { id: 'badge', label: 'Badge', icon: '🏅' },
  headmirror: { id: 'headmirror', label: 'Head Mirror', icon: '🪞' },
};

/** Fun, easy names a child can tap instead of typing. */
export const NAME_SUGGESTIONS = [
  'Indra', 'Robin', 'Sunny', 'Pip', 'Nova', 'Bo', 'Kit', 'Ash',
  'Juno', 'Rio', 'Sam', 'Ziggy', 'Coco', 'Milo', 'Ivy', 'Rain',
];

export function defaultHero() {
  return {
    name: 'Indra',
    skin: 'skin2',
    hair: 'curly',
    hairColor: 'hair-brown',
    glasses: 'none',
    scrubs: 'scrub-blue',
    coat: 'coat-white',
    shoes: 'shoe-white',
    accessory: 'stetho',
  };
}
