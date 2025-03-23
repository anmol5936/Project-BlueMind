import React, { useState, useEffect } from 'react';
import {
  MapPin,
  ArrowLeft,
  Calendar as CalendarIcon,
  Pin,
  Droplets,
  Star,
  Sun,
  Cloud,
  Trash2,
  ChevronDown,
  ChevronUp,
  TrendingUp,
  TrendingDown,
  Percent,
  Droplet
} from 'lucide-react';
import Calendar from 'react-calendar';
import { motion, AnimatePresence } from 'framer-motion';
import 'react-calendar/dist/Calendar.css';

interface Crop {
  crop: string;
  sowingPeriod: string;
  harvestingPeriod: string;
}

interface Festival {
  name: string;
  period: string;
  description: string;
  location: string;
}

interface Coordinates {
  lat: [number, number];
  lon: [number, number];
}

interface State {
  crops: Crop[];
  festivals: Festival[];
  coordinates: Coordinates;
}

interface StateData {
  [state: string]: State;
}

interface FestivalWaterAllocation {
  name: string;
  percentage: number;
}

const festivalWaterAllocations: FestivalWaterAllocation[] = [
  { name: "Diwali", percentage: 42 },
  { name: "Holi", percentage: 45 },
  { name: "Navratri", percentage: 9 },
  { name: "Dussehra", percentage: 27 },
  { name: "Makar Sankranti", percentage: 18 },
  { name: "Ganesh Chaturthi", percentage: 35 },
  { name: "Chhath Puja", percentage: 38 },
  { name: "Ram Navami", percentage: 30 },
  { name: "Maha Shivratri", percentage: 26 },
  { name: "Ratha Yatra", percentage: 28 }
].sort((a, b) => b.percentage - a.percentage);

const stateData: StateData = {
  "Andhra Pradesh": {
    crops: [
      { crop: "Kharif Paddy", sowingPeriod: "May-June", harvestingPeriod: "Nov-Dec" },
      { crop: "Rabi Paddy", sowingPeriod: "Nov-Dec", harvestingPeriod: "May-June" },
      { crop: "Summer Paddy", sowingPeriod: "March-April", harvestingPeriod: "July-Aug" },
      { crop: "Kharif Bajra", sowingPeriod: "Jun(B)-Jul(M)", harvestingPeriod: "Aug(B)-Oct(B)" },
    ],
    festivals: [
      {
        name: "Pushkaram",
        period: "Aug-Sep",
        description: "Sacred river festival celebrating the Godavari",
        location: "Godavari River",
      },
      {
        name: "Sirimanotsavam",
        period: "Oct-Nov",
        description: "Water ritual festival in Tirupati",
        location: "Tirupati",
      },
    ],
    coordinates: {
      lat: [12, 19],
      lon: [77, 85],
    },
  },
};

const seasons = [
  { name: "Kharif", period: "June-October", description: "Monsoon crop season" },
  { name: "Rabi", period: "November-April", description: "Winter crop season" },
  { name: "Summer", period: "February-May", description: "Summer crop season" },
];

interface WeatherData {
  temp: number;
  rainChance: number;
}

const mockWeather: { [key: string]: WeatherData } = {
  "Andhra Pradesh": { temp: 32, rainChance: 20 },
  "Assam": { temp: 28, rainChance: 60 },
  "Karnataka": { temp: 30, rainChance: 10 },
};

