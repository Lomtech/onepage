/* ────────────────────────────────────────────────────────
   Einwilligungs-Banner für die Besucherstatistik.

   Ohne "accepted" in analytics_consent bleibt app.js im
   Dummy-Zweig und es wird nichts erfasst. Der Banner ist
   damit die einzige Stelle, die die Statistik scharf schaltet.
   ──────────────────────────────────────────────────────── */

(function () {
  "use strict";

  var KEY = "analytics_consent";

  function gespeichert() {
    try {
      return localStorage.getItem(KEY);
    } catch (e) {
      // Private-Mode o. Ä.: kein Speicher, keine Einwilligung, kein Banner
      return "declined";
    }
  }

  function merken(wert) {
    try {
      localStorage.setItem(KEY, wert);
    } catch (e) {
      /* nicht speicherbar - dann greift beim nächsten Aufruf erneut der Default */
    }
  }

  function aufraeumen() {
    try {
      localStorage.removeItem("linkClicks");
      sessionStorage.removeItem("analytics_session_id");
    } catch (e) {
      /* egal */
    }
  }

  function bauen() {
    var box = document.createElement("div");
    box.className = "cc-banner";
    box.setAttribute("role", "dialog");
    box.setAttribute("aria-modal", "false");
    box.setAttribute("aria-labelledby", "cc-titel");

    var text = document.createElement("p");
    text.className = "cc-text";
    text.innerHTML =
      '<strong id="cc-titel">Darf ich mitzählen?</strong>' +
      "Ich würde gern sehen, welche Inhalte hier gelesen werden. Dafür erfasse ich " +
      "Seitenaufrufe und Link-Klicks über eine zufällige Sitzungskennung — ohne Cookies, " +
      "ohne IP-Adresse und ohne Weitergabe an Dritte. " +
      '<a href="datenschutz.html">Mehr dazu</a>.';

    var actions = document.createElement("div");
    actions.className = "cc-actions";

    var nein = document.createElement("button");
    nein.type = "button";
    nein.className = "cc-btn cc-decline";
    nein.textContent = "Nein danke";
    nein.addEventListener("click", function () {
      merken("declined");
      aufraeumen();
      schliessen(box);
    });

    var ja = document.createElement("button");
    ja.type = "button";
    ja.className = "cc-btn cc-accept";
    ja.textContent = "Einverstanden";
    ja.addEventListener("click", function () {
      merken("accepted");
      schliessen(box);
      // app.js liest die Einwilligung einmalig beim DOMContentLoaded aus.
      // Ohne Neuladen bliebe die Statistik bis zum nächsten Aufruf inaktiv.
      window.location.reload();
    });

    actions.appendChild(nein);
    actions.appendChild(ja);
    box.appendChild(text);
    box.appendChild(actions);

    document.body.appendChild(box);
    ja.focus();
  }

  function schliessen(box) {
    if (box && box.parentNode) box.parentNode.removeChild(box);
  }

  function start() {
    if (gespeichert() !== null) return; // Entscheidung liegt vor
    bauen();
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", start);
  } else {
    start();
  }
})();
