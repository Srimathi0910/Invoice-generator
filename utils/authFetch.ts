// utils/authFetch.ts
export async function authFetch(url: string, options: RequestInit = {}) {
  let res = await fetch(url, { ...options, credentials: "include" });

  // If access token expired
  if (res.status === 401) {
    // Call refresh token endpoint
    const refreshRes = await fetch("/api/auth/refresh", {
      method: "POST",
      credentials: "include",
    });

    if (refreshRes.ok) {
      // Retry original request
      res = await fetch(url, { ...options, credentials: "include" });
    } else {
      // Logout user if refresh fails
      localStorage.removeItem("user");
      localStorage.removeItem("token");
      window.location.href = "/login";
      return;
    }
  }

  return res.json();
}
