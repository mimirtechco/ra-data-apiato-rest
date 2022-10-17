import jwtDecode, { JwtPayload } from "jwt-decode";
const API_ENTRYPOINT: string = process.env.API_ENTRYPOINT || "http://localhost";
const API_LOGIN_URI: string = process.env.API_LOGIN_URI || "/clients/web/login";
const API_LOGOUT_URI: string = process.env.API_LOGIN_URI || "/logout";
const loginUrl: string = `${API_ENTRYPOINT}${API_LOGIN_URI}`;
const logoutUrl: string = `${API_ENTRYPOINT}${API_LOGOUT_URI}`;
export default {
  login: ({ username, password }) => {
    // build the request
    const request = new Request(loginUrl, {
      method: "POST",
      body: JSON.stringify({ username, password }),
      headers: new Headers({
        "Content-Type": "application/json",
        Accept: "application/json",
      }),
    });
    return fetch(request)
      .then((response) => {
        if (response.status < 200 || response.status >= 300) {
          throw new Error(response.statusText);
        }
        return response.json();
      })
      .then((data) => {
        localStorage.setItem("token", data);
      })
      .catch(() => {
        throw new Error("Network Error");
      });
  },
  logout: (params) => {
    // build request
    const request = new Request(logoutUrl, {
      method: "POST",
      headers: new Headers({
        "Content-Type": "application/json",
        Accept: "application/json",
      }),
    });
    return fetch(request)
      .then((response) => {
        if (response.status < 200 || response.status >= 300) {
          throw new Error(response.statusText);
        }
        return response.json();
      })
      .then((data) => {
        localStorage.removeItem("token");
      });
  },
  checkAuth: (params) => {
    try {
      if (!localStorage.getItem('token') || new Date().getTime() / 1000 > jwtDecode<JwtPayload>(localStorage.getItem('token'))?.exp) {
        return Promise.reject();
      }
      return Promise.resolve();
    } catch (e) {
      return Promise.reject();
    }
  },
  checkError: (error) => {
    const status = error.status;
    if (status === 401 || status === 403) {
      localStorage.removeItem("token");
      return Promise.reject();
    }
    return Promise.resolve();
  },
  getPermissions: (params) => {
    const role = JSON.parse(localStorage.getItem("token"))?.role;
    return role ? Promise.resolve(role) : Promise.reject();
  },
};
