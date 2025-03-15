import React, { useEffect, useState } from "react";
import axios from "axios";
import "../../public/styles.css";

function Login(props) {
  const [isSignup, setIsSignup] = useState(false);
  const [formData, setFormData] = useState({
    username: "",
    password: "",
    confirmPassword: "",
  });
  const [errorMessage, setErrorMessage] = useState("");
  const [loading, setLoading] = useState(false);

  const handleCloseClick = (event) => {
    event.stopPropagation();
    props.exitLogin();
  };

  const handleChange = (event) => {
    const { name, value } = event.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };
  const handleSubmit = async (event) => {
    event.preventDefault();
    setErrorMessage("");

    if (isSignup && formData.password !== formData.confirmPassword) {
      setErrorMessage("Passwords do not match.");
      return;
    }

    try {
      setLoading(true);
      const endpoint = isSignup ? "/signup" : "/login";
      const postData = {
        username: formData.username,
        password: formData.password,
      };
      const response = await axios.post(
        `http://localhost:8080${endpoint}`,
        postData
      );
      
      if (!response.data.success) {
        setErrorMessage(response.data.message);
      }else if (!isSignup && response.data.success) {
        props.exitLogin();
        props.handleLogin(formData.username);
      }else{
        setFormData({ username: "", password: "", confirmPassword: "" });
        setIsSignup(false);
      }

    } catch (error) {
      setErrorMessage("An error occurred. Please try again.");
      console.log(error);
    } finally {
      setLoading(false);
    }
  };
  return (
    <div className="login-overlay">
      <div className="login-container">
        <div className="login-header">
          <h1>{isSignup ? "Sign Up" : "Log In"}</h1>
          <a onClick={handleCloseClick} className="close-button">
            <img src="/icons/close.svg" />
          </a>
        </div>

        <input
          type="text"
          name="username"
          value={formData.username}
          placeholder="Username"
          onChange={handleChange}
        ></input>
        <input
          type="password"
          name="password"
          value={formData.password}
          placeholder="Password"
          onChange={handleChange}
        ></input>
        {isSignup && (
          <input
            type="password"
            name="confirmPassword"
            value={formData.confirmPassword}
            placeholder="Confirm Password"
            onChange={handleChange}
          ></input>
        )}
        {errorMessage && <p className="error-message">{errorMessage}</p>}
        <button onClick={handleSubmit}>Submit</button>
        <button
          onClick={() => setIsSignup((prevValue) => !prevValue)}
          disabled={loading}
        >
          {isSignup ? "Log In" : "Sign Up"}
        </button>
      </div>
    </div>
  );
}

export default Login;
