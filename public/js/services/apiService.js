import { BASE_URL } from "../config.js";

export class ApiService {
  async get(path) {
    const response = await fetch(`${BASE_URL}/${path}`);

    if (!response.ok) {
      throw new Error(`Request failed: ${response.status}`);
    }

    return response.json();
  }

  async post(path, data) {
    const response = await fetch(`${BASE_URL}/${path}`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(data),
    });

    if (!response.ok) {
      throw new Error(`Request failed: ${response.status}`);
    }

    return response.json();
  }

  async patch(path, data) {
    const response = await fetch(`${BASE_URL}/${path}`, {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(data),
    });

    if (!response.ok) {
      throw new Error(`Request failed: ${response.status}`);
    }

    return response.json();
  }

  async delete(path) {
    const response = await fetch(`${BASE_URL}/${path}`, {
      method: "DELETE",
    });

    if (!response.ok) {
      throw new Error(`Request failed: ${response.status}`);
    }

    return null;
  }
}
