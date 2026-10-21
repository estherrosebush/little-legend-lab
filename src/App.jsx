import { useEffect, useMemo, useState } from 'react';
import { NavLink, Route, Routes } from 'react-router-dom';

const DEFAULT_FOOD_FACTS = {
  oats: {
    fact: 'Oats are slow-burning fuel that can help steady your energy so your brain and body don’t crash too fast.',
    body: 'Good for calm, steady focus and long-lasting energy.',
    color: '#f7c873'
  },
  berries: {
    fact: 'Berries are packed with colorful antioxidants that help protect your body and support brain health.',
    body: 'Helpful for brain support and glowing energy.',
    color: '#ff7ca8'
  },
  eggs: {
    fact: 'Eggs give your body protein, which helps build and repair muscles and supports brain function.',
    body: 'Great for staying full and helping your brain work well.',
    color: '#f9e7a3'
  },
  yogurt: {
    fact: 'Yogurt can support your gut, help you feel full, and gives a gentle protein boost.',
    body: 'Good for tummy comfort and steady energy.',
    color: '#d7f1ff'
  },
  spinach: {
    fact: 'Spinach gives you iron and vitamins that help carry oxygen through your body and support focus.',
    body: 'Helps the body feel strong and ready for movement.',
    color: '#7ddf8b'
  },
  banana: {
    fact: 'Bananas are quick fuel for the body and can help your muscles and brain feel ready for activity.',
    body: 'Helpful before a walk, workout, or study session.',
    color: '#f4d35e'
  },
  nuts: {
    fact: 'Nuts are a crunchy source of healthy fats and protein that can keep you going between meals.',
    body: 'Helpful for steady energy and fullness.',
    color: '#d59a60'
  },
  fruit: {
    fact: 'Fruit gives your body vitamins, hydration, and quick energy that can help lift your mood.',
    body: 'A bright, refreshing way to support your body.',
    color: '#ff9a62'
  },
  rice: {
    fact: 'Rice gives your body easy energy that can help you feel ready to learn, move, and explore.',
    body: 'Good fuel for active days.',
    color: '#fbe7a6'
  },
  pasta: {
    fact: 'Pasta can provide energy and help you feel stronger for a busy day of learning and play.',
    body: 'Best with protein and veggies for balance.',
    color: '#f3d69a'
  },
  vegetables: {
    fact: 'Vegetables help your body grow, heal, and stay strong with fiber, vitamins, and minerals.',
    body: 'Colorful veggies help your body and brain feel their best.',
    color: '#7fd77b'
  },
  water: {
    fact: 'Water helps your brain think clearly and helps your body move and digest food well.',
    body: 'A must-have for focus, energy, and feeling good.',
    color: '#7cc6ff'
  },
  sugar: {
    fact: 'Foods with lots of added sugar can give a quick boost, but they can also leave your energy feeling wobbly later.',
    body: 'Best in small amounts, paired with something nourishing.',
    color: '#ff8db1'
  },
  snack: {
    fact: 'Healthy snacks can help your body and brain stay balanced when you need a little support.',
    body: 'A smart snack can help you feel steady and ready.',
    color: '#ffd166'
  }
};

const DEFAULT_CHORES = [
  { id: 1, title: 'Make bed', category: 'Morning', reward: 1, done: false },
  { id: 2, title: 'Brush teeth and hair', category: 'Morning', reward: 1, done: false },
  { id: 3, title: 'Feed pet', category: 'Daily', reward: 1, done: false },
  { id: 4, title: 'Put laundry away', category: 'Home', reward: 2, done: false },
  { id: 5, title: 'Water plants', category: 'Home', reward: 1, done: false },
  { id: 6, title: 'Read for 20 minutes', category: 'Learning', reward: 2, done: false }
];

const DEFAULT_STICKERS = [
  { id: 1, label: 'Focus Star', value: 1, color: '#f7d154', count: 3 },
  { id: 2, label: 'Kindness Star', value: 1, color: '#86d6ff', count: 2 },
  { id: 3, label: 'Creative Spark', value: 1, color: '#ff9ecb', count: 4 }
];

