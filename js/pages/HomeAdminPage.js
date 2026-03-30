import {
  escapeHtml,
  formatCurrency,
  formatDate,
  getUser,
  sameId,
  setFlashMessage,
  showTopMessage,
} from "../utils.js";

export class HomeAdminPage {
  constructor(adminService, campaignService, pledgeService, authService) {
    this.adminService = adminService;
    this.campaignService = campaignService;
    this.pledgeService = pledgeService;
    this.authService = authService;
  }

  async init() {
    this.user = getUser();

    if (!this.user || this.user.role !== "admin") {
      setFlashMessage(
        "Access denied. Please login with an admin account.",
        "error",
      );
      window.location.href = "../index.html";
      return;
    }

    document.getElementById("userLabel").textContent =
      `Admin ${this.user.name}`;
    document.getElementById("logoutBtn").addEventListener("click", () => {
      this.authService.logout();
      window.location.href = "../index.html";
    });

    this.bindDeleteDialog();
    this.bindSidebar();
    await this.loadData();
  }
//#
  bindDeleteDialog() {
    this.deleteModal = document.getElementById("deleteCampaignModal");
    this.deleteCampaignTitle = document.getElementById("deleteCampaignTitle");

    document
      .getElementById("closeDeleteModalBtn")
      ?.addEventListener("click", () => {
        this.closeDeleteDialog();
      });

    document
      .getElementById("cancelDeleteBtn")
      ?.addEventListener("click", () => {
        this.closeDeleteDialog();
      });

    document
      .getElementById("confirmDeleteBtn")
      ?.addEventListener("click", async () => {
        if (!this.pendingDeleteId) return;

        await this.campaignService.delete(this.pendingDeleteId);
        this.closeDeleteDialog();
        await this.loadData();
        showTopMessage("Campaign deleted successfully.");
      });

    // this.deleteModal?.addEventListener("click", (event) => {
    //   if (event.target === this.deleteModal) {
    //     this.closeDeleteDialog();
    //   }
    // });
  }
//#
  bindSidebar() {
    const buttons = document.querySelectorAll("[data-section]");

    buttons.forEach((button) => {
      button.addEventListener("click", () => {
        this.showSection(button.dataset.section);
      });
    });
  }
//#
  showSection(sectionName) {
    const sections = document.querySelectorAll(".admin-section");
    const buttons = document.querySelectorAll("[data-section]");

    sections.forEach((section) => {
      section.classList.add("hidden");
    });

    buttons.forEach((button) => {
      button.classList.remove("admin-tab--active");
    });

    const activeSection = document.getElementById(`section-${sectionName}`);
    const activeButton = document.querySelector(
      `[data-section="${sectionName}"]`,
    );

    if (activeSection) {
      activeSection.classList.remove("hidden");
    }

    if (activeButton) {
      activeButton.classList.add("admin-tab--active");
    }
  }
//#
  openDeleteDialog(campaign) {
    if (!this.deleteModal) return;

    this.pendingDeleteId = campaign.id;
    this.deleteCampaignTitle.textContent = campaign.title;
    this.deleteModal.classList.remove("hidden");
    document.body.classList.add("modal-open");
  }
//#
  closeDeleteDialog() {
    if (!this.deleteModal) return;

    this.deleteModal.classList.add("hidden");
    document.body.classList.remove("modal-open");
    this.pendingDeleteId = null;
  }
//#
  async loadData() {
    const [users, campaigns, pledges] = await Promise.all([
      this.adminService.getUsers(),
      this.campaignService.getAll(),
      this.pledgeService.getAll(),
    ]);

    this.users = users;
    this.campaigns = campaigns;
    this.pledges = pledges;

    this.renderStats();
    this.renderUsers();
    this.renderCampaigns();
    this.renderPledges();
  }
//#
  renderStats() {
    document.getElementById("userCount").textContent = this.users.length;
    document.getElementById("campaignCount").textContent =
      this.campaigns.length;
    document.getElementById("pledgeCount").textContent = this.pledges.length;
  }
//#
  renderUsers() {
    const container = document.getElementById("adminUsers");
    if (!container) return;

    container.innerHTML = this.users
      .map((user) => {
        const statusClass = user.isActive ? "pill--success" : "pill--danger";
        const statusText = user.isActive ? "Active" : "Banned";
        const isAdmin = user.role === "admin";

        return `
          <article class="list-card admin-row">
            <div class="admin-row__top">
              <div>
                <h3>${escapeHtml(user.name)}</h3>
                <p class="admin-note">${escapeHtml(user.email)} | ${escapeHtml(user.role)}</p>
              </div>
              <span class="pill ${statusClass}">${statusText}</span>
            </div>
            <div class="admin-row__actions">
              ${
                isAdmin
                  ? ""
                  : user.isActive
                    ? `<button class="btn btn--danger btn--small" data-ban-id="${user.id}" type="button">Ban user</button>`
                    : `<button class="btn btn--ghost btn--small" data-unban-id="${user.id}" type="button">Unban user</button>`
              }
            </div>
          </article>
        `;
      })
      .join("");

    container.querySelectorAll("[data-ban-id]").forEach((button) => {
      button.addEventListener("click", async () => {
        await this.adminService.ban(button.dataset.banId);
        await this.loadData();
        showTopMessage("User banned successfully.");
      });
    });

    container.querySelectorAll("[data-unban-id]").forEach((button) => {
      button.addEventListener("click", async () => {
        await this.adminService.unban(button.dataset.unbanId);
        await this.loadData();
        showTopMessage("User unbanned successfully.");
      });
    });
  }
//#
  renderCampaigns() {
    const container = document.getElementById("adminCampaigns");
    if (!container) return;

    container.innerHTML = this.campaigns
      .map((campaign) => {
        const statusClass = campaign.isApproved
          ? "pill--success"
          : "pill--warn";
        const statusText = campaign.isApproved ? "Approved" : "Pending";

        return `
          <article class="list-card admin-row">
            <div class="admin-row__top">
              <div>
                <h3>${escapeHtml(campaign.title)}</h3>
                <p class="admin-note">
                  ${escapeHtml(campaign.category || "General")} | Goal ${formatCurrency(campaign.goal)} | ${formatDate(campaign.deadline)}
                </p>
              </div>
              <span class="pill ${statusClass}">${statusText}</span>
            </div>
            <p>${escapeHtml(campaign.description)}</p>
            <div class="admin-row__actions">
              ${
                campaign.isApproved
                  ? `<button class="btn btn--ghost btn--small" data-reject-id="${campaign.id}" type="button">Reject</button>`
                  : `<button class="btn btn--primary btn--small" data-approve-id="${campaign.id}" type="button">Approve</button>`
              }
              <button class="btn btn--danger btn--small" data-delete-id="${campaign.id}" type="button">
                Delete
              </button>
            </div>
          </article>
        `;
      })
      .join("");

    container.querySelectorAll("[data-approve-id]").forEach((button) => {
      button.addEventListener("click", async () => {
        await this.campaignService.approve(button.dataset.approveId);
        await this.loadData();
        showTopMessage("Campaign approved successfully.");
      });
    });

    container.querySelectorAll("[data-reject-id]").forEach((button) => {
      button.addEventListener("click", async () => {
        await this.campaignService.reject(button.dataset.rejectId);
        await this.loadData();
        showTopMessage("Campaign moved back to pending review.");
      });
    });

    container.querySelectorAll("[data-delete-id]").forEach((button) => {
      button.addEventListener("click", async () => {
        const campaign = this.campaigns.find((item) =>
          sameId(item.id, button.dataset.deleteId),
        );

        if (!campaign) {
          showTopMessage("The selected campaign could not be found.", "error");
          return;
        }

        this.openDeleteDialog(campaign);
      });
    });
  }
//#
  renderPledges() {
    const container = document.getElementById("adminPledges");
    if (!container) return;

    if (!this.pledges.length) {
      container.innerHTML = '<div class="empty-state">No pledges found.</div>';
      return;
    }

    container.innerHTML = this.pledges
      .map((pledge) => {
        const user = this.users.find((item) => sameId(item.id, pledge.userId));
        const campaign = this.campaigns.find((item) =>
          sameId(item.id, pledge.campaignId),
        );

        return `
          <article class="list-card">
            <div class="list-card__meta">
              <span>${formatCurrency(pledge.amount)}</span>
              <span>User ${escapeHtml(user?.name || "Invalid reference")}</span>
            </div>
            <div>
              <h3>${escapeHtml(campaign?.title || `Campaign #${pledge.campaignId}`)}</h3>
              <p>Supported by ${escapeHtml(user?.email || "invalid pledge record")}</p>
            </div>
          </article>
        `;
      })
      .join("");
  }
}
