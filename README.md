# BLUEMIND Project Documentation

## Project Overview

BLUEMIND is an innovative project aimed at helping rural farmers adopt water conservation technologies by blending AI with culturally sensitive approaches. It addresses cultural resistance by respecting traditional practices while introducing modern methods, targeting areas where skepticism about external solutions is common.

## Setup and Usage

To set up, clone the repository from GitHub, install dependencies for the frontend (React), backend (Express), and AI model (Flask), and configure environment variables like Twilio and MongoDB credentials. Run each component separately, using ngrok for local Twilio testing. Usage involves registering via WhatsApp, chatting with the AI, and accessing a cultural database for local water practices.

## Additional Details

An unexpected aspect is the festive-themed crop calendar, which maps water allocation to traditional customs, enhancing community engagement and conservation efforts.

## Comprehensive Project Documentation for BLUEMIND GitHub Repository

### Introduction

The BLUEMIND project is a sophisticated initiative aimed at improving water conservation in rural farming communities. This documentation provides an exhaustive overview for creating a complete README file for the GitHub repository, encompassing frontend, backend, and AI model components. Given the project's focus on integrating AI with cultural practices and its use of Twilio for WhatsApp communication, the README is comprehensive, user-friendly, and suitable for developers, contributors, and end-users.

### Project Overview

BLUEMIND is designed to address the slow adoption of water conservation technologies among farmers in rural areas, where cultural beliefs, traditions, and skepticism about modern solutions hinder progress. The primary objective is to leverage AI to overcome cultural resistance by fostering awareness, engagement, and personalized solutions tailored to different rural communities. The project aims to bridge the gap between technology and tradition, ensuring that sustainable water management solutions are embraced rather than resisted.

The project's core mission is to overcome cultural barriers, promote modern water-saving techniques, and integrate AI-driven insights with human-centered strategies. This dual approach ensures that farmers can maintain their traditional practices while adopting efficient, sustainable methods, ultimately enhancing water conservation efforts.

### Features and Functionality

BLUEMIND offers a rich set of features to assist farmers, particularly in water conservation and farming practices:

- **Voice Assistant**: Utilizes a fine-tuned pipeline with aixplain models, including Automatic Speech Recognition (ASR), Named Entity Recognition (NER), and Text-to-Intent Systems (TIS), for voice-based interactions.

- **Recommender System**: Based on conversational data stored in a database, it recommends modern water conservation techniques over traditional ones, highlighting efficiency improvements.

- **Irrigation Planner**: Provides detailed plans for crop growth, efficient water conservation techniques, and scheduling, considering factors like location, crop type, growth stage, and weather forecasts.

- **Weather and Soil Health Analysis**: Offers real-time data on weather and soil health based on location and time.

- **Crop Calendar**: Assists farmers in setting sowing and harvesting schedules, featuring a festive-themed calendar that maps water allocation, sowing, and harvesting periods.

- **Farm Overview**: Provides a dashboard overview of the farmer's farm, aiding decision-making by consolidating key metrics and data.

- **Report Issue**: Allows farmers to report farm-related issues, ensuring support and troubleshooting are readily available.

- **Low Connectivity Integration**: Leverages Twilio's low-bandwidth services to ensure functionality in areas with poor network coverage.

### Technical Architecture

The technical architecture of BLUEMIND includes several key components:

#### Components

| Component | Description |
|-----------|-------------|
| Frontend | Built with React.js, Tailwind CSS for styling, and React Router for navigation. Includes WebRTC for voice capture, PWA for offline support, and React Native for mobile apps. |
| Backend | Uses Node.js with Express.js, MongoDB for data storage, Pinecone for vector database, Twilio for SMS, and Socket.IO for real-time updates. |
| AI Models | Includes voice assistant pipeline with ASR, NER, and TIS from aixplain, LLM (Llama 3.3) for natural language processing, and recommender system using Langchain for workflows. |

#### Directory Structure

