/**
 * The Supply Room catalogue.
 *
 * Anything bought here shows up somewhere visible: decor items are drawn as
 * props inside a specific hospital room, outfit items appear on the hero, and
 * `unlocksRoom` items physically build a new wing.
 */

export const CATEGORIES = [
  { id: 'rooms',   name: 'New Rooms',   icon: '🏗️' },
  { id: 'comfort', name: 'Comfy Stuff', icon: '🛋️' },
  { id: 'decor',   name: 'Decoration',  icon: '🎨' },
  { id: 'fun',     name: 'Patient Fun', icon: '🎈' },
  { id: 'outfit',  name: 'My Outfit',   icon: '👕' },
];

export const SHOP_ITEMS = [
  /* --- big builds ------------------------------------------------------- */
  { id: 'room-imaging', category: 'rooms', name: 'Imaging Centre', icon: '🖼️', price: 900,
    blurb: 'A whole new floor with a giant scanning machine.', unlocksRoom: 'imaging' },

  /* --- waiting room comfort -------------------------------------------- */
  { id: 'sofa',     category: 'comfort', name: 'Squishy Sofa',    icon: '🛋️', price: 90,  blurb: 'Waiting is comfier now.',            place: { room: 'reception', x: 70, y: 66, size: 30 } },
  { id: 'rug',      category: 'comfort', name: 'Sunny Rug',       icon: '🟡', price: 60,  blurb: 'Warm feet, happy patients.',         place: { room: 'reception', x: 50, y: 74, size: 26 } },
  { id: 'animalbed',category: 'comfort', name: 'Animal Beds',     icon: '🛏️', price: 140, blurb: 'Fluffy nests for tired paws.',       place: { room: 'vet', x: 76, y: 66, size: 28 } },
  { id: 'lamp',     category: 'comfort', name: 'Cosy Lamp',       icon: '🪔', price: 70,  blurb: 'A soft glow for nervous patients.',  place: { room: 'doctor', x: 14, y: 60, size: 24 } },

  /* --- decoration ------------------------------------------------------- */
  { id: 'plant',    category: 'decor', name: 'Big Plant',      icon: '🪴', price: 50,  blurb: 'Green things make rooms happy.',   place: { room: 'doctor', x: 90, y: 62, size: 28 } },
  { id: 'aquarium', category: 'decor', name: 'Aquarium',       icon: '🐠', price: 260, blurb: 'Bubbly fish everyone loves to watch.', place: { room: 'reception', x: 12, y: 60, size: 30, anim: 'lh-bob-slow' } },
  { id: 'wallart',  category: 'decor', name: 'Wall Art',       icon: '🖼️', price: 80,  blurb: 'A painting of a very brave hamster.', place: { room: 'vet', x: 14, y: 48, size: 24 } },
  { id: 'rainbow',  category: 'decor', name: 'Rainbow Mural',  icon: '🌈', price: 180, blurb: 'Paints the whole reception wall.',  place: { room: 'reception', x: 50, y: 44, size: 34 } },
  { id: 'fairylights', category: 'decor', name: 'Fairy Lights', icon: '✨', price: 120, blurb: 'Twinkly lights along the ceiling.', place: { room: 'vet', x: 50, y: 42, size: 26, anim: 'lh-twinkle' } },

  /* --- toys for patients ------------------------------------------------ */
  { id: 'toybox',   category: 'fun', name: 'Toy Box',        icon: '🧸', price: 100, blurb: 'Something to cuddle before a checkup.', place: { room: 'doctor', x: 76, y: 70, size: 26 } },
  { id: 'balloons', category: 'fun', name: 'Balloon Bunch',  icon: '🎈', price: 70,  blurb: 'Instantly makes any room a party.', place: { room: 'reception', x: 84, y: 48, size: 28, anim: 'lh-bob' } },
  { id: 'ballpit',  category: 'fun', name: 'Ball Pit',       icon: '🔴', price: 200, blurb: 'Nobody wants to leave. Ever.', place: { room: 'reception', x: 62, y: 74, size: 26 } },
  { id: 'chewtoy',  category: 'fun', name: 'Squeaky Toys',   icon: '🦆', price: 60,  blurb: 'Squeak! Tails go wild.', place: { room: 'vet', x: 44, y: 74, size: 22, anim: 'lh-wiggle' } },
  { id: 'birdperch',category: 'fun', name: 'Bird Perch',     icon: '🦜', price: 150, blurb: 'A swinging branch for feathered friends.', place: { room: 'vet', x: 88, y: 46, size: 26, anim: 'lh-sway' } },

  /* --- hero outfit ------------------------------------------------------ */
  { id: 'outfit-crown',   category: 'outfit', name: 'Hero Crown',     icon: '👑', price: 300, blurb: 'For the ruler of this hospital.', accessory: 'crown' },
  { id: 'outfit-cape',    category: 'outfit', name: 'Hero Cape',      icon: '🦸', price: 250, blurb: 'Swooshes when you walk. Obviously.', accessory: 'cape' },
  { id: 'outfit-flower',  category: 'outfit', name: 'Flower Pin',     icon: '🌸', price: 90,  blurb: 'A cheerful bloom on your coat.', accessory: 'flower' },
  { id: 'outfit-badge',   category: 'outfit', name: 'Gold Badge',     icon: '🏅', price: 160, blurb: 'Everyone knows who is in charge.', accessory: 'badge' },
  { id: 'outfit-headmirror', category: 'outfit', name: 'Head Mirror', icon: '🪞', price: 130, blurb: 'The classic doctor look.', accessory: 'headmirror' },
];

export function itemsIn(category) { return SHOP_ITEMS.filter((i) => i.category === category); }
export function getItem(id) { return SHOP_ITEMS.find((i) => i.id === id); }

/** Decor the player owns, grouped by the room it belongs in. */
export function placedItemsFor(roomId, purchased) {
  return SHOP_ITEMS.filter((i) => i.place?.room === roomId && purchased[i.id]);
}

/** Accessories unlocked through the shop, offered in the character creator. */
export function ownedAccessories(purchased) {
  return SHOP_ITEMS.filter((i) => i.accessory && purchased[i.id]).map((i) => i.accessory);
}
