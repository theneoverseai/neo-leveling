'use strict';

/* ============================== DATA ============================== */

const STORAGE_KEY = 'neoLevelingState';

const RANKS = [
  { letter: 'E', floor: 0, ceil: 500, color: '#726C82' },
  { letter: 'D', floor: 500, ceil: 1500, color: '#7FCBA4' },
  { letter: 'C', floor: 1500, ceil: 3000, color: '#8FA6E8' },
  { letter: 'B', floor: 3000, ceil: 5000, color: '#9C8CF0' },
  { letter: 'A', floor: 5000, ceil: 8000, color: '#D6B677' },
  { letter: 'S', floor: 8000, ceil: null, color: '#F0E9C8' }
];

const ITEM_XP = 10;
const DAY_BONUS_XP = 20;

/* Each exercise carries structured load data so sets/reps/rest can be computed
   per user goal + experience + time budget instead of hardcoded. `goalScaled`
   marks whether ACSM/NSCA goal-based rep-range scaling applies — corrective,
   skill/ROM-limited, and mobility work stay fixed regardless of training goal,
   per standard S&C practice of not varying joint-health work by phase. */
const EXERCISES = {
  Push: [
    {
      id: 'push-ring-dip', name: 'Ring Dip', note: 'band assisted', badge: 'PRIORITY',
      unit: 'reps', baseSets: 4, repMin: 3, repMax: 6, goalScaled: true,
      primary: ['Chest', 'Triceps'], secondary: ['Front Delts', 'Core'], notTargeted: ['Back', 'Legs', 'Grip'],
      blurb: 'Anchor push movement. Heaviest loading pattern in the session, drives chest and triceps strength directly.',
      stat: 'strength'
    },
    {
      id: 'push-ring-pushup', name: 'Ring Push Up', note: 'feet elevated',
      unit: 'reps', baseSets: 4, repMin: 10, repMax: 15, goalScaled: true,
      primary: ['Chest', 'Shoulders'], secondary: ['Triceps', 'Core'], notTargeted: ['Back', 'Grip'],
      blurb: 'Volume work after the dip. Feeds the same pattern at higher reps to build control and hypertrophy.',
      stat: 'strength'
    },
    {
      id: 'push-pike-pushup', name: 'Pike Push Up', note: 'on rings',
      unit: 'reps', baseSets: 3, repMin: 8, repMax: 12, goalScaled: true,
      primary: ['Shoulders'], secondary: ['Triceps', 'Upper Chest'], notTargeted: ['Back', 'Legs'],
      blurb: "Main shoulder builder for the day. Vertical pressing angle the dip and push up don't hit.",
      stat: 'strength'
    },
    {
      id: 'push-ring-fly', name: 'Ring Fly', note: 'slow controlled',
      unit: 'reps', baseSets: 3, repMin: 10, repMax: 15, goalScaled: true,
      primary: ['Chest'], secondary: ['Front Delts', 'Rotator Cuff'], notTargeted: ['Triceps', 'Back'],
      blurb: 'Stretch-position chest work at slow tempo. Builds control and the connective tissue resilience rings demand.',
      stat: 'strength'
    },
    {
      id: 'push-diamond-pushup', name: 'Diamond Push Up', note: 'on rings',
      unit: 'reps', baseSets: 2, repMin: 12, repMax: 15, goalScaled: true,
      primary: ['Triceps'], secondary: ['Chest', 'Core'], notTargeted: ['Back', 'Shoulders'],
      blurb: 'Triceps finisher. Closes the session on the muscle that assisted every prior movement.',
      stat: 'strength'
    }
  ],
  Pull: [
    {
      id: 'pull-strict-pullup', name: 'Strict Pull Up', note: '', badge: 'STRONGEST',
      unit: 'reps', baseSets: 4, repMin: 4, repMax: 5, goalScaled: true,
      primary: ['Lats', 'Biceps'], secondary: ['Grip', 'Rear Delts'], notTargeted: ['Chest', 'Legs'],
      blurb: 'Your strongest pull pattern. Leads the session while grip and CNS are freshest.',
      stat: 'strength'
    },
    {
      id: 'pull-ring-row', name: 'Ring Row', note: 'feet forward',
      unit: 'reps', baseSets: 3, repMin: 10, repMax: 12, goalScaled: true,
      primary: ['Mid Back', 'Lats'], secondary: ['Biceps', 'Rear Delts'], notTargeted: ['Chest', 'Legs'],
      blurb: 'Horizontal pull volume. Balances the vertical pull up with a different angle on the back.',
      stat: 'strength'
    },
    {
      id: 'pull-band-wide-row', name: 'Band Assisted Wide Row', note: 'or pull up',
      unit: 'reps', baseSets: 3, repMin: 8, repMax: 10, goalScaled: true,
      primary: ['Rear Delts', 'Upper Back'], secondary: ['Lats', 'Biceps'], notTargeted: ['Chest', 'Grip'],
      blurb: 'Rear delt and upper back focus. The angle the pull up and row leave underworked.',
      stat: 'strength'
    },
    {
      id: 'pull-face-pull', name: 'Band Face Pull', note: 'corrective',
      unit: 'reps', baseSets: 3, repMin: 15, repMax: 15, goalScaled: false,
      primary: ['Rear Delts', 'Rotator Cuff'], secondary: ['Upper Back'], notTargeted: ['Lats', 'Biceps'],
      blurb: 'Corrective work. Shoulder health maintenance so heavy pressing and pulling stay pain-free — dosed the same regardless of your goal.',
      stat: 'mobility'
    },
    {
      id: 'pull-dead-hang', name: 'Dead Hang', note: 'active grip',
      unit: 'hold', baseSets: 3, holdSec: 40, goalScaled: true,
      primary: ['Grip', 'Forearms'], secondary: ['Shoulders', 'Lats'], notTargeted: ['Chest', 'Legs'],
      blurb: 'Pure grip and shoulder stability endurance. The base every pull up and hang-dependent move relies on.',
      stat: 'grip'
    },
    {
      id: 'pull-bicep-curl', name: 'Band Bicep Curl', note: 'standing, controlled tempo',
      unit: 'reps', baseSets: 3, repMin: 10, repMax: 15, goalScaled: true,
      primary: ['Biceps'], secondary: ['Forearms'], notTargeted: ['Back', 'Chest', 'Legs'],
      blurb: 'Direct arm isolation. Pull ups and rows train biceps only as a secondary mover — this adds the direct volume research shows drives extra arm size beyond compounds alone.',
      stat: 'strength'
    }
  ],
  Legs: [
    {
      id: 'legs-bulgarian-split', name: 'Bulgarian Split Squat', note: 'rear foot on rings', perSide: true,
      unit: 'reps', baseSets: 3, repMin: 10, repMax: 12, goalScaled: true,
      primary: ['Quads', 'Glutes'], secondary: ['Hamstrings', 'Core', 'Balance'], notTargeted: ['Upper Body'],
      blurb: 'Main unilateral strength driver. Builds single-leg quad and glute strength plus the balance rings demand.',
      stat: 'strength'
    },
    {
      id: 'legs-pistol-squat', name: 'Ring Assisted Pistol Squat', badge: 'SHALLOW', perSide: true,
      unit: 'reps', baseSets: 3, repMin: 6, repMax: 8, goalScaled: false,
      primary: ['Quads', 'Glutes'], secondary: ['Ankle', 'Balance'], notTargeted: ['Hamstrings', 'Upper Body'],
      blurb: "Depth-limited on purpose. Ankle mobility is still developing, so range increases as mobility work pays off, not before — reps stay fixed regardless of goal since ROM is the limiter, not muscular capacity.",
      stat: 'strength'
    },
    {
      id: 'legs-nordic-curl', name: 'Nordic Curl', note: 'band assisted',
      unit: 'reps', baseSets: 3, repMin: 6, repMax: 8, goalScaled: false,
      primary: ['Hamstrings'], secondary: ['Glutes', 'Core'], notTargeted: ['Quads', 'Upper Body'],
      blurb: "Hamstring strength the squat patterns don't reach. Eccentric-only work stays low-rep regardless of goal to manage joint stress and soreness.",
      stat: 'strength'
    },
    {
      id: 'legs-calf-raise', name: 'Calf Raise', note: 'slow negative',
      unit: 'reps', baseSets: 3, repMin: 12, repMax: 15, goalScaled: true,
      primary: ['Calves'], secondary: ['Ankle Stability'], notTargeted: ['Quads', 'Hamstrings', 'Glutes'],
      blurb: 'Slow eccentric builds calf strength and tendon resilience. Feeds directly into ankle stability work.',
      stat: 'endurance'
    },
    {
      id: 'legs-lateral-band-walk', name: 'Lateral Band Walk', badge: 'SWAP', perSide: true,
      unit: 'reps', baseSets: 2, repMin: 15, repMax: 15, goalScaled: false,
      primary: ['Glute Medius', 'Hips'], secondary: ['Ankle Stability'], notTargeted: ['Quads', 'Hamstrings'],
      blurb: 'Replaces jump work this cycle. Protects a currently sore ankle from impact while still training hip stability — fixed dosage, not goal-scaled.',
      stat: 'endurance'
    }
  ],
  Rest: [
    {
      id: 'rest-ankle-dorsi', name: 'Ankle Dorsiflexion Drill', perSide: true,
      unit: 'reps', baseSets: 3, repMin: 10, repMax: 10, goalScaled: false,
      primary: ['Ankle'], secondary: ['Calves'], notTargeted: ['Upper Body'],
      blurb: 'Directly targets the ankle range limiting pistol squat depth. Highest-leverage mobility drill in rotation.',
      stat: 'mobility'
    },
    {
      id: 'rest-9090-hip', name: '90/90 Hip Switch',
      unit: 'hold', baseSets: 1, holdSec: 120, goalScaled: false,
      primary: ['Hips'], secondary: ['Core'], notTargeted: ['Upper Body', 'Ankle'],
      blurb: 'Hip internal and external rotation range. Supports squat depth and general lower body mobility.',
      stat: 'mobility'
    },
    {
      id: 'rest-thoracic-ext', name: 'Thoracic Extension', note: 'on foam or towel',
      unit: 'hold', baseSets: 1, holdSec: 60, goalScaled: false,
      primary: ['Thoracic Spine'], secondary: ['Shoulders'], notTargeted: ['Hips', 'Ankle'],
      blurb: 'Upper back extension. Offsets pressing-dominant push days and keeps overhead positions open.',
      stat: 'mobility'
    },
    {
      id: 'rest-cat-cow', name: 'Cat Cow Flow',
      unit: 'reps', baseSets: 1, repMin: 5, repMax: 5, goalScaled: false,
      primary: ['Spine'], secondary: ['Core'], notTargeted: ['Ankle', 'Hips'],
      blurb: 'Full spine mobility flow. Low-intensity reset between harder training days.',
      stat: 'mobility'
    },
    {
      id: 'rest-toe-touch', name: 'Toe Touch Check',
      unit: 'test', baseSets: 1, goalScaled: false,
      primary: ['Posterior Chain'], secondary: ['Hamstrings'], notTargeted: ['Upper Body'],
      blurb: 'A quick test, not a drill. Tracks posterior chain flexibility trend over time.',
      stat: 'mobility'
    }
  ]
};