const CropCalendar: React.FC = () => {
  const [selectedState, setSelectedState] = useState<string>("Andhra Pradesh");
  const [location, setLocation] = useState<{ lat: number; lon: number } | null>(null);
  const [isLocating, setIsLocating] = useState(false);
  const [showCalendar, setShowCalendar] = useState(false);
  const [selectedCrop, setSelectedCrop] = useState<string | null>(null);
  const [markedDates, setMarkedDates] = useState<{ [key: string]: string }>({});
  const [pinnedItems, setPinnedItems] = useState<Set<string>>(new Set());
  const [showPinnedItems, setShowPinnedItems] = useState(true);
  const [showWaterAllocation, setShowWaterAllocation] = useState(true);
  const [expandedSections, setExpandedSections] = useState<{ [key: string]: boolean }>({
    crops: true,
    festivals: true
  });

  const toggleSection = (section: string) => {
    setExpandedSections(prev => ({
      ...prev,
      [section]: !prev[section]
    }));
  };

  const togglePin = (item: string) => {
    setPinnedItems(prev => {
      const newPinned = new Set(prev);
      if (newPinned.has(item)) {
        newPinned.delete(item);
      } else {
        newPinned.add(item);
      }
      return newPinned;
    });
  };

  const resetAll = () => {
    setMarkedDates({});
    setPinnedItems(new Set());
  };

  const getLocation = () => {
    setIsLocating(true);
    navigator.geolocation.getCurrentPosition(
      (position) => {
        const { latitude, longitude } = position.coords;
        setLocation({ lat: latitude, lon: longitude });
        const matchedState = Object.entries(stateData).find(([_, data]) => {
          return latitude >= data.coordinates.lat[0] &&
            latitude <= data.coordinates.lat[1] &&
            longitude >= data.coordinates.lon[0] &&
            longitude <= data.coordinates.lon[1];
        });
        if (matchedState) {
          setSelectedState(matchedState[0]);
        }
        setIsLocating(false);
      },
      (error) => {
        console.error('Error getting location:', error);
        setIsLocating(false);
      }
    );
  };

  const handleDateSelect = (date: Date) => {
    if (selectedCrop) {
      setMarkedDates(prev => ({
        ...prev,
        [date.toISOString()]: selectedCrop
      }));
    }
    setShowCalendar(false);
  };

  const containerVariants = {
    hidden: { opacity: 0, height: 0 },
    visible: { 
      opacity: 1, 
      height: 'auto',
      transition: {
        duration: 0.5,
        ease: "easeInOut",
        when: "beforeChildren",
        staggerChildren: 0.1
      }
    },
    exit: {
      opacity: 0,
      height: 0,
      transition: {
        duration: 0.3,
        ease: "easeInOut"
      }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { 
      opacity: 1, 
      y: 0,
      transition: { 
        type: "spring",
        stiffness: 100,
        damping: 15
      }
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="min-h-screen bg-gradient-to-b from-green-200 to-orange-50"
    >
      <div className="bg-gradient-to-tr from-green-600 to-green-500 text-white p-4 shadow-lg backdrop-blur-sm">
        <div className="max-w-7xl mx-auto">
          <div className="flex items-center justify-between mb-4">
            <motion.button
              whileHover={{ scale: 1.05 }}
              className="flex items-center space-x-2 px-4 py-2 rounded-lg bg-green-700 hover:bg-green-800 transition-colors"
              onClick={() => window.history.back()}
              aria-label="Go back"
            >
              <ArrowLeft size={24} />
              <span>Back</span>
            </motion.button>
            <h1 className="text-3xl font-bold">Crop Calendar</h1>
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className={`p-3 rounded-full ${isLocating ? 'bg-green-700' : 'bg-green-500'} hover:bg-green-700 transition-colors`}
              onClick={getLocation}
              disabled={isLocating}
              aria-label="Get location"
            >
              <MapPin
                className={`${isLocating ? 'animate-pulse' : ''}`}
                size={24}
              />
            </motion.button>
          </div>

          {mockWeather[selectedState] && (
            <motion.div
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              className="flex items-center justify-center space-x-6 text-white/90"
            >
              <div className="flex items-center">
                <Sun className="mr-2" size={20} />
                <span>{mockWeather[selectedState].temp}°C</span>
              </div>
              <div className="flex items-center">
                <Cloud className="mr-2" size={20} />
                <span>{mockWeather[selectedState].rainChance}% rain chance</span>
              </div>
            </motion.div>
          )}
        </div>
      </div>

      <div className="max-w-7xl mx-auto p-4 space-y-6">
        {location && (
          <motion.div
            initial={{ y: -20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            className="bg-white/90 p-4 rounded-lg shadow-md backdrop-blur-sm"
          >
            <p className="text-green-800 text-lg">
              Location: {selectedState} (Lat: {location.lat.toFixed(2)}, Lon: {location.lon.toFixed(2)})
            </p>
          </motion.div>
        )}

        <div className="flex flex-col sm:flex-row gap-4">
          <div className="w-full sm:w-1/3">
            <label htmlFor="state-select" className="block text-lg font-medium text-gray-700 mb-2">
              Select State
            </label>
            <select
              id="state-select"
              value={selectedState}
              onChange={(e) => setSelectedState(e.target.value)}
              className="w-full p-3 text-lg border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 bg-white/90 backdrop-blur-sm"
            >
              {Object.keys(stateData).map(state => (
                <option key={state} value={state}>{state}</option>
              ))}
            </select>
          </div>

          <div className="flex items-end">
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={resetAll}
              className="flex items-center space-x-2 px-4 py-3 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors"
              aria-label="Reset all pins and marked dates"
            >
              <Trash2 size={20} />
              <span>Reset All</span>
            </motion.button>
          </div>
        </div>

        {pinnedItems.size > 0 && (
          <motion.div
            layout
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-yellow-50/90 p-6 rounded-lg shadow-md backdrop-blur-sm"
          >
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-semibold text-yellow-800">
                Pinned Items
              </h2>
              <button
                onClick={() => setShowPinnedItems(!showPinnedItems)}
                className="text-yellow-600 hover:text-yellow-800"
                aria-label={showPinnedItems ? 'Hide pinned items' : 'Show pinned items'}
              >
                {showPinnedItems ? <ChevronUp size={24} /> : <ChevronDown size={24} />}
              </button>
            </div>
            <AnimatePresence>
              {showPinnedItems && (
                <motion.div
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: 'auto', opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  className="space-y-2 overflow-hidden"
                >
                  {Array.from(pinnedItems).map(item => (
                    <motion.div
                      key={item}
                      className="flex items-center justify-between p-3 bg-white rounded-md shadow-sm"
                      whileHover={{ scale: 1.01 }}
                    >
                      <span className="text-gray-800">{item}</span>
                      <button
                        onClick={() => togglePin(item)}
                        className="text-yellow-600 hover:text-yellow-800"
                        aria-label={`Unpin ${item}`}
                      >
                        <Pin size={20} className="fill-current" />
                      </button>
                    </motion.div>
                  ))}
                </motion.div>
              )}
            </AnimatePresence>
          </motion.div>
        )}

<motion.div
      layout
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, ease: "easeOut" }}
      className="bg-gradient-to-br from-green-50 to-green-100 rounded-xl shadow-lg p-6 backdrop-blur-md border border-blue-100/50"
    >
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center space-x-3">
          <Droplet className="text-blue-600" size={24} />
          <h2 className="text-xl font-semibold text-green-900">Festival Water Allocation</h2>
        </div>
        <motion.button
          whileHover={{ scale: 1.1, rotate: 90 }}
          whileTap={{ scale: 0.95 }}
          onClick={() => setShowWaterAllocation(!showWaterAllocation)}
          className="p-2 rounded-full text-blue-600 hover:bg-blue-200 transition-colors duration-300"
          aria-label={showWaterAllocation ? 'Hide water allocation' : 'Show water allocation'}
        >
          {showWaterAllocation ? <ChevronUp size={24} /> : <ChevronDown size={24} />}
        </motion.button>
      </div>

      <AnimatePresence>
        {showWaterAllocation && (
          <motion.div
            variants={containerVariants}
            initial="hidden"
            animate="visible"
            exit="exit"
            className="overflow-hidden"
          >
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-6">
              {festivalWaterAllocations.map((festival) => (
                <motion.div
                  key={festival.name}
                  variants={itemVariants}
                  className={`p-5 rounded-xl shadow-md ${
                    festival.percentage > 0
                      ? 'bg-green-100'
                      : 'bg-gradient-to-br from-red-200 to-pink-100'
                  } transition-all duration-300`}
                  whileHover={{ 
                    scale: 1.03,
                    boxShadow: "0 8px 25px rgba(0,0,0,0.1)"
                  }}
                >
                  <div className="flex items-center justify-between mb-3">
                    <h3 className="font-medium text-gray-800 text-lg">{festival.name}</h3>
                    <motion.div 
                      className="flex items-center space-x-2"
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      transition={{ type: "spring", stiffness: 200, damping: 10 }}
                    >
                      {festival.percentage > 0 ? (
                        <TrendingUp size={20} className="text-green-600" />
                      ) : (
                        <TrendingDown size={20} className="text-red-600" />
                      )}
                      <span className={`font-semibold text-sm ${
                        festival.percentage > 0 ? 'text-green-700' : 'text-red-700'
                      }`}>
                        {festival.percentage > 0 ? '+' : ''}{festival.percentage}%
                      </span>
                    </motion.div>
                  </div>
                  <div className="relative pt-1">
                    <div className="overflow-hidden h-2 mb-2 text-xs flex rounded-full bg-gray-200/50">
                      <motion.div
                        initial={{ width: 0 }}
                        animate={{ width: `${Math.abs(festival.percentage)}%` }}
                        transition={{ duration: 1, ease: "easeOut" }}
                        className={`shadow-none flex flex-col text-center whitespace-nowrap text-white justify-center ${
                          festival.percentage > 0
                            ? 'bg-green-500'
                            : 'bg-gradient-to-r from-red-500 to-pink-500'
                        } rounded-full`}
                      />
                    </div>
                    <span className="text-xs text-gray-600">
                      {festival.percentage > 0 ? 'Surplus' : 'Deficit'} Allocation
                    </span>
                  </div>
                </motion.div>
              ))}
            </div>

            <motion.div
              variants={itemVariants}
              className="p-5 bg-white/90 rounded-xl shadow-inner border border-blue-100/30"
            >
              <h3 className="text-lg font-medium text-gray-800 mb-4 flex items-center space-x-2">
                <Droplet size={20} className="text-blue-600" />
                <span>Water Allocation Guide</span>
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <motion.div
                  whileHover={{ x: 5 }}
                  className="flex items-center space-x-3 p-2 rounded-lg hover:bg-blue-50 transition-colors duration-200"
                >
                  <TrendingUp size={20} className="text-green-600 flex-shrink-0" />
                  <div>
                    <span className="text-gray-700 font-medium">Increased Allocation</span>
                    <p className="text-sm text-gray-500">More water available</p>
                  </div>
                </motion.div>
                <motion.div
                  whileHover={{ x: 5 }}
                  className="flex items-center space-x-3 p-2 rounded-lg hover:bg-red-50 transition-colors duration-200"
                >
                  <TrendingDown size={20} className="text-red-600 flex-shrink-0" />
                  <div>
                    <span className="text-gray-700 font-medium">Decreased Allocation</span>
                    <p className="text-sm text-gray-500">Reduced water supply</p>
                  </div>
                </motion.div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <motion.div
            layout
            className="lg:col-span-2 bg-white/90 rounded-lg shadow-md p-6 backdrop-blur-sm"
          >
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-semibold text-green-800">Crop Calendar</h2>
              <button
                onClick={() => toggleSection('crops')}
                className="text-green-600 hover:text-green-800"
                aria-label={expandedSections.crops ? 'Collapse crops section' : 'Expand crops section'}
              >
                {expandedSections.crops ? <ChevronUp size={24} /> : <ChevronDown size={24} />}
              </button>
            </div>
            <AnimatePresence>
              {expandedSections.crops && (
                <motion.div
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: 'auto', opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  className="overflow-hidden"
                >
                  <div className="overflow-x-auto">
                    <table className="min-w-full">
                      <thead>
                        <tr className="bg-green-100">
                          <th className="px-4 py-3 text-left text-lg">Crop</th>
                          <th className="px-4 py-3 text-left text-lg">Sowing Period</th>
                          <th className="px-4 py-3 text-left text-lg">Harvesting Period</th>
                          <th className="px-4 py-3 text-left text-lg">Actions</th>
                        </tr>
                      </thead>
                      <tbody>
                        {stateData[selectedState].crops.map((crop) => (
                          <motion.tr
                            key={crop.crop}
                            className="border-b border-gray-200 hover:bg-green-50 transition-colors"
                            whileHover={{ scale: 1.01 }}
                          >
                            <td className="px-4 py-3 text-lg flex items-center space-x-2">
                              <Droplets className="text-green-600" size={20} />
                              <span>{crop.crop}</span>
                            </td>
                            <td className="px-4 py-3 text-lg">{crop.sowingPeriod}</td>
                            <td className="px-4 py-3 text-lg">{crop.harvestingPeriod}</td>
                            <td className="px-4 py-3">
                              <div className="flex items-center space-x-2">
                                <motion.button
                                  whileHover={{ scale: 1.1 }}
                                  whileTap={{ scale: 0.9 }}
                                  onClick={() => {
                                    setSelectedCrop(crop.crop);
                                    setShowCalendar(true);
                                  }}
                                  className="flex items-center space-x-1 text-green-600 hover:text-green-800 p-2 rounded-full hover:bg-green-100 transition-colors"
                                  aria-label={`Mark dates for ${crop.crop}`}
                                >
                                  <CalendarIcon size={20} />
                                </motion.button>
                                <motion.button
                                  whileHover={{ scale: 1.1 }}
                                  whileTap={{ scale: 0.9 }}
                                  onClick={() => togglePin(crop.crop)}
                                  className={`p-2 rounded-full transition-colors ${
                                    pinnedItems.has(crop.crop)
                                      ? 'text-yellow-600 hover:text-yellow-800'
                                      : 'text-gray-400 hover:text-gray-600'
                                  }`}
                                  aria-label={`${pinnedItems.has(crop.crop) ? 'Unpin' : 'Pin'} ${crop.crop}`}
                                >
                                  <Pin
                                    size={20}
                                    className={pinnedItems.has(crop.crop) ? 'fill-current' : ''}
                                  />
                                </motion.button>
                              </div>
                            </td>
                          </motion.tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </motion.div>

          <motion.div layout className="space-y-6">
            <div className="bg-white/90 rounded-lg shadow-md p-6 backdrop-blur-sm">
              <h2 className="text-xl font-semibold mb-4 text-green-800">Cropping Seasons</h2>
              <div className="space-y-4">
                {seasons.map((season) => (
                  <motion.div
                    key={season.name}
                    className="p-4 bg-green-50 rounded-lg hover:bg-green-100 transition-colors"
                    whileHover={{ scale: 1.02 }}
                  >
                    <h3 className="font-medium text-green-800 text-lg flex items-center space-x-2">
                      <Sun size={20} />
                      <span>{season.name}</span>
                    </h3>
                    <p className="text-base text-gray-600 mt-1">{season.period}</p>
                    <p className="text-sm text-gray-500 mt-1">{season.description}</p>
                  </motion.div>
                ))}
              </div>
            </div>

            <div className="bg-white/90 rounded-lg shadow-md p-6 backdrop-blur-sm">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl font-semibold text-green-800">Water Festivals</h2>
                <button
                  onClick={() => toggleSection('festivals')}
                  className="text-green-600 hover:text-green-800"
                  aria-label={expandedSections.festivals ? 'Collapse festivals section' : 'Expand festivals section'}
                >
                  {expandedSections.festivals ? <ChevronUp size={24} /> : <ChevronDown size={24} />}
                </button>
              </div>
              <AnimatePresence>
                {expandedSections.festivals && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: 'auto', opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    className="space-y-4 overflow-hidden"
                  >
                    {stateData[selectedState].festivals.map((festival) => (
                      <motion.div
                        key={festival.name}
                        className="p-4 bg-orange-50 rounded-lg hover:bg-orange-100 transition-colors"
                        whileHover={{ scale: 1.02 }}
                      >
                        <div className="flex items-center justify-between">
                          <h3 className="font-medium text-orange-800 text-lg flex items-center space-x-2">
                            <Star size={20} className="text-orange-600" />
                            <span>{festival.name}</span>
                          </h3>
                          <motion.button
                            whileHover={{ scale: 1.1 }}
                            whileTap={{ scale: 0.9 }}
                            onClick={() => togglePin(festival.name)}
                            className={`p-2 rounded-full transition-colors ${
                              pinnedItems.has(festival.name)
                                ? 'text-yellow-600 hover:text-yellow-800'
                                : 'text-gray-400 hover:text-gray-600'
                            }`}
                            aria-label={`${pinnedItems.has(festival.name) ? 'Unpin' : 'Pin'} ${festival.name}`}
                          >
                            <Pin
                              size={20}
                              className={pinnedItems.has(festival.name) ? 'fill-current' : ''}
                            />
                          </motion.button>
                        </div>
                        <p className="text-base text-gray-600 mt-2">{festival.period}</p>
                        <p className="text-sm text-gray-500 mt-1">{festival.description}</p>
                        <p className="text-sm text-gray-500 mt-1">{festival.location}</p>
                      </motion.div>
                    ))}
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </motion.div>
        </div>

        {Object.keys(markedDates).length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white/90 rounded-lg shadow-md p-6 backdrop-blur-sm"
          >
            <h2 className="text-xl font-semibold mb-4 text-green-800">Marked Dates</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
              {Object.entries(markedDates).map(([date, crop]) => (
                <motion.div
                  key={date}
                  className="flex justify-between items-center p-3 bg-green-50 rounded-lg hover:bg-green-100 transition-colors"
                  whileHover={{ scale: 1.02 }}
                >
                  <span className="text-gray-800 text-lg">
                    {new Date(date).toLocaleDateString()}
                  </span>
                  <span className="text-green-700 font-medium">{crop}</span>
                </motion.div>
              ))}
            </div>
          </motion.div>
        )}
      </div>

      <AnimatePresence>
        {showCalendar && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 backdrop-blur-sm"
            onClick={() => setShowCalendar(false)}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="bg-white p-6 rounded-lg shadow-xl max-w-md w-full"
              onClick={e => e.stopPropagation()}
            >
              <h3 className="text-xl font-semibold mb-4 text-green-800">
                Select Date for {selectedCrop}
              </h3>
              <Calendar
                onChange={(date) => handleDateSelect(date as Date)}
                className="rounded-lg border-none shadow-sm w-full"
                tileClassName={({ date }) => 
                  markedDates[date.toISOString()]
                    ? 'bg-green-100 rounded-full text-green-800 hover:bg-green-200'
                    : 'hover:bg-green-50'
                }
                tileSize={48}
              />
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
};

export default CropCalendar;