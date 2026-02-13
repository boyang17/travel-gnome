import { Link } from "react-router-dom";
import type { Trip } from "../../stores/tripsStore";
import { useLocationsStore } from "../../stores/locationsStore";
import { useState, useEffect } from "react";
import { DeleteTripDialog } from "../DeleteDialog";
import { Trash2 } from "lucide-react";

export function TripCard({ trip }: { trip: Trip }) {
  const fetchLocationsForTrip = useLocationsStore(
    (state) => state.fetchLocationsForTrip,
  );
  const count = useLocationsStore((state) =>
    state.getLocationCountForTrip(trip.id),
  );
  const [isLoaded, setIsLoaded] = useState(false);
  const [open, setOpen] = useState(false);
  const [showIcon, setShowIcon] = useState(false);

  useEffect(() => {
    fetchLocationsForTrip(trip.id).finally(() => setIsLoaded(true));
  }, [trip.id, fetchLocationsForTrip]);

  return (
    <div
      className="w-fit relative"
      onMouseOver={() => setShowIcon(true)}
      onMouseLeave={() => setShowIcon(false)}
    >
      <button
        className={`${showIcon ? "opacity-100" : "opacity-0"} cursor-pointer absolute top-2 right-2 bg-black/40 text-white hover:text-red-400
        rounded-full p-2 shadow-lg hover:bg-black/55 transition-all duration-200 z-10`}
        onClick={() => setOpen(true)}
      >
        <Trash2 size={16} />
      </button>
      {open && <DeleteTripDialog tripId={trip.id} setOpen={setOpen} />}
      <Link to={`/${trip.slug}`}>
        <div className="flex flex-col gap-1 w-fit">
          <div className="w-72 h-48">
            {trip?.trip_image_url ? (
              <img
                src={trip.trip_image_url}
                alt={trip.title}
                className=" object-cover rounded-md"
              />
            ) : (
              <div className="w-72 h-48 bg-gray-200 rounded-md"></div>
            )}
          </div>
          <h3 className="max-w-72 truncate">{trip.title}</h3>
          <p className="text-gray-600 text-sm">
            {!isLoaded ? "..." : `${count} ${count === 1 ? "place" : "places"}`}
          </p>
        </div>
      </Link>
    </div>
  );
}
