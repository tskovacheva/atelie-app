// Глина · domain/profile.js — програма на изпичане: сегменти, пик, времетраене
// v1.29.0: изнесено от index.html без промяна на логиката. Чисти функции — без DOM
// и без глобално състояние; тестват се директно (tests/unit.test.js).
// Класическият код ги вижда през моста в app.js (window.<име>).

export function _fpRamps(fp){
  if(!fp)return [];
  if(Array.isArray(fp.ramps))return fp.ramps;
  // Legacy → array
  var out=[];
  if(fp.ramp1Rate!=null||fp.ramp1To!=null){
    out.push({rate:_numOrNull(fp.ramp1Rate),to:_numOrNull(fp.ramp1To),hold:null});
  }
  if(fp.ramp2Rate!=null||fp.ramp2To!=null){
    out.push({rate:_numOrNull(fp.ramp2Rate),to:_numOrNull(fp.ramp2To),hold:_numOrNull(fp.holdMin)});
  } else if(out.length&&fp.holdMin!=null){
    out[out.length-1].hold=_numOrNull(fp.holdMin);
  }
  return out;
}
export function _numOrNull(v){if(v==null||v==='')return null;var n=parseFloat(v);return isNaN(n)?null:n;}

// Peak = the highest 'to' across segments.
export function _fpPeak(fp){
  var r=_fpRamps(fp),peak=null;
  r.forEach(function(s){if(s.to!=null&&(peak==null||s.to>peak))peak=s.to;});
  return peak;
}
// Total time (minutes) = sum of each ramp's climb time + its hold.
// Climb time for a segment = |to - from| / rate × 60. 'from' is the previous
// segment's 'to' (or 20°C ambient for the first). Segments without a rate can't
// contribute a climb time — the total is then marked approximate.
export function _fpDuration(fp){
  var r=_fpRamps(fp);
  if(!r.length)return null;
  var mins=0, from=20, complete=true;
  r.forEach(function(s){
    if(s.to!=null&&s.rate!=null&&s.rate>0){
      mins+=Math.abs(s.to-from)/s.rate*60;
      from=s.to;
    } else if(s.to!=null){
      from=s.to; complete=false; // known target, unknown rate
    } else complete=false;
    if(s.hold!=null)mins+=s.hold;
  });
  return {minutes:Math.round(mins),complete:complete};
}
export function _fmtDuration(mins){
  if(mins==null)return '';
  var h=Math.floor(mins/60), m=Math.round(mins%60);
  if(h&&m)return h+' ч '+m+' мин';
  if(h)return h+' ч';
  return m+' мин';
}
