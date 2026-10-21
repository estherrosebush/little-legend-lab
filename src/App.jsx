import { useEffect, useMemo, useState } from 'react';
import { Link, NavLink, Route, Routes } from 'react-router-dom';
import { useAppState } from './context/AppState.jsx';
import { TimeClockPage } from './pages/TimeClockPage.jsx';
import { ProjectsPage } from './pages/ProjectsPage.jsx';
import { CreaturePage } from './pages/CreaturePage.jsx';
import { ShopPage } from './pages/ShopPage.jsx';
import { FlipbookPage } from './pages/FlipbookPage.jsx';
import { StoryStudioPage } from './pages/StoryStudioPage.jsx';
import { CuriosityLabPage } from './pages/CuriosityLabPage.jsx';
import { ClassroomPage } from './pages/ClassroomPage.jsx';
import { CalendarPage } from './pages/CalendarPage.jsx';

const DEFAULT_FOOD_FACTS = {
  oats: {
    fact: 'Oats are a slow-release carb, so they fuel you steadily through long school days and practices without the crash.',
    body: 'Great for steady focus and long-lasting energy.',
    color: '#f7c873'
  },
  berries: {
    fact: 'Berries are loaded with antioxidants and vitamin C, which support your brain and immune system.',
    body: 'Helpful for brain power and glowing energy.',
    color: '#ff7ca8'
  },
  eggs: {
    fact: 'Eggs pack complete protein plus choline, a nutrient your brain uses to build memory and focus.',
    body: 'Great for staying full and thinking clearly.',
    color: '#f9e7a3'
  },
  yogurt: {
    fact: 'Yogurt delivers protein, calcium, and probiotics — good for bones, muscles, and your gut.',
    body: 'Good for strong bones and steady energy.',
    color: '#d7f1ff'
  },
  spinach: {
    fact: 'Spinach brings iron and folate, which help your blood carry oxygen to your muscles and brain.',
    body: 'Helps you feel strong and ready for anything.',
    color: '#7ddf8b'
  },
  banana: {
    fact: 'Bananas are quick carbs plus potassium, which helps your muscles fire during sports and workouts.',
    body: 'Smart fuel before practice, a walk, or a study session.',
    color: '#f4d35e'
  },
  nuts: {
    fact: 'Nuts combine healthy fats, protein, and fiber to keep you full and focused between meals.',
    body: 'Great for lasting energy between classes.',
    color: '#d59a60'
  },
  fruit: {
    fact: 'Fruit gives you fast carbs, water, and vitamins — a smart pick-me-up before or after activity.',
    body: 'A fresh way to recharge your body.',
    color: '#ff9a62'
  },
  rice: {
    fact: 'Rice is easy-to-digest fuel that tops off your energy stores before practice or a busy day.',
    body: 'Good fuel for active days.',
    color: '#fbe7a6'
  },
  pasta: {
    fact: 'Pasta is a carb-loading classic; pair it with protein and veggies for energy that lasts.',
    body: 'Best with protein and veggies for balance.',
    color: '#f3d69a'
  },
  vegetables: {
    fact: 'Vegetables bring fiber, vitamins, and minerals that help you grow stronger and recover faster.',
    body: 'Colorful veggies help your body and brain perform their best.',
    color: '#7fd77b'
  },
  water: {
    fact: 'Even mild dehydration measurably drops focus and energy — water keeps your brain and muscles online.',
    body: 'Non-negotiable for focus, energy, and feeling good.',
    color: '#7cc6ff'
  },
  sugar: {
    fact: 'Added sugar spikes your energy fast, then drops it hard — fine sometimes, best paired with protein or fiber.',
    body: 'Best in small amounts, balanced with something nourishing.',
    color: '#ff8db1'
  },
  snack: {
    fact: 'A smart snack pairs carbs with protein or fat to keep your energy and mood even.',
    body: 'A smart snack keeps you steady and ready.',
    color: '#ffd166'
  }
};

