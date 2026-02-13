import { useTripsStore } from "../../stores/tripsStore";
import { useAuth } from "../../contexts/AuthContext";
import { useEffect, useState } from "react";
import { TripCard } from "./TripCard";
import { Plus } from "lucide-react";
import { Logo } from "../Logo";
import { Link } from "react-router-dom";

export function TripPlans() {
  const { user } = useAuth();
  const trips = useTripsStore((state) => state.trips);
  const fetchTrips = useTripsStore((state) => state.fetchTrips);
  const [showSignOut, setshowSignOut] = useState(false);

  useEffect(() => {
    if (user) {
      fetchTrips(user.id);
    }
  }, [user, fetchTrips]);

  if (!user) return <div>Please log in</div>;

  return (
    <div
      className="flex flex-col items-center gap-10"
      onClick={() => setshowSignOut(false)}
    >
      <br />
      <Logo showSignOut={showSignOut} setshowSignOut={setshowSignOut} />
      <div className="flex flex-col gap-4">
        <div className="flex flex-row items-baseline justify-between min-w-6xl">
          <p className=" font-bold text-xl">{`All Trips (${trips.length})`}</p>
          <Link to={"/plan"}>
            <button className="bg-[#228B22] text-white px-3 py-2 rounded-4xl font-semibold cursor-pointer transition duration-200 hover:bg-[#1D771D]">
              <div className="flex flex-row gap-1 pr-1">
                <Plus />
                <p>New trip</p>
              </div>
            </button>
          </Link>
        </div>
        <div className="grid grid-cols-4 gap-4">
          {trips.map((trip) => {
            return <TripCard trip={trip} key={trip.id} />;
          })}
        </div>
      </div>
    </div>
  );
}