/* ============================== PROGRAM GENERATOR ============================== */
/* Goal-based scaling follows the ACSM Position Stand on Resistance Training and
   NSCA Essentials of Strength Training & Conditioning rep/rest conventions:
   strength ~<=6 reps, longer rest; hypertrophy ~8-15 reps, moderate rest, higher
   volume; muscular endurance 15+ reps, minimal rest. */
const GOAL_PROFILES = {
  general:     { label: 'General Fitness',        repMult: 1.0,  setsDelta: 0, restSec: 60,  holdMult: 1.0 },
  strength:    { label: 'Strength',                repMult: 0.55, setsDelta: 1, restSec: 180, holdMult: 1.0 },
  hypertrophy: { label: 'Hypertrophy',              repMult: 1.15, setsDelta: 1, restSec: 75,  holdMult: 1.0 },
  endurance:   { label: 'Endurance & Mobility',     repMult: 1.6,  setsDelta: 0, restSec: 30,  holdMult: 1.5 }
};

const EXPERIENCE_PROFILES = {
  novice:       { label: 'New to training',   setsDelta: -1 },
  intermediate: { label: 'Some experience',   setsDelta: 0 },
  advanced:     { label: 'Experienced',       setsDelta: 1 }
};

const GOAL_DESCRIPTIONS = {
  general: 'Balanced strength, conditioning, and mobility.',
  strength: 'Fewer reps, more sets, longer rest — max force.',
  hypertrophy: 'Moderate-high reps, more volume — muscle growth.',
  endurance: 'High reps, minimal rest — muscular endurance and mobility.'
};

/* Body-goal is motivational framing only — it suggests a training goal and
   shapes encouragement copy. It never touches XP, rank, or the stat bars;
   those move on training consistency only, per the original design rule. */
const BODY_GOALS = {
  lean:     { label: 'Lean & Athletic', blurb: 'A capable, efficient build — moves well, holds up under load.', suggestGoal: 'general' },
  muscle:   { label: 'Build Muscle & Size', blurb: 'Visible, earned size — more mass, more presence.', suggestGoal: 'hypertrophy' },
  strong:   { label: 'Get Stronger', blurb: 'Raw force — heavier, harder, more control under load.', suggestGoal: 'strength' },
  feel:     { label: 'Move Better & Feel Good', blurb: 'Less pain, more range, feeling good in your own body day to day.', suggestGoal: 'endurance' }
};

