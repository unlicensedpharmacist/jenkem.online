(function () {
  "use strict";
  var $ = function (id) { return document.getElementById(id); };
  function esc(s) { var d = document.createElement("div"); d.textContent = s == null ? "" : String(s); return d.innerHTML; }
  function money(n) { return "$" + n.toFixed(2); }
  function store(k, v) { try { if (v === undefined) return JSON.parse(localStorage.getItem(k)); localStorage.setItem(k, JSON.stringify(v)); } catch (e) { return null; } }
  function ago(t) {
    var s = Math.max(1, Math.floor(Date.now() / 1000) - t);
    if (s < 60) return "just now";
    if (s < 3600) return Math.floor(s / 60) + "m ago";
    if (s < 86400) return Math.floor(s / 3600) + "h ago";
    if (s < 86400 * 30) return Math.floor(s / 86400) + "d ago";
    return new Date(t * 1000).toLocaleDateString();
  }

  /* ---------- catalogue ---------- */
  var PRODUCTS = [
    { id: 1, name: "No. 1, Eau de Rumeur", note: "The original. Allegedly. Nobody can confirm.", price: 99, liquid: "#a8b545", glass: "#d9cfe6", shape: "tall", base: 1204 },
    { id: 2, name: "Gas Station Édition", note: "Top notes of 2 a.m. and a buzzing light.", price: 42, liquid: "#d98b2b", glass: "#e6dccf", shape: "flask", base: 980 },
    { id: 3, name: "Zéro Sucre", note: "Same rumour, fewer calories.", price: 77.7, liquid: "#c9d3d8", glass: "#e3ecef", shape: "round", base: 905 },
    { id: 4, name: "Bougie Parfumée", note: "A candle that smells of nothing. We checked twice.", price: 64, liquid: "#efe3b8", glass: "#cdbfa1", shape: "candle", base: 760 },
    { id: 5, name: "Coffret Cadeau", note: "A gift box. It is empty. It is still a gift.", price: 249, liquid: "#8c6bb1", glass: "#e2d8ee", shape: "box", base: 655 },
    { id: 6, name: "Trophée", note: "For the shelf. Participation not required.", price: 120, liquid: "#c8a24a", glass: "#efe2bb", shape: "tall", base: 540 },
    { id: 7, name: "Petit Lot Artisanal", note: "Hand-rumoured in very small batches.", price: 185, liquid: "#6f7d3a", glass: "#d6dcc4", shape: "round", base: 410 },
    { id: 8, name: "Le CD-ROM", note: "1,000 free hours. The disc may be scratched.", price: 0, liquid: "#b9b4c9", glass: "#e9e6f2", shape: "disc", base: 330 }
  ];
  var REVIEWS = [
    ["xX_Dave_Xx", "Would rank again. Fast shipping, in that nothing shipped."],
    ["mom", "Please clean your room. Also why is my card saved on this site."],
    ["Anonymous", "The vibes are immaculate. The bag still won't check out."],
    ["guy_from_forums", "Came here from a link in 2009. Never left. Site got nicer."]
  ];

  function bottle(p, cls) {
    return '<div class="bottle ' + (cls || "") + ' shape-' + p.shape + '" style="--liquid:' + p.liquid + ';--glass:' + p.glass + '" aria-hidden="true">' +
      '<span class="cap"></span><span class="neck"></span><span class="body"><span class="fill"></span></span></div>';
  }

  $("products").innerHTML = PRODUCTS.map(function (p, i) {
    return '<article class="product' + (i === 0 ? " feature" : "") + '">' +
      '<div class="product-stage">' + bottle(p) + '</div>' +
      '<div class="product-info"><h3>' + esc(p.name) + '</h3><p>' + esc(p.note) + '</p>' +
      '<div class="product-buy"><span class="price">' + (p.price ? money(p.price) : "Free") + '</span>' +
      '<button class="pill ghost add" type="button" data-id="' + p.id + '">Add to bag</button></div></div></article>';
  }).join("");

  /* ---------- rankings (local votes only) ---------- */
  var votes = store("jo_votes") || {};
  var myVote = store("jo_myvotes") || {};
  function score(p) { return p.base + (votes[p.id] || 0); }
  function renderRanking(bumped) {
    var list = PRODUCTS.slice().sort(function (a, b) { return score(b) - score(a); });
    $("ranking").innerHTML = list.map(function (p, i) {
      return '<li class="rank-row' + (p.id === bumped ? " bumped" : "") + '">' +
        '<span class="rank-pos">' + (i + 1) + '</span>' + bottle(p, "mini") +
        '<span class="rank-name">' + esc(p.name) + '</span>' +
        '<span class="rank-score">' + score(p).toLocaleString() + '</span>' +
        '<button class="vote' + (myVote[p.id] ? " on" : "") + '" type="button" data-id="' + p.id + '" aria-pressed="' + !!myVote[p.id] + '">' +
        (myVote[p.id] ? "Voted" : "Vote up") + '</button></li>';
    }).join("");
  }
  renderRanking();
  $("ranking").addEventListener("click", function (e) {
    var b = e.target.closest(".vote"); if (!b) return;
    var id = Number(b.getAttribute("data-id"));
    if (myVote[id]) { delete myVote[id]; votes[id] = (votes[id] || 0) - 1; }
    else { myVote[id] = 1; votes[id] = (votes[id] || 0) + 1; }
    store("jo_votes", votes); store("jo_myvotes", myVote);
    renderRanking(id);
  });

  $("review-list").innerHTML = REVIEWS.map(function (r) {
    return '<figure class="review"><blockquote>' + esc(r[1]) + '</blockquote><figcaption>' + esc(r[0]) + '</figcaption></figure>';
  }).join("");

  /* ---------- toast ---------- */
  var toastTimer;
  function toast(msg) {
    var t = $("toast"); t.textContent = msg; t.classList.add("show");
    clearTimeout(toastTimer); toastTimer = setTimeout(function () { t.classList.remove("show"); }, 2600);
  }

  /* ---------- drawers ---------- */
  var openDrawer = null, lastFocus = null;
  function showDrawer(id) {
    if (openDrawer) hideDrawer();
    lastFocus = document.activeElement;
    openDrawer = $(id);
    openDrawer.classList.add("open"); openDrawer.setAttribute("aria-hidden", "false");
    $("scrim").hidden = false;
    requestAnimationFrame(function () { $("scrim").classList.add("on"); });
    var f = openDrawer.querySelector("input:not([hidden]), button"); if (f) f.focus();
  }
  function hideDrawer() {
    if (!openDrawer) return;
    openDrawer.classList.remove("open"); openDrawer.setAttribute("aria-hidden", "true");
    openDrawer = null;
    $("scrim").classList.remove("on");
    setTimeout(function () { if (!openDrawer) $("scrim").hidden = true; }, 250);
    if (lastFocus) lastFocus.focus();
  }
  $("scrim").addEventListener("click", hideDrawer);
  document.addEventListener("keydown", function (e) { if (e.key === "Escape") hideDrawer(); });
  [].forEach.call(document.querySelectorAll("[data-close]"), function (b) { b.addEventListener("click", hideDrawer); });

  /* ---------- bag ---------- */
  var bag = store("jo_bag") || {};
  var promo = false;
  function renderBag() {
    var ids = Object.keys(bag), n = 0, total = 0;
    $("bag-items").innerHTML = ids.length ? ids.map(function (id) {
      var p = PRODUCTS.filter(function (x) { return x.id === Number(id); })[0]; if (!p) return "";
      n += bag[id]; total += p.price * bag[id];
      return '<div class="bag-row">' + bottle(p, "mini") + '<div><b>' + esc(p.name) + '</b><span class="muted">' + money(p.price) + '</span></div>' +
        '<div class="qty"><button type="button" data-q="-1" data-id="' + id + '" aria-label="One fewer">&minus;</button><span>' + bag[id] + '</span>' +
        '<button type="button" data-q="1" data-id="' + id + '" aria-label="One more">+</button></div></div>';
    }).join("") : '<p class="empty">Your bag is empty. The collection is a short scroll up.</p>';
    if (promo) total *= 0.9;
    $("bag-count").textContent = n;
    $("bag-total").textContent = money(total);
    store("jo_bag", bag);
  }
  renderBag();
  $("products").addEventListener("click", function (e) {
    var b = e.target.closest(".add"); if (!b) return;
    var id = b.getAttribute("data-id");
    bag[id] = (bag[id] || 0) + 1; renderBag();
    toast("Added to bag. It weighs nothing.");
  });
  $("bag-items").addEventListener("click", function (e) {
    var b = e.target.closest("[data-q]"); if (!b) return;
    var id = b.getAttribute("data-id");
    bag[id] = (bag[id] || 0) + Number(b.getAttribute("data-q"));
    if (bag[id] <= 0) delete bag[id];
    renderBag();
  });
  $("bag-btn").addEventListener("click", function () { $("checkout-msg").textContent = ""; showDrawer("bag"); });
  $("promo-form").addEventListener("submit", function (e) {
    e.preventDefault();
    if ($("promo").value.trim().toLowerCase() === "sniffin") { promo = true; $("promo-msg").textContent = "Sniffin applied: 10% off nothing."; }
    else $("promo-msg").textContent = "That code doesn't exist. Try Sniffin.";
    renderBag();
  });
  var NOPE = [
    "Checkout declined: the product does not exist.",
    "Our payment processor is a rumour too.",
    "We'd love your money. We just have nothing to sell for it.",
    "Your order has been placed into the void."
  ];
  $("checkout").addEventListener("click", function () {
    $("checkout-msg").textContent = Object.keys(bag).length ? NOPE[Math.floor(Math.random() * NOPE.length)] : "Add something first. It won't help.";
  });

  /* ---------- server ---------- */
  function api(path, body) {
    var opts = { credentials: "same-origin", headers: { "content-type": "application/json" } };
    if (body) { opts.method = "POST"; opts.body = JSON.stringify(body); }
    return fetch("/api/" + path, opts)
      .catch(function () { throw new Error("Can't reach the server. Check your connection and try again."); })
      .then(function (r) {
        return r.json().then(function (d) { if (!r.ok) throw new Error(d.error || "Server error."); return d; },
          function () { throw new Error("The server isn't answering right now."); });
      });
  }

  // visitor log (see the fine print)
  api("whoami", {
    referrer: document.referrer || "",
    screen: (screen.width || "") + "x" + (screen.height || ""),
    viewport: (innerWidth || "") + "x" + (innerHeight || ""),
    lang: navigator.language || "",
    tz: (function () { try { return Intl.DateTimeFormat().resolvedOptions().timeZone; } catch (e) { return ""; } })()
  }).catch(function () {});

  /* ---------- account ---------- */
  var user = null;
  function setUser(u) {
    user = u;
    $("acct-guest").hidden = !!u;
    $("acct-user").hidden = !u;
    $("account-title").textContent = u ? "Account" : "Sign in";
    $("account-btn").textContent = u ? u.name : "Sign in";
    if (u) {
      $("me-name").textContent = u.name;
      $("me-tag").innerHTML = RJTag.html(u.tag);
      $("owner-link").hidden = !u.owner;
    }
    [].forEach.call(document.querySelectorAll(".name-field"), function (el) { el.hidden = !!u; });
    $("wall-msg").placeholder = u ? "Say something short, " + u.name : "Say something short";
    if (forumThread) openThread(forumThread); else if (threadsLoaded) loadThreads();
  }
  $("account-btn").addEventListener("click", function () { $("acct-err").textContent = ""; showDrawer("account"); });
  function seg(reg) {
    $("seg-login").setAttribute("aria-selected", !reg);
    $("seg-register").setAttribute("aria-selected", reg);
    $("login-form").hidden = reg; $("register-form").hidden = !reg;
    $("acct-err").textContent = "";
  }
  $("seg-login").addEventListener("click", function () { seg(false); });
  $("seg-register").addEventListener("click", function () { seg(true); });
  function busy(form, on) { [].forEach.call(form.querySelectorAll("button"), function (b) { b.disabled = on; }); }
  $("login-form").addEventListener("submit", function (e) {
    e.preventDefault(); var f = this; busy(f, true);
    api("login", { username: $("l-user").value, password: $("l-pass").value })
      .then(function (d) { $("l-pass").value = ""; setUser(d.user); hideDrawer(); toast("Signed in as " + d.user.name + "."); })
      .catch(function (err) { $("acct-err").textContent = err.message; })
      .then(function () { busy(f, false); });
  });
  $("register-form").addEventListener("submit", function (e) {
    e.preventDefault();
    if ($("r-pass").value !== $("r-pass2").value) { $("acct-err").textContent = "The two passwords don't match."; return; }
    var f = this; busy(f, true);
    api("register", { username: $("r-user").value, password: $("r-pass").value })
      .then(function (d) { $("r-pass").value = $("r-pass2").value = ""; setUser(d.user); hideDrawer(); toast("Account created. Welcome, " + d.user.name + "."); loadMembers(); })
      .catch(function (err) { $("acct-err").textContent = err.message; })
      .then(function () { busy(f, false); });
  });
  $("logout-btn").addEventListener("click", function () {
    api("logout", {}).catch(function () {}).then(function () { setUser(null); hideDrawer(); toast("Signed out."); });
  });

  /* ---------- posts ---------- */
  function byline(p) {
    var hl = RJTag.hl(p.tag);
    return '<span class="by"><b>' + esc(p.name) + '</b>' + (p.guest ? '<span class="guest">guest</span>' : "") + RJTag.html(p.tag) + '</span>';
  }
  function delBtn(kind, id) {
    return user && user.owner ? '<button class="del" type="button" data-kind="' + kind + '" data-id="' + id + '">Delete</button>' : "";
  }
  function postHtml(p, kind) {
    var hl = RJTag.hl(p.tag);
    return '<article class="post' + hl.cls + '"' + hl.style + '><header>' + byline(p) + '<time>' + ago(p.created) + '</time>' + delBtn(kind, p.id) + '</header>' +
      '<p>' + esc(p.body).replace(/\n/g, "<br>") + '</p></article>';
  }

  /* forum */
  var CATS = ["General", "Product Reviews", "Recipes", "Gaming", "Off Topic"];
  var forumCat = "", forumThread = 0, threadsLoaded = false;
  $("forum-cats").innerHTML = '<button type="button" class="chip on" data-cat="">All</button>' +
    CATS.map(function (c) { return '<button type="button" class="chip" data-cat="' + esc(c) + '">' + esc(c) + '</button>'; }).join("");
  $("forum-cat").innerHTML = CATS.map(function (c) { return "<option>" + esc(c) + "</option>"; }).join("");

  function loadThreads() {
    threadsLoaded = true;
    $("forum-status").textContent = "Loading threads…";
    api("threads" + (forumCat ? "?cat=" + encodeURIComponent(forumCat) : "")).then(function (d) {
      $("forum-threads").innerHTML = d.threads.length ? d.threads.map(function (t) {
        return '<li class="thread' + (t.pinned ? " pinned" : "") + (t.highlighted ? " hlt" : "") + '">' +
          '<a href="#" class="thread-link" data-id="' + t.id + '">' + (t.pinned ? '<span class="pin">Pinned</span>' : "") + esc(t.title) + '</a>' +
          '<span class="thread-meta"><span class="cat">' + esc(t.category) + '</span>' + byline(t) +
          '<span class="replies">' + t.replies + (t.replies === 1 ? " reply" : " replies") + '</span><time>' + ago(t.last_activity) + '</time></span></li>';
      }).join("") : '<li class="empty">No threads here yet. Start the first one.</li>';
      $("forum-status").textContent = "";
    }).catch(function (err) { $("forum-status").textContent = err.message; });
  }
  function showList() { forumThread = 0; $("forum-thread-view").hidden = true; $("forum-list-view").hidden = false; loadThreads(); }
  function openThread(id) {
    forumThread = id;
    $("forum-list-view").hidden = true; $("forum-thread-view").hidden = false;
    api("thread?id=" + id).then(function (d) {
      var t = d.thread, tools = "";
      if (user && user.can_pin) tools += '<button class="pill ghost small flag" type="button" data-flag="pinned" data-on="' + (t.pinned ? 0 : 1) + '">' + (t.pinned ? "Unpin" : "Pin") + '</button>';
      if (user && user.can_highlight) tools += '<button class="pill ghost small flag" type="button" data-flag="highlighted" data-on="' + (t.highlighted ? 0 : 1) + '">' + (t.highlighted ? "Remove highlight" : "Highlight") + '</button>';
      $("forum-thread").innerHTML = '<p class="cat">' + esc(t.category) + '</p><h3 class="thread-title">' + esc(t.title) + '</h3>' +
        (tools ? '<div class="thread-tools">' + tools + '</div>' : "") + postHtml(t, "thread") +
        '<div class="replies-list">' + d.replies.map(function (r) { return postHtml(r, "reply"); }).join("") + '</div>';
    }).catch(function (err) { $("forum-thread").innerHTML = '<p class="err">' + esc(err.message) + '</p>'; });
  }
  $("forum-cats").addEventListener("click", function (e) {
    var c = e.target.closest(".chip"); if (!c) return;
    forumCat = c.getAttribute("data-cat");
    [].forEach.call($("forum-cats").children, function (x) { x.classList.toggle("on", x === c); });
    loadThreads();
  });
  $("forum-new-btn").addEventListener("click", function () { $("forum-new-form").hidden = !$("forum-new-form").hidden; if (!$("forum-new-form").hidden) $("forum-title").focus(); });
  $("forum-back").addEventListener("click", showList);
  $("forum-threads").addEventListener("click", function (e) {
    var a = e.target.closest(".thread-link"); if (!a) return;
    e.preventDefault(); openThread(Number(a.getAttribute("data-id")));
    $("community").scrollIntoView({ behavior: "smooth" });
  });
  $("forum-new-form").addEventListener("submit", function (e) {
    e.preventDefault(); var f = this; busy(f, true); $("forum-new-err").textContent = "";
    api("threads", { title: $("forum-title").value, message: $("forum-body").value, category: $("forum-cat").value, name: $("forum-name").value })
      .then(function (d) { $("forum-title").value = $("forum-body").value = ""; f.hidden = true; openThread(d.id); })
      .catch(function (err) { $("forum-new-err").textContent = err.message; })
      .then(function () { busy(f, false); });
  });
  $("forum-reply-form").addEventListener("submit", function (e) {
    e.preventDefault(); var f = this; busy(f, true); $("forum-reply-err").textContent = "";
    api("replies", { thread_id: forumThread, message: $("forum-reply").value, name: $("forum-rname").value })
      .then(function () { $("forum-reply").value = ""; openThread(forumThread); })
      .catch(function (err) { $("forum-reply-err").textContent = err.message; })
      .then(function () { busy(f, false); });
  });
  $("forum-thread").addEventListener("click", function (e) {
    var b = e.target.closest(".flag"); if (!b) return;
    api("threadflag", { id: forumThread, flag: b.getAttribute("data-flag"), on: b.getAttribute("data-on") === "1" })
      .then(function () { openThread(forumThread); }).catch(function (err) { toast(err.message); });
  });

  /* wall */
  function loadWall() {
    api("comments").then(function (d) {
      $("wall-list").innerHTML = d.posts.length ? d.posts.map(function (p) { return "<li>" + postHtml(p, "comment") + "</li>"; }).join("")
        : '<li class="empty">Nothing on the wall yet. Write the first line.</li>';
      setMembers(d.members);
    }).catch(function (err) { $("wall-err").textContent = err.message; });
  }
  $("wall-form").addEventListener("submit", function (e) {
    e.preventDefault(); var f = this; busy(f, true); $("wall-err").textContent = "";
    api("comments", { message: $("wall-msg").value, name: $("wall-name").value })
      .then(function () { $("wall-msg").value = ""; loadWall(); })
      .catch(function (err) { $("wall-err").textContent = err.message; })
      .then(function () { busy(f, false); });
  });

  /* owner delete, anywhere */
  document.addEventListener("click", function (e) {
    var b = e.target.closest(".del"); if (!b) return;
    if (!confirm("Delete this post for good?")) return;
    api("delete", { kind: b.getAttribute("data-kind"), id: Number(b.getAttribute("data-id")) }).then(function () {
      if (b.getAttribute("data-kind") === "comment") loadWall();
      else if (b.getAttribute("data-kind") === "thread") showList();
      else openThread(forumThread);
    }).catch(function (err) { toast(err.message); });
  });

  /* tabs */
  function selectTab(which) {
    var wall = which === "wall";
    $("tab-forum").setAttribute("aria-selected", !wall); $("tab-wall").setAttribute("aria-selected", wall);
    $("panel-forum").hidden = wall; $("panel-wall").hidden = !wall;
    if (wall) loadWall();
  }
  $("tab-forum").addEventListener("click", function () { selectTab("forum"); });
  $("tab-wall").addEventListener("click", function () { selectTab("wall"); });

  function setMembers(n) { if (n != null) $("member-line").textContent = n === 1 ? "1 member so far." : n.toLocaleString() + " members so far."; }
  function loadMembers() { api("comments").then(function (d) { setMembers(d.members); }).catch(function () {}); }

  // load the salon when it scrolls near view
  var salonSeen = false;
  function wakeSalon() { if (salonSeen) return; salonSeen = true; loadThreads(); loadMembers(); }
  if ("IntersectionObserver" in window) {
    new IntersectionObserver(function (en, o) { if (en[0].isIntersecting) { wakeSalon(); o.disconnect(); } }, { rootMargin: "400px" }).observe($("community"));
  } else wakeSalon();

  api("me").then(function (d) { if (d.user) setUser(d.user); }).catch(function () {});

  /* ---------- live + channel ---------- */
  function checkLive() {
    api("live").then(function (d) {
      $("live-strip").hidden = !d.live;
      if (d.live) { $("live-link").href = d.url; $("live-title").textContent = d.title ? ": " + d.title : ""; }
    }).catch(function () {});
  }
  checkLive(); setInterval(function () { if (!document.hidden) checkLive(); }, 120000);

  api("videos").then(function (d) {
    var v = (d.videos || []).slice(0, 6); if (!v.length) return;
    $("videos").innerHTML = v.map(function (x) {
      return '<a class="video" href="https://www.youtube.com/watch?v=' + encodeURIComponent(x.id) + '" target="_blank" rel="noopener">' +
        '<img src="https://i.ytimg.com/vi/' + encodeURIComponent(x.id) + '/mqdefault.jpg" alt="" loading="lazy" width="320" height="180">' +
        '<span>' + esc(x.title || "Watch on YouTube") + '</span></a>';
    }).join("");
    $("channel").hidden = false;
  }).catch(function () {});

  $("year").textContent = new Date().getFullYear();
})();
