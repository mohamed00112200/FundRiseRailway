import {
  escapeHtml,
  formatCurrency,
  formatDate,
  getUser,
  sameId,
  showTopMessage,
  setFlashMessage,
} from "../utils.js";

export class HomeUserPage {
  constructor(campaignService, pledgeService, authService) {
    this.campaignService = campaignService;
    this.pledgeService = pledgeService;
    this.authService = authService;
    this.state = {
      campaigns: [],
      pledges: [],
      myCampaigns: [],
      filters: {
        query: "",
        status: "all",
        category: "all",
      },
    };
  }

  async init() {
    this.user = getUser();
    if (!this.user || this.user.role !== "user") {
      window.location.href = "../index.html";
      return;
    }

    document.getElementById("userLabel").textContent = `Signed in as ${this.user.name}`;
    document.getElementById("logoutBtn").addEventListener("click", () => {
      this.authService.logout();
      window.location.href = "../index.html";
    });

    this.bindActivityViews();
    this.bindPaymentDialog();
    this.bindFilters();
    await this.loadData();
  }

  bindActivityViews() {
    this.myCampaignsModal = document.getElementById("myCampaignsModal");
    this.pledgeHistoryModal = document.getElementById("pledgeHistoryModal");

    document
      .getElementById("showMyCampaignsBtn")
      ?.addEventListener("click", () => this.openActivityModal(this.myCampaignsModal));

    document
      .getElementById("showPledgeHistoryBtn")
      ?.addEventListener("click", () => this.openActivityModal(this.pledgeHistoryModal));

    document
      .getElementById("closeMyCampaignsBtn")
      ?.addEventListener("click", () => this.closeActivityModal(this.myCampaignsModal));

    document
      .getElementById("closePledgeHistoryBtn")
      ?.addEventListener("click", () => this.closeActivityModal(this.pledgeHistoryModal));

    // this.myCampaignsModal?.addEventListener("click", (event) => {
    //   if (event.target === this.myCampaignsModal) {
    //     this.closeActivityModal(this.myCampaignsModal);
    //   }
    // });

    // this.pledgeHistoryModal?.addEventListener("click", (event) => {
    //   if (event.target === this.pledgeHistoryModal) {
    //     this.closeActivityModal(this.pledgeHistoryModal);
    //   }
    // });
  }

  openActivityModal(modal) {
    if (!modal) return;
    modal.classList.remove("hidden");
    document.body.classList.add("modal-open");
  }

  closeActivityModal(modal) {
    if (!modal) return;
    modal.classList.add("hidden");
    if (this.paymentModal?.classList.contains("hidden")) {
      document.body.classList.remove("modal-open");
    }
  }

  bindPaymentDialog() {
    this.paymentModal = document.getElementById("paymentModal");
    this.paymentForm = document.getElementById("paymentForm");
    this.paymentMethod = document.getElementById("paymentMethod");
    this.paymentCampaign = document.getElementById("paymentCampaign");
    this.paymentAmount = document.getElementById("paymentAmount");

    document.getElementById("closePaymentBtn")?.addEventListener("click", () => {
      this.closePaymentDialog();
    });

    document.getElementById("cancelPaymentBtn")?.addEventListener("click", () => {
      this.closePaymentDialog();
    });

    // this.paymentModal?.addEventListener("click", (event) => {
    //   if (event.target === this.paymentModal) {
    //     this.closePaymentDialog();
    //   }
    // });

    this.paymentMethod?.addEventListener("change", () => {
      this.updatePaymentLabels();
    });

    this.paymentForm?.addEventListener("submit", async (event) => {
      event.preventDefault();
      await this.submitPayment();
    });
  }

  bindFilters() {
    document.getElementById("searchInput")?.addEventListener("input", (event) => {
      this.state.filters.query = event.target.value.trim().toLowerCase();
      this.renderCampaigns();
    });

    document.getElementById("statusFilter")?.addEventListener("change", (event) => {
      this.state.filters.status = event.target.value;
      this.renderCampaigns();
    });

    document.getElementById("categoryFilter")?.addEventListener("change", (event) => {
      this.state.filters.category = event.target.value;
      this.renderCampaigns();
    });
  }

  async loadData() {
    const [campaigns, pledges, myCampaigns] = await Promise.all([
      this.campaignService.getApproved(),
      this.pledgeService.getAll(),
      this.campaignService.getByCreator(this.user.id),
    ]);

    this.state.campaigns = campaigns;
    this.state.pledges = pledges;
    this.state.myCampaigns = myCampaigns;

    this.populateCategories(campaigns);
    this.renderCampaigns();
    this.renderMyCampaigns();
    this.renderPledgeHistory();
    this.renderStats();
  }

