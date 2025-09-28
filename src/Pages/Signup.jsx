import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { useToast, LoadingOverlay, SuccessModal } from "../Utils/toast";
import loginImg from "../Assets/loginImg.jpg";
import logo from "../Assets/HDlogo.png";

const API_BASE = import.meta.env.VITE_API_BASE_URL;

const Signup = () => {
  const navigate = useNavigate();
  const { toast } = useToast();

  const [form, setForm] = useState({
    username: "",
    dob: "",
    email: "",
    password: "",
    confirmPassword: "",
  });
  const [otp, setOtp] = useState("");
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [loadingMessage, setLoadingMessage] = useState("");
  const [showSuccessModal, setShowSuccessModal] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));

    if (name === "confirmPassword" || name === "password") {
      if (
        (name === "confirmPassword" && value !== form.password && value.length > 0) ||
        (name === "password" && form.confirmPassword && form.confirmPassword !== value && form.confirmPassword.length > 0)
      ) {
        // toast.error("Passwords do not match");
      }
    }
  };

  const validateForm = () => {
    if (!form.username.trim()) {
      toast.error("Please enter your name");
      return false;
    }
    if (form.username.trim().length < 2) {
      toast.error("Name must be at least 2 characters long");
      return false;
    }
    if (!form.email.trim()) {
      toast.error("Please enter your email");
      return false;
    }
    if (!/\S+@\S+\.\S+/.test(form.email)) {
      toast.error("Please enter a valid email address");
      return false;
    }
    if (!form.password.trim()) {
      toast.error("Please enter a password");
      return false;
    }
    if (form.password.length < 6) {
      toast.error("Password must be at least 6 characters long");
      return false;
    }
    if (!form.confirmPassword.trim()) {
      toast.error("Please confirm your password");
      return false;
    }
    if (form.password !== form.confirmPassword) {
      toast.error("Passwords do not match");
      return false;
    }
    if (!form.dob) {
      toast.error("Please enter your date of birth");
      return false;
    }
    
    const today = new Date();
    const birthDate = new Date(form.dob);
    let age = today.getFullYear() - birthDate.getFullYear();
    const monthDiff = today.getMonth() - birthDate.getMonth();
    
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
      age--;
    }
    
    if (age < 13) {
      toast.error("You must be at least 13 years old to create an account");
      return false;
    }

    return true;
  };

  const handleSendOtp = async () => {
    if (!validateForm()) return;

    try {
      setLoading(true);
      setLoadingMessage("Creating your account...");
      
      const res = await axios.post(`${API_BASE}/signup/register`, {
        username: form.username.trim(),
        email: form.email.trim().toLowerCase(),
        password: form.password,
        dob: form.dob,
      });

      toast.success("Verification code sent to your email!", { 
        title: "Check your inbox" 
      });
      setStep(2);
    } catch (err) {
      const errorMessage = err.response?.data?.message || "Error creating account";
      toast.error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyOtp = async () => {
    if (!otp.trim()) {
      toast.error("Please enter the verification code");
      return;
    }
    
    if (otp.length !== 6) {
      toast.error("Verification code must be 6 digits");
      return;
    }

    try {
      setLoading(true);
      setLoadingMessage("Verifying your account...");
      
      const res = await axios.post(`${API_BASE}/signup/verify-otp`, {
        email: form.email.trim().toLowerCase(),
        otp: otp.trim(),
      });

      setLoading(false);
      setShowSuccessModal(true);
      
      setTimeout(() => {
        navigate("/dashboard");
      }, 2500);
    } catch (err) {
      setLoading(false);
      const errorMessage = err.response?.data?.message || "OTP verification failed";
      toast.error(errorMessage);
    }
  };

  const handleResendOtp = async () => {
    try {
      setLoading(true);
      setLoadingMessage("Resending verification code...");
      
      const res = await axios.post(`${API_BASE}/signup/register`, {
        username: form.username.trim(),
        email: form.email.trim().toLowerCase(),
        password: form.password,
        dob: form.dob,
      });

      toast.success("New verification code sent to your email!");
    } catch (err) {
      const errorMessage = err.response?.data?.message || "Error resending verification code";
      toast.error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleSignup = async (googleResponse) => {
    try {
      setLoading(true);
      setLoadingMessage("Signing up with Google...");
      
      const { credential } = googleResponse;
      const res = await axios.post(`${API_BASE}/signup/oauth`, {
        token: credential,
      });

      setLoading(false);
      setShowSuccessModal(true);
      
      setTimeout(() => {
        navigate("/dashboard");
      }, 2500);
    } catch (err) {
      setLoading(false);
      const errorMessage = err.response?.data?.message || "Google signup failed";
      toast.error(errorMessage);
    }
  };

  useEffect(() => {
    if (window.google && step === 1) {
      window.google.accounts.id.initialize({
        client_id: import.meta.env.VITE_GOOGLE_CLIENT_ID,
        callback: handleGoogleSignup,
      });
      
      const renderGoogleButton = () => {
        const googleBtn = document.getElementById("google-btn");
        if (googleBtn) {
          googleBtn.innerHTML = '';
          
          window.google.accounts.id.renderButton(googleBtn, {
            theme: "outline",
            size: "large",
            width: "100%",
            text: "signup_with",
            shape: "rectangular"
          });
        }
      };

      setTimeout(renderGoogleButton, 100);
    }
  }, [step]);

  const handleKeyPress = (e, action) => {
    if (e.key === 'Enter') {
      action();
    }
  };

  return (
    <>
      <LoadingOverlay isVisible={loading} message={loadingMessage} />

      <SuccessModal
        isOpen={showSuccessModal}
        title="Welcome to HD! 🎉"
        message="Your account has been created successfully!"
        onClose={() => setShowSuccessModal(false)}
        showRedirectMessage={true}
      />

      <div className="min-h-screen flex">
        <div className="flex-1 flex items-center justify-center p-4 lg:p-8 bg-white">
          <div className="w-full max-w-md">
            <div className="flex items-center justify-center lg:justify-start mb-6">
              <div className="rounded-lg flex items-center gap-3">
                <img src={logo} alt="HD" style={{height: "40px"}} />
                <div className="text-black font-medium text-2xl">HD</div>
              </div>
            </div>

            <div className="mb-8">
              <h1 className="text-2xl font-bold text-center lg:text-left text-gray-900 mb-2">
                {step === 1 ? "Sign Up" : "Verify your email"}
              </h1>
              <p className="text-gray-600 text-center lg:text-left">
                {step === 1 
                  ? "Sign up to enjoy the features of HD" 
                  : (
                    <>
                      We've sent a 6-digit verification code to <br />
                      <span className="font-medium text-gray-900">{form.email}</span>
                    </>
                  )
                }
              </p>
            </div>

            {step === 1 && (
              <div className="space-y-5">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Full Name *
                  </label>
                  <input
                    type="text"
                    name="username"
                    placeholder="Enter your full name"
                    value={form.username}
                    onChange={handleChange}
                    onKeyPress={(e) => handleKeyPress(e, () => document.querySelector('input[name="dob"]').focus())}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all placeholder-gray-400"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Date of Birth *
                  </label>
                  <input
                    type="date"
                    name="dob"
                    value={form.dob}
                    onChange={handleChange}
                    max={new Date(new Date().setFullYear(new Date().getFullYear() - 13)).toISOString().split('T')[0]}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Email Address *
                  </label>
                  <input
                    type="email"
                    name="email"
                    placeholder="Enter your email address"
                    value={form.email}
                    onChange={handleChange}
                    onKeyPress={(e) => handleKeyPress(e, () => document.querySelector('input[name="password"]').focus())}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all placeholder-gray-400"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Password *
                  </label>
                  <input
                    type="password"
                    name="password"
                    placeholder="Create a strong password"
                    value={form.password}
                    onChange={handleChange}
                    onKeyPress={(e) => handleKeyPress(e, () => document.querySelector('input[name="confirmPassword"]').focus())}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all placeholder-gray-400"
                    required
                  />
                  {form.password && form.password.length > 0 && form.password.length < 6 && (
                    <p className="text-xs text-orange-600 mt-1 flex items-center">
                      <svg className="w-3 h-3 mr-1" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92z" clipRule="evenodd"/>
                      </svg>
                      Password should be at least 6 characters
                    </p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Confirm Password *
                  </label>
                  <input
                    type="password"
                    name="confirmPassword"
                    placeholder="Confirm your password"
                    value={form.confirmPassword}
                    onChange={handleChange}
                    onKeyPress={(e) => handleKeyPress(e, handleSendOtp)}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all placeholder-gray-400"
                    required
                  />
                  {form.confirmPassword && form.password && form.confirmPassword === form.password && (
                    <p className="text-xs text-green-600 mt-1 flex items-center">
                      <svg className="w-3 h-3 mr-1" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd"/>
                      </svg>
                      Passwords match
                    </p>
                  )}
                  {form.confirmPassword && form.password && form.confirmPassword !== form.password && (
                    <p className="text-xs text-red-600 mt-1 flex items-center">
                      <svg className="w-3 h-3 mr-1" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd"/>
                      </svg>
                      Passwords do not match
                    </p>
                  )}
                </div>

                <button
                  type="button"
                  onClick={handleSendOtp}
                  disabled={loading}
                  className="w-full mt-6 bg-blue-500 text-white py-3 px-4 rounded-lg font-medium hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-all disabled:opacity-50 disabled:cursor-not-allowed transform hover:scale-[1.02] active:scale-[0.98]"
                >
                  Create Account
                </button>
              </div>
            )}

            {step === 2 && (
              <div className="space-y-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Verification Code
                  </label>
                  <input
                    type="text"
                    placeholder="Enter 6-digit code"
                    value={otp}
                    onChange={(e) => {
                      const value = e.target.value.replace(/[^0-9]/g, '');
                      if (value.length <= 6) {
                        setOtp(value);
                      }
                    }}
                    onKeyPress={(e) => handleKeyPress(e, handleVerifyOtp)}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all text-center text-lg tracking-[0.5em] font-mono"
                    maxLength="6"
                    autoComplete="one-time-code"
                  />
                  <p className="text-xs text-gray-500 mt-2 text-center">
                    Enter the 6-digit code sent to your email
                  </p>
                </div>

                <button
                  type="button"
                  onClick={handleVerifyOtp}
                  disabled={loading || otp.length !== 6}
                  className="w-full bg-green-500 text-white py-3 px-4 rounded-lg font-medium hover:bg-green-600 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2 transition-all disabled:opacity-50 disabled:cursor-not-allowed transform hover:scale-[1.02] active:scale-[0.98]"
                >
                  {otp.length === 6 ? "Verify & Create Account" : `Enter Code (${otp.length}/6)`}
                </button>

                <div className="flex flex-col space-y-3">
                  <button
                    type="button"
                    onClick={handleResendOtp}
                    disabled={loading}
                    className="w-full bg-gray-100 text-gray-700 py-3 px-4 rounded-lg font-medium hover:bg-gray-200 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    Didn't receive code? Resend
                  </button>

                  <button
                    type="button"
                    onClick={() => {
                      setStep(1);
                      setOtp("");
                    }}
                    className="w-full text-sm text-blue-500 hover:text-blue-600 font-medium py-2"
                  >
                    ← Back to registration
                  </button>
                </div>
              </div>
            )}

            {step === 1 && (
              <>
                <div className="my-8 flex items-center">
                  <div className="flex-1 border-t border-gray-300"></div>
                  <span className="px-4 text-sm text-gray-500 font-medium">OR</span>
                  <div className="flex-1 border-t border-gray-300"></div>
                </div>

                <div id="google-btn" className="w-full mb-6"></div>
              </>
            )}

            <p className="mt-8 text-center text-sm text-gray-600">
              Already have an account?{" "}
              <a 
                href="/login" 
                className="text-blue-500 hover:text-blue-600 font-medium hover:underline transition-all"
              >
                Sign in
              </a>
            </p>
          </div>
        </div>

        <div className="hidden m-2 lg:flex flex-1 items-center rounded-2xl justify-center overflow-hidden bg-gradient-to-br from-blue-50 to-indigo-100">
          <div className="relative w-full h-full flex items-center justify-center">
            <img 
              src={loginImg} 
              alt="signup" 
              style={{height: "100%"}} 
              className="object-cover rounded-xl shadow-2xl"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent rounded-xl"></div>
          </div>
        </div>
      </div>
    </>
  );
};

export default Signup;