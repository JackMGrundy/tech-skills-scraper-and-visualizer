import axios from "axios";
import { toast } from "react-toastify";

axios.interceptors.response.use(null, error => {
  // console.log("status", error.response.status);

  const expectedError =
    error.response &&
    error.response.status >= 400 &&
    error.response.status < 500;

  if (!expectedError) {
    if (error.response === undefined) {
      toast.error("Network error");
    } else {
      toast.error(error.response.status);
    }
  }

  return Promise.reject(error);
});

function setAuthorizationHeader(token) {
  axios.defaults.headers.common["authorization"] = token;
}

export default {
  get: axios.get,
  post: axios.post,
  put: axios.put,
  delete: axios.delete,
  setAuthorizationHeader: setAuthorizationHeader
};
