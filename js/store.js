/**
 * store.js — Bus de estado compartido entre los módulos JS.
 * Los datos reales provienen del backend (backend.js).
 */

function generarId() {
  return Date.now().toString(36) + Math.random().toString(36).slice(2);
}

window.dccStore = {
  members: [],
  activities: [],
  generateId: generarId
};