const DEFAULT_CHORES = [
  { id: 1, title: 'Tidy bedroom', category: 'Morning', reward: 1, done: false },
  { id: 2, title: 'Get ready without reminders', category: 'Morning', reward: 1, done: false },
  { id: 3, title: 'Homework block', category: 'School', reward: 2, done: false },
  { id: 4, title: 'Practice instrument — 20 minutes', category: 'Creative', reward: 2, done: false },
  { id: 5, title: 'Load or empty the dishwasher', category: 'Home', reward: 1, done: false },
  { id: 6, title: 'Walk the dog', category: 'Home', reward: 1, done: false },
  { id: 7, title: 'Read for 30 minutes', category: 'School', reward: 2, done: false }
];

const DEFAULT_STICKERS = [
  { id: 1, label: 'Focus Badge', value: 1, color: '#f7d154', count: 3 },
  { id: 2, label: 'Kindness Badge', value: 1, color: '#86d6ff', count: 2 },
  { id: 3, label: 'Creator Badge', value: 1, color: '#ff9ecb', count: 4 }
];

const DEFAULT_MEALS = [
  {
    id: 1,
    type: 'breakfast',
    name: 'Blueberry oatmeal',
    note: 'Kept me full through the whole morning.',
    energy: 'steady',
    mood: 'happy',
    bodyFeel: 'calm and full',
    timestamp: new Date().toISOString()
  },
  {
    id: 2,
    type: 'snack',
    name: 'Apple slices and cheese',
    note: 'Crunchy and satisfying.',
    energy: 'good',
    mood: 'focused',
    bodyFeel: 'no afternoon slump',
    timestamp: new Date(Date.now() - 3 * 60 * 60 * 1000).toISOString()
  }
];

const QUIZ_QUESTIONS = [
  {
    question: 'You have a big test tomorrow. What helps your brain the most tonight?',
    options: ['A full night of sleep', 'Extra late-night screen time', 'Skimming notes while snacking'],
    correct: 0,
    why: 'Sleep is when your brain files away what you learned — it is the ultimate study hack.'
  },
  {
    question: 'Halfway through soccer practice, what does your body need most?',
    options: ['Sugary soda', 'Water and a quick breather', 'Push harder, no stopping'],
    correct: 1,
    why: 'Hydration plus short breaks keeps your muscles and focus sharp for the whole session.'
  },
  {
    question: 'You have been doing homework for 45 minutes. The smartest next move?',
    options: ['Power through for 2 more hours', 'Take a 5-minute movement break', 'Switch to social media'],
    correct: 1,
    why: 'Short movement breaks reset your attention so the next block of work goes faster.'
  },
  {
    question: 'The smartest way to warm up before a game or workout is…',
    options: ['Sprint at full speed right away', 'Skip the warm-up', 'Light movement, then dynamic stretches'],
    correct: 2,
    why: 'Warming up raises your heart rate gradually and protects your muscles from strains.'
  },
  {
    question: 'Your legs are sore two days after practice. That is mostly…',
    options: ['A sign you should never train again', 'Normal muscle recovery and repair', 'Proof you need extra sugar'],
    correct: 1,
    why: 'Next-day soreness is your muscles rebuilding stronger — rest, water, and gentle movement help.'
  }
];

const ADMIN_USERNAME = 'Estherrosebush';
const ADMIN_PASSWORD = 'gonnabemyday';

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
      fact: 'Protein builds and repairs muscle and keeps hunger from sneaking up early — great after sports.',
      body: 'Helpful for a strong, steady day.',
      color: '#c4e4ff'
    };
  }

  return {
    name: 'whole foods',
    fact: 'Whole foods give your body the nutrients it needs to think, move, and recover. Colorful, balanced plates usually win.',
    body: 'Colorful, balanced foods usually help us feel our best.',
    color: '#a7e6a7'
  };
}

function formatTime(value) {
  return new Date(value).toLocaleTimeString([], { hour: 'numeric', minute: '2-digit' });
}

