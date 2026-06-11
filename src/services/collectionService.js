import api from "./api";

export const uploadProofImage = (file) => {
  const form = new FormData();
  form.append("file", file);
  return api.post("/uploads/images", form, {
    headers: { "Content-Type": "multipart/form-data" },
  });
};

export const addUserCard = (externalCardId, condition, proofImageUrl) =>
  api.post("/user-cards", { externalCardId, condition, proofImageUrl });

export const addToCollection = (userCardId) =>
  api.post("/collection", { userCardId });

export const getMyCollection = (page = 0, size = 20) =>
  api.get("/user-cards/me", { params: { page, size } });