const ACTIVITY_LEVELS = {
  sedentary: { label: 'Mostly Sedentary', blurb: 'Desk-bound, little movement outside sessions' },
  light:     { label: 'Lightly Active', blurb: 'Walking, some daily movement' },
  active:    { label: 'Active', blurb: 'On your feet often, some sport or activity' },
  very:      { label: 'Very Active', blurb: 'Physical job, sport, or high daily movement' }
};

const EQUIPMENT_OPTIONS = {
  rings_bands: { label: 'Rings + Resistance Bands', blurb: 'The full program below — built for exactly this setup.', available: true },
  bodyweight:  { label: 'Bodyweight Only', blurb: 'No rings or bands, just floor space.', available: false },
  full_gym:    { label: 'Full Gym Access', blurb: 'Barbells, machines, free weights.', available: false }
};

const WEEKDAY_LABELS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
const DEFAULT_TRAINING_DAYS = [1, 2, 3, 5, 6]; // Mon, Tue, Wed, Fri, Sat — matches the original fixed schedule

function defaultProfile() {
  return {
    bodyGoal: 'lean',
    goal: 'general',
    experience: 'intermediate',
    heightCm: null,
    weightKg: null,
    age: null,
    activityLevel: 'light',
    equipment: 'rings_bands',
    trainingDays: DEFAULT_TRAINING_DAYS.slice(),
    timeBudgetMin: 35
  };
}

function computePrescription(ex, profile) {
  const override = state.overrides && state.overrides[ex.id];
  if (override) return Object.assign({ fromOverride: true }, override);

  const goalP = GOAL_PROFILES[profile.goal] || GOAL_PROFILES.general;
  const expP = EXPERIENCE_PROFILES[profile.experience] || EXPERIENCE_PROFILES.intermediate;
  const scaled = !!ex.goalScaled;

  const sets = clampInt(ex.baseSets + (scaled ? goalP.setsDelta : 0) + expP.setsDelta, 2, 6);

  if (ex.unit === 'hold') {
    const holdSec = scaled ? Math.round(ex.holdSec * goalP.holdMult / 5) * 5 : ex.holdSec;
    return { sets, unit: 'hold', holdSec, restSec: scaled ? goalP.restSec : 45 };
  }
  if (ex.unit === 'test') {
    return { sets: 1, unit: 'test', restSec: 0 };
  }
  const repMin = scaled ? clampInt(Math.round(ex.repMin * goalP.repMult), 3, 30) : ex.repMin;
  let repMax = scaled ? clampInt(Math.round(ex.repMax * goalP.repMult), repMin, 30) : ex.repMax;
  if (repMax < repMin) repMax = repMin;
  return { sets, unit: 'reps', repMin, repMax, restSec: scaled ? goalP.restSec : 45 };
}

function clampInt(n, min, max) {
  return Math.max(min, Math.min(max, Math.round(n)));
}

function formatPrescription(ex, p) {
  const sideTag = ex.perSide ? ' / side' : '';
  if (p.unit === 'hold') return `${p.sets} x ${p.holdSec}s hold${sideTag}`;
  if (p.unit === 'test') return '1 test';
  const reps = p.repMin === p.repMax ? `${p.repMin}` : `${p.repMin}-${p.repMax}`;
  return `${p.sets} x ${reps}${sideTag}`;
}

function estimateMinutes(ex, p) {
  if (p.unit === 'test') return 0.5;
  const perRepSec = 3.2;
  const workSec = p.unit === 'hold' ? p.holdSec : ((p.repMin + p.repMax) / 2) * perRepSec;
  const restSec = p.restSec || 0;
  const sideMult = ex.perSide ? 2 : 1;
  return (p.sets * (workSec + restSec) * sideMult + 25) / 60;
}

function generateDayProgram(dayType, profile) {
  const pool = EXERCISES[dayType];
  const items = pool.map((ex) => {
    const presc = computePrescription(ex, profile);
    return { ex, presc, minutes: estimateMinutes(ex, presc) };
  });

  // trim from the pool's priority order — keep the leading run that fits the
  // time budget rather than greedy-skip-and-backfill, so a later "finisher"
  // exercise never displaces an earlier priority one.
  const budget = profile.timeBudgetMin || 35;
  let running = 0;
  const included = [];
  for (let i = 0; i < items.length; i++) {
    const item = items[i];
    if (i === 0 || running + item.minutes <= budget) {
      included.push(item);
      running += item.minutes;
    } else {
      break;
    }
  }
  return included;
}

const COVERAGE = {
  Push: { covers: ['Chest', 'Triceps', 'Shoulders', 'Front Delts', 'Core'], skips: ['Back', 'Grip', 'Legs', 'Rear Delts'] },
  Pull: { covers: ['Lats', 'Biceps', 'Grip', 'Rear Delts', 'Upper Back', 'Forearms'], skips: ['Chest', 'Legs', 'Triceps'] },
  Legs: { covers: ['Quads', 'Glutes', 'Hamstrings', 'Calves', 'Hips', 'Ankle'], skips: ['Upper Body'] },
  Rest: { covers: ['Ankle', 'Hips', 'Spine', 'Shoulders', 'Posterior Chain'], skips: ['Loaded Strength Work'] }
};

const DAILY_QUESTS = [
  { id: 'dq-no-cal', label: 'No calorie tracking', sub: 'weight trend and photos are the metric' },
  { id: 'dq-protein', label: 'Protein target 109-150g', sub: 'hit it today' },
  { id: 'dq-creatine', label: 'Creatine 5g', sub: 'same time daily' },
  { id: 'dq-flex', label: 'Flexibility block done', sub: 'before it gets skipped' },
  { id: 'dq-ankle', label: 'Ankle work before basketball', sub: 'not after' },
  { id: 'dq-progression', label: 'Progression rule', sub: 'harder angle or slower tempo before more reps' }
];

const RECORD_FIELDS = [
  { id: 'dip', label: 'Ring Dip Max', unit: 'reps', invert: false },
  { id: 'pull', label: 'Pull Up Max', unit: 'reps', invert: false },
  { id: 'ankle', label: 'Ankle Gap', unit: 'cm', invert: true },
  { id: 'lsit', label: 'L-Sit Hold', unit: 'sec', invert: false },
  { id: 'hang', label: 'Dead Hang', unit: 'sec', invert: false },
  { id: 'squat', label: 'Asian Squat Heel Gap', unit: 'cm', invert: true }
];

/* ============================== STATE ============================== */

