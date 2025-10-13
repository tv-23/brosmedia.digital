const pointsDesktop = [
  { x: 10, y: 30 }, { x: 30, y: 60 }, { x: 50, y: 20 }, { x: 70, y: 60 }, { x: 90, y: 30 }
];

const pointsMobileTablet = [
  { x: 25, y: 15 }, { x: 75, y: 25 }, { x: 25, y: 45 }, { x: 70, y: 65 }, { x: 50, y: 85 }
];

let corePoints;

if (window.innerWidth >= 1024) {
  corePoints = pointsDesktop;
} else {
  corePoints = pointsMobileTablet;
}

// extended path: start (x=0) and end (x=100)
const points = [{ x: 0, y: corePoints[0].y }, ...corePoints, { x: 100, y: corePoints[corePoints.length - 1].y }];

const cubeData = [
  { title: "Innovation constante", desc: "Des solutions toujours à jour pour rester en avance sur vos concurrents." },
  { title: "Logiciels sur mesure", desc: "Nos applications s’adaptent à vos besoins spécifiques, pas l’inverse." },
  { title: "Gain de temps garanti", desc: "Automatisez vos tâches et concentrez-vous sur la croissance de votre activité." },
  { title: "Support dédié", desc: "Assistance rapide et personnalisée pour résoudre vos problèmes efficacement." },
  { title: "Interface intuitive", desc: "Des logiciels simples et faciles à utiliser, sans formation complexe." }
];
// mapping cube index -> core corner index (0-based). cube1 -> corner5 => index 4
const cubeToCorner = [4, 3, 2, 1, 0];

/* ------------------------
   DOM creation
   ------------------------ */
const container = document.getElementById('designContainer');
const lineEls = [];
const cubeEls = [];

// create cube DOM elements
cubeData.forEach(d => {
  const el = document.createElement('div');
  el.className = 'cube card border-0';
//   if (window.innerWidth >= 1024) {
//  el.innerHTML = `
//     <div class="card-body text-center">
//       <h5 class="card-title fw-bold mb-2">${d.title}</h5>
//       <br>
//       <p class="card-text">${d.desc}</p>
//     </div>
//   `;
//   }else{
//  el.innerHTML = `
//     <div class="card-body text-center">
//       <h5 class="card-title fw-bold mb-2">${d.title}</h5>
    
//     </div>
//   `;
//   }
 el.innerHTML = `
    <div class="card-body text-center">
      <h3 class="card-title fw-bold mb-2">${d.title}</h3>
      <p class="card-text">${d.desc}</p>
    </div>
  `;
  container.appendChild(el);
  cubeEls.push(el);
});

// create lines for each segment
for (let i = 0; i < points.length - 1; i++) {
  const line = document.createElement('div');
  line.className = 'line';
  container.appendChild(line);
  lineEls.push(line);
}

/* ------------------------
   Path math
   ------------------------ */
let pathSegments = []; // {p1,p2,dx,dy,length,start}
let cornerDistances = []; // distance from path start to each core corner
let totalPathLength = 0;

function buildPath() {
  const w = container.clientWidth;
  const h = container.clientHeight;
  pathSegments = [];
  let cumulative = 0;
  for (let i = 0; i < points.length - 1; i++) {
    const p1 = { x: (points[i].x / 100) * w, y: (points[i].y / 100) * h };
    const p2 = { x: (points[i + 1].x / 100) * w, y: (points[i + 1].y / 100) * h };
    const dx = p2.x - p1.x, dy = p2.y - p1.y;
    const length = Math.hypot(dx, dy);
    pathSegments.push({ p1, p2, dx, dy, length, start: cumulative });
    cumulative += length;
    // draw segment
    const angle = Math.atan2(dy, dx) * 180 / Math.PI;
    const lineEl = lineEls[i];
    lineEl.style.left = `${p1.x}px`;
    lineEl.style.top = `${p1.y}px`;
    lineEl.style.transform = `rotate(${angle}deg)`;
    lineEl.style.width = `${length}px`;
  }
  totalPathLength = cumulative;
  // distance to each core corner (corner j corresponds to end of segment j)
  cornerDistances = corePoints.map((_, j) => {
    const seg = pathSegments[j]; // segment index j ends at corner j (points[ j+1 ])
    return seg.start + seg.length;
  });
}

