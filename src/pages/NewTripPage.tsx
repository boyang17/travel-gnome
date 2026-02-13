import { NewTrip } from "../components/trips/NewTrip";
import { useEffect } from "react";

export const NewTripPage = () => {
  useEffect(() => {
    document.title = "New Trip";
  }, []);

  return <NewTrip />;
};
