import api from "@/app/lib/api"; // 

export const auth = {
  me() {
    return api.get("/auth/me");
  },
  login({ username, password }) {
    return api.post("/auth/login", { username, password });
  },
  logout() {
    return api.post("/auth/logout");
  },
};
