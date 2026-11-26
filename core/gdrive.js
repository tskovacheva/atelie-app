// Глина · core/gdrive.js — пренос до Google Drive на потребителя (v1.54.0).
//
// Само транспорт: вход с Google (Google Identity Services, токен в паметта),
// един файл в скритата папка на приложението (appDataFolder) и едно предишно
// копие до него. Нищо не се зарежда при старт — библиотеката на Google се
// тегли едва при първото „Изпрати“/„Вземи“, затова Глина остава напълно
// офлайн, докато синхронизацията не се ползва. Решенията са в domain/sync.js.
//
// Обхват drive.appdata: приложението вижда само своята папка, не останалия Drive.

const GIS_SRC = 'https://accounts.google.com/gsi/client';
const SCOPE = 'https://www.googleapis.com/auth/drive.appdata';
const API = 'https://www.googleapis.com/drive/v3/files';
const UPLOAD = 'https://www.googleapis.com/upload/drive/v3/files';
export const GD_FILE = 'glina-state.json';
export const GD_PREV = 'glina-state.prev.json';

let _gis = null;          // Promise за библиотеката
let _tok = null;          // { access, exp }
let _client = null, _clientId = '';

function loadGis() {
  if (typeof window !== 'undefined' && window.google && window.google.accounts && window.google.accounts.oauth2) return Promise.resolve();
  if (_gis) return _gis;
  _gis = new Promise((res, rej) => {
    const s = document.createElement('script');
    s.src = GIS_SRC; s.async = true;
    s.onload = () => res();
    s.onerror = () => { _gis = null; rej(gdErr('offline')); };
    document.head.appendChild(s);
  });
  return _gis;
}

function gdErr(code, detail) { const e = new Error(code); e.gd = code; if (detail) e.detail = detail; return e; }

// Токен за достъп. Вика се от бутон (жест) — иначе браузърът спира прозореца на Google.
export function gdToken(clientId) {
  if (!clientId) return Promise.reject(gdErr('no-client'));
  if (_tok && _tok.exp - Date.now() > 60000 && _clientId === clientId) return Promise.resolve(_tok.access);
  if (typeof navigator !== 'undefined' && navigator.onLine === false) return Promise.reject(gdErr('offline'));
  return loadGis().then(() => new Promise((res, rej) => {
    if (!_client || _clientId !== clientId) {
      _clientId = clientId;
      _client = window.google.accounts.oauth2.initTokenClient({ client_id: clientId, scope: SCOPE, callback: () => {} });
    }
    _client.callback = r => {
      if (!r || r.error || !r.access_token) return rej(gdErr('auth', r && (r.error_description || r.error)));
      if (window.google.accounts.oauth2.hasGrantedAllScopes && !window.google.accounts.oauth2.hasGrantedAllScopes(r, SCOPE)) return rej(gdErr('scope'));
      _tok = { access: r.access_token, exp: Date.now() + (parseInt(r.expires_in, 10) || 3600) * 1000 };
      res(_tok.access);
    };
    _client.error_callback = e => rej(gdErr(e && e.type === 'popup_closed' ? 'cancel' : 'auth', e && e.type));
    _client.requestAccessToken({ prompt: '' });
  }));
}

export function gdSignOut() {
  const t = _tok && _tok.access; _tok = null;
  try { if (t && window.google && window.google.accounts) window.google.accounts.oauth2.revoke(t, () => {}); } catch (e) { /* без мрежа — няма значение */ }
}

function call(token, url, opt) {
  opt = opt || {};
  const h = Object.assign({ Authorization: 'Bearer ' + token }, opt.headers || {});
  return fetch(url, Object.assign({}, opt, { headers: h })).catch(() => { throw gdErr('offline'); }).then(r => {
    if (r.status === 401) { _tok = null; throw gdErr('auth', '401'); }
    if (!r.ok) return r.text().then(t => { throw gdErr('http', r.status + ' ' + String(t).slice(0, 200)); });
    return r;
  });
}

function find(token, name) {
  const q = encodeURIComponent("name='" + name + "' and trashed=false");
  return call(token, API + '?spaces=appDataFolder&q=' + q + '&orderBy=modifiedTime desc&fields=files(id,name,modifiedTime,size,appProperties)')
    .then(r => r.json()).then(j => (j.files && j.files[0]) || null);
}

// Метаданните на главния файл (без да се тегли съдържанието).
export function gdStat(token) { return find(token, GD_FILE); }

export function gdDownload(token, id) {
  return call(token, API + '/' + encodeURIComponent(id) + '?alt=media').then(r => r.text());
}

// Пази предишната версия: старото „предишно“ се трие, текущото се копира като „предишно“.
function keepPrevious(token, cur) {
  if (!cur) return Promise.resolve();
  return find(token, GD_PREV).then(p => p ? call(token, API + '/' + p.id, { method: 'DELETE' }) : null)
    .then(() => call(token, API + '/' + cur.id + '/copy?fields=id', {
      method: 'POST', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name: GD_PREV, parents: ['appDataFolder'], appProperties: cur.appProperties || {} }),
    }));
}

// Качва съдържанието (низ) като главния файл. Resumable, защото архивът с
// снимките лесно минава 5 MB — границата на простото качване.
export function gdUpload(token, text, appProperties, cur) {
  return keepPrevious(token, cur).then(() => {
    const meta = cur ? { appProperties } : { name: GD_FILE, parents: ['appDataFolder'], appProperties };
    const url = cur ? UPLOAD + '/' + encodeURIComponent(cur.id) + '?uploadType=resumable' : UPLOAD + '?uploadType=resumable';
    return call(token, url, {
      method: cur ? 'PATCH' : 'POST',
      headers: { 'Content-Type': 'application/json; charset=UTF-8', 'X-Upload-Content-Type': 'application/json' },
      body: JSON.stringify(meta),
    });
  }).then(r => {
    const loc = r.headers.get('Location');
    if (!loc) throw gdErr('http', 'no upload location');
    return call(token, loc, { method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: new Blob([text], { type: 'application/json' }) });
  }).then(r => r.json());
}
