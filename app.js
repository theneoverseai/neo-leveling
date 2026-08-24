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

const CLASSES = [
  { id: 'Vanguard', tag: 'Push Focus', blurb: 'Leads with force. Built on pressing strength and control.' },
  { id: 'Sentinel', tag: 'Pull Focus', blurb: 'Holds the line. Built on grip, back, and pulling power.' },
  { id: 'Ranger', tag: 'Mobility Focus', blurb: 'Moves first. Built on range, joint health, and recovery.' }
];

const DAY_TYPE_BY_DOW = ['Rest', 'Push', 'Pull', 'Legs', 'Rest', 'Push', 'Pull']; // Sun..Sat

const ITEM_XP = 10;
const DAY_BONUS_XP = 20;

const EXERCISES = {
  Push: [
    {
      id: 'push-ring-dip', name: 'Ring Dip', sets: '4 x 3-6', note: 'band assisted', badge: 'PRIORITY',
      primary: ['Chest', 'Triceps'], secondary: ['Front Delts', 'Core'], notTargeted: ['Back', 'Legs', 'Grip'],
      blurb: 'Anchor push movement. Heaviest loading pattern in the session, drives chest and triceps strength directly.',
      stat: 'strength'
    },
    {
      id: 'push-ring-pushup', name: 'Ring Push Up', sets: '4 x 10-15', note: 'feet elevated',
      primary: ['Chest', 'Shoulders'], secondary: ['Triceps', 'Core'], notTargeted: ['Back', 'Grip'],
      blurb: 'Volume work after the dip. Feeds the same pattern at higher reps to build control and hypertrophy.',
      stat: 'strength'
    },
    {
      id: 'push-pike-pushup', name: 'Pike Push Up', sets: '3 x 8-12', note: 'on rings',
      primary: ['Shoulders'], secondary: ['Triceps', 'Upper Chest'], notTargeted: ['Back', 'Legs'],
      blurb: "Main shoulder builder for the day. Vertical pressing angle the dip and push up don't hit.",
      stat: 'strength'
    },
    {
      id: 'push-ring-fly', name: 'Ring Fly', sets: '3 x 10-15', note: 'slow controlled',
      primary: ['Chest'], secondary: ['Front Delts', 'Rotator Cuff'], notTargeted: ['Triceps', 'Back'],
      blurb: 'Stretch-position chest work at slow tempo. Builds control and the connective tissue resilience rings demand.',
      stat: 'strength'
    },
    {
      id: 'push-diamond-pushup', name: 'Diamond Push Up', sets: '2 x 12-15', note: 'on rings',
      primary: ['Triceps'], secondary: ['Chest', 'Core'], notTargeted: ['Back', 'Shoulders'],
      blurb: 'Triceps finisher. Closes the session on the muscle that assisted every prior movement.',
      stat: 'strength'
    }
  ],
  Pull: [
    {
      id: 'pull-strict-pullup', name: 'Strict Pull Up', sets: '4 x 4-5', note: '', badge: 'STRONGEST',
      primary: ['Lats', 'Biceps'], secondary: ['Grip', 'Rear Delts'], notTargeted: ['Chest', 'Legs'],
      blurb: 'Your strongest pull pattern. Leads the session while grip and CNS are freshest.',
      stat: 'strength'
    },
    {
      id: 'pull-ring-row', name: 'Ring Row', sets: '3 x 10-12', note: 'feet forward',
      primary: ['Mid Back', 'Lats'], secondary: ['Biceps', 'Rear Delts'], notTargeted: ['Chest', 'Legs'],
      blurb: 'Horizontal pull volume. Balances the vertical pull up with a different angle on the back.',
      stat: 'strength'
    },
    {
      id: 'pull-band-wide-row', name: 'Band Assisted Wide Row', sets: '3 x 8-10', note: 'or pull up',
      primary: ['Rear Delts', 'Upper Back'], secondary: ['Lats', 'Biceps'], notTargeted: ['Chest', 'Grip'],
      blurb: 'Rear delt and upper back focus. The angle the pull up and row leave underworked.',
      stat: 'strength'
    },
    {
      id: 'pull-face-pull', name: 'Band Face Pull', sets: '3 x 15', note: 'corrective',
      primary: ['Rear Delts', 'Rotator Cuff'], secondary: ['Upper Back'], notTargeted: ['Lats', 'Biceps'],
      blurb: 'Corrective work. Shoulder health maintenance so heavy pressing and pulling stay pain-free.',
      stat: 'mobility'
    },
    {
      id: 'pull-dead-hang', name: 'Dead Hang', sets: '3 x max', note: 'target 40s, active grip',
      primary: ['Grip', 'Forearms'], secondary: ['Shoulders', 'Lats'], notTargeted: ['Chest', 'Legs'],
      blurb: 'Pure grip and shoulder stability endurance. The base every pull up and hang-dependent move relies on.',
      stat: 'grip'
    }
  ],
  Legs: [
    {
      id: 'legs-bulgarian-split', name: 'Bulgarian Split Squat', sets: '3 x 10-12', note: 'per side, rear foot on rings',
      primary: ['Quads', 'Glutes'], secondary: ['Hamstrings', 'Core', 'Balance'], notTargeted: ['Upper Body'],
      blurb: 'Main unilateral strength driver. Builds single-leg quad and glute strength plus the balance rings demand.',
      stat: 'strength'
    },
    {
      id: 'legs-pistol-squat', name: 'Ring Assisted Pistol Squat', sets: '3 x 6-8', note: 'per side', badge: 'SHALLOW',
      primary: ['Quads', 'Glutes'], secondary: ['Ankle', 'Balance'], notTargeted: ['Hamstrings', 'Upper Body'],
      blurb: "Depth-limited on purpose. Ankle mobility is still developing, so range increases as mobility work pays off, not before.",
      stat: 'strength'
    },
    {
      id: 'legs-nordic-curl', name: 'Nordic Curl', sets: '3 x 6-8', note: 'band assisted',
      primary: ['Hamstrings'], secondary: ['Glutes', 'Core'], notTargeted: ['Quads', 'Upper Body'],
      blurb: "Hamstring strength the squat patterns don't reach. Band assistance keeps it controlled at your current level.",
      stat: 'strength'
    },
    {
      id: 'legs-calf-raise', name: 'Calf Raise', sets: '3 x 12-15', note: 'slow negative',
      primary: ['Calves'], secondary: ['Ankle Stability'], notTargeted: ['Quads', 'Hamstrings', 'Glutes'],
      blurb: 'Slow eccentric builds calf strength and tendon resilience. Feeds directly into ankle stability work.',
      stat: 'endurance'
    },
    {
      id: 'legs-lateral-band-walk', name: 'Lateral Band Walk', sets: '2 x 15', note: 'per side', badge: 'SWAP',
      primary: ['Glute Medius', 'Hips'], secondary: ['Ankle Stability'], notTargeted: ['Quads', 'Hamstrings'],
      blurb: 'Replaces jump work this cycle. Protects a currently sore ankle from impact while still training hip stability.',
      stat: 'endurance'
    }
  ],
  Rest: [
    {
      id: 'rest-ankle-dorsi', name: 'Ankle Dorsiflexion Drill', sets: '3 x 10', note: 'per side',
      primary: ['Ankle'], secondary: ['Calves'], notTargeted: ['Upper Body'],
      blurb: 'Directly targets the ankle range limiting pistol squat depth. Highest-leverage mobility drill in rotation.',
      stat: 'mobility'
    },
    {
      id: 'rest-9090-hip', name: '90/90 Hip Switch', sets: '2 min', note: '',
      primary: ['Hips'], secondary: ['Core'], notTargeted: ['Upper Body', 'Ankle'],
      blurb: 'Hip internal and external rotation range. Supports squat depth and general lower body mobility.',
      stat: 'mobility'
    },
    {
      id: 'rest-thoracic-ext', name: 'Thoracic Extension', sets: '1 min', note: 'on foam or towel',
      primary: ['Thoracic Spine'], secondary: ['Shoulders'], notTargeted: ['Hips', 'Ankle'],
      blurb: 'Upper back extension. Offsets pressing-dominant push days and keeps overhead positions open.',
      stat: 'mobility'
    },
    {
      id: 'rest-cat-cow', name: 'Cat Cow Flow', sets: '5 reps', note: '',
      primary: ['Spine'], secondary: ['Core'], notTargeted: ['Ankle', 'Hips'],
      blurb: 'Full spine mobility flow. Low-intensity reset between harder training days.',
      stat: 'mobility'
    },
    {
      id: 'rest-toe-touch', name: 'Toe Touch Check', sets: '1 test', note: '',
      primary: ['Posterior Chain'], secondary: ['Hamstrings'], notTargeted: ['Upper Body'],
      blurb: 'A quick test, not a drill. Tracks posterior chain flexibility trend over time.',
      stat: 'mobility'
    }
  ]
};

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
    className: null,
    xp: 0,
    streak: 0,
    lastFullCompletionDate: null,
    today: { date: todayStr(), checked: {}, fullBonusAwarded: false, prevStreak: 0, prevLastFull: null },
    statHistory: [],
    statCounts: { strength: 0, grip: 0, endurance: 0, mobility: 0 },
    log: {},
    hasSeenLogin: false,
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
      today: Object.assign(defaultState().today, parsed.today || {})
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
  const dow = new Date(dateStr + 'T00:00:00').getDay();
  return DAY_TYPE_BY_DOW[dow];
}