  populateCategories(campaigns) {
    const select = document.getElementById("categoryFilter");
    if (!select) return;

    const categories = [...new Set(campaigns.map((campaign) => campaign.category || "General"))];

    select.innerHTML = `
      <option value="all">All categories</option>
      ${categories
        .map((category) => `<option value="${escapeHtml(category)}">${escapeHtml(category)}</option>`)
        .join("")}
    `;
  }

  getCampaignProgress(campaign) {
    const total = this.state.pledges
      .filter((pledge) => sameId(pledge.campaignId, campaign.id))
      .reduce((sum, pledge) => sum + Number(pledge.amount), 0);

    return {
      total,
      percent: Math.min((total / Number(campaign.goal || 1)) * 100, 100),
    };
  }

  getFilteredCampaigns() {
    return this.state.campaigns.filter((campaign) => {
      const query = this.state.filters.query;
      const category = campaign.category || "General";
      const { total } = this.getCampaignProgress(campaign);

      const matchesQuery =
        !query ||
        campaign.title.toLowerCase().includes(query) ||
        campaign.description.toLowerCase().includes(query);
      const matchesCategory =
        this.state.filters.category === "all" ||
        category === this.state.filters.category;

      let matchesStatus = true;
      if (this.state.filters.status === "active") {
        matchesStatus = total < Number(campaign.goal);
      }
      if (this.state.filters.status === "completed") {
        matchesStatus = total >= Number(campaign.goal);
      }

      return matchesQuery && matchesCategory && matchesStatus;
    });
  }

  renderCampaigns() {
    const container = document.getElementById("campaigns-container");
    if (!container) return;

    const campaigns = this.getFilteredCampaigns();

    if (!campaigns.length) {
      container.innerHTML =
        '<div class="empty-state">No campaigns match your current filters.</div>';
      return;
    }

    container.innerHTML = campaigns
      .map((campaign) => {
        const { total, percent } = this.getCampaignProgress(campaign);
        const category = campaign.category || "General";
        const isOwner = sameId(campaign.creatorId, this.user.id);

        return `
          <article class="campaign-card">
            ${
              campaign.image
                ? `<img class="campaign-card__image" src="${campaign.image}" alt="${escapeHtml(campaign.title)}" />`
                : ""
            }
            <div class="campaign-card__meta">
              <span class="pill pill--success">${escapeHtml(category)}</span>
              <span>Deadline ${formatDate(campaign.deadline)}</span>
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
              <div class="campaign-support">
                <input id="amount-${campaign.id}" type="number" min="1" placeholder="Pledge amount" />
                <button class="btn btn--primary btn--small" data-support-id="${campaign.id}" type="button">
                  Support
                </button>
              </div>
              ${
                isOwner
                  ? `<a class="btn btn--ghost btn--small" href="./CreateCampaign.html?id=${campaign.id}">Edit</a>`
                  : ""
              }
            </div>
          </article>
        `;
      })
      .join("");

    container.querySelectorAll("[data-support-id]").forEach((button) => {
      button.addEventListener("click", () => {
        this.supportCampaign(button.dataset.supportId);
      });
    });
  }

  async supportCampaign(campaignId) {
    const amountField = document.getElementById(`amount-${campaignId}`);
    const amount = Number(amountField?.value);
    const campaign = this.state.campaigns.find((item) => sameId(item.id, campaignId));

    if (!amount || amount <= 0) {
      showTopMessage("Enter a valid pledge amount before continuing.", "error");
      return;
    }

    if (!campaign) {
      showTopMessage("This campaign could not be found.", "error");
      return;
    }

    this.pendingPayment = {
      campaignId,
      amount,
      inputId: `amount-${campaignId}`,
    };

    this.openPaymentDialog(campaign, amount);
  }

  openPaymentDialog(campaign, amount) {
    if (!this.paymentModal) return;

    this.paymentCampaign.textContent = campaign.title;
    this.paymentAmount.textContent = formatCurrency(amount);
    this.paymentForm.reset();
    this.updatePaymentLabels();
    this.paymentModal.classList.remove("hidden");
    document.body.classList.add("modal-open");
  }

  closePaymentDialog() {
    if (!this.paymentModal) return;
    this.paymentModal.classList.add("hidden");
    if (
      this.myCampaignsModal?.classList.contains("hidden") &&
      this.pledgeHistoryModal?.classList.contains("hidden")
    ) {
      document.body.classList.remove("modal-open");
    }
    this.pendingPayment = null;
  }

