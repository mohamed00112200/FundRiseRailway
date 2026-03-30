import { AuthService } from "./services/authService.js";
import { CampaignService } from "./services/campaignService.js";
import { PledgeService } from "./services/pledgeService.js";
import { AdminService } from "./services/adminService.js";

import { LandingPage } from "./pages/LandingPage.js";
import { LoginPage } from "./pages/LoginPage.js";
import { RegisterPage } from "./pages/RegisterPage.js";
import { HomeUserPage } from "./pages/HomeUserPage.js";
import { HomeAdminPage } from "./pages/HomeAdminPage.js";
import { CreateCampaignPage } from "./pages/CreateCampaignPage.js";
import { renderFlashMessage } from "./utils.js";

const auth = new AuthService();
const campaign = new CampaignService();
const pledge = new PledgeService();
const adminService = new AdminService();

document.addEventListener("DOMContentLoaded", () => {
  renderFlashMessage();

  const page = document.body.dataset.page;

  switch (page) {
    case "landing":
      new LandingPage(campaign, pledge).init();
      break;
    case "login":
      new LoginPage(auth).init();
      break;
    case "register":
      new RegisterPage(auth).init();
      break;
    case "home-user":
      new HomeUserPage(campaign, pledge, auth).init();
      break;
    case "create-campaign":
      new CreateCampaignPage(campaign, auth).init();
      break;
    case "home-admin":
      new HomeAdminPage(adminService, campaign, pledge, auth).init();
      break;
    default:
      break;
  }
});
