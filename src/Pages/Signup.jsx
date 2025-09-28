import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";

const API_BASE = import.meta.env.VITE_API_BASE_URL;

const Signup = () => {
  const navigate = useNavigate();

  const [form, setForm] = useState({
    username: "",
    dob: "",
    email: "",
    password: "",
    confirmPassword: "",
  });
  const [otp, setOtp] = useState("");
  const [step, setStep] = useState(1);

  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));

    if (name === "confirmPassword" || name === "password") {
      if (
        (name === "confirmPassword" && value !== form.password) ||
        (name === "password" && form.confirmPassword && form.confirmPassword !== value)
      ) {
        setError("Passwords do not match");
      } else {
        setError("");
      }
    }
  };

  const handleSendOtp = async () => {
    setError("");
    setSuccess("");
    if (form.password !== form.confirmPassword) {
      setError("Passwords do not match");
      return;
    }
    try {
      setLoading(true);
      const res = await axios.post(`${API_BASE}/signup/register`, {
        username: form.username,
        email: form.email,
        password: form.password,
        dob: form.dob,
      });
    //   console.log(res);
      setSuccess(res.data.message);
      setStep(2);
    } catch (err) {
      setError(err.response?.data?.message || "Error sending OTP");
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyOtp = async () => {
    setError("");
    setSuccess("");
    try {
      setLoading(true);
      const res = await axios.post(`${API_BASE}/signup/verify-otp`, {
        email: form.email,
        otp,
      });
      console.log(res);
      setSuccess("Signup successful!");
      setTimeout(() => navigate("/dashboard"), 1500);
    } catch (err) {
      setError(err.response?.data?.message || "OTP verification failed");
    } finally {
      setLoading(false);
    }
  };

  const handleResendOtp = () => handleSendOtp();

  const handleGoogleSignup = async (googleResponse) => {
    try {
        // console.log(googleResponse);
      const { credential } = googleResponse;
      const res = await axios.post(`${API_BASE}/signup/oauth`, {
        token: credential,
      });

    //   console.log(res);
      setSuccess("Google signup successful!");
      setTimeout(() => navigate("/dashboard"), 1500);
    } catch (err) {
      setError(err.response?.data?.message || "Google signup failed");
    }
  };

  useEffect(() => {
    if (window.google) {
      window.google.accounts.id.initialize({
        client_id: import.meta.env.VITE_GOOGLE_CLIENT_ID,
        callback: handleGoogleSignup,
      });
      window.google.accounts.id.renderButton(
        document.getElementById("google-btn"),
        { theme: "outline", size: "large", width: "100%" }
      );
    }
  }, []);

  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-100 px-4">
      <div className="bg-white shadow-lg rounded-2xl p-6 w-full max-w-md">
        <h2 className="text-2xl font-bold text-center mb-4">Sign Up</h2>

        {error && <p className="text-red-500 text-sm mb-2">{error}</p>}
        {success && <p className="text-green-500 text-sm mb-2">{success}</p>}

        {step === 1 && (
          <div className="space-y-3">
            <input
              type="text"
              name="username"
              placeholder="Full Name"
              value={form.username}
              onChange={handleChange}
              className="w-full border p-2 rounded-lg"
            />
            <input
              type="date"
              name="dob"
              value={form.dob}
              onChange={handleChange}
              className="w-full border p-2 rounded-lg"
            />
            <input
              type="email"
              name="email"
              placeholder="Email"
              value={form.email}
              onChange={handleChange}
              className="w-full border p-2 rounded-lg"
            />
            <input
              type="password"
              name="password"
              placeholder="Password"
              value={form.password}
              onChange={handleChange}
              className="w-full border p-2 rounded-lg"
            />
            <input
              type="password"
              name="confirmPassword"
              placeholder="Re-enter Password"
              value={form.confirmPassword}
              onChange={handleChange}
              className="w-full border p-2 rounded-lg"
            />
            <button
              onClick={handleSendOtp}
              disabled={loading}
              className="w-full bg-blue-600 text-white py-2 rounded-lg hover:bg-blue-700"
            >
              {loading ? "Sending OTP..." : "Send OTP"}
            </button>
          </div>
        )}

        {step === 2 && (
          <div className="space-y-3">
            <input
              type="text"
              placeholder="Enter OTP"
              value={otp}
              onChange={(e) => setOtp(e.target.value)}
              className="w-full border p-2 rounded-lg"
            />
            <button
              onClick={handleVerifyOtp}
              disabled={loading}
              className="w-full bg-green-600 text-white py-2 rounded-lg hover:bg-green-700"
            >
              {loading ? "Verifying..." : "Verify OTP & Signup"}
            </button>
            <button
              onClick={handleResendOtp}
              className="w-full bg-gray-200 text-gray-700 py-2 rounded-lg hover:bg-gray-300"
            >
              Resend OTP
            </button>
          </div>
        )}

        <div className="my-4 flex items-center">
          <div className="flex-grow border-t" />
          <span className="px-2 text-gray-400 text-sm">OR</span>
          <div className="flex-grow border-t" />
        </div>

        <div id="google-btn" className="w-full"></div>

        <p className="text-center text-sm mt-4">
          Already have an account?{" "}
          <a href="/login" className="text-blue-600 hover:underline">
            Sign in
          </a>
        </p>
      </div>
    </div>
  );
};

export default Signup;
