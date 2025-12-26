<template>
  <canvas ref="canvasRef" class="fixed inset-0 pointer-events-none z-[9999]" />
</template>

<script setup lang="ts">
import { ref, watch, onMounted, onUnmounted } from 'vue';
import { Particle } from '../types';

const props = defineProps<{
  active: boolean;
  morphText?: string;
}>();

/** 
 * --- 视觉风格配置 (针对汉字清晰度优化) ---
 */
const PARTICLE_COUNT = 1800;    // 增加粒子数量以支撑复杂笔画
const SNOW_SPEED_MIN = 0.4;     
const SNOW_SPEED_MAX = 1.6;     
const SNOW_OPACITY = 0.3;       
const TEXT_OPACITY = 0.95;      // 略微提升亮度
const MORPH_SPEED = 0.05;       // 聚合速度（减小值会让聚合更慢更平滑）
const FADE_SPEED = 0.04;        

// 文字位置配置（相对于屏幕中心的偏移量，0-1之间）
// TEXT_Y_OFFSET: 垂直位置偏移
//   - 负值：向上移动（如 -0.22 表示向上移动屏幕高度的 22%）
//   - 正值：向下移动
//   示例：-0.15（更靠近顶部），-0.3（更远离顶部）
const TEXT_Y_OFFSET = -0.29;    

// TEXT_X_OFFSET: 水平位置偏移
//   - 正值：向右移动（如 0.18 表示向右移动屏幕宽度的 18%）
//   - 负值：向左移动
//   示例：0.25（更靠右），0.1（更靠左）
const TEXT_X_OFFSET = 0.24;      

// 文字大小配置
// TEXT_SCALE: 字体大小倍数
//   - 增大值：文字更大（如 2.0）
//   - 减小值：文字更小（如 1.5）
//   基础字体大小 = Math.min(屏幕宽度 / 8, 60) * TEXT_SCALE
const TEXT_SCALE = 1.3;         

const canvasRef = ref<HTMLCanvasElement | null>(null);
const engineRef = ref<{
  particles: Particle[];
  isRunning: boolean;
  targetOpacity: number;
  currentOpacity: number;
  lastTime: number;
  width: number;
  height: number;
  dpr: number;
  isMorphing: boolean;
}>({
  particles: [],
  isRunning: false,
  targetOpacity: 0,
  currentOpacity: 0,
  lastTime: 0,
  width: 0,
  height: 0,
  dpr: 1,
  isMorphing: false,
});

const initParticles = (startingFromTop: boolean = false) => {
  const particles: Particle[] = [];
  for (let i = 0; i < PARTICLE_COUNT; i++) {
    const size = 0.4 + Math.random() * 1.6; 
    particles.push({
      x: Math.random(),
      y: startingFromTop ? -Math.random() * 0.8 : Math.random(),
      vx: (Math.random() - 0.5) * 0.1,
      vy: (SNOW_SPEED_MIN + Math.random() * (SNOW_SPEED_MAX - SNOW_SPEED_MIN)) / 3,
      freqx: 0.1 + Math.random() * 1.0,
      freqy: 0.1 + Math.random() * 1.0,
      size: size,
      phasex: Math.random() * 2 * Math.PI,
      phasey: Math.random() * 2 * Math.PI,
      baseSize: size,
    });
  }
  engineRef.value.particles = particles;
};

const sampleText = (text: string) => {
  const { width, height, dpr } = engineRef.value;
  const tempCanvas = document.createElement('canvas');
  const tempCtx = tempCanvas.getContext('2d');
  if (!tempCtx) return;

  tempCanvas.width = width;
  tempCanvas.height = height;

  // 针对中文字符优化的字体设置
  const fontSize = Math.min(width / 8, 60) * TEXT_SCALE;
  tempCtx.font = `900 ${fontSize}px "PingFang SC", "Microsoft YaHei", "Heiti SC", "Comic Sans MS", sans-serif`;
  tempCtx.textAlign = 'center';
  tempCtx.textBaseline = 'middle';
  tempCtx.fillStyle = 'white';
  
  let lines: string[] = [];
  if (text.includes(' to ')) {
    const parts = text.split(' to ');
    lines = ['Merry Christmas', `to ${parts[1]}`];
  } else {
    lines = [text];
  }

  const centerX = (width / 2) + (width * TEXT_X_OFFSET);
  const centerY = (height / 2) + (height * TEXT_Y_OFFSET);

  lines.forEach((line, i) => {
    // 增加行间距，防止中文字符和英文字符重叠
    const lineY = centerY + (i - (lines.length - 1) / 2) * fontSize * 1.4;
    tempCtx.fillText(line, centerX, lineY);
  });

  const imageData = tempCtx.getImageData(0, 0, width, height).data;
  const points: { x: number; y: number }[] = [];
  
  // 缩小步进值 (step)，以捕获汉字精细笔画
  const step = Math.max(1, Math.floor(dpr * 1.8)); 

  for (let y = 0; y < height; y += step) {
    for (let x = 0; x < width; x += step) {
      const index = (y * width + x) * 4;
      if (imageData[index + 3] > 120) {
        // 减小随机抖动，保证笔画边缘清晰
        const jitterX = (Math.random() - 0.5) * 0.0015;
        const jitterY = (Math.random() - 0.5) * 0.0015;
        points.push({ x: (x / width) + jitterX, y: (y / height) + jitterY });
      }
    }
  }

  // 打乱采样点
  for (let i = points.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [points[i], points[j]] = [points[j], points[i]];
  }

  const particles = engineRef.value.particles;
  for (let i = 0; i < particles.length; i++) {
    const p = particles[i];
    if (i < points.length) {
      p.tx = points[i].x;
      p.ty = points[i].y;
      // 适当控制文字粒子大小，不要波动太大，否则中文字笔画会变糊
      p.size = (1.0 + Math.random() * 0.8) * dpr; 
    } else {
      p.tx = undefined;
      p.ty = undefined;
      p.size = p.baseSize!;
    }
  }
  engineRef.value.isMorphing = true;
};

