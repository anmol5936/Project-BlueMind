import React, { useState, useRef } from 'react';
import { AlertTriangle, Camera, Mic, X } from 'lucide-react';

interface ReportErrorState {
  issueType: string;
  description: string;
  photo: {
    file: File | null;
    preview: string | null;
  };
  isRecording: boolean;
  submitStatus: {
    message: string;
    isError: boolean;
  } | null;
}

const ReportError: React.FC = () => {
  const [state, setState] = useState<ReportErrorState>({
    issueType: '',
    description: '',
    photo: {
      file: null,
      preview: null,
    },
    isRecording: false,
    submitStatus: null,
  });

  const recognition = useRef<SpeechRecognition | null>(null);

  const initSpeechRecognition = () => {
    if ('SpeechRecognition' in window || 'webkitSpeechRecognition' in window) {
      recognition.current = new (window.SpeechRecognition || window.webkitSpeechRecognition)();
      recognition.current.continuous = true;
      recognition.current.interimResults = true;

      recognition.current.onresult = (event) => {
        const transcript = Array.from(event.results)
          .map(result => result[0].transcript)
          .join('');
        
        setState(prev => ({
          ...prev,
          description: prev.description + ' ' + transcript,
        }));
      };
    }
  };

  const handleVoiceInput = () => {
    if (!recognition.current) {
      initSpeechRecognition();
    }

    if (state.isRecording) {
      recognition.current?.stop();
    } else {
      recognition.current?.start();
    }

    setState(prev => ({ ...prev, isRecording: !prev.isRecording }));
  };

  const handlePhotoUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      setState(prev => ({
        ...prev,
        photo: {
          file,
          preview: URL.createObjectURL(file),
        },
      }));
    }
  };

  const removePhoto = () => {
    if (state.photo.preview) {
      URL.revokeObjectURL(state.photo.preview);
    }
    setState(prev => ({
      ...prev,
      photo: { file: null, preview: null },
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    const formData = new FormData();
    formData.append('issueType', state.issueType);
    formData.append('description', state.description);
    if (state.photo.file) {
      formData.append('photo', state.photo.file);
    }

    try {
      // Simulated API call
      // const response = await fetch('/api/feedback', { method: 'POST', body: formData });
      
      setState(prev => ({
        ...prev,
        submitStatus: {
          message: 'Thanks for your feedback!',
          isError: false,
        },
      }));

      setTimeout(() => {
        setState({
          issueType: '',
          description: '',
          photo: { file: null, preview: null },
          isRecording: false,
          submitStatus: null,
        });
      }, 3000);
    } catch (error) {
      setState(prev => ({
        ...prev,
        submitStatus: {
          message: 'Failed to submit report. Please try again.',
          isError: true,
        },
      }));
    }
  };

  return (
    <div 
      className="min-h-screen bg-[url('https://res.cloudinary.com/dzxgf75bh/image/upload/v1742636445/e1ec543c-9f57-472c-85b6-aceb6980328b_hedmex.jpg')] bg-cover bg-center bg-no-repeat"
    >
      <div className="min-h-screen bg-gray-900/20 py-16 px-6 sm:px-8 lg:px-12">
        <div className="bg-white/90 backdrop-blur-sm rounded-2xl shadow-lg border border-green-100 p-8 max-w-2xl mx-auto">
          <div className="flex items-center gap-4 mb-8">
            <AlertTriangle className="w-10 h-10 text-green-800" />
            <h1 className="text-3xl font-bold text-green-800">Report an Issue</h1>
          </div>

          <form onSubmit={handleSubmit} className="space-y-8">
            <div className="bg-green-50 p-6 rounded-xl border border-green-200">
              <div className="mb-6">
                <label htmlFor="issueType" className="block text-sm font-medium text-green-700 mb-2">
                  Issue Type*
                </label>
                <select
                  id="issueType"
                  value={state.issueType}
                  onChange={(e) => setState(prev => ({ ...prev, issueType: e.target.value }))}
                  className="w-full rounded-lg border-green-300 focus:ring-green-500 focus:border-green-500 py-2 px-3"
                  required
                >
                  <option value="">Select an issue type</option>
                  <option value="Error in Suggestion">Error in Suggestion</option>
                  <option value="Dissatisfied with Recommendation">Dissatisfied with Recommendation</option>
                  <option value="App Bug">App Bug</option>
                  <option value="Other">Other</option>
                </select>
              </div>

              <div className="mb-6">
                <label htmlFor="description" className="block text-sm font-medium text-green-700 mb-2">
                  Description*
                </label>
                <div className="relative">
                  <textarea
                    id="description"
                    value={state.description}
                    onChange={(e) => setState(prev => ({ ...prev, description: e.target.value }))}
                    className="w-full rounded-lg border-green-300 focus:ring-green-500 focus:border-green-500 py-3 px-4"
                    rows={5}
                    placeholder="Describe the issue, e.g., 'The drip irrigation suggestion doesn't suit my johad system'"
                    required
                  />
                  <button
                    type="button"
                    onClick={handleVoiceInput}
                    className={`absolute bottom-3 right-3 w-14 h-14 ${
                      state.isRecording ? 'bg-red-500 hover:bg-red-600' : 'bg-green-500 hover:bg-green-600'
                    } rounded-full flex items-center justify-center transition-colors`}
                  >
                    <Mic className="w-7 h-7 text-white" />
                  </button>
                </div>
              </div>

              <div className="mb-6">
                <label className="block text-sm font-medium text-green-700 mb-2">
                  Photo (optional)
                </label>
                <div className="space-y-6">
                  <label className="bg-green-100 p-4 rounded-xl flex items-center gap-3 text-green-700 hover:bg-green-200 cursor-pointer">
                    <Camera className="w-6 h-6" />
                    <span>Upload Photo</span>
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handlePhotoUpload}
                      className="hidden"
                    />
                  </label>
                  
                  {state.photo.preview && (
                    <div className="relative inline-block">
                      <img
                        src={state.photo.preview}
                        alt="Preview"
                        className="max-w-sm rounded-lg shadow-sm"
                      />
                      <button
                        type="button"
                        onClick={removePhoto}
                        className="absolute top-3 right-3 bg-red-500 rounded-full p-2 text-white hover:bg-red-600"
                      >
                        <X className="w-5 h-5" />
                      </button>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {state.submitStatus && (
              <div className={`p-5 rounded-lg ${
                state.submitStatus.isError ? 'bg-red-100 text-red-700' : 'bg-green-100 text-green-700'
              }`}>
                {state.submitStatus.message}
              </div>
            )}

            <button
              type="submit"
              className="w-full px-8 py-4 bg-green-600 text-white rounded-xl hover:bg-green-700 transition-colors font-medium text-lg"
            >
              Submit Report
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default ReportError;