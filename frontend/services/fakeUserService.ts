import api from "./api";
import { User } from "../types";

export const fakeUserService = {

  async getUsers(): Promise<User[]> {
    const response = await api.get("/users");
    return response.data;
  },

  async saveUser(user: User) {
    //console.log(user.id)
    if (user.id) {
      const response = await api.put(`/users/${user.id}`, user);
      return response.data;
    } else {
      const response = await api.post("/users", user);
      return response.data;
    }
  },

  async deleteUser(id: string) {
    const response = await api.delete(`/users/${id}`);
    return response.data;
  },

  async getPersonalActivo(): Promise<User[]> {
    const response = await api.get("/personal-activo");
    return response.data;
  }
};