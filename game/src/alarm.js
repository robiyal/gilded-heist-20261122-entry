// GILDED — the alarm meter: the game's heartbeat.
// Detection raises it, silence lowers it. At 100 the museum goes loud: every
// guard chases, and the thief gets a short grace window to break away before
// a touch means caught.
import { TUNING, clamp } from './config.js';

export function makeAlarm() {
  const alarm = {
    value: 0,
    state: 'calm', // calm | alert | alarm
    graceT: 0,
    noSightT: 0,
    lastReason: '',
  };
  // Guards and cameras raise the alarm through this method.
  alarm.raise = function (amount, reason) {
    raiseAlarm(alarm, amount, reason);
  };
  return alarm;
}

export function raiseAlarm(alarm, amount, reason) {
  if (amount <= 0) return;
  alarm.value = clamp(alarm.value + amount, 0, 100);
  if (reason) alarm.lastReason = reason;
}

export function updateAlarm(alarm, dt, anySeesThief, sfx) {
  if (anySeesThief) {
    alarm.noSightT = 0;
  } else {
    alarm.noSightT += dt;
    alarm.value = clamp(alarm.value - TUNING.alarmDecay * dt, 0, 100);
  }
  if (alarm.state !== 'alarm' && alarm.value >= TUNING.alarmChaseAt) {
    alarm.state = 'alarm';
    alarm.graceT = TUNING.alarmGraceSeconds;
    alarm.noSightT = 0;
    sfx.siren();
  }
  if (alarm.state === 'alarm') {
    if (alarm.graceT > 0) alarm.graceT -= dt;
    // Break away: unseen for four seconds and the alarm stands down to 60.
    if (alarm.noSightT >= TUNING.breakawaySeconds) {
      alarm.state = 'alert';
      alarm.value = 60;
      alarm.noSightT = 0;
    }
  } else if (alarm.value >= 55) {
    alarm.state = 'alert';
  } else if (alarm.value < 20) {
    alarm.state = 'calm';
  }
}

export function alarmColor(alarm) {
  if (alarm.value >= 75) return '#e5484d';
  if (alarm.value >= 40) return '#f2a93b';
  return '#37c978';
}

export function alarmLabel(alarm) {
  if (alarm.state === 'alarm') return 'ALARM!';
  if (alarm.state === 'alert') return 'ALERT';
  return 'CALM';
}
