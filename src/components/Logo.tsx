import { useAuth } from "../contexts/AuthContext";
import { ChevronDown, ChevronUp } from "lucide-react";
import { AnimatePresence, motion } from "framer-motion";
import { Link } from "react-router-dom";
import { useNavigate } from "react-router-dom";

export const Logo = ({
  showSignOut,
  setshowSignOut,
}: {
  showSignOut: boolean;
  setshowSignOut: (showSignOut: boolean) => void;
}) => {
  const { signOut } = useAuth();
  const navigate = useNavigate();

  return (
    <div
      className="flex flex-row items-center select-none"
      onClick={(e) => e.stopPropagation()}
    >
      <Link to={"/home"}>
        <img
          className="cursor-pointer"
          src="../../../public/gnome-green.png"
          alt="TravelGnome"
          width={90}
        />
      </Link>
      <Link to={"/home"}>
        <p className="cursor-pointer font-bold text-2xl text-[#228B22]">
          Travelgnome
        </p>
      </Link>
      <div className="flex flex-col relative">
        <button
          onClick={() => setshowSignOut(!showSignOut)}
          className="cursor-pointer text-[#228B22]"
        >
          <ChevronUp
            strokeWidth={3}
            className={`absolute -top-2.5 left-0 transition-opacity duration-200 ${
              showSignOut ? "opacity-100" : "opacity-0 pointer-events-none"
            }`}
          />
          <ChevronDown
            strokeWidth={3}
            className={`absolute -top-2.5 left-0 transition-opacity duration-200 ${
              showSignOut ? "opacity-0 pointer-events-none" : "opacity-100"
            }`}
          />
        </button>

        <AnimatePresence>
          {showSignOut && (
            <motion.button
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.2 }}
              className="cursor-pointer absolute top-4 -right-5 min-w-17 font-semibold text-gray-600 hover:text-black"
              onClick={() => {
                signOut();
                navigate("/", { replace: true });
              }}
            >
              Sign Out
            </motion.button>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
};

export const NewLogo = () => {
  return (
    <div className="flex flex-row items-center select-none">
      <Link to="/home">
        <img
          className="cursor-pointer"
          src="../../../public/gnome-green.png"
          alt="TravelGnome"
          width={75}
        />
      </Link>
      <Link to="/home">
        <p className="cursor-pointer font-bold text-2xl text-[#228B22]">
          Travelgnome
        </p>
      </Link>
    </div>
  );
};
