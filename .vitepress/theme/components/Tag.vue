<template>
  <span :class="['tag', `tag-${color}`, `tag-${variant}`]">
    <slot />
  </span>
</template>

<script setup>
defineProps({
  color: {
    type: String,
    default: "emerald",
    validator: (value) => ["emerald", "amber", "rose", "sky", "zinc"].includes(value),
  },
  variant: {
    type: String,
    default: "medium",
    validator: (value) => ["small", "medium"].includes(value),
  },
});
</script>

<style scoped>
.tag {
  font-family: var(--vp-font-family-mono);
  font-size: 0.5rem;
  font-weight: 600;
  line-height: 1.5;
  display: inline-flex;
  align-items: center;
}

.tag-medium {
  padding: 0.125rem 0.375rem;
  border-radius: 0.375rem;
  border: 1px solid;
}

/* Emerald - for Preview */
.tag-emerald.tag-small {
  color: #10b981;
}

.tag-emerald.tag-medium {
  border-color: #6ee7b7;
  background-color: rgba(52, 211, 153, 0.1);
  color: #10b981;
}

:root.dark .tag-emerald.tag-medium {
  border-color: rgba(52, 211, 153, 0.3);
  background-color: rgba(52, 211, 153, 0.1);
  color: #34d399;
}

/* Amber - for Deprecated */
.tag-amber.tag-small {
  color: #f59e0b;
}

.tag-amber.tag-medium {
  border-color: #fcd34d;
  background-color: rgba(251, 191, 36, 0.1);
  color: #f59e0b;
}

:root.dark .tag-amber.tag-medium {
  border-color: rgba(251, 191, 36, 0.3);
  background-color: rgba(251, 191, 36, 0.1);
  color: #fbbf24;
}

/* Rose - for Errors/Delete */
.tag-rose.tag-small {
  color: #ef4444;
}

.tag-rose.tag-medium {
  border-color: #fecdd3;
  background-color: rgba(254, 205, 211, 0.5);
  color: #ef4444;
}

:root.dark .tag-rose.tag-medium {
  border-color: rgba(244, 63, 94, 0.2);
  background-color: rgba(251, 113, 133, 0.1);
  color: #fb7185;
}

/* Sky - for Info */
.tag-sky.tag-small {
  color: #0ea5e9;
}

.tag-sky.tag-medium {
  border-color: #7dd3fc;
  background-color: rgba(56, 189, 248, 0.1);
  color: #0ea5e9;
}

:root.dark .tag-sky.tag-medium {
  border-color: rgba(56, 189, 248, 0.3);
  background-color: rgba(56, 189, 248, 0.1);
  color: #38bdf8;
}

/* Zinc - for Neutral */
.tag-zinc.tag-small {
  color: #a1a1aa;
}

.tag-zinc.tag-medium {
  border-color: #e4e4e7;
  background-color: rgba(250, 250, 250, 1);
  color: #71717a;
}

:root.dark .tag-zinc.tag-medium {
  border-color: rgba(113, 113, 122, 0.2);
  background-color: rgba(212, 212, 216, 0.1);
  color: #d4d4d8;
}
</style>
