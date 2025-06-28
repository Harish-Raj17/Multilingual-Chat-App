import React, { useState } from "react";
import axios from "axios";

const RegisterForm = ({ onRegistered }) => {
  const [formData, setFormData] = useState({ name: "", email: "", password: "", preferred_language: "en" });

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleRegister = async () => {
    try {
      await axios.post("http://localhost:5000/api/auth/register", formData);
      alert("Registered successfully");
      onRegistered();
    } catch (err) {
      alert("Error registering");
    }
  };

  return (
    <div>
      <h3>Register</h3>
      <input name="name" placeholder="Name" onChange={handleChange} />
      <input name="email" placeholder="Email" onChange={handleChange} />
      <input name="password" type="password" placeholder="Password" onChange={handleChange} />
      <select name="preferred_language" onChange={handleChange}>
        <option value="en">English</option>
        <option value="hi">Hindi</option>
        <option value="fr">French</option>
        <option value="ta">Tamil</option>
      </select>
      <button onClick={handleRegister}>Register</button>
    </div>
  );
};

export default RegisterForm;
