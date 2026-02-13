import { NewLogo } from "../components/Logo";
import { Link } from "react-router-dom";
import { useEffect } from "react";

export const WelcomePage = () => {
  useEffect(() => {
    document.title = "Travel Gnome";
  }, []);

  return (
    <div className="flex flex-col items-center gap-20 pt-20">
      <div className="scale-115">
        <NewLogo />
      </div>
      <div className="flex flex-col items-center gap-8">
        <p className="font-bold text-5xl">Planning your trips starts here</p>
        <p className="text-lg text-gray-700">
          Organize places, create itineraries and map your journy - all in one
          place
        </p>
        <div className="flex flex-row gap-2 items-center">
          <Link to={"/authentication"}>
            <button
              className="bg-[#228B22] text-white px-3 py-2 rounded-4xl font-semibold 
          cursor-pointer transition duration-200 hover:bg-[#1D771D]"
            >
              Log in / Sign up
            </button>
          </Link>
          <p className="text-lg font-semibold">to start planning</p>
        </div>
      </div>
      <div className="flex flex-col gap-20">
        <div className="flex flex-row gap-10 items-center">
          <div className="w-120 h-120 ">
            <img
              src="../../public/first.png"
              alt="tokyo"
              className="w-full h-full object-cover aspect-square rounded-xl"
              style={{ objectPosition: "10%" }}
            />
          </div>
          <div className="w-lg flex flex-col gap-4">
            <p className="text-3xl font-bold">Keep everything in one place</p>
            <p>
              Store all your trip information without the clutter. Add notes to
              each location and write down tips and recommendations. Whether
              it's restaurants, hotels, or attractions, keep track of everything
              that matters for your trip.
            </p>
          </div>
        </div>
        <div className="flex flex-row gap-10 items-center">
          <div className="w-lg flex flex-col gap-4">
            <p className="text-3xl font-bold">Organize destinations visually</p>
            <p>
              Add all the places you want to go and see them on an interactive
              map. Create lists to help organize locations by day, theme, or
              priority. Drag and drop to reorder your stops, and get a clear
              overview of your entire trip in one place.
            </p>
          </div>
          <div className="w-120 h-120 ">
            <img
              src="../../public/second.png"
              alt="tokyo"
              className="w-full h-full object-cover aspect-square rounded-xl"
            />
          </div>
        </div>
        <div className="flex flex-row gap-10 items-center">
          <div className="w-120 h-120 ">
            <img
              src="../../public/third.png"
              alt="tokyo"
              className="w-full h-full object-cover aspect-square rounded-xl"
              style={{ objectPosition: "10%" }}
            />
          </div>
          <div className="w-lg flex flex-col gap-4">
            <p className="text-3xl font-bold">
              Plan your day better with routing
            </p>
            <p>
              Turn on routing to see real-time distances and estimated travel
              times between your locations. Visualize your route on the map to
              see how far apart each place are. Reorder stops with a simple drag
              and drop to optimize your path and make the most of your travel
              time.
            </p>
          </div>
        </div>
      </div>
      <br />
    </div>
  );
};
