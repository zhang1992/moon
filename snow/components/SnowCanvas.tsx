
import React, { useEffect, useRef } from 'react';
import { Particle } from '../types';

interface SnowCanvasProps {
  active: boolean;
  morphText?: string;
}

/** 
 * --- 视觉风格配置 (针对汉字清晰度优化) ---
 */
const PARTICLE_COUNT = 1800;    // 增加粒子数量以支撑复杂笔画
const SNOW_SPEED_MIN = 0.4;     
const SNOW_SPEED_MAX = 1.6;     
const SNOW_OPACITY = 0.3;       
const TEXT_OPACITY = 0.95;      // 略微提升亮度
const MORPH_SPEED = 0.01;        // 加快聚合速度，让文字更稳
const FADE_SPEED = 0.04;        

const TEXT_Y_OFFSET = -0.22;    
const TEXT_X_OFFSET = 0.18;      
const TEXT_SCALE = 1.72;         

const SnowCanvas: React.FC<SnowCanvasProps> = ({ active, morphText }) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const engineRef = useRef<{
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
    engineRef.current.particles = particles;
  };

  const sampleText = (text: string) => {
    const { width, height, dpr } = engineRef.current;
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

    const particles = engineRef.current.particles;
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
    engineRef.current.isMorphing = true;
  };

  const resize = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const dpr = window.devicePixelRatio || 1;
    const width = window.innerWidth;
    const height = window.innerHeight;
    canvas.width = width * dpr;
    canvas.height = height * dpr;
    canvas.style.width = `${width}px`;
    canvas.style.height = `${height}px`;
    engineRef.current.dpr = dpr;
    engineRef.current.width = canvas.width;
    engineRef.current.height = canvas.height;
    if (morphText) sampleText(morphText);
  };

  const render = (currentTime: number) => {
    const state = engineRef.current;
    const canvas = canvasRef.current;
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

  useEffect(() => {
    initParticles(false);
    resize();
    window.addEventListener('resize', resize);
    return () => window.removeEventListener('resize', resize);
  }, []);

  useEffect(() => {
    if (active) {
      if (!engineRef.current.isRunning) {
        initParticles(true);
        engineRef.current.isRunning = true;
      }
      engineRef.current.targetOpacity = 1;
      engineRef.current.lastTime = performance.now();
      requestAnimationFrame(render);
    } else {
      engineRef.current.targetOpacity = 0;
      engineRef.current.isMorphing = false;
    }
  }, [active]);

  useEffect(() => {
    if (active && morphText) {
      sampleText(morphText);
    } else {
      engineRef.current.isMorphing = false;
      engineRef.current.particles.forEach(p => {
        p.size = p.baseSize!;
        p.tx = undefined;
        p.ty = undefined;
      });
    }
  }, [morphText, active]);

  return <canvas ref={canvasRef} className="fixed inset-0 pointer-events-none z-[9999]" />;
};

export default SnowCanvas;
