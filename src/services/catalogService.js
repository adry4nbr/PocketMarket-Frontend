import api from "./api"; // seu Axios com interceptor

export const searchCatalog = (name, page = 0, size = 20) =>
  api.get("/card-catalog/search", { params: { name, page, size } });

export const listCatalog = (page = 0, size = 20) =>
  api.get("/card-catalog", { params: { page, size } });
