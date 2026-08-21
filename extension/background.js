const API = 'http://127.0.0.1:8787';
const LOG_KEY = 'staycheckLogs';
const MAX_LOGS = 50;

async function writeLog(entry) {
  const { [LOG_KEY]: current = [] } = await chrome.storage.local.get({ [LOG_KEY]: [] });
  const logs = [...current, { at: new Date().toISOString(), ...entry }].slice(-MAX_LOGS);
  await chrome.storage.local.set({ [LOG_KEY]: logs, staycheckLastStatus: logs.at(-1) });
}

chrome.runtime.onMessage.addListener((message, _sender, sendResponse) => {
  if (message?.type === 'staycheck-log') { writeLog(message.entry).then(() => sendResponse({ ok: true })); return true; }
  if (message?.type !== 'staycheck-request') return;
  fetch(`${API}${message.path}`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(message.body) })
    .then(async (response) => {
      const payload = await response.json().catch(() => ({}));
      if (!response.ok) throw new Error(payload.error || `Local companion returned ${response.status}.`);
      sendResponse({ ok: true, payload });
    })
    .catch((error) => sendResponse({ ok: false, error: error.message || 'Could not reach the local companion.' }));
  return true;
});