function todayStr(d = new Date()) {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${y}-${m}-${day}`;
}

function yesterdayStr(dateStr) {
  const d = new Date(dateStr + 'T00:00:00');
  d.setDate(d.getDate() - 1);
  return todayStr(d);
}

function defaultState() {
  return {
    xp: 0,
    streak: 0,
    lastFullCompletionDate: null,
    today: { date: todayStr(), checked: {}, fullBonusAwarded: false, prevStreak: 0, prevLastFull: null },
    statHistory: [],
    statCounts: { strength: 0, grip: 0, endurance: 0, mobility: 0 },
    log: {},
    hasSeenLogin: false,
    hasOnboarded: false,
    profile: defaultProfile(),
    overrides: {},
    updatedAt: 0
  };
}

let state = loadState();

function loadState() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return defaultState();
    const parsed = JSON.parse(raw);
    return Object.assign(defaultState(), parsed, {
      today: Object.assign(defaultState().today, parsed.today || {}),
      profile: Object.assign(defaultProfile(), parsed.profile || {})
    });
  } catch (e) {
    return defaultState();
  }
}

function saveState() {
  state.updatedAt = Date.now();
  localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  if (typeof onStateSaved === 'function') onStateSaved();
}

function rolloverDayIfNeeded() {
  const t = todayStr();
  if (state.today.date !== t) {
    state.today = { date: t, checked: {}, fullBonusAwarded: false, prevStreak: state.streak, prevLastFull: state.lastFullCompletionDate };
    saveState();
  }
}

function dayType(dateStr = todayStr()) {
  const raw = (state.profile && Array.isArray(state.profile.trainingDays) && state.profile.trainingDays.length)
    ? state.profile.trainingDays
    : DEFAULT_TRAINING_DAYS;
  const trainingDays = raw.slice().sort((a, b) => a - b);
  const dow = new Date(dateStr + 'T00:00:00').getDay();
  if (!trainingDays.includes(dow)) return 'Rest';
  const cycle = ['Push', 'Pull', 'Legs'];
  return cycle[trainingDays.indexOf(dow) % 3];
}

function todaysQuestItems() {
  const type = dayType();
  const program = generateDayProgram(type, state.profile || defaultProfile());
  const workout = program.map(({ ex, presc }) => ({ id: ex.id, kind: 'exercise', stat: ex.stat, ref: ex, presc }));
  const quests = DAILY_QUESTS.map((q) => ({ id: q.id, kind: 'quest', stat: null, ref: q }));
  return { type, items: workout.concat(quests) };
}

function rankForXp(xp) {
  for (const r of RANKS) {
    if (xp >= r.floor && (r.ceil === null || xp < r.ceil)) return r;
  }
  return RANKS[RANKS.length - 1];
}

function levelForXp(xp) {
  return Math.floor(xp / 100);
}

/* ============================== MUTATIONS ============================== */

function toggleItem(itemId) {
  const { items } = todaysQuestItems();
  const item = items.find((i) => i.id === itemId);
  if (!item) return;

  const wasChecked = !!state.today.checked[itemId];
  const nowChecked = !wasChecked;
  state.today.checked[itemId] = nowChecked;

  const delta = nowChecked ? ITEM_XP : -ITEM_XP;
  state.xp = Math.max(0, state.xp + delta);

  if (item.stat) {
    const cur = state.statCounts[item.stat] || 0;
    state.statCounts[item.stat] = Math.max(0, cur + (nowChecked ? 1 : -1));
  }

  const doneCount = items.filter((i) => state.today.checked[i.id]).length;
  const totalCount = items.length;
  const isFullNow = doneCount === totalCount;

  if (isFullNow && !state.today.fullBonusAwarded) {
    state.today.prevStreak = state.streak;
    state.today.prevLastFull = state.lastFullCompletionDate;
    const wasYesterday = state.lastFullCompletionDate === yesterdayStr(state.today.date);
    const newStreak = wasYesterday ? state.streak + 1 : 1;
    const bonus = DAY_BONUS_XP + Math.min(newStreak * 5, 50);
    state.xp += bonus;
    state.streak = newStreak;
    state.lastFullCompletionDate = state.today.date;
    state.today.fullBonusAwarded = true;
  } else if (!isFullNow && state.today.fullBonusAwarded) {
    // reverse using the streak value that was actually awarded (current state.streak)
    const reverseBonus = DAY_BONUS_XP + Math.min(state.streak * 5, 50);
    state.xp = Math.max(0, state.xp - reverseBonus);
    state.streak = state.today.prevStreak;
    state.lastFullCompletionDate = state.today.prevLastFull;
    state.today.fullBonusAwarded = false;
  }

  state.log[state.today.date] = { done: doneCount, total: totalCount, full: isFullNow };
  saveState();
  renderAll();
}

function addRecord(values) {
  const entry = { date: todayStr(), ...values };
  state.statHistory.unshift(entry);
  saveState();
  renderRecords();
}

function resetAll() {
  localStorage.removeItem(STORAGE_KEY);
  state = defaultState();
  state.hasSeenLogin = true;
  saveState();
  renderAll();
}

/* ============================== RENDER: STATUS ============================== */

function renderStatus() {
  const rank = rankForXp(state.xp);
  const level = levelForXp(state.xp);
  const sigil = document.getElementById('sigil');
  sigil.textContent = rank.letter;
  sigil.style.setProperty('--sigil-color', rank.color);

  document.getElementById('rankName').textContent = `Rank ${rank.letter}`;
  document.getElementById('levelValue').textContent = level;
  document.getElementById('streakValue').textContent = state.streak;
  document.getElementById('totalXpValue').textContent = state.xp.toLocaleString();

  const pct = rank.ceil === null ? 100 : Math.min(100, Math.round(((state.xp - rank.floor) / (rank.ceil - rank.floor)) * 100));
  const bar = document.getElementById('xpBarFill');
  bar.style.width = pct + '%';
  document.getElementById('xpBarLabel').textContent = rank.ceil === null
    ? 'MAX RANK'
    : `${state.xp - rank.floor} / ${rank.ceil - rank.floor} XP to ${RANKS[RANKS.indexOf(rank) + 1].letter}`;

  const statBars = { strength: 'Strength', grip: 'Grip', endurance: 'Endurance', mobility: 'Mobility' };
  for (const key of Object.keys(statBars)) {
    const count = state.statCounts[key] || 0;
    const pct2 = Math.min(100, count * 2);
    const el = document.getElementById(`stat-${key}`);
    if (el) el.style.width = pct2 + '%';
    const num = document.getElementById(`stat-${key}-num`);
    if (num) num.textContent = count;
  }
}

/* ============================== RENDER: QUEST ============================== */

function renderQuest() {
  const { type, items } = todaysQuestItems();
  document.getElementById('questDayType').textContent = type === 'Rest' ? 'Rest Day — Mobility' : `${type} Day`;
  document.getElementById('questDate').textContent = new Date(state.today.date + 'T00:00:00').toLocaleDateString(undefined, { weekday: 'long', month: 'short', day: 'numeric' });

  const workoutItems = items.filter((i) => i.kind === 'exercise');
  const questItems = items.filter((i) => i.kind === 'quest');

  const wrap = document.getElementById('workoutList');
  wrap.innerHTML = workoutItems.map((i) => exerciseRow(i.ref, state.today.checked[i.id], i.presc)).join('');

  const dq = document.getElementById('dailyQuestList');
  dq.innerHTML = questItems.map((i) => questRow(i.ref, state.today.checked[i.id])).join('');

  const doneCount = items.filter((i) => state.today.checked[i.id]).length;
  document.getElementById('questProgress').textContent = `${doneCount} / ${items.length} complete`;
  document.getElementById('questProgressFill').style.width = Math.round((doneCount / items.length) * 100) + '%';

  wrap.querySelectorAll('[data-toggle]').forEach((el) => {
    el.addEventListener('click', () => toggleItem(el.getAttribute('data-toggle')));
  });
  dq.querySelectorAll('[data-toggle]').forEach((el) => {
    el.addEventListener('click', () => toggleItem(el.getAttribute('data-toggle')));
  });
  wrap.querySelectorAll('[data-info]').forEach((el) => {
    el.addEventListener('click', (e) => {
      e.stopPropagation();
      openExerciseDetail(el.getAttribute('data-info'));
    });
  });
}

function exerciseRow(ex, checked, presc) {
  const rx = presc || computePrescription(ex, state.profile);
  return `
    <div class="quest-item ${checked ? 'is-checked' : ''}">
      <div class="quest-check" data-toggle="${ex.id}">
        <span class="checkbox">${checked ? '✓' : ''}</span>
        <div class="quest-item-body">
          <div class="quest-item-title">
            <span class="quest-item-name">${ex.name}</span>
            ${ex.badge ? `<span class="badge badge-${ex.badge.toLowerCase()}">${ex.badge}</span>` : ''}
            ${rx.fromOverride ? '<span class="badge badge-custom">CUSTOM</span>' : ''}
          </div>
          <div class="quest-item-sub">${formatPrescription(ex, rx)}${ex.note ? ' · ' + ex.note : ''}</div>
        </div>
      </div>
      <button class="info-btn" data-info="${ex.id}" aria-label="Exercise info">i</button>
    </div>`;
}

function questRow(q, checked) {
  return `
    <div class="quest-item ${checked ? 'is-checked' : ''}">
      <div class="quest-check" data-toggle="${q.id}">
        <span class="checkbox">${checked ? '✓' : ''}</span>
        <div class="quest-item-body">
          <div class="quest-item-title"><span class="quest-item-name">${q.label}</span></div>
          <div class="quest-item-sub">${q.sub}</div>
        </div>
      </div>
    </div>`;
}

function findExercise(id) {
  for (const type of Object.keys(EXERCISES)) {
    const found = EXERCISES[type].find((e) => e.id === id);
    if (found) return found;
  }
  return null;
}

let modalExerciseId = null;

function openExerciseDetail(id) {
  const ex = findExercise(id);
  if (!ex) return;
  modalExerciseId = id;
  const rx = computePrescription(ex, state.profile);

  const modal = document.getElementById('exerciseModal');
  document.getElementById('modalTitle').textContent = ex.name;
  document.getElementById('modalSets').textContent = `${formatPrescription(ex, rx)}${ex.note ? ' · ' + ex.note : ''}`;
  document.getElementById('modalBlurb').textContent = ex.blurb;
  document.getElementById('modalPrimary').innerHTML = ex.primary.map(tagChip).join('');
  document.getElementById('modalSecondary').innerHTML = ex.secondary.map(tagChip).join('');
  document.getElementById('modalNot').innerHTML = ex.notTargeted.map(tagChip).join('');
  document.getElementById('modalWatch').href = `https://www.youtube.com/results?search_query=${encodeURIComponent(ex.name + ' exercise form')}`;

  renderModalEdit(ex, rx);
  modal.classList.add('is-open');
}

