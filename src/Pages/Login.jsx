import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { useAuth } from "../Context/AuthContext";
import { useToast, LoadingOverlay, SuccessModal } from "../Utils/toast";
import loginImg from "../Assets/loginImg.jpg";
import logo from "../Assets/HDlogo.png";

const API_BASE = import.meta.env.VITE_API_BASE_URL;

const Login = () => {
  const { user, login } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();

  const [form, setForm] = useState({ email: "", password: "" });
  const [otp, setOtp] = useState("");
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [loadingMessage, setLoadingMessage] = useState("");
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [successModalData, setSuccessModalData] = useState({});

  useEffect(() => {
    if (user) navigate("/dashboard");
  }, [user, navigate]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleSendOtp = async () => {
    if (!form.email || !form.password) {
      toast.error("Email and password are required");
      return;
    }

    try {
      setLoading(true);
      setLoadingMessage("Sending verification code...");
      
      const res = await axios.post(`${API_BASE}/login/manual-login`, form);
      toast.success("Verification code sent to your email!");
      setStep(2);
    } catch (err) {
      console.log();
      toast.error(err.response?.data?.message || "Error sending verification code");
      if(err.response.status == 404) {
        navigate("/signup")
      }
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyOtp = async () => {
    try {
      setLoading(true);
      setLoadingMessage("Verifying and logging you in...");
      
      const res = await axios.post(`${API_BASE}/login/verify-otp`, {
        email: form.email,
        otp,
      });
      
      login(res.data.user, res.data.token);
      setLoading(false);
      
      setSuccessModalData({
        title: "Welcome back!",
        message: "You have been successfully logged in."
      });
      setShowSuccessModal(true);
      
      setTimeout(() => {
        navigate("/dashboard");
      }, 2000);
    } catch (err) {
      setLoading(false);
      toast.error(err.response?.data?.message || "OTP verification failed");
      if(err.response.status == 404){
        navigate("/signup");
      }
    }
  };

  const handleResendOtp = () => handleSendOtp();

  const handleGoogleLogin = async (googleResponse) => {
    try {
      setLoading(true);
      setLoadingMessage("Signing in with Google...");
      
      const { credential } = googleResponse;
      const res = await axios.post(`${API_BASE}/login/oauth`, {
        token: credential,
      });
      
      login(res.data.user, res.data.token);
      setLoading(false);
      
      setSuccessModalData({
        title: "Welcome!",
        message: "You have been successfully logged in with Google."
      });
      setShowSuccessModal(true);
      
      setTimeout(() => {
        navigate("/dashboard");
      }, 2000);
    } catch (err) {
      setLoading(false);
      toast.error(err.response?.data?.message || "Google login failed");
      if(err.response.status == 404){
        navigate("/signup");
      }
    }
  };

  useEffect(() => {
    if (window.google) {
      window.google.accounts.id.initialize({
        client_id: import.meta.env.VITE_GOOGLE_CLIENT_ID,
        callback: handleGoogleLogin,
      });
      window.google.accounts.id.renderButton(
        document.getElementById("google-btn"),
        { theme: "outline", size: "large", width: "100%" }
      );
    }
  }, []);

  return (
    <>
      <LoadingOverlay isVisible={loading} message={loadingMessage} />

      <SuccessModal
        isOpen={showSuccessModal}
        title={successModalData.title}
        message={successModalData.message}
        onClose={() => setShowSuccessModal(false)}
        showRedirectMessage={true}
      />

      <div className="min-h-screen flex">
        <div className="flex-1 flex items-center justify-center p-4 lg:p-8 bg-white">
          <div className="w-full max-w-md">
            <div className="flex items-center justify-center lg:justify-start mb-4">
              <div className="rounded-lg flex items-center gap-3">
                <img src={logo} alt="HD" style={{height: "40px"}} />
                <div className="text-black font-medium text-2xl">HD</div>
              </div>
            </div>

            <div className="mb-6">
              <h1 className="text-2xl font-bold text-center lg:text-left text-gray-900 mb-1">
                Sign In
              </h1>
              <p className="text-gray-600 text-center lg:text-left">
                Please login to continue to your account
              </p>
            </div>

            {step === 1 && (
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Email
                  </label>
                  <input
                    type="email"
                    name="email"
                    placeholder="Enter your email"
                    value={form.email}
                    onChange={handleChange}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Password
                  </label>
                  <input
                    type="password"
                    name="password"
                    placeholder="Enter your password"
                    value={form.password}
                    onChange={handleChange}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                  />
                </div>

                <button
                  onClick={handleSendOtp}
                  disabled={loading}
                  className="w-full bg-blue-500 text-white py-3 px-4 rounded-lg font-medium hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Continue
                </button>
              </div>
            )}

            {step === 2 && (
              <div className="space-y-4">
                <div className="text-center mb-4">
                  <h3 className="text-lg font-medium text-gray-900 mb-1">Verify your identity</h3>
                  <p className="text-sm text-gray-600">
                    We've sent a verification code to <span className="font-medium">{form.email}</span>
                  </p>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Verification Code
                  </label>
                  <input
                    type="text"
                    placeholder="Enter 6-digit code"
                    value={otp}
                    onChange={(e) => setOtp(e.target.value)}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all text-center text-lg tracking-widest"
                    maxLength="6"
                  />
                </div>

                <button
                  onClick={handleVerifyOtp}
                  disabled={loading || !otp}
                  className="w-full bg-green-500 text-white py-3 px-4 rounded-lg font-medium hover:bg-green-600 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Verify & Sign In
                </button>

                <button
                  onClick={handleResendOtp}
                  disabled={loading}
                  className="w-full bg-gray-100 text-gray-700 py-3 px-4 rounded-lg font-medium hover:bg-gray-200 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2 transition-all"
                >
                  Resend Code
                </button>

                <button
                  onClick={() => setStep(1)}
                  className="w-full text-sm text-blue-500 hover:text-blue-600 font-medium"
                >
                  ← Back to login
                </button>
              </div>
            )}

            <div className="my-6 flex items-center">
              <div className="flex-1 border-t border-gray-300"></div>
              <span className="px-4 text-sm text-gray-500">OR</span>
              <div className="flex-1 border-t border-gray-300"></div>
            </div>

            <div id="google-btn" className="w-full text-center"></div>

            <p className="mt-8 text-center text-sm text-gray-600">
              Don't have an account?{" "}
              <a href="/signup" className="text-blue-500 hover:text-blue-600 font-medium">
                Sign up
              </a>
            </p>
          </div>
        </div>

        <div className="hidden m-2 lg:flex flex-1 items-center rounded-2xl justify-center overflow-hidden">
          <img src={loginImg} alt="Login" style={{height: "100%"}} className="object-cover" />
        </div>
      </div>
    </>
  );
};

export default Login;