function App() {
  const { grantStars } = useAppState();
  const [meals, setMeals] = useState(() => loadStored('legendLabMeals', DEFAULT_MEALS));
  const [chores, setChores] = useState(() => loadStored('legendLabChores', DEFAULT_CHORES));
  const [stickers, setStickers] = useState(() => loadStored('legendLabStickers', DEFAULT_STICKERS));
  const [adminLoggedIn, setAdminLoggedIn] = useState(() => loadStored('legendLabAdminLoggedIn', false));
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
  const [newSticker, setNewSticker] = useState({ label: 'Creator Badge', value: 1, color: '#ffd166' });
  const [quizQuestionIndex, setQuizQuestionIndex] = useState(0);
  const [quizFeedback, setQuizFeedback] = useState('');
  const [menuOpen, setMenuOpen] = useState(false);

  useEffect(() => {
    window.localStorage.setItem('legendLabMeals', JSON.stringify(meals));
  }, [meals]);

  useEffect(() => {
    window.localStorage.setItem('legendLabChores', JSON.stringify(chores));
  }, [chores]);

  useEffect(() => {
    window.localStorage.setItem('legendLabStickers', JSON.stringify(stickers));
  }, [stickers]);

  useEffect(() => {
    window.localStorage.setItem('legendLabAdminLoggedIn', JSON.stringify(adminLoggedIn));
  }, [adminLoggedIn]);

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

  const handleQuizAnswer = (optionIndex) => {
    if (quizFeedback) return;

    const question = QUIZ_QUESTIONS[quizQuestionIndex];
    const isCorrect = optionIndex === question.correct;
    setQuizFeedback(isCorrect ? `Correct! ${question.why}` : `Not quite — ${question.why}`);

    window.setTimeout(() => {
      setQuizFeedback('');
      setQuizQuestionIndex((current) => (current + 1) % QUIZ_QUESTIONS.length);
    }, 2800);
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

    setNewSticker({ label: 'Creator Badge', value: 1, color: '#ffd166' });
  };

  const handleAdminLogin = (event) => {
    event.preventDefault();
    if (
      adminLogin.username.trim().toLowerCase() === ADMIN_USERNAME.toLowerCase() &&
      adminLogin.password === ADMIN_PASSWORD
    ) {
      setAdminLoggedIn(true);
      setAdminLogin({ username: '', password: '' });
      return;
    }

    alert('That login did not match. Ask a parent to try again.');
  };

  const handleChoreToggle = async (id) => {
    const chore = chores.find((item) => item.id === id);
    const willBeDone = Boolean(chore && !chore.done);
    setChores((current) =>
      current.map((item) => (item.id === id ? { ...item, done: !item.done } : item))
    );

    if (willBeDone && chore.reward > 0 && !chore.rewarded) {
      try {
        await grantStars(chore.reward);
        setChores((current) =>
          current.map((item) => (item.id === id ? { ...item, rewarded: true } : item))
        );
      } catch {
        // Stars stay ungranted so the reward can be retried later.
      }
    }
  };

  return (
    <div className="app-shell">
      <header className="topbar">
        <div className="brand-block">
          <span className="brand-mark">⚡</span>
          <div>
            <h1>Legend Lab</h1>
            <p>plan it, track it, level up</p>
          </div>
        </div>

        <nav className={`nav-dropdown ${menuOpen ? 'open' : ''}`} aria-label="Main navigation">
          <button
            className="nav-toggle"
            aria-expanded={menuOpen}
            onClick={() => setMenuOpen((current) => !current)}
          >
            <span className="nav-burger" aria-hidden="true">
              <span /><span /><span />
            </span>
            Menu
          </button>
          <div className="nav-menu">
            {[
              ['/', 'Home'],
              ['/classrooms', 'Classrooms'],
              ['/calendar', 'Calendar'],
              ['/time', 'Time Clock'],
              ['/projects', 'Projects'],
              ['/nutrition', 'Food & Mood'],
              ['/chores', 'Quests'],
              ['/pet', 'My Creature'],
              ['/shop', 'Star Shop'],
              ['/research', 'Curiosity Lab'],
              ['/book', 'Story Studio'],
              ['/yearbook', 'Yearbook'],
              ['/admin', 'Parent Zone']
            ].map(([to, label]) => (
              <NavLink key={to} to={to} end={to === '/'} onClick={() => setMenuOpen(false)}>
                {label}
              </NavLink>
            ))}
          </div>
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
                completedChores={completedChores}
                quizQuestionIndex={quizQuestionIndex}
                quizFeedback={quizFeedback}
                handleQuizAnswer={handleQuizAnswer}
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
          <Route path="/research" element={<CuriosityLabPage />} />
          <Route path="/book" element={<StoryStudioPage />} />
          <Route path="/classrooms" element={<ClassroomPage />} />
          <Route path="/calendar" element={<CalendarPage />} />
          <Route path="/time" element={<TimeClockPage />} />
          <Route path="/projects" element={<ProjectsPage />} />
          <Route path="/pet" element={<CreaturePage chores={chores} stickers={stickers} />} />
          <Route path="/shop" element={<ShopPage />} />
          <Route path="/yearbook" element={<FlipbookPage chores={chores} stickers={stickers} />} />
          <Route
            path="/chores"
            element={<QuestPage chores={chores} handleChoreToggle={handleChoreToggle} />}
          />
          <Route
            path="/admin"
            element={
              <ParentZonePage
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

const KIND_META = {
  event: { icon: '📌', label: 'Event' },
  activity: { icon: '🏃', label: 'Activity' },
  goal: { icon: '🎯', label: 'Goal' }
};

function dayKey(date) {
  const month = `${date.getMonth() + 1}`.padStart(2, '0');
  const day = `${date.getDate()}`.padStart(2, '0');
  return `${date.getFullYear()}-${month}-${day}`;
}

function Dashboard({ meals, chores, stickers, completedChores, quizQuestionIndex, quizFeedback, handleQuizAnswer }) {
  const { profile, starBalance, classrooms, calendar, updateCalendarItem } = useAppState();
  const lastMeal = meals[0];
  const dailyFocus = chores.filter((chore) => !chore.done).slice(0, 3);
  const quizQuestion = QUIZ_QUESTIONS[quizQuestionIndex];
  const today = dayKey(new Date());

  const todayItems = useMemo(
    () =>
      calendar
        .filter((item) => item.date === today)
        .sort((a, b) => (a.time || '99:99').localeCompare(b.time || '99:99')),
    [calendar, today]
  );
  const doneToday = todayItems.filter((item) => item.done === 'yes').length;
  const nextUp = todayItems.find((item) => item.done !== 'yes');
  const allGoals = calendar.filter((item) => item.kind === 'goal');
  const goalsDone = allGoals.filter((item) => item.done === 'yes').length;

  const toggleItem = async (item) => {
    await updateCalendarItem(item.id, { done: item.done === 'yes' ? 'no' : 'yes' });
  };

  return (
    <div className="dashboard-grid">
      <section className="panel hero-panel">
        <div>
          <p className="eyebrow">Your day ahead</p>
          <h2>
            {new Date().toLocaleDateString([], { weekday: 'long', month: 'long', day: 'numeric' })}
          </h2>
          <p className="muted-note">
            {todayItems.length
              ? `${todayItems.length} thing${todayItems.length === 1 ? '' : 's'} planned today · ${doneToday} done`
              : 'Nothing on the calendar yet — plan your day!'}
          </p>
          {nextUp && (
            <div className="next-up">
              <span className="pill">Next up{nextUp.time ? ` · ${nextUp.time}` : ''}</span>
              <h3>{nextUp.title}</h3>
            </div>
          )}
        </div>
        <div className="hero-badges">
          <span>🌅 Morning routine</span>
          <span>🥗 Fuel &amp; focus</span>
          <span>🎨 Creative time</span>
        </div>
      </section>

      <section className="panel color-card teal">
        <p className="eyebrow">Today’s schedule</p>
        {todayItems.length ? (
          <ul className="calendar-item-list compact">
            {todayItems.map((item) => {
              const meta = KIND_META[item.kind] || KIND_META.event;
              const room = classrooms.find((classroom) => classroom.id === item.classroomId);
              return (
                <li key={item.id} className={`calendar-row compact ${item.done === 'yes' ? 'done' : ''}`}>
                  <div className="calendar-row-main">
                    <button
                      className="calendar-check"
                      onClick={() => toggleItem(item)}
                      aria-label={item.done === 'yes' ? 'Mark as not done' : 'Mark as done'}
                    >
                      {item.done === 'yes' ? '✓' : ''}
                    </button>
                    <div>
                      <strong>{item.title}</strong>
                      <span className="calendar-meta">
                        {item.time && <span>🕒 {item.time}</span>}
                        <span>{meta.icon} {meta.label}</span>
                        {room && <span>{room.emoji} {room.name}</span>}
                      </span>
                    </div>
                  </div>
                </li>
              );
            })}
          </ul>
        ) : (
          <p>
            A blank day — add events, activities, and goals in the{' '}
            <Link to="/calendar">Calendar</Link>.
          </p>
        )}
        <Link to="/calendar" className="ghost-link">Open the live calendar →</Link>
      </section>

      <section className="panel color-card purple">
        <p className="eyebrow">Focus timer</p>
        <PomodoroTimer />
      </section>

      <section className="panel color-card blue">
        <p className="eyebrow">My classrooms</p>
        {classrooms.length ? (
          <div className="picker-row wrap">
            {classrooms.map((room) => (
              <Link
                key={room.id}
                to="/classrooms"
                className="starter-chip"
                style={{ borderColor: room.color }}
              >
                {room.emoji} {room.name}
              </Link>
            ))}
          </div>
        ) : (
          <p>
            Set up each subject like its own digital classroom in{' '}
            <Link to="/classrooms">Classrooms</Link>.
          </p>
        )}
        <small>
          Goals: {goalsDone}/{allGoals.length} complete
        </small>
      </section>

      <section className="panel color-card peach">
        <p className="eyebrow">Food spark</p>
        {lastMeal ? (
          <div>
            <h3>{lastMeal.name}</h3>
            <p>{getFoodFact(lastMeal.name).fact}</p>
          </div>
        ) : (
          <p>Log a snack or meal to see what it is doing for you.</p>
        )}
      </section>

      <section className="panel color-card green">
        <p className="eyebrow">Star wallet</p>
        <div className="big-stat">⭐ {profile ? starBalance : '—'}</div>
        <p>stars ready to spend in the shop</p>
        <div className="sticker-row">
          {stickers.map((sticker) => (
            <span key={sticker.id} className="sticker-dot" style={{ background: sticker.color }} title={sticker.label}>
              {sticker.count}
            </span>
          ))}
        </div>
        <Link to="/shop" className="ghost-link">Visit the Star Shop →</Link>
      </section>

      <section className="panel color-card yellow">
        <p className="eyebrow">Today’s quests</p>
        {dailyFocus.length ? (
          <ul className="mini-list">
            {dailyFocus.map((chore) => (
              <li key={chore.id}>{chore.title}</li>
            ))}
          </ul>
        ) : (
          <p>All quests complete. Level cleared!</p>
        )}
        <small>{completedChores} of {chores.length} quests done</small>
      </section>

      <section className="panel movement-panel">
        <p className="eyebrow">Brain &amp; body check</p>
        <h3>{quizQuestion.question}</h3>
        <div className="movement-options">
          {quizQuestion.options.map((option, index) => (
            <button key={option} onClick={() => handleQuizAnswer(index)}>{option}</button>
          ))}
        </div>
        {quizFeedback && <p className="feedback-note">{quizFeedback}</p>}
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
      <span className="timer-mode">{mode === 'work' ? 'Focus session' : 'Brain break'}</span>
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
        <p className="eyebrow">Food log</p>
        <h2>What did you eat today?</h2>

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
                <option value="energized">Energized</option>
                <option value="sluggish">Sluggish</option>
                <option value="jittery">Jittery</option>
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
              <option value="meh">Meh</option>
            </select>
          </label>

          <label>
            What did you notice?
            <input
              value={newMeal.bodyFeel}
              onChange={(event) => setNewMeal({ ...newMeal, bodyFeel: event.target.value })}
              placeholder="steady energy, no headache, stayed full"
            />
          </label>

          <label>
            Notes
            <textarea
              value={newMeal.note}
              onChange={(event) => setNewMeal({ ...newMeal, note: event.target.value })}
              placeholder="Tasted amazing and powered my study session."
            />
          </label>

          <button type="submit">Log it</button>
        </form>
      </section>

      <section className="panel">
        <p className="eyebrow">Food intel</p>
        <h2>What each food is doing for you</h2>
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
                <p><strong>Why it helps:</strong> {foodInfo.body}</p>
                <p><strong>Mood after:</strong> {meal.mood}</p>
                <p><strong>Energy:</strong> {meal.energy}</p>
                <p><strong>Noticed:</strong> {meal.bodyFeel}</p>
                {meal.note && <p><strong>Notes:</strong> {meal.note}</p>}
              </article>
            );
          })}
        </div>
      </section>
    </div>
  );
}