function renderModalEdit(ex, rx) {
  const editBox = document.getElementById('modalEdit');
  const fields = document.getElementById('modalEditFields');
  const autoTag = document.getElementById('modalEditAuto');
  autoTag.textContent = rx.fromOverride ? '(custom)' : '(auto)';

  if (rx.unit === 'test') {
    editBox.style.display = 'none';
    return;
  }
  editBox.style.display = 'block';

  if (rx.unit === 'hold') {
    fields.innerHTML = `
      <label class="record-field"><span>Sets</span><input id="editSets" type="number" min="1" max="6" value="${rx.sets}"></label>
      <label class="record-field"><span>Hold (sec)</span><input id="editHold" type="number" min="5" max="600" value="${rx.holdSec}"></label>`;
  } else {
    fields.innerHTML = `
      <label class="record-field"><span>Sets</span><input id="editSets" type="number" min="1" max="6" value="${rx.sets}"></label>
      <label class="record-field"><span>Reps min</span><input id="editRepMin" type="number" min="1" max="50" value="${rx.repMin}"></label>
      <label class="record-field"><span>Reps max</span><input id="editRepMax" type="number" min="1" max="50" value="${rx.repMax}"></label>`;
  }
}

function saveExerciseOverride() {
  const ex = findExercise(modalExerciseId);
  if (!ex) return;
  const sets = clampInt(Number(document.getElementById('editSets').value) || 1, 1, 6);
  let override;
  if (ex.unit === 'hold') {
    const holdSec = clampInt(Number(document.getElementById('editHold').value) || ex.holdSec, 5, 600);
    override = { sets, unit: 'hold', holdSec, restSec: 45 };
  } else {
    const repMin = clampInt(Number(document.getElementById('editRepMin').value) || ex.repMin, 1, 50);
    const repMax = clampInt(Number(document.getElementById('editRepMax').value) || ex.repMax, repMin, 50);
    override = { sets, unit: 'reps', repMin, repMax, restSec: 45 };
  }
  state.overrides[ex.id] = override;
  saveState();
  openExerciseDetail(ex.id);
  renderQuest();
  renderLibrary();
}

function resetExerciseOverride() {
  const ex = findExercise(modalExerciseId);
  if (!ex) return;
  delete state.overrides[ex.id];
  saveState();
  openExerciseDetail(ex.id);
  renderQuest();
  renderLibrary();
}

function tagChip(t) {
  return `<span class="tag">${t}</span>`;
}

/* ============================== RENDER: LOG ============================== */

