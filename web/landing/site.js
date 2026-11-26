const motion = window.matchMedia('(prefers-reduced-motion: reduce)');

function loadImage(source, priority = 'auto') {
  const photo = new Image();
  photo.decoding = 'async';
  photo.fetchPriority = priority;
  return new Promise(resolve => {
    photo.addEventListener('load', async () => {
      try {
        await photo.decode();
      } catch {
        // A loaded image is still usable when the browser defers decoding.
      }
      resolve(photo);
    }, { once: true });
    photo.addEventListener('error', () => resolve(null), { once: true });
    photo.src = source;
  });
}

function loadPhoto(series, index, priority) {
  const number = String(index + 1).padStart(2, '0');
  return loadImage('frames/' + series + '-' + number + '.webp', priority);
}

function setupJourney() {
  const section = document.querySelector('[data-journey]');
  const stage = section?.querySelector('[data-stage]');
  const track = section?.querySelector('[data-frame-track]');
  const focusShift = section?.querySelector('[data-focus-shift]');
  if (!stage || !track || !focusShift) return;

  const canvas = stage.querySelector('[data-sequence]');
  const context = canvas?.getContext('2d', { alpha: false });
  const title = stage.querySelector('[data-stage-title]');
  const cutout = stage.querySelector('[data-cutout]');
  const cutoutContext = cutout?.getContext('2d');
  const reveals = Array.from(section.querySelectorAll('[data-reveal]'), element => ({
    element,
    delay: Number(element.dataset.revealDelay) || 0,
  }));

  const frameSize = 448;
  const columns = 4;
  const framesPerAtlas = 12;
  const atlasCount = 10;
  const atlases = new Map();
  const requested = new Set();
  let activeAtlas = -1;
  let nearby = false;
  let renderRequest = 0;
  let lastFrame = -1;

  function unit(value) {
    return Math.max(0, Math.min(1, value));
  }

  function ease(value) {
    const progress = unit(value);
    return progress * progress * (3 - 2 * progress);
  }

  // The reveal's own translateY must not influence its scroll trigger.
  function layoutTop(element) {
    let top = element.offsetTop;
    for (let parent = element.offsetParent; parent; parent = parent.offsetParent) {
      top += parent.offsetTop;
    }
    return top - window.scrollY;
  }

  function render() {
    renderRequest = 0;
    if (motion.matches) {
      if (canvas) canvas.hidden = true;
      if (cutout) cutout.hidden = true;
      title.style.setProperty('--title-opacity', Number(
        track.getBoundingClientRect().bottom > stage.getBoundingClientRect().top
      ));
      section.removeAttribute('data-motion-ready');
      stage.style.setProperty('--progress', '0');
      stage.style.setProperty('--defocus', '0');
      atlases.clear();
      activeAtlas = -1;
      lastFrame = -1;
      return;
    }

    const height = Math.max(1, window.innerHeight);
    // Continue the camera move into the first viewport of the release.
    const distance = track.offsetHeight - stage.offsetHeight * .05;
    const travelled = stage.getBoundingClientRect().top - track.getBoundingClientRect().top;
    const progress = unit(travelled / Math.max(1, distance));
    const frame = Math.round(progress * (atlasCount * framesPerAtlas - 1));
    const focusTop = focusShift.getBoundingClientRect().top;
    const approach = ease((height * 1.04 - focusTop) / (height * .50));
    const defocus = Math.min(approach, ease((progress - .62) / .26));
    const root = document.scrollingElement;
    const distanceFromBottom = root ? root.scrollHeight - root.clientHeight - window.scrollY : Infinity;
    const endReveal = ease(1 - distanceFromBottom / (height * .24));
    const revealValues = reveals.map(({ element, delay }) => {
      if (element.matches(':focus-within')) return 1;
      const top = layoutTop(element);
      const entered = ease((height * (.88 - delay) - top) / (height * .20));
      return top < height ? Math.max(entered, endReveal) : entered;
    });

    const titleOpacity = 1 - ease(progress / .18);
    title.style.setProperty('--title-opacity', titleOpacity.toFixed(4));
    stage.style.setProperty('--progress', progress.toFixed(4));
    stage.style.setProperty('--defocus', defocus.toFixed(4));
    reveals.forEach(({ element }, index) => {
      element.style.setProperty('--reveal', revealValues[index].toFixed(4));
    });
    section.toggleAttribute('data-motion-ready', true);

    if (!context) return;
    const atlasIndex = Math.floor(frame / framesPerAtlas);
    loadNearbyAtlases(atlasIndex);
    const atlas = atlases.get(atlasIndex);
    if (!atlas || frame === lastFrame) return;

    const cell = frame % framesPerAtlas;
    const x = cell % columns * frameSize;
    const y = Math.floor(cell / columns) * frameSize;
    context.drawImage(atlas.background, x, y, frameSize, frameSize, 0, 0, canvas.width, canvas.height);
    if (atlas.cutout && cutoutContext) {
      cutoutContext.clearRect(0, 0, cutout.width, cutout.height);
      cutoutContext.drawImage(atlas.cutout, x, y, frameSize, frameSize, 0, 0, cutout.width, cutout.height);
      cutout.hidden = false;
    }
    canvas.hidden = false;
    lastFrame = frame;
  }

  function scheduleRender() {
    if (!renderRequest) renderRequest = requestAnimationFrame(render);
  }

  function loadAtlas(index, priority) {
    if (index < 0 || index >= atlasCount || atlases.has(index) || requested.has(index)) return;
    requested.add(index);
    const background = loadPhoto('pullback', index, priority);
    // The title finishes fading within the first two atlases.
    const foreground = index < 2 && cutoutContext ? loadPhoto('cutout', index, priority) : null;
    Promise.all([background, foreground]).then(([photo, mask]) => {
      if (!photo) return;
      requested.delete(index);
      if (activeAtlas < 0 || Math.abs(activeAtlas - index) > 2) return;
      atlases.set(index, { background: photo, cutout: mask });
      scheduleRender();
    });
  }

  function loadNearbyAtlases(index) {
    if (!nearby || activeAtlas === index) return;
    activeAtlas = index;
    for (const loaded of atlases.keys()) {
      if (Math.abs(loaded - index) > 2) atlases.delete(loaded);
    }
    loadAtlas(index, 'high');
    loadAtlas(index + 1, 'low');
    loadAtlas(index - 1, 'low');
    loadAtlas(index + 2, 'low');
  }

  if ('IntersectionObserver' in window) {
    new IntersectionObserver(([entry]) => {
      nearby = entry.isIntersecting;
      scheduleRender();
    }, { rootMargin: '1100px 0px' }).observe(section);
  } else {
    nearby = true;
  }
  window.addEventListener('scroll', scheduleRender, { passive: true });
  window.addEventListener('resize', scheduleRender);
  window.addEventListener('pageshow', scheduleRender);
  window.addEventListener('hashchange', scheduleRender);
  section.addEventListener('focusin', scheduleRender);
  section.addEventListener('focusout', scheduleRender);
  if ('ResizeObserver' in window) {
    const resize = new ResizeObserver(scheduleRender);
    resize.observe(stage);
    resize.observe(track);
    resize.observe(focusShift);
  }
  motion.addEventListener('change', scheduleRender);
  scheduleRender();
}

