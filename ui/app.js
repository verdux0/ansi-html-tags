// =============================
// CONFIGURACIÓN DE COLORES
// =============================
const COLOR_DEFS = [
  { tag: 'black', fg: '#000', sampleChar:'A', textColor:'#fff' },
  { tag: 'red', fg: '#ff4d4d', sampleChar:'R' },
  { tag: 'green', fg: '#4caf50', sampleChar:'G' },
  { tag: 'yellow', fg: '#ffeb3b', sampleChar:'Y' },
  { tag: 'blue', fg: '#2196f3', sampleChar:'B' },
  { tag: 'magenta', fg: '#e040fb', sampleChar:'M' },
  { tag: 'cyan', fg: '#00bcd4', sampleChar:'C' },
  { tag: 'white', fg: '#fafafa', sampleChar:'W', textColor:'#000' },
  { tag: 'brightRed', fg: '#ff1744', sampleChar:'R+' },
  { tag: 'brightGreen', fg: '#00e676', sampleChar:'G+' },
  { tag: 'brightYellow', fg: '#ffff00', sampleChar:'Y+' },
  { tag: 'brightBlue', fg: '#2979ff', sampleChar:'B+' },
  { tag: 'brightMagenta', fg: '#f50057', sampleChar:'M+' },
  { tag: 'brightCyan', fg: '#00e5ff', sampleChar:'C+' },
  { tag: 'brightWhite', fg: '#ffffff', sampleChar:'W+', textColor:'#000' }
];

// Lista de colores soportados por la librería (puedes actualizar dinámicamente)
const SUPPORTED_COLORS = new Set([
  'black','red','green','yellow','blue','magenta','cyan','white',
  'brightRed','brightGreen','brightYellow','brightBlue','brightMagenta','brightCyan','brightWhite'
]);

// =============================
// REFERENCIAS DOM
// =============================
const colorButtonsContainer = document.getElementById('colorButtons');
const visualEditor = document.getElementById('visualEditor');
const codeView = document.getElementById('codeView');
const modeVisualBtn = document.getElementById('modeVisualBtn');
const modeCodeBtn = document.getElementById('modeCodeBtn');
const copyBtn = document.getElementById('copyBtn');
const removeColorBtn = document.getElementById('removeColorBtn');
const clearBtn = document.getElementById('clearBtn');
const undoBtn = document.getElementById('undoBtn');
const redoBtn = document.getElementById('redoBtn');
const exportTxtBtn = document.getElementById('exportTxtBtn');
const toggleThemeBtn = document.getElementById('toggleThemeBtn');
const statusIndicator = document.getElementById('statusIndicator');

let currentMode = 'visual';

// =============================
// UNDO / REDO STACK
// =============================
const historyStack = [];
const redoStack = [];
const MAX_HISTORY = 200;
let suppressHistory = false;

function snapshot() {
  if (currentMode !== 'visual') return;
  if (suppressHistory) return;
  const html = visualEditor.innerHTML;
  if (historyStack.length && historyStack[historyStack.length - 1] === html) return;
  historyStack.push(html);
  if (historyStack.length > MAX_HISTORY) historyStack.shift();
  redoStack.length = 0;
  updateUndoRedoButtons();
}

function restoreFrom(html) {
  suppressHistory = true;
  visualEditor.innerHTML = html;
  suppressHistory = false;
}

function undo() {
  if (historyStack.length < 2) return;
  const current = historyStack.pop();
  redoStack.push(current);
  const prev = historyStack[historyStack.length - 1];
  restoreFrom(prev);
  updateUndoRedoButtons();
}

function redo() {
  if (!redoStack.length) return;
  const next = redoStack.pop();
  historyStack.push(next);
  restoreFrom(next);
  updateUndoRedoButtons();
}

function updateUndoRedoButtons() {
  undoBtn.disabled = historyStack.length < 2;
  redoBtn.disabled = redoStack.length === 0;
}

// =============================
// INICIALIZACIÓN
// =============================
function initColorButtons() {
  COLOR_DEFS.forEach(def => {
    const btn = document.createElement('button');
    btn.className = 'color-btn';
    btn.title = def.tag;
    btn.dataset.tag = def.tag;
    btn.style.background = def.fg;
    if (def.textColor) btn.style.color = def.textColor;
    btn.textContent = def.sampleChar || def.tag.charAt(0).toUpperCase();
    if (!SUPPORTED_COLORS.has(def.tag)) {
      btn.disabled = true;
    } else {
      btn.addEventListener('click', () => {
        applyColorToSelection(def.tag);
      });
    }
    colorButtonsContainer.appendChild(btn);
  });
}