function renderLog() {
  const now = new Date();
  const year = now.getFullYear();
  const month = now.getMonth();
  const monthLabel = now.toLocaleDateString(undefined, { month: 'long', year: 'numeric' });
  document.getElementById('logMonthLabel').textContent = monthLabel;

  const firstDow = new Date(year, month, 1).getDay();
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const todayNum = now.getDate();

  let full = 0, partial = 0, missed = 0;

  const cells = [];
  for (let i = 0; i < firstDow; i++) cells.push('<div class="cal-cell cal-empty"></div>');

  for (let d = 1; d <= daysInMonth; d++) {
    const ds = `${year}-${String(month + 1).padStart(2, '0')}-${String(d).padStart(2, '0')}`;
    const entry = state.log[ds];
    const isToday = d === todayNum;
    let cls = 'cal-cell cal-future';

    if (d <= todayNum) {
      if (entry && entry.full) { cls = 'cal-cell cal-full'; full++; }
      else if (entry && entry.done > 0) { cls = 'cal-cell cal-partial'; partial++; }
      else if (isToday) { cls = 'cal-cell'; } // today with no progress yet: not "missed", day isn't over
      else { cls = 'cal-cell cal-missed'; missed++; }
    }
    if (isToday) cls += ' cal-today';

    cells.push(`<div class="${cls}"><span>${d}</span></div>`);
  }

  document.getElementById('calGrid').innerHTML = cells.join('');

  const daysElapsed = todayNum;
  const pct = daysElapsed > 0 ? Math.round((full / daysElapsed) * 100) : 0;
  document.getElementById('logFull').textContent = full;
  document.getElementById('logPartial').textContent = partial;
  document.getElementById('logMissed').textContent = missed;
  document.getElementById('logPct').textContent = pct + '%';
}

/* ============================== RENDER: LIBRARY ============================== */

let activeLibraryTab = 'Push';

function renderLibrary() {
  const tabsWrap = document.getElementById('libraryTabs');
  tabsWrap.querySelectorAll('.lib-tab').forEach((btn) => {
    btn.classList.toggle('is-active', btn.getAttribute('data-lib') === activeLibraryTab);
  });

  const list = EXERCISES[activeLibraryTab];
  const cov = COVERAGE[activeLibraryTab];

  document.getElementById('libraryCoverage').innerHTML = `
    <div class="coverage-row"><span class="coverage-label">Covers</span><div class="tag-row">${cov.covers.map(tagChip).join('')}</div></div>
    <div class="coverage-row"><span class="coverage-label">Skips</span><div class="tag-row">${cov.skips.map(tagChip).join('')}</div></div>
  `;

  document.getElementById('libraryList').innerHTML = list.map((ex) => {
    const rx = computePrescription(ex, state.profile);
    return `
    <div class="lib-card" data-info="${ex.id}">
      <div class="lib-card-head">
        <span class="lib-card-name">${ex.name}</span>
        ${ex.badge ? `<span class="badge badge-${ex.badge.toLowerCase()}">${ex.badge}</span>` : ''}
      </div>
      <div class="lib-card-sets">${formatPrescription(ex, rx)}${ex.note ? ' · ' + ex.note : ''}</div>
      <div class="lib-card-blurb">${ex.blurb}</div>
      <div class="tag-row">${ex.primary.map(tagChip).join('')}</div>
    </div>
  `;
  }).join('');

  document.getElementById('libraryList').querySelectorAll('[data-info]').forEach((el) => {
    el.addEventListener('click', () => openExerciseDetail(el.getAttribute('data-info')));
  });
}

/* ============================== RENDER: RECORDS ============================== */

function renderRecords() {
  const body = document.getElementById('recordsBody');
  if (state.statHistory.length === 0) {
    body.innerHTML = '<div class="empty-state">No records yet. Log your first below.</div>';
    return;
  }

  const rows = state.statHistory.map((entry, idx) => {
    const prev = state.statHistory[idx + 1];
    const cells = RECORD_FIELDS.map((f) => {
      const val = entry[f.id];
      if (val === undefined || val === null || val === '') return `<td class="rec-cell">—</td>`;
      let arrow = '';
      if (prev && prev[f.id] !== undefined && prev[f.id] !== null && prev[f.id] !== '') {
        const diff = val - prev[f.id];
        const improved = f.invert ? diff < 0 : diff > 0;
        const worsened = f.invert ? diff > 0 : diff < 0;
        if (improved) arrow = '<span class="arrow arrow-up">▲</span>';
        else if (worsened) arrow = '<span class="arrow arrow-down">▼</span>';
        else arrow = '<span class="arrow arrow-flat">–</span>';
      }
      return `<td class="rec-cell">${val}${f.unit ? ' ' + f.unit : ''} ${arrow}</td>`;
    }).join('');
    return `<tr><td class="rec-date">${entry.date}</td>${cells}</tr>`;
  }).join('');

  document.getElementById('recordsTable').innerHTML = `
    <thead><tr><th>Date</th>${RECORD_FIELDS.map((f) => `<th>${f.label}</th>`).join('')}</tr></thead>
    <tbody>${rows}</tbody>
  `;
  body.innerHTML = '';
  body.appendChild(document.getElementById('recordsTable'));
}

/* ============================== NAV / MODALS ============================== */

function switchTab(tabId) {
  document.querySelectorAll('.tab-panel').forEach((p) => p.classList.toggle('is-active', p.id === `tab-${tabId}`));
  document.querySelectorAll('.nav-btn').forEach((b) => b.classList.toggle('is-active', b.getAttribute('data-tab') === tabId));
}

let manualWizardOpen = false;

function renderGates() {
  const login = document.getElementById('loginGate');
  const wizard = document.getElementById('wizardGate');
  const app = document.getElementById('app');

  const showLogin = !manualWizardOpen && !state.hasSeenLogin;
  const showWizard = manualWizardOpen || (!showLogin && !state.hasOnboarded);
  const showApp = !showLogin && !showWizard;

  login.classList.toggle('is-open', showLogin);
  wizard.classList.toggle('is-open', showWizard);
  app.classList.toggle('is-hidden', !showApp);

  if (showWizard && wizardDraft === null) startWizard();
}

function dismissLogin() {
  state.hasSeenLogin = true;
  saveState();
  renderAll();
}

/* ============================== WIZARD ============================== */

const WIZARD_STEPS = ['bodygoal', 'goal', 'experience', 'stats', 'equipment', 'trainingdays', 'time', 'review'];
let wizardStep = 0;
let wizardDraft = null;

function startWizard() {
  wizardDraft = Object.assign({}, state.profile || defaultProfile());
  wizardStep = 0;
  renderWizardStep();
}

function numOrNull(v) {
  const n = Number(v);
  return v === '' || Number.isNaN(n) ? null : n;
}

function renderWizardDots() {
  document.getElementById('wizardDots').innerHTML = WIZARD_STEPS.map((_, i) =>
    `<span class="wizard-dot ${i === wizardStep ? 'is-active' : ''} ${i < wizardStep ? 'is-done' : ''}"></span>`
  ).join('');
}

