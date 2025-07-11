const canvas = document.getElementById('hydra-canvas');

const hydra = new Hydra({
    canvas: canvas,
    detectAudio: false,
    enableStreamCapture: false
});

let mouse = { x: 0.5, y: 0.5 };

// Track mouse position as normalized (0-1)
window.addEventListener('mousemove', e => {
    const rect = canvas.getBoundingClientRect();
    mouse.x = (e.clientX - rect.left) / rect.width - 0.5;
    mouse.y = (e.clientY - rect.top) / rect.height - 0.5;
});


shape([4,5,6].fast(0.1),0.01,0.5)
.color(0.2,0.4,0.3)
.modulate(voronoi(15,1,10))
.out(o1)

src(o1).modulate(
    noise(8).mask(
        shape(16, 0, 0.4).brightness(1)
        .scroll(() => -mouse.x, () => -mouse.y)
    ))

    .modulate(
    noise(8).mask(
        shape(16, 0, 0.2).brightness(1)
        .scroll(() => -mouse.x, () => -mouse.y)
    ))
    .out()

// Optional but recommended: handle resizing too
function updateResolution() {
    const scale = window.devicePixelRatio || 1;
    const rect = canvas.getBoundingClientRect();
    hydra.setResolution(rect.width * scale, rect.height * scale);
}

updateResolution();
window.addEventListener('resize', updateResolution);
