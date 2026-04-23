import api from "./api";
import { Atencion, ReporteFiltros } from "../types";

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

  async reporteos(data: ReporteFiltros) {
    const response = await api.post("/reporteos", data);
    return response.data;
  },

  async update(id: string, updates: Partial<Atencion>) {
    const response = await api.put(`/atenciones/${id}`, updates);
    return response.data;
  },

  async delete(id: number) {
  const response = await api.delete(`/atenciones/${id}`);
  return response.data;
}
};

export const listado = {
  async reporteus(data: ReporteFiltros) {
    const response = await api.post("/reporteus", data);
    return response.data;
  },
  async cubo(m: number, y: number, c: number | null = null) {
    const p = c ? `/${c}` : '';
    const response = await api.get(`/atenciones/cubo/${m}/${y}${p}`);
    return response.data;
  }
}