  updatePaymentLabels() {
    const method = this.paymentMethod?.value || "visa";
    const accountLabel = document.getElementById("paymentAccountLabel");
    const detailsLabel = document.getElementById("paymentDetailsLabel");
    const accountInput = document.getElementById("paymentAccountName");
    const detailsInput = document.getElementById("paymentAccountNumber");

    if (!accountLabel || !detailsLabel || !accountInput || !detailsInput) return;

    if (method === "paypal") {
      accountLabel.textContent = "Account";
      detailsLabel.textContent = "Reference";
      accountInput.placeholder = "mohamed.paypal";
      detailsInput.placeholder = "PAY-2048";
      return;
    }

    if (method === "apple-pay") {
      accountLabel.textContent = "Account";
      detailsLabel.textContent = "Reference";
      accountInput.placeholder = "Mohamed Wallet";
      detailsInput.placeholder = "APPLE-1010";
      return;
    }

    if (method === "mastercard") {
      accountLabel.textContent = "Account";
      detailsLabel.textContent = "Reference";
      accountInput.placeholder = "Mohamed Lotfy";
      detailsInput.placeholder = "MC-5454";
      return;
    }

    accountLabel.textContent = "Account";
    detailsLabel.textContent = "Reference";
    accountInput.placeholder = "Mohamed Lotfy";
    detailsInput.placeholder = "VISA-4242";
  }

  async submitPayment() {
    if (!this.pendingPayment) return;

    const accountName = document.getElementById("paymentAccountName").value.trim();
    const accountNumber = document.getElementById("paymentAccountNumber").value.trim();
    const method = this.paymentMethod.value;

    if (!accountName || !accountNumber) {
      showTopMessage("Complete the sample payment fields before confirming.", "error");
      return;
    }

    await this.pledgeService.create({
      campaignId: this.pendingPayment.campaignId,
      userId: this.user.id,
      amount: this.pendingPayment.amount,
      paymentMethod: method,
      paymentAccount: accountName,
      paymentReference: accountNumber,
    });

    const amountField = document.getElementById(this.pendingPayment.inputId);
    if (amountField) {
      amountField.value = "";
    }

    this.closePaymentDialog();
    await this.loadData();
    setFlashMessage(
      `Mock payment confirmed with ${this.getPaymentMethodLabel(method)}. Thank you for your support.`,
    );
  }

  getPaymentMethodLabel(method) {
    if (method === "paypal") return "PayPal";
    if (method === "mastercard") return "Mastercard";
    if (method === "apple-pay") return "Apple Pay";
    return "Visa";
  }

  renderMyCampaigns() {
    const container = document.getElementById("myCampaigns");
    if (!container) return;

    if (!this.state.myCampaigns.length) {
      container.innerHTML =
        '<div class="empty-state">You have not created any campaigns yet.</div>';
      return;
    }

    container.innerHTML = this.state.myCampaigns
      .map((campaign) => {
        const statusClass = campaign.isApproved ? "pill--success" : "pill--warn";
        const statusText = campaign.isApproved ? "Approved" : "Pending";

        return `
          <article class="list-card">
            <div class="list-card__meta">
              <span class="pill ${statusClass}">${statusText}</span>
              <span>${escapeHtml(campaign.category || "General")}</span>
              <span>${formatDate(campaign.deadline)}</span>
            </div>
            <div>
              <h3>${escapeHtml(campaign.title)}</h3>
              <p>${escapeHtml(campaign.description)}</p>
            </div>
            <div class="list-card__actions">
              <span>${formatCurrency(campaign.goal)} goal</span>
              <a class="btn btn--ghost btn--small" href="./CreateCampaign.html?id=${campaign.id}">
                Edit details
              </a>
            </div>
          </article>
        `;
      })
      .join("");
  }

  renderPledgeHistory() {
    const container = document.getElementById("pledgeHistory");
    if (!container) return;

    const myPledges = this.state.pledges.filter(
      (pledge) => sameId(pledge.userId, this.user.id),
    );

    if (!myPledges.length) {
      container.innerHTML =
        '<div class="empty-state">You have not pledged to any campaigns yet.</div>';
      return;
    }

    container.innerHTML = myPledges
      .map((pledge) => {
        const campaign = this.state.campaigns.find(
          (item) => sameId(item.id, pledge.campaignId),
        );

        return `
          <article class="list-card">
            <div class="list-card__meta">
              <span>${formatCurrency(pledge.amount)}</span>
              <span>Campaign #${pledge.campaignId}</span>
            </div>
            <div>
              <h3>${escapeHtml(campaign?.title || "Campaign removed")}</h3>
              <p>${escapeHtml(campaign?.description || "This campaign is no longer available.")}</p>
            </div>
          </article>
        `;
      })
      .join("");
  }

  renderStats() {
    const myPledges = this.state.pledges.filter(
      (pledge) => sameId(pledge.userId, this.user.id),
    );
    const totalSupported = myPledges.reduce(
      (sum, pledge) => sum + Number(pledge.amount),
      0,
    );

    document.getElementById("myCampaignCount").textContent =
      this.state.myCampaigns.length;
    document.getElementById("myPledgeCount").textContent = myPledges.length;
    document.getElementById("myPledgeTotal").textContent =
      formatCurrency(totalSupported);
  }
}
