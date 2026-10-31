import * as THREE from
"https://cdn.jsdelivr.net/npm/three@0.180.0/build/three.module.js";

// ==================================
// 1. SCENE DAN CAMERA
// ==================================

const scene = new THREE.Scene();

scene.background = new THREE.Color(0x080516);

const camera = new THREE.OrthographicCamera(
    -window.innerWidth / 2,
    window.innerWidth / 2,
    window.innerHeight / 2,
    -window.innerHeight / 2,
    0.1,
    1000
);

camera.position.z = 100;

// ==================================
// 2. RENDERER
// ==================================

const renderer = new THREE.WebGLRenderer({
    antialias: true,
    alpha: false
});

renderer.setSize(window.innerWidth, window.innerHeight);

renderer.setPixelRatio(
    Math.min(window.devicePixelRatio, 2)
);

renderer.toneMapping = THREE.ACESFilmicToneMapping;

document.getElementById("scene").appendChild(
    renderer.domElement
);

// ==================================
// 3. BACKGROUND BINTANG ANGKASA
// ==================================

const backgroundCount = 1000;

const backgroundPositions = new Float32Array(
    backgroundCount * 3
);

for (let i = 0; i < backgroundCount; i++) {

    backgroundPositions[i * 3] =
        (Math.random() - 0.5) * window.innerWidth;

    backgroundPositions[i * 3 + 1] =
        (Math.random() - 0.5) * window.innerHeight;

    backgroundPositions[i * 3 + 2] = -20;
}

const backgroundGeometry = new THREE.BufferGeometry();

backgroundGeometry.setAttribute(
    "position",
    new THREE.BufferAttribute(backgroundPositions, 3)
);

const backgroundMaterial = new THREE.PointsMaterial({
    color: 0xffffff,
    size: 2,
    transparent: true,
    opacity: 0.8
});

const backgroundStars = new THREE.Points(
    backgroundGeometry,
    backgroundMaterial
);

scene.add(backgroundStars);

// ==================================
// 4. BINTANG YANG MENGIKUTI KURSOR
// ==================================

const starCanvas = document.createElement("canvas");

starCanvas.width = 128;
starCanvas.height = 128;

const ctx = starCanvas.getContext("2d");

function drawStar() {

    const center = 64;
    const outer = 58;
    const inner = 24;

    ctx.clearRect(0, 0, 128, 128);

    ctx.beginPath();

    for (let i = 0; i < 10; i++) {

        const angle = -Math.PI / 2 + i * Math.PI / 5;

        const radius = i % 2 === 0 ? outer : inner;

        const x = center + Math.cos(angle) * radius;
        const y = center + Math.sin(angle) * radius;

        if (i === 0) ctx.moveTo(x, y);
        else ctx.lineTo(x, y);
    }

    ctx.closePath();
    ctx.fillStyle = "white";
    ctx.shadowColor = "white";
    ctx.shadowBlur = 15;
    ctx.fill();
}

drawStar();

const starTexture = new THREE.CanvasTexture(starCanvas);

const colors = [
    0xffa6d5,
    0xd8a5ff,
    0xffffff,
    0xffe6a6
];

const maxStars = 250;
const stars = [];

for (let i = 0; i < maxStars; i++) {

    const material = new THREE.SpriteMaterial({
        map: starTexture,
        color: colors[
            Math.floor(Math.random() * colors.length)
        ],
        transparent: true,
        opacity: 0,
        depthWrite: false
    });

    const sprite = new THREE.Sprite(material);

    sprite.visible = false;

    scene.add(sprite);

    stars.push({
        sprite,
        life: 0,
        maxLife: 2,
        vx: 0,
        vy: 0,
        rotationSpeed: 0
    });
}

let starIndex = 0;
let lastX = null;
let lastY = null;

function createStar(x, y) {

    const particle = stars[starIndex];

    starIndex = (starIndex + 1) % maxStars;

    particle.sprite.position.set(x, y, 0);

    const isMobile = window.innerWidth <= 600;

    const size = isMobile
        ? 20 + Math.random() * 15
        : 30 + Math.random() * 25;

    particle.sprite.scale.set(size, size, 1);

    particle.sprite.material.opacity = 1;
    particle.sprite.visible = true;

    particle.life = 0;
    particle.maxLife = 1.8 + Math.random() * 1.5;

    particle.vx = (Math.random() - 0.5) * 0.8;
    particle.vy = (Math.random() - 0.5) * 0.8;

    particle.rotationSpeed =
        (Math.random() - 0.5) * 0.08;
}

window.addEventListener("pointermove", (event) => {

    const x = event.clientX - window.innerWidth / 2;
    const y = window.innerHeight / 2 - event.clientY;

    if (lastX !== null) {

        const dx = x - lastX;
        const dy = y - lastY;

        const distance = Math.sqrt(dx * dx + dy * dy);

        const amount = Math.max(
            1,
            Math.ceil(distance / 9)
        );

        for (let i = 0; i < amount; i++) {

            const progress = (i + 1) / amount;

            createStar(
                lastX + dx * progress,
                lastY + dy * progress
            );
        }

    } else {

        createStar(x, y);
    }

    lastX = x;
    lastY = y;
});

// ==================================
// 5. MEMBUAT HATI KRISTAL 3D
// ==================================

const heartShape = new THREE.Shape();

heartShape.moveTo(0, 0.4);

heartShape.bezierCurveTo(
    -0.8, 1.2,
    -2, 1.1,
    -2, 0
);

heartShape.bezierCurveTo(
    -2, -1,
    -0.8, -1.8,
    0, -2.6
);

heartShape.bezierCurveTo(
    0.8, -1.8,
    2, -1,
    2, 0
);

