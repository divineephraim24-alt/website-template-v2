// The only script on the site. Everything still works if it doesn't load.

// 1) Video cover images load only when the video is near the screen.
(function () {
  var vids = document.querySelectorAll('video[data-poster]');
  function show(v) { v.poster = v.dataset.poster; }
  if (!('IntersectionObserver' in window)) { vids.forEach(show); return; }
  var io = new IntersectionObserver(function (entries) {
    entries.forEach(function (e) { if (e.isIntersecting) { show(e.target); io.unobserve(e.target); } });
  }, { rootMargin: '800px 0px' });
  vids.forEach(function (v) { io.observe(v); });
})();

// 2) The fixed contact bar on phones hides while another main contact button is on screen.
(function () {
  var bar = document.querySelector('.contact-bar');
  var targets = document.querySelectorAll('[data-hides-bar]');
  if (!bar) return;
  if (!('IntersectionObserver' in window) || targets.length === 0) { bar.classList.add('is-shown'); return; }
  var visible = new Set();
  var io = new IntersectionObserver(function (entries) {
    entries.forEach(function (e) { if (e.isIntersecting) visible.add(e.target); else visible.delete(e.target); });
    bar.classList.toggle('is-shown', visible.size === 0);
  });
  targets.forEach(function (t) { io.observe(t); });
})();

// 3) The video only plays when tapped. Browser controls appear once it is playing.
(function () {
  var video = document.getElementById('main-video');
  var button = document.querySelector('.film-play');
  if (!video || !button) return;
  var label = document.querySelector('.film-label');
  button.addEventListener('click', function () { video.controls = true; video.play(); });
  video.addEventListener('play', function () { video.controls = true; button.hidden = true; if (label) label.hidden = true; });
})();
