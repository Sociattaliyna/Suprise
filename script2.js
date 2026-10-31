
import * as THREE from "https://cdn.jsdelivr.net/npm/three@0.180.0/build/three.module.js";

// =====================================
// 1. MEMBUAT SCENE
// =====================================

const container = document.getElementById("scene");

const scene = new THREE.Scene();

const camera = new THREE.PerspectiveCamera(
    55,
    window.innerWidth / window.innerHeight,
    0.1,
    100
);

camera.position.z = 13;

const renderer = new THREE.WebGLRenderer({
    antialias: true,
    alpha: true
});

renderer.setPixelRatio(Math.min(window.devicePixelRatio, 1.5));
renderer.setSize(window.innerWidth, window.innerHeight);
renderer.setClearColor(0x000000, 0);

container.appendChild(renderer.domElement);

 // =====================================
 // 2. PARTIKEL HATI YANG BISA PECAH
 // =====================================

const heartGroup = new THREE.Group();
scene.add(heartGroup);

const particleCount = 3500;

const positions = new Float32Array(particleCount * 3);
const targetPositions = new Float32Array(particleCount * 3);
const colors = new Float32Array(particleCount * 3);
const velocities = new Float32Array(particleCount * 3);

const palette = [
    new THREE.Color("#ff174f"),
    new THREE.Color("#ff4f91"),
    new THREE.Color("#ff91bc"),
    new THREE.Color("#ffd6e5"),
    new THREE.Color("#d80048")
];

for (let i = 0; i < particleCount; i++) {
    const t = Math.random() * Math.PI * 2;
    const fill = Math.sqrt(Math.random());

    const x = 16 * Math.pow(Math.sin(t), 3);
    const y =
        13 * Math.cos(t) -
        5 * Math.cos(2 * t) -
        2 * Math.cos(3 * t) -
        Math.cos(4 * t);

    const scale = 0.23 * fill;
    const index = i * 3;

    // Posisi tujuan: bentuk hati.
    targetPositions[index] = x * scale;
    targetPositions[index + 1] = y * scale;
    targetPositions[index + 2] =
        (Math.random() - 0.5) * 2;

    // Posisi awal: partikel tersebar.
    positions[index] = (Math.random() - 0.5) * 22;
    positions[index + 1] = (Math.random() - 0.5) * 16;
    positions[index + 2] = (Math.random() - 0.5) * 8;

    // Kecepatan saat partikel pecah.
    velocities[index] = (Math.random() - 0.5) * 0.12;
    velocities[index + 1] = (Math.random() - 0.5) * 0.12;
    velocities[index + 2] = (Math.random() - 0.5) * 0.12;

    const color = palette[
        Math.floor(Math.random() * palette.length)
    ];

    colors[index] = color.r;
    colors[index + 1] = color.g;
    colors[index + 2] = color.b;
}

const heartGeometry = new THREE.BufferGeometry();

heartGeometry.setAttribute(
    "position",
    new THREE.BufferAttribute(positions, 3)
);

heartGeometry.setAttribute(
    "color",
    new THREE.BufferAttribute(colors, 3)
);

const heartMaterial = new THREE.PointsMaterial({
    size: 0.055,
    vertexColors: true,
    transparent: true,
    opacity: 0.95,
    blending: THREE.AdditiveBlending,
    depthWrite: false
});

const heartParticles = new THREE.Points(
    heartGeometry,
    heartMaterial
);

heartGroup.add(heartParticles);

let assembly = 0;
let mouseActive = false;
let mouseX = 0;
let mouseY = 0;
let lastMouseMove = 0;

window.addEventListener("pointermove", (event) => {
    // Posisi kursor dalam koordinat 3D.
    const viewHeight =
        2 * camera.position.z *
        Math.tan(THREE.MathUtils.degToRad(camera.fov / 2));

    const viewWidth =
        viewHeight * camera.aspect;

    mouseX =
        (event.clientX / window.innerWidth - 0.5) *
        viewWidth;

    mouseY =
        (0.5 - event.clientY / window.innerHeight) *
        viewHeight;

    mouseActive = true;
    lastMouseMove = performance.now();
});

