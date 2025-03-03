<template>
  <div
    ref="canvasContainer"
    class="firework-container"
    @click="triggerFirework"
  >
    <canvas ref="backgroundCanvas" class="background-canvas"></canvas>
    <!-- 烟花 Canvas -->
    <canvas ref="fireworkCanvas" class="firework-canvas"></canvas>
    <!-- 文本 -->
    <div ref="typingContainer" class="typing-container">
      <span>{{ typedText }}</span>
    </div>

    <div ref="typingContainer2" class="typing-container2">
      <div class="column" ref="column2"></div>
      <div class="column column-offset" ref="column1"></div>
    </div>
  </div>
</template>
  
  <script>
import { Fireworks } from "fireworks-js";
import { onBeforeUnmount, onMounted, ref } from "vue";

export default {
  name: "FireworkSky",
  setup() {
    const canvasContainer = ref(null);
    const backgroundCanvas = ref(null);
    const fireworkCanvas = ref(null);
    const typedText = ref(""); // 打字机效果的文字
    const typingContainer = ref(null); // 引用文本容器

    // const typeWriter = (text, index = 0) => {
    //   if (index < text.length) {
    //     typedText.value += text[index]; // 每次增加一个字符
    //     setTimeout(() => typeWriter(text, index + 1), 300); // 控制打字速度
    //   }
    // };
    const typeWriter = (text, index = 0, callback = null) => {
      if (index < text.length) {
        typedText.value += text[index]; // 每次增加一个字符
        setTimeout(() => typeWriter(text, index + 1, callback), 300); // 控制打字速度
      } else if (callback) {
        setTimeout(callback, 5000); // 完成后 5 秒调用回调
      }
    };

    // 打字机函数：打印单列内容
    // 打字机函数：逐个字从上到下打印
    const typeWriter2 = (text, columnRef, index = 0, callback = null) => {
      if (index < text.length) {
        const span = document.createElement("span");
        span.innerText = text[index];
        columnRef.value.appendChild(span);
        span.classList.add("glowing-text"); // 添加光晕效果类
        setTimeout(
          () => typeWriter2(text, columnRef, index + 1, callback),
          500
        ); // 控制打字速度
      } else if (callback) {
        callback(); // 打印完成后执行回调
      }
    };

    const typingContainer2 = ref(null);
    const column1 = ref(null); // 第一列
    const column2 = ref(null); // 第二列

    const textColumns = [
      "何事下凡来人间", // 第二列内容
      "本是天上月亮仙", // 第一列内容
    ];

    // 打字机函数：打印单列内容
    let isFireworkTriggered = false;
    const triggerFirework = () => {
      if (isFireworkTriggered) {
        return; // 如果已经触发过，直接返回，防止重复调用
      }

      isFireworkTriggered = true; // 第一次调用时设置为 true
      const firework = new Fireworks(fireworkCanvas.value, {
        x: window.innerWidth / 2,
        y: window.innerHeight - 50,
        width: 0,
        height: 0,
        autoresize: true,
        hue: { min: 0, max: 360 },
        acceleration: 1,
        brightness: { min: 50, max: 100 },
        decay: { min: 0.005, max: 0.05 },
        delay: { min: 10, max: 100 },
        explosion: 5,
        flickering: 50,
        intensity: 20,
        friction: 0.97,
        gravity: 1.5,
        opacity: 0.5,
        particles: 200,
        traceLength: 3,
        traceSpeed: 10,
        rocketsPoint: { min: 50, max: 50 },
        lineWidth: { min: 1, max: 4 },
        lineStyle: "round",
        sound: {
          enabled: true,
          files: [
            "/sounds/explosion0.mp3",
            "/sounds/explosion1.mp3",
            "/sounds/explosion2.mp3",
          ],
          volume: { min: 2, max: 60 },
        },
        boundaries: {
          x: 0,
          y: 0,
          width: window.innerWidth,
          height: window.innerHeight,
        },
        interaction: "click",
      });

      firework.start();

      // 开始打字机效果
      setTimeout(
        () =>
          // 打印右侧列内容
          typeWriter2(textColumns[1], column2, 0, () => {
            // 右侧列打印完成后打印左侧列
            typeWriter2(textColumns[0], column1, 0, () => {
              // 左侧列打印完成后开始打印 typedText
              printTypedText();
            });
          }),
        5000
      ); // 打印第一列

      // 每隔7秒更改 typedText
      let counter = 0;

      const messages = ["Happy New Year", "n 55!W !", "Good Night", "Good Bye"];
      // 定义打印 typedText 的函数
const printTypedText = () => {
  // 打印初始内容
  typeWriter(messages[counter]);

  // 每隔 7 秒打印下一条消息
  const intervalId = setInterval(() => {
    counter = (counter + 1) % messages.length; // 更新消息索引
    typedText.value = ""; // 清空内容
    typeWriter(messages[counter]); // 打印新的内容
  }, 7000);

  // 设置定时器，30 秒后停止更新
  setTimeout(() => clearInterval(intervalId), 30000);
};
      // const intervalId = setInterval(() => {
      //   // 更新 typedText 和打印新内容
      //   typedText.value = "";
      //   typeWriter(messages[counter]);

      //   // 更新 counter 来选择下一个消息
      //   counter = (counter + 1) % messages.length;
      // }, 7000);

      // // 停止定时器（根据需求，你可以在某个时机停止，比如手动取消）
      // setTimeout(() => clearInterval(intervalId), 30000); // 30秒后停止定时器
    };

    const drawBackground = () => {
      const canvas = backgroundCanvas.value;
      const ctx = canvas.getContext("2d");
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;

      ctx.fillStyle = "#000";
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      const stars = Array.from({ length: 200 }).map(() => ({
        x: Math.random() * canvas.width,
        y: Math.random() * canvas.height,
        radius: Math.random() * 2,
        alpha: Math.random(),
        delta: Math.random() * 0.02 + 0.001,
      }));

      const animateStars = () => {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        ctx.fillStyle = "#000";
        ctx.fillRect(0, 0, canvas.width, canvas.height);

        stars.forEach((star) => {
          star.alpha += star.delta;
          if (star.alpha > 1 || star.alpha < 0) star.delta *= -1;

          ctx.beginPath();
          ctx.arc(star.x, star.y, star.radius, 0, Math.PI * 2);
          ctx.fillStyle = `rgba(255, 255, 255, ${star.alpha})`;
          ctx.fill();
        });

        drawMoon(ctx);
        requestAnimationFrame(animateStars);
      };

      animateStars();
    };

    const drawMoon = (ctx) => {
      const moonX = 500; // 月亮的 x 坐标
      const moonY = 200; // 月亮的 y 坐标
      const moonRadius = 50;
      drawMoonWithGlow(
        ctx,
        moonX,
        moonY,
        moonRadius,
        "rgba(255, 255, 255, 0.5)"
      );

      // 在月亮正下方放置文字
      if (typingContainer.value) {
        // 设置文字位置
        typingContainer.value.style.left = `${
          moonX - typingContainer.value.offsetWidth / 2
        }px`; // 水平居中
        typingContainer.value.style.top = `${moonY + moonRadius + 10}px`; // 放置在月亮正下方
      }
    };

    const drawMoonWithGlow = (ctx, x, y, radius, glowColor) => {
      ctx.beginPath();
      ctx.arc(x, y, radius, 0, Math.PI * 2);
      ctx.fillStyle = "#fff";
      ctx.fill();

      const gradient = ctx.createRadialGradient(
        x,
        y,
        radius,
        x,
        y,
        radius * 1.1
      );
      gradient.addColorStop(0, glowColor);
      gradient.addColorStop(1, "rgba(0, 0, 0, 0)");

      ctx.beginPath();
      ctx.arc(x, y, radius * 1.1, 0, Math.PI * 2);
      ctx.fillStyle = gradient;
      ctx.fill();

      ctx.save();
      ctx.globalCompositeOperation = "destination-out";
      ctx.beginPath();
      ctx.arc(x + radius * 0.4, y - radius * 0.2, radius, 0, Math.PI * 2);
      ctx.fillStyle = "#000";
      ctx.fill();
      ctx.restore();
    };

    const drawMeteorRain = () => {
      const canvas = backgroundCanvas.value;
      const ctx = canvas.getContext("2d");

      let meteors = Array.from({ length: 7 }).map(() => ({
        x: Math.random() * (canvas.width / 3), // 限制 x 在左上角区域
        y: 0, // 限制 y 在左上角区域
        length: Math.random() * 150 + 50, // 流星的长度
        speed: Math.random() * 3 + 2, // 流星的速度
      }));

      const angle = Math.PI / 4; // 固定的倾斜角度 (45 度)
      const trailOpacity = 0.1; // 拖影的透明度

      const drawStar = (
        ctx,
        cx,
        cy,
        spikes,
        outerRadius,
        innerRadius,
        color
      ) => {
        let rot = (Math.PI / 2) * 3; // 初始旋转角度
        let x = cx;
        let y = cy;
        const step = Math.PI / spikes; // 每个尖角的角度

        ctx.beginPath();
        ctx.moveTo(cx, cy - outerRadius); // 起点
        for (let i = 0; i < spikes; i++) {
          x = cx + Math.cos(rot) * outerRadius;
          y = cy + Math.sin(rot) * outerRadius;
          ctx.lineTo(x, y);
          rot += step;

          x = cx + Math.cos(rot) * innerRadius;
          y = cy + Math.sin(rot) * innerRadius;
          ctx.lineTo(x, y);
          rot += step;
        }
        ctx.closePath();
        ctx.fillStyle = color;
        ctx.fill();
      };

      const animateMeteor = () => {
        ctx.fillStyle = `rgba(0, 0, 0, ${trailOpacity})`;
        ctx.fillRect(0, 0, canvas.width, canvas.height);

        meteors.forEach((meteor) => {
          const xEnd = meteor.x - meteor.length * Math.cos(angle);
          const yEnd = meteor.y - meteor.length * Math.sin(angle);

          // 绘制流星头部
          drawStar(ctx, meteor.x, meteor.y, 5, 10, 5, "rgba(255, 255, 255, 1)");

          // 绘制流星拖影
          const trailGradient = ctx.createLinearGradient(
            meteor.x,
            meteor.y,
            xEnd,
            yEnd
          );
          trailGradient.addColorStop(0, "rgba(255, 255, 255, 1)");
          trailGradient.addColorStop(1, "rgba(255, 255, 255, 0)");

          ctx.beginPath();
          ctx.moveTo(meteor.x, meteor.y);
          ctx.lineTo(xEnd, yEnd);
          ctx.strokeStyle = trailGradient;
          ctx.lineWidth = 3;
          ctx.stroke();

          // 更新流星位置
          meteor.x += meteor.speed * Math.cos(angle);
          meteor.y += meteor.speed * Math.sin(angle);

          // 如果流星超出屏幕，重新生成
          if (meteor.x > canvas.width || meteor.y > canvas.height) {
            meteor.x = Math.random() * canvas.width;
            meteor.y = Math.random() * canvas.height * 0.5;
            meteor.length = Math.random() * 150 + 50;
            meteor.speed = Math.random() * 3 + 1;
          }
        });

        requestAnimationFrame(animateMeteor);
      };

      animateMeteor();
    };

    onMounted(() => {
      drawBackground();
      drawMeteorRain(); // 启动流星动画
      window.addEventListener("resize", drawBackground);
    });

    onBeforeUnmount(() => {
      window.removeEventListener("resize", drawBackground);
    });

    return {
      canvasContainer,
      backgroundCanvas,
      fireworkCanvas,
      triggerFirework,
      typedText,
      column1,
      column2,
      typingContainer,
      typingContainer2,
    };
  },
};
</script>
  
  <style>
