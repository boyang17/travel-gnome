import { useState } from "react";
import axios from "axios";
import type { Trip } from "../../stores/tripsStore";
import { useLocationsStore } from "../../stores/locationsStore";
import type { List } from "../../stores/listsStore";
import { MapPin, Search, LoaderCircle, MapPinPlus, X } from "lucide-react";

export function LocationSearcher({ trip, list }: { trip: Trip; list: List }) {
  const [searchInput, setSearchInput] = useState("");
  const [searchResults, setSearchResults] = useState([]);
  const locations = useLocationsStore((state) => state.locations);
  const addLocation = useLocationsStore((state) => state.addLocation);
  const listOfOrders = locations
    .filter((l) => l.list_id === list.id)
    .map((l) => l.display_order);
  const nextOrder = listOfOrders.length > 0 ? Math.max(...listOfOrders) + 1 : 0;
  const [isLoading, setIsLoading] = useState(false);

  async function searchLocation() {
    setIsLoading(true);
    try {
      const response = await axios.get(
        `https://nominatim.openstreetmap.org/search?q=${searchInput.trim()}&format=jsonv2`,
      );
      setSearchResults(response.data.slice(0, 5));
    } catch (error) {
      console.log(error);
    }
    setIsLoading(false);
  }

  function formatSearchLocationsOutput(displayName: string): {
    name: string;
    address: string;
  } {
    const firstComma = displayName.indexOf(",");

    if (firstComma === -1) {
      return { name: displayName, address: "" };
    }

    return {
      name: displayName.substring(0, firstComma).trim(),
      address: displayName.substring(firstComma + 1).trim(),
    };
  }

  const handleOnEnter = (event: React.KeyboardEvent<HTMLInputElement>) => {
    if (event.key === "Enter") {
      searchLocation();
    }
  };

  function loadingOrDelete() {
    if (isLoading) {
      return (
        <LoaderCircle className="size-6 animate-spin [animation-duration:2s] -translate-y-1/2 absolute right-12 top-1/2" />
      );
    } else if (searchInput.length !== 0) {
      return (
        <button
          className="-translate-y-1/2 absolute right-12 top-1/2 cursor-pointer 
        transition duration-200 text-gray-600 hover:text-black"
          onClick={() => {
            setSearchInput("");
            setSearchResults([]);
          }}
        >
          <X size={26} />
        </button>
      );
    }
  }

  return (
    <div
      className={`ml-10 w-lg bg-[#F3F4F5] rounded-2xl px-0 ${searchResults.length === 0 ? "py-3" : "pt-3 pb-0"} `}
    >
      <div className="flex flex-row relative">
        <MapPin
          size={28}
          strokeWidth={2}
          className="-translate-y-1/2 cursor-pointer absolute left-4 top-1/2"
        />
        <input
          className="focus:outline-none w-md pl-14"
          type="text"
          placeholder="Add a place"
          value={searchInput}
          onChange={(e) => setSearchInput(e.target.value)}
          onKeyDown={handleOnEnter}
        />
        <button
          className="-translate-y-1/2 cursor-pointer absolute right-4 top-1/2 transition duration-200 text-gray-600 hover:text-black"
          onClick={searchLocation}
        >
          <Search size={22} strokeWidth={3} />
        </button>
        {loadingOrDelete()}
      </div>
      {searchResults.length > 0 && (
        <ul className="mt-2 w-lg flex flex-col">
          {searchResults &&
            searchResults.map((location) => {
              const resultDisplays = formatSearchLocationsOutput(
                location["display_name"],
              );
              return (
                <li
                  key={`result-${location["place_id"]}`}
                  className="transition duration-200 relative pl-14 p-2 cursor-pointer hover:bg-gray-200 w-lg last:rounded-b-2xl"
                  onClick={() => {
                    addLocation(
                      trip.id,
                      resultDisplays.name,
                      resultDisplays.address,
                      "",
                      Number(location["lat"]),
                      Number(location["lon"]),
                      list.id,
                      nextOrder,
                    );
                    setSearchInput("");
                    setSearchResults([]);
                  }}
                >
                  <p className="font-bold">{resultDisplays.name}</p>
                  <p className="text-sm text-gray-700 w-110">
                    {resultDisplays.address}
                  </p>
                  <MapPinPlus
                    size={28}
                    strokeWidth={2}
                    className="scale-80 -translate-y-1/2 cursor-pointer absolute left-4 top-1/2"
                  />
                </li>
              );
            })}
        </ul>
      )}
    </div>
  );
}

