import { Link } from "react-router-dom";
import { OctagonX } from "lucide-react";
import { useEffect } from "react";

export function TripNotFoundPage() {
  useEffect(() => {
    document.title = "Trip not found";
  }, []);
  
  return (
    <div
      className="fixed left-1/2 top-1/2 transform -translate-x-1/2 -translate-y-1/2
      flex flex-col items-center gap-10"
    >
      <div className="flex flex-row items-center gap-2">
        <OctagonX size={75} className="text-red-400" />
        <p className="font-bold text-4xl">Trip Not Found</p>
      </div>
      <Link to={"/home"}>
        <button className="bg-[#228B22] text-white px-3 py-2 rounded-4xl font-semibold cursor-pointer transition duration-200 hover:bg-[#1D771D]">
          Return home
        </button>
      </Link>
    </div>
  );
}