// =====================================
// 3. KRISTAL PINK
// =====================================

const crystalGroup = new THREE.Group();
scene.add(crystalGroup);

const crystalMaterial = new THREE.MeshPhysicalMaterial({
    color: "#ff80b5",
    emissive: "#8c1645",
    emissiveIntensity: 0.7,
    metalness: 0.35,
    roughness: 0.18,
    flatShading: true,
    transparent: true,
    opacity: 0.95,
    side: THREE.DoubleSide
});

const crystal = new THREE.Mesh(
    new THREE.IcosahedronGeometry(0.72, 1),
    crystalMaterial
);

crystalGroup.add(crystal);

const innerCrystal = new THREE.Mesh(
    new THREE.OctahedronGeometry(0.4, 0),
    new THREE.MeshBasicMaterial({
        color: "#ffe0ec",
        wireframe: true
    })
);

crystalGroup.add(innerCrystal);


// =====================================
// 4. CAHAYA
// =====================================

scene.add(new THREE.AmbientLight(0xffffff, 2));

const pinkLight = new THREE.PointLight("#ff337f", 45, 30);
pinkLight.position.set(0, 1, 5);
scene.add(pinkLight);

const whiteLight = new THREE.PointLight("#ffffff", 20, 25);
whiteLight.position.set(-4, 3, 5);
scene.add(whiteLight);


// =====================================
// 5. BINTANG LATAR BELAKANG
// =====================================

const starCount = 700;
const starPositions = new Float32Array(starCount * 3);

for (let i = 0; i < starCount; i++) {
    const index = i * 3;

    starPositions[index] = (Math.random() - 0.5) * 25;
    starPositions[index + 1] = (Math.random() - 0.5) * 18;
    starPositions[index + 2] = -3 - Math.random() * 12;
}

const starGeometry = new THREE.BufferGeometry();

starGeometry.setAttribute(
    "position",
    new THREE.BufferAttribute(starPositions, 3)
);

const stars = new THREE.Points(
    starGeometry,
    new THREE.PointsMaterial({
        color: "#ffc5dc",
        size: 0.045,
        transparent: true,
        opacity: 0.8,
        blending: THREE.AdditiveBlending,
        depthWrite: false
    })
);

scene.add(stars);


// =====================================
// 6. PARTIKEL MELAYANG
// =====================================

const dustCount = 250;
const dustPositions = new Float32Array(dustCount * 3);
const dustSpeeds = new Float32Array(dustCount);

for (let i = 0; i < dustCount; i++) {
    const index = i * 3;

    dustPositions[index] = (Math.random() - 0.5) * 18;
    dustPositions[index + 1] = (Math.random() - 0.5) * 14;
    dustPositions[index + 2] = (Math.random() - 0.5) * 7;

    dustSpeeds[i] = 0.005 + Math.random() * 0.012;
}

const dustGeometry = new THREE.BufferGeometry();

dustGeometry.setAttribute(
    "position",
    new THREE.BufferAttribute(dustPositions, 3)
);

const dust = new THREE.Points(
    dustGeometry,
    new THREE.PointsMaterial({
        color: "#ff8db8",
        size: 0.04,
        transparent: true,
        opacity: 0.8,
        blending: THREE.AdditiveBlending,
        depthWrite: false
    })
);

scene.add(dust);


// =====================================
// 7. GERAKAN MENGIKUTI KURSOR
// =====================================

let targetX = 0;
let targetY = 0;
let currentX = 0;
let currentY = 0;

window.addEventListener("pointermove", (event) => {
    targetY =
        ((event.clientX / window.innerWidth) * 2 - 1) * 0.65;

    targetX =
        -((event.clientY / window.innerHeight) * 2 - 1) * 0.4;
});


