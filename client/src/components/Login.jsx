import React, { useEffect, useState } from "react";
import axios from "axios";
import "../../public/styles.css";

// displays a login/sign up form
function Login(props) {
  //controls whether the form is a login or signup
  const [isSignup, setIsSignup] = useState(false);
  // stores data present in the form
  const [formData, setFormData] = useState({
    username: "",
    password: "",
    confirmPassword: "",
  });
  // stores error messaging based on form submission attempts
  const [errorMessage, setErrorMessage] = useState("");
  // is true when a page is waiting for a response
  const [loading, setLoading] = useState(false);

  // exit button functionality
  const handleCloseClick = (event) => {
    event.stopPropagation();
    props.exitLogin();
  };
  
  //handles any form data change
  const handleChange = (event) => {
    const { name, value } = event.target;
    setFormData((prevValue) => ({
      ...prevValue,
      [name]: value,
    }));
  };
  //handles form submission
  const handleSubmit = async (event) => {
    event.preventDefault();
    setErrorMessage("");
    //checks for a password match if the form is a signup
    if (isSignup && formData.password !== formData.confirmPassword) {
      setErrorMessage("Passwords do not match.");
      return;
    }
    //submits form to backend
    try {

      //sets loading to true which disables the submit button  
      setLoading(true);
      //gets endpoint for backend based on signup or login
      const endpoint = isSignup ? "/signup" : "/login";
      //formats the form data 
      const postData = {
        username: formData.username,
        password: formData.password,
      };
      //sends the data to the backend
      const response = await axios.post(
        `http://localhost:8080${endpoint}`,
        postData
      );
      //displays error message if the response is bad
      if (!response.data.success) {
        setErrorMessage(response.data.message);
      //if the submission was a login, exit the form
      }else if (!isSignup && response.data.success) {
        props.exitLogin();
        props.handleLogin(formData.username);
      }else{
      //if the submission was a sign up, reset the form and change form status to a login
        setFormData({ username: "", password: "", confirmPassword: "" });
        setIsSignup(false);
      }
    //handles any errors
    } catch (error) {
      setErrorMessage("An error occurred. Please try again.");
      console.log(error);
    //after responses have been recieved, re enable the button
    } finally {
      setLoading(false);
    }
  };
  return (
    <div className="login-overlay">
      <div className="login-container">
        <div className="login-header">
          {/* title */}
          <h1>{isSignup ? "Sign Up" : "Log In"}</h1>
          {/* 'X' button */}
          <a onClick={handleCloseClick} className="close-button">
            <img src="/icons/close.svg" />
          </a>
        </div>
        {/* Username input */}
        <input
          type="text"
          name="username"
          value={formData.username}
          placeholder="Username"
          onChange={handleChange}
        ></input>
        {/* password input */}
        <input
          type="password"
          name="password"
          value={formData.password}
          placeholder="Password"
          onChange={handleChange}
        ></input>
        {/* confirm password input which is only present if the form is a signup */}
        {isSignup && (
          <input
            type="password"
            name="confirmPassword"
            value={formData.confirmPassword}
            placeholder="Confirm Password"
            onChange={handleChange}
          ></input>
        )}
        {/* error message display */}
        {errorMessage && <p className="error-message">{errorMessage}</p>}
        {/* submit button */}
        <button 
        onClick={handleSubmit}
        disabled={loading}
        >
          Submit</button>
        {/* button the switch between form mode  */}
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
