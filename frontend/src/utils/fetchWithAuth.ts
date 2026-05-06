const API_URL = import.meta.env.VITE_API_URL;

export const fetchWithAuth = async (
  endpoint: string,
  options: RequestInit = {}
): Promise<Response> => {
  let access = localStorage.getItem("access");

  const res = await fetch(`${API_URL}${endpoint}`, {
    ...options,
    headers: {
      "Content-Type": "application/json",
      ...options.headers,
      Authorization: access ? `Bearer ${access}` : "",
    },
  });

  if (res.status === 401) {
    const refresh = localStorage.getItem("refresh");
    if (!refresh) throw new Error("Not logged in");

    const refreshRes = await fetch(`${API_URL}/refresh/`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ refresh }),
    });

    if (!refreshRes.ok) {
      localStorage.removeItem("access");
      localStorage.removeItem("refresh");
      window.location.href = "/#/login";
      throw new Error("Session expired, please log in again");
    }

    const data = await refreshRes.json();
    localStorage.setItem("access", data.access);

    // Retry original request
    return fetchWithAuth(endpoint, options); // still returns Promise<Response>
  }

  return res;
};
