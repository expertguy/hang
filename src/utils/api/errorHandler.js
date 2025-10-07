import { message } from "antd";

export const handleError = (err) => {
  let error = "An unexpected error occurred";

  if (err.response) {
    switch (err.response.status) {
      case 400:
        error =  err?.response?.data?.message;
        break;
      case 401:
        error = "Unauthorized: " + err?.response?.data?.message;
        break;
      case 402:
        error = "Payment Required: " + err?.response?.data?.message;
        break;
      case 403:
        error = "Forbidden: " + err?.response?.data?.message;
        break;
      case 404:
        error = "Not Found: " + err?.response?.data?.message;
        break;
      case 500:
        error = "Internal Server Error: Please try again later";
        break;
      case 501:
        error = "Not Implemented: " + err?.response?.data?.message;
        break;
      case 502:
        error = "Bad Gateway: " + err?.response?.data?.message;
        break;
      case 503:
        error = "Service Unavailable: Please try again later";
        break;
      case 504:
        error = "Gateway Timeout: Please try again later";
        break;
      default:
        error = "Error: " + err?.response?.data?.message;
    }
  } else if (err.message) {
    error = err.message;
  }
  message.error(error);
};
