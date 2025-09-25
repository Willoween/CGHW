/* HW02 – Moving Red Rectangle (size 0.1), arrows move by 0.01 */
import { resizeAspectRatio, /*setupText,*/ updateText } from './util/util.js';
import { Shader, readShaderFile } from './util/shader.js';

const canvas = document.getElementById('glCanvas');
const gl = canvas.getContext('webgl2');
if (!gl) { console.error('WebGL 2 not supported'); throw new Error(); }

// canvas
canvas.width = 600;
canvas.height = 600;
resizeAspectRatio(gl, canvas);
gl.viewport(0, 0, canvas.width, canvas.height);
gl.clearColor(0.0, 0.0, 0.0, 1.0);

// ---------- top-left overlay helper ----------
function setupTextTopLeft(canvas, msg) {
  const div = document.createElement('div');
  div.textContent = msg;
  div.style.position = 'absolute';
  div.style.color = 'white';
  div.style.font = '18px monospace';
  div.style.pointerEvents = 'none';

  const place = () => {
    const r = canvas.getBoundingClientRect();
    // 10px margin from the canvas edge
    div.style.left = `${Math.round(r.left + window.scrollX) + 10}px`;
    div.style.top  = `${Math.round(r.top  + window.scrollY) + 10}px`;
  };

  document.body.appendChild(div);
  place();
  window.addEventListener('resize', place);
  window.addEventListener('scroll', place);
  return div;
}

// State
let shader, vao;
const STEP = 0.01;
const SIDE = 0.2;          // keep your current size; change to 0.1 if your HW requires it
const HALF = SIDE * 0.5;
let offset = [0.0, 0.0];
let infoText;

// Key
function setupKeyboardEvents() {
  window.addEventListener('keydown', (e) => {
    if (e.key === 'ArrowUp')    offset[1] += STEP;
    if (e.key === 'ArrowDown')  offset[1] -= STEP;
    if (e.key === 'ArrowLeft')  offset[0] -= STEP;
    if (e.key === 'ArrowRight') offset[0] += STEP;

    // clamp so the whole square stays inside
    offset[0] = Math.min(1.0 - HALF, Math.max(-1.0 + HALF, offset[0]));
    offset[1] = Math.min(1.0 - HALF, Math.max(-1.0 + HALF, offset[1]));
  });
}

// Buffers
function setupBuffers() {
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

// Render
function render() {
  gl.clear(gl.COLOR_BUFFER_BIT);

  shader.use();
  shader.setVec2('uOffset', offset);

  gl.bindVertexArray(vao);
  gl.drawArrays(gl.TRIANGLE_FAN, 0, 4);

  requestAnimationFrame(render);
}

// Init
async function initShader() {
  const vs = await readShaderFile('./shaders/hw02.vert');
  const fs = await readShaderFile('./shaders/hw02.frag');
  shader = new Shader(gl, vs, fs);
  if (typeof shader.ready === 'function') await shader.ready();
}

async function main() {
  await initShader();

  // show one line at the canvas's top-left and keep a handle for updates
  infoText = setupTextTopLeft(canvas, 'Use arrow keys to move the rectangle');

  setupKeyboardEvents();
  setupBuffers();
  shader.use();

  requestAnimationFrame(render);
}

main().catch(err => {
  console.error(err);
  alert('Initialization failed');
});
