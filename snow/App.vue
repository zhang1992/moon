<template>
  <div 
    class="relative w-full h-[100dvh] overflow-hidden bg-[#02040a]" 
    :style="{ 
      backgroundImage: `url(${bgImage})`, 
      backgroundSize: 'cover', 
      backgroundPosition: 'center', 
      backgroundRepeat: 'no-repeat' 
    }"
  >
    <!-- Premium Winter Night Background -->
    <div class="absolute inset-0 pointer-events-none overflow-hidden">
      <!-- Deep blue radial glow -->
      <div class="absolute top-[-10%] left-1/2 -translate-x-1/2 w-[140%] aspect-square bg-blue-900/10 blur-[120px] rounded-full opacity-60"></div>
      
      <!-- Moon & Stars Section -->
      <div class="absolute inset-0">
        <!-- Interactive Glowing Crescent Moon -->
        <button 
          @click="toggleMusic"
          class="absolute top-[8%] right-[10%] w-16 h-16 md:w-20 md:h-20 cursor-pointer pointer-events-auto group outline-none z-[10002] transition-transform duration-700 active:scale-90"
        >
          <!-- Moon Halo - Pulse when playing -->
          <div 
            :class="`absolute inset-0 bg-yellow-100/10 blur-[40px] rounded-full scale-150 transition-all duration-1000 
              ${isPlaying ? 'animate-pulse bg-yellow-200/20' : 'group-hover:bg-yellow-100/20'}`"
          ></div>
          
          <!-- Moon Shape -->
          <svg 
            viewBox="0 0 24 24" 
            :class="`w-full h-full text-yellow-50/90 drop-shadow-[0_0_12px_rgba(254,252,232,0.6)] transform -rotate-12 transition-all duration-500 
              ${isPlaying ? 'scale-110 text-yellow-100 drop-shadow-[0_0_20px_rgba(254,252,232,0.8)]' : 'group-hover:scale-105'}`"
          >
            <path fill="currentColor" d="M21 12.79A9 9 0 1111.21 3 7 7 0 0021 12.79z" />
          </svg>

          <!-- Music Indicator -->
          <div v-if="isPlaying" class="absolute -bottom-2 -left-2 animate-bounce">
            <i class="fas fa-music text-yellow-100/60 text-xs"></i>
          </div>
        </button>

        <!-- Twinkling Stars -->
        <div
          v-for="star in stars"
          :key="star.id"
          class="absolute bg-white rounded-full animate-twinkle shadow-[0_0_4px_rgba(255,255,255,0.8)]"
          :style="{
            top: star.top,
            left: star.left,
            width: `${star.size}px`,
            height: `${star.size}px`,
            animationDelay: star.delay,
            '--twinkle-duration': star.duration
          }"
        />
      </div>

      <!-- Subtle purple accent -->
      <div class="absolute bottom-[-20%] right-[-10%] w-[80%] aspect-square bg-indigo-900/10 blur-[100px] rounded-full opacity-40"></div>
      <!-- Fine grain overlay for texture -->
      <div class="absolute inset-0 opacity-[0.03] mix-blend-overlay bg-[url('https://grainy-gradients.vercel.app/noise.svg')]"></div>
    </div>

    <!-- Landing Page -->
    <LandingPage :is-snowing="isSnowing" :on-toggle="toggleSnow" />

    <!-- Snow Overlay -->
    <SnowCanvas 
      :active="isSnowing" 
      :morph-text="userName ? `Merry Christmas to ${userName}` : undefined" 
    />

    <!-- Control Toggle (Bottom Left) -->
    <LetItSnowToggle :active="isSnowing" :on-toggle="toggleSnow" />

    <!-- Name Action (Bottom Right) -->
    <div v-if="isSnowing && !userName" class="fixed bottom-0 right-0 z-[10001] safe-pb safe-pr p-6 animate-in fade-in slide-in-from-bottom-4 duration-1000">
      <button
        @click="showInput = true"
        class="flex items-center gap-3 px-5 py-3 rounded-full bg-white/5 border border-white/10 text-white/70 hover:bg-white/10 hover:text-white hover:border-white/20 transition-all duration-500 text-[14px] font-medium tracking-tight shadow-xl backdrop-blur-md active:scale-95 group"
      >
        <i class="fas fa-magic text-base text-blue-400/70 group-hover:text-blue-400 group-hover:rotate-12 transition-all"></i>
        <span class="whitespace-nowrap">Enter Your Name</span>
      </button>
    </div>

    <!-- Input Modal -->
    <NameInputOverlay 
      v-if="showInput"
      :on-submit="handleNameSubmit" 
      :on-close="() => showInput = false" 
    />
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted } from 'vue';
import SnowCanvas from './components/SnowCanvas.vue';
import LetItSnowToggle from './components/LetItSnowToggle.vue';
import LandingPage from './components/LandingPage.vue';
import NameInputOverlay from './components/NameInputOverlay.vue';
import jingleBellsAudio from './components/res/jingle-bells.mp3';
import bgImage from './components/res/zoo.jpeg';

const isSnowing = ref(false);
const userName = ref<string | null>(null);
const showInput = ref(false);
const isPlaying = ref(false);
const audioRef = ref<HTMLAudioElement | null>(null);

// Generate random stars once
const stars = computed(() => {
  return [...Array(25)].map((_, i) => ({
    id: i,
    top: `${Math.random() * 45}%`,
    left: `${Math.random() * 100}%`,
    size: Math.random() * 2 + 1,
    delay: `${Math.random() * 5}s`,
    duration: `${3 + Math.random() * 4}s`,
  }));
});

const toggleSnow = () => {
  isSnowing.value = !isSnowing.value;
  if (!isSnowing.value) {
    userName.value = null;
  }
};

const handleNameSubmit = (name: string) => {
  userName.value = name;
  showInput.value = false;
};

const toggleMusic = () => {
  if (!audioRef.value) {
    audioRef.value = new Audio(jingleBellsAudio);
    audioRef.value.loop = true;
    audioRef.value.volume = 0.4;
  }

  if (isPlaying.value) {
    audioRef.value.pause();
  } else {
    audioRef.value.play().catch(err => console.error("Audio playback failed", err));
  }
  isPlaying.value = !isPlaying.value;
};
</script>

