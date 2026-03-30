import { ApiService } from "./apiService.js";

export class AdminService {
  constructor() {
    this.api = new ApiService();
  }

  async getUsers() {
    return this.api.get("users");
  }

  getPledges() {
    return this.api.get("pledges");
  }

  async ban(id) {
    return this.api.patch(`users/${id}`, { isActive: false });
  }

  async unban(id) {
    return this.api.patch(`users/${id}`, { isActive: true });
  }
}
