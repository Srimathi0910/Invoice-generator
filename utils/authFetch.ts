// utils/authFetch.ts
export async function authFetch(url: string, options: RequestInit = {}) {
  let res = await fetch(url, { ...options, credentials: "include" });
  let data = await res.json();

  // If access token expired, try refresh
  if (res.status === 401) {
    const refreshRes = await fetch("/api/auth/refresh", {
      method: "POST",
      credentials: "include",
    });

    if (refreshRes.ok) {
      // Retry original request after refresh
      res = await fetch(url, { ...options, credentials: "include" });
      data = await res.json();

      if (!res.ok) throw data;
    } else {
      // Refresh failed → logout
      localStorage.removeItem("user");
      localStorage.removeItem("token");
      window.location.href = "/login";
      throw { error: "Session expired. Please login again." };
    }
  }

  // Other errors
  if (!res.ok) {
    throw data;
  }

  return data;
}
