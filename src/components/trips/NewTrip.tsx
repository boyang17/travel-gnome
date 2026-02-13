import { Logo } from "../Logo";
import { useState } from "react";
import { useTripsStore } from "../../stores/tripsStore";
import { useAuth } from "../../contexts/AuthContext";
import { NewTripSearcher } from "../tripDisplay/LocationSearcher";
import { useNavigate } from "react-router-dom";
import toast from "react-hot-toast";

export function NewTrip() {
  const { user } = useAuth();
  const [showSignOut, setShowSignOut] = useState(false);
  const addTrip = useTripsStore((state) => state.addTrip);
  const [destination, setDestination] = useState("");
  const [latitude, setLatitude] = useState(0);
  const [longitude, setLongitude] = useState(0);
  const navigate = useNavigate();

  if (!user) return <div>Please log in</div>;

  async function handleAddNewTrip() {
    if (!user) return;
    if (!destination) {
      toast.error("Choose a destination to start planning");
      return;
    }

    const slug = await addTrip("", "", user.id, latitude, longitude);

    if (slug) {
      navigate(`/${slug}`);
    }
  }

  return (
    <div
      className="flex flex-col items-center gap-10"
      onClick={() => setShowSignOut(false)}
    >
      <br />
      <Logo showSignOut={showSignOut} setshowSignOut={setShowSignOut} />
      <p className="font-bold text-4xl">Plan a new trip</p>
      <NewTripSearcher
        setDestination={setDestination}
        setLatitude={setLatitude}
        setLongitude={setLongitude}
      />
      <p className={`text-lg font-semibold`}>Trip to {destination || "..."}</p>
      <button
        className="bg-[#228B22] text-white px-3 py-2 rounded-4xl font-semibold cursor-pointer transition duration-200 hover:bg-[#1D771D]"
        onClick={() => handleAddNewTrip()}
      >
        Start Planning
      </button>
    </div>
  );
}
