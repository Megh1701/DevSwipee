import api from "./axios";

export const verifyAuth = async () => {
  try {
    await api.get("api/profiledata");
    return true;
  } catch {
    return false;
  }
};