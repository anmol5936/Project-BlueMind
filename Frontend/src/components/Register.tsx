import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  MapPin,
  Eye,
  EyeOff,
  Phone,
  User,
  Home,
  Globe,
  Droplets,
  Check,
  Loader2,
} from "lucide-react";
import { AuthLayout } from "./AuthLayout";

export const Register = () => {
  const navigate = useNavigate();
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const { location: userLocation } = useLocation();

  const [formData, setFormData] = useState({
    fullName: "",
    phoneNumber: "",
    username: "",
    password: "",
    preferredLanguage: "English",
    villageName: "",
    mainWaterPractice: "",
    waterPracticeDetails: "",
    mainWaterSource: "",
    currentTechUsage: "",
    loginMethod: "password",
    consent: false,
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setIsLoading(true);

    try {
      const response = await fetch("http://localhost:3000/api/register", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(formData),
      });
      console.log(userLocation);
      localStorage.setItem("userLocation", JSON.stringify(userLocation));
      const data = await response.json();
      console.log(data);

      if (!response.ok) {
        throw new Error(data.message || "Registration failed");
      }

      localStorage.setItem("token", data.token);
      localStorage.setItem("farmer", JSON.stringify(data.farmer));
      navigate("/dashboard");
    } catch (error: any) {
      setError(error.message || "Failed to register. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    const value =
      e.target.type === "checkbox"
        ? (e.target as HTMLInputElement).checked
        : e.target.value;

    setFormData({
      ...formData,
      [e.target.name]: value,
    });
  };

  return (
    <div
      className="min-h-screen bg-cover bg-center bg-no-repeat"
      style={{
        backgroundImage:
          "url('https://res.cloudinary.com/dzxgf75bh/image/upload/v1742636445/e1ec543c-9f57-472c-85b6-aceb6980328b_hedmex.jpg')",
      }}
    >
      <div className="min-h-screen bg-black bg-opacity-20 py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-2xl mx-auto bg-white/95 backdrop-blur-sm rounded-2xl shadow-xl overflow-hidden">
          <div className="px-8 py-12">
            <div className="text-center mb-8">
              <h2 className="text-3xl font-bold text-green-800">
                Join Our Farming Community
              </h2>
              <p className="mt-2 text-gray-600">
                Connect with fellow farmers and improve your agricultural
                practices
              </p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-6">
              {error && (
                <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
                  {error}
                </div>
              )}

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label
                    htmlFor="fullName"
                    className="block text-sm font-semibold text-gray-700"
                  >
                    Full Name
                  </label>
                  <div className="mt-1 relative">
                    <User className="absolute left-3 top-1/2 transform -translate-y-1/2 text-green-600 h-5 w-5" />
                    <input
                      id="fullName"
                      name="fullName"
                      type="text"
                      required
                      value={formData.fullName}
                      onChange={handleInputChange}
                      className="pl-10 block w-full px-4 py-3 border border-green-300 rounded-lg text-gray-900 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
                      placeholder="Enter your full name"
                    />
                  </div>
                </div>

                <div>
                  <label
                    htmlFor="phoneNumber"
                    className="block text-sm font-semibold text-gray-700"
                  >
                    Phone Number
                  </label>
                  <div className="mt-1 relative">
                    <Phone className="absolute left-3 top-1/2 transform -translate-y-1/2 text-green-600 h-5 w-5" />
                    <input
                      id="phoneNumber"
                      name="phoneNumber"
                      type="tel"
                      required
                      value={formData.phoneNumber}
                      onChange={handleInputChange}
                      className="pl-10 block w-full px-4 py-3 border border-green-300 rounded-lg text-gray-900 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
                      placeholder="Enter your phone number"
                    />
                  </div>
                </div>

                <div>
                  <label
                    htmlFor="username"
                    className="block text-sm font-semibold text-gray-700"
                  >
                    Username
                  </label>
                  <div className="mt-1 relative">
                    <User className="absolute left-3 top-1/2 transform -translate-y-1/2 text-green-600 h-5 w-5" />
                    <input
                      id="username"
                      name="username"
                      type="text"
                      value={formData.username}
                      onChange={handleInputChange}
                      className="pl-10 block w-full px-4 py-3 border border-green-300 rounded-lg text-gray-900 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
                      placeholder="Choose a username (optional)"
                    />
                  </div>
                </div>

                <div>
                  <label
                    htmlFor="password"
                    className="block text-sm font-semibold text-gray-700"
                  >
                    Password
                  </label>
                  <div className="mt-1 relative">
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-1/2 transform -translate-y-1/2 text-green-600"
                    >
                      {showPassword ? (
                        <EyeOff className="h-5 w-5" />
                      ) : (
                        <Eye className="h-5 w-5" />
                      )}
                    </button>
                    <input
                      id="password"
                      name="password"
                      type={showPassword ? "text" : "password"}
                      required
                      value={formData.password}
                      onChange={handleInputChange}
                      className="pr-10 block w-full px-4 py-3 border border-green-300 rounded-lg text-gray-900 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
                      placeholder="Create a password"
                    />
                  </div>
                </div>

                <div>
                  <label
                    htmlFor="preferredLanguage"
                    className="block text-sm font-semibold text-gray-700"
                  >
                    Preferred Language
                  </label>
                  <div className="mt-1 relative">
                    <Globe className="absolute left-3 top-1/2 transform -translate-y-1/2 text-green-600 h-5 w-5" />
                    <select
                      id="preferredLanguage"
                      name="preferredLanguage"
                      value={formData.preferredLanguage}
                      onChange={handleInputChange}
                      className="pl-10 block w-full px-4 py-3 border border-green-300 rounded-lg text-gray-900 focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
                    >
                      <option value="English">English</option>
                      <option value="Swahili">Swahili</option>
                      <option value="Hindi">Hindi</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label
                    htmlFor="villageName"
                    className="block text-sm font-semibold text-gray-700"
                  >
                    Village Name
                  </label>
                  <div className="mt-1 relative">
                    <Home className="absolute left-3 top-1/2 transform -translate-y-1/2 text-green-600 h-5 w-5" />
                    <input
                      id="villageName"
                      name="villageName"
                      type="text"
                      required
                      value={formData.villageName}
                      onChange={handleInputChange}
                      className="pl-10 block w-full px-4 py-3 border border-green-300 rounded-lg text-gray-900 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
                      placeholder="Enter your village name"
                    />
                  </div>
                </div>
              </div>

              <div className="space-y-6">
                <div>
                  <label
                    htmlFor="mainWaterPractice"
                    className="block text-sm font-semibold text-gray-700"
                  >
                    Main Water Practice
                  </label>
                  <div className="mt-1 relative">
                    <Droplets className="absolute left-3 top-1/2 transform -translate-y-1/2 text-green-600 h-5 w-5" />
                    <input
                      id="mainWaterPractice"
                      name="mainWaterPractice"
                      type="text"
                      required
                      value={formData.mainWaterPractice}
                      onChange={handleInputChange}
                      className="pl-10 block w-full px-4 py-3 border border-green-300 rounded-lg text-gray-900 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
                      placeholder="Enter your main water practice"
                    />
                  </div>
                </div>

                <div>
                  <label
                    htmlFor="waterPracticeDetails"
                    className="block text-sm font-semibold text-gray-700"
                  >
                    Water Practice Details
                  </label>
                  <div className="mt-1 relative">
                    <Droplets className="absolute left-3 top-1/2 transform -translate-y-1/2 text-green-600 h-5 w-5" />
                    <input
                      id="waterPracticeDetails"
                      name="waterPracticeDetails"
                      type="text"
                      required
                      value={formData.waterPracticeDetails}
                      onChange={handleInputChange}
                      className="pl-10 block w-full px-4 py-3 border border-green-300 rounded-lg text-gray-900 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
                      placeholder="Enter water practice details"
                    />
                  </div>
                </div>

                <div>
                  <label
                    htmlFor="mainWaterSource"
                    className="block text-sm font-semibold text-gray-700"
                  >
                    Main Water Source
                  </label>
                  <div className="mt-1 relative">
                    <Droplets className="absolute left-3 top-1/2 transform -translate-y-1/2 text-green-600 h-5 w-5" />
                    <input
                      id="mainWaterSource"
                      name="mainWaterSource"
                      type="text"
                      required
                      value={formData.mainWaterSource}
                      onChange={handleInputChange}
                      className="pl-10 block w-full px-4 py-3 border border-green-300 rounded-lg text-gray-900 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
                      placeholder="Enter your main water source"
                    />
                  </div>
                </div>

                <div>
                  <label
                    htmlFor="currentTechUsage"
                    className="block text-sm font-semibold text-gray-700"
                  >
                    Current Technology Usage
                  </label>
                  <div className="mt-1 relative">
                    <Globe className="absolute left-3 top-1/2 transform -translate-y-1/2 text-green-600 h-5 w-5" />
                    <input
                      id="currentTechUsage"
                      name="currentTechUsage"
                      type="text"
                      required
                      value={formData.currentTechUsage}
                      onChange={handleInputChange}
                      className="pl-10 block w-full px-4 py-3 border border-green-300 rounded-lg text-gray-900 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
                      placeholder="Describe your current technology usage"
                    />
                  </div>
                </div>
              </div>

              <button
                type="submit"
                disabled={isLoading}
                className="w-full flex items-center justify-center px-6 py-4 border border-transparent rounded-xl text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 transition-colors disabled:opacity-50 text-lg font-semibold"
              >
                {isLoading ? (
                  <>
                    <Loader2 className="w-5 h-5 animate-spin mr-2" />
                    Creating Account...
                  </>
                ) : (
                  "Create Account"
                )}
              </button>

              <p className="text-center text-sm text-gray-600">
                Already have an account?{" "}
                <Link
                  to="/login"
                  className="font-medium text-green-600 hover:text-green-500"
                >
                  Sign in here
                </Link>
              </p>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Register;
