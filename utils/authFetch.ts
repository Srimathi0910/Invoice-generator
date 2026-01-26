export async function authFetch(url: string, options: RequestInit = {}) {
  let res = await fetch(url, { ...options, credentials: "include" });

  // If access token expired, try refresh
  if (res.status === 401) {
    const refreshRes = await fetch("/api/auth/refresh", {
      method: "POST",
      credentials: "include",
    });

    if (refreshRes.ok) {
      // Retry original request
      res = await fetch(url, { ...options, credentials: "include" });
    } else {
      // Refresh failed → logout
      localStorage.removeItem("user");
      window.location.href = "/login";
      throw new Error("Session expired. Please login again.");
    }
  }

  // Now parse response
  let data;
  try {
    data = await res.json();
  } catch {
    data = null;
  }

  if (!res.ok) {
    throw data || { error: "Request failed" };
  }

  return data;
}
