//  <div class="progress"><span style="width:${percent}%"></span></div> progress bar Line 137
import { escapeHtml, formatCurrency, formatDate, sameId } from "../utils.js";

export class LandingPage {
  constructor(campaignService, pledgeService) {
    this.campaignService = campaignService;
    this.pledgeService = pledgeService;
    this.state = {
      campaigns: [],
      pledges: [],
      query: "",
      category: "all",
    };
  }

  async init() {
    this.bindFilters();

    const [campaigns, pledges] = await Promise.all([
      this.campaignService.getApproved(),
      this.pledgeService.getAll(),
    ]);

    this.state.campaigns = campaigns;
    this.state.pledges = pledges;

    this.populateCategories();
    this.renderStats();
    this.renderCampaigns();
  }

  bindFilters() {
    document
      .getElementById("searchInput")
      ?.addEventListener("input", (event) => {
        this.state.query = event.target.value.trim().toLowerCase();
        this.renderCampaigns();
      });

    document
      .getElementById("categoryFilter")
      ?.addEventListener("change", (event) => {
        this.state.category = event.target.value;
        this.renderCampaigns();
      });
  }

  //categoryFilter select
  populateCategories() {
    const select = document.getElementById("categoryFilter");
    if (!select) return;

    const categories = [
      ...new Set(
        this.state.campaigns.map((campaign) => campaign.category || "General"),
      ),
    ];
    select.innerHTML = `
      <option value="all">All categories</option>
      ${categories
        .map(
          (category) =>
            `<option value="${escapeHtml(category)}">${escapeHtml(category)}</option>`,
        )
        .join("")}
    `;
  }

  getProgress(campaign) {
    const total = this.state.pledges
      .filter((pledge) => sameId(pledge.campaignId, campaign.id))
      .reduce((sum, pledge) => sum + Number(pledge.amount), 0);

    return {
      total,
      percent: Math.min((total / Number(campaign.goal || 1)) * 100, 100),
    };
  }

  renderStats() {
    const totalPledged = this.state.pledges.reduce(
      (sum, pledge) => sum + Number(pledge.amount),
      0,
    );
    const categories = new Set(
      this.state.campaigns.map((campaign) => campaign.category || "General"),
    );

    document.getElementById("approvedCount").textContent =
      this.state.campaigns.length;
    document.getElementById("pledgedTotal").textContent =
      formatCurrency(totalPledged);
    document.getElementById("categoryCount").textContent = categories.size;
  }

  renderCampaigns() {
    const container = document.getElementById("campaigns-container");
    if (!container) return;

    const campaigns = this.state.campaigns.filter((campaign) => {
      const category = campaign.category || "General";
      const matchesCategory =
        this.state.category === "all" || category === this.state.category;
      const matchesQuery =
        !this.state.query ||
        campaign.title.toLowerCase().includes(this.state.query) ||
        campaign.description.toLowerCase().includes(this.state.query);

      return matchesCategory && matchesQuery;
    });

    if (!campaigns.length) {
      container.innerHTML =
        '<div class="empty-state">No approved campaigns match your search yet.</div>';
      return;
    }

    container.innerHTML = campaigns
      .map((campaign) => {
        const { total, percent } = this.getProgress(campaign);

        return `
          <article class="campaign-card">
            ${
              campaign.image
                ? `<img class="campaign-card__image" src="${campaign.image}" alt="${escapeHtml(campaign.title)}" />`
                : ""
            }
            <div class="campaign-card__meta">
              <span class="pill pill--success">${escapeHtml(campaign.category || "General")}</span>
              <span>${formatDate(campaign.deadline)}</span>
            </div>
            <div>
              <h3>${escapeHtml(campaign.title)}</h3>
              <p>${escapeHtml(campaign.description)}</p>
            </div>
            <div>
              <div class="progress"><span style="width:${percent}%"></span></div>
              <div class="campaign-card__meta">
                <span>${formatCurrency(total)} pledged</span>
                <span>Goal ${formatCurrency(campaign.goal)}</span>
              </div>
            </div>
            <div class="campaign-card__footer">
              <span>Login to support this campaign</span>
              <a class="btn btn--ghost btn--small" href="./pages/login.html">Login</a>
            </div>
          </article>
        `;
      })
      .join("");
  }
}
