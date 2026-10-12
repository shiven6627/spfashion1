import "./Account.css";
import { useLocation, useNavigate } from "react-router-dom";
import { useState } from "react";
import api from "../utils/api";
import MyOrders from "../components/MyOrders";

function Account({ user, loginUser, logoutUser }) {
  const navigate = useNavigate();
  const location = useLocation();
  const returnTo = location.state?.from || "/";

  const [showSignup, setShowSignup] = useState(location.state?.mode === "signup");

  const [loginForm, setLoginForm] = useState({
    email: "",
    password: "",
  });

  const [signupForm, setSignupForm] = useState({
    name: "",
    email: "",
    password: "",
    confirmPassword: "",
  });

  function loginChange(e) {
    setLoginForm({
      ...loginForm,
      [e.target.name]: e.target.value,
    });
  }

  function signupChange(e) {
    setSignupForm({
      ...signupForm,
      [e.target.name]: e.target.value,
    });
  }

  async function login(e) {
    e.preventDefault();
    try {
      const { data } = await api.post("/auth/login", loginForm);
      localStorage.setItem("sp-token", data.token);
      loginUser(data.user);
      alert("Login successful.");
      navigate(data.user.role === "admin" ? "/admin" : returnTo, { replace: true });
    } catch (error) { alert(error.response?.data?.message || "Unable to login. Check your API server."); }
  }

  async function signup(e) {
    e.preventDefault();
    if (signupForm.password !== signupForm.confirmPassword) { alert("Passwords do not match."); return; }
    try {
      const { data } = await api.post("/auth/register", { name: signupForm.name, email: signupForm.email, password: signupForm.password });
      localStorage.setItem("sp-token", data.token);
      loginUser(data.user);
      alert("Account created successfully.");
      navigate(returnTo, { replace: true });
    } catch (error) { alert(error.response?.data?.message || "Unable to create account."); }
  }

  function logout() {
    localStorage.removeItem("sp-token");
    logoutUser();

    alert("You have been logged out.");

    navigate("/");
  }

  if (user) {
    return (
      <div className="page-shell account-page">

        <div className="shop-heading">
          <h1>My Account</h1>
        </div>

        <div className="account-box">

          <h2>Welcome, {user.name}</h2>

          <p className="account-welcome">
            You are successfully logged in to SP FASHION.
          </p>

          <div className="account-details">

            <div>
              <span>Name</span>
              <strong>{user.name}</strong>
            </div>

            <div>
              <span>Email</span>
              <strong>{user.email}</strong>
            </div>

          </div>

          <MyOrders />

          <div className="account-actions">

            <button
              className="btn"
              type="button"
              onClick={() => navigate("/shop")}
            >
              CONTINUE SHOPPING
            </button>

            <button
              className="outline"
              type="button"
              onClick={() => navigate("/cart")}
            >
              VIEW BAG
            </button>

            <button
              className="logout-btn"
              type="button"
              onClick={logout}
            >
              LOGOUT
            </button>

          </div>

        </div>

      </div>
    );
  }

  return (
    <div className="page-shell account-page">

      <div className="shop-heading">
        <h1>Account</h1>
      </div>

      {!showSignup ? (

        <form
          className="account-form"
          onSubmit={login}
        >

          <h2>Login</h2>

          <p className="account-text">
            Your account is ready for secure checkout and order tracking.
          </p>

          <label>
            Email

            <input
              type="email"
              name="email"
              value={loginForm.email}
              onChange={loginChange}
              placeholder="Email"
              required
            />
          </label>

          <label>
            Password

            <input
              type="password"
              name="password"
              value={loginForm.password}
              onChange={loginChange}
              placeholder="Password"
              required
            />
          </label>

          <button
            className="btn full"
            type="submit"
          >
            LOGIN
          </button>

          <p className="account-switch">
            New customer?{" "}

            <button
              type="button"
              onClick={() => setShowSignup(true)}
            >
              Create Account
            </button>
          </p>

        </form>

      ) : (

        <form
          className="account-form"
          onSubmit={signup}
        >

          <h2>Create Account</h2>

          <p className="account-text">
            Create your SP FASHION account.
          </p>

          <label>
            Full Name

            <input
              type="text"
              name="name"
              value={signupForm.name}
              onChange={signupChange}
              placeholder="Full name"
              required
            />
          </label>

          <label>
            Email

            <input
              type="email"
              name="email"
              value={signupForm.email}
              onChange={signupChange}
              placeholder="Email"
              required
            />
          </label>

          <label>
            Password

            <input
              type="password"
              name="password"
              value={signupForm.password}
              onChange={signupChange}
              placeholder="Password"
              minLength="8"
              required
            />
          </label>

          <label>
            Confirm Password

            <input
              type="password"
              name="confirmPassword"
              value={signupForm.confirmPassword}
              onChange={signupChange}
              placeholder="Confirm password"
              required
            />
          </label>

          <button
            className="btn full"
            type="submit"
          >
            SIGN UP
          </button>

          <p className="account-switch">
            Already have an account?{" "}

            <button
              type="button"
              onClick={() => setShowSignup(false)}
            >
              Login
            </button>
          </p>

        </form>

      )}

    </div>
  );
}

export default Account;