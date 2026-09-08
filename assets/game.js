(function () {
  const hall = document.body.dataset.hall;
  const girl = document.body.dataset.girl;
  const name = document.body.dataset.name;
  const keyVisits = "olamot." + girl + ".visits";
  const keyPending = "olamot." + girl + ".pending";
  const app = document.getElementById("app");
  const scenes = (window.OLAMOT_SCENES || []).filter(function (s) {
    return s.halls.indexOf(hall) !== -1;
  });
  let used = [];
  let scene = null;
  let want = "";
  let body = "";
  let sentence = "";
  let why = "";
  let hinted = false;
  let unusual = false;

  const odd = /הרביצ|דחפ|מפחד|פחד|כואב|פגע|מכה|חרם|מציק|לא בטוח|להרוג|למות|שונא|בוכה|אלימ/;

  function load(key, fallback) {
    try { return JSON.parse(localStorage.getItem(key) || ""); } catch (e) { return fallback; }
  }
  function save(key, value) {
    localStorage.setItem(key, JSON.stringify(value));
  }
  function pickScene() {
    const left = scenes.filter(function (s) { return used.indexOf(s.id) === -1; });
    const pool = left.length ? left : scenes;
    if (!left.length) used = [];
    scene = pool[Math.floor(Math.random() * pool.length)];
    used.push(scene.id);
    want = "";
    body = "";
    sentence = "";
    why = "";
    hinted = false;
    unusual = false;
  }
  function el(html) {
    app.innerHTML = html;
  }
  function val(id) {
    const node = document.getElementById(id);
    return node ? node.value.trim() : "";
  }
  function checkOdd(text) {
    return odd.test(text || "");
  }

  function markScreen(pending) {
    el(
      '<div class="panel">' +
      '<h1>' + name + '</h1>' +
      '<p class="sub">בפעם הקודמת בחרת משפט לנסות.</p>' +
      '<div class="note">' + escapeHtml(pending.sentence) + '</div>' +
      '<div class="row">' +
      '<button class="primary" id="yes">ניסיתי</button>' +
      '<button class="ghost" id="no">עוד לא</button>' +
      '</div></div>'
    );
    document.getElementById("yes").onclick = function () { closePending(pending, "ניסיתי"); };
    document.getElementById("no").onclick = function () { closePending(pending, "עוד לא"); };
  }
  function closePending(pending, mark) {
    const visits = load(keyVisits, []);
    visits.unshift({
      at: new Date().toISOString(),
      girl: name,
      scene: pending.scene,
      want: pending.want,
      body: pending.body,
      sentence: pending.sentence,
      why: pending.why || "",
      unusual: !!pending.unusual,
      mark: mark
    });
    save(keyVisits, visits.slice(0, 80));
    localStorage.removeItem(keyPending);
    startRound();
  }
  function introScreen() {
    const title = hall === "hot" ? "הרגע החם" : "הקול שלי";
    const body = hall === "hot"
      ? "לפעמים קורה משהו, והגוף נהיה חם. רוצים לצעוק, לדחוף, או לבכות.<br><br>נעשה שלושה דברים, לאט.<br>1. מה את רוצה.<br>2. מה הגוף רוצה.<br>3. מה תגידי במקום."
      : "לפעמים קשה לדבר, ומישהי אחרת מדברת במקומך.<br><br>כאן את אומרת בעצמך.<br>1. מה את רוצה.<br>2. משפט אחד מהפה שלך.";
    el(
      '<div class="panel">' +
      '<p class="sub">' + title + '</p>' +
      '<h1>היי ' + name + '</h1>' +
      '<p class="scene">' + body + '</p>' +
      '<div class="row"><button class="primary" id="go">בואי נתחיל</button></div>' +
      '</div>'
    );
    document.getElementById("go").onclick = function () { sceneScreen(); };
  }
  function sceneScreen() {
    const lead = hall === "hot"
      ? "דמייני שזה קורה עכשיו. אין תשובה נכונה."
      : "דמייני שזה קורה עכשיו. את תגידי מה לעשות, לא המשחק.";
    el(
      '<div class="panel">' +
      '<p class="sub">' + (hall === "hot" ? "הרגע החם" : "הקול שלי") + '</p>' +
      '<p class="tiny">' + lead + '</p>' +
      '<p class="scene">' + escapeHtml(scene.text) + '</p>' +
      '<div class="row">' +
      '<button class="primary" id="go">בואי נחשוב</button>' +
      '<button class="quiet" id="skip">סיפור אחר</button>' +
      '</div></div>'
    );
    document.getElementById("go").onclick = function () { wantScreen(); };
    document.getElementById("skip").onclick = function () { pickScene(); sceneScreen(); };
  }
  function wantScreen() {
    const ask = hall === "hot" ? "1. בסיפור הזה, מה את רוצה שיקרה?" : "1. בסיפור הזה, מה את רוצה?";
    el(
      '<div class="panel">' +
      '<p class="scene">' + escapeHtml(scene.text) + '</p>' +
      '<label for="want">' + ask + '</label>' +
      '<textarea id="want" maxlength="180"></textarea>' +
      '<p class="tiny">רק על מה שכתוב למעלה. אין דוגמה ממקום אחר.</p>' +
      '<div class="row"><button class="primary" id="next">הלאה</button></div>' +
      '</div>'
    );
    document.getElementById("next").onclick = function () {
      want = val("want");
      if (!want) return;
      if (hall === "hot") bodyScreen();
      else sayScreen();
    };
  }
  function bodyScreen() {
    el(
      '<div class="panel">' +
      '<p class="ask">2. מה הגוף רוצה לעשות ברגע הזה?</p>' +
      '<p class="tiny">אפשר ללחוץ מילה, או לכתוב.</p>' +
      '<div class="chips" id="chips"></div>' +
      '<label for="body">או במילים שלך</label>' +
      '<input id="body" type="text" maxlength="120" />' +
      '<div class="row"><button class="primary" id="next">הלאה</button></div>' +
      '</div>'
    );
    const chips = ["לצעוק", "לדחוף", "לבכות", "לקפוץ", "לשתוק"];
    const box = document.getElementById("chips");
    chips.forEach(function (word) {
      const b = document.createElement("button");
      b.className = "chip";
      b.type = "button";
      b.textContent = word;
      b.onclick = function () {
        document.querySelectorAll(".chip").forEach(function (c) { c.classList.remove("on"); });
        b.classList.add("on");
        document.getElementById("body").value = word;
      };
      box.appendChild(b);
    });
    document.getElementById("next").onclick = function () {
      body = val("body");
      if (!body) return;
      sayScreen();
    };
  }
  function sayScreen() {
    const ask = hall === "hot" ? "3. מה תגידי במקום לצעוק או לדחוף?" : "2. מה תגידי בעצמך?";
    let hintBtn = "";
    if (hall === "voice") {
      hintBtn = '<button class="quiet" id="hint">נתקעתי</button>';
    }
    el(
      '<div class="panel">' +
      '<p class="scene">' + escapeHtml(scene.text) + '</p>' +
      '<label for="say">' + ask + '</label>' +
      '<textarea id="say" maxlength="180"></textarea>' +
      '<p class="tiny" id="hintbox"></p>' +
      '<div class="row">' +
      '<button class="primary" id="next">זה המשפט שלי</button>' +
      hintBtn +
      '</div></div>'
    );
    const hint = document.getElementById("hint");
    if (hint) {
      hint.onclick = function () {
        if (hinted) return;
        hinted = true;
        document.getElementById("hintbox").textContent = scene.hint || "תגידי את זה במילים שלך.";
        hint.disabled = true;
      };
    }
    document.getElementById("next").onclick = function () {
      sentence = val("say");
      if (!sentence) return;
      unusual = checkOdd(want + " " + body + " " + sentence);
      if (unusual) whyScreen();
      else noteScreen();
    };
  }
  function whyScreen() {
    el(
      '<div class="panel">' +
      '<p class="ask">למה ענית ככה?</p>' +
      '<textarea id="why" maxlength="220"></textarea>' +
      '<div class="row"><button class="primary" id="next">הלאה</button></div>' +
      '</div>'
    );
    document.getElementById("next").onclick = function () {
      why = val("why");
      if (!why) return;
      noteScreen();
    };
  }
  function noteScreen() {
    el(
      '<div class="panel">' +
      '<p class="sub">היום אנסה את זה</p>' +
      '<div class="note">' + escapeHtml(sentence) + '</div>' +
      '<p class="tiny">בפעם הבאה שתפתחי, תסמני אם ניסית.</p>' +
      '<div class="row">' +
      '<button class="primary" id="more">עוד סיטואציה</button>' +
      '<button class="ghost" id="stop">מספיק להיום</button>' +
      '</div></div>'
    );
    save(keyPending, {
      scene: scene.text,
      want: want,
      body: body,
      sentence: sentence,
      why: why,
      unusual: unusual
    });
    document.getElementById("more").onclick = function () {
      pickScene();
      sceneScreen();
    };
    document.getElementById("stop").onclick = function () {
      el('<div class="panel"><h1>יפה</h1><p class="sub">המשפט נשאר אצלך. בפעם הבאה תסמני אם ניסית.</p></div>');
    };
  }
  function startRound() {
    pickScene();
    introScreen();
  }
  function escapeHtml(s) {
    return String(s).replace(/[&<>"]/g, function (c) {
      return ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" })[c];
    });
  }
  function boot() {
    const pending = load(keyPending, null);
    if (pending && pending.sentence) markScreen(pending);
    else startRound();
  }
  boot();
})();