// =============================
// APLICAR / REMOVER COLOR
// =============================
function applyColorToSelection(tag) {
  if (currentMode !== 'visual') return;
  const selection = window.getSelection();
  if (!selection.rangeCount) return;
  const range = selection.getRangeAt(0);
  if (range.collapsed) return;

  const content = range.extractContents();
  const span = document.createElement('span');
  span.dataset.color = tag;
  span.appendChild(content);
  styleSpan(span);
  flattenNestedSpans(span);
  range.insertNode(span);
  selection.removeAllRanges();
  snapshot();
  flashStatus(`Color aplicado: ${tag}`);
}

function styleSpan(span) {
  const def = COLOR_DEFS.find(d => d.tag === span.dataset.color);
  if (!def) return;
  span.style.color = def.fg;
}

function flattenNestedSpans(rootSpan) {
  const nested = rootSpan.querySelectorAll('span[data-color]');
  nested.forEach(ns => {
    while (ns.firstChild) rootSpan.appendChild(ns.firstChild);
    ns.remove();
  });
}

function removeColorFromSelection() {
  if (currentMode !== 'visual') return;
  const sel = window.getSelection();
  if (!sel.rangeCount) return;
  const range = sel.getRangeAt(0);
  if (range.collapsed) return;
  unwrapSpansInRange(range);
  snapshot();
  flashStatus('Color eliminado de selección');
}

function unwrapSpansInRange(range) {
  const contents = range.extractContents();
  contents.querySelectorAll('span[data-color]').forEach(sp => {
    while (sp.firstChild) contents.insertBefore(sp.firstChild, sp);
    sp.remove();
  });
  range.insertNode(contents);
}

// =============================
// CONVERSIÓN VISUAL ↔ CÓDIGO
// =============================
function toCodeString() {
  let result = '';
  function walk(node) {
    if (node.nodeType === Node.TEXT_NODE) {
      result += escapeText(node.textContent);
      return;
    }
    if (node.nodeType === Node.ELEMENT_NODE) {
      if (node.matches('span[data-color]')) {
        const tag = node.dataset.color;
        result += `<${tag}>`;
        node.childNodes.forEach(walk);
        result += `</${tag}>`;
      } else {
        node.childNodes.forEach(walk);
        if (node.tagName === 'BR') result += '\n';
        if (node.tagName === 'P') result += '\n';
      }
    }
  }
  visualEditor.childNodes.forEach(walk);
  return result.replace(/\n{2,}/g, '\n').trim();
}

function escapeText(text) {
  return text.replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;');
}

function fromCodeString(code) {
  visualEditor.innerHTML = '';
  const tokens = tokenizeCode(code);
  const frag = document.createDocumentFragment();
  const stack = [];
  tokens.forEach(tok => {
    if (tok.type === 'open') {
      const span = document.createElement('span');
      span.dataset.color = tok.tag;
      styleSpan(span);
      if (stack.length === 0) frag.appendChild(span);
      else stack[stack.length - 1].appendChild(span);
      stack.push(span);
    } else if (tok.type === 'close') {
      if (stack.length && stack[stack.length - 1].dataset.color === tok.tag) {
        stack.pop();
      }
    } else if (tok.type === 'text') {
      const tn = document.createTextNode(tok.value);
      if (stack.length) stack[stack.length - 1].appendChild(tn);
      else frag.appendChild(tn);
    } else if (tok.type === 'newline') {
      frag.appendChild(document.createElement('br'));
    }
  });
  visualEditor.appendChild(frag);
  snapshot();
}

function tokenizeCode(code) {
  const regex = /<(\/?)([a-zA-Z][a-zA-Z0-9]*)>|(\r?\n)|([^<\r\n]+)/g;
  const tokens = [];
  let m;
  while ((m = regex.exec(code)) !== null) {
    if (m[1] === '' && m[2]) tokens.push({ type:'open', tag:m[2] });
    else if (m[1] === '/' && m[2]) tokens.push({ type:'close', tag:m[2] });
    else if (m[3]) tokens.push({ type:'newline' });
    else if (m[4]) tokens.push({ type:'text', value:m[4] });
  }
  return tokens;
}

// =============================
// MODO
// =============================
function switchMode(mode) {
  if (mode === currentMode) return;
  currentMode = mode;
  if (mode === 'code') {
    const code = toCodeString();
    codeView.value = code;
    codeView.style.display = 'block';
    visualEditor.style.display = 'none';
    copyBtn.disabled = false;
    modeCodeBtn.classList.add('active');
    modeVisualBtn.classList.remove('active');
    flashStatus('Modo Código');
  } else {
    fromCodeString(codeView.value);
    visualEditor.style.display = 'block';
    codeView.style.display = 'none';
    copyBtn.disabled = true;
    modeVisualBtn.classList.add('active');
    modeCodeBtn.classList.remove('active');
    flashStatus('Modo Visual');
  }
}

