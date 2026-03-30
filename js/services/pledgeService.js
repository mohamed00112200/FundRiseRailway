import { ApiService } from "./apiService.js";
import { getNextId, sameId } from "../utils.js";

export class PledgeService {
  constructor() {
    this.api = new ApiService();
  }

  getAll() {
    return this.api.get("pledges");
  }

  async getByUser(userId) {
    const pledges = await this.getAll();
    return pledges.filter((pledge) => sameId(pledge.userId, userId));
  }

  async create(payload) {
    const pledges = await this.getAll();

    return this.api.post("pledges", {
      id: Number(getNextId(pledges)),
      ...payload,
      amount: Number(payload.amount),
    });
  }
}
