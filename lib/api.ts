const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:4000";

function getAuthHeaders() {
  if (typeof window === "undefined") return {};
  const token = window.localStorage.getItem("luxury_token");
  return token ? { Authorization: `Bearer ${token}` } : {};
}

type RequestBody = unknown | FormData | undefined;

function isFormData(body: RequestBody): body is FormData {
  return typeof FormData !== "undefined" && body instanceof FormData;
}

async function request<T>(
  path: string,
  options?: RequestInit & { body?: RequestBody },
): Promise<T> {
  const isMultipart = isFormData(options?.body);

  const res = await fetch(`${API_URL}${path}`, {
    ...options,
    headers: {
      ...getAuthHeaders(),
      ...(isMultipart ? {} : { "Content-Type": "application/json" }),
      ...(options?.headers || {}),
    },
    cache: "no-store",
  });

  if (!res.ok) {
    throw new Error((await res.text()) || "API request failed");
  }

  if (res.status === 204) {
    return null as T;
  }

  const contentType = res.headers.get("content-type") || "";
  if (!contentType.includes("application/json")) {
    return null as T;
  }

  return res.json();
}

export const api = {
  get: <T>(path: string) => request<T>(path),

  post: <T>(path: string, body: RequestBody, options?: RequestInit) =>
    request<T>(path, {
      ...options,
      method: "POST",
      body: isFormData(body) ? body : JSON.stringify(body),
    }),

  patch: <T>(path: string, body: RequestBody, options?: RequestInit) =>
    request<T>(path, {
      ...options,
      method: "PATCH",
      body: isFormData(body) ? body : JSON.stringify(body),
    }),

  put: <T>(path: string, body: RequestBody, options?: RequestInit) =>
    request<T>(path, {
      ...options,
      method: "PUT",
      body: isFormData(body) ? body : JSON.stringify(body),
    }),

  delete: <T>(path: string, options?: RequestInit) =>
    request<T>(path, {
      ...options,
      method: "DELETE",
    }),
};