const DEFAULT_MEALS = [
  {
    id: 1,
    type: 'breakfast',
    name: 'Blueberry oatmeal',
    note: 'Warm, cozy, and full of slow energy.',
    energy: 'steady',
    mood: 'happy',
    bodyFeel: 'felt calm and full',
    timestamp: new Date().toISOString()
  },
  {
    id: 2,
    type: 'snack',
    name: 'Apple slices and cheese',
    note: 'Crunchy and satisfying.',
    energy: 'good',
    mood: 'focused',
    bodyFeel: 'not too sleepy',
    timestamp: new Date(Date.now() - 3 * 60 * 60 * 1000).toISOString()
  }
];

const SPORT_QUESTIONS = [
  'Which body signal tells you it is time to take a water break?',
  'What helps your body feel stronger before a game?',
  'When you feel tired, what is a smart move?',
  'What should you do after a burst of active play?' 
];

const ADMIN_USERNAME = 'parent';
const ADMIN_PASSWORD = 'foreststar';

function loadStored(key, fallback) {
  try {
    const value = window.localStorage.getItem(key);
    return value ? JSON.parse(value) : fallback;
  } catch {
    return fallback;
  }
}

function getFoodFact(name) {
  const query = name.toLowerCase();
  const entries = Object.entries(DEFAULT_FOOD_FACTS);
  const match = entries.find(([food]) => query.includes(food));

  if (match) {
    return { ...match[1], name: match[0] };
  }

  if (query.includes('milk') || query.includes('cheese') || query.includes('protein')) {
    return {
      name: 'protein',
      fact: 'Protein helps build strong muscles and keeps hunger from sneaking up too early.',
      body: 'Helpful for a steady, strong day.',
      color: '#c4e4ff'
    };
  }

  return {
    name: 'whole foods',
    fact: 'Whole foods give your body the fuel it needs to think clearly, move, and grow.',
    body: 'Colorful, balanced foods usually help us feel our best.',
    color: '#a7e6a7'
  };
}

function formatTime(value) {
  return new Date(value).toLocaleTimeString([], { hour: 'numeric', minute: '2-digit' });
}

