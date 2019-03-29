import jwtDecode from "jwt-decode";
import httpService from "./httpService";
import {loginAPIEndpoint, registerAPIEndpoint} from "../config.json";


let setToken = (token) => {
    localStorage.setItem("token", token);
}

let getToken = () => {
    try {
        const jwt = localStorage.getItem("token");
        return jwt;
      } catch (ex) {
          return null;
      }
}

let getAuthData = () => {
    const token = getToken();
    if (token!==null) {
        const data = jwtDecode(token);
        return data;
    } else {
        return null;
    }
}

let getUsername = () => {
    const token = getToken();
    if (token!==null) {
        const data = jwtDecode(token);
        return data.username;
    } else {
        return null;
    }   
}

let login = (username, password) => {
    let payload = {username: username, password:password}
    payload = JSON.stringify(payload);
    return httpService.post(loginAPIEndpoint, {payload} );
}

let logout = () => {
    localStorage.removeItem("token");
}

let registerUser = (username, password) => {
    let payload = {username: username, password:password}
    payload = JSON.stringify(payload);
    return httpService.post(registerAPIEndpoint, {payload} );    
}

// Set authorization headers
httpService.setAuthorizationHeader(getToken());

export default {
    setToken: setToken,
    getToken: getToken,
    getAuthData: getAuthData,
    getUsername: getUsername,
    login: login,
    logout: logout,
    registerUser: registerUser
}