<template>
  <aside :class="['rbac-sidebar', { open: visible }]">
    <div class="sidebar-inner">
      <div class="menu-title">Menu</div>
      <ul class="menu-list">
        <li
          v-for="m in menus"
          :key="m.key"
          :class="{ active: m.key === activeKey }"
        >
          <button class="menu-item" @click="onSelect(m, $event)">
            {{ m.label }}
          </button>
        </li>
      </ul>
    </div>
    <button class="close-mobile" @click="$emit('close')">Close</button>
  </aside>
</template>

<script setup>
const props = defineProps({
  menus: { type: Array, default: () => [] },
  visible: { type: Boolean, default: true },
  activeKey: { type: String, default: "" },
});
const emit = defineEmits(["select", "close"]);

function onSelect(m, e) {
  emit('select', m)
  // remove focus so the button doesn't stay focused after click
  try {
    const btn = e?.currentTarget ?? e?.target
    if (btn && typeof btn.blur === 'function') btn.blur()
  } catch (err) { /* ignore */ }
  // auto-close sidebar on small screens
  if (typeof window !== 'undefined' && window.innerWidth < 720) emit('close')
}
</script>

<style scoped>
.rbac-sidebar {
  width: 220px;
  flex: 0 0 220px;
  padding: 1rem;
  border-right: 1px solid rgba(255, 255, 255, 0.04);
  background: var(--bg); /*transparent;*/
}
.sidebar-inner {
  position: sticky;
  top: 0;
}
.menu-title {
  font-weight: 700;
  margin-bottom: 0.75rem;
  color: var(--muted);
}
.menu-list {
  list-style: none;
  padding: 0;
  margin: 0;
  display: flex;
  flex-direction: column;
  gap: 0.25rem;
}
.menu-item {
  background: transparent;
  border: 0;
  padding: 0.6rem 0.75rem;
  text-align: left;
  width: 100%;
  border-radius: 8px;
  color: var(--text);
  font-weight: 600;
}
.menu-item:hover {
  background: rgba(255, 255, 255, 0.02);
}
.menu-item:focus{outline: none}
.menu-item:focus-visible{outline: 3px solid color-mix(in srgb, var(--primary) 80%, transparent);outline-offset:2px}
.menu-list li.active .menu-item {
  background: linear-gradient(
    90deg,
    rgba(124, 92, 255, 0.08),
    rgba(66, 184, 131, 0.02)
  );
  border-left: 3px solid var(--primary);
  padding-left: 0.65rem;
}
.close-mobile {
  display: none;
  margin-top: 0.75rem;
}
@media (max-width: 719px) {
  .rbac-sidebar {
    position: fixed;
    left: 0;
    top: 64px;
    bottom: 0;
    transform: translateX(-110%);
    transition: transform 260ms;
    z-index: 90;
  }
  .rbac-sidebar.open {
    transform: translateX(0);
  }
  .close-mobile {
    display: block;
  }
}
</style>
