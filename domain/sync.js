// Глина · domain/sync.js — решенията на синхронизацията с Drive (v1.54.0).
//
// Синхронизацията е предаване между устройствата на един човек: „Изпрати“ качва
// цялото състояние, „Вземи“ го възстановява. Сливане няма — то тихо губи
// промени, а тя работи на едно устройство в даден момент. Затова тук се решава
// само едно: какво би се загубило и трябва ли да се попита. Чисти функции, без
// мрежа и без DOM — транспортът е в core/gdrive.js, интерфейсът в index.html.
//
// local  = { changes: брой записвания след последната синхронизация (-1 = не се знае),
//            total: брой записи }
// remote = null | { savedAt, device, total, appVersion }  (метаданните на файла в Drive)
// last   = { remoteSavedAt } — версията в Drive, която това устройство е изпратило или взело последно

const n = x => (typeof x === 'number' && isFinite(x) ? x : parseInt(x, 10) || 0);

// Брой промени след последната синхронизация; -1, когато не се знае.
function changesOf(local) {
  const c = local ? local.changes : null;
  return typeof c === 'number' && isFinite(c) ? (c < 0 ? -1 : c) : -1;
}

// Запис в Drive, който това устройство не е виждало.
function unseen(remote, last) {
  return !!(remote && remote.savedAt && remote.savedAt !== ((last && last.remoteSavedAt) || ''));
}

// Голям срив на броя записи: по-малко от половината, при поне 6 в по-пълното.
// Същото правило като при авто-архива (v1.27.1).
export function syncShrinks(from, to) {
  from = n(from); to = n(to);
  return from >= 6 && to < from * 0.5;
}

// „Изпрати“. Връща { warn: [...] } — празен списък значи „направо“.
//  remote-unseen — в Drive има версия от друго устройство, която тук не е взета; ще бъде заменена
//  shrink        — тук има много по-малко записи, отколкото в Drive
export function syncSendPlan(local, remote, last) {
  const warn = [];
  if (unseen(remote, last)) warn.push('remote-unseen');
  if (remote && syncShrinks(remote.total, local && local.total)) warn.push('shrink');
  return { warn };
}

// „Вземи“. Връща { stop?, warn: [...] }.
//  stop: 'none' — в Drive още няма данни; 'same' — вече е същата версия, нищо за взимане
//  local-unsent  — тук има промени, които не са изпратени; ще бъдат заменени
//  local-unknown — това устройство още не е синхронизирало; данните му ще бъдат заменени
//  shrink        — в Drive има много по-малко записи, отколкото тук
export function syncTakePlan(local, remote, last) {
  if (!remote || !remote.savedAt) return { stop: 'none', warn: [] };
  const lc = changesOf(local);
  if (!unseen(remote, last) && lc === 0) return { stop: 'same', warn: [] };
  const warn = [];
  if (lc > 0) warn.push('local-unsent');
  else if (lc < 0) warn.push('local-unknown');
  if (syncShrinks(local && local.total, remote.total)) warn.push('shrink');
  return { warn };
}

// Кратко състояние за раздела в Backup (без мрежа — само това, което устройството знае).
export function syncLocalState(local, last) {
  if (!last || !last.remoteSavedAt) return 'never';
  const lc = changesOf(local);
  return lc < 0 ? 'unknown' : lc > 0 ? 'unsent' : 'clean';
}

// Метаданни за файла в Drive (appProperties: само низове, до ~120 байта всеки).
export function syncMeta(o) {
  return {
    savedAt: String(o.savedAt || ''),
    device: String(o.device || '').slice(0, 40),
    total: String(n(o.total)),
    appVersion: String(o.appVersion || '').slice(0, 20),
  };
}
export function syncReadMeta(p) {
  if (!p || !p.savedAt) return null;
  return { savedAt: p.savedAt, device: p.device || '', total: n(p.total), appVersion: p.appVersion || '' };
}