function App() {
  const [meals, setMeals] = useState(() => loadStored('littleLegendMeals', DEFAULT_MEALS));
  const [chores, setChores] = useState(() => loadStored('littleLegendChores', DEFAULT_CHORES));
  const [stickers, setStickers] = useState(() => loadStored('littleLegendStickers', DEFAULT_STICKERS));
  const [adminLoggedIn, setAdminLoggedIn] = useState(() => loadStored('littleLegendAdminLoggedIn', false));
  const [adminLogin, setAdminLogin] = useState({ username: '', password: '' });
  const [newMeal, setNewMeal] = useState({
    name: '',
    type: 'breakfast',
    note: '',
    energy: 'steady',
    mood: 'happy',
    bodyFeel: ''
  });
  const [newChore, setNewChore] = useState({ title: '', category: 'Home', reward: 1 });
  const [newSticker, setNewSticker] = useState({ label: 'Spark Star', value: 1, color: '#ffd166' });
  const [sportQuestionIndex, setSportQuestionIndex] = useState(0);
  const [sportFeedback, setSportFeedback] = useState('');

  useEffect(() => {
    window.localStorage.setItem('littleLegendMeals', JSON.stringify(meals));
  }, [meals]);

  useEffect(() => {
    window.localStorage.setItem('littleLegendChores', JSON.stringify(chores));
  }, [chores]);

  useEffect(() => {
    window.localStorage.setItem('littleLegendStickers', JSON.stringify(stickers));
  }, [stickers]);

  useEffect(() => {
    window.localStorage.setItem('littleLegendAdminLoggedIn', JSON.stringify(adminLoggedIn));
  }, [adminLoggedIn]);

  const totalStickerCount = useMemo(
    () => stickers.reduce((sum, sticker) => sum + Number(sticker.count || 0), 0),
    [stickers]
  );

  const completedChores = chores.filter((chore) => chore.done).length;

  const handleMealSubmit = (event) => {
    event.preventDefault();

    if (!newMeal.name.trim()) {
      return;
    }

    const meal = {
      id: Date.now(),
      type: newMeal.type,
      name: newMeal.name,
      note: newMeal.note,
      energy: newMeal.energy,
      mood: newMeal.mood,
      bodyFeel: newMeal.bodyFeel || 'felt okay',
      timestamp: new Date().toISOString()
    };

    setMeals((current) => [meal, ...current]);
    setNewMeal({ name: '', type: 'breakfast', note: '', energy: 'steady', mood: 'happy', bodyFeel: '' });
  };

  const handleChoreToggle = (id) => {
    setChores((current) =>
      current.map((chore) =>
        chore.id === id ? { ...chore, done: !chore.done } : chore
      )
    );
  };

  const handleAddChore = (event) => {
    event.preventDefault();
    if (!newChore.title.trim()) return;

    setChores((current) => [
      {
        id: Date.now(),
        title: newChore.title,
        category: newChore.category,
        reward: Number(newChore.reward) || 1,
        done: false
      },
      ...current
    ]);

    setNewChore({ title: '', category: 'Home', reward: 1 });
  };

  const handleAddSticker = (event) => {
    event.preventDefault();
    if (!newSticker.label.trim()) return;

    const sticker = {
      id: Date.now(),
      label: newSticker.label,
      value: Number(newSticker.value) || 1,
      color: newSticker.color || '#ffd166',
      count: 1
    };

    setStickers((current) => {
      const exists = current.find((item) => item.label.toLowerCase() === sticker.label.toLowerCase());
      if (exists) {
        return current.map((item) =>
          item.label.toLowerCase() === sticker.label.toLowerCase()
            ? { ...item, count: (item.count || 0) + 1 }
            : item
        );
      }
      return [...current, sticker];
    });

    setNewSticker({ label: 'Spark Star', value: 1, color: '#ffd166' });
  };

  const handleAdminLogin = (event) => {
    event.preventDefault();
    if (
      adminLogin.username === ADMIN_USERNAME &&
      adminLogin.password === ADMIN_PASSWORD
    ) {
      setAdminLoggedIn(true);
      setAdminLogin({ username: '', password: '' });
      return;
    }

    alert('That login did not match. Try parent / foreststar');
  };

  const handleSportAnswer = (option) => {
    const isCorrect = option === 'water' || option === 'movement' || option === 'rest';
    setSportFeedback(
      isCorrect
        ? 'Great choice! Taking care of your body helps you learn and play better.'
        : 'Good try. The best move is often water, rest, or gentle movement when your body needs it.'
    );
    setSportQuestionIndex((current) => (current + 1) % SPORT_QUESTIONS.length);
  };

  return (
    <div className="app-shell">
      <header className="topbar">
        <div className="brand-block">
          <span className="brand-mark">✦</span>
          <div>
            <h1>Little Legend Lab</h1>
            <p>creative learning, cozy habits, and brave discovery</p>
          </div>
        </div>

        <nav className="nav-links" aria-label="Main navigation">
          <NavLink to="/">Home</NavLink>
          <NavLink to="/nutrition">Food & Mood</NavLink>
          <NavLink to="/research">Research Lab</NavLink>
          <NavLink to="/book">Yearbook</NavLink>
          <NavLink to="/chores">Chores</NavLink>
          <NavLink to="/admin">Admin</NavLink>
        </nav>
      </header>

      <main className="page-shell">
        <Routes>
          <Route
            path="/"
            element={
              <Dashboard
                meals={meals}
                chores={chores}
                stickers={stickers}
                totalStickerCount={totalStickerCount}
                completedChores={completedChores}
                sportQuestionIndex={sportQuestionIndex}
                sportFeedback={sportFeedback}
                handleSportAnswer={handleSportAnswer}
              />
            }
          />
          <Route
            path="/nutrition"
            element={
              <NutritionPage
                meals={meals}
                newMeal={newMeal}
                setNewMeal={setNewMeal}
                handleMealSubmit={handleMealSubmit}
              />
            }
          />
          <Route path="/research" element={<ResearchLab />} />
          <Route path="/book" element={<BookBuilder />} />
          <Route
            path="/chores"
            element={<ChorePage chores={chores} handleChoreToggle={handleChoreToggle} />}
          />
          <Route
            path="/admin"
            element={
              <AdminPage
                adminLoggedIn={adminLoggedIn}
                adminLogin={adminLogin}
                setAdminLogin={setAdminLogin}
                handleAdminLogin={handleAdminLogin}
                setAdminLoggedIn={setAdminLoggedIn}
                chores={chores}
                setChores={setChores}
                stickers={stickers}
                setStickers={setStickers}
                newChore={newChore}
                setNewChore={setNewChore}
                handleAddChore={handleAddChore}
                newSticker={newSticker}
                setNewSticker={setNewSticker}
                handleAddSticker={handleAddSticker}
              />
            }
          />
        </Routes>
      </main>
    </div>
  );
}