function QuestPage({ chores, handleChoreToggle }) {
  return (
    <div className="content-grid single-column">
      <section className="panel">
        <p className="eyebrow">Quest log</p>
        <h2>Level up, one quest at a time.</h2>

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
              <span className="reward-badge">+{chore.reward} ⭐</span>
            </label>
          ))}
        </div>
      </section>
    </div>
  );
}

function ParentZonePage({
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
  const { grantStars, profile } = useAppState();
  const [starsAmount, setStarsAmount] = useState('5');
  const [starsFeedback, setStarsFeedback] = useState('');

  const handleGiveStars = async (event) => {
    event.preventDefault();
    setStarsFeedback('');
    const amount = Math.round(Number(starsAmount));
    if (!Number.isFinite(amount) || amount === 0) {
      setStarsFeedback('Enter a non-zero amount.');
      return;
    }
    try {
      const data = await grantStars(amount);
      setStarsFeedback(`Done — bank is now ${data.profile.starBank} stars earned.`);
    } catch (err) {
      setStarsFeedback(err.message);
    }
  };

  if (!adminLoggedIn) {
    return (
      <div className="content-grid single-column">
        <section className="panel">
          <p className="eyebrow">Parent zone</p>
          <h2>Parent access — manage quests, badges, and stars</h2>
          <form className="form-stack" onSubmit={handleAdminLogin}>
            <label>
              Username
              <input
                value={adminLogin.username}
                onChange={(event) => setAdminLogin({ ...adminLogin, username: event.target.value })}
                placeholder="your username"
              />
            </label>
            <label>
              Password
              <input
                type="password"
                value={adminLogin.password}
                onChange={(event) => setAdminLogin({ ...adminLogin, password: event.target.value })}
                placeholder="••••••••"
              />
            </label>
            <button type="submit">Enter parent dashboard</button>
          </form>
        </section>
      </div>
    );
  }

  const removeChore = (id) => {
    setChores((current) => current.filter((chore) => chore.id !== id));
  };

  const addBadgeToChart = (label) => {
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
            <p className="eyebrow">Parent zone</p>
            <h2>Manage quests and XP</h2>
          </div>
          <button className="secondary" onClick={() => setAdminLoggedIn(false)}>Log out</button>
        </div>

        <form className="form-stack" onSubmit={handleAddChore}>
          <h3>Add quest</h3>
          <label>
            Quest name
            <input
              value={newChore.title}
              onChange={(event) => setNewChore({ ...newChore, title: event.target.value })}
              placeholder="Fold laundry"
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
          <button type="submit">Add quest</button>
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
          <h3>Add badge type</h3>
          <label>
            Badge name
            <input
              value={newSticker.label}
              onChange={(event) => setNewSticker({ ...newSticker, label: event.target.value })}
            />
          </label>
          <div className="inline-fields">
            <label>
              Star value
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
          <button type="submit">Add badge</button>
        </form>

        <div className="sticker-chart-list">
          {stickers.map((sticker) => (
            <div key={sticker.id} className="sticker-card">
              <span className="sticker-swatch" style={{ background: sticker.color }} />
              <div>
                <strong>{sticker.label}</strong>
                <p>{sticker.count || 0} earned</p>
              </div>
              <button className="secondary" onClick={() => addBadgeToChart(sticker.label)}>+1</button>
            </div>
          ))}
        </div>
      </section>

      <section className="panel">
        <form className="form-stack" onSubmit={handleGiveStars}>
          <h3>Give stars</h3>
          <p className="muted-note">
            Quests automatically pay their star reward the first time they are finished. You can also add
            stars here — use a negative number to take stars back.
          </p>
          <div className="inline-fields">
            <label>
              Amount
              <input
                type="number"
                value={starsAmount}
                onChange={(event) => setStarsAmount(event.target.value)}
              />
            </label>
            <label>
              Stars earned so far
              <input value={profile ? `${profile.starBank}` : '—'} readOnly />
            </label>
          </div>
          <button type="submit">Update star bank</button>
          {starsFeedback && <p className="feedback-note">{starsFeedback}</p>}
        </form>
      </section>
    </div>
  );
}

export default App;
