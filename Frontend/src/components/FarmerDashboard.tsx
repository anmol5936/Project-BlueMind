import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Cloud,
  Droplet,
  Sun,
  ChevronRight,
  Leaf,
  TrendingUp,
  Users,
  Calendar,
  MapPin,
  ChevronLeft,
  Package,
  Sprout,
  Plus,
  X,
  Filter,
  Loader2,
  Droplets,
  DollarSign,
  Timer,
  Settings,
  Trash2,
  ArrowUpRight,
  ArrowDownRight,
  Grid,
  List,
} from "lucide-react";
import IrrigationPlan from "./IrrigationPlan";
import IrrigationPlanSection from "./Irrigation";

// Custom useLocation Hook
const useLocation = () => {
  const [location, setLocation] = useState<{
    latitude: number;
    longitude: number;
    city?: string;
    region?: string;
  } | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const getCurrentLocation = () => {
    setIsLoading(true);
    setError(null);
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setLocation({
            latitude: position.coords.latitude,
            longitude: position.coords.longitude,
          });
          setIsLoading(false);
        },
        (err) => {
          setError("Unable to retrieve location: " + err.message);
          setIsLoading(false);
        }
      );
    } else {
      setError("Geolocation is not supported by this browser.");
      setIsLoading(false);
    }
  };

  useEffect(() => {
    getCurrentLocation();
  }, []);

  return { location, isLoading, error, refetch: getCurrentLocation };
};

// Types
interface Stat {
  title: string;
  value: string;
  trend: string;
  icon: React.ReactNode;
}

interface WaterTip {
  title: string;
  description: string;
  icon: React.ReactNode;
}

interface Resource {
  type: string;
  quantity: string;
  icon: React.ReactNode;
}

interface LeaderboardEntry {
  name: string;
  waterSaved: string;
  tipsShared: number;
  method: string;
}

interface Milestone {
  event: string;
  date: string;
  icon: React.ReactNode;
}

interface IrrigationPlan {
  waterUsage: number;
  frequency: string;
  method: string;
  waterSaved: number;
  profitIncrease: number;
}

interface Farm {
  id: string;
  name: string;
  size: string;
  primaryCrop: string;
  waterSource: string;
  technologyReadiness: string;
  createdAt: string;
}