function setupOpening() {
  const opening = document.querySelector('[data-opening]');
  const skip = opening.querySelector('[data-skip]');
  const canvas = opening.querySelector('[data-intro-sequence]');
  const context = canvas.getContext('2d', { alpha: false });
  if (!context || motion.matches || window.scrollY > 0 ||
      (location.hash && location.hash !== '#home')) return;

  const dismissal = new AbortController();
  const listeners = { signal: dismissal.signal };
  let timer;
  let frameRequest;
  let closed = false;

  function close() {
    if (closed) return;
    closed = true;
    clearTimeout(timer);
    cancelAnimationFrame(frameRequest);
    dismissal.abort();
    opening.hidden = true;
  }

  skip.addEventListener('click', close, listeners);
  document.addEventListener('keydown', event => {
    if (event.key === 'Escape') close();
  }, listeners);
  document.addEventListener('pointerdown', event => {
    if (!opening.contains(event.target)) close();
  }, listeners);
  document.addEventListener('focusin', event => {
    if (!opening.contains(event.target)) close();
  }, listeners);
  window.addEventListener('blur', close, listeners);
  window.addEventListener('hashchange', close, listeners);
  window.addEventListener('scroll', () => {
    if (window.scrollY > 0) close();
  }, { ...listeners, passive: true });
  motion.addEventListener('change', close, listeners);

  // Keep the opening brief even when a visit is made over a slow connection.
  opening.hidden = false;
  timer = setTimeout(close, 680);
  loadImage('frames/opening.webp', 'high').then(atlas => {
    if (closed) return;
    if (!atlas) {
      close();
      return;
    }
    clearTimeout(timer);
    const cellSize = 256;
    const columns = 8;
    const frameCount = 72;
    let lastFrame = -1;
    function draw(frame) {
      if (frame === lastFrame) return;
      const x = frame % columns * cellSize;
      const y = Math.floor(frame / columns) * cellSize;
      context.drawImage(atlas, x, y, cellSize, cellSize, 0, 0, canvas.width, canvas.height);
      lastFrame = frame;
    }
    draw(0);
    canvas.hidden = false;

    const started = performance.now();
    const duration = 2180;
    timer = setTimeout(close, duration + 150);
    function play(now) {
      const elapsed = now - started;
      const frame = Math.max(0, Math.min(frameCount - 1, Math.floor(elapsed * frameCount / duration)));
      draw(frame);
      if (elapsed >= duration) close();
      else frameRequest = requestAnimationFrame(play);
    }
    frameRequest = requestAnimationFrame(play);
  });
}