**Frontend:**
- `/public`: Assets and index.html
- `/src/components`: Includes Dashboard, VoiceAssistant, CropCalendar, etc.
- `/src/pages`: Includes Home.jsx, Login.jsx, etc.
- `/src/context`: Auth and farm contexts
- `/src/services`: API and voice service utilities
- `/src/utils`: Weather and crop utilities

**Backend:**
- `/src/api`: Controllers, middleware, routes, and models
- `/src/services`: Voice processing, recommendation, weather, irrigation, and SMS services
- `/src/utils`: Database connection, logging, and helpers
- `/src/config`: Environment and CORS configurations

**AI Models:**
- `/voice-assistant`: ASR, LLM, TTS, and NER models
- `/recommender`: Training and inference scripts
- `/irrigation-planner`: Scheduler and weather integration
- `/data-pipeline`: Data ingestion, processing, and storage

### Setup Instructions

To set up the BLUEMIND project for development or deployment, follow these steps:

1. **Clone the Repository:**
   ```bash
   git clone https://github.com/team-astatine/bluemind.git
   cd bluemind
   ```

2. **Install Dependencies:**
   - Backend:
     ```bash
     cd backend
     npm install express cors mongoose twilio axios ws
     ```
   - Frontend:
     ```bash
     cd ../frontend
     npm install react axios lucide-react
     ```
   - AI Models:
     ```bash
     cd ../models
     pip install -r requirements.txt
     ```

3. **Configure Environment Variables:**
   Create a `.env` file in the backend directory with:
   ```
    MONGO_URI=your-mongodb-uri
    TWILIO_ACCOUNT_SID=your-account-sid
    TWILIO_AUTH_TOKEN=your-auth-token
    TWILIO_PHONE_NUMBER=whatsapp:+XXXXXXXXXX
    AIXPLAIN_API_KEY=your-api-key
    OPENMAP_API_KEY=your-openmap-api-key
    WEATHERBIT_API_KEY=your-weatherbit-api-key
    AGROMONITORING_API_KEY=your-agromonitoring-api-key
    CLOUDINARY_CLOUD_NAME=your-cloudinary-cloud-name
    CLOUDINARY_API_KEY=your-cloudinary-api-key
    CLOUDINARY_API_SECRET=your-cloudinary-api-secret

   ```

4. **Run the Application:**
   - AI Models:
     ```bash
     cd models
     python app.py
     ```
   - Backend:
     ```bash
     cd ../backend
     node index.js
     ```
   - Frontend:
     ```bash
     cd ../frontend
     npm start
     ```

5. **Twilio Configuration for Local Testing:**
   - Use ngrok:
     ```bash
     ngrok http 3000
     ```
   - Set the ngrok URL as webhook in Twilio Console
   - Join WhatsApp Sandbox: Send "join government-water" to +14155238886

### Usage

To use BLUEMIND, follow these steps:

1. **Registration**: Open the frontend, enter your phone number, and click "Start Chatting".
2. **Chatting**: Send messages to XXXXXXXX on WhatsApp and receive AI-driven responses.
3. **Cultural Database**: Access the CulturalDatabase component to view water-related festivals and practices by locality.
4. **Low Connectivity**: Features remain accessible through Twilio's low-bandwidth services.

### Future Improvements

The project has identified several areas for future enhancement:

- **IoT Implementation for Admin Control**: Expanding IoT capabilities for real-time monitoring of soil moisture, weather conditions, and water levels.
- **AR Integration**: Visualization tools for irrigation coverage and waste identification, real-time AR tutorials for equipment setup.
- **Community Features**: Platform for farmers to share local conservation practices, multilingual support, and region-specific resources.

### Contributors

- **Team Members**: 
  - Soham Samal (Group Leader) - ML and AI Developer
  - Anmol Mangaraj - Fullstack Web Developer, Cybersecurity Developer
  - Swadhin Nayak - Blockchain Developer, Fullstack Web Developer
  - Bibhusundar Mohapatra - Computer Vision
