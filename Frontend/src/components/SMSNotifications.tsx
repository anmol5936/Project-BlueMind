import React, { useState } from 'react';
import { Phone, X, Check, Bell, AlertCircle } from 'lucide-react';
import axios from 'axios';

interface SMSNotificationsProps {
  onClose: () => void;
}

export const SMSNotifications: React.FC<SMSNotificationsProps> = ({ onClose }) => {
  const [phoneNumber, setPhoneNumber] = useState('');
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [error, setError] = useState('');
  const [notifications, setNotifications] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  const validatePhoneNumber = (number: string) => {
    const phoneRegex = /^\+[1-9]\d{1,14}$/;
    return phoneRegex.test(number);
  };

  const sendSMS = async (to: string, message: string) => {
    try {
      console.log('Attempting to send SMS to:', to);
      console.log('Message:', message);

      const response = await axios.post(
        'https://api.twilio.com/2010-04-01/Accounts/AC42dd071321a325f4b14effb0a1ead6a/Messages.json',
        new URLSearchParams({
          To: to,
          From: '+15013866602',
          Body: message
        }).toString(),
        {
          headers: {
            'Content-Type': 'application/x-www-form-urlencoded'
          },
          auth: {
            username: 'AC42dd071321a325f4b14effb50aad6a',
            password: 'f1cf82c8b173b8864cba63552bdec25'
          }
        }
      );
      
      console.log('SMS Response:', response.data);
      return response.data;
    } catch (error) {
      console.error('SMS Error:', error.response?.data || error.message);
      throw error;
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    console.log('Form submitted with phone:', phoneNumber);
    
    setError('');
    setIsLoading(true);

    if (!phoneNumber) {
      setError('Phone number is required');
      setIsLoading(false);
      return;
    }

    if (!validatePhoneNumber(phoneNumber)) {
      setError('Please enter a valid phone number (e.g., +12345678901)');
      setIsLoading(false);
      return;
    }

    try {
      const welcomeResponse = await sendSMS(
        phoneNumber,
        'Welcome to Field Forecast! You will now receive weather alerts for your crops.'
      );

      console.log('Welcome message sent:', welcomeResponse);
      setIsSubmitted(true);
      setNotifications(prev => ['Successfully subscribed to weather alerts!', ...prev]);

      // Only set up interval if initial message succeeds
      const weatherAlerts = [
        'Weather Alert: Temperature rising to 35°C tomorrow',
        'Rain expected in your area within 2 hours',
        'Soil moisture levels dropping below optimal range'
      ];

      let alertIndex = 0;
      const interval = setInterval(async () => {
        if (alertIndex < weatherAlerts.length) {
          try {
            await sendSMS(phoneNumber, weatherAlerts[alertIndex]);
            setNotifications(prev => [weatherAlerts[alertIndex], ...prev]);
            alertIndex++;
          } catch (error) {
            setError('Failed to send scheduled alert');
            clearInterval(interval);
          }
        } else {
          clearInterval(interval);
        }
      }, 60000);

      setTimeout(() => clearInterval(interval), 300000);

    } catch (error) {
      setError(error.response?.data?.message || 'Failed to send SMS. Check your Twilio credentials and phone number.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-xl p-6 max-w-md w-full mx-4 relative">
        <button
          onClick={onClose}
          className="absolute right-4 top-4 text-gray-500 hover:text-gray-700"
        >
          <X size={20} />
        </button>

        {!isSubmitted ? (
          <>
            <h2 className="text-2xl font-bold text-green-800 mb-4">
              Get Weather Updates via SMS
            </h2>
            <p className="text-gray-600 mb-6">
              Enter your phone number to receive weather alerts.
            </p>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label htmlFor="phone" className="block text-sm font-medium text-gray-700 mb-1">
                  Phone Number
                </label>
                <div className="relative">
                  <Phone className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={18} />
                  <input
                    type="tel"
                    id="phone"
                    placeholder="+12345678901"
                    value={phoneNumber}
                    onChange={(e) => setPhoneNumber(e.target.value)}
                    className={`w-full pl-10 pr-4 py-2 border ${
                      error ? 'border-red-300' : 'border-gray-300'
                    } rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent`}
                    disabled={isLoading}
                  />
                </div>
                {error && (
                  <div className="flex items-center space-x-2 text-red-500 text-sm mt-1">
                    <AlertCircle size={14} />
                    <p>{error}</p>
                  </div>
                )}
              </div>

              <button
                type="submit"
                disabled={isLoading}
                className={`w-full py-2 rounded-lg flex items-center justify-center space-x-2 transition-colors ${
                  isLoading
                    ? 'bg-green-400 cursor-not-allowed'
                    : 'bg-green-600 hover:bg-green-700'
                } text-white`}
              >
                <Bell size={18} />
                <span>{isLoading ? 'Subscribing...' : 'Subscribe to SMS Updates'}</span>
              </button>
            </form>
          </>
        ) : (
          <div className="py-4">
            <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <Check className="text-green-600" size={24} />
            </div>
            <h3 className="text-xl font-semibold text-green-800 mb-2 text-center">
              Successfully Subscribed!
            </h3>
            <p className="text-gray-600 text-center mb-6">
              You'll receive weather alerts at {phoneNumber}
            </p>

            <div className="space-y-3 max-h-60 overflow-y-auto">
              {notifications.map((msg, index) => (
                <div
                  key={index}
                  className="p-3 bg-green-50 rounded-lg border border-green-100 flex items-start space-x-3"
                >
                  <Bell size={16} className="text-green-600 mt-1" />
                  <p className="text-green-800 text-sm">{msg}</p>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};