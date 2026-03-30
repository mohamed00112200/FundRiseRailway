import { ApiService } from "./apiService.js";
import { getNextId, sameId } from "../utils.js";

export class CampaignService {
  constructor() {
    this.api = new ApiService();
  }

  async getAll() {
    return this.api.get("campaigns");
  }

  async getApproved() {
    const campaigns = await this.getAll();
    return campaigns.filter((campaign) => campaign.isApproved == true);
  }

  async getById(id) {
    return this.api.get(`campaigns/${id}`);
  }

  async getByCreator(creatorId) {
    const campaigns = await this.getAll();
    return campaigns.filter((campaign) => sameId(campaign.creatorId, creatorId));
  }

  async create(payload) {
    const campaigns = await this.getAll();
    return this.api.post("campaigns", {
      id: Number(getNextId(campaigns)),
      ...payload,
      isApproved: false,
    });
  }

  async update(id, payload) {
    return this.api.patch(`campaigns/${id}`, payload);
  }

  approve(id) {
    return this.update(id, { isApproved: true });
  }

  reject(id) {
    return this.update(id, { isApproved: false });
  }

  delete(id) {
    return this.api.delete(`campaigns/${id}`);
  }
}