heartShape.bezierCurveTo(
    2, 1.1,
    0.8, 1.2,
    0, 0.4
);

const heartGeometry = new THREE.ExtrudeGeometry(
    heartShape,
    {
        depth: 0.7,
        bevelEnabled: true,
        bevelSegments: 5,
        steps: 2,
        bevelSize: 0.15,
        bevelThickness: 0.15
    }
);

heartGeometry.center();

const heartMaterial = new THREE.MeshPhysicalMaterial({
    color: 0x9b59ff,
    emissive: 0x4b168f,
    emissiveIntensity: 0.65,

    metalness: 0.45,
    roughness: 0.12,

    transparent: true,
    opacity: 1,

    clearcoat: 1,
    clearcoatRoughness: 0.05
});

const crystalHeart = new THREE.Group();

const heartMesh = new THREE.Mesh(
    heartGeometry,
    heartMaterial
);

crystalHeart.add(heartMesh);

crystalHeart.scale.set(24, 24, 24);

crystalHeart.visible = false;

scene.add(crystalHeart);

// Cahaya kristal

const pinkLight = new THREE.PointLight(
    0xd58aff,
    8,
    180
);

pinkLight.position.set(0, 0, 35);

crystalHeart.add(pinkLight);

const whiteLight = new THREE.PointLight(
    0xffffff,
    5,
    120
);

whiteLight.position.set(-20, 25, 30);

crystalHeart.add(whiteLight);

const purpleLight = new THREE.PointLight(
    0x742bff,
    7,
    150
);

purpleLight.position.set(20, -15, 20);

crystalHeart.add(purpleLight);

// ==================================
// 6. GERAKAN HATI SETIAP 20 DETIK
// ==================================

let nextHeartTime = 10;
let heartMoving = false;
let heartProgress = 0;

const heartDuration = 5;

function startHeart() {

    heartMoving = true;
    heartProgress = 0;

    crystalHeart.visible = true;

    const isMobile = window.innerWidth <= 600;

    crystalHeart.scale.setScalar(
        isMobile ? 17 : 24
    );

    crystalHeart.position.x =
        -window.innerWidth / 2 - 100;

    crystalHeart.position.y =
        (Math.random() - 0.5) *
        window.innerHeight * 0.55;
}

// ==================================
// 7. TULISAN
// ==================================

const message = document.createElement("div");

message.innerHTML =
    "You're precious<br>and keep shining like them.";

message.style.position = "absolute";
message.style.top = "50%";
message.style.left = "50%";
message.style.transform = "translate(-50%, -50%)";
message.style.width = "90%";
message.style.textAlign = "center";

message.style.color = "#ffe5fa";
message.style.fontFamily = "Georgia, serif";
message.style.fontSize =
    window.innerWidth <= 600 ? "23px" : "34px";

message.style.fontStyle = "italic";
message.style.letterSpacing = "2px";
message.style.lineHeight = "1.7";

message.style.textShadow =
    "0 0 10px #ff9de2, 0 0 25px #a76bff";

message.style.pointerEvents = "none";
message.style.zIndex = "2";

document.getElementById("scene").appendChild(message);

// ==================================
// 8. ANIMASI UTAMA
// ==================================

const clock = new THREE.Clock();

function animate() {

    requestAnimationFrame(animate);

    const delta = Math.min(clock.getDelta(), 0.05);

    const time = clock.elapsedTime;

    // Bintang background berkelap-kelip

    backgroundMaterial.opacity =
        0.65 + Math.sin(time * 1.5) * 0.2;

    backgroundStars.rotation.z =
        Math.sin(time * 0.03) * 0.01;

    // Jejak bintang kursor

    stars.forEach((particle) => {

        if (!particle.sprite.visible) return;

        particle.life += delta;

        const progress =
            particle.life / particle.maxLife;

        particle.sprite.material.opacity =
            Math.max(0, 1 - progress);

        particle.sprite.position.x += particle.vx;
        particle.sprite.position.y += particle.vy;

        particle.sprite.material.rotation +=
            particle.rotationSpeed;

        const scale = particle.sprite.scale.x;

        const newScale = Math.max(
            0,
            scale * (1 - delta * 0.25)
        );

        particle.sprite.scale.set(
            newScale,
            newScale,
            1
        );

        if (progress >= 1) {
            particle.sprite.visible = false;
        }
    });

    // Hati kristal melintas setiap 20 detik

    if (time >= nextHeartTime && !heartMoving) {

        startHeart();

        nextHeartTime += 10;
    }

    if (heartMoving) {

        heartProgress += delta / heartDuration;

        const progress = Math.min(heartProgress, 1);

        const startX = -window.innerWidth / 2 - 100;
        const endX = window.innerWidth / 2 + 100;

        crystalHeart.position.x =
            THREE.MathUtils.lerp(startX, endX, progress);

        crystalHeart.rotation.y = time * 1.8;
        crystalHeart.rotation.x =
            Math.sin(time * 2) * 0.2;

        crystalHeart.rotation.z =
            Math.sin(time * 1.5) * 0.15;

        crystalHeart.position.y +=
            Math.sin(time * 2) * 0.15;

        if (progress >= 1) {

            heartMoving = false;

            crystalHeart.visible = false;
        }
    }

    renderer.render(scene, camera);
}

animate();

// ==================================
// 9. RESPONSIVE
// ==================================

window.addEventListener("resize", () => {

    camera.left = -window.innerWidth / 2;
    camera.right = window.innerWidth / 2;

    camera.top = window.innerHeight / 2;
    camera.bottom = -window.innerHeight / 2;

    camera.updateProjectionMatrix();

    renderer.setSize(
        window.innerWidth,
        window.innerHeight
    );

    message.style.fontSize =
        window.innerWidth <= 600 ? "23px" : "34px";
});