// src/utils.js

export function formatDate(iso) {
  return new Date(iso).toLocaleDateString('en-US', {
    month: 'short', day: 'numeric', year: 'numeric',
  });
}

export function formatDateFull(iso) {
  return new Date(iso).toLocaleDateString('en-US', {
    weekday: 'short', month: 'long', day: 'numeric', year: 'numeric',
  });
}

export function getErrorMessage(err) {
  return err?.response?.data?.error || err?.message || 'Something went wrong.';
}
