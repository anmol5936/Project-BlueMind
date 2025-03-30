import React, { useEffect, useState } from "react";
import axios from "axios";
import { Leaf, Calendar, MapPin, ChevronDown, ChevronUp } from "lucide-react";

interface CulturalPractice {
  _id: string;
  region: string;
  festival: string;
  practice: string;
}

interface Props {
  region: string;
  triggerFetch: number;
}

export const CulturalPracticesData: React.FC<Props> = ({
  region,
  triggerFetch,
}) => {
  const [practices, setPractices] = useState<CulturalPractice[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showAll, setShowAll] = useState(false);

  const ITEMS_TO_SHOW = 2;

  useEffect(() => {
    const fetchPractices = async () => {
      try {
        const response = await axios.post(
          "http://localhost:3000/get-community",
          {
            region,
          }
        );
        setPractices(response.data.data);
        setLoading(false);
      } catch (err) {
        setError("Failed to fetch cultural practices");
        setLoading(false);
      }
    };

    fetchPractices();
  }, [region, triggerFetch]);

  if (loading) {
    return (
      <div className="flex justify-center items-center p-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-green-500"></div>
      </div>
    );
  }

  if (error) {
    return <div className="text-red-500 text-center p-4">{error}</div>;
  }

  const displayedPractices = showAll
    ? practices
    : practices.slice(0, ITEMS_TO_SHOW);
  const hasMoreItems = practices.length > ITEMS_TO_SHOW;

  return (
    <div className="bg-white/90 backdrop-blur-sm rounded-xl p-6 shadow-lg mt-8">
      <h2 className="text-2xl font-semibold text-gray-800 mb-6 flex items-center">
        <Leaf className="w-6 h-6 text-green-600 mr-2" />
        Cultural Practices in Your Region
      </h2>

      <div className="grid gap-6">
        {displayedPractices.map((practice) => (
          <div
            key={practice._id}
            className="border border-gray-100 rounded-lg p-4 hover:shadow-md transition-shadow bg-white"
          >
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <div className="flex items-center mb-2">
                  <Calendar className="w-5 h-5 text-blue-500 mr-2" />
                  <h3 className="text-lg font-medium text-gray-800">
                    {practice.festival}
                  </h3>
                </div>
                <div className="flex items-center text-gray-600 mb-3">
                  <MapPin className="w-4 h-4 text-gray-400 mr-2" />
                  <span className="text-sm">{practice.region}</span>
                </div>
                <p className="text-gray-600 leading-relaxed">
                  {practice.practice}
                </p>
              </div>
            </div>
          </div>
        ))}
      </div>

      {hasMoreItems && (
        <button
          onClick={() => setShowAll(!showAll)}
          className="mt-6 w-full py-3 px-4 flex items-center justify-center space-x-2 bg-green-50 text-green-600 rounded-lg hover:bg-green-100 transition-colors group"
        >
          <span>{showAll ? "Show Less" : "Show More"}</span>
          {showAll ? (
            <ChevronUp className="w-5 h-5 group-hover:-translate-y-1 transition-transform" />
          ) : (
            <ChevronDown className="w-5 h-5 group-hover:translate-y-1 transition-transform" />
          )}
        </button>
      )}
    </div>
  );
};