function Dashboard({ meals, chores, stickers, totalStickerCount, completedChores, sportQuestionIndex, sportFeedback, handleSportAnswer }) {
  const lastMeal = meals[0];
  const dailyFocus = chores.filter((chore) => !chore.done).slice(0, 3);

  return (
    <div className="dashboard-grid">
      <section className="panel hero-panel">
        <div>
          <p className="eyebrow">Today’s quest</p>
          <h2>Make a brave, beautiful day.</h2>
        </div>
        <div className="hero-badges">
          <span>🌞 Morning rhythm</span>
          <span>🍎 Food awareness</span>
          <span>🎨 Creative writing</span>
        </div>
      </section>

      <section className="panel color-card purple">
        <p className="eyebrow">Focus timer</p>
        <PomodoroTimer />
      </section>

      <section className="panel color-card blue">
        <p className="eyebrow">Self care</p>
        <ul className="mini-list">
          <li>Drink water</li>
          <li>Stretch for 2 minutes</li>
          <li>Take a quiet reset</li>
        </ul>
      </section>

      <section className="panel color-card peach">
        <p className="eyebrow">Food spark</p>
        {lastMeal ? (
          <div>
            <h3>{lastMeal.name}</h3>
            <p>{getFoodFact(lastMeal.name).fact}</p>
          </div>
        ) : (
          <p>Log a snack or meal to see your nutrition card.</p>
        )}
      </section>

      <section className="panel color-card green">
        <p className="eyebrow">Sticker chart</p>
        <div className="big-stat">{totalStickerCount}</div>
        <p>stars earned this week</p>
        <div className="sticker-row">
          {stickers.map((sticker) => (
            <span key={sticker.id} className="sticker-dot" style={{ background: sticker.color }} title={sticker.label}>
              {sticker.count}
            </span>
          ))}
        </div>
      </section>

      <section className="panel color-card yellow">
        <p className="eyebrow">Daily mission</p>
        {dailyFocus.length ? (
          <ul className="mini-list">
            {dailyFocus.map((chore) => (
              <li key={chore.id}>{chore.title}</li>
            ))}
          </ul>
        ) : (
          <p>Everything is complete! You did a great job.</p>
        )}
        <small>{completedChores} of {chores.length} chores done</small>
      </section>

      <section className="panel movement-panel">
        <p className="eyebrow">Move & answer</p>
        <h3>{SPORT_QUESTIONS[sportQuestionIndex]}</h3>
        <div className="movement-options">
          <button onClick={() => handleSportAnswer('water')}>Water</button>
          <button onClick={() => handleSportAnswer('movement')}>Movement</button>
          <button onClick={() => handleSportAnswer('rest')}>Rest</button>
        </div>
        {sportFeedback && <p className="feedback-note">{sportFeedback}</p>}
      </section>
    </div>
  );
}

