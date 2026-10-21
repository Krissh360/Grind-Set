const API_ROOT = process.env.REACT_APP_API_URL
  ? process.env.REACT_APP_API_URL.replace(/\/+$/, "")
  : "";

const BASE_URL = API_ROOT ? `${API_ROOT}/api` : "/api";

export async function registerUser(data) {
  const response = await fetch(`${BASE_URL}/auth/register`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(data),
  });

  const res = await response.json();

  if (!response.ok) {
    throw new Error(res.message || "Registration failed");
  }

  return res;
}

export async function loginUser(data) {
  const response = await fetch(`${BASE_URL}/auth/login`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(data),
  });

  const result = await response.json();

  if (!response.ok) {
    throw new Error(result.message || "Login failed");
  }

  return result;
}

export async function getCurrentUser() {
  const token = localStorage.getItem("token");

  const response = await fetch(`${BASE_URL}/auth/me`, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.message || "Session expired");
  }

  return data;
}

export async function deleteAccount() {
  const token = localStorage.getItem("token");

  const response = await fetch(`${BASE_URL}/auth/account`, {
    method: "DELETE",
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.message || "Unable to delete account");
  }

  return data;
}

export async function updateProfile(username) {
  const token = localStorage.getItem("token");

  const response = await fetch(`${BASE_URL}/auth/profile`, {
    method: "PATCH",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify({ username }),
  });

  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.message || "Failed to update profile");
  }

  return data;
}

export async function getHabits() {
  const token = localStorage.getItem("token");

  const response = await fetch(`${BASE_URL}/habits`, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.message || "Failed to fetch habits");
  }

  return data;
}

export async function addHabit(name) {
  const token = localStorage.getItem("token");

  const response = await fetch(`${BASE_URL}/habits`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify({ title: name }),
  });

  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.message || "Failed to add habit");
  }

  return data;
}

export async function completeHabit(id) {
  const token = localStorage.getItem("token");

  const response = await fetch(`${BASE_URL}/habits/complete/${id}`, {
    method: "PUT",
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.message || "Failed to complete habit");
  }

  return data;
}

export async function deleteHabit(id) {
  const token = localStorage.getItem("token");

  const response = await fetch(`${BASE_URL}/habits/${id}`, {
    method: "DELETE",
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.message || "Failed to delete habit");
  }

  return data;
}

export async function getAnalytics() {
  const token = localStorage.getItem("token");

  const response = await fetch(`${BASE_URL}/habits/analytics`, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.message || "Failed to fetch analytics");
  }

  return data;
}
