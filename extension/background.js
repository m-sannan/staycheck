const API = 'https://staycheck-api.msannan121.workers.dev';
const LOG_KEY = 'staycheckLogs';
const MATCH_KEY = 'staycheckSavedMatches';
const INSTALLATION_KEY = 'staycheckInstallationId';
const MAX_LOGS = 50;

async function writeLog(entry) {
  const { [LOG_KEY]: current = [] } = await chrome.storage.local.get({ [LOG_KEY]: [] });
  const logs = [...current, { at: new Date().toISOString(), ...entry }].slice(-MAX_LOGS);
  await chrome.storage.local.set({ [LOG_KEY]: logs, staycheckLastStatus: logs.at(-1) });
}

async function installationId() { const { [INSTALLATION_KEY]: current } = await chrome.storage.local.get({ [INSTALLATION_KEY]: null }); if (current) return current; const created = crypto.randomUUID(); await chrome.storage.local.set({ [INSTALLATION_KEY]: created }); return created; }

chrome.runtime.onMessage.addListener((message, _sender, sendResponse) => {
  if (message?.type === 'staycheck-log') { writeLog(message.entry).then(() => sendResponse({ ok: true })); return true; }
  if (message?.type === 'staycheck-get-match') { chrome.storage.local.get({ [MATCH_KEY]: {} }).then(({ [MATCH_KEY]: matches }) => sendResponse({ match: matches[message.key] || null })); return true; }
  if (message?.type === 'staycheck-save-match') { chrome.storage.local.get({ [MATCH_KEY]: {} }).then(async ({ [MATCH_KEY]: matches }) => { const updated = { ...matches, [message.key]: { ...message.match, savedAt: new Date().toISOString() } }; await chrome.storage.local.set({ [MATCH_KEY]: updated }); sendResponse({ ok: true }); }); return true; }
  if (message?.type === 'staycheck-forget-match') { chrome.storage.local.get({ [MATCH_KEY]: {} }).then(async ({ [MATCH_KEY]: matches }) => { const updated = { ...matches }; delete updated[message.key]; await chrome.storage.local.set({ [MATCH_KEY]: updated }); sendResponse({ ok: true }); }); return true; }
  if (message?.type !== 'staycheck-request') return;
  installationId().then((id) => fetch(`${API}${message.path}`, { method: 'POST', headers: { 'Content-Type': 'application/json', 'X-StayCheck-Installation': id }, body: JSON.stringify(message.body) }))
    .then(async (response) => {
      const payload = await response.json().catch(() => ({}));
      if (!response.ok) throw new Error(payload.error || `Local companion returned ${response.status}.`);
      sendResponse({ ok: true, payload });
    })
    .catch((error) => sendResponse({ ok: false, error: error.message || 'Could not reach the local companion.' }));
  return true;
});
