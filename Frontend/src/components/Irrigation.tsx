import React, { useState } from "react";
import { motion } from "framer-motion";
import { Droplets, Loader2, MapPin } from "lucide-react";
import IrrigationPlanModal from "../components/ModalSection";

// Define types
interface Farm {
  primaryCrop: string;
}

interface IrrigationPlan {
  irrigation_plan: string;
}

interface IrrigationPlanSectionProps {
  farm: Farm;
  locationError: string | null;
  isGettingLocation: boolean;
  getCurrentLocation: () => void;
}

const IrrigationPlanSection: React.FC<IrrigationPlanSectionProps> = ({
  farm,
  locationError,
  isGettingLocation,
  getCurrentLocation,
}) => {
  const [cropType, setCropType] = useState("Lettuce");
  const [growthStage, setGrowthStage] = useState("Seedling");
  const [isGeneratingPlan, setIsGeneratingPlan] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [irrigationPlanData, setIrrigationPlanData] = useState<string | null>(
    null
  );

  const generateIrrigationPlan = async () => {
    if (!userLocation) {
      alert("Please set a location first");
      return;
    }
    setIsGeneratingPlan(true);
    try {
      // Example API call (adjust URL and response structure as needed)
      const response = await fetch("http://localhost:7000/irrigation_plan", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          crop: cropType.toLowerCase(),
          stage: growthStage.toLowerCase(),
          location: [userLocation.latitude, userLocation.longitude],
        }),
      });
      if (!response.ok) {
        throw new Error("Failed to fetch irrigation plan");
      }
      const data: IrrigationPlan = await response.json();
      setIrrigationPlanData(data.irrigation_plan);
      setIsModalOpen(true);
    } catch (error) {
      console.error("Error generating irrigation plan:", error);
      alert("Failed to generate irrigation plan");
    } finally {
      setIsGeneratingPlan(false);
    }
  };

  const userLocation = JSON.parse(localStorage.getItem("userLocation") || "{}");

  return (
    <>
      <div className="bg-white rounded-xl shadow-sm p-4 sm:p-6 mb-6">
        <h3 className="text-lg font-semibold text-green-800 mb-4">
          Irrigation Plan - {farm.primaryCrop}
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
          <div className="space-y-4">
            <div>
              <label
                htmlFor="cropType"
                className="block text-sm font-medium text-green-700 mb-1"
              >
                Crop Type
              </label>
              <select
                id="cropType"
                value={cropType}
                onChange={(e) => setCropType(e.target.value)}
                className="w-full p-2 rounded-lg border border-green-200 focus:outline-none focus:ring-2 focus:ring-green-500"
              >
                <option value="Lettuce">Lettuce</option>
                <option value="Wheat">Wheat</option>
                <option value="Tomato">Tomato</option>
                <option value="Rice">Rice</option>
                <option value="Corn">Corn</option>
              </select>
            </div>
            <div>
              <label
                htmlFor="growthStage"
                className="block text-sm font-medium text-green-700 mb-1"
              >
                Growth Stage
              </label>
              <select
                id="growthStage"
                value={growthStage}
                onChange={(e) => setGrowthStage(e.target.value)}
                className="w-full p-2 rounded-lg border border-green-200 focus:outline-none focus:ring-2 focus:ring-green-500"
              >
                <option value="Seedling">Seedling</option>
                <option value="Vegetative">Vegetative</option>
                <option value="Flowering">Flowering</option>
                <option value="Harvest">Harvest</option>
              </select>
            </div>
          </div>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-green-700 mb-1">
                Location
              </label>
              <div className="p-4 bg-green-50 rounded-lg">
                {userLocation ? (
                  <div className="space-y-2">
                    <p className="text-green-800">
                      <span className="font-medium">Coordinates:</span>{" "}
                      {userLocation.latitude.toFixed(4)},{" "}
                      {userLocation.longitude.toFixed(4)}
                    </p>
                    {userLocation.address && (
                      <p className="text-green-800">
                        <span className="font-medium">Address:</span>{" "}
                        {userLocation.address}
                      </p>
                    )}
                    {userLocation.region && (
                      <p className="text-green-800">
                        <span className="font-medium">Region:</span>{" "}
                        {userLocation.region}
                      </p>
                    )}
                  </div>
                ) : locationError ? (
                  <p className="text-red-600">{locationError}</p>
                ) : (
                  <p className="text-green-600">No location data available</p>
                )}
              </div>
            </div>
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={getCurrentLocation}
              disabled={isGettingLocation}
              className="w-full bg-green-100 text-green-700 py-2 rounded-lg hover:bg-green-200 flex items-center justify-center space-x-2"
            >
              {isGettingLocation ? (
                <Loader2 className="animate-spin" size={20} />
              ) : (
                <>
                  <MapPin size={20} />
                  <span>Use My Location</span>
                </>
              )}
            </motion.button>
          </div>
        </div>
        <motion.button
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          onClick={generateIrrigationPlan}
          disabled={!userLocation || isGeneratingPlan}
          className="w-full bg-green-600 text-white py-3 rounded-lg hover:bg-green-700 flex items-center justify-center space-x-2 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isGeneratingPlan ? (
            <Loader2 className="animate-spin" size={20} />
          ) : (
            <>
              <Droplets size={20} />
              <span>Generate Irrigation Plan</span>
            </>
          )}
        </motion.button>
      </div>

      {/* Irrigation Plan Modal */}
      <IrrigationPlanModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        planData={irrigationPlanData || ""}
        location={{
          address: userLocation?.address,
          region: userLocation?.region,
        }}
      />
    </>
  );
};

export default IrrigationPlanSection;
