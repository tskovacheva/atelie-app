// Глина · core/merge.js — запис със сливане
// v1.29.0: нов код, роден като модул. Чисти функции — без DOM и без глобално
// състояние; тестват се директно (tests/unit.test.js).
// Класическият код ги вижда през моста в app.js (window.<име>).

// v1.29.0: ЗАПИС СЪС СЛИВАНЕ. Досега всяка save*() сглобяваше записа наново от
// полетата на формуляра и го слагаше на мястото на стария. Поле, което живее в
// записа, но формулярът не го показва, изчезваше при първата редакция — така
// v1.24.1 губеше членството в серия, и така щяха да се губят позицията в пещта и
// кодът на изделието. Сега:
//   • полетата, които формулярът притежава (списъкът по-долу), се вземат от
//     формуляра — включително изчистването: притежавано поле, което формулярът
//     не върне, се маха, точно както досега;
//   • всичко останало от стария запис се запазва непокътнато;
//   • същото правило важи едно ниво навътре (data, body, raw, chem, blend).
// Списъкът е обединението на всичко, което съответната save*() може да напише.
// Ново поле във формуляр → добавя се тук, иначе не може да бъде изчистено.
export const _EDIT_OWNS={
  // v1.31.1: size, startMass, wall, base, categories — основните характеристики.
  piece:['id','name','photos','type','clay','technique','recipe','material','bisqueTemp','glazeTemp','date','stage','notes','dimensions','weight','events','updatedAt','size','startMass','wall','base','categories'],
  series:['id','name','photos','type','clay','technique','recipe','material','bisqueTemp','glazeTemp','date','stage','notes','dimensions','weight','events','updatedAt','count','size','startMass','wall','base','categories'],
  recipe:['id','name','updatedAt','temp','notes','glazeType','cone','recommendedFiringProfileId','fav','photo','ingredients'],
  test:['id','kind','updatedAt','recipeId','materialId','firingProfileId','clay','date','temp','hold','flow','surf','def','rat','notes','glazeLayers','photos','firingRunId','bodyRef','body'],
  testBody:['plasticity','plasticityNote','shrMarked','shrDry','shrFired','poroDry','poroWet','color','deformation','sound','limePopping','limeNote','longTermDate','longTerm'],
  material:['id','name','updatedAt','cat','wishlist','formula','brand','stock','alertAt','notes','photo','fireBisqueTemp','fireGlazeTemp','grog','shrink','color','gfire','gcolor','surfaceType','foodsafe','chem','cost','costUnit','raw'],
  materialChem:['sio2','al2o3','fe2o3','cao','k2o','na2o','mgo','tio2'],
  materialRaw:['location','coords','date','weight','geonotes'],
  mass:['id','name','cat','blend','notes','photo','updatedAt'],
  massBlend:['components','mixDate','readyDate'],
  // Старите ramp1/ramp2/holdMin са притежавани: редакцията ги пренася в ramps
  // и ги маха (така е от v1.16.0).
  profile:['id','name','updatedAt','type','ramps','notes','ramp1Rate','ramp1To','ramp2Rate','ramp2To','holdMin'],
  run:['id','name','date','method','atmosphere','purpose','firingProfileId','notes','photos','updatedAt','peakTemp','holdMin','cones','fuel','additives','duration'],
  event:['id','type','date','note','photos','data'],
  eventData:['stageValue','technique','materialIds','application','coverage','layers','appliedAtStage','atStage','firingRunId','method','atmosphere','firingPurpose','temp','duration','profileId','wrapping','details','result'],
  rawEvent:['id','type','date','note','photos','data'],
  rawEventData:['weight','vinegar','washNum','ratio','ppmBefore','ppmAfter','settleHours','waterTemp','mesh','weightBefore','weightAfter','observations','method','duration','consistency']
};
// old — записът преди редакцията; fresh — сглобеното от формуляра; owned —
// притежаваните полета; nested — {поле: притежавани под-полета}.
export function _mergeEdit(old,fresh,owned,nested){
  if(!old||typeof old!=='object')return fresh;
  var out={};
  Object.keys(old).forEach(function(k){if(owned.indexOf(k)<0)out[k]=old[k];});
  Object.keys(fresh).forEach(function(k){out[k]=fresh[k];});
  if(nested)Object.keys(nested).forEach(function(k){
    var o=old[k],f=fresh[k];
    if(f&&typeof f==='object'&&!Array.isArray(f)&&o&&typeof o==='object'&&!Array.isArray(o)){
      out[k]=_mergeEdit(o,f,nested[k]);
    }
  });
  return out;
}
