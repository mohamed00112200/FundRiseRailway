import { getUser, sameId, setFlashMessage, showTopMessage } from "../utils.js";

export class CreateCampaignPage {
  constructor(campaignService, authService) {
    this.campaignService = campaignService;
    this.authService = authService;
    this.imageBase64 = "";
  }

  async init() {
    this.user = getUser();

    if (!this.user || this.user.role !== "user") {
      window.location.href = "../index.html";
      return;
    }

    document.getElementById("logoutBtn").addEventListener("click", () => {
      this.authService.logout();
      window.location.href = "../index.html";
    });

    this.form = document.getElementById("campaignForm");
    this.imageInput = document.getElementById("image");
    this.preview = document.getElementById("imagePreview");

    this.imageInput?.addEventListener("change", (event) => {
      this.handleImage(event.target.files?.[0]);
    });

    const url = new URL(window.location.href);
    this.campaignId = url.searchParams.get("id");

    if (this.campaignId) {
      await this.loadCampaign();
    }

    this.form?.addEventListener("submit", async (event) => {
      event.preventDefault();
      await this.submit();
    });
  }

  async loadCampaign() {
    const campaign = await this.campaignService.getById(this.campaignId);

    if (!sameId(campaign.creatorId, this.user.id)) {
      setFlashMessage("You can only edit campaigns that belong to your account.", "error");
      window.location.href = "./HomeUser.html";
      return;
    }

    this.editingCampaign = campaign;
    document.getElementById("formHeading").textContent = "Update your campaign";
    document.getElementById("submitBtn").textContent = "Save Changes";
    document.getElementById("title").value = campaign.title;
    document.getElementById("category").value = campaign.category || "";
    document.getElementById("description").value = campaign.description;
    document.getElementById("goal").value = campaign.goal;
    document.getElementById("deadline").value = campaign.deadline;

    if (campaign.image) {
      this.imageBase64 = campaign.image;
      this.preview.src = campaign.image;
      this.preview.style.display = "block";
    }
  }

  handleImage(file) {
    if (!file) {
      return;
    }

    if (!file.type.startsWith("image/")) {
      showTopMessage("Please choose a valid image file.", "error");
      this.imageInput.value = "";
      return;
    }

    const reader = new FileReader();
    reader.onload = () => {
      this.imageBase64 = reader.result;
      this.preview.src = this.imageBase64;
      this.preview.style.display = "block";
    };
    reader.readAsDataURL(file);
  }

  async submit() {
    const payload = {
      title: document.getElementById("title").value.trim(),
      category: document.getElementById("category").value,
      description: document.getElementById("description").value.trim(),
      goal: Number(document.getElementById("goal").value),
      deadline: document.getElementById("deadline").value,
      image: this.imageBase64 || this.editingCampaign?.image || "",
      creatorId: this.user.id,
    };

    if (this.editingCampaign) {
      await this.campaignService.update(this.campaignId, payload);
      setFlashMessage("Campaign updated successfully.");
    } else {
      await this.campaignService.create(payload);
      setFlashMessage("Campaign submitted successfully and is waiting for admin approval.");
      this.form.reset();
      this.preview.removeAttribute("src");
      this.preview.style.display = "none";
      this.imageBase64 = "";
    }

    window.location.href = "./HomeUser.html";
  }
}
