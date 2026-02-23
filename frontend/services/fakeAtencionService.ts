import api from "./api";
import { Atencion } from "../types";

export const fakeAtencionService = {

  async getPersonalActivo() {
    const response = await api.get("/personal_ac");
    return response.data;
  },

  async getAll() {
    const response = await api.get("/atenciones");
    return response.data;
  },

  async create(data: Partial<Atencion>) {
    const response = await api.post("/atenciones", data);
    return response.data;
  },

  async update(id: string, updates: Partial<Atencion>) {
    const response = await api.put(`/atenciones/${id}`, updates);
    return response.data;
  }

};