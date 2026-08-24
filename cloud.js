'use strict';

/* Google Drive (appDataFolder) save sync. Degrades silently to local-only if
   offline, not configured, or the user declines — core app never depends on this. */

const DRIVE_FILE_NAME = 'neo-leveling-save.json';
const DRIVE_SCOPE = 'https://www.googleapis.com/auth/drive.appdata';

let gTokenClient = null;
let gAccessToken = null;
let gUserEmail = null;
let cloudFileId = null;
let lastSyncedAt = null;
let cloudBusy = false;
let cloudSyncTimer = null;
let silentAttemptInProgress = false;

function isSignedIn() { return !!gAccessToken; }

function initGoogle() {
  if (typeof GOOGLE_CLIENT_ID === 'undefined' || !GOOGLE_CLIENT_ID || GOOGLE_CLIENT_ID.indexOf('REPLACE_WITH') === 0) {
    return; // not configured yet — app runs fully local-only
  }
  if (!window.google || !google.accounts || !google.accounts.oauth2) {
    setTimeout(initGoogle, 1500); // GSI script still loading (or offline) — retry briefly
    return;
  }

  gTokenClient = google.accounts.oauth2.initTokenClient({
    client_id: GOOGLE_CLIENT_ID,
    scope: DRIVE_SCOPE,
    callback: async (resp) => {
      const wasSilent = silentAttemptInProgress;
      silentAttemptInProgress = false;
      if (resp.error) {
        if (!wasSilent) setLoginStatus('Sign-in failed. Try again.');
        return;
      }
      gAccessToken = resp.access_token;
      await fetchUserEmail();
      await syncFromDriveThenProceed();
    }
  });

  wireGoogleButtons();
  attemptSilentSignIn();
}

function wireGoogleButtons() {
  const wrap = document.getElementById('googleBtnContainer');
  if (wrap) {
    wrap.innerHTML = '';
    const btn = document.createElement('button');
    btn.type = 'button';
    btn.className = 'google-signin-btn';
    btn.innerHTML = '<span class="google-g" aria-hidden="true">G</span> Continue with Google';
    btn.addEventListener('click', () => {
      setLoginStatus('Opening Google sign-in…');
      gTokenClient.requestAccessToken({ prompt: 'consent' });
    });
    wrap.appendChild(btn);
  }

  const settingsSignIn = document.getElementById('cloudSignInBtn');
  if (settingsSignIn) settingsSignIn.addEventListener('click', () => gTokenClient.requestAccessToken({ prompt: 'consent' }));

  const syncNow = document.getElementById('cloudSyncNowBtn');
  if (syncNow) syncNow.addEventListener('click', () => pushToDrive(true));

  const signOut = document.getElementById('cloudSignOutBtn');
  if (signOut) signOut.addEventListener('click', signOutGoogle);
}

function attemptSilentSignIn() {
  if (!navigator.onLine) return;
  silentAttemptInProgress = true;
  gTokenClient.requestAccessToken({ prompt: '' });
}

async function fetchUserEmail() {
  try {
    const r = await fetch('https://www.googleapis.com/oauth2/v3/userinfo', {
      headers: { Authorization: 'Bearer ' + gAccessToken }
    });
    const j = await r.json();
    gUserEmail = j.email || null;
  } catch (e) {
    gUserEmail = null;
  }
}

function setLoginStatus(msg) {
  const el = document.getElementById('loginStatus');
  if (el) el.textContent = msg;
}

async function driveFindFile() {
  const q = encodeURIComponent(`name='${DRIVE_FILE_NAME}'`);
  const r = await fetch(`https://www.googleapis.com/drive/v3/files?spaces=appDataFolder&fields=files(id,modifiedTime)&q=${q}`, {
    headers: { Authorization: 'Bearer ' + gAccessToken }
  });
  if (!r.ok) throw new Error('drive list failed');
  const j = await r.json();
  return (j.files && j.files[0]) || null;
}

async function driveReadFile(fileId) {
  const r = await fetch(`https://www.googleapis.com/drive/v3/files/${fileId}?alt=media`, {
    headers: { Authorization: 'Bearer ' + gAccessToken }
  });
  if (!r.ok) throw new Error('drive read failed');
  return r.json();
}