.firework-container {
  position: fixed;
  top: 0;
  left: 0;
  width: 100vw;
  height: 100vh;
  overflow: hidden;
  background-color: #000;
  z-index: 2; /* 烟花容器层级 */
}

.background-canvas {
  position: absolute;
  top: 0;
  left: 0;
  z-index: 1; /* 背景层 */
}

.firework-canvas {
  position: absolute;
  top: 0;
  left: 0;
  width: 100vw;
  height: 100vh;
  z-index: 3; /* 烟花层 */
}

/* .typing-container {
  position: absolute;
  font-family: "Roboto", sans-serif; 
  margin-top: 10px;
  font-size: 36px;
  color: #cd4178;
  white-space: nowrap;
  z-index: 7; 
} */

.typing-container {
  position: absolute;
  font-family: "Roboto", sans-serif; /* 使用 Google 字体 */
  margin-top: 10px;
  font-size: 29px;
  /* color: #d23271; */
  color: #ffffff;
  white-space: nowrap;
  z-index: 7;
  /* animation: blink 1.5s infinite;  */
}

.typing-container span {
  opacity: 0;
  animation: fadeIn 0.3s forwards, glow 1.5s infinite alternate;
}

/* .typing-container span {
  opacity: 0;
  animation: fadeIn 0.3s forwards, pinkGlow 1.5s infinite alternate;
} */

