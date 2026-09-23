/* =========================================================
   AUTO LOGOUT KARENA TIDAK ADA AKTIVITAS
========================================================= */

/*
 * 2 JAM
 */
const AUTO_LOGOUT_MS =
  2 * 60 * 60 * 1000;

const ACTIVITY_CHECK_MS =
  30 * 1000;

const LAST_ACTIVITY_KEY =
  "rt_last_activity";

let activityCheckTimer = null;
let activityWriteTimer = null;


function updateLastActivity() {

  const now =
    Date.now();

  sessionStorage.setItem(
    LAST_ACTIVITY_KEY,
    String(now)
  );
}


function getLastActivity() {

  const saved =
    Number(
      sessionStorage.getItem(
        LAST_ACTIVITY_KEY
      )
    );

  if (
    Number.isFinite(saved) &&
    saved > 0
  ) {
    return saved;
  }

  updateLastActivity();

  return Date.now();
}


function registerActivity() {

  if (!token) {
    return;
  }

  if (activityWriteTimer) {
    return;
  }

  updateLastActivity();

  activityWriteTimer =
    setTimeout(() => {

      activityWriteTimer = null;

    }, ACTIVITY_CHECK_MS);
}


function checkAutoLogout() {

  if (!token) {
    return;
  }

  const lastActivity =
    getLastActivity();

  const inactiveFor =
    Date.now() - lastActivity;

  if (
    inactiveFor >=
    AUTO_LOGOUT_MS
  ) {

    alert(
      "Sesi login berakhir karena tidak ada aktivitas selama 2 jam."
    );

    logout();
  }
}


function setupAutoLogout() {

  const activityEvents = [
    "click",
    "keydown",
    "mousedown",
    "touchstart",
    "scroll"
  ];

  activityEvents.forEach(
    eventName => {

      document.addEventListener(
        eventName,
        registerActivity,
        {
          passive: true
        }
      );

    }
  );


  document.addEventListener(
    "mousemove",
    registerActivity,
    {
      passive: true
    }
  );


  activityCheckTimer =
    setInterval(
      checkAutoLogout,
      ACTIVITY_CHECK_MS
    );


  if (token) {
    updateLastActivity();
  }
}
