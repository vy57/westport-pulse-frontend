const DEFAULT_API_BASE_URL = 'http://localhost:3000';

const normalizedBase = (() => {
  const configured =
    typeof window !== 'undefined' && typeof window.__API_BASE_URL__ === 'string'
      ? window.__API_BASE_URL__
      : DEFAULT_API_BASE_URL;

  return configured.replace(/\/$/, '');
})();

export const config = {
  API_BASE_URL: normalizedBase,
  DEFAULT_ZIP_CODE: '06880',
};
