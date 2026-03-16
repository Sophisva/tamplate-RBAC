<template>
  <div class="rp-page">
      <!-- <h2 class="page-title">Role Permission</h2> -->

      <!-- Filter form -->
      <form class="filter-form" @submit.prevent="applyFilter">
        <div class="form-row">
          <label for="roleSelect">Role</label>
          <select id="roleSelect" v-model="filters.roleId">
            <option value="">All Roles</option>
            <option v-for="r in roles" :key="r.id" :value="r.id">{{ r.name }}</option>
          </select>
        </div>

        <div class="form-row">
          <label for="permType">Permission</label>
          <select id="permType" v-model="filters.permission">
            <option value="">Any</option>
            <option value="read">Read</option>
            <option value="write">Write</option>
            <option value="admin">Admin</option>
          </select>
        </div>

        <div class="form-row search-row">
          <label for="search">Search</label>
          <input id="search" v-model="filters.search" placeholder="Search by name or menu" />
        </div>

        <div class="form-actions">
          <button type="submit" class="btn primary">Filter</button>
          <button type="button" class="btn" @click="resetFilters">Reset</button>
        </div>
      </form>

      <!-- Results -->
      <!-- <div class="results">
        <div class="results-head">
          <strong>Results ({{ filtered.length }})</strong>
        </div>

        <table class="results-table" v-if="filtered.length">
          <thead>
            <tr>
              <th>Role</th>
              <th>Menu</th>
              <th>Permission</th>
              <th>Last Updated</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="(row, idx) in filtered" :key="idx">
              <td>{{ row.roleName }}</td>
              <td>{{ row.menuLabel }}</td>
              <td>{{ row.permission }}</td>
              <td>{{ row.updated }}</td>
            </tr>
          </tbody>
        </table>

        <div v-else class="no-results">No matching permissions found</div>
      </div> -->
    </div>
  </template>

  <script setup>
  import { ref, computed } from 'vue'
  import rolesJson from '../data/roles.json'

  const roles = rolesJson.roles || []

  // Mock permission data: one entry per role/menu for demo purposes
  const mockData = []
  roles.forEach(r => {
    (r.menus || []).forEach(m => {
      mockData.push({
        roleId: r.id,
        roleName: r.name,
        menuKey: m.key,
        menuLabel: m.label,
        permission: ['read','write','admin'][Math.floor(Math.random()*3)],
        updated: new Date(Date.now() - Math.floor(Math.random()*100000000)).toLocaleString()
      })
    })
  })

  const filters = ref({ roleId: '', permission: '', search: '' })

  function applyFilter(){ /* reactive - computed does it */ }
  function resetFilters(){ filters.value = { roleId: '', permission: '', search: '' } }

  const filtered = computed(()=>{
    const f = filters.value
    return mockData.filter(row => {
      if(f.roleId && row.roleId !== f.roleId) return false
      if(f.permission && row.permission !== f.permission) return false
      if(f.search){
        const s = f.search.toLowerCase()
        if(! (row.roleName.toLowerCase().includes(s) || row.menuLabel.toLowerCase().includes(s))) return false
      }
      return true
    })
  })
  </script>

  <style scoped>
  .rp-page{max-width:1200px;margin:0 auto;padding:1rem}
  .page-title{font-size:1.4rem;margin-bottom:0.75rem}
  .filter-form{display:grid;grid-template-columns:repeat(4,1fr);gap:0.5rem;align-items:end;margin-bottom:1rem}
  .form-row{display:flex;flex-direction:column}
  .form-row label{font-size:0.9rem;margin-bottom:0.25rem;color:var(--muted)}
  .form-row select,.form-row input{padding:0.5rem;border-radius:8px;border:1px solid rgba(255,255,255,0.04);background:transparent;color:var(--text)}
  .search-row{grid-column: span 2}
  .form-actions{display:flex;gap:0.5rem;align-items:center}
  .btn{border-radius:8px;padding:0.5rem 0.75rem;border:1px solid rgba(255,255,255,0.04);background:transparent;color:var(--text);cursor:pointer}
  .btn.primary{background:linear-gradient(90deg,var(--primary),var(--accent));color:white;border:0}
  .results{margin-top:0.5rem}
  .results-head{margin-bottom:0.5rem}
  .results-table{width:100%;border-collapse:collapse}
  .results-table th,.results-table td{padding:0.6rem 0.75rem;text-align:left;border-bottom:1px solid rgba(255,255,255,0.03)}
  .no-results{padding:1rem;background:rgba(255,255,255,0.02);border-radius:8px}

  /* Responsive: stack fields on small screens */
  @media (max-width:720px){
    .filter-form{grid-template-columns:1fr;}
    .search-row{grid-column: auto}
    .role-btn{width:auto}
  }
  </style>
