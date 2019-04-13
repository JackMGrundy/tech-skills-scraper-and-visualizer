import Dashboard from "./views/dashboard.jsx";
import LoginForm from "./views/loginForm.jsx";
import LogoutForm from "./views/logoutForm.jsx";
import RegisterForm from "./views/registerForm.jsx";
import ManageTasks from "./views/manageTasks.jsx";

const routes = [
  {
    path: "/dashboard",
    name: "Dashboard",
    protected: true,
    show: "loggedIn", // "loggedIn", "loggedOut", or "always"
    component: Dashboard
  },
  {
    path: "/tasks",
    name: "Manage tasks",
    protected: true,
    show: "loggedIn", // "loggedIn", "loggedOut", or "always"
    component: ManageTasks
  },
  {
    path: "/login",
    name: "Login",
    protected: false,
    show: "loggedOut", // "loggedIn", "loggedOut", or "always"
    component: LoginForm
  },
  {
    path: "/register",
    name: "Register",
    protected: false,
    show: "loggedOut", // "loggedIn", "loggedOut", or "always"
    component: RegisterForm
  },
  {
    path: "/logout",
    name: "Logout",
    protected: false,
    show: "loggedIn", // "loggedIn", "loggedOut", or "always"
    component: LogoutForm
  }
];

export default routes;
