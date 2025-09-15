const section = document.getElementById('why-us');
const container = document.getElementById('designContainer');

const corePoints = [
    { x: 10, y: 30 },
    { x: 30, y: 60 },
    { x: 50, y: 20 },
    { x: 70, y: 60 },
    { x: 90, y: 30 }
];

const points = [{ x: 0, y: corePoints[0].y }, ...corePoints, { x: 100, y: corePoints[corePoints.length - 1].y }];

const cubeData = [
    { title: "Cube 1", desc: "Travels to corner 5" },
    { title: "Cube 2", desc: "Travels to corner 4" },
    { title: "Cube 3", desc: "Travels to corner 3" },
    { title: "Cube 4", desc: "Travels to corner 2" },
    { title: "Cube 5", desc: "Travels to corner 1" }
];

const cubeToCorner = [4, 3, 2, 1, 0];

const cubeEls = [];
cubeData.forEach(data => {
    const cube = document.createElement('div');
    cube.className = 'cube';
    cube.innerHTML = `<h3>${data.title}</h3><p>${data.desc}</p>`;
    container.appendChild(cube);
    cubeEls.push(cube);
});

const lineEls = [];
for (let i = 0; i < points.length - 1; i++) {
    const line = document.createElement('div');
    line.className = 'line';
    container.appendChild(line);
    lineEls.push(line);
}

let pathSegments = [];
let cornerDistances = [];

function positionElements() {
    const w = section.clientWidth;
    const h = section.clientHeight / 2; // Use half the height because height=200vh

    pathSegments = [];
    cornerDistances = [];
    let cumulative = 0;
    for (let i = 0; i < points.length - 1; i++) {
        const p1 = { x: (points[i].x / 100) * w, y: (points[i].y / 100) * h };
        const p2 = { x: (points[i + 1].x / 100) * w, y: (points[i + 1].y / 100) * h };
        const dx = p2.x - p1.x;
        const dy = p2.y - p1.y;
        const length = Math.sqrt(dx * dx + dy * dy);

        pathSegments.push({ p1, p2, dx, dy, length, start: cumulative });
        cumulative += length;

        const angle = Math.atan2(dy, dx) * 180 / Math.PI;
        lineEls[i].style.left = `${p1.x}px`;
        lineEls[i].style.top = `${p1.y}px`;
        lineEls[i].style.transform = `rotate(${angle}deg)`;
        lineEls[i].style.width = `${length}px`;
    }

    cornerDistances = corePoints.map(corner => {
        let distance = 0;
        for (let seg of pathSegments) {
            const cornerX = (corner.x / 100) * w;
            if (cornerX >= seg.p1.x && cornerX <= seg.p2.x) {
                const dx = cornerX - seg.p1.x;
                const dy = ((corner.y / 100) * h) - seg.p1.y;
                distance += Math.sqrt(dx * dx + dy * dy);
                break;
            } else {
                distance += seg.length;
            }
        }
        return distance;
    });
}

function getPointAtDistance(distance) {
    for (let seg of pathSegments) {
        if (distance <= seg.start + seg.length) {
            const t = (distance - seg.start) / seg.length;
            return { x: seg.p1.x + seg.dx * t, y: seg.p1.y + seg.dy * t };
        }
    }
    const lastSeg = pathSegments[pathSegments.length - 1];
    return { x: lastSeg.p2.x, y: lastSeg.p2.y };
}

function moveCubes() {
    const rect = section.getBoundingClientRect();
    const vh = window.innerHeight;

    // Animate only while section is in view
    if (rect.top < vh && rect.bottom > 0) {
        const scrollProgress = Math.min(Math.max((vh - rect.top) / (section.clientHeight - vh), 0), 1);
        const segment = 1 / cubeEls.length;

        cubeEls.forEach((cube, i) => {
            const start = i * segment;
            const localProgress = Math.min(Math.max((scrollProgress - start) / segment, 0), 1);
            const targetDistance = cornerDistances[cubeToCorner[i]];
            const currentDistance = targetDistance * localProgress;
            const pos = getPointAtDistance(currentDistance);
            cube.style.left = `${pos.x}px`;
            cube.style.top = `${pos.y}px`;
            cube.style.opacity = localProgress > 0 ? 1 : 0;
        });
    }
}

window.addEventListener('scroll', moveCubes);
window.addEventListener('resize', () => { positionElements(); moveCubes(); });

positionElements();
moveCubes();