function todaysQuestItems() {
  const type = dayType();
  const workout = EXERCISES[type].map((ex) => ({ id: ex.id, kind: 'exercise', stat: ex.stat, ref: ex }));
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

function selectClass(id) {
  state.className = id;
  saveState();
  renderAll();
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
  document.getElementById('className').textContent = state.className || '—';
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
  wrap.innerHTML = workoutItems.map((i) => exerciseRow(i.ref, state.today.checked[i.id])).join('');

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

function exerciseRow(ex, checked) {
  return `
    <div class="quest-item ${checked ? 'is-checked' : ''}">
      <div class="quest-check" data-toggle="${ex.id}">
        <span class="checkbox">${checked ? '✓' : ''}</span>
        <div class="quest-item-body">
          <div class="quest-item-title">
            <span class="quest-item-name">${ex.name}</span>
            ${ex.badge ? `<span class="badge badge-${ex.badge.toLowerCase()}">${ex.badge}</span>` : ''}
          </div>
          <div class="quest-item-sub">${ex.sets}${ex.note ? ' · ' + ex.note : ''}</div>
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

function openExerciseDetail(id) {
  const ex = findExercise(id);
  if (!ex) return;
  const modal = document.getElementById('exerciseModal');
  document.getElementById('modalTitle').textContent = ex.name;
  document.getElementById('modalSets').textContent = `${ex.sets}${ex.note ? ' · ' + ex.note : ''}`;
  document.getElementById('modalBlurb').textContent = ex.blurb;
  document.getElementById('modalPrimary').innerHTML = ex.primary.map(tagChip).join('');
  document.getElementById('modalSecondary').innerHTML = ex.secondary.map(tagChip).join('');
  document.getElementById('modalNot').innerHTML = ex.notTargeted.map(tagChip).join('');
  document.getElementById('modalWatch').href = `https://www.youtube.com/results?search_query=${encodeURIComponent(ex.name + ' exercise form')}`;
  modal.classList.add('is-open');
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

  document.getElementById('libraryList').innerHTML = list.map((ex) => `
    <div class="lib-card" data-info="${ex.id}">
      <div class="lib-card-head">
        <span class="lib-card-name">${ex.name}</span>
        ${ex.badge ? `<span class="badge badge-${ex.badge.toLowerCase()}">${ex.badge}</span>` : ''}
      </div>
      <div class="lib-card-sets">${ex.sets}${ex.note ? ' · ' + ex.note : ''}</div>
      <div class="lib-card-blurb">${ex.blurb}</div>
      <div class="tag-row">${ex.primary.map(tagChip).join('')}</div>
    </div>
  `).join('');

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

function renderGates() {
  const login = document.getElementById('loginGate');
  const classGate = document.getElementById('classGate');
  const app = document.getElementById('app');

  const showLogin = !state.hasSeenLogin;
  const showClass = !showLogin && !state.className;
  const showApp = !showLogin && !!state.className;

  login.classList.toggle('is-open', showLogin);
  classGate.classList.toggle('is-open', showClass);
  app.classList.toggle('is-hidden', !showApp);
}

function dismissLogin() {
  state.hasSeenLogin = true;
  saveState();
  renderAll();
}

function renderAll() {
  renderGates();
  if (!state.hasSeenLogin || !state.className) return;
  renderStatus();
  renderQuest();
  renderLog();
  renderLibrary();
  renderRecords();
}

/* ============================== INIT ============================== */

function init() {
  rolloverDayIfNeeded();

  document.getElementById('classGate').innerHTML = CLASSES.map((c) => `
    <button class="class-card" data-class="${c.id}">
      <span class="class-name">${c.id}</span>
      <span class="class-tag">${c.tag}</span>
      <span class="class-blurb">${c.blurb}</span>
    </button>
  `).join('') + `<p class="class-note">This is a title only. It does not change your program.</p>`;

  document.getElementById('classGate').querySelectorAll('[data-class]').forEach((btn) => {
    btn.addEventListener('click', () => selectClass(btn.getAttribute('data-class')));
  });

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

  renderAll();

  if ('serviceWorker' in navigator) {
    navigator.serviceWorker.register('./sw.js').catch(() => {});
  }
}

document.addEventListener('DOMContentLoaded', init);
