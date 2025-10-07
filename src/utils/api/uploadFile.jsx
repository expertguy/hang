
import imageCompression from "browser-image-compression";
import { isValidFileType } from "./isValidType";
import { axiosInstance } from "./axiosInstance";
import { docUpload, imageUpload } from './ApiRoutesFile'
const header = {
  "Content-Type": "multipart/form-data",
  // "x-auth-token": token,
};
export const uploadFile = async (file) => {
  try {
    const check = isValidFileType(file);
    if (!check) {
      throw ({ message: "!Invalid file type. Please upload a valid image file. you can only select the jpg, jpeg, png, svg" })
    }
    const options = {
      maxSizeMB: 1,
      maxWidthOrHeight: 1920,
      useWebWorker: true,
    };
    const compressedFile = await imageCompression(file, options);
    const formData = new FormData();
    formData.append("image", compressedFile);
    const response = await axiosInstance.post(imageUpload, formData, { headers: header });

    return response.data;
  } catch (error) {
    console.error("Error uploading file:", error);
    throw error;
  }
};
export const uploadDoc = async (file) => {
  try {
    const check = isValidFileType(file, ['csv', 'xlsx']);
    if (!check) {
      throw ({ message: "!Invalid file type. Please upload a valid image file. you can only select the xlsx, csv" })
    }

    const formData = new FormData();
    formData.append("file", file);
    const response = await axiosInstance.post(docUpload, formData, { headers: header });

    return response.data;
  } catch (error) {
    console.error("Error uploading file:", error);
    throw error;
  }
};
