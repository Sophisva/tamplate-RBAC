<script setup>
import { ref, computed, onMounted, onBeforeUnmount } from "vue";
import NavBar from "./components/NavBar.vue";
import Sidebar from "./components/Sidebar.vue";
import rolesJson from "./data/roles.json";

const roles = rolesJson.roles || [];
const currentRole = ref(roles[0] || { id: "guest", name: "Guest", menus: [] });
const sidebarOpen = ref(true);
const isMobile = ref(false);
let setMobile
const selectedMenu = ref(currentRole.value.menus?.[0]?.key || "dashboard");
// placeholder username until auth is wired
const username = 'Sophisva.ph'

// We persist role/menu to localStorage so other tabs will pick up the change on refresh.
// Remove immediate cross-tab activation: do not broadcast role-change via BroadcastChannel.
let bc = null;

function toggleSidebar() {
  sidebarOpen.value = !sidebarOpen.value;
}
function changeRole(r) {
  currentRole.value = r;
  selectedMenu.value = r.menus?.[0]?.key || "";
  try {
    localStorage.setItem("rbac-current-role", r.id);
    localStorage.setItem("rbac-selected-menu", selectedMenu.value);
  } catch (e) {}
  // Persist selection to localStorage only. Other tabs will apply this when/if they reload.
  // (No BroadcastChannel post — change will not be applied immediately in other tabs.)
}
function signOut() {
  alert("Signed out (placeholder)");
}
function selectMenu(m) {
  // Before selecting, check the latest persisted role (in case another tab changed it)
  try {
    const savedRoleId = localStorage.getItem("rbac-current-role");
    if (savedRoleId && savedRoleId !== currentRole.value.id) {
      const found = roles.find((r) => r.id === savedRoleId);
      if (found) {
        // apply the latest role from storage so permission check uses up-to-date role
        currentRole.value = found;
        // if the requested menu is not available in the new role, adjust or block
        const allowed = found.menus?.some((menu) => menu.key === m.key);
        if (!allowed) {
          // pick the first allowed menu instead and persist
          selectedMenu.value = found.menus?.[0]?.key || "";
          try {
            localStorage.setItem("rbac-selected-menu", selectedMenu.value);
          } catch (e) {}
          alert(
            "Role was updated in another tab. Your requested menu is not allowed for the new role — switched to the default menu for that role."
          );
          return;
        }
        // allowed: fall through and select
      }
    }
  } catch (e) {
    /* ignore storage errors */
  }

  // final permission check against currentRole
  const hasPerm = (currentRole.value.menus || []).some(
    (menu) => menu.key === m.key
  );
  if (!hasPerm) {
    alert(
      "You do not have permission to open this menu with the current role."
    );
    return;
  }

  selectedMenu.value = m.key;
  try {
    localStorage.setItem("rbac-selected-menu", selectedMenu.value);
  } catch (e) {}
}

onMounted(() => {
  // responsive init: set `isMobile` and listen to resizes
  setMobile = () => {
    isMobile.value = window && window.innerWidth < 720;
    if (!isMobile.value) sidebarOpen.value = true; // ensure sidebar visible on wide screens
    if (isMobile.value && window && window.innerWidth < 720) sidebarOpen.value = false;
  };
  setMobile();
  window.addEventListener('resize', setMobile);
  // restore from localStorage if present
  try {
    const savedRoleId = localStorage.getItem("rbac-current-role");
    const savedMenu = localStorage.getItem("rbac-selected-menu");
    if (savedRoleId) {
      const found = roles.find((r) => r.id === savedRoleId);
      if (found) {
        currentRole.value = found;
        selectedMenu.value = savedMenu || found.menus?.[0]?.key || "";
      }
    } else if (savedMenu) {
      selectedMenu.value = savedMenu;
    }
  } catch (e) {
    /* ignore localStorage errors */
  }
});

onBeforeUnmount(() => {
  if (bc) bc && typeof bc.close === "function" ? bc.close() : null;
  try{ if(setMobile) window.removeEventListener('resize', setMobile) }catch(e){}
});

const selectedMenuLabel = computed(() => {
  const menus = currentRole.value.menus || [];
  const key = selectedMenu.value;
  const found = menus.find((m) => m.key === key);
  return found ? found.label : menus[0]?.label || "Welcome";
});
</script>

<template>
  <div id="app-layout">
    <div v-if="isMobile && sidebarOpen" class="overlay" @click="sidebarOpen = false"></div>
    <NavBar
      :roles="roles"
      :currentRole="currentRole"
      :userName="username"
      @toggle-sidebar="toggleSidebar"
      @change-role="changeRole"
      @signout="signOut"
    />

    <div class="layout">
      <Sidebar
        :menus="currentRole.menus"
        :visible="sidebarOpen"
        :activeKey="selectedMenu"
        @select="selectMenu"
        @close="sidebarOpen = false"
      />

      <main class="content">
        <h1>{{ selectedMenuLabel }}</h1>
        <div class="card">
          <p>
            You're signed in as <strong>{{ currentRole.name }}</strong> (role
            id: <code>{{ currentRole.id }}</code
            >).
          </p>
          <p>
            This is a simple, elegant theme and a responsive layout. Use the
            role menu to switch roles.
          </p>
        </div>
      </main>
    </div>
  </div>
</template>

<style scoped>
#app-layout {
  /* max-width: 1280px; */
  width: 100%;
  margin: 0 auto;
  /* padding: 1rem; */
}
.layout {
  display: flex;
  gap: 1rem;
  align-items: flex-start;
}
.content {
  flex: 1;
  padding: 1rem;
}
.content h1 {
  margin: 0 0 1rem 0;
}
.card {
  background: rgba(255, 255, 255, 0.02);
  padding: 1rem;
  border-radius: 8px;
}
@media (max-width: 719px) {
  .layout {
    flex-direction: column;
  }
  .content {
    padding: 0.5rem;
  }
}
.overlay{position:fixed;left:0;right:0;bottom:0;top:64px;background:rgba(2,6,23,0.55);z-index:60}
</style>
