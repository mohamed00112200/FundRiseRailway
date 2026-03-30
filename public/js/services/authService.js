import { ApiService } from "./apiService.js";
import { getNextId, clearUser, setUser } from "../utils.js";

export class AuthService {
  constructor() {
    this.api = new ApiService();
  }

  async login(email, password) {
    const users = await this.api.get(`users?email=${encodeURIComponent(email)}`);

    if (!users.length) return { status: "not_found" };

    const user = users[0];

    if (!user.isActive) return { status: "banned" };
    if (user.password !== password) return { status: "wrong email or password" };

    setUser(user);
    return { status: "success", user };
  }

  async register(payload) {
    const users = await this.api.get("users");
    //check if at least one item matches T F
    const exists = users.some(
      (user) => user.email.toLowerCase() === payload.email.toLowerCase(),
    );

    if (exists) return { status: "exists" };

    const newUser = {
      id: Number(getNextId(users)),
      ...payload,
      role: "user",
      isActive: true,
    };

    await this.api.post("users", newUser);
    return { status: "success", user: newUser };
  }

  logout() {
    clearUser();
  }
}
