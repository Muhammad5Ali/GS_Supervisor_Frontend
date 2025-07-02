// lib/jwtUtils.js
export function decodeJwt(token) {
  try {
    return JSON.parse(atob(token.split('.')[1]));
  } catch {
    return null;
  }
}

export function isJwtExpired(token) {
  const payload = decodeJwt(token);
  if (!payload?.exp) return true;
  return payload.exp * 1000 < Date.now();
}