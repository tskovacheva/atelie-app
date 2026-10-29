// Глина · calc/shrink.js — свиване и водопоглъщане от тест на маса
// v1.29.0: изнесено от index.html без промяна на логиката. Чисти функции — без DOM
// и без глобално състояние; тестват се директно (tests/unit.test.js).
// Класическият код ги вижда през моста в app.js (window.<име>).

export function _shrinkPcts(b){
  if(!b)return null;
  var mk=b.shrMarked,dry=b.shrDry,fir=b.shrFired,r={};
  if(mk>0&&dry!=null)r.wetDry=(mk-dry)/mk*100;
  if(dry>0&&fir!=null)r.dryFired=(dry-fir)/dry*100;
  if(mk>0&&fir!=null)r.total=(mk-fir)/mk*100;
  return Object.keys(r).length?r:null;
}
export function _poroPct(b){
  if(!b||!(b.poroDry>0)||b.poroWet==null)return null;
  return (b.poroWet-b.poroDry)/b.poroDry*100;
}
