export function getParam(searchParams, key, fallback = "") {
  const v = searchParams.get(key);
  return v === null ? fallback : v;
}

export function setParams(current, next) {
  const sp = new URLSearchParams(current);
  Object.entries(next).forEach(([k, v]) => {
    if (v === undefined || v === null || v === "") sp.delete(k);
    else sp.set(k, String(v));
  });
  const qs = sp.toString();
  return qs ? `?${qs}` : "";
}