/* returns {x,y} for distance along path (clamped) */
function getPointAtDistance(distance) {
  if (distance <= 0) return { x: pathSegments[0].p1.x, y: pathSegments[0].p1.y };
  if (distance >= totalPathLength) {
    const last = pathSegments[pathSegments.length - 1];
    return { x: last.p2.x, y: last.p2.y };
  }
  for (let seg of pathSegments) {
    const segEnd = seg.start + seg.length;
    if (distance <= segEnd + 1e-6) {
      const t = (distance - seg.start) / seg.length;
      return { x: seg.p1.x + seg.dx * t, y: seg.p1.y + seg.dy * t };
    }
  }
  const last = pathSegments[pathSegments.length - 1];
  return { x: last.p2.x, y: last.p2.y };
}

/* ------------------------
   Scroll lock helpers
   ------------------------ */
let lockedScrollY = 0;
function lockScroll() {
  lockedScrollY = window.scrollY || document.documentElement.scrollTop;
  document.body.style.position = 'fixed';
  document.body.style.top = `-${lockedScrollY}px`;
  document.body.style.left = '0';
  document.body.style.right = '0';
  document.documentElement.style.overflow = 'hidden';
}
function unlockScroll() {
  document.body.style.position = '';
  document.body.style.top = '';
  document.body.style.left = '';
  document.body.style.right = '';
  document.documentElement.style.overflow = '';

  // Instead of restoring the old scroll, go to the top of #why-us
  const section = document.getElementById('why-us');
  if (section) {
    const sectionTop = section.offsetTop;
    window.scrollTo({ top: sectionTop, behavior: 'instant' }); // keep user at section
  }
}


/* ------------------------
   Animation (auto-play while locked)
   ------------------------ */
let animationPlaying = false;
function playAnimationThenContinue(duration = 500000) {
  if (animationPlaying) return;
  animationPlaying = true;
  lockScroll();

  const start = performance.now();
  const ease = t => (--t) * t * t + 1; // easeOutCubic-ish

  function frame(now) {
    const elapsed = now - start;
    let p = Math.min(elapsed / duration, 1);
    p = ease(p);

    // move cubes along path proportionally to their corner distance
    cubeEls.forEach((cubeEl, i) => {
      const targetDistance = cornerDistances[cubeToCorner[i]];
      const currentDistance = targetDistance * p;
      const pos = getPointAtDistance(currentDistance);
      cubeEl.style.left = `${Math.round(pos.x)}px`;
      cubeEl.style.top = `${Math.round(pos.y)}px`;
      cubeEl.style.opacity = p > 0 ? 1 : 0;
    });

    if (elapsed < duration) {
      requestAnimationFrame(frame);
    } else {
      // animation finished -> unlock scroll and smooth-scroll to next section
      unlockScroll();
    }
  }

  requestAnimationFrame(frame);
}

/* ------------------------
   Trigger: when we enter #why-us (top reached), start the animation and block user until done
   We'll only run once per page load.
   ------------------------ */
const section = document.getElementById('why-us');
let started = false;

function checkEnter() {
  if (started) return;
  const rect = section.getBoundingClientRect();
  // when top of section hits the top of the viewport (user scrolled to it)
  if (rect.top <= 0) {
    started = true;
    // ensure path is up-to-date
    buildPath();
    // initialize cubes at start (x=0)
    cubeEls.forEach((c, i) => {
      const pos = getPointAtDistance(0);
      c.style.left = `${Math.round(pos.x)}px`;
      c.style.top = `${Math.round(pos.y)}px`;
      c.style.opacity = 0;
    });
    // play automatic animation and block until done
    playAnimationThenContinue(2400); // 2400ms animation (adjustable)
  }
}

/* ------------------------
   init
   ------------------------ */
window.addEventListener('scroll', checkEnter, { passive: true });
window.addEventListener('resize', () => { buildPath(); });
buildPath();