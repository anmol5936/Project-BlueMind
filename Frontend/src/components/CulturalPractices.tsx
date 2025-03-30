import React, { useEffect, useState } from "react";
import {
  Calendar,
  Mic,
  MicOff,
  Droplets,
  BookOpen,
  Map,
  Users,
  Download,
  ChevronRight,
  Leaf,
  Gauge,
  Heart,
  Droplet,
  Shield,
  TreeDeciduous,
  Cloud,
  Smartphone,
  Zap,
  X,
  Loader2,
} from "lucide-react";
import axios from "axios";
import { CulturalPracticesData } from "./CulturalData";
import { toast } from "react-hot-toast";

interface Practice {
  id: string;
  name: string;
  description: string;
  percentage: number;
  efficiency: number;
}

interface CalendarEvent {
  date: string;
  title: string;
  description: string;
}

interface Metric {
  icon: React.ReactNode;
  title: string;
  value: string;
  description: string;
}

export const CulturalPractices = () => {
  const [isRecording, setIsRecording] = useState(false);
  const [practiceInput, setPracticeInput] = useState("");
  const [selectedEvent, setSelectedEvent] = useState<CalendarEvent | null>(
    null
  );
  const [activeTab, setActiveTab] = useState<"traditional" | "modern">(
    "traditional"
  );
  const [isMapModalOpen, setIsMapModalOpen] = useState(false);
  const [mapImageUrl, setMapImageUrl] = useState<string | null>(null);
  const [coordinates, setCoordinates] = useState<{
    lat: string;
    lon: string;
  } | null>(null);
  const [isMapLoading, setIsMapLoading] = useState(false);
  const [mapError, setMapError] = useState<string | null>(null);
  const [triggerFetch, setTriggerFetch] = useState(0);
  // Define the state with proper typing
  const [practices, setPractices] = useState<{
    improved_efficiency: string[];
    modern_description: string[];
    modern_practice: string[];
    traditional_description: string[];
    traditional_efficiency: string[];
    traditional_practice: string[];
  } | null>(null);

  useEffect(() => {
    axios
      .get("http://localhost:7000/water_analysis")
      .then((res) => {
        setPractices(res.data);
      })
      .catch((e) => {
        console.log(e);
      });
  }, []);

  const parsePercentageRange = (range: string): number => {
    const [min, max] = range
      .split("-")
      .map((num) => parseInt(num.replace("%", "")));
    return Math.round((min + max) / 2);
  };

  const modernPractices: Practice[] = [
    {
      id: "1",
      name: practices?.modern_practice?.[0] || "Atmospheric Water Generation",
      description:
        practices?.modern_description?.[0] ||
        "Extracting clean water from air, even in arid environments",
      percentage: practices?.improved_efficiency?.[0]
        ? parsePercentageRange(practices.improved_efficiency[0])
        : 85,
      efficiency: practices?.improved_efficiency?.[0]
        ? Math.round(
            parsePercentageRange(practices.improved_efficiency[0]) * 0.6
          )
        : 51,
    },
    {
      id: "2",
      name: practices?.modern_practice?.[1] || "Advanced Grey Water Treatment",
      description:
        practices?.modern_description?.[1] ||
        "Using advanced filtration systems to safely reuse grey water for drinking and other household purposes",
      percentage: practices?.improved_efficiency?.[1]
        ? parsePercentageRange(practices.improved_efficiency[1])
        : 78,
      efficiency: practices?.improved_efficiency?.[1]
        ? Math.round(
            parsePercentageRange(practices.improved_efficiency[1]) * 0.6
          )
        : 47,
    },
    {
      id: "3",
      name:
        practices?.modern_practice?.[2] ||
        "Precision Agriculture with Drones and Sensors",
      description:
        practices?.modern_description?.[2] ||
        "Optimizing crop rotation, irrigation, and fertilization using drones, sensors, and data analytics to minimize water waste",
      percentage: practices?.improved_efficiency?.[2]
        ? parsePercentageRange(practices.improved_efficiency[2])
        : 70,
      efficiency: practices?.improved_efficiency?.[2]
        ? Math.round(
            parsePercentageRange(practices.improved_efficiency[2]) * 0.6
          )
        : 42,
    },
  ];

  const traditionalPractices: Practice[] = [
    {
      id: "1",
      name: practices?.traditional_practice?.[0] || "Rainwater Harvesting",
      description:
        practices?.traditional_description?.[0] ||
        "Collecting and storing rainwater for non-potable uses",
      percentage: practices?.traditional_efficiency?.[0]
        ? parsePercentageRange(practices.traditional_efficiency[0])
        : 70,
      efficiency: practices?.traditional_efficiency?.[0]
        ? Math.round(
            parsePercentageRange(practices.traditional_efficiency[0]) * 0.5
          )
        : 35,
    },
    {
      id: "2",
      name: practices?.traditional_practice?.[1] || "Grey Water Systems",
      description:
        practices?.traditional_description?.[1] ||
        "Reusing household wastewater for irrigation and flushing toilets",
      percentage: practices?.traditional_efficiency?.[1]
        ? parsePercentageRange(practices.traditional_efficiency[1])
        : 60,
      efficiency: practices?.traditional_efficiency?.[1]
        ? Math.round(
            parsePercentageRange(practices.traditional_efficiency[1]) * 0.5
          )
        : 30,
    },
    {
      id: "3",
      name:
        practices?.traditional_practice?.[2] || "Crop Rotation and Mulching",
      description:
        practices?.traditional_description?.[2] ||
        "Conserving soil moisture and reducing evaporation through crop rotation and mulching",
      percentage: practices?.traditional_efficiency?.[2]
        ? parsePercentageRange(practices.traditional_efficiency[2])
        : 50,
      efficiency: practices?.traditional_efficiency?.[2]
        ? Math.round(
            parsePercentageRange(practices.traditional_efficiency[2]) * 0.5
          )
        : 25,
    },
  ];

  const traditionalEvents: CalendarEvent[] = [
    {
      date: "2024-03-15",
      title: "Well Consecration Ceremony",
      description: "Annual blessing of community water sources",
    },
    {
      date: "2024-06-01",
      title: "Monsoon Festival",
      description: "Celebration of water and agricultural abundance",
    },
  ];

  const modernEvents: CalendarEvent[] = [
    {
      date: "2024-04-01",
      title: "Smart Farming Workshop",
      description: "Training on IoT-based water management systems",
    },
    {
      date: "2024-07-15",
      title: "Tech Integration Day",
      description: "Demonstration of new water conservation technologies",
    },
  ];

  const traditionalMetrics: Metric[] = [
    {
      icon: <Droplet className="w-8 h-8 text-blue-500" />,
      title: "Water Conservation",
      value: "45%",
      description: "Improved efficiency through traditional practices",
    },
    {
      icon: <Heart className="w-8 h-8 text-red-500" />,
      title: "Community Engagement",
      value: "92%",
      description: "Active participation in water management",
    },
    {
      icon: <Shield className="w-8 h-8 text-green-500" />,
      title: "Cultural Preservation",
      value: "85%",
      description: "Maintaining traditional methods",
    },
  ];

  const modernMetrics: Metric[] = [
    {
      icon: <Zap className="w-8 h-8 text-yellow-500" />,
      title: "Smart Efficiency",
      value: "65%",
      description: "Enhanced through technology integration",
    },
    {
      icon: <Smartphone className="w-8 h-8 text-purple-500" />,
      title: "Digital Adoption",
      value: "78%",
      description: "Usage of smart water management tools",
    },
    {
      icon: <Cloud className="w-8 h-8 text-blue-500" />,
      title: "Data-Driven Insights",
      value: "70%",
      description: "Decisions based on analytics",
    },
  ];

  const [recognition, setRecognition] = useState<SpeechRecognition | null>(
    null
  );

  useEffect(() => {
    // Check if Web Speech API is available
    const SpeechRecognition =
      window.SpeechRecognition || window.webkitSpeechRecognition;
    if (SpeechRecognition) {
      const speechRecognition = new SpeechRecognition();
      speechRecognition.continuous = false;
      speechRecognition.interimResults = false;
      speechRecognition.lang = "en-US";

      speechRecognition.onresult = (event) => {
        const transcript = event.results[0][0].transcript;
        setPracticeInput(transcript);
        setIsRecording(false);
        toast.success("Recording completed!");
      };

      speechRecognition.onerror = (event) => {
        console.error("Speech recognition error:", event.error);
        setIsRecording(false);
        toast.error(`Recording failed: ${event.error}`);
      };

      speechRecognition.onend = () => {
        setIsRecording(false);
      };

      setRecognition(speechRecognition);
    } else {
      console.warn("Speech Recognition API not supported in this browser");
    }

    // Cleanup
    return () => {
      if (recognition) {
        recognition.stop();
      }
    };
  }, []);

  // Replace only the handleVoiceInput function
  const handleVoiceInput = () => {
    if (!recognition) {
      toast.error("Voice recording is not supported in your browser");
      return;
    }

    if (isRecording) {
      recognition.stop();
      setIsRecording(false);
    } else {
      setPracticeInput(""); // Clear previous input
      setIsRecording(true);
      recognition.start();
      // Removed: toast.loading("Recording... Speak now!");
    }
  };
  const userLocation = JSON.parse(localStorage.getItem("userLocation") || "{}");
  const userRegion = userLocation.region;
  const handlePracticeSubmit = async () => {
    const loadingToast = toast.loading("Submitting practice...");

    console.log("Starting practice submission with input:", practiceInput);

    try {
      // Configure Gemini API request
      const geminiApiKey = process.env.GEMINI_API_KEY;
      const geminiEndpoint =
        "https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent";

      console.log("Making request to Gemini API endpoint:", geminiEndpoint);

      const response = await fetch(geminiEndpoint, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-goog-api-key": geminiApiKey,
        },
        body: JSON.stringify({
          contents: [
            {
              parts: [
                {
                  text: `Given the transcript "${practiceInput}", predict the festival and associated practice. Return the response in JSON format with keys "predicted_festival" and "predicted_practice". For example:
              {
                "predicted_festival": "Holi",
                "predicted_practice": "Playing with colored water"
              }`,
                },
              ],
            },
          ],
        }),
      });

      console.log("Gemini API response status:", response.status);

      if (!response.ok) {
        throw new Error(`Gemini API request failed: ${response.status}`);
      }

      const geminiData = await response.json();
      console.log("Raw Gemini API response:", geminiData);

      // Check if the response has the expected structure
      if (
        !geminiData.candidates ||
        !geminiData.candidates[0] ||
        !geminiData.candidates[0].content ||
        !geminiData.candidates[0].content.parts
      ) {
        console.error("Unexpected API response structure:", geminiData);
        throw new Error("Unexpected response structure from Gemini API");
      }

      // Extract the generated text from Gemini response and parse it as JSON
      const generatedText = geminiData.candidates[0].content.parts[0].text;
      console.log("Extracted text from Gemini response:", generatedText);

      // Clean the response by removing markdown code block syntax
      let cleanedText = generatedText;
      // Remove markdown code block formatting if present
      if (cleanedText.includes("```")) {
        // Extract just the JSON part between the code block markers
        const jsonMatch = cleanedText.match(/```(?:json)?\s*([\s\S]*?)```/);
        if (jsonMatch && jsonMatch[1]) {
          cleanedText = jsonMatch[1];
        }
      }
      console.log("Cleaned text for parsing:", cleanedText);

      // Handle potential JSON parsing errors
      let data;
      try {
        data = JSON.parse(cleanedText);
        console.log("Successfully parsed JSON:", data);
      } catch (parseError) {
        console.error("JSON parsing error:", parseError);
        console.log("Text that failed to parse:", cleanedText);
        throw new Error("Failed to parse JSON response from Gemini");
      }

      // Validate that required fields exist
      if (!data.predicted_festival || !data.predicted_practice) {
        console.error("Missing required fields in parsed data:", data);
        throw new Error("Missing required fields in Gemini response");
      }

      console.log("Submitting to community endpoint with data:", {
        festival: data.predicted_festival,
        practice: data.predicted_practice,
        region: userLocation.region,
      });

      // Submit to community endpoint
      await axios.post("http://localhost:3000/community", {
        festival: data.predicted_festival,
        practice: data.predicted_practice,
        region: userLocation.region,
      });

      console.log("Community submission successful");
      setTriggerFetch((prev) => prev + 1);
      setPracticeInput("");
      toast.success("Practice submitted successfully!", {
        id: loadingToast,
      });
    } catch (error) {
      console.error("Error submitting practice:", error);
      toast.error(`Failed to submit practice: ${error.message}`, {
        id: loadingToast,
      });
    }
  };

  const GEOAPIFY_API_KEY = process.env.GEOAPIFY_API_KEY;

  const handleMapClick = async () => {
    setIsMapModalOpen(true);
    setIsMapLoading(true);
    setMapError(null);
    setMapImageUrl(null);
    setCoordinates(null);

    try {
      const response = await fetch("https://ipapi.co/json/");
      if (!response.ok) {
        throw new Error("Failed to fetch location: HTTP " + response.status);
      }
      const data = await response.json();
      if (data.error) {
        throw new Error(data.reason || "Location API returned an error");
      }

      const lat = data.latitude;
      const lon = data.longitude;
      setCoordinates({ lat: lat.toString(), lon: lon.toString() });

      const mapUrl = `https://maps.geoapify.com/v1/staticmap?style=osm-carto&width=600&height=300&center=lonlat:${lon},${lat}&zoom=10&apiKey=${GEOAPIFY_API_KEY}`;

      const mapResponse = await fetch(mapUrl);
      if (!mapResponse.ok) {
        const errorText = await mapResponse.text();
        throw new Error(
          `Geoapify API error: ${mapResponse.status} - ${errorText}`
        );
      }

      setMapImageUrl(mapUrl);
    } catch (error) {
      setMapError(
        "Unable to fetch your location or generate the map. Please check your Geoapify API key and try again."
      );
      console.error("Map fetch error:", error.message || error);
    } finally {
      setIsMapLoading(false);
    }
  };

  const handleImageError = () => {
    setMapError(
      "Failed to load the map image. Check your API key or network connection."
    );
  };

  const currentPractices =
    activeTab === "traditional" ? traditionalPractices : modernPractices;
  const currentEvents =
    activeTab === "traditional" ? traditionalEvents : modernEvents;
  const currentMetrics =
    activeTab === "traditional" ? traditionalMetrics : modernMetrics;

  return (
    <div className="min-h-screen bg-gradient-to-b from-green-100 to-blue-50">
      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* Header Section with Enhanced Metrics */}
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-green-800 mb-4">
            {activeTab === "traditional"
              ? "Traditional Water Practices"
              : "Modern Water Management"}
          </h1>
          <p className="text-lg text-gray-600 mb-8">
            {activeTab === "traditional"
              ? "Preserving our heritage while embracing innovation"
              : "Enhancing efficiency through smart technology"}
          </p>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
            {currentMetrics.map((metric, index) => (
              <div
                key={index}
                className="bg-white/90 backdrop-blur-sm rounded-xl p-6 shadow-lg transform hover:scale-105 transition-transform"
              >
                <div className="flex items-center justify-center mb-4">
                  {metric.icon}
                </div>
                <h3 className="text-2xl font-bold text-gray-800 mb-2">
                  {metric.value}
                </h3>
                <h4 className="text-lg font-semibold text-gray-700 mb-2">
                  {metric.title}
                </h4>
                <p className="text-sm text-gray-600">{metric.description}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Innovation & Tradition Toggle */}
        <div className="flex justify-center mb-8">
          <div className="bg-white/90 backdrop-blur-sm rounded-full p-1 flex shadow-lg">
            <button
              onClick={() => setActiveTab("traditional")}
              className={`px-6 py-2 rounded-full transition-colors ${
                activeTab === "traditional"
                  ? "bg-green-500 text-white"
                  : "text-gray-600 hover:text-gray-800"
              }`}
            >
              <div className="flex items-center space-x-2">
                <TreeDeciduous className="w-4 h-4" />
                <span>Traditional</span>
              </div>
            </button>
            <button
              onClick={() => setActiveTab("modern")}
              className={`px-6 py-2 rounded-full transition-colors ${
                activeTab === "modern"
                  ? "bg-blue-500 text-white"
                  : "text-gray-600 hover:text-gray-800"
              }`}
            >
              <div className="flex items-center space-x-2">
                <Gauge className="w-4 h-4" />
                <span>Modern Integration</span>
              </div>
            </button>
          </div>
        </div>

        {/* Main Grid Layout */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          <div className="bg-white/90 backdrop-blur-sm rounded-xl p-6 shadow-lg transform hover:scale-105 transition-transform">
            <div className="flex items-center mb-4">
              {activeTab === "traditional" ? (
                <Droplets className="w-6 h-6 text-blue-600 mr-2" />
              ) : (
                <Zap className="w-6 h-6 text-yellow-600 mr-2" />
              )}
              <h2 className="text-xl font-semibold text-gray-800">
                {activeTab === "traditional"
                  ? "Water Practices"
                  : "Smart Solutions"}
              </h2>
            </div>
            <div className="space-y-4">
              {currentPractices.map((practice) => (
                <div
                  key={practice.id}
                  className="border-b border-gray-200 pb-4"
                >
                  <div className="flex justify-between items-center mb-2">
                    <h3 className="font-medium text-gray-700">
                      {practice.name}
                    </h3>
                    <div className="flex items-center space-x-2">
                      <span className="text-sm text-blue-600">
                        {practice.percentage}%
                      </span>
                      <span className="text-xs text-green-600">
                        +{practice.efficiency}% efficiency
                      </span>
                    </div>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2 mb-2">
                    <div
                      className={`${
                        activeTab === "traditional"
                          ? "bg-blue-600"
                          : "bg-yellow-600"
                      } rounded-full h-2 transition-all duration-500`}
                      style={{ width: `${practice.percentage}%` }}
                    />
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-1">
                    <div
                      className="bg-green-500 rounded-full h-1 transition-all duration-500"
                      style={{ width: `${practice.efficiency}%` }}
                    />
                  </div>
                  <p className="text-sm text-gray-600 mt-2">
                    {practice.description}
                  </p>
                </div>
              ))}
            </div>
          </div>

          <div className="bg-white/90 backdrop-blur-sm rounded-xl p-6 shadow-lg transform hover:scale-105 transition-transform">
            <div className="flex items-center mb-4">
              <Calendar className="w-6 h-6 text-green-600 mr-2" />
              <h2 className="text-xl font-semibold text-gray-800">
                {activeTab === "traditional"
                  ? "Cultural Calendar"
                  : "Tech Events"}
              </h2>
            </div>
            <div className="space-y-4">
              {currentEvents.map((event) => (
                <button
                  key={event.date}
                  onClick={() => setSelectedEvent(event)}
                  className="w-full text-left hover:bg-green-50 p-3 rounded-lg transition-colors"
                >
                  <div className="flex justify-between items-center">
                    <div>
                      <h3 className="font-medium text-gray-700">
                        {event.title}
                      </h3>
                      <p className="text-sm text-gray-500">{event.date}</p>
                      <p className="text-sm text-gray-600 mt-1">
                        {event.description}
                      </p>
                    </div>
                    <ChevronRight className="w-5 h-5 text-gray-400" />
                  </div>
                </button>
              ))}
            </div>
          </div>

          <div className="bg-white/90 backdrop-blur-sm rounded-xl p-6 shadow-lg transform hover:scale-105 transition-transform">
            <div className="flex items-center mb-4">
              {isRecording ? (
                <MicOff className="w-6 h-6 text-red-600 mr-2" />
              ) : (
                <Mic className="w-6 h-6 text-green-600 mr-2" />
              )}
              <h2 className="text-xl font-semibold text-gray-800">
                Share Your Practice
              </h2>
            </div>
            <div className="space-y-4">
              <button
                onClick={handleVoiceInput}
                className={`w-full py-3 px-4 rounded-lg flex items-center justify-center space-x-2 ${
                  isRecording
                    ? "bg-red-100 text-red-700 hover:bg-red-200"
                    : "bg-green-100 text-green-700 hover:bg-green-200"
                } transform hover:scale-105 transition-transform`}
              >
                {isRecording ? (
                  <>
                    <MicOff className="w-5 h-5" />
                    <span>Stop Recording</span>
                  </>
                ) : (
                  <>
                    <Mic className="w-5 h-5" />
                    <span>Start Recording</span>
                  </>
                )}
              </button>
              <div>
                <textarea
                  value={practiceInput}
                  onChange={(e) => setPracticeInput(e.target.value)}
                  placeholder="Or type your cultural water practice here..."
                  className="w-full h-32 p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                />
                <button
                  onClick={handlePracticeSubmit}
                  className="mt-2 w-full bg-green-600 text-white py-2 rounded-lg hover:bg-green-700 transition-colors transform hover:scale-105 transition-transform"
                >
                  Submit Practice
                </button>
              </div>
            </div>
          </div>
        </div>
        <CulturalPracticesData
          region={userRegion}
          triggerFetch={triggerFetch}
        />

        {/* Quick Actions Footer */}
        <div className="mt-8 grid grid-cols-2 md:grid-cols-4 gap-4">
          <button
            onClick={handleMapClick}
            className="flex items-center justify-center space-x-2 bg-blue-100 text-blue-700 p-4 rounded-lg hover:bg-blue-200 transition-colors transform hover:scale-105 transition-transform"
          >
            <Map className="w-5 h-5" />
            <span>View Map</span>
          </button>
          <button className="flex items-center justify-center space-x-2 bg-green-100 text-green-700 p-4 rounded-lg hover:bg-green-200 transition-colors transform hover:scale-105 transition-transform">
            <Users className="w-5 h-5" />
            <span>Community</span>
          </button>
          <button className="flex items-center justify-center space-x-2 bg-purple-100 text-purple-700 p-4 rounded-lg hover:bg-purple-200 transition-colors transform hover:scale-105 transition-transform">
            <BookOpen className="w-5 h-5" />
            <span>Resources</span>
          </button>
          <button className="flex items-center justify-center space-x-2 bg-orange-100 text-orange-700 p-4 rounded-lg hover:bg-orange-200 transition-colors transform hover:scale-105 transition-transform">
            <Download className="w-5 h-5" />
            <span>Download Guide</span>
          </button>
        </div>
      </div>

      {/* Map Modal */}
      {isMapModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl w-full max-w-4xl max-h-[80vh] overflow-hidden shadow-2xl">
            <div className="p-4 border-b border-gray-200 flex justify-between items-center">
              <h2 className="text-xl font-semibold text-gray-800">
                Your Location Map
              </h2>
              <button
                onClick={() => setIsMapModalOpen(false)}
                className="p-2 hover:bg-gray-100 rounded-full transition-colors"
              >
                <X className="w-6 h-6 text-gray-600" />
              </button>
            </div>
            <div className="p-4">
              {isMapLoading ? (
                <div className="flex items-center justify-center h-64">
                  <Loader2 className="w-10 h-10 text-green-600 animate-spin" />
                </div>
              ) : mapError ? (
                <p className="text-red-600 text-center">{mapError}</p>
              ) : (
                <>
                  {mapImageUrl && (
                    <div
                      className="relative w-full"
                      style={{ paddingTop: "50%" }}
                    >
                      <img
                        src={mapImageUrl}
                        alt="Map view of your location"
                        className="absolute inset-0 w-full h-full object-cover rounded-lg shadow-sm"
                        onError={handleImageError}
                      />
                    </div>
                  )}
                  <br />
                  <div className="mt-4 space-y-2">
                    <h3 className="font-semibold text-gray-800">
                      Location Details
                    </h3>
                    <p className="text-gray-600">
                      {activeTab === "traditional"
                        ? "This map shows your approximate location where traditional water management practices like stepwells or rainwater harvesting may be in use."
                        : "This map shows your approximate location where modern water management technologies like smart irrigation could be implemented."}
                    </p>
                    <div className="flex space-x-4 mt-4">
                      <div className="flex items-center space-x-2">
                        <Droplet className="w-5 h-5 text-blue-500" />
                        <span className="text-sm text-gray-600">
                          Water Sources: 12
                        </span>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Users className="w-5 h-5 text-green-500" />
                        <span className="text-sm text-gray-600">
                          Communities Served: 5
                        </span>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Gauge className="w-5 h-5 text-purple-500" />
                        <span className="text-sm text-gray-600">
                          Efficiency Rate: 85%
                        </span>
                      </div>
                    </div>
                  </div>
                </>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
