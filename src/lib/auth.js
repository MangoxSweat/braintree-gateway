import {writable} from 'svelte/store';

export const user = writable(null);

// Function to load user from localStorage or cookies
export const loadUser = () => {
  const userData = JSON.parse(localStorage.getItem('user') || 'null');
  user.set(userData);
};

// Function to log in (set user data in localStorage and store)
export const login = (userData) => {
  localStorage.setItem('user', JSON.stringify(userData));
  user.set(userData);
};

// Function to log out
export const logout = () => {
  localStorage.removeItem('user');
  user.set(null);
};