const resize = () => {
  const canvas = canvasRef.value;
  if (!canvas) return;
  const dpr = window.devicePixelRatio || 1;
  const width = window.innerWidth;
  const height = window.innerHeight;
  canvas.width = width * dpr;
  canvas.height = height * dpr;
  canvas.style.width = `${width}px`;
  canvas.style.height = `${height}px`;
  engineRef.value.dpr = dpr;
  engineRef.value.width = canvas.width;
  engineRef.value.height = canvas.height;
  if (props.morphText) sampleText(props.morphText);
};

const render = (currentTime: number) => {
  const state = engineRef.value;
  const canvas = canvasRef.value;
  if (!canvas) return;
  const ctx = canvas.getContext('2d');
  if (!ctx) return;

  const shouldRender = (state.currentOpacity > 0.001) || (state.targetOpacity > 0);
  if (!shouldRender) {
    state.isRunning = false;
    ctx.clearRect(0, 0, state.width, state.height);
    return;
  }

  state.currentOpacity += (state.targetOpacity - state.currentOpacity) * FADE_SPEED;
  ctx.globalAlpha = state.currentOpacity;

  const dt = state.lastTime === 0 ? 1 : (currentTime - state.lastTime) / 16;
  state.lastTime = currentTime;
  
  const w = state.width;
  const h = state.height;

  ctx.clearRect(0, 0, w, h);

  for (const f of state.particles) {
    if (state.isMorphing && f.tx !== undefined && f.ty !== undefined) {
      f.x += (f.tx - f.x) * MORPH_SPEED * dt;
      f.y += (f.ty - f.y) * MORPH_SPEED * dt;
      
      const drawX = f.x * w;
      const drawY = f.y * h;

      ctx.fillStyle = `rgba(255, 255, 255, ${TEXT_OPACITY})`;
      ctx.beginPath();
      ctx.arc(drawX, drawY, f.size, 0, 2 * Math.PI);
      ctx.fill();
    } else {
      const k = 2 * f.vx / f.size / w;
      const l = 2 * f.vy / f.size / h;
      const xOsc = (w / 150) * Math.sin(f.freqx * (currentTime / 1000) + f.phasex);
      
      f.x += k * dt;
      f.y += l * dt;
      
      if (f.x < -0.1) f.x += 1.2;
      if (f.x > 1.1) f.x -= 1.2;
      if (f.y > 1.1) {
        f.y = -0.05;
        f.x = Math.random();
      }

      const drawX = f.x * w + xOsc;
      const drawY = f.y * h;

      ctx.fillStyle = `rgba(255, 255, 255, ${SNOW_OPACITY})`;
      ctx.beginPath();
      ctx.arc(drawX, drawY, f.size * state.dpr, 0, 2 * Math.PI);
      ctx.fill();
    }
  }

  requestAnimationFrame(render);
};

onMounted(() => {
  initParticles(false);
  resize();
  window.addEventListener('resize', resize);
});

onUnmounted(() => {
  window.removeEventListener('resize', resize);
});

watch(() => props.active, (active) => {
  if (active) {
    // 每次激活时都重新初始化粒子，确保从初始状态开始
    initParticles(true);
    // 清除之前的聚合状态
    engineRef.value.isMorphing = false;
    engineRef.value.particles.forEach(p => {
      p.tx = undefined;
      p.ty = undefined;
      p.size = p.baseSize!;
    });
    engineRef.value.isRunning = true;
    engineRef.value.targetOpacity = 1;
    engineRef.value.lastTime = performance.now();
    requestAnimationFrame(render);
  } else {
    engineRef.value.targetOpacity = 0;
    engineRef.value.isMorphing = false;
    // 停止时也清除聚合状态
    engineRef.value.particles.forEach(p => {
      p.tx = undefined;
      p.ty = undefined;
      p.size = p.baseSize!;
    });
  }
}, { immediate: true });

watch(() => [props.morphText, props.active], ([morphText, active]) => {
  if (active && morphText) {
    sampleText(morphText);
  } else {
    engineRef.value.isMorphing = false;
    engineRef.value.particles.forEach(p => {
      p.size = p.baseSize!;
      p.tx = undefined;
      p.ty = undefined;
    });
  }
});
</script>

