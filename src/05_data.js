/* ================================================================
   Game data: food, room items, tricks, games, quests
   ================================================================ */
const FOODS = [
  { id: 'kibble', name: 'Kibble', icon: 'kibble', price: 0, lv: 1, hun: 20, hap: 2, en: 0, desc: 'Crunchy and free. Always in stock!' },
  { id: 'fish', name: 'Fresh Fish', icon: 'fish', price: 8, lv: 1, hun: 30, hap: 6, en: 0, desc: 'A shiny fish. Cats go wild for it!' },
  { id: 'milk', name: 'Pet Milk', icon: 'milk', price: 6, lv: 1, hun: 14, hap: 6, en: 10, desc: 'A creamy drink that gives energy.' },
  { id: 'cookie', name: 'Paw Cookie', icon: 'cookie', price: 8, lv: 1, hun: 10, hap: 14, en: 0, desc: 'A crunchy treat shaped like a paw.' },
  { id: 'chicken', name: 'Chicken', icon: 'chicken', price: 12, lv: 2, hun: 36, hap: 5, en: 6, desc: 'Tasty roast chicken. Very filling.' },
  { id: 'bone', name: 'Chew Bone', icon: 'bone', price: 10, lv: 2, hun: 18, hap: 16, en: 0, desc: 'Doggies LOVE to chew on these.' },
  { id: 'tuna', name: 'Tuna Can', icon: 'tuna', price: 15, lv: 3, hun: 42, hap: 8, en: 0, desc: 'A big can of yummy tuna.' },
  { id: 'donut', name: 'Donut', icon: 'donut', price: 16, lv: 3, hun: 16, hap: 22, en: 4, desc: 'Pink frosting and sprinkles!' },
  { id: 'cupcake', name: 'Cupcake', icon: 'cupcake', price: 18, lv: 4, hun: 14, hap: 26, en: 4, desc: 'A sweet cupcake with a cherry on top.' },
  { id: 'sushi', name: 'Sushi', icon: 'sushi', price: 24, lv: 5, hun: 45, hap: 18, en: 5, desc: 'Fancy salmon sushi. Ooh la la!' },
  { id: 'meat', name: 'Meaty Bone', icon: 'meat', price: 28, lv: 6, hun: 55, hap: 12, en: 10, desc: 'A giant cartoon meat. Wow!' },
  { id: 'cake', name: 'Party Cake', icon: 'cake', price: 45, lv: 8, hun: 50, hap: 40, en: 10, desc: 'A whole birthday cake. Party time!' },
];
const FOOD_BY_ID = {};
for (const f of FOODS) FOOD_BY_ID[f.id] = f;

const ROOM = [
  { id: 'wall_cream', type: 'wall', name: 'Cream Stripes', price: 0, lv: 1, sw: ['#fff0dc', '#f6dfc2'] },
  { id: 'wall_pink', type: 'wall', name: 'Pink Hearts', price: 60, lv: 1, sw: ['#ffd6e8', '#ff9ec8'] },
  { id: 'wall_mint', type: 'wall', name: 'Mint Dots', price: 60, lv: 2, sw: ['#c8f4e0', '#8ee0c0'] },
  { id: 'wall_sky', type: 'wall', name: 'Sky Clouds', price: 80, lv: 3, sw: ['#a8dcff', '#ffffff'] },
  { id: 'wall_star', type: 'wall', name: 'Starry Night', price: 120, lv: 5, sw: ['#3a2a6a', '#ffd84a'] },
  { id: 'wall_rainbow', type: 'wall', name: 'Rainbow', price: 150, lv: 7, sw: ['#ff9ec8', '#a8dcff'] },
  { id: 'floor_wood', type: 'floor', name: 'Wood Floor', price: 0, lv: 1, sw: ['#c8864a', '#a86a36'] },
  { id: 'floor_check', type: 'floor', name: 'Checker Tiles', price: 50, lv: 1, sw: ['#ffffff', '#c3a8ff'] },
  { id: 'floor_carpet', type: 'floor', name: 'Pink Carpet', price: 70, lv: 2, sw: ['#ff9ec8', '#ff7ab4'] },
  { id: 'floor_grass', type: 'floor', name: 'Grass', price: 90, lv: 4, sw: ['#6ad46a', '#4ab854'] },
  { id: 'floor_cloud', type: 'floor', name: 'Cloud Floor', price: 140, lv: 6, sw: ['#e8f4ff', '#c0dcff'] },
  { id: 'bed', type: 'furn', name: 'Cozy Bed', price: 40, lv: 1, desc: 'Naps restore energy faster!' },
  { id: 'rug', type: 'furn', name: 'Round Rug', price: 30, lv: 1, desc: 'A soft rug for sitting on.' },
  { id: 'plant', type: 'furn', name: 'Potted Plant', price: 25, lv: 1, desc: 'A happy little plant.' },
  { id: 'lamp', type: 'furn', name: 'Floor Lamp', price: 45, lv: 2, desc: 'Glows at night. So cozy.' },
  { id: 'tree', type: 'furn', name: 'Cat Tree', price: 90, lv: 2, desc: 'Pets love to climb and nap on it!' },
  { id: 'toys', type: 'furn', name: 'Toy Basket', price: 55, lv: 2, desc: 'Fun drops slower when toys are around.' },
  { id: 'portrait', type: 'furn', name: 'Pet Portrait', price: 60, lv: 3, desc: 'A painting of your pet!' },
  { id: 'tank', type: 'furn', name: 'Fish Tank', price: 120, lv: 3, desc: 'Watch the fishies swim.' },
  { id: 'lights', type: 'furn', name: 'Fairy Lights', price: 70, lv: 3, desc: 'Twinkly lights for your room.' },
  { id: 'clock', type: 'furn', name: 'Wall Clock', price: 50, lv: 4, desc: 'Shows the real time!' },
  { id: 'castle', type: 'furn', name: 'Box Castle', price: 150, lv: 6, desc: 'A cardboard castle fit for a king.' },
  { id: 'disco', type: 'furn', name: 'Disco Ball', price: 200, lv: 8, desc: 'Turns your room into a dance party!' },
];
const ROOM_BY_ID = {};
for (const r of ROOM) ROOM_BY_ID[r.id] = r;