export function NewTripSearcher({
  setDestination,
  setLatitude,
  setLongitude,
}: {
  setDestination: (destination: string) => void;
  setLatitude: (latitude: number) => void;
  setLongitude: (longitude: number) => void;
}) {
  const [searchInput, setSearchInput] = useState("");
  const [searchResults, setSearchResults] = useState([]);
  const [isLoading, setIsLoading] = useState(false);

  async function searchLocation() {
    setIsLoading(true);
    try {
      const response = await axios.get(
        `https://nominatim.openstreetmap.org/search?q=${searchInput.trim()}&format=jsonv2`,
      );
      setSearchResults(response.data.slice(0, 5));
    } catch (error) {
      console.log(error);
    }
    setIsLoading(false);
  }

  function formatSearchLocationsOutput(displayName: string): {
    name: string;
    address: string;
  } {
    const firstComma = displayName.indexOf(",");

    if (firstComma === -1) {
      return { name: displayName, address: "" };
    }

    return {
      name: displayName.substring(0, firstComma).trim(),
      address: displayName.substring(firstComma + 1).trim(),
    };
  }

  const handleOnEnter = (event: React.KeyboardEvent<HTMLInputElement>) => {
    if (event.key === "Enter") {
      searchLocation();
    }
  };

  function loadingOrDelete() {
    if (isLoading) {
      return (
        <LoaderCircle className="size-6 animate-spin [animation-duration:2s] -translate-y-1/2 absolute right-12 top-1/2" />
      );
    } else if (searchInput.length !== 0) {
      return (
        <button
          className="-translate-y-1/2 absolute right-12 top-1/2 cursor-pointer 
        transition duration-200 text-gray-600 hover:text-black"
          onClick={() => {
            setSearchInput("");
            setSearchResults([]);
          }}
        >
          <X size={26} />
        </button>
      );
    }
  }

  return (
    <div
      className={`relative w-lg bg-[#F3F4F5] px-0 ${searchResults.length === 0 ? "py-3 rounded-2xl" : "pt-3 pb-3 rounded-t-2xl"} `}
    >
      <div className="flex flex-row relative">
        <MapPin
          size={28}
          strokeWidth={2}
          className="-translate-y-1/2 cursor-pointer absolute left-4 top-1/2"
        />
        <input
          className="focus:outline-none w-md pl-14 h-10"
          type="text"
          placeholder="Add a place"
          value={searchInput}
          onChange={(e) => setSearchInput(e.target.value)}
          onKeyDown={handleOnEnter}
        />
        <button
          className="-translate-y-1/2 cursor-pointer absolute right-4 top-1/2 transition duration-200 text-gray-600 hover:text-black"
          onClick={searchLocation}
        >
          <Search size={22} strokeWidth={3} />
        </button>
        {loadingOrDelete()}
      </div>
      {searchResults.length > 0 && (
        <ul className="absolute z-10 w-full flex flex-col bg-[#F3F4F5] rounded-b-2xl">
          {searchResults &&
            searchResults.map((location) => {
              const resultDisplays = formatSearchLocationsOutput(
                location["display_name"],
              );
              return (
                <li
                  key={`result-${location["place_id"]}`}
                  className="transition duration-200 relative pl-14 p-2 cursor-pointer hover:bg-gray-200 w-lg last:rounded-b-2xl"
                  onClick={() => {
                    setDestination(resultDisplays.name);
                    setLatitude(Number(location["lat"]));
                    setLongitude(Number(location["lon"]));
                    setSearchInput("");
                    setSearchResults([]);
                  }}
                >
                  <p className="font-bold">{resultDisplays.name}</p>
                  <p className="text-sm text-gray-700 w-110">
                    {resultDisplays.address}
                  </p>
                  <MapPinPlus
                    size={28}
                    strokeWidth={2}
                    className="scale-80 -translate-y-1/2 cursor-pointer absolute left-4 top-1/2"
                  />
                </li>
              );
            })}
        </ul>
      )}
    </div>
  );
}
