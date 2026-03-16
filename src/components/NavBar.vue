<template>
  <header class="rbac-navbar">
      <div class="left">
      <button
        class="hamburger"
        @click="$emit('toggle-sidebar')"
        aria-label="Toggle menu"
      >
        <svg
          width="20"
          height="14"
          viewBox="0 0 20 14"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          <rect y="1" width="20" height="2" rx="1" fill="currentColor" />
          <rect y="6" width="20" height="2" rx="1" fill="currentColor" />
          <rect y="11" width="20" height="2" rx="1" fill="currentColor" />
        </svg>
      </button>
      <button class="logo" ref="logoBtn" aria-label="Go home"><a href="/home">RBAC System</a></button>
    </div>

    <div class="right">
      <div class="role-menu" ref="menu">
        <button
          class="role-btn"
          @click="open = !open"
          aria-haspopup="listbox"
          :aria-expanded="open"
        >
          <img class="avatar" :src="currentRole.avatar" alt="avatar" />
          <div class="role-info">
            <div class="username">{{ props.userName || 'Sophisva.ph' }}</div>
            <div class="role-label">{{ currentRole.name }}</div>
          </div>
          <svg
            class="chev"
            width="12"
            height="12"
            viewBox="0 0 20 20"
            fill="none"
          >
            <path
              d="M5 8l5 5 5-5"
              stroke="currentColor"
              stroke-width="2"
              stroke-linecap="round"
              stroke-linejoin="round"
            />
          </svg>
        </button>

        <ul v-if="open" class="dropdown" role="listbox">
          <li
            v-for="r in roles"
            :key="r.id"
            :class="{ selected: r.id === currentRole.id }"
          >
            <button class="dropdown-item" @click="selectRole(r)">
              <span class="label">{{ r.name }}</span>
              <span class="check" v-if="r.id === currentRole.id" aria-hidden>
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
                  <path
                    d="M20 6L9 17l-5-5"
                    stroke="currentColor"
                    stroke-width="2"
                    stroke-linecap="round"
                    stroke-linejoin="round"
                  />
                </svg>
              </span>
            </button>
          </li>
          <li class="divider"></li>
          <li>
            <button class="dropdown-item signout" @click="$emit('signout')">
              Sign out
            </button>
          </li>
        </ul>
      </div>
    </div>
  </header>
</template>

<script setup>
import { ref, toRefs } from "vue";
  const props = defineProps({
  roles: { type: Array, default: () => [] },
  currentRole: { type: Object, required: true },
  userName: { type: String, default: 'Sophisva.ph' },
});
const emit = defineEmits(["toggle-sidebar", "change-role", "signout", "go-home"]);
const open = ref(false);

function selectRole(r) {
  emit("change-role", r);
  open.value = false;
}
</script>

<style scoped>
.rbac-navbar {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0.6rem 1rem;
  border-bottom: 1px solid rgba(255, 255, 255, 0.04);
  background: #3c5583; /* transparent; */
  position: relative; 
  z-index: 120; /* above overlay for mobile */
}
.rbac-navbar .left {
  display: flex;
  align-items: center;
  gap: 0.75rem;
}
.logo {
  font-weight: 700;
  color: var(--text);
  letter-spacing: 0.2px;
}
.logo{background:transparent;border:0;padding:0;font-size:1rem;cursor:pointer}
.logo:focus{outline: none}
.logo:focus-visible{outline: 3px solid color-mix(in srgb,var(--primary) 60%, black);outline-offset:2px}
.hamburger {
  background: transparent;
  border: 0;
  padding: 0.25rem;
  display: flex;
  align-items: center;
  justify-content: center;
  color: var(--muted);
}
.role-btn {
  display: flex;
  align-items: center;
  width: 200px;
  gap: 0.6rem;
  padding: 0.45rem 0.8rem;
  background: linear-gradient(180deg, rgba(255, 255, 255, 0.02), transparent);
  border-radius: 10px;
  border: 1px solid rgba(255, 255, 255, 0.03);
  box-shadow: 0 6px 18px rgba(2, 6, 23, 0.45);
}
.role-info{display:flex;flex-direction:column;align-items:flex-start}
.role-info .username{font-weight:700;color:var(--text);font-size:0.95rem}
.role-info .role-label{font-weight:600;color:var(--muted);font-size:0.85rem;margin-top:2px}
.avatar {
  width: 36px;
  height: 36px;
  border-radius: 50%;
  border: 2px solid rgba(255, 255, 255, 0.03);
  object-fit: cover;
}
.role-name {
  font-weight: 600;
}
.chev {
  opacity: 0.9;
}
.dropdown {
  position: absolute;
  right: 1rem;
  top: 64px;
  background: #dbdbdb; /*var(--dropdown-bg); */
  border: 1px solid rgba(255, 255, 255, 0.04);
  padding: 0.4rem;
  border-radius: 10px;
  min-width: 200px;
  box-shadow: 0 12px 30px rgba(23, 23, 2, 0.6);
  list-style: none;
  margin: 0;
}

@media (max-width: 719px) {
  .dropdown{
    position: fixed;
    left: 0;
    right: 0;
    top: 64px;
    min-width: unset;
    border-radius: 0;
    z-index: 100;
  }
  .role-btn{width: auto}
  .role-info .username{font-size:0.95rem}
  .role-info .role-label{font-size:0.8rem}
}
.dropdown li {
  margin: 0;
  padding: 0;
}
.dropdown-item {
  width: 100%;
  text-align: left;
  padding: 0.6rem 0.7rem;
  background: transparent;
  border: 0;
  display: flex;
  align-items: center;
  justify-content: space-between;
  border-radius: 8px;
}
.dropdown-item:hover {
  background: rgba(255, 255, 255, 0.02);
}
.dropdown li.selected .dropdown-item {
  background: linear-gradient(
    90deg,
    rgba(124, 92, 255, 0.12),
    rgba(66, 184, 131, 0.03)
  );
  border: 1px solid rgba(124, 92, 255, 0.12);
}
.dropdown .check {
  color: var(--primary);
  display: inline-flex;
}
.divider {
  height: 1px;
  background: rgba(255, 255, 255, 0.03);
  margin: 0.25rem 0;
}
.signout {
  color: var(--danger);
}
@media (min-width: 720px) {
  .hamburger {
    display: none;
  }
}
</style>
