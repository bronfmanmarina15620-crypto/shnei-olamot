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

  function picture(id) {
    const key = (id || "").split("-")[0];
    const pics = {
      sis: '<svg viewBox="0 0 320 132" aria-hidden="true"><rect width="320" height="132" fill="#e7f4ea"/><rect x="46" y="58" width="70" height="46" rx="8" fill="#f4d7b0"/><rect x="196" y="50" width="78" height="54" rx="8" fill="#f7c9c4"/><circle cx="118" cy="48" r="16" fill="#f2c7a5"/><circle cx="210" cy="42" r="16" fill="#f2c7a5"/><path d="M92 78h40M188 74h44" stroke="#d7a48a" stroke-width="4"/></svg>',
      fr: '<svg viewBox="0 0 320 132" aria-hidden="true"><rect width="320" height="132" fill="#e7f3fb"/><circle cx="118" cy="58" r="18" fill="#f2c7a5"/><circle cx="168" cy="54" r="18" fill="#f6d3b0"/><circle cx="214" cy="60" r="18" fill="#f2c7a5"/><path d="M70 108c18-28 78-28 96 0M150 108c16-26 70-26 86 0" fill="#cfe6c8"/></svg>',
      sc: '<svg viewBox="0 0 320 132" aria-hidden="true"><rect width="320" height="132" fill="#eef4fb"/><rect x="70" y="28" width="180" height="78" rx="8" fill="#f7f1df"/><path d="M86 48h92M86 64h70" stroke="#c9b89a" stroke-width="4"/><circle cx="230" cy="52" r="10" fill="#f2c7a5"/></svg>',
      pop: '<svg viewBox="0 0 320 132" aria-hidden="true"><rect width="320" height="132" fill="#eef6f4"/><rect x="54" y="62" width="150" height="16" rx="8" fill="#d7e8c8"/><circle cx="84" cy="48" r="12" fill="#f2c7a5"/><circle cx="118" cy="46" r="12" fill="#f6d3b0"/><circle cx="152" cy="48" r="12" fill="#f2c7a5"/><circle cx="246" cy="70" r="14" fill="#f2c7a5"/></svg>',
      bg: '<svg viewBox="0 0 320 132" aria-hidden="true"><rect width="320" height="132" fill="#e7f6ea"/><circle cx="168" cy="62" r="22" fill="#f3f7f2" stroke="#7eae78" stroke-width="4"/><path d="M40 108h240" stroke="#b7d7a4" stroke-width="6"/></svg>',
      pl: '<svg viewBox="0 0 320 132" aria-hidden="true"><rect width="320" height="132" fill="#eaf6ea"/><circle cx="150" cy="58" r="20" fill="#f4d36a"/><path d="M70 104c30-36 90-36 120 0" fill="#d5ecc8"/></svg>',
      no: '<svg viewBox="0 0 320 132" aria-hidden="true"><rect width="320" height="132" fill="#f7f1ea"/><circle cx="150" cy="58" r="28" fill="none" stroke="#d46a7e" stroke-width="6"/><path d="M132 76l36-36" stroke="#d46a7e" stroke-width="6"/></svg>',
      out: '<svg viewBox="0 0 320 132" aria-hidden="true"><rect width="320" height="132" fill="#e7f2fb"/><rect x="48" y="58" width="120" height="40" rx="10" fill="#f4d7a8"/><circle cx="78" cy="104" r="8" fill="#8aa0ae"/><circle cx="142" cy="104" r="8" fill="#8aa0ae"/><circle cx="230" cy="62" r="16" fill="#f2c7a5"/></svg>',
      in: '<svg viewBox="0 0 320 132" aria-hidden="true"><rect width="320" height="132" fill="#f4f0fb"/><circle cx="160" cy="62" r="26" fill="#f6d3e0"/><path d="M148 66c4 6 20 6 24 0" stroke="#d46a7e" stroke-width="3" fill="none"/></svg>',
      ph: '<svg viewBox="0 0 320 132" aria-hidden="true"><rect width="320" height="132" fill="#eef3f8"/><rect x="132" y="28" width="56" height="84" rx="10" fill="#f7f7f4" stroke="#c5d0d8" stroke-width="3"/><rect x="142" y="42" width="36" height="28" rx="4" fill="#f6d3d8"/></svg>'
    };
    return pics[key] || pics.fr;
  }
  function art() {
    return '<div class="art">' + picture(scene && scene.id) + '</div>';
  }
  function sceneScreen() {
    const lead = hall === "hot"
      ? "דמייני שזה קורה עכשיו. אין תשובה נכונה."
      : "דמייני שזה קורה עכשיו. את תגידי מה לעשות, לא המשחק.";
    el(
      '<div class="panel">' +
      art() +
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
    const ask = "קודם, מה את רוצה שיקרה בסוף הסיפור הזה?";
    el(
      '<div class="panel">' +
      art() +
      '<p class="scene">' + escapeHtml(scene.text) + '</p>' +
      '<label for="want">' + ask + '</label>' +
      '<textarea id="want" maxlength="180"></textarea>' +
      '<p class="tiny">כתבי מה שאת רוצה. לא משפט מוכן.</p>' +
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
      art() +
      '<p class="ask">2. מה הגוף רוצה לעשות ברגע הזה?</p>' +
      '<p class="tiny">אפשר לבחור כמה.</p>' +
      '<div class="chips" id="chips"></div>' +
      '<label for="body">או עוד משהו במילים שלך</label>' +
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
      b.onclick = function () { b.classList.toggle("on"); };
      box.appendChild(b);
    });
    document.getElementById("next").onclick = function () {
      const picked = [];
      document.querySelectorAll(".chip.on").forEach(function (c) { picked.push(c.textContent); });
      const extra = val("body");
      if (extra) picked.push(extra);
      body = picked.join(" ו");
      if (!body) return;
      sayScreen();
    };
  }
  function sayScreen() {
    const ask = scene.hint || "מה תגידי עכשיו?";
    let hintBtn = "";
    if (hall === "voice") {
      hintBtn = '<button class="quiet" id="hint">נתקעתי</button>';
    }
    el(
      '<div class="panel">' +
      art() +
      '<p class="scene">' + escapeHtml(scene.text) + '</p>' +
      '<label for="say">' + ask + '</label>' +
      '<p class="tiny">כתבי כאן את המילים שיוצאות מהפה.</p>' +
      '<textarea id="say" maxlength="180"></textarea>' +
      '<p class="tiny" id="hintbox"></p>' +
      '<div class="row">' +
      '<button class="primary" id="next">זה מה שאני אומרת</button>' +
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
