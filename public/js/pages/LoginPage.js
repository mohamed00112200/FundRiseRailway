import { setFlashMessage, showTopMessage } from "../utils.js";

export class LoginPage {
  constructor(authService) {
    this.auth = authService;
  }

  init() {
    const form = document.getElementById("loginForm");
    if (!form) return;

    form.addEventListener("submit", async (e) => {
      e.preventDefault();

      const email = document.getElementById("loginEmail").value.trim();
      const password = document.getElementById("loginPassword").value;

      const result = await this.auth.login(email, password);

      if (result.status === "not_found") {
        showTopMessage("No account was found for this email address.", "error");
        return;
      }

      if (result.status === "banned") {
        showTopMessage("This account is currently banned.", "error");
        return;
      }

      if (result.status === "wrong_password") {
        showTopMessage("The email or password you entered is not correct.", "error");
        return;
      }

      const nextPage = result.user.role === "admin" ? "./HomeAdmin.html" : "./HomeUser.html";
      setFlashMessage(`Login successful. Welcome back, ${result.user.name}.`);
      window.location.href = nextPage;
    });
  }
}
