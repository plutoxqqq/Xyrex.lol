const state = {
  activePage: 'executorsPage'
};

export function setState(key, value) { state[key] = value; }
export function getState(key) { return state[key]; }
