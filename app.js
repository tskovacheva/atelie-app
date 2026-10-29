// Глина · app.js — входна точка на ES модулите (v1.29.0).
//
// Модуларизацията е постепенна (виж ROADMAP, фаза 1а): новият код се ражда като
// модул, старият се изнася, когато се пипне. Докато класическият код в index.html
// още вика тези функции по име, мостът ги слага на window. Мостът изчезва модул
// по модул, когато и извикващият код стане модул.
//
// Модулите се изпълняват след разбора на страницата. Стартът в index.html чака
// сигнала по-долу, преди да зареди данните; ако той не дойде (липсващ файл),
// приложението казва това и не пипа нищо.
import * as merge from './core/merge.js';
import * as shrink from './calc/shrink.js';
import * as profile from './domain/profile.js';
import * as units from './domain/units.js'; // v1.31.0
import * as traits from './domain/traits.js'; // v1.31.1
import * as kiln from './domain/kiln.js'; // v1.32.0
import * as kilnplan from './domain/kilnplan.js'; // v1.33.0

const bridge = Object.assign({}, merge, shrink, profile, units, traits, kiln);
Object.keys(bridge).forEach(k => { window[k] = bridge[k]; });
// v1.33.0: геометрията на пещта е с кратки имена (num, check, stack…), затова
// влиза в моста като едно пространство, не поотделно.
window.KilnPlan = Object.freeze(Object.assign({}, kilnplan));

// v1.32.1: версията на модулите — index.html я сравнява със своята (APP_VERSION).
// Сменя се заедно с APP_VERSION и CACHE_NAME (tests/versions.test.js).
window.__glinaModulesVersion = 'v1.33.2';
window.__glinaModulesBridged = true;
if (typeof window.__glinaModulesReady === 'function') window.__glinaModulesReady();