// =====================================
// 8. ANIMASI UTAMA
// =====================================
const clock = new THREE.Clock();
function animate() {
    requestAnimationFrame(animate);

    const time = clock.getElapsedTime();

    // Jika kursor diam atau meninggalkan layar,
    // hati perlahan pecah kembali.
    const idleTime =
        performance.now() - lastMouseMove;

    if (idleTime > 1800) {
        mouseActive = false;
    }

    const desiredAssembly = mouseActive ? 1 : 0;

    assembly +=
        (desiredAssembly - assembly) *
        (desiredAssembly > assembly ? 0.035 : 0.018);

    // Posisi hati mengikuti kursor.
    heartGroup.position.x +=
        (mouseX - heartGroup.position.x) * 0.045;

    heartGroup.position.y +=
        (mouseY - heartGroup.position.y) * 0.045;

    // Partikel menyatu menjadi hati atau terpecah.
    for (let i = 0; i < particleCount; i++) {
        const index = i * 3;

        for (let axis = 0; axis < 3; axis++) {
            const p = index + axis;

            const target = targetPositions[p];

            // Ketika menyatu, partikel menuju bentuk hati.
            if (assembly > 0.02) {
                positions[p] +=
                    (target - positions[p]) *
                    (0.025 + assembly * 0.09);
            }

            // Ketika pecah, partikel terbang ke luar.
            else {
                velocities[p] +=
                    (Math.random() - 0.5) * 0.012;

                positions[p] += velocities[p];

                // Dorongan ke arah luar dari pusat hati.
                if (axis === 0) {
                    positions[p] +=
                        Math.sign(positions[p] || 1) * 0.012;
                }

                // Batasi kecepatan agar tetap stabil.
                velocities[p] = THREE.MathUtils.clamp(
                    velocities[p], -0.16, 0.16
                );

                // Partikel yang terlalu jauh muncul kembali.
                if (Math.abs(positions[p]) > 16) {
                    positions[p] =
                        (Math.random() - 0.5) * 8;

                    velocities[p] *= -0.3;
                }
            }
        }
    }

    heartGeometry.attributes.position.needsUpdate = true;

    // Detak jantung ketika bentuknya menyatu.
    const beat = Math.pow(
        Math.max(0, Math.sin(time * 2.2)),
        12
    );

    const heartbeat = 1 + beat * 0.055 * assembly;

    heartGroup.scale.setScalar(heartbeat);

    heartGroup.rotation.x =
        Math.sin(time * 0.25) * 0.05;

    heartGroup.rotation.y =
        Math.sin(time * 0.35) * 0.08;

    // Kristal mengikuti posisi hati dan memudar saat pecah.
    crystalGroup.position.x = heartGroup.position.x;
    crystalGroup.position.y =
        heartGroup.position.y + Math.sin(time * 1.4) * 0.12;

    crystalGroup.rotation.x = time * 0.4;
    crystalGroup.rotation.y = time * 0.7;

    crystalMaterial.opacity = 0.95 * assembly;
    innerCrystal.material.opacity = 0.8 * assembly;

    crystalGroup.visible = assembly > 0.03;

    // Partikel latar melayang.
    for (let i = 0; i < dustCount; i++) {
        const index = i * 3;

        dustPositions[index + 1] += dustSpeeds[i];

        if (dustPositions[index + 1] > 7) {
            dustPositions[index + 1] = -7;
        }
    }

    dustGeometry.attributes.position.needsUpdate = true;

    stars.rotation.z = Math.sin(time * 0.08) * 0.025;

    renderer.render(scene, camera);
}

animate();



// =====================================
// 9. MENYESUAIKAN UKURAN LAYAR
// =====================================

window.addEventListener("resize", () => {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();

    renderer.setSize(window.innerWidth, window.innerHeight);

    renderer.setPixelRatio(
        Math.min(window.devicePixelRatio, 1.5)
    );
});
