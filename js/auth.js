/* =========================================================
   AUTHENTICATION
========================================================= */


/* =========================================================
   LOGIN
========================================================= */

async function login() {

  const emailValue =
    email.value.trim();

  const passwordValue =
    password.value;

  loginMsg.textContent = "";

  if (!emailValue || !passwordValue) {

    loginMsg.textContent =
      "Email dan password wajib diisi.";

    return;
  }


  try {

    const result =
      await api(
        "/api/login",
        {
          method: "POST",

          headers: {
            "Content-Type":
              "application/json"
          },

          body: JSON.stringify({
            email: emailValue,
            password: passwordValue
          })
        }
      );


    if (!result.token) {

      throw new Error(
        result.message ||
        "Login gagal."
      );
    }


    token =
      result.token;


    sessionStorage.setItem(
      "rt_token",
      token
    );


    updateLastActivity();

    show();

    setupAutoLogout();

    await load();

  } catch (err) {

    loginMsg.textContent =
      err.message ||
      "Login gagal.";

  }

}


/* =========================================================
   LOGOUT
========================================================= */

function logout() {

  if (activityCheckTimer) {

    clearInterval(
      activityCheckTimer
    );

    activityCheckTimer = null;
  }


  if (activityWriteTimer) {

    clearTimeout(
      activityWriteTimer
    );

    activityWriteTimer = null;
  }


  sessionStorage.clear();

  location.reload();
}


/* =========================================================
   SHOW LOGIN / APP VIEW
========================================================= */

function show() {

  if (token) {

    loginView.style.display =
      "none";

    appView.style.display =
      "block";

  } else {

    loginView.style.display =
      "flex";

    appView.style.display =
      "none";
  }

}
