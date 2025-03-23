import React from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X } from "lucide-react";

interface IrrigationPlanModalProps {
  isOpen: boolean;
  onClose: () => void;
  planData: string;
  location: {
    address?: string;
    region?: string;
  };
}

const IrrigationPlanModal: React.FC<IrrigationPlanModalProps> = ({
  isOpen,
  onClose,
  planData,
  location,
}) => {
  // Parse and format the plan data
  const formatPlanData = (data: string) => {
    // Remove markdown symbols and extra whitespace
    return data
      .replace(/\*\*/g, "")
      .split("\n")
      .filter((line) => line.trim())
      .map((line) => line.trim());
  };

  const planLines = formatPlanData(planData);

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed top-0 left-0 right-0 bottom-0 bg-black bg-opacity-50 backdrop-blur-sm z-40 w-full h-full"
            onClick={onClose}
          />
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 20 }}
            className="fixed inset-0 flex items-center justify-center p-4 z-50 md:p-0"
          >
            <div className="bg-white rounded-xl shadow-2xl overflow-hidden max-w-3xl w-full h-[90vh] md:h-[85vh]">
              <div className="flex flex-col h-full">
                {/* Header */}
                <div className="flex items-center justify-between p-4 border-b border-gray-200 bg-green-50">
                  <h2 className="text-xl font-semibold text-green-800">
                    Irrigation Plan Details
                  </h2>
                  <button
                    onClick={onClose}
                    className="p-2 hover:bg-green-100 rounded-full transition-colors"
                  >
                    <X className="text-green-600" size={24} />
                  </button>
                </div>

                {/* Location info */}
                <div className="bg-green-50 p-4">
                  <div className="text-green-800">
                    {location.address && (
                      <p>
                        <span className="font-medium">Location:</span>{" "}
                        {location.address}
                      </p>
                    )}
                    {location.region && (
                      <p>
                        <span className="font-medium">Region:</span>{" "}
                        {location.region}
                      </p>
                    )}
                  </div>
                </div>

                {/* Content */}
                <div className="flex-1 overflow-y-auto p-6">
                  <div className="space-y-6">
                    {planLines.map((line, index) => {
                      if (line.includes(":")) {
                        const [title, ...content] = line.split(":");
                        return (
                          <div key={index} className="space-y-2">
                            <h3 className="text-lg font-semibold text-green-800">
                              {title}
                            </h3>
                            <p className="text-gray-700">{content.join(":")}</p>
                          </div>
                        );
                      }
                      return (
                        <p key={index} className="text-gray-700">
                          {line}
                        </p>
                      );
                    })}
                  </div>
                </div>

                {/* Footer */}
                <div className="p-4 border-t border-gray-200">
                  <button
                    onClick={onClose}
                    className="w-full bg-green-600 text-white py-2 rounded-lg hover:bg-green-700 transition-colors"
                  >
                    Close
                  </button>
                </div>
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
};

export default IrrigationPlanModal;
