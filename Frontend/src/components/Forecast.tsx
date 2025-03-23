import React, { useEffect, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { format, fromUnixTime } from "date-fns";
import axios from "axios";
import {
  Cloud,
  Phone,
  Sun,
  Tractor,
  Volume2,
  Droplet,
  Wind,
  ThermometerSun,
  CloudRain,
  Loader2,
  MapPin,
  Thermometer,
  Sprout,
  AlertTriangle,
  Check,
  Save,
  Power,
  RefreshCw,
  Battery,
  X,
  Clock,
  ChevronDown,
  ChevronUp,
  Calendar,
  Trash2,
} from "lucide-react";
import { SMSNotifications } from "./SMSNotifications";
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";

const WEATHER_API_KEY = "83afdd5eca9636a679704d3843b1b797";
const AGRO_API_KEY = "ec5db0a232db12f0ec4226a686c40d7d";
const WEATHERBIT_API_KEY = "4b56ca498dfc47bab576883986c9e346";

// Function to get location from IP
async function getLocationFromIP() {
  try {
    const response = await fetch("https://ipapi.co/json/");
    const data = await response.json();
    if (data.error) {
      throw new Error("IP location service error");
    }

    return {
      latitude: parseFloat(data.latitude),
      longitude: parseFloat(data.longitude),
      city: data.city,
      region: data.region,
      country: data.country_name,
    };
  } catch (error) {
    console.error("IP location error:", error);
    return null;
  }
}

// Function to get current position with timeout
function getCurrentPosition(timeout = 5000): Promise<GeolocationPosition> {
  return new Promise((resolve, reject) => {
    if (!navigator.geolocation) {
      reject(new Error("Geolocation is not supported"));
      return;
    }

    const timeoutId = setTimeout(() => {
      reject(new Error("Geolocation timeout"));
    }, timeout);

    navigator.geolocation.getCurrentPosition(
      (position) => {
        clearTimeout(timeoutId);
        resolve(position);
      },
      (error) => {
        clearTimeout(timeoutId);
        reject(error);
      },
      {
        enableHighAccuracy: true,
        timeout: timeout,
        maximumAge: 0,
      }
    );
  });
}

interface WeatherData {
  main: {
    temp: number;
    humidity: number;
  };
  wind: {
    speed: number;
  };
  weather: Array<{
    main: string;
    description: string;
  }>;
}

interface ForecastData {
  list: Array<{
    dt: number;
    main: {
      temp: number;
      humidity: number;
    };
    wind: {
      speed: number;
    };
    weather: Array<{
      main: string;
      description: string;
    }>;
    rain?: {
      "3h": number;
    };
  }>;
}

interface SoilData {
  moisture: number;
  t10: number; // Temperature at 10cm depth
}

interface Location {
  latitude: number;
  longitude: number;
  city?: string;
  region?: string;
  country?: string;
}

interface ProcessedSoilData {
  moisture: {
    value: number;
    percentage: number;
    status: "dry" | "optimal" | "wet";
    recommendation: string;
  };
  surfaceTemp: {
    value: number;
    celsius: number;
    status: "cold" | "optimal" | "hot";
    recommendation: string;
  };
  deepTemp: {
    value: number;
    celsius: number;
    status: "cold" | "optimal" | "hot";
    recommendation: string;
  };
  timestamp: Date;
}

interface CropInfo {
  name: string;
  waterNeeds: string;
}

interface WaterAlert {
  id: number;
  message: string;
  timestamp: Date;
  type: "warning" | "info" | "success";
}

const crops: CropInfo[] = [
  { name: "Rice", waterNeeds: "1200 mm/season" },
  { name: "Wheat", waterNeeds: "450 mm/season" },
  { name: "Millet", waterNeeds: "350 mm/season" },
  { name: "Cotton", waterNeeds: "700 mm/season" },
  { name: "Sugarcane", waterNeeds: "1500 mm/season" },
];

// Add soil data processing function
const processSoilData = (data: any): ProcessedSoilData => {
  // Convert Kelvin to Celsius
  const kelvinToCelsius = (k: number) => Math.round((k - 273.15) * 10) / 10;

  // Process moisture (convert 0-1 to percentage)
  const moisturePercent = Math.round(data.moisture * 100);
  const moistureStatus =
    moisturePercent < 30 ? "dry" : moisturePercent > 70 ? "wet" : "optimal";

  // Process temperatures
  const surfaceTempC = kelvinToCelsius(data.t0);
  const deepTempC = kelvinToCelsius(data.t10);

  return {
    moisture: {
      value: data.moisture,
      percentage: moisturePercent,
      status: moistureStatus,
      recommendation:
        moistureStatus === "dry"
          ? "Irrigation needed"
          : moistureStatus === "wet"
          ? "Reduce irrigation"
          : "Moisture levels good",
    },
    surfaceTemp: {
      value: data.t0,
      celsius: surfaceTempC,
      status:
        surfaceTempC < 15 ? "cold" : surfaceTempC > 30 ? "hot" : "optimal",
      recommendation:
        surfaceTempC < 15
          ? "Watch for cold stress"
          : surfaceTempC > 30
          ? "Consider shade or mulching"
          : "Temperature is good for growth",
    },
    deepTemp: {
      value: data.t10,
      celsius: deepTempC,
      status: deepTempC < 10 ? "cold" : deepTempC > 25 ? "hot" : "optimal",
      recommendation:
        deepTempC < 10
          ? "Monitor root health"
          : deepTempC > 25
          ? "Deep watering recommended"
          : "Root zone temperature optimal",
    },
    timestamp: new Date(data.dt * 1000),
  };
};

export const Forecast = () => {
  const [selectedView, setSelectedView] = useState("daily");
  const [showSMSModal, setShowSMSModal] = useState(false);
  const [location, setLocation] = useState<Location | null>(null);
  const [isLoadingLocation, setIsLoadingLocation] = useState(true);
  const [selectedCrop, setSelectedCrop] = useState<CropInfo | null>(null);
  const [isCropSaved, setIsCropSaved] = useState(false);
  const [isPumpSolar, setIsPumpSolar] = useState(true);
  const [showEnergyModal, setShowEnergyModal] = useState(false);
  const [showIrrigationForm, setShowIrrigationForm] = useState(false);
  const [irrigationSchedule, setIrrigationSchedule] = useState({
    nextDate: format(new Date(2025, 2, 23), "PP"),
    nextAmount: "50L",
    lastDate: format(new Date(), "PP"),
    lastAmount: "45L",
  });
  const [waterAlerts, setWaterAlerts] = useState<WaterAlert[]>([
    {
      id: 1,
      message: "Low well level detected",
      timestamp: new Date(2025, 2, 22, 9, 0),
      type: "warning",
    },
    {
      id: 2,
      message: "Rainwater tank full",
      timestamp: new Date(2025, 2, 22, 8, 30),
      type: "success",
    },
    {
      id: 3,
      message: "Solar pump efficiency: 95%",
      timestamp: new Date(2025, 2, 22, 8, 0),
      type: "info",
    },
  ]);
  const [soilMoistureData, setSoilMoistureData] = useState<number[]>([]);
  const [dates, setDates] = useState<string[]>([]);

  // Query for getting location
  const { refetch: fetchLocation } = useQuery({
    queryKey: ["location"],
    queryFn: async () => {
      setIsLoadingLocation(true);
      try {
        // First try browser geolocation
        const position = await getCurrentPosition();
        const newLocation = {
          latitude: position.coords.latitude,
          longitude: position.coords.longitude,
        };
        setLocation(newLocation);
        return newLocation;
      } catch (error) {
        console.error("Geolocation error:", error);

        // Fallback to IP-based location
        const ipLocation = await getLocationFromIP();
        if (ipLocation) {
          setLocation({
            latitude: ipLocation.latitude,
            longitude: ipLocation.longitude,
            city: ipLocation.city,
            region: ipLocation.region,
            country: ipLocation.country,
          });
          return ipLocation;
        }
        throw new Error("Could not determine location");
      } finally {
        setIsLoadingLocation(false);
      }
    },
    enabled: false,
  });

  // Fetch location on component mount
  React.useEffect(() => {
    fetchLocation();
  }, [fetchLocation]);

  // Fetch Weatherbit historical soil moisture data
  useEffect(() => {
    if (!location?.latitude || !location?.longitude) return; // Wait for location

    const endDate = new Date(); // Today (March 22, 2025, per your context)
    const startDate = new Date(endDate - 7 * 24 * 60 * 60 * 1000); // 7 days ago
    const startDateStr = startDate.toISOString().split("T")[0]; // YYYY-MM-DD
    const endDateStr = endDate.toISOString().split("T")[0];

    axios
      .get(
        `https://api.weatherbit.io/v2.0/history/agweather?lat=${location.latitude}&lon=${location.longitude}&start_date=${startDateStr}&end_date=${endDateStr}&key=${WEATHERBIT_API_KEY}`
      )
      .then((response) => {
        const data = response.data.data;
        if (!data || data.length === 0) {
          throw new Error("No soil moisture data returned");
        }
        const moistureByDay: { [key: string]: number } = {};
        data.forEach((entry: any) => {
          const date = entry.valid_date;
          const moisture = entry.v_soilm_0_10cm * 100; // Convert to percentage
          moistureByDay[date] = Math.round(moisture * 10) / 10; // Round to 1 decimal
        });

        // Sort dates and extract moisture values
        const sortedDates = Object.keys(moistureByDay).sort();
        const moistureValues = sortedDates.map((date) => moistureByDay[date]);

        setDates(sortedDates);
        setSoilMoistureData(moistureValues);
      })
      .catch((error) => {
        console.error("Error fetching Weatherbit data:", error);
        setSoilMoistureData([]);
        setDates([]);
      });
  }, [location]); // Depend on location

  // Log state updates for debugging
  useEffect(() => {
    console.log("Updated dates --->", dates);
    console.log("Updated soil moisture data --->", soilMoistureData);
  }, [dates, soilMoistureData]);

  const formatMoistureData = () => {
    return dates.map((date, index) => ({
      date: format(new Date(date), "MMM d"),
      moisture: soilMoistureData[index],
    }));
  };

  // Fetch current weather
  const { data: currentWeather, isLoading: isLoadingWeather } =
    useQuery<WeatherData>({
      queryKey: ["weather", location?.latitude, location?.longitude],
      queryFn: async () => {
        if (!location) throw new Error("No location available");
        const response = await axios.get(
          `https://api.openweathermap.org/data/2.5/weather?lat=${location.latitude}&lon=${location.longitude}&appid=${WEATHER_API_KEY}&units=metric`
        );
        return response.data;
      },
      enabled: !!location,
    });

  // Fetch 5-day forecast
  const { data: forecastData, isLoading: isLoadingForecast } =
    useQuery<ForecastData>({
      queryKey: ["forecast", location?.latitude, location?.longitude],
      queryFn: async () => {
        if (!location) throw new Error("No location available");
        const response = await axios.get(
          `https://api.openweathermap.org/data/2.5/forecast?lat=${location.latitude}&lon=${location.longitude}&appid=${WEATHER_API_KEY}&units=metric`
        );
        return response.data;
      },
      enabled: !!location,
    });

  // Fetch soil data
  const { data: soilData, isLoading: isLoadingSoil } = useQuery<SoilData>({
    queryKey: ["soil", location?.latitude, location?.longitude],
    queryFn: async () => {
      if (!location) throw new Error("No location available");
      const response = await axios.get(
        `http://api.agromonitoring.com/agro/1.0/soil?polyid=67dcdd5adbbadd57b775ba06&appid=${AGRO_API_KEY}`
      );
      return response.data;
    },
    enabled: !!location,
  });

  const getWeatherIcon = (main: string) => {
    switch (main.toLowerCase()) {
      case "clear":
        return Sun;
      case "rain":
        return CloudRain;
      default:
        return Cloud;
    }
  };

  const getForecastDays = () => {
    if (!forecastData) return [];

    return forecastData.list
      .filter((item, index) => index % 8 === 0)
      .map((item) => ({
        day: format(fromUnixTime(item.dt), "EEE"),
        temp: Math.round(item.main.temp),
        rain: item.rain?.["3h"] ? Math.round((item.rain["3h"] / 3) * 100) : 0,
        humidity: item.main.humidity,
        wind: Math.round(item.wind.speed * 3.6), // Convert m/s to km/h
        soilMoisture: soilData?.moisture || 30,
        icon: getWeatherIcon(item.weather[0].main),
        recommendation: getRecommendation(item.weather[0].main, item.main.temp),
      }));
  };

  const getRecommendation = (weather: string, temp: number): string => {
    if (temp > 35) return "Consider additional irrigation";
    if (weather.toLowerCase() === "rain")
      return "Rainfall expected, adjust irrigation";
    if (temp < 20) return "Watch for cold stress";
    return "Conditions are favorable";
  };

  const handleLearnHow = () => {
    alert("Playing drip irrigation tutorial...");
  };

  const handleCropSave = () => {
    if (selectedCrop) {
      setIsCropSaved(true);
      setTimeout(() => setIsCropSaved(false), 2000);
    }
  };

  const clearAlerts = () => setWaterAlerts([]);

  // Process soil data
  const processedSoilData = soilData ? processSoilData(soilData) : null;

  // Render soil analysis card
  const renderSoilAnalysis = () => {
    if (!processedSoilData) return null;

    const getStatusColor = (status: string) => {
      switch (status) {
        case "dry":
        case "hot":
          return "text-orange-600";
        case "wet":
        case "cold":
          return "text-blue-600";
        default:
          return "text-green-600";
      }
    };

    const getStatusIcon = (status: string) => {
      switch (status) {
        case "optimal":
          return <Check className="text-green-500" />;
        default:
          return <AlertTriangle className="text-orange-500" />;
      }
    };

    return (
      <div className="bg-white rounded-xl p-6 shadow-sm mb-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-green-800">
            Soil Health Analysis
          </h3>
          <Sprout className="text-green-600" size={24} />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {/* Moisture Card */}
          <div className="bg-blue-50 rounded-lg p-4 border border-blue-100">
            <div className="flex items-center justify-between mb-2">
              <span className="font-medium">Soil Moisture</span>
              <Droplet
                className={getStatusColor(processedSoilData.moisture.status)}
                size={20}
              />
            </div>
            <div className="text-2xl font-bold mb-2">
              {processedSoilData.moisture.percentage}%
            </div>
            <div className="flex items-center space-x-2 text-sm">
              {getStatusIcon(processedSoilData.moisture.status)}
              <span>{processedSoilData.moisture.recommendation}</span>
            </div>
          </div>

          {/* Surface Temperature Card */}
          <div className="bg-orange-50 rounded-lg p-4 border border-orange-100">
            <div className="flex items-center justify-between mb-2">
              <span className="font-medium">Surface Temp</span>
              <Thermometer
                className={getStatusColor(processedSoilData.surfaceTemp.status)}
                size={20}
              />
            </div>
            <div className="text-2xl font-bold mb-2">
              {processedSoilData.surfaceTemp.celsius}°C
            </div>
            <div className="flex items-center space-x-2 text-sm">
              {getStatusIcon(processedSoilData.surfaceTemp.status)}
              <span>{processedSoilData.surfaceTemp.recommendation}</span>
            </div>
          </div>

          {/* Deep Temperature Card */}
          <div className="bg-green-50 rounded-lg p-4 border border-green-100">
            <div className="flex items-center justify-between mb-2">
              <span className="font-medium">Root Zone Temp</span>
              <ThermometerSun
                className={getStatusColor(processedSoilData.deepTemp.status)}
                size={20}
              />
            </div>
            <div className="text-2xl font-bold mb-2">
              {processedSoilData.deepTemp.celsius}°C
            </div>
            <div className="flex items-center space-x-2 text-sm">
              {getStatusIcon(processedSoilData.deepTemp.status)}
              <span>{processedSoilData.deepTemp.recommendation}</span>
            </div>
          </div>
        </div>

        <div className="mt-4 p-4 bg-yellow-50 rounded-lg border border-yellow-100">
          <h4 className="font-medium mb-2">Today's Soil Care Tips</h4>
          <ul className="space-y-2 text-sm">
            {processedSoilData.moisture.status !== "optimal" && (
              <li className="flex items-center space-x-2">
                <AlertTriangle size={16} className="text-orange-500" />
                <span>{processedSoilData.moisture.recommendation}</span>
              </li>
            )}
            {processedSoilData.surfaceTemp.status !== "optimal" && (
              <li className="flex items-center space-x-2">
                <AlertTriangle size={16} className="text-orange-500" />
                <span>{processedSoilData.surfaceTemp.recommendation}</span>
              </li>
            )}
            {processedSoilData.deepTemp.status !== "optimal" && (
              <li className="flex items-center space-x-2">
                <AlertTriangle size={16} className="text-orange-500" />
                <span>{processedSoilData.deepTemp.recommendation}</span>
              </li>
            )}
          </ul>
        </div>
      </div>
    );
  };

  if (
    isLoadingLocation ||
    isLoadingWeather ||
    isLoadingForecast ||
    isLoadingSoil
  ) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="flex items-center space-x-2">
          <Loader2 className="animate-spin" />
          <span>Loading weather data...</span>
        </div>
      </div>
    );
  }

  const forecast = getForecastDays();
  const renderSoilMoistureTrend = () => {
    const data = formatMoistureData();

    return (
      <div className="mt-6 bg-white rounded-xl p-6 shadow-sm">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-lg font-semibold text-green-800">
            Soil Moisture Trend (Last 7 Days)
          </h3>
          <div className="flex items-center space-x-2 text-sm text-green-600">
            <div className="flex items-center">
              <div className="w-3 h-3 bg-green-200 rounded-full mr-1"></div>
              <span>Moisture Range</span>
            </div>
            <div className="flex items-center">
              <div className="w-3 h-3 bg-green-600 rounded-full mr-1"></div>
              <span>Current Level</span>
            </div>
          </div>
        </div>

        <div className="h-[400px] w-full">
          {data.length > 0 ? (
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart
                data={data}
                margin={{
                  top: 10,
                  right: 30,
                  left: 0,
                  bottom: 30,
                }}
              >
                <defs>
                  <linearGradient
                    id="moistureGradient"
                    x1="0"
                    y1="0"
                    x2="0"
                    y2="1"
                  >
                    <stop offset="5%" stopColor="#059669" stopOpacity={0.8} />
                    <stop offset="95%" stopColor="#059669" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid
                  strokeDasharray="3 3"
                  vertical={false}
                  stroke="#E5E7EB"
                />
                <XAxis
                  dataKey="date"
                  tick={{ fill: "#059669", fontSize: 12 }}
                  tickLine={{ stroke: "#059669" }}
                  axisLine={{ stroke: "#059669" }}
                />
                <YAxis
                  tick={{ fill: "#059669", fontSize: 12 }}
                  tickLine={{ stroke: "#059669" }}
                  axisLine={{ stroke: "#059669" }}
                  domain={[0, 100]}
                  label={{
                    value: "Moisture %",
                    angle: -90,
                    position: "insideLeft",
                    fill: "#059669",
                  }}
                />
                <Tooltip
                  contentStyle={{
                    backgroundColor: "#ffffff",
                    border: "1px solid #059669",
                    borderRadius: "0.5rem",
                    padding: "0.5rem",
                  }}
                  labelStyle={{ color: "#059669", fontWeight: "bold" }}
                  itemStyle={{ color: "#059669" }}
                  formatter={(value: number) => [`${value}%`, "Moisture"]}
                />
                <Area
                  type="monotone"
                  dataKey="moisture"
                  stroke="#059669"
                  strokeWidth={2}
                  fill="url(#moistureGradient)"
                  animationDuration={1000}
                  animationEasing="ease-in-out"
                  dot={{
                    fill: "#059669",
                    stroke: "#ffffff",
                    strokeWidth: 2,
                    r: 4,
                  }}
                  activeDot={{
                    fill: "#059669",
                    stroke: "#ffffff",
                    strokeWidth: 2,
                    r: 6,
                  }}
                />
              </AreaChart>
            </ResponsiveContainer>
          ) : (
            <div className="h-full flex items-center justify-center text-gray-500 bg-green-50 rounded-lg">
              <div className="text-center">
                <Droplet className="w-12 h-12 text-green-300 mx-auto mb-2" />
                <p>No soil moisture data available</p>
              </div>
            </div>
          )}
        </div>

        {data.length > 0 && (
          <div className="mt-4 grid grid-cols-2 gap-4">
            <div className="bg-green-50 rounded-lg p-4">
              <p className="text-sm text-green-600 mb-1">Average Moisture</p>
              <p className="text-2xl font-bold text-green-800">
                {(
                  data.reduce((acc, curr) => acc + curr.moisture, 0) /
                  data.length
                ).toFixed(1)}
                %
              </p>
            </div>
            <div className="bg-green-50 rounded-lg p-4">
              <p className="text-sm text-green-600 mb-1">Current Level</p>
              <p className="text-2xl font-bold text-green-800">
                {data[data.length - 1]?.moisture.toFixed(1)}%
              </p>
            </div>
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-green-100 to-white p-4 md:p-8">
      <div className="max-w-6xl mx-auto">
        {/* Header with Crop Selector */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8">
          <div className="flex flex-col space-y-2">
            <div className="flex items-center space-x-3">
              <h2 className="text-3xl font-bold text-green-800">
                Your Field Forecast
              </h2>
              <Tractor className="text-green-600" />
            </div>
            {location && (location.city || location.region) && (
              <div className="flex items-center space-x-2 text-green-600">
                <MapPin size={16} />
                <span>
                  {[location.city, location.region, location.country]
                    .filter(Boolean)
                    .join(", ")}
                </span>
              </div>
            )}
          </div>
          <div className="mt-4 md:mt-0 flex space-x-4">
            <div className="flex items-center space-x-3">
              <Sprout className="text-green-600" size={24} />
              <select
                className="px-4 py-2 rounded-lg border border-green-200 focus:outline-none focus:ring-2 focus:ring-green-500"
                onChange={(e) => {
                  const crop = crops.find((c) => c.name === e.target.value);
                  setSelectedCrop(crop || null);
                }}
                value={selectedCrop?.name || ""}
              >
                <option value="">Select Crop</option>
                {crops.map((crop) => (
                  <option key={crop.name} value={crop.name}>
                    {crop.name}
                  </option>
                ))}
              </select>
            </div>
            {selectedCrop && (
              <div className="flex items-center space-x-4">
                <div className="text-green-700">
                  Water:{" "}
                  <span className="font-semibold">
                    {selectedCrop.waterNeeds}
                  </span>
                </div>
                <button
                  onClick={handleCropSave}
                  className={`flex items-center space-x-2 px-4 py-2 rounded-lg transition-colors ${
                    isCropSaved
                      ? "bg-green-100 text-green-700"
                      : "bg-green-600 text-white hover:bg-green-700"
                  }`}
                >
                  <Save size={16} />
                  <span>{isCropSaved ? "Saved!" : "Save"}</span>
                </button>
              </div>
            )}
          </div>
        </div>

        {/* View Selector */}
        <div className="flex justify-end mb-6">
          <div className="flex space-x-2">
            <button
              onClick={() => setSelectedView("daily")}
              className={`px-4 py-2 rounded-lg transition-colors ${
                selectedView === "daily"
                  ? "bg-green-600 text-white"
                  : "bg-white text-green-600 hover:bg-green-50"
              }`}
            >
              Daily
            </button>
            <button
              onClick={() => setSelectedView("weekly")}
              className={`px-4 py-2 rounded-lg transition-colors ${
                selectedView === "weekly"
                  ? "bg-green-600 text-white"
                  : "bg-white text-green-600 hover:bg-green-50"
              }`}
            >
              Weekly
            </button>
          </div>
        </div>

        {/* Soil Analysis Section */}
        {renderSoilAnalysis()}

        {/* Main Content */}
        <div className="grid md:grid-cols-3 gap-6">
          {/* Forecast Cards */}
          <div className="md:col-span-2">
            <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
              {forecast.map((day, index) => (
                <div
                  key={index}
                  className="bg-white rounded-xl p-4 shadow-sm hover:shadow-md transition-all duration-300 animate-fadeIn"
                  style={{ animationDelay: `${index * 100}ms` }}
                >
                  <div className="flex flex-col items-center">
                    <p className="text-green-600 font-semibold">{day.day}</p>
                    <day.icon
                      size={32}
                      className={`my-3 ${
                        day.icon === Sun ? "text-yellow-500" : "text-gray-400"
                      }`}
                    />
                    <p className="text-2xl font-bold text-green-800">
                      {day.temp}°C
                    </p>
                    <div className="mt-3 space-y-2 w-full">
                      <div className="flex items-center justify-between text-sm">
                        <Droplet size={14} className="text-blue-500" />
                        <span className="text-green-600">{day.rain}%</span>
                      </div>
                      <div className="flex items-center justify-between text-sm">
                        <Wind size={14} className="text-gray-500" />
                        <span className="text-green-600">{day.wind} km/h</span>
                      </div>
                      <div className="flex items-center justify-between text-sm">
                        <ThermometerSun size={14} className="text-orange-500" />
                        <span className="text-green-600">{day.humidity}%</span>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Soil Moisture Trend */}
            {renderSoilMoistureTrend()}

            {/* Irrigation Schedule */}
            <div className="mt-6 bg-white rounded-xl p-6 shadow-sm">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-lg font-semibold text-green-800">
                  Irrigation Schedule
                </h3>
                <button
                  onClick={() => setShowIrrigationForm(!showIrrigationForm)}
                  className="text-green-600 hover:text-green-700"
                >
                  {showIrrigationForm ? <ChevronUp /> : <ChevronDown />}
                </button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                <div className="bg-green-50 p-4 rounded-lg">
                  <div className="flex items-center space-x-2 mb-2">
                    <Clock className="text-green-600" size={20} />
                    <span className="font-medium">Next Irrigation</span>
                  </div>
                  <p className="text-green-800">
                    {irrigationSchedule.nextDate}
                  </p>
                  <p className="text-green-600 font-semibold">
                    {irrigationSchedule.nextAmount}
                  </p>
                </div>

                <div className="bg-blue-50 p-4 rounded-lg">
                  <div className="flex items-center space-x-2 mb-2">
                    <Droplet className="text-blue-600" size={20} />
                    <span className="font-medium">Last Watered</span>
                  </div>
                  <p className="text-blue-800">{irrigationSchedule.lastDate}</p>
                  <p className="text-blue-600 font-semibold">
                    {irrigationSchedule.lastAmount}
                  </p>
                </div>
              </div>

              {showIrrigationForm && (
                <div className="mt-4 p-4 bg-gray-50 rounded-lg">
                  <h4 className="font-medium mb-4">Update Schedule</h4>
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Next Irrigation Date
                      </label>
                      <div className="flex items-center space-x-2">
                        <Calendar className="text-gray-400" size={20} />
                        <input
                          type="date"
                          className="flex-1 p-2 border rounded-lg focus:ring-2 focus:ring-green-500 focus:outline-none"
                        />
                      </div>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Water Amount (L)
                      </label>
                      <input
                        type="number"
                        placeholder="50"
                        className="w-full p-2 border rounded-lg focus:ring-2 focus:ring-green-500 focus:outline-none"
                      />
                    </div>
                    <button
                      onClick={() => setShowIrrigationForm(false)}
                      className="w-full py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
                    >
                      Save Schedule
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Right Column */}
          <div className="space-y-6">
            {/* Water Availability */}
            <div className="bg-white rounded-xl p-6 shadow-sm">
              <h3 className="text-lg font-semibold text-green-800 mb-4 flex items-center space-x-2">
                <Droplet className="text-blue-500" />
                <span>Water Availability</span>
              </h3>

              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <span className="text-gray-600">Well Level</span>
                  <span className="font-semibold text-blue-600">60%</span>
                </div>

                <div className="flex justify-between items-center">
                  <span className="text-gray-600">Rainwater Tank</span>
                  <span className="font-semibold text-blue-600">200L</span>
                </div>

                <div className="flex justify-between items-center">
                  <span className="text-gray-600">Pump Mode</span>
                  <button
                    onClick={() => setIsPumpSolar(!isPumpSolar)}
                    className="flex items-center space-x-2"
                  >
                    <div
                      className={`w-12 h-6 rounded-full transition-colors ${
                        isPumpSolar ? "bg-green-500" : "bg-gray-300"
                      }`}
                    >
                      <div
                        className={`w-6 h-6 rounded-full bg-white transform transition-transform ${
                          isPumpSolar ? "translate-x-6" : "translate-x-0"
                        }`}
                      />
                    </div>
                    <Power
                      className={
                        isPumpSolar ? "text-green-500" : "text-gray-500"
                      }
                      size={16}
                    />
                  </button>
                </div>

                <div className="text-sm text-gray-500">
                  Mode: {isPumpSolar ? "Solar-Powered" : "Manual"}
                </div>

                <button className="w-full mt-4 py-2 bg-blue-500 text-white rounded-lg flex items-center justify-center space-x-2 hover:bg-blue-600 transition-colors">
                  <RefreshCw size={16} />
                  <span>Check Status</span>
                </button>
              </div>
            </div>

            {/* Renewable Energy Monitor */}
            <div className="bg-white rounded-xl p-6 shadow-sm">
              <h3 className="text-lg font-semibold text-green-800 mb-4 flex items-center space-x-2">
                <Sun className="text-yellow-500" />
                <span>Solar Energy Status</span>
              </h3>

              <div className="space-y-6">
                {/* Solar Power Indicator */}
                <div className="relative w-32 h-32 mx-auto">
                  <svg className="transform -rotate-90 w-32 h-32">
                    <circle
                      className="text-gray-200"
                      strokeWidth="8"
                      stroke="currentColor"
                      fill="transparent"
                      r="58"
                      cx="64"
                      cy="64"
                    />
                    <circle
                      className="text-yellow-500"
                      strokeWidth="8"
                      strokeDasharray={364}
                      strokeDashoffset={364 - (364 * 75) / 100}
                      strokeLinecap="round"
                      stroke="currentColor"
                      fill="transparent"
                      r="58"
                      cx="64"
                      cy="64"
                    />
                  </svg>
                  <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 text-center">
                    <span className="text-2xl font-bold text-yellow-500">
                      75%
                    </span>
                    <p className="text-sm text-gray-500">Power</p>
                  </div>
                </div>

                {/* Battery Status */}
                <div className="flex items-center justify-between">
                  <span className="text-gray-600">Battery Charge</span>
                  <div className="flex items-center space-x-2">
                    <Battery className="text-green-500" />
                    <span className="font-semibold">90%</span>
                  </div>
                </div>

                <button
                  onClick={() => setShowEnergyModal(true)}
                  className="w-full py-2 bg-yellow-500 text-white rounded-lg hover:bg-yellow-600 transition-colors"
                >
                  Energy Details
                </button>
              </div>
            </div>

            {/* Water Alerts */}
            <div className="bg-white rounded-xl p-6 shadow-sm">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-lg font-semibold text-green-800 flex items-center space-x-2">
                  <AlertTriangle className="text-yellow-500" />
                  <span>Water Alerts</span>
                </h3>
                {waterAlerts.length > 0 && (
                  <button
                    onClick={clearAlerts}
                    className="text-red-500 hover:text-red-600"
                  >
                    <Trash2 size={18} />
                  </button>
                )}
              </div>

              <div className="space-y-3 max-h-64 overflow-y-auto">
                {waterAlerts.length === 0 ? (
                  <p className="text-gray-500 text-center py-4">
                    No alerts to display
                  </p>
                ) : (
                  waterAlerts.map((alert) => (
                    <div
                      key={alert.id}
                      className={`p-3 rounded-lg ${
                        alert.type === "warning"
                          ? "bg-yellow-50 border border-yellow-200"
                          : alert.type === "success"
                          ? "bg-green-50 border border-green-200"
                          : "bg-blue-50 border border-blue-200"
                      }`}
                    >
                      <p
                        className={`text-sm ${
                          alert.type === "warning"
                            ? "text-yellow-800"
                            : alert.type === "success"
                            ? "text-green-800"
                            : "text-blue-800"
                        }`}
                      >
                        {alert.message}
                      </p>
                      <p className="text-xs text-gray-500 mt-1">
                        {format(alert.timestamp, "PPpp")}
                      </p>
                    </div>
                  ))
                )}
              </div>
            </div>

            {/* Daily Recommendations */}
            <div className="bg-white rounded-xl p-6 shadow-sm">
              <h3 className="text-lg font-semibold text-green-800 mb-4">
                Today's Recommendations
              </h3>
              <div className="space-y-4">
                {forecast.slice(0, 3).map((day, index) => (
                  <div key={index} className="p-4 bg-green-50 rounded-lg">
                    <p className="text-green-700">{day.recommendation}</p>
                    <button
                      onClick={handleLearnHow}
                      className="mt-2 flex items-center space-x-2 text-green-600 hover:text-green-800"
                    >
                      <Volume2 size={16} />
                      <span>Learn How</span>
                    </button>
                  </div>
                ))}
              </div>
            </div>

            {/* Weather Alerts */}
            <div className="bg-white rounded-xl p-6 shadow-sm">
              <h3 className="text-lg font-semibold text-green-800 mb-4">
                Weather Alerts
              </h3>
              <div className="space-y-4">
                {currentWeather && currentWeather.main.temp > 35 && (
                  <div className="p-4 bg-yellow-50 rounded-lg border border-yellow-200">
                    <p className="text-yellow-800">High temperature alert</p>
                    <p className="text-sm text-yellow-600 mt-1">
                      Consider additional irrigation
                    </p>
                  </div>
                )}
                <button
                  onClick={() => setShowSMSModal(true)}
                  className="w-full py-3 bg-green-600 text-white rounded-xl flex items-center justify-center space-x-2 hover:bg-green-700 transition-colors"
                >
                  <Phone size={18} />
                  <span>Get SMS Updates</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Modals */}
      {showSMSModal && (
        <SMSNotifications onClose={() => setShowSMSModal(false)} />
      )}

      {showEnergyModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl p-6 max-w-md w-full mx-4">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-semibold text-green-800">
                Energy System Details
              </h3>
              <button onClick={() => setShowEnergyModal(false)}>
                <X className="text-gray-500 hover:text-gray-700" />
              </button>
            </div>
            <div className="space-y-4">
              <p className="text-green-600">Solar pump running efficiently</p>
              <p className="text-gray-600">System Status: Optimal</p>
              <p className="text-gray-600">Next Maintenance: April 15, 2025</p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
