<template>
  <aside :class="['rbac-sidebar', { open: visible }]">
    <div class="sidebar-inner">
      <div class="sidebar-control">
        <span class="menu-title">Menu</span>
        <button class="hide-sidebar" @click="$emit('close')" aria-label="Hide sidebar">
          <b>
            <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <polyline points="15 18 9 12 15 6"></polyline>
            </svg>
          </b>
        </button>
      </div>
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
  min-width: 220px;
  height: 90vh; /* Changed to 100vh for full screen height */
  flex: 0 0 auto;
  padding: 1rem;
  border-right: 1px solid rgba(255, 255, 255, 0.04);
  background: #b5bbc0; /*var(--bg);*/ /*transparent;*/
  transition: width 260ms ease, min-width 260ms ease, opacity 260ms ease, padding 260ms ease, border-right 260ms ease;
  overflow: hidden;
  opacity: 1;
}
.rbac-sidebar:not(.open) {
  width: 0;
  min-width: 0;
  padding: 0;
  border-right: 0;
  opacity: 0;
}
.sidebar-inner {
  position: sticky;
  top: 0;
}
.sidebar-control {
  position: relative;
  margin-bottom: 0.75rem;
}
.menu-title {
  font-weight: 700;
  color: var(--muted);
}
.hide-sidebar {
  position: absolute;
  top: 0;
  right: 0;
  transform: translate(50%, -50%);
  min-width: 50px;
  height: 28px;
  padding: 0 10px;
  border: 1px solid rgba(255, 255, 255, 0.2);
  border-radius: 6px;
  background: linear-gradient(135deg, #3c5583 0%, #5a73a3 100%);
  color: #fff;
  font-size: 0.83rem;
  font-weight: 600;
  line-height: 1;
  cursor: pointer;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.2);
  letter-spacing: 0.02em;
}
.hide-sidebar:hover {
  background: linear-gradient(135deg, #506ca5 0%, #6d81b9 100%);
  border-color: rgba(255, 255, 255, 0.35);
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
  border-left: 3px solid var(--danger);
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
  .hide-sidebar {
    display: none;
  }
}
</style>