// =============================
// EXPORT .TXT
// =============================
function exportTxt() {
  let content;
  let filename;
  if (currentMode === 'code') {
    content = codeView.value;
    filename = 'banner-tags.txt';
  } else {
    content = toCodeString();
    filename = 'banner-tags.txt';
  }
  const blob = new Blob([content], { type:'text/plain;charset=utf-8' });
  const a = document.createElement('a');
  a.href = URL.createObjectURL(blob);
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  setTimeout(() => {
    URL.revokeObjectURL(a.href);
    a.remove();
  }, 250);
  flashStatus('Exportado .txt');
}

// =============================
// COPIAR
// =============================
function copyCode() {
  if (currentMode !== 'code') return;
  navigator.clipboard.writeText(codeView.value)
    .then(() => {
      copyBtn.textContent = 'Copiado!';
      flashStatus('Código copiado');
      setTimeout(() => copyBtn.textContent = 'Copiar código', 1500);
    })
    .catch(() => {
      copyBtn.textContent = 'Error';
      flashStatus('Error al copiar', true);
      setTimeout(() => copyBtn.textContent = 'Copiar código', 1500);
    });
}

// =============================
// LIMPIAR
// =============================
function clearEditor() {
  if (currentMode === 'visual') {
    visualEditor.innerHTML = '';
    snapshot();
  } else {
    codeView.value = '';
  }
  flashStatus('Contenido limpiado');
}

// =============================
// TEMA
// =============================
function toggleTheme() {
  const body = document.body;
  if (body.classList.contains('theme-dark')) {
    body.classList.remove('theme-dark');
    body.classList.add('theme-light');
    flashStatus('Tema claro');
  } else {
    body.classList.remove('theme-light');
    body.classList.add('theme-dark');
    flashStatus('Tema oscuro');
  }
}

// =============================
// STATUS / FEEDBACK
// =============================
let statusTimeout = null;
function flashStatus(msg, isError=false) {
  statusIndicator.textContent = msg;
  statusIndicator.style.borderColor = isError ? '#ff3d00' : 'var(--border)';
  statusIndicator.style.color = isError ? '#ff3d00' : 'inherit';
  clearTimeout(statusTimeout);
  statusTimeout = setTimeout(() => {
    statusIndicator.textContent = 'Listo';
    statusIndicator.style.color = 'inherit';
  }, 2500);
}

// =============================
// EVENTOS
// =============================
modeVisualBtn.addEventListener('click', () => switchMode('visual'));
modeCodeBtn.addEventListener('click', () => switchMode('code'));
copyBtn.addEventListener('click', copyCode);
removeColorBtn.addEventListener('click', removeColorFromSelection);
clearBtn.addEventListener('click', clearEditor);
undoBtn.addEventListener('click', undo);
redoBtn.addEventListener('click', redo);
exportTxtBtn.addEventListener('click', exportTxt);
toggleThemeBtn.addEventListener('click', toggleTheme);

// Capturamos cambios de texto para history (input batch)
let inputDebounce = null;
visualEditor.addEventListener('input', () => {
  clearTimeout(inputDebounce);
  inputDebounce = setTimeout(() => {
    snapshot();
  }, 250);
});

// Pegar texto con etiquetas en modo visual
visualEditor.addEventListener('paste', e => {
  const text = (e.clipboardData || window.clipboardData).getData('text');
  if (/<[a-zA-Z]+>/.test(text)) {
    e.preventDefault();
    fromCodeString(text);
    flashStatus('Etiquetas pegadas convertidas a Visual');
  }
});

// Atajos teclado
document.addEventListener('keydown', (e) => {
  if (e.ctrlKey && e.key === 'z' && !e.shiftKey) {
    e.preventDefault();
    if (currentMode === 'visual') undo();
  } else if ((e.ctrlKey && e.key === 'y') || (e.ctrlKey && e.shiftKey && e.key === 'Z')) {
    e.preventDefault();
    if (currentMode === 'visual') redo();
  }
});

// =============================
// INICIALIZAR
// =============================
function init() {
  initColorButtons();
  snapshot(); // estado inicial
}
init();

// =============================
// API PÚBLICA (Opcional para integrar con librería)
// =============================
// window.getBannerTags = () => toCodeString();
// window.setBannerTags = (code) => { fromCodeString(code); };
// window.setSupportedColors = (arr) => {
//   const set = new Set(arr);
//   SUPPORTED_COLORS.clear();
//   arr.forEach(c => SUPPORTED_COLORS.add(c));
//   // Actualizar botones
//   [...colorButtonsContainer.children].forEach(btn => {
//     const tag = btn.dataset.tag;
//     if (!set.has(tag)) {
//       btn.disabled = true;
//     } else {
//       btn.disabled = false;
//     }
//   });
// };