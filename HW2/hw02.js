/* HW02 – Moving Red Rectangle (size 0.1), arrows move by 0.01 */
import { resizeAspectRatio, setupText, updateText } from './util/util.js';
import { Shader, readShaderFile } from './util/shader.js';

const canvas = document.getElementById('glCanvas');
const gl = canvas.getContext('webgl2');
if (!gl) { console.error('WebGL 2 not supported'); throw new Error(); }

// 1) canvas <= 600x600, black bg
canvas.width = 600;
canvas.height = 600;
resizeAspectRatio(gl, canvas);
gl.viewport(0, 0, canvas.width, canvas.height);
gl.clearColor(0.0, 0.0, 0.0, 1.0);

//State
let shader, vao;
const STEP = 0.01;            // movement per key press
const SIDE = 0.2;             // square side length (NDC units)
const HALF = SIDE * 0.5;      // half-side for clamping
let offset = [0.0, 0.0];      // starts centered
let infoText;                 // overlay

//Key
function setupKeyboardEvents() {
  window.addEventListener('keydown', (e) => {
    if (e.key === 'ArrowUp')    offset[1] += STEP;
    if (e.key === 'ArrowDown')  offset[1] -= STEP;
    if (e.key === 'ArrowLeft')  offset[0] -= STEP;
    if (e.key === 'ArrowRight') offset[0] += STEP;

    // 4) keep the whole square inside NDC [-1,1] using half-size margin
    offset[0] = Math.min(1.0 - HALF, Math.max(-1.0 + HALF, offset[0]));
    offset[1] = Math.min(1.0 - HALF, Math.max(-1.0 + HALF, offset[1]));

    updateText(infoText, `Use arrow keys to move the rectangle (offset ${offset[0].toFixed(2)}, ${offset[1].toFixed(2)})`);
  });
}

// ---------------- Buffers (TRIANGLE_FAN, no index/EBO) ----------------
function setupBuffers() {
  // 5) TRIANGLE_FAN with 4 vertices makes a rectangle (square) of side 0.1
  // centered at origin; it will be moved by uOffset.
  const verts = new Float32Array([
    -HALF, -HALF,
     HALF, -HALF,
     HALF,  HALF,
    -HALF,  HALF,
  ]);

  vao = gl.createVertexArray();
  gl.bindVertexArray(vao);

  const vbo = gl.createBuffer();
  gl.bindBuffer(gl.ARRAY_BUFFER, vbo);
  gl.bufferData(gl.ARRAY_BUFFER, verts, gl.STATIC_DRAW);

  shader.setAttribPointer('aPos', 2, gl.FLOAT, false, 0, 0);
}

// ---------------- Render ----------------
function render() {
  gl.clear(gl.COLOR_BUFFER_BIT);

  shader.use();
  shader.setVec2('uOffset', offset);

  gl.bindVertexArray(vao);
  gl.drawArrays(gl.TRIANGLE_FAN, 0, 4);  // 6) primitive: TRIANGLE_FAN

  requestAnimationFrame(render);
}

// ---------------- Init ----------------
async function initShader() {
  // 6) shaders are in separate files
  const vs = await readShaderFile('./shaders/hw02.vert');
  const fs = await readShaderFile('./shaders/hw02.frag');
  shader = new Shader(gl, vs, fs);
  if (typeof shader.ready === 'function') await shader.ready();
}

async function main() {
  await initShader();

  // 7) overlay message on canvas
  setupText(canvas, 'Use arrow keys to move the rectangle', 1);

  setupKeyboardEvents();
  setupBuffers();
  shader.use();

  requestAnimationFrame(render);
}

main().catch(err => {
  console.error(err);
  alert('Initialization failed');
});