function PomodoroTimer() {
  const [isRunning, setIsRunning] = useState(false);
  const [mode, setMode] = useState('work');
  const [secondsLeft, setSecondsLeft] = useState(25 * 60);

  useEffect(() => {
    if (!isRunning) return;

    const timer = setInterval(() => {
      setSecondsLeft((current) => {
        if (current <= 1) {
          const nextMode = mode === 'work' ? 'break' : 'work';
          setMode(nextMode);
          return nextMode === 'work' ? 25 * 60 : 5 * 60;
        }
        return current - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [isRunning, mode]);

  const minutes = Math.floor(secondsLeft / 60)
    .toString()
    .padStart(2, '0');
  const seconds = (secondsLeft % 60).toString().padStart(2, '0');

  const toggleTimer = () => setIsRunning((current) => !current);
  const resetTimer = () => {
    setIsRunning(false);
    setMode('work');
    setSecondsLeft(25 * 60);
  };

  return (
    <div className="timer-box">
      <span className="timer-mode">{mode === 'work' ? 'Focus sprint' : 'Reset break'}</span>
      <div className="timer-clock">
        {minutes}:{seconds}
      </div>
      <div className="timer-actions">
        <button onClick={toggleTimer}>{isRunning ? 'Pause' : 'Start'}</button>
        <button className="secondary" onClick={resetTimer}>Reset</button>
      </div>
    </div>
  );
}

function NutritionPage({ meals, newMeal, setNewMeal, handleMealSubmit }) {
  return (
    <div className="content-grid">
      <section className="panel">
        <p className="eyebrow">Nutrition log</p>
        <h2>What did your body eat today?</h2>

        <form className="form-stack" onSubmit={handleMealSubmit}>
          <label>
            Food or meal
            <input
              value={newMeal.name}
              onChange={(event) => setNewMeal({ ...newMeal, name: event.target.value })}
              placeholder="Blueberry smoothie"
            />
          </label>

          <div className="inline-fields">
            <label>
              Type
              <select
                value={newMeal.type}
                onChange={(event) => setNewMeal({ ...newMeal, type: event.target.value })}
              >
                <option value="breakfast">Breakfast</option>
                <option value="lunch">Lunch</option>
                <option value="snack">Snack</option>
                <option value="dinner">Dinner</option>
                <option value="drink">Drink</option>
              </select>
            </label>

            <label>
              Energy after eating
              <select
                value={newMeal.energy}
                onChange={(event) => setNewMeal({ ...newMeal, energy: event.target.value })}
              >
                <option value="steady">Steady</option>
                <option value="good">Good</option>
                <option value="sleepy">Sleepy</option>
                <option value="wobbly">Wobbly</option>
              </select>
            </label>
          </div>

          <label>
            How did it make you feel?
            <select
              value={newMeal.mood}
              onChange={(event) => setNewMeal({ ...newMeal, mood: event.target.value })}
            >
              <option value="happy">Happy</option>
              <option value="focused">Focused</option>
              <option value="calm">Calm</option>
              <option value="tired">Tired</option>
              <option value="giggly">Giggly</option>
            </select>
          </label>

          <label>
            What did your body notice?
            <input
              value={newMeal.bodyFeel}
              onChange={(event) => setNewMeal({ ...newMeal, bodyFeel: event.target.value })}
              placeholder="felt full, had energy, tummy felt good"
            />
          </label>

          <label>
            Notes
            <textarea
              value={newMeal.note}
              onChange={(event) => setNewMeal({ ...newMeal, note: event.target.value })}
              placeholder="This tasted yummy and helped me feel ready to create."
            />
          </label>

          <button type="submit">Save meal</button>
        </form>
      </section>

      <section className="panel">
        <p className="eyebrow">Nutrition cards</p>
        <h2>What each food is helping with</h2>
        <div className="meal-list">
          {meals.map((meal) => {
            const foodInfo = getFoodFact(meal.name);
            return (
              <article key={meal.id} className="food-card" style={{ borderColor: foodInfo.color }}>
                <div className="food-card-top">
                  <span className="pill">{meal.type}</span>
                  <span>{formatTime(meal.timestamp)}</span>
                </div>
                <h3>{meal.name}</h3>
                <p><strong>Food fact:</strong> {foodInfo.fact}</p>
                <p><strong>Body note:</strong> {foodInfo.body}</p>
                <p><strong>Mood after:</strong> {meal.mood}</p>
                <p><strong>Energy:</strong> {meal.energy}</p>
                <p><strong>Body felt:</strong> {meal.bodyFeel}</p>
                {meal.note && <p><strong>Notes:</strong> {meal.note}</p>}
              </article>
            );
          })}
        </div>
      </section>
    </div>
  );
}

function ResearchLab() {
  return (
    <div className="content-grid single-column">
      <section className="panel">
        <p className="eyebrow">Research lab</p>
        <h2>Ask a question, gather clues, and learn like a brave explorer.</h2>

        <div className="research-grid">
          <div className="research-box">
            <h3>My question</h3>
            <textarea placeholder="How do bats find their way in the dark?" />
          </div>
          <div className="research-box">
            <h3>What I think</h3>
            <textarea placeholder="I think they use sound because they are very good at listening." />
          </div>
          <div className="research-box">
            <h3>What I learned</h3>
            <textarea placeholder="Bats use echolocation to send out sound waves and hear echoes." />
          </div>
          <div className="research-box">
            <h3>What I wonder next</h3>
            <textarea placeholder="How do different animals use sound to travel or hunt?" />
          </div>
        </div>
      </section>
    </div>
  );
}

function BookBuilder() {
  return (
    <div className="content-grid single-column">
      <section className="panel">
        <p className="eyebrow">Waldorf style yearbook</p>
        <h2>Build your own story-rich textbook.</h2>

        <div className="book-grid">
          <div className="chapter-card">
            <span>Chapter 1</span>
            <h3>My Nature Journal</h3>
            <textarea placeholder="Write about a tree, a bird, or a sky observation." />
          </div>
          <div className="chapter-card">
            <span>Chapter 2</span>
            <h3>My Character Sketch</h3>
            <textarea placeholder="Describe your hero: what do they love, fear, and dream?" />
          </div>
          <div className="chapter-card">
            <span>Chapter 3</span>
            <h3>My Worldbuilding Map</h3>
            <textarea placeholder="Draw or describe your kingdom, forest, or magical city." />
          </div>
          <div className="chapter-card">
            <span>Chapter 4</span>
            <h3>My Story Spark</h3>
            <textarea placeholder="What is the problem, the clue, and the final twist?" />
          </div>
        </div>
      </section>
    </div>
  );
}

function ChorePage({ chores, handleChoreToggle }) {
  return (
    <div className="content-grid single-column">
      <section className="panel">
        <p className="eyebrow">Chore tracker</p>
        <h2>Little tasks, big habits.</h2>

        <div className="chore-list">
          {chores.map((chore) => (
            <label key={chore.id} className={`chore-item ${chore.done ? 'done' : ''}`}>
              <input
                type="checkbox"
                checked={chore.done}
                onChange={() => handleChoreToggle(chore.id)}
              />
              <div>
                <strong>{chore.title}</strong>
                <span>{chore.category}</span>
              </div>
              <span className="reward-badge">+{chore.reward} star</span>
            </label>
          ))}
        </div>
      </section>
    </div>
  );
}

function AdminPage({
  adminLoggedIn,
  adminLogin,
  setAdminLogin,
  handleAdminLogin,
  setAdminLoggedIn,
  chores,
  setChores,
  stickers,
  setStickers,
  newChore,
  setNewChore,
  handleAddChore,
  newSticker,
  setNewSticker,
  handleAddSticker
}) {
  if (!adminLoggedIn) {
    return (
      <div className="content-grid single-column">
        <section className="panel">
          <p className="eyebrow">Parent admin</p>
          <h2>Login to edit chores and sticker rewards</h2>
          <form className="form-stack" onSubmit={handleAdminLogin}>
            <label>
              Username
              <input
                value={adminLogin.username}
                onChange={(event) => setAdminLogin({ ...adminLogin, username: event.target.value })}
                placeholder="parent"
              />
            </label>
            <label>
              Password
              <input
                type="password"
                value={adminLogin.password}
                onChange={(event) => setAdminLogin({ ...adminLogin, password: event.target.value })}
                placeholder="foreststar"
              />
            </label>
            <button type="submit">Enter admin dashboard</button>
          </form>
        </section>
      </div>
    );
  }

  const removeChore = (id) => {
    setChores((current) => current.filter((chore) => chore.id !== id));
  };

  const addStickerToChart = (label) => {
    setStickers((current) =>
      current.map((item) =>
        item.label.toLowerCase() === label.toLowerCase()
          ? { ...item, count: (item.count || 0) + 1 }
          : item
      )
    );
  };

  return (
    <div className="content-grid admin-grid">
      <section className="panel">
        <div className="admin-header">
          <div>
            <p className="eyebrow">Parent admin</p>
            <h2>Manage chores and stars</h2>
          </div>
          <button className="secondary" onClick={() => setAdminLoggedIn(false)}>Log out</button>
        </div>

        <form className="form-stack" onSubmit={handleAddChore}>
          <h3>Add chore</h3>
          <label>
            Chore name
            <input
              value={newChore.title}
              onChange={(event) => setNewChore({ ...newChore, title: event.target.value })}
              placeholder="Fold towels"
            />
          </label>
          <div className="inline-fields">
            <label>
              Category
              <input
                value={newChore.category}
                onChange={(event) => setNewChore({ ...newChore, category: event.target.value })}
              />
            </label>
            <label>
              Reward stars
              <input
                type="number"
                min="1"
                value={newChore.reward}
                onChange={(event) => setNewChore({ ...newChore, reward: event.target.value })}
              />
            </label>
          </div>
          <button type="submit">Add chore</button>
        </form>

        <div className="admin-list">
          {chores.map((chore) => (
            <div key={chore.id} className="admin-row">
              <div>
                <strong>{chore.title}</strong>
                <span>{chore.category}</span>
              </div>
              <button className="secondary" onClick={() => removeChore(chore.id)}>Remove</button>
            </div>
          ))}
        </div>
      </section>

      <section className="panel">
        <form className="form-stack" onSubmit={handleAddSticker}>
          <h3>Add sticker type</h3>
          <label>
            Sticker label
            <input
              value={newSticker.label}
              onChange={(event) => setNewSticker({ ...newSticker, label: event.target.value })}
            />
          </label>
          <div className="inline-fields">
            <label>
              Value
              <input
                type="number"
                min="1"
                value={newSticker.value}
                onChange={(event) => setNewSticker({ ...newSticker, value: event.target.value })}
              />
            </label>
            <label>
              Color
              <input
                type="color"
                value={newSticker.color}
                onChange={(event) => setNewSticker({ ...newSticker, color: event.target.value })}
              />
            </label>
          </div>
          <button type="submit">Add sticker to chart</button>
        </form>

        <div className="sticker-chart-list">
          {stickers.map((sticker) => (
            <div key={sticker.id} className="sticker-card">
              <span className="sticker-swatch" style={{ background: sticker.color }} />
              <div>
                <strong>{sticker.label}</strong>
                <p>{sticker.count || 0} earned</p>
              </div>
              <button className="secondary" onClick={() => addStickerToChart(sticker.label)}>+1</button>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}

export default App;
