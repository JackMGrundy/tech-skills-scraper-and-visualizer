import axios from "axios"
import {toast } from 'react-toastify';

axios.interceptors.response.use(null, error => {
    console.log("status", error.response.status);

    const expectedError = 
    error.response &&
    error.response.status >= 400 &&
    error.response.status < 500;

    if (!expectedError) {
        toast.error(error.response.status);
    }

    return Promise.reject(error);
});

export default {
    get: axios.get,
    post: axios.post,
    put: axios.put,
    delete: axios.delete
};