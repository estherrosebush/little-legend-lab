import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import { api } from '../lib/api.js';

const AppStateContext = createContext(null);

export function AppStateProvider({ children }) {
  const [status, setStatus] = useState('loading');
  const [loadError, setLoadError] = useState('');
  const [profile, setProfile] = useState(null);
  const [owned, setOwned] = useState([]);
  const [backgrounds, setBackgrounds] = useState([]);
  const [hours, setHours] = useState({ entries: [], open: null });
  const [projects, setProjects] = useState([]);
  const [snapshots, setSnapshots] = useState([]);
  const [stories, setStories] = useState([]);
  const [research, setResearch] = useState([]);

  const loadAll = useCallback(async () => {
    setStatus('loading');
    try {
      const [hoursData, projectsData, profileData, backgroundsData, snapshotsData, storiesData, researchData] = await Promise.all([
        api('/api/hours'),
        api('/api/projects'),
        api('/api/profile'),
        api('/api/backgrounds'),
        api('/api/snapshots'),
        api('/api/stories'),
        api('/api/research')
      ]);
      setHours({ entries: hoursData.entries || [], open: hoursData.open || null });
      setProjects(projectsData.projects || []);
      setProfile(profileData.profile);
      setOwned(profileData.owned || []);
      setBackgrounds(backgroundsData.backgrounds || []);
      setSnapshots(snapshotsData.snapshots || []);
      setStories(storiesData.stories || []);
      setResearch(researchData.research || []);
      setLoadError('');
      setStatus('ready');
    } catch (err) {
      setLoadError(err.message);
      setStatus('error');
    }
  }, []);

  useEffect(() => {
    loadAll();
  }, [loadAll]);

  const clockIn = useCallback(async (subject) => {
    const entry = await api('/api/hours', { body: { action: 'clock-in', subject } });
    setHours((current) => ({ entries: [entry, ...current.entries.filter((e) => !e.endedAt)], open: entry }));
    return entry;
  }, []);

  const clockOut = useCallback(async ({ note, subject }) => {
    const entry = await api('/api/hours', { body: { action: 'clock-out', note, subject } });
    setHours((current) => ({
      entries: current.entries.map((e) => (e.id === entry.id ? entry : e)),
      open: null
    }));
    return entry;
  }, []);

  const deleteEntry = useCallback(async (id) => {
    await api(`/api/hours/${id}`, { method: 'DELETE' });
    setHours((current) => ({
      entries: current.entries.filter((e) => e.id !== id),
      open: current.open?.id === id ? null : current.open
    }));
  }, []);

  const addProject = useCallback(async (data) => {
    const row = await api('/api/projects', { body: data });
    setProjects((current) => [row, ...current]);
    return row;
  }, []);

  const updateProject = useCallback(async (id, patch) => {
    const row = await api(`/api/projects/${id}`, { method: 'PUT', body: patch });
    setProjects((current) => current.map((p) => (p.id === id ? row : p)));
    return row;
  }, []);

  const deleteProject = useCallback(async (id) => {
    await api(`/api/projects/${id}`, { method: 'DELETE' });
    setProjects((current) => current.filter((p) => p.id !== id));
  }, []);

  const patchProfile = useCallback(async (body) => {
    const data = await api('/api/profile', { method: 'PATCH', body });
    setProfile(data.profile);
    return data.profile;
  }, []);

  const grantStars = useCallback(
    async (amount) => {
      const data = await api('/api/profile', { method: 'PATCH', body: { action: 'grant', amount } });
      setProfile(data.profile);
      return data;
    },
    []
  );

  const purchase = useCallback(async (itemId) => {
    const data = await api('/api/shop', { body: { itemId } });
    setProfile(data.profile);
    setOwned(data.inventory.map((row) => row.itemId));
    return data;
  }, []);

  const updateCreature = useCallback(
    (fields) => patchProfile({ action: 'creature', ...fields }),
    [patchProfile]
  );

  const setEquipped = useCallback(
    async (equipped) => {
      const updated = await patchProfile({ action: 'equip', equipped });
      return updated;
    },
    [patchProfile]
  );

  const toggleItem = useCallback(
    async (itemId) => {
      const current = profile?.equipped || [];
      const next = current.includes(itemId)
        ? current.filter((id) => id !== itemId)
        : [...current, itemId];
      await setEquipped(next);
    },
    [profile, setEquipped]
  );

  const uploadBackground = useCallback(async (file) => {
    const form = new FormData();
    form.append('file', file);
    const row = await api('/api/backgrounds', { body: form });
    setBackgrounds((current) => [row, ...current]);
    return row;
  }, []);

  const selectBackground = useCallback(
    async (backgroundId) => patchProfile({ action: 'background', backgroundId }),
    [patchProfile]
  );

  const deleteBackground = useCallback(async (id) => {
    await api(`/api/backgrounds/${id}`, { method: 'DELETE' });
    setBackgrounds((current) => current.filter((bg) => bg.id !== id));
    setProfile((current) =>
      current && current.backgroundId === id ? { ...current, backgroundId: null } : current
    );
  }, []);

  const captureSnapshot = useCallback(async (payload) => {
    const row = await api('/api/snapshots', { body: payload });
    setSnapshots((current) => [...current, row]);
    return row;
  }, []);

  const updateSnapshot = useCallback(async (id, patch) => {
    const row = await api(`/api/snapshots/${id}`, { method: 'PATCH', body: patch });
    setSnapshots((current) => current.map((s) => (s.id === id ? row : s)));
    return row;
  }, []);

  const deleteSnapshot = useCallback(async (id) => {
    await api(`/api/snapshots/${id}`, { method: 'DELETE' });
    setSnapshots((current) => current.filter((s) => s.id !== id));
  }, []);

  const createStory = useCallback(async (data) => {
    const row = await api('/api/stories', { body: data });
    setStories((current) => [row, ...current]);
    return row;
  }, []);

  const updateStory = useCallback(async (id, patch) => {
    const row = await api(`/api/stories/${id}`, { method: 'PUT', body: patch });
    setStories((current) => current.map((s) => (s.id === id ? row : s)));
    return row;
  }, []);

  const deleteStory = useCallback(async (id) => {
    await api(`/api/stories/${id}`, { method: 'DELETE' });
    setStories((current) => current.filter((s) => s.id !== id));
  }, []);

  const createResearch = useCallback(async (data) => {
    const row = await api('/api/research', { body: data });
    setResearch((current) => [row, ...current]);
    return row;
  }, []);

  const updateResearch = useCallback(async (id, patch) => {
    const row = await api(`/api/research/${id}`, { method: 'PUT', body: patch });
    setResearch((current) => current.map((r) => (r.id === id ? row : r)));
    return row;
  }, []);

  const deleteResearch = useCallback(async (id) => {
    await api(`/api/research/${id}`, { method: 'DELETE' });
    setResearch((current) => current.filter((r) => r.id !== id));
  }, []);

  const value = useMemo(() => {
    const starBalance = profile ? Math.max(0, profile.starBank - profile.starsSpent) : 0;
    return {
      status,
      loadError,
      profile,
      owned,
      starBalance,
      backgrounds,
      hours,
      projects,
      snapshots,
      stories,
      research,
      loadAll,
      clockIn,
      clockOut,
      deleteEntry,
      addProject,
      updateProject,
      deleteProject,
      updateCreature,
      toggleItem,
      grantStars,
      purchase,
      uploadBackground,
      selectBackground,
      deleteBackground,
      captureSnapshot,
      updateSnapshot,
      deleteSnapshot
    };
  }, [
    status,
    loadError,
    profile,
    owned,
    backgrounds,
    hours,
    projects,
    snapshots,
    stories,
    research,
    loadAll,
    clockIn,
    clockOut,
    deleteEntry,
    addProject,
    updateProject,
    deleteProject,
    updateCreature,
    toggleItem,
    grantStars,
    purchase,
    uploadBackground,
    selectBackground,
    deleteBackground,
    captureSnapshot,
    updateSnapshot,
    deleteSnapshot,
    createStory,
    updateStory,
    deleteStory,
    createResearch,
    updateResearch,
    deleteResearch
  ]);

  return <AppStateContext.Provider value={value}>{children}</AppStateContext.Provider>;
}

export function useAppState() {
  const context = useContext(AppStateContext);
  if (!context) {
    throw new Error('useAppState must be used inside AppStateProvider');
  }
  return context;
}
