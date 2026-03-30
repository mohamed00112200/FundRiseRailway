import { setFlashMessage, showTopMessage } from "../utils.js";

export class RegisterPage {
  constructor(authService) {
    this.auth = authService;
  }

  init() {
    const form = document.getElementById("registerForm");
    if (!form) return;

    form.addEventListener("submit", async (e) => {
      e.preventDefault();

      const payload = {
        name: document.getElementById("regName").value.trim(),
        email: document.getElementById("regEmail").value.trim(),
        password: document.getElementById("regPassword").value,
      };

      const result = await this.auth.register(payload);

      if (result.status === "exists") {
        // alert("This email address is already registered");
        showTopMessage("This email address is already registered.", "error");
        return;
      }
      // alert("Registration completed successfully. Please login");
      setFlashMessage("Registration completed successfully. Please login.");
      form.reset();
      window.location.href = "./login.html";
    });
  }
}
