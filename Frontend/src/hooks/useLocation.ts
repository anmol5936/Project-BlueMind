import { useState, useEffect } from "react";

interface Location {
  latitude: number;
  longitude: number;
  city?: string;
  region?: string;
  country?: string;
  address?: string; // Optional: full address string
}

// Function to get location from IP (unchanged)
async function getLocationFromIP(): Promise<Location | null> {
  try {
    const response = await fetch("https://ipapi.co/json/");
    const data = await response.json();
    if (data.error) throw new Error("IP location service error");
    return {
      latitude: parseFloat(data.latitude),
      longitude: parseFloat(data.longitude),
      city: data.city,
      region: data.region,
      country: data.country_name,
    };
  } catch (error) {
    console.error("IP location error:", error);
    return null;
  }
}

// Function to get current position (unchanged)
function getCurrentPosition(timeout = 5000): Promise<GeolocationPosition> {
  return new Promise((resolve, reject) => {
    if (!navigator.geolocation) {
      reject(new Error("Geolocation is not supported"));
      return;
    }
    const timeoutId = setTimeout(
      () => reject(new Error("Geolocation timeout")),
      timeout
    );
    navigator.geolocation.getCurrentPosition(
      (position) => {
        clearTimeout(timeoutId);
        resolve(position);
      },
      (error) => {
        clearTimeout(timeoutId);
        reject(error);
      },
      { enableHighAccuracy: true, timeout, maximumAge: 0 }
    );
  });
}

// New function for reverse geocoding
async function getLocationDetailsFromCoords(
  latitude: number,
  longitude: number
): Promise<Location> {
  try {
    const response = await fetch(
      `https://nominatim.openstreetmap.org/reverse?lat=${latitude}&lon=${longitude}&format=json`
    );
    const data = await response.json();
    if (data.error) throw new Error("Reverse geocoding error");

    const address = data.address || {};
    return {
      latitude,
      longitude,
      city: address.city || address.town || address.village || "",
      region: address.state || address.region || "",
      country: address.country || "",
      address: data.display_name || "", // Full address string
    };
  } catch (error) {
    console.error("Reverse geocoding error:", error);
    return { latitude, longitude }; // Return coords even if details fail
  }
}

export function useLocation() {
  const [location, setLocation] = useState<Location | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchLocation = async () => {
    setIsLoading(true);
    setError(null);

    try {
      // Try browser geolocation first
      const position = await getCurrentPosition();
      const { latitude, longitude } = position.coords;

      // Get detailed location info from coordinates
      const detailedLocation = await getLocationDetailsFromCoords(
        latitude,
        longitude
      );
      setLocation(detailedLocation);
    } catch (error) {
      console.error("Geolocation error:", error);

      // Fallback to IP-based location
      const ipLocation = await getLocationFromIP();
      if (ipLocation) {
        // Optionally enhance IP location with reverse geocoding
        const detailedLocation = await getLocationDetailsFromCoords(
          ipLocation.latitude,
          ipLocation.longitude
        );
        setLocation({ ...ipLocation, ...detailedLocation }); // Merge IP data with reverse geocoding
      } else {
        setError("Could not determine location");
      }
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchLocation();
  }, []);

  return { location, isLoading, error, refetch: fetchLocation };
}
