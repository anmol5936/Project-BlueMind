import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { Toaster, toast } from 'react-hot-toast';
import { Droplets, ArrowLeft, Power, Calendar, Droplet, Gauge, PointerOff as WaterOff, Clock, X } from 'lucide-react';

interface ScheduleModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSchedule: (time: string) => void;
}

const WaterWave: React.FC = () => (
  <div className="absolute inset-0 overflow-hidden pointer-events-none">
    <div className="absolute inset-0 bg-gradient-to-b from-green-200 to-emerald-100" />
    <motion.div
      initial={{ y: 0 }}
      animate={{ y: [-20, 0, -20] }}
      transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
      className="absolute inset-x-0 bottom-0 h-64 bg-gradient-to-t from-emerald-300/40 to-transparent"
    />
  </div>
);

const EfficiencyMeter: React.FC<{ efficiency: number }> = ({ efficiency }) => (
  <div className="flex items-center gap-2 text-emerald-800">
    <Gauge className="animate-pulse" size={24} />
    <span className="font-bold">Efficiency: {efficiency}%</span>
  </div>
);

const LiveClock: React.FC = () => {
  const [time, setTime] = useState(new Date());

  useEffect(() => {
    const timer = setInterval(() => setTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  return (
    <div className="flex items-center gap-2 text-emerald-800">
      <Clock size={24} />
      <span className="font-bold">
        {time.toLocaleTimeString()}
      </span>
    </div>
  );
};

const ScheduleModal: React.FC<ScheduleModalProps> = ({ isOpen, onClose, onSchedule }) => {
  const [selectedTime, setSelectedTime] = useState('08:00');

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 bg-emerald-100/90 backdrop-blur-sm flex items-center justify-center z-50"
        >
          <motion.div
            initial={{ scale: 0.9, y: 20 }}
            animate={{ scale: 1, y: 0 }}
            exit={{ scale: 0.9, y: 20 }}
            className="bg-white rounded-2xl p-8 w-full max-w-md mx-4 border border-emerald-300 shadow-xl"
          >
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-2xl font-bold text-emerald-800">Schedule Irrigation</h3>
              <button
                onClick={onClose}
                className="text-emerald-600 hover:text-emerald-800 transition-colors"
                aria-label="Close modal"
              >
                <X size={24} />
              </button>
            </div>
            <div className="mb-6">
              <label htmlFor="time" className="block text-lg font-bold text-emerald-800 mb-3">
                Select Time
              </label>
              <input
                type="time"
                id="time"
                value={selectedTime}
                onChange={(e) => setSelectedTime(e.target.value)}
                className="w-full p-3 bg-emerald-100 border border-emerald-300 rounded-xl text-emerald-800 font-bold focus:ring-2 focus:ring-emerald-600 focus:border-transparent"
              />
            </div>
            <div className="flex justify-end gap-4">
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={onClose}
                className="px-6 py-3 text-emerald-700 hover:text-emerald-800 rounded-xl transition-colors font-bold"
              >
                Cancel
              </motion.button>
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => {
                  onSchedule(selectedTime);
                  onClose();
                }}
                className="px-6 py-3 bg-emerald-700 hover:bg-emerald-600 text-white rounded-xl shadow-lg shadow-emerald-600/20 transition-colors font-bold"
              >
                Schedule
              </motion.button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

const AdminControl: React.FC = () => {
  const navigate = useNavigate();
  const [isPumpRunning, setIsPumpRunning] = useState(false);
  const [isDripMode, setIsDripMode] = useState(true);
  const [isScheduleModalOpen, setIsScheduleModalOpen] = useState(false);
  const [waterSaved, setWaterSaved] = useState(0);
  const [efficiency, setEfficiency] = useState(85);

  useEffect(() => {
    if (isPumpRunning) {
      const timer = setInterval(() => {
        setWaterSaved(prev => prev + 1);
        setEfficiency(prev => Math.min(100, prev + Math.random() * 2));
      }, 3000);
      return () => clearInterval(timer);
    }
  }, [isPumpRunning]);

  const togglePump = () => {
    setIsPumpRunning(!isPumpRunning);
    toast.success(`Pump ${isPumpRunning ? 'stopped' : 'started'} successfully!`, {
      icon: isPumpRunning ? '🔴' : '🟢',
      style: {
        background: '#fff',
        color: '#064e3b',
        border: '1px solid #047857',
      },
    });
  };

  const handleSchedule = (time: string) => {
    toast.success(`Irrigation scheduled for ${time}`, {
      icon: '📅',
      style: {
        background: '#fff',
        color: '#064e3b',
        border: '1px solid #047857',
      },
    });
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="min-h-screen bg-emerald-100 relative"
    >
      <WaterWave />
      <Toaster position="top-right" />
      <ScheduleModal
        isOpen={isScheduleModalOpen}
        onClose={() => setIsScheduleModalOpen(false)}
        onSchedule={handleSchedule}
      />

      <div className="container mx-auto px-4 py-8 relative">
        <div className="mb-12">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-4">
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => navigate('/home')}
                className="p-3 rounded-full bg-white backdrop-blur border border-emerald-300 shadow-lg"
                aria-label="Go back"
              >
                <ArrowLeft className="text-emerald-700" size={24} />
              </motion.button>
              <h1 className="text-4xl font-bold text-emerald-900">
                Admin Control
              </h1>
            </div>
            <div className="flex items-center gap-6">
              <LiveClock />
              <EfficiencyMeter efficiency={Math.round(efficiency)} />
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {/* Main Pump Control */}
          <motion.div
            whileHover={{ y: -5 }}
            className="lg:col-span-3 bg-white backdrop-blur rounded-2xl p-8 border border-emerald-300 shadow-xl"
          >
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-bold text-emerald-800">Solar Pump Control</h2>
              <motion.div
                animate={{
                  scale: isPumpRunning ? [1, 1.2, 1] : 1,
                  opacity: isPumpRunning ? 1 : 0.5,
                }}
                transition={{ duration: 1, repeat: isPumpRunning ? Infinity : 0 }}
              >
                <Droplets className="text-emerald-700" size={32} />
              </motion.div>
            </div>
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={togglePump}
              className={`w-full py-4 px-6 rounded-xl flex items-center justify-center gap-3 text-lg font-bold ${
                isPumpRunning
                  ? 'bg-red-200 text-red-700 hover:bg-red-300'
                  : 'bg-emerald-200 text-emerald-800 hover:bg-emerald-300'
              } backdrop-blur border border-emerald-300 shadow-lg transition-colors`}
              aria-label={isPumpRunning ? 'Stop pump' : 'Start pump'}
            >
              <Power size={24} />
              {isPumpRunning ? 'Stop Pump' : 'Start Pump'}
            </motion.button>
            <div className="mt-4 flex items-center justify-between text-emerald-900">
              <p className="text-lg font-bold">
                Status: <span className={isPumpRunning ? 'text-emerald-700' : 'text-red-700'}>
                  {isPumpRunning ? 'Running' : 'Stopped'}
                </span>
              </p>
              {isPumpRunning && (
                <p className="text-emerald-700 font-bold">
                  Water Saved: {waterSaved}L
                </p>
              )}
            </div>
          </motion.div>

          {/* Secondary Controls */}
          <motion.div
            whileHover={{ y: -5 }}
            className="bg-white backdrop-blur rounded-2xl p-6 border border-emerald-300 shadow-lg"
          >
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-bold text-emerald-800">Irrigation Schedule</h2>
              <Calendar className="text-emerald-700" size={24} />
            </div>
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => setIsScheduleModalOpen(true)}
              className="w-full py-3 px-4 rounded-xl bg-emerald-200 text-emerald-800 hover:bg-emerald-300 backdrop-blur border border-emerald-300 shadow-lg transition-colors flex items-center justify-center gap-2 font-bold"
              aria-label="Schedule irrigation"
            >
              <Calendar size={20} />
              Schedule Irrigation
            </motion.button>
          </motion.div>

          <motion.div
            whileHover={{ y: -5 }}
            className="bg-white backdrop-blur rounded-2xl p-6 border border-emerald-300 shadow-lg"
          >
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-bold text-emerald-800">Irrigation Mode</h2>
              <Droplet className="text-emerald-700" size={24} />
            </div>
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => {
                setIsDripMode(!isDripMode);
                toast.success(`Switched to ${isDripMode ? 'Sprinkler' : 'Drip'} mode`, {
                  icon: '💧',
                  style: {
                    background: '#fff',
                    color: '#064e3b',
                    border: '1px solid #047857',
                  },
                });
              }}
              className={`w-full py-3 px-4 rounded-xl flex items-center justify-center gap-2 font-bold ${
                isDripMode ? 'bg-emerald-200 text-emerald-800' : 'bg-blue-200 text-blue-800'
              } backdrop-blur border border-emerald-300 shadow-lg transition-colors`}
              aria-label="Toggle irrigation mode"
            >
              <Droplet size={20} />
              <span>
                {isDripMode ? 'Drip Mode' : 'Sprinkler Mode'}
              </span>
            </motion.button>
          </motion.div>

          <motion.div
            whileHover={{ y: -5 }}
            className="bg-white backdrop-blur rounded-2xl p-6 border border-emerald-300 shadow-lg"
          >
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-bold text-emerald-800">Water Wastage</h2>
              <WaterOff className="text-emerald-700" size={24} />
            </div>
            <div className="text-center p-4 bg-emerald-200 rounded-xl border border-emerald-300">
              <motion.p
                initial={{ scale: 0.9, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                className="text-2xl font-bold text-emerald-800"
              >
                Reduced by 15%
              </motion.p>
              <p className="text-emerald-700 font-bold mt-2">This Month</p>
            </div>
          </motion.div>
        </div>
      </div>
    </motion.div>
  );
};

export default AdminControl;