function renderWizardStep() {
  renderWizardDots();
  const body = document.getElementById('wizardBody');
  const backBtn = document.getElementById('wizardBack');
  const nextBtn = document.getElementById('wizardNext');
  backBtn.style.visibility = wizardStep === 0 ? 'hidden' : 'visible';
  nextBtn.textContent = WIZARD_STEPS[wizardStep] === 'review' ? 'Begin Training' : 'Next';

  const step = WIZARD_STEPS[wizardStep];

  if (step === 'bodygoal') {
    body.innerHTML = `
      <div class="wizard-title">What do you want to build?</div>
      <div class="wizard-sub">Be honest about it — this shapes how the app talks to you, and which training goal it starts you on.</div>
      <div class="wizard-cards">
        ${Object.keys(BODY_GOALS).map((key) => `
          <button class="wizard-card ${wizardDraft.bodyGoal === key ? 'is-selected' : ''}" data-bodygoal="${key}">
            <span class="wizard-card-title">${BODY_GOALS[key].label}</span>
            <span class="wizard-card-sub">${BODY_GOALS[key].blurb}</span>
          </button>`).join('')}
      </div>`;
    body.querySelectorAll('[data-bodygoal]').forEach((btn) => btn.addEventListener('click', () => {
      wizardDraft.bodyGoal = btn.getAttribute('data-bodygoal');
      wizardDraft.goal = BODY_GOALS[wizardDraft.bodyGoal].suggestGoal;
      renderWizardStep();
    }));
  } else if (step === 'goal') {
    body.innerHTML = `
      <div class="wizard-title">Training goal</div>
      <div class="wizard-sub">Pre-picked from what you just chose — this shapes your reps, sets, and rest across every session. Change it if it's not right.</div>
      <div class="wizard-cards">
        ${Object.keys(GOAL_PROFILES).map((key) => `
          <button class="wizard-card ${wizardDraft.goal === key ? 'is-selected' : ''}" data-goal="${key}">
            <span class="wizard-card-title">${GOAL_PROFILES[key].label}</span>
            <span class="wizard-card-sub">${GOAL_DESCRIPTIONS[key]}</span>
          </button>`).join('')}
      </div>`;
    body.querySelectorAll('[data-goal]').forEach((btn) => btn.addEventListener('click', () => {
      wizardDraft.goal = btn.getAttribute('data-goal');
      renderWizardStep();
    }));
  } else if (step === 'experience') {
    body.innerHTML = `
      <div class="wizard-title">Training experience?</div>
      <div class="wizard-sub">Sets adjust to match. Novices build base volume, experienced hunters get more.</div>
      <div class="wizard-cards">
        ${Object.keys(EXPERIENCE_PROFILES).map((key) => `
          <button class="wizard-card ${wizardDraft.experience === key ? 'is-selected' : ''}" data-exp="${key}">
            <span class="wizard-card-title">${EXPERIENCE_PROFILES[key].label}</span>
          </button>`).join('')}
      </div>`;
    body.querySelectorAll('[data-exp]').forEach((btn) => btn.addEventListener('click', () => {
      wizardDraft.experience = btn.getAttribute('data-exp');
      renderWizardStep();
    }));
  } else if (step === 'stats') {
    body.innerHTML = `
      <div class="wizard-title">Body stats &amp; activity</div>
      <div class="wizard-sub">Optional. Helps calibrate your profile — skip the numbers if you'd rather not share them.</div>
      <div class="wizard-fields">
        <label class="record-field"><span>Height (cm)</span><input id="wzHeight" type="number" min="100" max="250" value="${wizardDraft.heightCm ?? ''}"></label>
        <label class="record-field"><span>Weight (kg)</span><input id="wzWeight" type="number" min="30" max="250" value="${wizardDraft.weightKg ?? ''}"></label>
        <label class="record-field"><span>Age</span><input id="wzAge" type="number" min="10" max="100" value="${wizardDraft.age ?? ''}"></label>
      </div>
      <div class="wizard-cards wizard-cards-compact">
        ${Object.keys(ACTIVITY_LEVELS).map((key) => `
          <button class="wizard-card ${wizardDraft.activityLevel === key ? 'is-selected' : ''}" data-activity="${key}">
            <span class="wizard-card-title">${ACTIVITY_LEVELS[key].label}</span>
            <span class="wizard-card-sub">${ACTIVITY_LEVELS[key].blurb}</span>
          </button>`).join('')}
      </div>`;
    body.querySelectorAll('[data-activity]').forEach((btn) => btn.addEventListener('click', () => {
      wizardDraft.activityLevel = btn.getAttribute('data-activity');
      renderWizardStep();
    }));
  } else if (step === 'equipment') {
    body.innerHTML = `
      <div class="wizard-title">What have you got?</div>
      <div class="wizard-sub">Your program is built around what you actually have access to.</div>
      <div class="wizard-cards">
        ${Object.keys(EQUIPMENT_OPTIONS).map((key) => {
          const opt = EQUIPMENT_OPTIONS[key];
          const selected = wizardDraft.equipment === key;
          return `
          <button class="wizard-card ${selected ? 'is-selected' : ''} ${!opt.available ? 'is-disabled' : ''}" data-equip="${key}">
            <span class="wizard-card-title">${opt.label} ${!opt.available ? '<span class="wizard-soon">Coming soon</span>' : ''}</span>
            <span class="wizard-card-sub">${opt.blurb}</span>
          </button>`;
        }).join('')}
      </div>`;
    body.querySelectorAll('[data-equip]').forEach((btn) => btn.addEventListener('click', () => {
      const key = btn.getAttribute('data-equip');
      if (!EQUIPMENT_OPTIONS[key].available) {
        setWizardNote('That exercise library is coming in a future update — using Rings + Bands for now.');
        return;
      }
      wizardDraft.equipment = key;
      renderWizardStep();
    }));
  } else if (step === 'trainingdays') {
    body.innerHTML = `
      <div class="wizard-title">Which days can you train?</div>
      <div class="wizard-sub">Push/Pull/Legs rotates across whichever days you pick. Untrained days show light mobility work instead.</div>
      <div class="weekday-picker">
        ${WEEKDAY_LABELS.map((label, i) => `
          <button class="weekday-chip ${wizardDraft.trainingDays.includes(i) ? 'is-selected' : ''}" data-day="${i}">${label}</button>`).join('')}
      </div>
      <div id="wizardNote" class="wizard-note"></div>`;
    body.querySelectorAll('[data-day]').forEach((btn) => btn.addEventListener('click', () => {
      const day = Number(btn.getAttribute('data-day'));
      const idx = wizardDraft.trainingDays.indexOf(day);
      if (idx >= 0) {
        if (wizardDraft.trainingDays.length <= 2) {
          setWizardNote('Keep at least 2 training days so Push/Pull/Legs can rotate.');
          return;
        }
        wizardDraft.trainingDays.splice(idx, 1);
      } else {
        wizardDraft.trainingDays.push(day);
      }
      renderWizardStep();
    }));
  } else if (step === 'time') {
    const TIME_OPTIONS = [{ min: 20, label: '15-20 min' }, { min: 35, label: '30-40 min' }, { min: 55, label: '45-60 min' }, { min: 75, label: '60+ min' }];
    body.innerHTML = `
      <div class="wizard-title">Time per session?</div>
      <div class="wizard-sub">Your program auto-trims to fit. Priority exercises stay, extras drop first.</div>
      <div class="wizard-cards">
        ${TIME_OPTIONS.map((o) => `
          <button class="wizard-card ${wizardDraft.timeBudgetMin === o.min ? 'is-selected' : ''}" data-time="${o.min}">
            <span class="wizard-card-title">${o.label}</span>
          </button>`).join('')}
      </div>`;
    body.querySelectorAll('[data-time]').forEach((btn) => btn.addEventListener('click', () => {
      wizardDraft.timeBudgetMin = Number(btn.getAttribute('data-time'));
      renderWizardStep();
    }));
  } else if (step === 'review') {
    const g = GOAL_PROFILES[wizardDraft.goal].label;
    const e = EXPERIENCE_PROFILES[wizardDraft.experience].label;
    const bg = BODY_GOALS[wizardDraft.bodyGoal];
    const eq = EQUIPMENT_OPTIONS[wizardDraft.equipment].label;
    const daysLabel = wizardDraft.trainingDays.slice().sort((a, b) => a - b).map((d) => WEEKDAY_LABELS[d]).join(' / ');
    body.innerHTML = `
      <div class="wizard-title">Program calibrated</div>
      <div class="wizard-sub wizard-motivate">${bg.label} starts with consistency, not a number on a scale. Every session here moves your rank — training shows up in what you can do, what you eat shapes the rest, and that part's on you.</div>
      <div class="wizard-review">
        <div class="wizard-review-row"><span>Body goal</span><b>${bg.label}</b></div>
        <div class="wizard-review-row"><span>Training goal</span><b>${g}</b></div>
        <div class="wizard-review-row"><span>Experience</span><b>${e}</b></div>
        <div class="wizard-review-row"><span>Equipment</span><b>${eq}</b></div>
        <div class="wizard-review-row"><span>Training days</span><b>${daysLabel}</b></div>
        <div class="wizard-review-row"><span>Session time</span><b>~${wizardDraft.timeBudgetMin} min</b></div>
        ${wizardDraft.heightCm ? `<div class="wizard-review-row"><span>Height</span><b>${wizardDraft.heightCm} cm</b></div>` : ''}
        ${wizardDraft.weightKg ? `<div class="wizard-review-row"><span>Weight</span><b>${wizardDraft.weightKg} kg</b></div>` : ''}
        ${wizardDraft.age ? `<div class="wizard-review-row"><span>Age</span><b>${wizardDraft.age}</b></div>` : ''}
      </div>`;
  }
}

