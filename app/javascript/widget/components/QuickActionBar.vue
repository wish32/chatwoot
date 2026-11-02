<script>
import {
  preferChineseLocale,
  quickActionLabel,
  quickActionMessage,
  resolveQuickActions,
} from '../helpers/takehkQuickActions';

export default {
  name: 'QuickActionBar',
  props: {
    actions: {
      type: Array,
      default: () => [],
    },
    onPick: {
      type: Function,
      required: true,
    },
  },
  computed: {
    useChinese() {
      return preferChineseLocale();
    },
    items() {
      return resolveQuickActions(this.actions);
    },
  },
  methods: {
    labelFor(action) {
      return quickActionLabel(action, this.useChinese);
    },
    handleClick(action) {
      const text = quickActionMessage(action, this.useChinese);
      if (text) this.onPick(text);
    },
  },
};
</script>

<template>
  <div v-if="items.length" class="takehk-quick-actions px-1 mb-2" role="toolbar">
    <button
      v-for="action in items"
      :key="action.id"
      type="button"
      class="takehk-quick-actions__chip"
      @click="handleClick(action)"
    >
      {{ labelFor(action) }}
    </button>
  </div>
</template>

<style scoped>
.takehk-quick-actions {
  display: flex;
  flex-wrap: nowrap;
  gap: 0.5rem;
  overflow-x: auto;
  -webkit-overflow-scrolling: touch;
  scrollbar-width: none;
}

.takehk-quick-actions::-webkit-scrollbar {
  display: none;
}

.takehk-quick-actions__chip {
  flex: 0 0 auto;
  max-width: 14rem;
  padding: 0.4rem 0.85rem;
  border: 1px solid rgba(0, 0, 0, 0.12);
  border-radius: 999px;
  background: rgba(255, 255, 255, 0.95);
  color: #1d1d1f;
  font-size: 0.8125rem;
  font-weight: 500;
  line-height: 1.25;
  white-space: nowrap;
  cursor: pointer;
  transition:
    border-color 0.15s ease,
    background 0.15s ease;
}

.takehk-quick-actions__chip:hover {
  border-color: var(--widget-color, #1f93ff);
  background: #fff;
}

:global(.dark) .takehk-quick-actions__chip {
  border-color: rgba(255, 255, 255, 0.16);
  background: rgba(30, 30, 30, 0.92);
  color: #f5f5f7;
}
</style>
