<script setup>
import { ref, computed, onMounted, onBeforeUnmount, watch } from "vue";
import { useRouter, useRoute } from 'vue-router'
import NavBar from "./components/NavBar.vue";
import Sidebar from "./components/Sidebar.vue";
import rolesJson from "./data/roles.json";

const roles = rolesJson.roles || [];
const currentRole = ref(roles[0] || { id: "guest", name: "Guest", menus: [] });
const sidebarOpen = ref(true);
const isMobile = ref(false);
let setMobile
const selectedMenu = ref(currentRole.value.menus?.[0]?.key || "dashboard");
// Try navigating to the route if the current selected menu is a route
try{
  const initial = currentRole.value.menus?.[0]
  if(initial && initial.path) router.replace({ path: initial.path })
}catch(e){}
const router = useRouter()
const route = useRoute()
const isHomeRoute = computed(()=> route.name)
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

  // Set default menu to dashboard (home) if available, otherwise first menu item.
  const defaultMenu =
    r.menus?.find((m) => m.key === 'dashboard') || r.menus?.[0] || { key: '', path: '/home' };

  selectedMenu.value = defaultMenu.key || 'dashboard';

  try {
    localStorage.setItem('rbac-current-role', r.id);
    localStorage.setItem('rbac-selected-menu', selectedMenu.value);
  } catch (e) {}

  // Navigate to selected default menu path to keep URL in sync
  try {
    if (defaultMenu.path) {
      router.push({ path: defaultMenu.path })
    } else {
      router.push({ path: '/home' })
    }
  } catch (e) {
    // ignore navigation failures
  }

  // Persist selection to localStorage only. Other tabs will apply this when/if they reload.
  // (No BroadcastChannel post — change will not be applied immediately in other tabs.)
}
function signOut() {
  alert("Signed out (placeholder)");
}
function goHome(){
  // if the current role has a dashboard menu, go there; otherwise choose the first available
  const roleMenus = currentRole.value.menus || []
  const hasDashboard = roleMenus.some(m => m.key === 'dashboard')
  const target = hasDashboard ? 'dashboard' : (roleMenus[0]?.key || '')
  if(target){
    selectedMenu.value = target
    try{ localStorage.setItem('rbac-selected-menu', selectedMenu.value) }catch(e){}
    if(target === 'dashboard'){
      try{ const menu = currentRole.value.menus?.find(m => m.key === 'dashboard'); if(menu && menu.path) router.push({ path: menu.path }) }catch(e){}
    }
  }
  // on mobile, close sidebar
  try{ if(isMobile.value) sidebarOpen.value = false }catch(e){}
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

  // navigate to menu path if defined
  if(m.path){
    try{ router.push({ path: m.path }) }catch(e){}
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
  // If URL contains a ?menu= param, try to use it (e.g., from Ctrl+click open new tab)
  try{
    const params = new URLSearchParams(window.location.search)
    const menuParam = params.get('menu')
    if(menuParam){
      // allow menuParam to be either path (starts with /) or a key
      let foundMenu = null
      if(menuParam.startsWith('/')){
        foundMenu = (currentRole.value.menus || []).find(m => m.path === menuParam)
      } else {
        foundMenu = (currentRole.value.menus || []).find(m => m.key === menuParam)
      }
      if(foundMenu){
        selectedMenu.value = foundMenu.key
        try{ localStorage.setItem('rbac-selected-menu', selectedMenu.value) }catch(e){}
        try{ if(foundMenu.path) router.push({ path: foundMenu.path }) }catch(e){}
      }
    }
  }catch(e){/* ignore */}
});

onBeforeUnmount(() => {
  if (bc) bc && typeof bc.close === "function" ? bc.close() : null;
  try{ if(setMobile) window.removeEventListener('resize', setMobile) }catch(e){}
});

// sync selected menu when route changes (e.g., user navigates directly to /home/users/etc)
watch(() => route.path, (path) => {
  const menus = currentRole.value.menus || []
  const found = menus.find((m) => m.path === path)

  if (found) {
    selectedMenu.value = found.key
    try {
      localStorage.setItem('rbac-selected-menu', selectedMenu.value)
    } catch (e) {}
    return
  }

  // fallback for home route and default UI state
  if (path === '/home' || path === '/') {
    selectedMenu.value = 'dashboard'
    try {
      localStorage.setItem('rbac-selected-menu', selectedMenu.value)
    } catch (e) {}
    return
  }
})

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
      @go-home="goHome"
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

      <div
        v-if="!sidebarOpen && !isMobile"
        class="sidebar-edge-handle"
        @click="sidebarOpen = true"
        title="Open sidebar"
      />

      <main class="content">
        <h1>{{ selectedMenuLabel }}</h1>
        <div class="card">
          <template v-if="isHomeRoute">
            <router-view />
          </template>
          <template v-else>
            <p>
              You're signed in as <strong>{{ currentRole.name }}</strong> (role
              id: <code>{{ currentRole.id }}</code
              >).
            </p>
            <p>
              This is a simple, elegant theme and a responsive layout. Use the
              role menu to switch roles.
            </p>
          </template>
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

.sidebar-edge-handle {
  position: fixed;
  left: 0;
  top: 120px;
  transform: translateY(-50%);
  width: 8px;
  height: 72px;
  background: rgba(60, 85, 131, 0.75);
  border-top-right-radius: 8px;
  border-bottom-right-radius: 8px;
  z-index: 115;
  cursor: pointer;
  transition: width 180ms ease, background 180ms ease;
}
.sidebar-edge-handle:hover {
  width: 16px;
  background: rgba(60, 85, 131, 0.95);
}
.overlay{position:fixed;left:0;right:0;bottom:0;top:64px;background:rgba(2,6,23,0.55);z-index:60}
</style>
