import React, { useState } from "react";
import axios from "axios";

const LoginForm = ({ onLogin }) => {
  const [formData, setFormData] = useState({ email: "", password: "" });

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleLogin = async () => {
    try {
      const res = await axios.post("http://localhost:5000/api/auth/login", formData);
      onLogin(res.data.user);
    } catch (err) {
      alert("Login failed");
    }
  };

  return (
    <div>
      <h3>Login</h3>
      <input name="email" placeholder="Email" onChange={handleChange} />
      <input name="password" type="password" placeholder="Password" onChange={handleChange} />
      <button onClick={handleLogin}>Login</button>
    </div>
  );
};

export default LoginForm;