export const FarmerDashboard = () => {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [selectedPeriod, setSelectedPeriod] = useState("Today");
  const [currentTipIndex, setCurrentTipIndex] = useState(0);
  const [showResourceForm, setShowResourceForm] = useState(false);
  const [showMilestoneForm, setShowMilestoneForm] = useState(false);
  const [sortBy, setSortBy] = useState<"water" | "tips">("water");
  const [selectedFarmer, setSelectedFarmer] = useState<LeaderboardEntry | null>(
    null
  );
  const [showFarmModal, setShowFarmModal] = useState(false);
  const [farms, setFarms] = useState<Farm[]>(() => {
    const savedFarms = localStorage.getItem("farms");
    return savedFarms ? JSON.parse(savedFarms) : [];
  });
  const [selectedFarm, setSelectedFarm] = useState<Farm | null>(null);
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");
  const [isEditMode, setIsEditMode] = useState(false);
  const [farmThemes, setFarmThemes] = useState<
    Record<string, { color: string; icon: string }>
  >({});
  const [editFarm, setEditFarm] = useState<Farm | null>(null); // Added for editing farm

  const [cropType, setCropType] = useState<string>("Lettuce");
  const [growthStage, setGrowthStage] = useState<string>("Seedling");
  const [irrigationPlan, setIrrigationPlan] = useState<IrrigationPlan | null>(
    null
  );
  const [isGeneratingPlan, setIsGeneratingPlan] = useState(false);

  const {
    location,
    isLoading: isGettingLocation,
    error: locationError,
    refetch: getCurrentLocation,
  } = useLocation();
  const periods = ["Today", "Week", "Month", "Season"];

  const getFarmPerformance = (farm: Farm) => {
    const waterUsageScore = Math.random() * 100;
    const profitScore = Math.random() * 100;
    const healthScore = Math.random() * 100;
    return {
      waterUsageScore,
      profitScore,
      healthScore,
      trend: Math.random() > 0.5 ? "up" : "down",
      percentage: Math.floor(Math.random() * 15 + 1),
    };
  };

  const updateFarmTheme = (farmId: string, color: string, icon: string) => {
    setFarmThemes((prev) => ({
      ...prev,
      [farmId]: { color, icon },
    }));
  };

  const FarmOverview = () => {
    const [searchQuery, setSearchQuery] = useState("");
    const [filterBy, setFilterBy] = useState("all");

    const filteredFarms = farms.filter((farm) => {
      const matchesSearch =
        farm.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        farm.primaryCrop.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesFilter = filterBy === "all" || farm.primaryCrop === filterBy;
      return matchesSearch && matchesFilter;
    });

    const cropOptions = [
      "all",
      ...new Set(farms.map((farm) => farm.primaryCrop)),
    ];

    return (
      <div className="mb-8">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 gap-4 bg-white/80 backdrop-blur-md p-4 rounded-xl shadow-sm">
          <h2 className="text-2xl font-bold text-green-800 flex items-center">
            <Sprout className="mr-2 text-green-600" size={24} />{" "}
            {/* Using a Sprout icon */}
            Farm Overview
          </h2>
          <div className="flex flex-col sm:flex-row items-center space-y-2 sm:space-y-0 sm:space-x-4 w-full sm:w-auto">
            <input
              type="text"
              placeholder="Search farms..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full sm:w-48 p-2 rounded-lg border border-green-300 focus:outline-none focus:ring-2 focus:ring-green-500 bg-white/50 text-green-800 placeholder-green-400"
            />
            <select
              value={filterBy}
              onChange={(e) => setFilterBy(e.target.value)}
              className="w-full sm:w-36 p-2 rounded-lg border border-green-300 focus:outline-none focus:ring-2 focus:ring-green-500 bg-white/50 text-green-800"
            >
              {cropOptions.map((crop) => (
                <option key={crop} value={crop}>
                  {crop === "all" ? "All Crops" : crop}
                </option>
              ))}
            </select>
            <div className="flex items-center space-x-2 bg-green-50 rounded-lg p-1 shadow-sm">
              <motion.button
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => setViewMode("grid")}
                className={`p-2 rounded-lg ${
                  viewMode === "grid"
                    ? "bg-green-600 text-white"
                    : "text-green-600 hover:bg-green-100"
                }`}
                title="Grid View"
              >
                <Grid size={20} />
              </motion.button>
              <motion.button
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => setViewMode("list")}
                className={`p-2 rounded-lg ${
                  viewMode === "list"
                    ? "bg-green-600 text-white"
                    : "text-green-600 hover:bg-green-100"
                }`}
                title="List View"
              >
                <List size={20} />
              </motion.button>
            </div>
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => setIsEditMode(!isEditMode)}
              className="flex items-center space-x-2 bg-yellow-500 text-white px-4 py-2 rounded-lg shadow-md"
            >
              <Settings size={20} />
              <span>{isEditMode ? "View Mode" : "Edit Mode"}</span>
            </motion.button>
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => setShowFarmModal(true)}
              className="flex items-center space-x-2 bg-gradient-to-r from-green-600 to-emerald-500 text-white px-4 py-2 rounded-lg shadow-md"
            >
              <Plus size={20} />
              <span>Add Farm</span>
            </motion.button>
          </div>
        </div>

        {viewMode === "grid" ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredFarms.map((farm) => {
              const performance = getFarmPerformance(farm);
              const theme = farmThemes[farm.id] || {
                color: "emerald",
                icon: "Leaf",
              };

              return (
                <motion.div
                  key={farm.id}
                  whileHover={{ scale: 1.03, rotate: 1, y: -5 }}
                  className={`relative bg-gradient-to-br from-${theme.color}-100 to-white rounded-xl p-6 shadow-lg hover:shadow-2xl transition-all duration-300 overflow-hidden`}
                >
                  <div className="flex justify-between items-center mb-4">
                    <div className="flex items-center space-x-3">
                      <div
                        className={`p-2 rounded-full bg-${theme.color}-200 flex items-center justify-center w-10 h-10`}
                      >
                        <Leaf className={`text-${theme.color}-600`} size={20} />
                      </div>
                      <div>
                        <h3 className="text-xl font-semibold text-gray-800">
                          {farm.name}
                        </h3>
                        <p className="text-sm text-gray-600">{farm.size}</p>
                      </div>
                    </div>
                    <div className="flex space-x-2">
                      <motion.button
                        whileHover={{ scale: 1.1 }}
                        onClick={() => setSelectedFarm(farm)}
                        className={`p-3 rounded-full bg-${theme.color}-100 text-${theme.color}-600`}
                        title="View Dashboard"
                      >
                        <ArrowUpRight size={20} />
                      </motion.button>
                    </div>
                  </div>

                  <div className="grid grid-cols-3 gap-4 mb-6">
                    <div className="flex flex-col items-center">
                      <div className="relative w-14 h-14">
                        <svg className="w-full h-full" viewBox="0 0 36 36">
                          <path
                            className="text-gray-200"
                            d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                            fill="none"
                            stroke="currentColor"
                            strokeWidth="3"
                          />
                          <path
                            className="text-blue-500"
                            d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                            fill="none"
                            stroke="currentColor"
                            strokeWidth="3"
                            strokeDasharray={`${performance.waterUsageScore}, 100`}
                          />
                        </svg>
                        <div className="absolute inset-0 flex items-center justify-center">
                          <Droplet className="text-blue-600" size={18} />
                        </div>
                      </div>
                      <p className="text-blue-700 text-sm font-semibold mt-1">
                        {performance.waterUsageScore.toFixed(1)}%
                      </p>
                      <p className="text-xs text-gray-500">Water</p>
                    </div>
                    <div className="flex flex-col items-center">
                      <div className="relative w-14 h-14">
                        <svg className="w-full h-full" viewBox="0 0 36 36">
                          <path
                            className="text-gray-200"
                            d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                            fill="none"
                            stroke="currentColor"
                            strokeWidth="3"
                          />
                          <path
                            className="text-amber-500"
                            d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                            fill="none"
                            stroke="currentColor"
                            strokeWidth="3"
                            strokeDasharray={`${performance.profitScore}, 100`}
                          />
                        </svg>
                        <div className="absolute inset-0 flex items-center justify-center">
                          <DollarSign className="text-amber-600" size={18} />
                        </div>
                      </div>
                      <p className="text-amber-700 text-sm font-semibold mt-1">
                        {performance.profitScore.toFixed(1)}%
                      </p>
                      <p className="text-xs text-gray-500">Profit</p>
                    </div>
                    <div className="flex flex-col items-center">
                      <div className="relative w-14 h-14">
                        <svg className="w-full h-full" viewBox="0 0 36 36">
                          <path
                            className="text-gray-200"
                            d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                            fill="none"
                            stroke="currentColor"
                            strokeWidth="3"
                          />
                          <path
                            className="text-green-500"
                            d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                            fill="none"
                            stroke="currentColor"
                            strokeWidth="3"
                            strokeDasharray={`${performance.healthScore}, 100`}
                          />
                        </svg>
                        <div className="absolute inset-0 flex items-center justify-center">
                          <Leaf className="text-green-600" size={18} />
                        </div>
                      </div>
                      <p className="text-green-700 text-sm font-semibold mt-1">
                        {performance.healthScore.toFixed(1)}%
                      </p>
                      <p className="text-xs text-gray-500">Health</p>
                    </div>
                  </div>

                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center space-x-2">
                      {performance.trend === "up" ? (
                        <ArrowUpRight
                          className="text-green-500 animate-pulse"
                          size={20}
                        />
                      ) : (
                        <ArrowDownRight
                          className="text-red-500 animate-pulse"
                          size={20}
                        />
                      )}
                      <span
                        className={`text-sm font-medium ${
                          performance.trend === "up"
                            ? "text-green-600"
                            : "text-red-600"
                        }`}
                      >
                        {performance.percentage}%{" "}
                        {performance.trend === "up" ? "Up" : "Down"}
                      </span>
                    </div>
                  </div>

                  <AnimatePresence>
                    {isEditMode && (
                      <motion.div
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: 10 }}
                        className="mt-4 flex space-x-2"
                      >
                        <motion.button
                          whileHover={{ scale: 1.05 }}
                          onClick={() => {
                            setFarms(farms.filter((f) => f.id !== farm.id));
                            localStorage.setItem(
                              "farms",
                              JSON.stringify(
                                farms.filter((f) => f.id !== farm.id)
                              )
                            );
                          }}
                          className="flex-1 p-2 bg-red-100 text-black rounded-lg flex items-center justify-center gap-2"
                          title="Delete Farm"
                        >
                          <Trash2 size={16} />
                          <span>Delete</span>
                        </motion.button>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </motion.div>
              );
            })}
          </div>
        ) : (
          <div className="space-y-4">
            {filteredFarms.map((farm) => {
              const performance = getFarmPerformance(farm);
              const theme = farmThemes[farm.id] || {
                color: "emerald",
                icon: "Leaf",
              };

              return (
                <motion.div
                  key={farm.id}
                  whileHover={{ scale: 1.01, x: 5 }}
                  className={`bg-gradient-to-r from-${theme.color}-100 to-white rounded-xl p-4 shadow-sm hover:shadow-md transition-all duration-300`}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-4">
                      <div
                        className={`p-3 rounded-full bg-${theme.color}-200 flex items-center justify-center w-12 h-12`}
                      >
                        <Leaf className={`text-${theme.color}-600`} size={24} />
                      </div>
                      <div>
                        <h3 className="text-lg font-semibold text-gray-800">
                          {farm.name}
                        </h3>
                        <p className="text-sm text-gray-600">
                          {farm.size} • {farm.primaryCrop}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center space-x-6">
                      <div className="flex items-center space-x-4">
                        <div className="text-center">
                          <p
                            className={`text-${theme.color}-700 text-lg font-semibold`}
                          >
                            {performance.waterUsageScore.toFixed(1)}%
                          </p>
                          <p className="text-xs text-gray-500">Water</p>
                        </div>
                        <div className="text-center">
                          <p
                            className={`text-${theme.color}-700 text-lg font-semibold`}
                          >
                            {performance.profitScore.toFixed(1)}%
                          </p>
                          <p className="text-xs text-gray-500">Profit</p>
                        </div>
                        <div className="text-center">
                          <p
                            className={`text-${theme.color}-700 text-lg font-semibold`}
                          >
                            {performance.healthScore.toFixed(1)}%
                          </p>
                          <p className="text-xs text-gray-500">Health</p>
                        </div>
                      </div>
                      <motion.button
                        whileHover={{ scale: 1.1 }}
                        onClick={() => setSelectedFarm(farm)}
                        className={`p-2 rounded-full bg-${theme.color}-100 text-${theme.color}-600`}
                      >
                        <ArrowUpRight size={20} />
                      </motion.button>
                    </div>
                  </div>
                </motion.div>
              );
            })}
          </div>
        )}
      </div>
    );
  };

  const handleAddFarm = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const newFarm: Farm = {
      id: crypto.randomUUID(),
      name: formData.get("farmName") as string,
      size: formData.get("farmSize") as string,
      primaryCrop: formData.get("primaryCrop") as string,
      waterSource: formData.get("waterSource") as string,
      technologyReadiness: formData.get("technologyReadiness") as string,
      createdAt: new Date().toISOString(),
    };
    const updatedFarms = [...farms, newFarm];
    setFarms(updatedFarms);
    localStorage.setItem("farms", JSON.stringify(updatedFarms));
    setShowFarmModal(false);
    setSelectedFarm(newFarm);
  };

  const generateFarmStats = (farm: Farm): Stat[] => {
    const sizeFactor =
      farm.size === "Large" ? 1.5 : farm.size === "Medium" ? 1.2 : 1;
    return [
      {
        title: "Soil Moisture",
        value: `${Math.floor(25 * sizeFactor)}%`,
        trend: "+5%",
        icon: (
          <div className="w-16 h-4 bg-green-200 rounded-full overflow-hidden">
            <div className="w-1/3 h-full bg-green-500 animate-water-fill"></div>
          </div>
        ),
      },
      {
        title: "Water Saved",
        value: `${Math.floor(50 * sizeFactor)}L`,
        trend: `+${Math.floor(10 * sizeFactor)}L`,
        icon: <Droplet className="text-blue-500 animate-bounce" size={32} />,
      },
      {
        title: "Next Rain",
        value: "Tuesday",
        trend: "70% chance",
        icon: <Cloud className="text-gray-500 animate-float" size={32} />,
      },
    ];
  };

  const generateFarmResources = (farm: Farm): Resource[] => {
    const sizeFactor =
      farm.size === "Large" ? 2 : farm.size === "Medium" ? 1.5 : 1;
    return [
      {
        type: "Seeds",
        quantity: `${5 * sizeFactor} kg`,
        icon: <Sprout size={20} />,
      },
      {
        type: "Fertilizer",
        quantity: `${10 * sizeFactor} bags`,
        icon: <Package size={20} />,
      },
      {
        type: "Water Stored",
        quantity: `${300 * sizeFactor}L`,
        icon: <Droplet size={20} />,
      },
    ];
  };

  const generateIrrigationPlan = async (farm: Farm) => {
    if (!location) return;
    setIsGeneratingPlan(true);
    await new Promise((resolve) => setTimeout(resolve, 1500));
    const sizeFactor =
      farm.size === "Large" ? 1.5 : farm.size === "Medium" ? 1.2 : 1;
    const cropFactor =
      farm.primaryCrop === "Rice"
        ? 1.3
        : farm.primaryCrop === "Wheat"
        ? 1.1
        : 1;
    const mockPlan: IrrigationPlan = {
      waterUsage: Math.floor(
        (Math.random() * 50 + 20) * sizeFactor * cropFactor
      ),
      frequency: Math.random() > 0.5 ? "Daily" : "Every 2 days",
      method:
        farm.technologyReadiness === "Drip Irrigation" ? "Drip" : "Sprinkler",
      waterSaved: Math.floor((Math.random() * 100 + 50) * sizeFactor),
      profitIncrease: Math.floor((Math.random() * 15 + 5) * cropFactor),
    };
    setIrrigationPlan(mockPlan);
    setIsGeneratingPlan(false);
  };

  const nextTip = () =>
    setCurrentTipIndex((prev) => (prev + 1) % waterTips.length);
  const prevTip = () =>
    setCurrentTipIndex(
      (prev) => (prev - 1 + waterTips.length) % waterTips.length
    );

  const farmerData = JSON.parse(localStorage.getItem("farmer") || "{}");
  const userLocation = JSON.parse(localStorage.getItem("userLocation") || "{}");

  const MobileHeader = () => (
    <div className="lg:hidden flex justify-between items-center mb-4 p-4 bg-white rounded-xl shadow-sm">
      <div>
        <h1 className="text-xl font-bold text-green-800">
          {farmerData.fullName || "Ramesh"}
        </h1>
        <div className="flex items-center space-x-2 text-sm text-green-600">
          <MapPin size={14} />
          <p>{farmerData.villageName || "Village"}</p>
        </div>
      </div>
      <motion.button
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
        className="p-2 rounded-lg bg-green-50"
      >
        <ChevronRight size={24} className="text-green-600" />
      </motion.button>
    </div>
  );

  const MobileMenu = () => (
    <AnimatePresence>
      {isMobileMenuOpen && (
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -20 }}
          className="lg:hidden fixed inset-0 z-50 bg-white"
        >
          <div className="p-4">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-xl font-bold text-green-800">Menu</h2>
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => setIsMobileMenuOpen(false)}
                className="p-2"
              >
                <X size={24} className="text-green-600" />
              </motion.button>
            </div>
            <div className="space-y-4">
              {periods.map((period) => (
                <motion.button
                  key={period}
                  whileHover={{ scale: 1.02 }}
                  onClick={() => {
                    setSelectedPeriod(period);
                    setIsMobileMenuOpen(false);
                  }}
                  className={`w-full px-4 py-3 rounded-lg text-left ${
                    selectedPeriod === period
                      ? "bg-green-600 text-white"
                      : "bg-green-50 text-green-600"
                  }`}
                >
                  {period}
                </motion.button>
              ))}
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );

  const WaterConservationTips = () => (
    <div className="mb-6 bg-white rounded-xl shadow-sm p-4 sm:p-6">
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-lg font-semibold text-green-800">
          Water Conservation Tips
        </h3>
        <div className="flex space-x-2">
          <motion.button
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
            onClick={prevTip}
            className="p-2 rounded-full hover:bg-green-50"
          >
            <ChevronLeft size={20} className="text-green-600" />
          </motion.button>
          <motion.button
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
            onClick={nextTip}
            className="p-2 rounded-full hover:bg-green-50"
          >
            <ChevronRight size={20} className="text-green-600" />
          </motion.button>
        </div>
      </div>
      <motion.div
        key={currentTipIndex}
        initial={{ opacity: 0, x: 50 }}
        animate={{ opacity: 1, x: 0 }}
        exit={{ opacity: 0, x: -50 }}
        className="flex items-center space-x-6 p-4 bg-green-50 rounded-lg"
      >
        {waterTips[currentTipIndex].icon}
        <div>
          <h4 className="font-semibold text-green-800">
            {waterTips[currentTipIndex].title}
          </h4>
          <p className="text-green-600">
            {waterTips[currentTipIndex].description}
          </p>
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => alert("Opening detailed guide...")}
            className="mt-2 text-green-700 hover:text-green-900 font-medium"
          >
            Learn More →
          </motion.button>
        </div>
      </motion.div>
    </div>
  );

  const ResourceInventory = ({ farm }: { farm: Farm }) => {
    const farmResources = generateFarmResources(farm);
    return (
      <div className="bg-white rounded-xl shadow-sm p-4 sm:p-6">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-lg font-semibold text-green-800">
            Resource Inventory
          </h3>
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => setShowResourceForm(!showResourceForm)}
            className="flex items-center space-x-1 text-green-600 hover:text-green-800"
          >
            <Plus size={20} />
            <span>Add Resource</span>
          </motion.button>
        </div>
        <AnimatePresence>
          {showResourceForm && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: "auto", opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              className="mb-4 p-4 bg-green-50 rounded-lg"
            >
              <div className="space-y-3">
                <select className="w-full p-2 rounded border border-green-200 focus:outline-none focus:ring-2 focus:ring-green-500">
                  <option>Seeds</option>
                  <option>Fertilizer</option>
                  <option>Water</option>
                </select>
                <input
                  type="number"
                  placeholder="Quantity"
                  className="w-full p-2 rounded border border-green-200 focus:outline-none focus:ring-2 focus:ring-green-500"
                />
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => setShowResourceForm(false)}
                  className="w-full bg-green-600 text-white py-2 rounded hover:bg-green-700"
                >
                  Save Resource
                </motion.button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
        <div className="space-y-3">
          {farmResources.map((resource, index) => (
            <motion.div
              key={index}
              whileHover={{ scale: 1.02 }}
              className="flex items-center justify-between p-3 bg-green-50 rounded-lg"
            >
              <div className="flex items-center space-x-3">
                <div className="text-green-600">{resource.icon}</div>
                <span className="font-medium text-green-800">
                  {resource.type}
                </span>
              </div>
              <span className="text-green-600">{resource.quantity}</span>
            </motion.div>
          ))}
        </div>
      </div>
    );
  };

  const MilestoneTracker = () => (
    <div className="bg-white rounded-xl shadow-sm p-4 sm:p-6">
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-lg font-semibold text-green-800">
          Farm Milestones
        </h3>
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={() => setShowMilestoneForm(!showMilestoneForm)}
          className="flex items-center space-x-1 text-green-600 hover:text-green-800"
        >
          <Plus size={20} />
          <span>Add Milestone</span>
        </motion.button>
      </div>
      <AnimatePresence>
        {showMilestoneForm && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="mb-4 p-4 bg-green-50 rounded-lg"
          >
            <div className="space-y-3">
              <input
                type="text"
                placeholder="Event Name"
                className="w-full p-2 rounded border border-green-200 focus:outline-none focus:ring-2 focus:ring-green-500"
              />
              <input
                type="date"
                className="w-full p-2 rounded border border-green-200 focus:outline-none focus:ring-2 focus:ring-green-500"
              />
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => setShowMilestoneForm(false)}
                className="w-full bg-green-600 text-white py-2 rounded hover:bg-green-700"
              >
                Save Milestone
              </motion.button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
      <div className="space-y-4">
        {milestones.map((milestone, index) => (
          <motion.div
            key={index}
            whileHover={{ scale: 1.02 }}
            className="flex items-start space-x-4"
          >
            <div className="flex-shrink-0 w-8 h-8 bg-green-100 rounded-full flex items-center justify-center">
              {milestone.icon}
            </div>
            <div className="flex-grow">
              <p className="font-medium text-green-800">{milestone.event}</p>
              <p className="text-sm text-green-600">{milestone.date}</p>
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  );

  const CommunityLeaderboard = () => (
    <div className="bg-white rounded-xl shadow-sm p-4 sm:p-6">
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-lg font-semibold text-green-800">
          Community Leaders
        </h3>
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={() => setSortBy(sortBy === "water" ? "tips" : "water")}
          className="flex items-center space-x-1 text-green-600 hover:text-green-800"
        >
          <Filter size={16} />
          <span>Sort by {sortBy === "water" ? "Tips" : "Water"}</span>
        </motion.button>
      </div>
      <div className="space-y-3">
        {leaderboard
          .sort((a, b) =>
            sortBy === "water"
              ? parseInt(b.waterSaved) - parseInt(a.waterSaved)
              : b.tipsShared - a.tipsShared
          )
          .map((farmer, index) => (
            <motion.div
              key={index}
              whileHover={{ scale: 1.02 }}
              className="p-4 bg-green-50 rounded-lg cursor-pointer hover:bg-green-100"
              onClick={() => setSelectedFarmer(farmer)}
            >
              <div className="flex items-center space-x-3">
                <div className="w-8 h-8 bg-green-200 rounded-full flex items-center justify-center">
                  <Leaf size={20} className="text-green-700" />
                </div>
                <div className="flex-grow">
                  <div className="flex items-center space-x-2">
                    <span className="font-medium text-green-800">
                      {farmer.name}
                    </span>
                    <span className="text-green-600">
                      {sortBy === "water"
                        ? farmer.waterSaved
                        : `${farmer.tipsShared} tips`}
                    </span>
                  </div>
                  <p className="text-sm text-green-600">{farmer.method}</p>
                </div>
                <ChevronRight size={16} className="text-green-600" />
              </div>
            </motion.div>
          ))}
      </div>
    </div>
  );

  const StatsCard = ({ stat, index }: { stat: Stat; index: number }) => (
    <motion.div
      whileHover={{ scale: 1.02 }}
      whileTap={{ scale: 0.98 }}
      className="p-4 sm:p-6 bg-white rounded-xl shadow-sm hover:shadow-md transition-all duration-300"
    >
      <div className="flex justify-between items-start">
        <div>
          <p className="text-sm text-gray-600">{stat.title}</p>
          <div className="flex items-baseline space-x-2">
            <span className="text-2xl font-bold text-gray-800">
              {stat.value}
            </span>
            <span className="text-sm text-gray-600">{stat.trend}</span>
          </div>
        </div>
        {stat.icon}
      </div>
    </motion.div>
  );

  const FarmModal = () => (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50"
    >
      <motion.div
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.9, opacity: 0 }}
        className="bg-white rounded-xl p-6 max-w-md w-full"
      >
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-xl font-semibold text-green-800">Add New Farm</h3>
          <motion.button
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
            onClick={() => setShowFarmModal(false)}
            className="text-gray-500 hover:text-gray-700"
          >
            <X size={20} />
          </motion.button>
        </div>
        <form onSubmit={handleAddFarm} className="space-y-4">
          <div>
            <label
              htmlFor="farmName"
              className="block text-sm font-medium text-green-700 mb-1"
            >
              Farm Name
            </label>
            <input
              type="text"
              id="farmName"
              name="farmName"
              required
              className="w-full p-2 rounded-lg border border-green-200 focus:outline-none focus:ring-2 focus:ring-green-500"
            />
          </div>
          <div>
            <label
              htmlFor="farmSize"
              className="block text-sm font-medium text-green-700 mb-1"
            >
              Farm Size
            </label>
            <select
              id="farmSize"
              name="farmSize"
              required
              className="w-full p-2 rounded-lg border border-green-200 focus:outline-none focus:ring-2 focus:ring-green-500"
            >
              <option value="Small">Small - &lt; 5 acres</option>
              <option value="Medium">Medium - 5-15 acres</option>
              <option value="Large">Large - &gt;15 acres</option>
            </select>
          </div>
          <div>
            <label
              htmlFor="primaryCrop"
              className="block text-sm font-medium text-green-700 mb-1"
            >
              Primary Crop
            </label>
            <select
              id="primaryCrop"
              name="primaryCrop"
              required
              className="w-full p-2 rounded-lg border border-green-200 focus:outline-none focus:ring-2 focus:ring-green-500"
            >
              <option value="Wheat">Wheat</option>
              <option value="Rice">Rice</option>
              <option value="Corn">Corn</option>
              <option value="Tomato">Tomato</option>
              <option value="Lettuce">Lettuce</option>
            </select>
          </div>
          <div>
            <label
              htmlFor="waterSource"
              className="block text-sm font-medium text-green-700 mb-1"
            >
              Water Source
            </label>
            <select
              id="waterSource"
              name="waterSource"
              required
              className="w-full p-2 rounded-lg border border-green-200 focus:outline-none focus:ring-2 focus:ring-green-500"
            >
              <option value="River">River</option>
              <option value="Well">Well</option>
              <option value="Rainwater">Rainwater</option>
              <option value="Canal">Canal</option>
            </select>
          </div>
          <div>
            <label
              htmlFor="technologyReadiness"
              className="block text-sm font-medium text-green-700 mb-1"
            >
              Technology Readiness
            </label>
            <select
              id="technologyReadiness"
              name="technologyReadiness"
              required
              className="w-full p-2 rounded-lg border border-green-200 focus:outline-none focus:ring-2 focus:ring-green-500"
            >
              <option value="Drip Irrigation">Drip Irrigation</option>
              <option value="Solar Pumps">Solar Pumps</option>
              <option value="Rainwater Harvesting">Rainwater Harvesting</option>
              <option value="Sprinkler System">Sprinkler System</option>
              <option value="Manual">Manual</option>
            </select>
          </div>
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            type="submit"
            className="w-full bg-green-600 text-white py-3 rounded-lg hover:bg-green-700"
          >
            Create Farm
          </motion.button>
        </form>
      </motion.div>
    </motion.div>
  );

  const FarmNavigation = () => (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="flex space-x-2 mb-6 overflow-x-auto pb-2 bg-white/20 backdrop-blur-md rounded-xl p-2 shadow-sm"
    >
      {farms.map((farm) => (
        <motion.button
          key={farm.id}
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={() => setSelectedFarm(farm)}
          className={`flex items-center px-4 py-2 rounded-lg whitespace-nowrap ${
            selectedFarm?.id === farm.id
              ? "bg-emerald-600 text-white ring-2 ring-emerald-400"
              : "bg-green-50 text-green-600 hover:bg-green-100"
          }`}
          aria-label={`Switch to ${farm.name} dashboard`}
          title={`View ${farm.name}`}
        >
          <Leaf size={16} className="mr-2" />
          {farm.name}
        </motion.button>
      ))}
      {selectedFarm && (
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={() => setSelectedFarm(null)}
          className="px-4 py-2 rounded-lg bg-green-50 text-green-600 hover:bg-green-100"
        >
          Back to Overview
        </motion.button>
      )}
    </motion.div>
  );

  const FarmDashboard = ({ farm }: { farm: Farm }) => {
    const farmStats = generateFarmStats(farm);
    return (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -20 }}
        className="space-y-6"
      >
        <h2 className="text-2xl font-bold text-green-800">
          {farm.name} Dashboard
        </h2>
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {farmStats.map((stat, index) => (
            <StatsCard key={index} stat={stat} index={index} />
          ))}
        </div>
        <IrrigationPlanSection
          farm={farm}
          locationError={locationError}
          isGettingLocation={isGettingLocation}
          getCurrentLocation={getCurrentLocation}
        />
        {/* <IrrigationPlan /> */}
        <WaterConservationTips />
        <ResourceInventory farm={farm} />
        <MilestoneTracker />
        <CommunityLeaderboard />
      </motion.div>
    );
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-green-200 to-white pb-24">
      <style jsx global>{`
        @keyframes water-fill {
          0% {
            width: 0%;
          }
          100% {
            width: 33%;
          }
        }
        @keyframes float {
          0%,
          100% {
            transform: translateY(0);
          }
          50% {
            transform: translateY(-5px);
          }
        }
        .animate-water-fill {
          animation: water-fill 2s infinite alternate;
        }
        .animate-float {
          animation: float 3s ease-in-out infinite;
        }
      `}</style>
      <MobileHeader />
      <MobileMenu />
      <div className="p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto space-y-8">
        <motion.div className="hidden lg:flex justify-between items-center">
          <div className="space-y-2">
            <motion.h1
              whileHover={{ scale: 1.02 }}
              className="text-3xl font-bold text-green-800 cursor-pointer"
            >
              {farmerData.fullName || "Ramesh"}
            </motion.h1>
            <div className="flex items-center space-x-3 text-green-600">
              <MapPin size={16} />
              <p>{farmerData.villageName || "Village Name"}</p>
              <span className="text-gray-400">|</span>
              <Sun size={16} className="text-yellow-500" />
              <span className="text-xl">34°C</span>
            </div>
          </div>
          <div className="flex space-x-4">
            {periods.map((period) => (
              <motion.button
                key={period}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => setSelectedPeriod(period)}
                className={`px-6 py-3 rounded-lg transition-all duration-300 ${
                  selectedPeriod === period
                    ? "bg-green-600 text-white"
                    : "bg-white text-green-600 hover:bg-green-50"
                }`}
              >
                {period}
              </motion.button>
            ))}
          </div>
        </motion.div>
        <FarmNavigation />
        <div className="space-y-8">
          {selectedFarm ? (
            <FarmDashboard farm={selectedFarm} />
          ) : (
            <FarmOverview />
          )}
        </div>

        <motion.button
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.9 }}
          className="fixed bottom-8 right-8 w-16 h-16 bg-green-600 rounded-full flex items-center justify-center shadow-lg text-white z-40 hover:bg-green-700"
          onClick={() => setShowFarmModal(true)}
        >
          <Plus size={28} />
        </motion.button>

        <AnimatePresence>
          {selectedFarmer && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-8 z-50"
            >
              <motion.div
                initial={{ scale: 0.9, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.9, opacity: 0 }}
                className="bg-white rounded-xl p-8 max-w-lg w-full"
              >
                <div className="flex justify-between items-center mb-6">
                  <h3 className="text-2xl font-semibold text-green-800">
                    {selectedFarmer.name}'s Profile
                  </h3>
                  <motion.button
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.9 }}
                    onClick={() => setSelectedFarmer(null)}
                    className="p-2 hover:bg-green-50 rounded-full"
                  >
                    <X
                      size={24}
                      className="text-gray-500 hover:text-gray-700"
                    />
                  </motion.button>
                </div>
                <div className="space-y-6">
                  <div className="p-6 bg-green-50 rounded-xl">
                    <h4 className="font-medium text-green-800 mb-3">
                      Water Saving Method
                    </h4>
                    <p className="text-lg text-green-600">
                      {selectedFarmer.method}
                    </p>
                  </div>
                  <div className="grid grid-cols-2 gap-6">
                    <div className="p-6 bg-green-50 rounded-xl">
                      <p className="font-medium text-green-800 mb-2">
                        Water Saved
                      </p>
                      <p className="text-2xl font-bold text-green-800">
                        {selectedFarmer.waterSaved}
                      </p>
                    </div>
                    <div className="p-6 bg-green-50 rounded-xl">
                      <p className="font-medium text-green-800 mb-2">
                        Tips Shared
                      </p>
                      <p className="text-2xl font-bold text-green-800">
                        {selectedFarmer.tipsShared}
                      </p>
                    </div>
                  </div>
                  <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={() => setSelectedFarmer(null)}
                    className="w-full bg-green-600 text-white py-3 rounded-xl hover:bg-green-700 text-lg"
                  >
                    Close
                  </motion.button>
                </div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>

        <AnimatePresence>{showFarmModal && <FarmModal />}</AnimatePresence>

        <AnimatePresence>
          {editFarm && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50"
            >
              <motion.div
                initial={{ scale: 0.9, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.9, opacity: 0 }}
                className="bg-white rounded-xl p-6 max-w-md w-full shadow-2xl"
              ></motion.div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
};

const waterTips: WaterTip[] = [
  {
    title: "Use Mulch",
    description: "Cover soil with organic mulch to retain moisture",
    icon: <Leaf size={32} className="text-green-500" />,
  },
  {
    title: "Rainwater Collection",
    description: "Set up barrels to collect rainwater for irrigation",
    icon: <Cloud size={32} className="text-blue-500" />,
  },
  {
    title: "Early Morning Watering",
    description: "Water plants early to reduce evaporation",
    icon: <Sun size={32} className="text-yellow-500" />,
  },
];

const leaderboard: LeaderboardEntry[] = [
  {
    name: "Sita",
    waterSaved: "300L",
    tipsShared: 15,
    method: "Drip Irrigation",
  },
  { name: "Rajesh", waterSaved: "200L", tipsShared: 12, method: "Mulching" },
  {
    name: "Priya",
    waterSaved: "150L",
    tipsShared: 8,
    method: "Rainwater Harvesting",
  },
];

const milestones: Milestone[] = [
  { event: "Planting Started", date: "March 15", icon: <Sprout size={20} /> },
  { event: "First Harvest", date: "June 10", icon: <Calendar size={20} /> },
  { event: "Water System Setup", date: "April 5", icon: <Droplet size={20} /> },
];