@keyframes pinkGlow {
  0% {
    text-shadow: 0 0 12px #ff6191, 0 0 20px #ff6191, 0 0 28px #ff6191;
  }
  100% {
    text-shadow: 0 0 12px #ff6191, 0 0 20px #ff6191, 0 0 28px #ff6191;
  }
}

.typing-container2 {
  position: absolute;
  top: 20px;
  right: 50px;
  display: flex;
  flex-direction: row-reverse; /* 从右到左排列列 */
  gap: 20px; /* 列之间的间距 */
  z-index: 5;
  font-family: "Roboto", sans-serif; /* 使用 Google 字体 */
  font-size: 24px;
  color: #ffffff;
  text-align: center; /* 每列居中 */
}

.typing-container2 .column {
  display: flex;
  flex-direction: column; /* 每列内容从上到下 */
  align-items: center; /* 水平居中 */
}

.typing-container2 .column span {
  opacity: 0;
  animation: fadeIn 0.3s forwards, glow 1.5s infinite alternate;
}

/* 左边的列偏移顶部一定距离（少两个字的高度） */
.typing-container2 .column-offset {
  margin-top: calc(
    2 * 34px
  ); /* 偏移两个字的高度，34px 是字体大小和行高的估计值 */
}

/* 字出现的渐变效果 */
@keyframes fadeIn {
  to {
    opacity: 1;
  }
}
/* 动态光晕效果 */
@keyframes glow {
  0% {
    text-shadow: 0 0 8px #ffffff, 0 0 12px #ffffff, 0 0 16px #ffffff;
  }
  100% {
    text-shadow: 0 0 12px #ffffff, 0 0 20px #ffffff, 0 0 28px #ffffff;
  }
}
</style>
  