function setWizardNote(msg) {
  const el = document.getElementById('wizardNote');
  if (!el) return;
  el.textContent = msg;
  clearTimeout(setWizardNote._t);
  setWizardNote._t = setTimeout(() => { el.textContent = ''; }, 3200);
}

function wizardGoNext() {
  const step = WIZARD_STEPS[wizardStep];
  if (step === 'stats') {
    wizardDraft.heightCm = numOrNull(document.getElementById('wzHeight').value);
    wizardDraft.weightKg = numOrNull(document.getElementById('wzWeight').value);
    wizardDraft.age = numOrNull(document.getElementById('wzAge').value);
  }
  if (step === 'review') {
    finishWizard();
    return;
  }
  wizardStep = Math.min(WIZARD_STEPS.length - 1, wizardStep + 1);
  renderWizardStep();
}

function wizardGoBack() {
  wizardStep = Math.max(0, wizardStep - 1);
  renderWizardStep();
}

function finishWizard() {
  state.profile = wizardDraft;
  state.hasOnboarded = true;
  manualWizardOpen = false;
  wizardDraft = null;
  saveState();
  renderAll();
}

function openWizardManually() {
  manualWizardOpen = true;
  startWizard();
  renderGates();
}

function renderAll() {
  renderGates();
  if (!state.hasSeenLogin || !state.hasOnboarded) return;
  renderStatus();
  renderQuest();
  renderLog();
  renderLibrary();
  renderRecords();
}

/* ============================== INIT ============================== */

function init() {
  rolloverDayIfNeeded();

  document.querySelectorAll('.nav-btn').forEach((btn) => {
    btn.addEventListener('click', () => switchTab(btn.getAttribute('data-tab')));
  });

  document.getElementById('libraryTabs').querySelectorAll('.lib-tab').forEach((btn) => {
    btn.addEventListener('click', () => {
      activeLibraryTab = btn.getAttribute('data-lib');
      renderLibrary();
    });
  });

  document.getElementById('modalClose').addEventListener('click', () => {
    document.getElementById('exerciseModal').classList.remove('is-open');
  });
  document.getElementById('exerciseModal').addEventListener('click', (e) => {
    if (e.target.id === 'exerciseModal') e.target.classList.remove('is-open');
  });

  document.getElementById('recordForm').addEventListener('submit', (e) => {
    e.preventDefault();
    const values = {};
    RECORD_FIELDS.forEach((f) => {
      const v = document.getElementById(`rec-${f.id}`).value;
      if (v !== '') values[f.id] = Number(v);
    });
    if (Object.keys(values).length === 0) return;
    addRecord(values);
    e.target.reset();
  });

  document.getElementById('localOnlyBtn').addEventListener('click', dismissLogin);

  document.getElementById('settingsBtn').addEventListener('click', () => {
    document.getElementById('settingsModal').classList.add('is-open');
    if (typeof refreshCloudStatusUI === 'function') refreshCloudStatusUI();
  });
  document.getElementById('settingsClose').addEventListener('click', () => {
    document.getElementById('settingsModal').classList.remove('is-open');
  });
  document.getElementById('openResetBtn').addEventListener('click', () => {
    document.getElementById('settingsModal').classList.remove('is-open');
    document.getElementById('resetModal').classList.add('is-open');
  });
  document.getElementById('resetCancel').addEventListener('click', () => {
    document.getElementById('resetModal').classList.remove('is-open');
  });
  document.getElementById('resetConfirm').addEventListener('click', () => {
    resetAll();
    document.getElementById('resetModal').classList.remove('is-open');
  });

  document.getElementById('editProfileBtn').addEventListener('click', () => {
    document.getElementById('settingsModal').classList.remove('is-open');
    openWizardManually();
  });
  document.getElementById('wizardNext').addEventListener('click', wizardGoNext);
  document.getElementById('wizardBack').addEventListener('click', wizardGoBack);

  document.getElementById('modalEditSave').addEventListener('click', saveExerciseOverride);
  document.getElementById('modalEditReset').addEventListener('click', resetExerciseOverride);

  renderAll();

  if ('serviceWorker' in navigator) {
    navigator.serviceWorker.register('./sw.js').catch(() => {});
  }
}

document.addEventListener('DOMContentLoaded', init);
