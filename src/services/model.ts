import { apiModel } from "./api";


export const fetchModel = async (formData: FormData) => {
  const response = await fetch(`${apiModel}/predict`, {
    method: "POST",
    body: formData,
  });
  if (!response.ok) {
    throw new Error("Error al predecir.");
  }
  const result = await response.json();
  return result;
};

export const fetchModelBenignMalignant = async (formData: FormData) => {
  const response = await fetch(`${apiModel}/predict_benign_malignant`, {
    method: "POST",
    body: formData,
  });
  if (!response.ok) {
    throw new Error("Error al predecir benign/malignant.");
  }
  const result = await response.json();
  return result;
};
