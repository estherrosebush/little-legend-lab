export async function api(path, options = {}) {
  const isFormData = options.body instanceof FormData;
  const config = {
    method: options.method || (options.body && !isFormData ? 'POST' : 'GET'),
    ...options
  };

  if (options.body && !isFormData) {
    config.body = JSON.stringify(options.body);
    config.headers = { 'Content-Type': 'application/json', ...(options.headers || {}) };
  } else if (isFormData) {
    config.method = options.method || 'POST';
  }

  const response = await fetch(path, config);
  const data = await response.json().catch(() => ({}));
  if (!response.ok) {
    throw new Error(data.error || `Request failed (${response.status})`);
  }
  return data;
}

export function formatMinutes(minutes) {
  const safe = Math.max(0, Math.round(minutes || 0));
  const hours = Math.floor(safe / 60);
  const mins = safe % 60;
  if (hours && mins) return `${hours}h ${mins}m`;
  if (hours) return `${hours}h`;
  return `${mins}m`;
}

export function formatClock(iso) {
  return new Date(iso).toLocaleTimeString([], { hour: 'numeric', minute: '2-digit' });
}

export function formatDay(iso) {
  return new Date(iso).toLocaleDateString([], { month: 'short', day: 'numeric' });
}

export function formatDayLong(iso) {
  return new Date(iso).toLocaleDateString([], { weekday: 'long', month: 'long', day: 'numeric', year: 'numeric' });
}

export function computeHourTotals(entries) {
  const now = new Date();
  const startOfToday = new Date(now);
  startOfToday.setHours(0, 0, 0, 0);
  const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);

  let todayMinutes = 0;
  let weekMinutes = 0;
  let totalMinutes = 0;

  for (const entry of entries) {
    const minutes =
      entry.minutes ??
      (entry.endedAt
        ? Math.round((new Date(entry.endedAt) - new Date(entry.startedAt)) / 60000)
        : Math.max(0, Math.round((now - new Date(entry.startedAt)) / 60000)));
    totalMinutes += minutes;
    const started = new Date(entry.startedAt);
    if (started >= startOfToday) todayMinutes += minutes;
    if (started >= weekAgo) weekMinutes += minutes;
  }

  return { todayMinutes, weekMinutes, totalMinutes };
}

export function computeEraSummary({ entries, projects, chores, profile, stickers }) {
  const totals = computeHourTotals(entries);
  const doneChores = chores.filter((chore) => chore.done).length;
  const doneProjects = projects.filter((project) => project.status === 'done').length;
  const activeProjects = projects.filter((project) => project.status === 'active').length;
  const badges = stickers.reduce((sum, sticker) => sum + Number(sticker.count || 0), 0);
  const subjectCounts = {};
  for (const entry of entries) {
    const subject = (entry.subject || '').trim();
    if (subject) subjectCounts[subject] = (subjectCounts[subject] || 0) + 1;
  }
  const favoriteSubject =
    Object.entries(subjectCounts).sort((a, b) => b[1] - a[1])[0]?.[0] || '';

  return {
    totalMinutes: totals.totalMinutes,
    todayMinutes: totals.todayMinutes,
    entriesCount: entries.length,
    questsDone: doneChores,
    questsTotal: chores.length,
    projectsDone: doneProjects,
    projectsActive: activeProjects,
    starsEarned: profile?.starBank ?? 0,
    starsSpent: profile?.starsSpent ?? 0,
    badges,
    favoriteSubject,
    hoursLabel: formatMinutes(totals.totalMinutes)
  };
}

export function computeYearSummary({ entries, projects, profile, stickers }) {
  const base = computeEraSummary({ entries, projects, chores: [], profile, stickers });
  const byMonth = [];
  const monthKeys = new Map();
  for (const entry of entries) {
    const date = new Date(entry.startedAt);
    const key = `${date.getFullYear()}-${date.getMonth()}`;
    if (!monthKeys.has(key)) {
      monthKeys.set(key, {
        label: date.toLocaleDateString([], { month: 'long' }),
        order: date.getFullYear() * 12 + date.getMonth(),
        minutes: 0
      });
      byMonth.push(monthKeys.get(key));
    }
    const minutes =
      entry.minutes ??
      (entry.endedAt
        ? Math.round((new Date(entry.endedAt) - new Date(entry.startedAt)) / 60000)
        : 0);
    monthKeys.get(key).minutes += minutes;
  }
  byMonth.sort((a, b) => a.order - b.order);

  const completedProjects = projects
    .filter((project) => project.status === 'done')
    .map((project) => project.title);

  return {
    ...base,
    byMonth,
    completedProjects,
    badgesBreakdown: stickers
      .filter((sticker) => Number(sticker.count || 0) > 0)
      .map((sticker) => ({ label: sticker.label, count: Number(sticker.count) }))
  };
}
