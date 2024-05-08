import React, { useState, useEffect } from "react";
import { toast } from "react-toastify";
import { useNavigate } from "react-router-dom";
import { useSelector, useDispatch } from "react-redux";
import { login, reset } from "../features/auth/authSlice";
import trans from "../utils/translate";

const Login = () => {
  const [form, setForm] = useState({
    email: "",
    password: "",
  });

  const { email, password } = form;

  const dispatch = useDispatch();
  const navigate = useNavigate();

  const { user, error, success, message } = useSelector((state) => state.auth);

  useEffect(() => {
    if (error) {
      alert(message);
    }
    if (success || user) {
      navigate("/dashboard");
    }
    dispatch(reset());
  }, [error, success, user, message, navigate, dispatch]);

  const onChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    const userData = {
      email,
      password,
    };
    dispatch(login(userData));
  };

  return (
    <>
      <div className="auth-container">
        <form className="register-form" onSubmit={handleSubmit}>
          <h1>{trans("login")}</h1>

          <div className="formInput">
            <label>{trans("email")}</label>
            <input
              type="email"
              placeholder={trans("email")}
              name="email"
              value={email}
              onChange={onChange}
            />
          </div>

          <div className="formInput">
            <label>{trans("password")}</label>
            <input
              type="password"
              placeholder="Password"
              name="password"
              value={password}
              onChange={onChange}
            />
          </div>

          <button type="submit" className="btn-grad">
            {trans("login")}
          </button>

          <div className="home">
            <a href="/">{trans("go_to_home")}</a>
          </div>
        </form>
      </div>
    </>
  );
};

export default Login;
