import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Eye, EyeOff, Phone, User, Loader2, Lock } from "lucide-react";
import { AuthLayout } from "./AuthLayout";
import { useQuery } from "@tanstack/react-query";
import { useLocation } from "../hooks/useLocation";

interface FormData {
  phone: string;
  otp: string;
  username: string;
  password: string;
}

export const Login = () => {
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [loginMethod, setLoginMethod] = useState<"otp" | "password">(
    "password"
  );
  const [otpSent, setOtpSent] = useState(false);
  const [otpSending, setOtpSending] = useState(false);
  const [error, setError] = useState("");
  const { location: userLocation } = useLocation();

  const [formData, setFormData] = useState({
    phone: "",
    otp: "",
    username: "",
    password: "",
  });

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
    setError(""); // Clear error when user types
  };

  const handleSendOTP = async () => {
    if (!formData.phone || formData.phone.length !== 10) {
      setError("Please enter a valid 10-digit phone number");
      return;
    }

    setOtpSending(true);
    setError("");

    try {
      const response = await fetch("http://localhost:3000/api/send-otp", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          phone: formData.phone,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Failed to send OTP");
      }

      setOtpSent(true);
    } catch (error: any) {
      setError(error.message || "Failed to send OTP. Please try again.");
    } finally {
      setOtpSending(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError("");

    try {
      const endpoint =
        loginMethod === "password"
          ? "http://localhost:3000/api/login-password"
          : "http://localhost:3000/api/login-otp";

      const body =
        loginMethod === "password"
          ? {
              username: formData.username,
              password: formData.password,
            }
          : {
              phone: formData.phone,
              otp: formData.otp,
            };

      const response = await fetch("http://localhost:3000/api/login-password", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(body),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Login failed");
      }

      console.log(userLocation);
      localStorage.setItem("userLocation", JSON.stringify(userLocation));
      localStorage.setItem("token", data.token);

      localStorage.setItem("farmer", JSON.stringify(data.farmer));

      navigate("/dashboard");
    } catch (error: any) {
      setError(error.message || "Failed to login. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[url('https://res.cloudinary.com/dzxgf75bh/image/upload/v1742636445/e1ec543c-9f57-472c-85b6-aceb6980328b_hedmex.jpg')] bg-cover bg-center bg-no-repeat flex items-center justify-center p-4">
      <div className="w-full max-w-md bg-white rounded-2xl shadow-xl p-8">
        <h1 className="text-2xl font-bold text-center text-gray-800 mb-8">
          Welcome Back
        </h1>

        <div className="flex justify-center space-x-4 mb-8">
          <button
            type="button"
            onClick={() => {
              setLoginMethod("password");
              setOtpSent(false);
              setError("");
            }}
            className={`flex items-center px-4 py-2 rounded-lg transition-all ${
              loginMethod === "password"
                ? "bg-green-500 text-white shadow-md scale-105"
                : "bg-gray-100 text-gray-700 hover:bg-gray-200"
            }`}
          >
            <Lock className="w-4 h-4 mr-2" />
            Password
          </button>
          <button
            type="button"
            onClick={() => {
              setLoginMethod("otp");
              setOtpSent(false);
              setError("");
            }}
            className={`flex items-center px-4 py-2 rounded-lg transition-all ${
              loginMethod === "otp"
                ? "bg-green-500 text-white shadow-md scale-105"
                : "bg-gray-100 text-gray-700 hover:bg-gray-200"
            }`}
          >
            <Phone className="w-4 h-4 mr-2" />
            OTP
          </button>
        </div>

        {error && (
          <div className="mb-6 p-4 bg-red-50 border border-red-200 text-red-700 rounded-lg">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          {loginMethod === "password" ? (
            <>
              <div>
                <label
                  htmlFor="username"
                  className="block text-sm font-medium text-gray-700 mb-1"
                >
                  Username
                </label>
                <input
                  type="text"
                  name="username"
                  id="username"
                  required
                  value={formData.username}
                  onChange={handleInputChange}
                  className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl text-gray-900 focus:border-green-500 focus:ring-green-500 transition-colors"
                  placeholder="Enter your username"
                />
              </div>

              <div>
                <label
                  htmlFor="password"
                  className="block text-sm font-medium text-gray-700 mb-1"
                >
                  Password
                </label>
                <div className="relative">
                  <input
                    type={showPassword ? "text" : "password"}
                    name="password"
                    id="password"
                    required
                    value={formData.password}
                    onChange={handleInputChange}
                    className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl text-gray-900 focus:border-green-500 focus:ring-green-500 transition-colors"
                    placeholder="Enter your password"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                  >
                    {showPassword ? (
                      <EyeOff className="w-5 h-5" />
                    ) : (
                      <Eye className="w-5 h-5" />
                    )}
                  </button>
                </div>
              </div>
            </>
          ) : (
            <>
              <div>
                <label
                  htmlFor="phone"
                  className="block text-sm font-medium text-gray-700 mb-1"
                >
                  Phone Number
                </label>
                <div className="flex">
                  <span className="inline-flex items-center px-4 border-2 border-r-0 border-gray-200 rounded-l-xl bg-gray-50 text-gray-500">
                    +91
                  </span>
                  <input
                    type="tel"
                    name="phone"
                    id="phone"
                    required
                    pattern="[0-9]{10}"
                    value={formData.phone}
                    onChange={handleInputChange}
                    className="w-full px-4 py-3 border-2 border-gray-200 rounded-r-xl text-gray-900 focus:border-green-500 focus:ring-green-500 transition-colors"
                    placeholder="Enter phone number"
                    disabled={otpSent}
                  />
                </div>
              </div>

              {!otpSent ? (
                <button
                  type="button"
                  onClick={handleSendOTP}
                  disabled={otpSending || !formData.phone}
                  className="w-full flex items-center justify-center px-4 py-3 rounded-xl text-white bg-green-600 hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  {otpSending ? (
                    <>
                      <Loader2 className="w-5 h-5 animate-spin mr-2" />
                      Sending OTP...
                    </>
                  ) : (
                    "Send OTP"
                  )}
                </button>
              ) : (
                <div>
                  <label
                    htmlFor="otp"
                    className="block text-sm font-medium text-gray-700 mb-1"
                  >
                    Enter OTP
                  </label>
                  <input
                    type="text"
                    name="otp"
                    id="otp"
                    required
                    pattern="[0-9]{6}"
                    maxLength={6}
                    value={formData.otp}
                    onChange={handleInputChange}
                    className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl text-gray-900 focus:border-green-500 focus:ring-green-500 transition-colors"
                    placeholder="Enter 6-digit OTP"
                  />
                </div>
              )}
            </>
          )}

          <button
            type="submit"
            disabled={isLoading || (loginMethod === "otp" && !otpSent)}
            className="w-full flex items-center justify-center px-6 py-3 rounded-xl text-white bg-green-600 hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            {isLoading ? (
              <>
                <Loader2 className="w-5 h-5 animate-spin mr-2" />
                Signing in...
              </>
            ) : (
              "Sign in"
            )}
          </button>

          <p className="text-center text-sm text-gray-600">
            Don't have an account?{" "}
            <button
              type="button"
              className="font-medium text-green-600 hover:text-green-500"
              onClick={() => navigate("/register")}
            >
              Register here
            </button>
          </p>
        </form>
      </div>
    </div>
  );
};