const TRICKS = [
  { id: 'sit', name: 'Sit Pretty' }, { id: 'five', name: 'High Five' }, { id: 'spin', name: 'Spin' }, { id: 'jump', name: 'Big Jump' },
  { id: 'wave', name: 'Wave Hello' }, { id: 'beg', name: 'Beg' }, { id: 'roll', name: 'Roll Over' }, { id: 'dance', name: 'Dance' },
];
const TRICK_SESSIONS = 2; // successful sessions to learn a trick

const GAMES = [
  { id: 'yarn', name: 'Treat Catch', icon: 'yarn', lv: 1, desc: 'Slide to catch falling treats. Dodge the water drops!' },
  { id: 'mouse', name: 'Mouse Pop', icon: 'mouse', lv: 2, desc: 'Tap the mice before they hide. Not the cucumbers!' },
  { id: 'run', name: 'Kitty Run', icon: 'fish', lv: 3, desc: 'Tap to jump over boxes and grab the fish!' },
];
function gameName(id, pet) {
  const gm = GAMES.find((x) => x.id === id);
  if (id === 'run' && pet && BREEDS[pet.b].kind === 'dog') return 'Puppy Run';
  return gm.name;
}

const NEEDS = [
  { name: 'Food', icon: 'fish', color: '#ff9a4a', hint: 'Feed me!' },
  { name: 'Fun', icon: 'heart', color: '#ff6fa8', hint: 'Play with me!' },
  { name: 'Energy', icon: 'bolt', color: '#ffd84a', hint: 'I need a nap.' },
  { name: 'Clean', icon: 'drop', color: '#4fb4ff', hint: 'Bath time!' },
  { name: 'Fluff', icon: 'sparkle', color: '#c3a8ff', hint: 'Brush my fur!' },
];

const DAILY = [
  { id: 'feed3', text: 'Feed your pet 3 times', ev: 'feed', n: 3, r: 25 },
  { id: 'pet3', text: 'Pet your pet 3 times', ev: 'pet', n: 3, r: 20 },
  { id: 'play2', text: 'Play 2 games', ev: 'play', n: 2, r: 30 },
  { id: 'brush1', text: 'Brush your pet', ev: 'brush', n: 1, r: 20 },
  { id: 'bath1', text: 'Give a bath', ev: 'bath', n: 1, r: 25 },
  { id: 'train1', text: 'Do a training class', ev: 'train', n: 1, r: 25 },
  { id: 'coins50', text: 'Earn 50 coins', ev: 'coins', n: 50, r: 30 },
  { id: 'treat2', text: 'Give 2 yummy treats', ev: 'treat', n: 2, r: 25 },
  { id: 'yarn15', text: 'Score 15 in Treat Catch', ev: 's_yarn', n: 15, r: 35, max: true },
  { id: 'mouse15', text: 'Score 15 in Mouse Pop', ev: 's_mouse', n: 15, r: 35, max: true, lv: 2 },
  { id: 'run20', text: 'Score 20 in the Run game', ev: 's_run', n: 20, r: 35, max: true, lv: 3 },
  { id: 'clean2', text: 'Clean up 2 messes', ev: 'clean', n: 2, r: 20 },
  { id: 'nap1', text: 'Let your pet take a nap', ev: 'nap', n: 1, r: 20 },
  { id: 'trick3', text: 'Show off 3 tricks', ev: 'trick', n: 3, r: 30, needTrick: true },
];

