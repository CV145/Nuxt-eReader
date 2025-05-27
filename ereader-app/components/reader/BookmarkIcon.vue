<template>
  <div
    class="bookmark-icon-wrapper"
    :class="{ active: isBookmarked }"
    @click.stop="handleClick"
  >
    <Icon
      :name="isBookmarked ? 'bookmark-fill' : 'bookmark'"
      :size="size"
      class="bookmark-icon"
    />
    <transition name="ripple">
      <span v-if="showRipple" class="ripple-effect"></span>
    </transition>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import Icon from '~/components/ui/Icon.vue'

// Props
const props = defineProps({
  isBookmarked: {
    type: Boolean,
    default: false
  },
  size: {
    type: Number,
    default: 20
  }
})

// Emits
const emit = defineEmits(['click'])

// State
const showRipple = ref(false)

// Methods
const handleClick = () => {
  // Show ripple effect
  showRipple.value = true
  setTimeout(() => {
    showRipple.value = false
  }, 600)
  
  emit('click')
}
</script>

<style scoped>
.bookmark-icon-wrapper {
  position: relative;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 32px;
  height: 32px;
  border-radius: var(--radius-full);
  background: white;
  border: 1px solid var(--border-color);
  cursor: pointer;
  transition: all var(--transition-base);
  box-shadow: var(--shadow-sm);
}

.bookmark-icon-wrapper:hover {
  background: var(--bg-tertiary);
  transform: scale(1.1);
  box-shadow: var(--shadow-md);
}

.bookmark-icon-wrapper.active {
  background: var(--primary-color);
  border-color: var(--primary-color);
}

.bookmark-icon-wrapper.active .bookmark-icon {
  color: white;
}

.bookmark-icon {
  color: var(--text-secondary);
  transition: color var(--transition-base);
}

.bookmark-icon-wrapper:hover .bookmark-icon:not(.active .bookmark-icon) {
  color: var(--primary-color);
}

/* Ripple effect */
.ripple-effect {
  position: absolute;
  top: 50%;
  left: 50%;
  width: 100%;
  height: 100%;
  border-radius: var(--radius-full);
  background: rgba(99, 102, 241, 0.3);
  transform: translate(-50%, -50%) scale(0);
  pointer-events: none;
}

.ripple-enter-active {
  animation: ripple 0.6s ease-out;
}

@keyframes ripple {
  0% {
    transform: translate(-50%, -50%) scale(0);
    opacity: 1;
  }
  100% {
    transform: translate(-50%, -50%) scale(3);
    opacity: 0;
  }
}

/* Mobile adjustments */
@media (max-width: 768px) {
  .bookmark-icon-wrapper {
    width: 36px;
    height: 36px;
  }
}
</style>