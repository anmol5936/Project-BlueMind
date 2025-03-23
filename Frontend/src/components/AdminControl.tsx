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
    <div className="absolute inset-0 bg-gradient-to-b from-emerald-600/5 to-teal-500/5" />
    <motion.div
      initial={{ y: 0 }}
      animate={{ y: [-20, 0, -20] }}
      transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
      className="absolute inset-x-0 bottom-0 h-64 bg-gradient-to-t from-emerald-500/10 to-transparent"
    />
  </div>
);

const EfficiencyMeter: React.FC<{ efficiency: number }> = ({ efficiency }) => (
  <div className="flex items-center gap-2 text-emerald-400">
    <Gauge className="animate-pulse" size={24} />
    <span className="font-semibold">Efficiency: {efficiency}%</span>
  </div>
);

const LiveClock: React.FC = () => {
  const [time, setTime] = useState(new Date());

  useEffect(() => {
    const timer = setInterval(() => setTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  return (
    <div className="flex items-center gap-2 text-emerald-400">
      <Clock size={24} />
      <span className="font-semibold">
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
          className="fixed inset-0 bg-slate-900/80 backdrop-blur-sm flex items-center justify-center z-50"
        >
          <motion.div
            initial={{ scale: 0.9, y: 20 }}
            animate={{ scale: 1, y: 0 }}
            exit={{ scale: 0.9, y: 20 }}
            className="bg-slate-800/90 backdrop-blur-lg rounded-2xl p-8 w-full max-w-md mx-4 border border-emerald-500/20 shadow-xl shadow-emerald-500/10"
          >
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-2xl font-bold text-emerald-400">Schedule Irrigation</h3>
              <button
                onClick={onClose}
                className="text-slate-400 hover:text-emerald-400 transition-colors"
                aria-label="Close modal"
              >
                <X size={24} />
              </button>
            </div>
            <div className="mb-6">
              <label htmlFor="time" className="block text-lg font-medium text-emerald-400 mb-3">
                Select Time
              </label>
              <input
                type="time"
                id="time"
                value={selectedTime}
                onChange={(e) => setSelectedTime(e.target.value)}
                className="w-full p-3 bg-slate-700/50 border border-emerald-500/20 rounded-xl text-emerald-400 focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
              />
            </div>
            <div className="flex justify-end gap-4">
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={onClose}
                className="px-6 py-3 text-slate-300 hover:text-emerald-400 rounded-xl transition-colors"
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
                className="px-6 py-3 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl shadow-lg shadow-emerald-500/20 transition-colors"
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
        background: '#1f2937',
        color: '#fff',
        border: '1px solid #059669',
      },
    });
  };

  const handleSchedule = (time: string) => {
    toast.success(`Irrigation scheduled for ${time}`, {
      icon: '📅',
      style: {
        background: '#1f2937',
        color: '#fff',
        border: '1px solid #059669',
      },
    });
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="min-h-screen bg-slate-900 relative"
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
                className="p-3 rounded-full bg-slate-800/80 backdrop-blur border border-emerald-500/20 shadow-lg"
                aria-label="Go back"
              >
                <ArrowLeft className="text-emerald-400" size={24} />
              </motion.button>
              <h1 className="text-4xl font-extrabold bg-gradient-to-r from-emerald-400 to-teal-400 bg-clip-text text-transparent">
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
            className="lg:col-span-3 bg-slate-800/80 backdrop-blur rounded-2xl p-8 border border-emerald-500/20 shadow-xl"
          >
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-bold text-emerald-400">Solar Pump Control</h2>
              <motion.div
                animate={{
                  scale: isPumpRunning ? [1, 1.2, 1] : 1,
                  opacity: isPumpRunning ? 1 : 0.5,
                }}
                transition={{ duration: 1, repeat: isPumpRunning ? Infinity : 0 }}
              >
                <Droplets className="text-emerald-400" size={32} />
              </motion.div>
            </div>
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={togglePump}
              className={`w-full py-4 px-6 rounded-xl flex items-center justify-center gap-3 text-lg font-semibold ${
                isPumpRunning
                  ? 'bg-red-500/20 text-red-400 hover:bg-red-500/30'
                  : 'bg-emerald-600/20 text-emerald-400 hover:bg-emerald-600/30'
              } backdrop-blur border border-emerald-500/20 shadow-lg transition-colors`}
              aria-label={isPumpRunning ? 'Stop pump' : 'Start pump'}
            >
              <Power size={24} />
              {isPumpRunning ? 'Stop Pump' : 'Start Pump'}
            </motion.button>
            <div className="mt-4 flex items-center justify-between text-slate-300">
              <p className="text-lg">
                Status: <span className={isPumpRunning ? 'text-emerald-400' : 'text-red-400'}>
                  {isPumpRunning ? 'Running' : 'Stopped'}
                </span>
              </p>
              {isPumpRunning && (
                <p className="text-emerald-400">
                  Water Saved: {waterSaved}L
                </p>
              )}
            </div>
          </motion.div>

          {/* Secondary Controls */}
          <motion.div
            whileHover={{ y: -5 }}
            className="bg-slate-800/80 backdrop-blur rounded-2xl p-6 border border-emerald-500/20 shadow-lg"
          >
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-semibold text-emerald-400">Irrigation Schedule</h2>
              <Calendar className="text-emerald-400" size={24} />
            </div>
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => setIsScheduleModalOpen(true)}
              className="w-full py-3 px-4 rounded-xl bg-emerald-600/20 text-emerald-400 hover:bg-emerald-600/30 backdrop-blur border border-emerald-500/20 shadow-lg transition-colors flex items-center justify-center gap-2"
              aria-label="Schedule irrigation"
            >
              <Calendar size={20} />
              Schedule Irrigation
            </motion.button>
          </motion.div>

          <motion.div
            whileHover={{ y: -5 }}
            className="bg-slate-800/80 backdrop-blur rounded-2xl p-6 border border-emerald-500/20 shadow-lg"
          >
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-semibold text-emerald-400">Irrigation Mode</h2>
              <Droplet className="text-emerald-400" size={24} />
            </div>
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => {
                setIsDripMode(!isDripMode);
                toast.success(`Switched to ${isDripMode ? 'Sprinkler' : 'Drip'} mode`, {
                  icon: '💧',
                  style: {
                    background: '#1f2937',
                    color: '#fff',
                    border: '1px solid #059669',
                  },
                });
              }}
              className={`w-full py-3 px-4 rounded-xl flex items-center justify-center gap-2 ${
                isDripMode ? 'bg-emerald-600/20' : 'bg-blue-600/20'
              } backdrop-blur border border-emerald-500/20 shadow-lg transition-colors`}
              aria-label="Toggle irrigation mode"
            >
              <Droplet size={20} />
              <span className={isDripMode ? 'text-emerald-400' : 'text-blue-400'}>
                {isDripMode ? 'Drip Mode' : 'Sprinkler Mode'}
              </span>
            </motion.button>
          </motion.div>

          <motion.div
            whileHover={{ y: -5 }}
            className="bg-slate-800/80 backdrop-blur rounded-2xl p-6 border border-emerald-500/20 shadow-lg"
          >
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-semibold text-emerald-400">Water Wastage</h2>
              <WaterOff className="text-emerald-400" size={24} />
            </div>
            <div className="text-center p-4 bg-emerald-600/20 rounded-xl border border-emerald-500/20">
              <motion.p
                initial={{ scale: 0.9, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                className="text-2xl font-bold text-emerald-400"
              >
                Reduced by 15%
              </motion.p>
              <p className="text-slate-400 mt-2">This Month</p>
            </div>
          </motion.div>
        </div>
      </div>
    </motion.div>
  );
};

export default AdminControl;