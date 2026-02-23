import api from "./api";

export const StorageService = {
  async getAtenciones() {
    const response = await api.get("/atenciones");
    return response.data;
  },

  async updateAtencion(data) {
    const response = await api.put(`/atenciones/${data.id}`, data);
    return response.data;
  },

  async getSolicitantes() {
    const response = await api.get("/solicitantes");
    return response.data;
  },

  async save(data) {
    if (data.id) {
      return (await api.put(`/solicitantes/${data.id}`, data)).data;
    }
    return (await api.post("/solicitantes", data)).data;
  },

  async delete(id: string) {
    return (await api.delete(`/solicitantes/${id}`)).data;
  }
};