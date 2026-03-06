<template>
  <component :is="href ? 'a' : 'div'" :href="href" :target="target" :rel="rel" class="vp-card">
    <div class="vp-card-inner">
      <!-- Icon -->
      <div v-if="icon || $slots.icon" class="vp-card-icon" :data-size="iconSize">
        <slot name="icon">
          <component v-if="icon" :is="icon" />
        </slot>
      </div>

      <!-- Content -->
      <div class="vp-card-body">
        <h3 v-if="title" class="vp-card-title">{{ title }}</h3>
        <div class="vp-card-content">
          <slot />
        </div>
      </div>
    </div>
  </component>
</template>

<script setup>
import { computed } from "vue";

const props = defineProps({
  title: String,
  icon: {
    type: [Object, Function],
    required: false,
  },
  iconSize: {
    type: String,
    default: "md", // sm | md | lg
    required: false,
  },
  href: String,
  target: {
    type: String,
    default: "_self",
  },
});

const rel = computed(() => (props.target === "_blank" ? "noopener noreferrer" : null));
</script>

<style scoped>
.vp-card {
  display: block;
  border: 1px solid var(--vp-c-divider);
  border-radius: 12px;
  padding: 16px;
  background: var(--vp-c-bg-soft);
  text-decoration: none;
  transition:
    box-shadow 0.2s ease,
    transform 0.2s ease,
    border-color 0.2s ease;
}

.vp-card:hover {
  box-shadow: var(--vp-shadow-2);
  transform: translateY(-1px);
  border-color: var(--vp-c-brand-1);
}

.vp-card-inner {
  display: flex;
  gap: 12px;
}

.vp-card-icon {
  flex-shrink: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  color: var(--vp-c-brand-1);
  transition: color 0.2s ease;
}

.vp-card-icon[data-size="sm"] {
  width: 28px;
  height: 28px;
}

.vp-card-icon[data-size="md"] {
  width: 36px;
  height: 36px;
}

.vp-card-icon[data-size="lg"] {
  width: 48px;
  height: 48px;
}

.vp-card-icon :deep(svg) {
  width: 100%;
  height: 100%;
}

.vp-card-title {
  margin: 0;
  font-size: 1rem;
  font-weight: 600;
  color: var(--vp-c-text-1);
}

.vp-card-content {
  margin-top: 4px;
  font-size: 0.9rem;
  color: var(--vp-c-text-2);
}
</style>
