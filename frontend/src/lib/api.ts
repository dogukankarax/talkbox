import { router } from "@/lib/router";

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:3000/api";

export function setToken(token: string) {
  localStorage.setItem("token", token);
}

export function getToken() {
  return localStorage.getItem("token");
}

export function removeToken() {
  localStorage.removeItem("token");
}

async function fetchAPI(endpoint: string, options: RequestInit = {}) {
  const token = getToken();

  const headers: Record<string, string> = {
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
  };

  if (options.body) {
    headers["Content-Type"] = "application/json";
  }

  const response = await fetch(`${API_URL}${endpoint}`, {
    ...options,
    headers: {
      ...headers,
      ...options.headers,
    },
  });

  if (response.status === 401) {
    removeToken();
    router.navigate({ to: "/login" });
    throw new Error("Unauthorized");
  }

  if (!response.ok) {
    const errorData = await response.json();
    const errorMessage =
      typeof errorData.error === "string"
        ? errorData.error
        : errorData.error?.[0]?.message || "API request failed";
    throw new Error(errorMessage);
  }

  if (response.status === 204) {
    return null;
  }

  return response.json();
}

export function login(email: string, password: string) {
  return fetchAPI("/auth/login", {
    method: "POST",
    body: JSON.stringify({ email, password }),
  });
}

export function register(username: string, email: string, password: string) {
  return fetchAPI("/auth/register", {
    method: "POST",
    body: JSON.stringify({ email, password, username }),
  });
}

export function getChannels() {
  return fetchAPI("/channels");
}

export function getMessages(channelId: string) {
  return fetchAPI(`/channels/${channelId}/messages`);
}

export function createChannel(name: string) {
  return fetchAPI("/channels", {
    method: "POST",
    body: JSON.stringify({ name }),
  });
}

export function joinChannel(invite_code: string) {
  return fetchAPI("/channels/join", {
    method: "POST",
    body: JSON.stringify({ invite_code }),
  });
}

export function getChannelMembers(channelId: string) {
  return fetchAPI(`/channels/${channelId}/members`);
}

export function getMe() {
  return fetchAPI("/auth/me");
}

export function updateChannel(channelId: string, name: string) {
  return fetchAPI(`/channels/${channelId}`, {
    method: "PATCH",
    body: JSON.stringify({ name }),
  });
}

export function deleteChannel(channelId: string) {
  return fetchAPI(`/channels/${channelId}`, {
    method: "DELETE",
  });
}

export function leaveChannel(channelId: string) {
  return fetchAPI(`/channels/${channelId}/leave`, {
    method: "POST",
  });
}

export function removeMember(channelId: string, userId: string) {
  return fetchAPI(`/channels/${channelId}/members/${userId}`, {
    method: "DELETE",
  });
}

export function updateMemberRole(
  channelId: string,
  userId: string,
  role: "admin" | "member",
) {
  return fetchAPI(`/channels/${channelId}/members/${userId}/role`, {
    method: "PATCH",
    body: JSON.stringify({ role }),
  });
}