const ADVENTURES = [
  { id: 'a_feed', text: 'First Meal', desc: 'Feed your pet', stat: 'fed', n: 1, r: 20 },
  { id: 'a_pet', text: 'Best Buddies', desc: 'Pet your pet 10 times', stat: 'pets', n: 10, r: 40 },
  { id: 'a_bath', text: 'Squeaky Clean', desc: 'Give your pet a bath', stat: 'baths', n: 1, r: 30 },
  { id: 'a_brush', text: 'Brush Up', desc: 'Brush your pet', stat: 'brushes', n: 1, r: 30 },
  { id: 'a_game', text: 'Game Time', desc: 'Play a game', stat: 'games', n: 1, r: 30 },
  { id: 'a_trick', text: 'Smarty Paws', desc: 'Learn a trick', stat: 'tricksLearned', n: 1, r: 50 },
  { id: 'a_wear', text: 'Fashionista', desc: 'Buy an outfit item', stat: 'accs', n: 1, r: 40 },
  { id: 'a_decor', text: 'Home Sweet Home', desc: 'Buy a room item', stat: 'decor', n: 1, r: 40 },
  { id: 'a_clean', text: 'Tidy Helper', desc: 'Clean up 5 messes', stat: 'cleaned', n: 5, r: 50 },
  { id: 'a_teen', text: 'Growing Up', desc: 'Reach pet level 5', stat: 'maxLv', n: 5, r: 80 },
  { id: 'a_two', text: 'Big Family', desc: 'Have 2 pets', stat: 'petCount', n: 2, r: 100 },
  { id: 'a_dog', text: 'Puppy Love', desc: 'Adopt a puppy', stat: 'dogs', n: 1, r: 120 },
  { id: 'a_run', text: 'Speedy Paws', desc: 'Score 30 in the Run game', stat: 'best_run', n: 30, r: 80 },
  { id: 'a_adult', text: 'All Grown Up', desc: 'Reach pet level 10', stat: 'maxLv', n: 10, r: 150 },
  { id: 'a_tricks', text: 'Trick Master', desc: 'Learn 5 tricks', stat: 'tricksLearned', n: 5, r: 150 },
  { id: 'a_rich', text: 'Piggy Bank', desc: 'Have 500 coins at once', stat: 'coinsMax', n: 500, r: 100 },
  { id: 'a_streak', text: 'Loyal Friend', desc: 'Visit 5 days in a row', stat: 'streak', n: 5, r: 120 },
  { id: 'a_closet', text: 'Collector', desc: 'Own 10 outfit items', stat: 'accs', n: 10, r: 200 },
  { id: 'a_star', text: 'Super Star', desc: 'Reach Star Level 10', stat: 'ownerLv', n: 10, r: 200 },
  { id: 'a_zoo', text: 'Pet Party', desc: 'Have 4 pets', stat: 'petCount', n: 4, r: 250 },
];

const MAX_PETS = 6;
const ADOPT_PRICE = { cat: 100, dog: 150 };
const DOG_LEVEL = 3; // star level needed for puppies
const petXpNeed = (lv) => 30 + lv * 20;
const ownerXpNeed = (lv) => 50 + lv * 35;

const NAMES = ['Mochi', 'Luna', 'Biscuit', 'Pepper', 'Coco', 'Milo', 'Daisy', 'Ziggy', 'Bubbles', 'Peaches', 'Noodle', 'Pickle',
  'Waffles', 'Sprinkles', 'Muffin', 'Pumpkin', 'Jelly', 'Cookie', 'Nugget', 'Pebbles', 'Marshmallow', 'Twinkle', 'Socks', 'Ginger',
  'Pudding', 'Kiwi', 'Maple', 'Honey', 'Olive', 'Pip', 'Sunny', 'Star', 'Cupcake', 'Taffy', 'Bean', 'Fuzzy'];
const OWNER_NAMES = ['Ava', 'Mia', 'Lily', 'Zoe', 'Ella', 'Rosie', 'Nora', 'Ivy', 'Ruby', 'Maya', 'Leah', 'Ellie', 'Sam', 'Max', 'Leo', 'Finn'];
