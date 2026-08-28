/* yixuanyang.com -- theme switch, card dialogs, site search.
   No framework, no build step: this file is served as written. */
(function () {
  "use strict";

  var root = document.documentElement;

  /* #reviewer used to be a section on the home page and is now its own page.
     The anchor is in the wild -- forward it rather than landing people on a
     page that no longer has the id they asked for. */
  if (location.hash === "#reviewer" && !document.getElementById("reviewer")) {
    location.replace("/service/#reviewer");
  }

  /* Theme -------------------------------------------------------------------
     The stored value is only written when the reader actually chooses. Absent
     a choice the attribute stays off and the prefers-color-scheme block in the
     stylesheet decides, so the page keeps tracking the OS. */

  function effectiveTheme() {
    if (root.dataset.theme) return root.dataset.theme;
    return window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light";
  }

  var toggle = document.getElementById("theme-toggle");
  if (toggle) {
    toggle.addEventListener("click", function () {
      var next = effectiveTheme() === "dark" ? "light" : "dark";
      root.dataset.theme = next;
      try { localStorage.setItem("theme", next); } catch (e) { /* private mode */ }
    });
  }

  /* Card summaries ----------------------------------------------------------
     The disclosure itself is a <details>, so it already works with the keyboard
     and without this file. All that is added here is forwarding a click from
     anywhere on the tile to the same toggle. */

  document.querySelectorAll(".publication-item.is-openable").forEach(function (card) {
    var panel = card.querySelector(".card-summary");
    if (!panel) return;

    card.addEventListener("click", function (e) {
      /* A link or the video keeps its own behaviour, and the pill is the
         <summary>, which the browser toggles on its own. */
      if (e.target.closest("a, button, video, summary")) return;
      /* Someone highlighting an author name is reading, not clicking. */
      if (window.getSelection && String(window.getSelection()).length > 0) return;
      panel.open = !panel.open;
    });
  });

  /* Slideshow ---------------------------------------------------------------
     Cross-fades the frames of a figure that has more than one. Every frame is
     already in the DOM with its own alt text, so nothing here is load-bearing
     for content -- if this never runs, the first frame stays and the entry is
     unharmed. */

  var reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)");

  document.querySelectorAll("[data-slideshow]").forEach(function (box) {
    var frames = box.querySelectorAll("img, video");
    if (frames.length < 2 || reduceMotion.matches) return;

    /* setTimeout, not setInterval: a frame holds for as long as it needs. The
       knob clip is seven seconds and has to finish turning; a still needs four.
       A fixed interval either cut the clip off or left the stills up too long. */
    var STILL = 2600;
    function dwell(f) {
      return f.tagName === "VIDEO" ? (parseInt(f.dataset.dwell, 10) || 4000) : STILL;
    }

    /* A video frame carries preload="none", so it costs nothing until its turn
       is coming. Fetching it one step early is what keeps it from showing a
       blank box for the first half of its window. */
    function prime(n) {
      var f = frames[(n + 1) % frames.length];
      if (f.tagName === "VIDEO" && f.preload === "none") { f.preload = "auto"; f.load(); }
    }

    var i = 0;
    var timer = null;

    /* Nothing happens, and nothing is fetched, until the card is near the
       viewport. Research Experiences sits well below the fold, so priming on
       load would put megabytes on the wire for a reader who may never scroll
       that far. */
    function advance() {
      if (document.hidden) { timer = setTimeout(advance, 1000); return; }

      var leaving = frames[i];
      leaving.classList.remove("is-active");
      if (leaving.tagName === "VIDEO") leaving.pause();

      i = (i + 1) % frames.length;
      var arriving = frames[i];
      arriving.classList.add("is-active");
      if (arriving.tagName === "VIDEO") {
        arriving.currentTime = 0;      /* every pass starts the clip over */
        var p = arriving.play();
        if (p && p.catch) p.catch(function () {});
      }
      prime(i);
      timer = setTimeout(advance, dwell(arriving));
    }

    function run(on) {
      if (on && !timer) { prime(i); timer = setTimeout(advance, dwell(frames[i])); }
      if (!on && timer) { clearTimeout(timer); timer = null; }
    }

    if ("IntersectionObserver" in window) {
      new IntersectionObserver(function (entries) {
        run(entries[0].isIntersecting);
      }, { rootMargin: "300px" }).observe(box);
    } else {
      run(true);
    }
  });

  /* Figure videos ------------------------------------------------------------
     A figure that plays by itself, driven from here rather than by the autoplay
     attribute, which Chrome declines often enough that the slot was showing
     white. Playing on intersection also keeps a multi-megabyte clip off the
     wire until someone has actually scrolled to it. */

  document.querySelectorAll("video[data-autoplay]").forEach(function (v) {
    if (reduceMotion.matches) return;      /* the poster is the whole figure */

    function start() {
      if (v.preload === "none") { v.preload = "auto"; v.load(); }
      var p = v.play();
      if (p && p.catch) p.catch(function () { /* poster stays; nothing lost */ });
    }

    if ("IntersectionObserver" in window) {
      new IntersectionObserver(function (entries) {
        if (entries[0].isIntersecting) start(); else v.pause();
      }, { rootMargin: "200px" }).observe(v);
    } else {
      start();
    }
  });

  /* Video player ------------------------------------------------------------
     One dialog for the whole page. The source is attached on open and removed
     on close, which is what actually stops the download -- pausing alone
     leaves the browser buffering a clip nobody is watching. */

  var videoDialog = document.getElementById("video-dialog");
  if (videoDialog) {
    var player = videoDialog.querySelector("video");
    var playerTitle = videoDialog.querySelector(".video-dialog-title");

    document.querySelectorAll(".media-link").forEach(function (btn) {
      btn.addEventListener("click", function (e) {
        e.stopPropagation();             /* not also a card toggle */
        playerTitle.textContent = btn.dataset.title || btn.textContent;
        /* Shape first, source second: the CSS sizes by height, and without a
           ratio the browser would use its 2:1 default until metadata landed. */
        var parts = (btn.dataset.ratio || "16 / 9").split("/");
        player.style.setProperty("--ratio", parseFloat(parts[0]) / parseFloat(parts[1]));
        player.src = btn.dataset.video;
        videoDialog.showModal();
        var p = player.play();
        if (p && p.catch) p.catch(function () { /* autoplay refused; controls are there */ });
      });
    });

    videoDialog.addEventListener("click", function (e) {
      if (e.target === videoDialog) videoDialog.close();
    });

    videoDialog.addEventListener("close", function () {
      player.pause();
      player.removeAttribute("src");
      player.load();
    });
  }

  /* Search ------------------------------------------------------------------
     Index fetched once, on first focus or first keystroke. Small enough that
     ranking is a linear scan: 28 entries, no inverted index to maintain. */

  var input = document.getElementById("site-search");
  var box = document.getElementById("search-results");
  if (!input || !box) return;

  var docs = [];
  var loading = null;
  var items = [];
  var active = -1;

  function load() {
    if (loading) return loading;
    loading = fetch(input.dataset.index)
      .then(function (r) { return r.json(); })
      .then(function (json) {
        docs = json.map(function (d) {
          d.hay = (d.t + " " + d.s + " " + d.b).toLowerCase();
          return d;
        });
      })
      .catch(function () { docs = []; });
    return loading;
  }

  /* Every term must appear somewhere; a term in the title is worth four in the
     body, and a title that starts with the term wins again. */
  function score(d, terms) {
    var total = 0;
    var title = d.t.toLowerCase();
    for (var i = 0; i < terms.length; i++) {
      if (d.hay.indexOf(terms[i]) === -1) return 0;
      total += 1;
      if (title.indexOf(terms[i]) !== -1) total += 3;
      if (title.indexOf(terms[i]) === 0) total += 2;
    }
    return total;
  }

  function esc(s) {
    return s.replace(/[&<>"]/g, function (c) {
      return { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[c];
    });
  }

  function highlight(text, terms) {
    var out = esc(text);
    terms.forEach(function (t) {
      var safe = t.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
      out = out.replace(new RegExp("(" + safe + ")", "gi"), "<mark>$1</mark>");
    });
    return out;
  }

  /* A window around the first hit, not the opening words: the match is what
     the reader is looking for. */
  function snippet(d, terms) {
    if (d.b.length <= d.t.length + 8) return "";     /* title already says it */
    var at = d.b.toLowerCase().indexOf(terms[0]);
    var start = Math.max(0, at - 40);
    var text = d.b.slice(start, start + 150);
    return (start > 0 ? "…" : "") + text + (start + 150 < d.b.length ? "…" : "");
  }

  function closeResults() {
    box.hidden = true;
    box.innerHTML = "";
    items = [];
    active = -1;
    input.setAttribute("aria-expanded", "false");
  }

  function render(q) {
    var terms = q.toLowerCase().split(/\s+/).filter(Boolean);
    if (!terms.length) { closeResults(); return; }

    var hits = docs
      .map(function (d) { return { d: d, n: score(d, terms) }; })
      .filter(function (h) { return h.n > 0; })
      .sort(function (a, b) { return b.n - a.n; })
      .slice(0, 8);

    if (hits.length) {
      box.innerHTML = hits.map(function (h) {
        var snip = snippet(h.d, terms);
        return '<li role="option"><a href="' + h.d.u + '">' +
               '<span class="search-section">' + esc(h.d.s) + "</span>" +
               '<span class="search-title">' + highlight(h.d.t, terms) + "</span>" +
               (snip ? '<span class="search-snippet">' + highlight(snip, terms) + "</span>" : "") +
               "</a></li>";
      }).join("");
    } else {
      box.innerHTML = '<li class="search-empty">No matches for “' + esc(q) + "”</li>";
    }

    items = Array.prototype.slice.call(box.querySelectorAll("a"));
    active = -1;
    box.hidden = false;
    input.setAttribute("aria-expanded", "true");
  }

  input.addEventListener("focus", load);
  input.addEventListener("input", function () {
    var q = input.value.trim();
    load().then(function () { render(q); });
  });

  input.addEventListener("keydown", function (e) {
    if (e.key === "Escape") { closeResults(); input.blur(); return; }
    if (!items.length) return;

    if (e.key === "ArrowDown" || e.key === "ArrowUp") {
      e.preventDefault();
      active = (active + (e.key === "ArrowDown" ? 1 : -1) + items.length) % items.length;
      items.forEach(function (a, i) { a.parentNode.classList.toggle("is-active", i === active); });
      items[active].scrollIntoView({ block: "nearest" });
    } else if (e.key === "Enter" && active > -1) {
      e.preventDefault();
      items[active].click();
    }
  });

  box.addEventListener("click", function () { closeResults(); input.blur(); });

  document.addEventListener("click", function (e) {
    if (!e.target.closest(".search")) closeResults();
  });

  /* "/" to search is the convention readers already have from GitHub and the
     docs sites; Cmd-K is the same reflex from everywhere else. */
  document.addEventListener("keydown", function (e) {
    var el = document.activeElement;
    var typing = el && (el.tagName === "INPUT" || el.tagName === "TEXTAREA" || el.isContentEditable);

    if (e.key === "/" && !typing && !e.metaKey && !e.ctrlKey && !e.altKey) {
      e.preventDefault();
      input.focus();
    } else if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "k") {
      e.preventDefault();
      input.focus();
      input.select();
    }
  });
})();