function setupGameDialog() {
  const dialog = document.querySelector('[data-game-dialog]');
  const opener = document.querySelector('[data-open-game]');
  const closer = dialog?.querySelector('[data-close-game]');
  const frame = dialog?.querySelector('[data-game-frame]');
  if (!opener || !closer || !frame?.dataset.src || typeof dialog.showModal !== 'function') return;

  opener.addEventListener('click', event => {
    event.preventDefault();
    if (dialog.open) return;
    dialog.showModal();
    if (!frame.hasAttribute('src')) {
      frame.loading = 'eager';
      frame.src = frame.dataset.src;
    }
  });

  closer.addEventListener('click', () => dialog.close());
  dialog.addEventListener('click', event => {
    if (event.target !== dialog || !event.detail) return;
    const { left, right, top, bottom } = dialog.getBoundingClientRect();
    if (event.clientX < left || event.clientX > right ||
        event.clientY < top || event.clientY > bottom) {
      dialog.close();
    }
  });
  dialog.addEventListener('close', () => {
    if (dialog.open) return;
    const fullscreen = document.fullscreenElement;
    if (fullscreen && dialog.contains(fullscreen)) {
      document.exitFullscreen().catch(() => {});
    }
    opener.focus({ preventScroll: true });
  });
}

function setupFullscreen() {
  const game = document.querySelector('[data-game]');
  const button = document.querySelector('[data-fullscreen]');
  if (!game || !button || !document.fullscreenEnabled || !game.requestFullscreen) return;
  const label = button.querySelector('[data-fullscreen-label]') ?? button;
  button.hidden = false;
  button.addEventListener('click', async () => {
    try {
      if (document.fullscreenElement === game) await document.exitFullscreen();
      else await game.requestFullscreen();
    } catch {
      button.blur();
    }
  });
  document.addEventListener('fullscreenchange', () => {
    label.textContent = document.fullscreenElement === game ? 'Sair da tela cheia' : 'Tela cheia';
  });
}

setupOpening();
setupJourney();
setupGameDialog();
setupFullscreen();
