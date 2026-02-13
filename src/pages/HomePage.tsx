import { TripPlans } from "../components/trips/TripPlans";
import { useEffect } from "react";

export const HomePage = () => {
  useEffect(() => {
    document.title = "Travel Gnome";
  }, []);

  return <TripPlans />;
};