async function driveCreateFile(payload) {
  const boundary = 'neo_leveling_boundary';
  const metadata = { name: DRIVE_FILE_NAME, parents: ['appDataFolder'] };
  const body =
    `--${boundary}\r\nContent-Type: application/json; charset=UTF-8\r\n\r\n${JSON.stringify(metadata)}\r\n` +
    `--${boundary}\r\nContent-Type: application/json\r\n\r\n${JSON.stringify(payload)}\r\n--${boundary}--`;
  const r = await fetch('https://www.googleapis.com/upload/drive/v3/files?uploadType=multipart', {
    method: 'POST',
    headers: { Authorization: 'Bearer ' + gAccessToken, 'Content-Type': `multipart/related; boundary=${boundary}` },
    body
  });
  if (!r.ok) throw new Error('drive create failed');
  const j = await r.json();
  return j.id;
}

async function driveUpdateFile(fileId, payload) {
  const r = await fetch(`https://www.googleapis.com/upload/drive/v3/files/${fileId}?uploadType=media`, {
    method: 'PATCH',
    headers: { Authorization: 'Bearer ' + gAccessToken, 'Content-Type': 'application/json' },
    body: JSON.stringify(payload)
  });
  if (!r.ok) throw new Error('drive update failed');
}

async function syncFromDriveThenProceed() {
  try {
    const file = await driveFindFile();
    if (file) {
      cloudFileId = file.id;
      const remote = await driveReadFile(file.id);
      if (remote && (remote.updatedAt || 0) > (state.updatedAt || 0)) {
        state = Object.assign(defaultState(), remote, {
          hasSeenLogin: true,
          profile: Object.assign(defaultProfile(), remote.profile || {})
        });
        localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
      }
    }
    lastSyncedAt = Date.now();
  } catch (e) {
    setLoginStatus('Signed in, but sync failed — your save stays local for now.');
  }
  dismissLogin();
  refreshCloudStatusUI();
}

function scheduleCloudPush() {
  if (!isSignedIn()) return;
  clearTimeout(cloudSyncTimer);
  cloudSyncTimer = setTimeout(() => pushToDrive(false), 2000);
}

async function pushToDrive(manual) {
  if (!isSignedIn() || cloudBusy) return;
  if (!navigator.onLine) { if (manual) setCloudStatusText('Offline — will sync later'); return; }
  cloudBusy = true;
  try {
    if (!cloudFileId) {
      const existing = await driveFindFile();
      cloudFileId = existing ? existing.id : null;
    }
    if (cloudFileId) await driveUpdateFile(cloudFileId, state);
    else cloudFileId = await driveCreateFile(state);
    lastSyncedAt = Date.now();
  } catch (e) {
    // stays queued — next state change retries via scheduleCloudPush
  } finally {
    cloudBusy = false;
    refreshCloudStatusUI();
  }
}

function onStateSaved() {
  scheduleCloudPush();
}

function signOutGoogle() {
  if (gAccessToken && window.google) {
    google.accounts.oauth2.revoke(gAccessToken, () => {});
  }
  gAccessToken = null;
  gUserEmail = null;
  cloudFileId = null;
  refreshCloudStatusUI();
}

function setCloudStatusText(msg) {
  const text = document.getElementById('cloudStatusText');
  if (text) text.textContent = msg;
}

function refreshCloudStatusUI() {
  const dot = document.getElementById('cloudStatusDot');
  const text = document.getElementById('cloudStatusText');
  const syncedAt = document.getElementById('cloudSyncedAt');
  const signInBtn = document.getElementById('cloudSignInBtn');
  const signedInActions = document.getElementById('cloudSignedInActions');
  if (!dot) return;

  if (isSignedIn()) {
    dot.classList.add('is-on');
    text.textContent = gUserEmail ? `Signed in as ${gUserEmail}` : 'Signed in';
    syncedAt.textContent = lastSyncedAt ? `Last synced ${new Date(lastSyncedAt).toLocaleTimeString()}` : 'Not yet synced';
    signInBtn.style.display = 'none';
    signedInActions.style.display = 'flex';
  } else {
    dot.classList.remove('is-on');
    text.textContent = 'Not signed in';
    syncedAt.textContent = '';
    signInBtn.style.display = 'block';
    signedInActions.style.display = 'none';
  }
}

document.addEventListener('DOMContentLoaded', initGoogle);
