import { useAuth } from "../contexts/AuthContext";
import { PlacesToVisit } from "../components/tripDisplay/PlacesToVisit";
import { MapDisplay } from "../components/tripDisplay/MapDisplay";
import { useParams } from "react-router-dom";
import { useTripsStore } from "../stores/tripsStore";
import { useLocationsStore } from "../stores/locationsStore";
import { debounce } from "lodash";
import { useState, useEffect, useMemo, useRef } from "react";
import { useListsStore } from "../stores/listsStore";
import { closestCorners, DndContext } from "@dnd-kit/core";
import {
  arrayMove,
  SortableContext,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import type { DragEndEvent, UniqueIdentifier } from "@dnd-kit/core";
import type { Location } from "../stores/locationsStore";
import {
  Plus,
  Camera,
  ArrowLeft,
  Trash2,
  LoaderCircle,
  ChevronUp,
  ChevronDown,
} from "lucide-react";
import { Link } from "react-router-dom";
import { DeleteTripDialog } from "../components/DeleteDialog";
import { useNavigate } from "react-router-dom";

export const TripDisplayPage = () => {
  const { user } = useAuth();
  const { slug } = useParams<{ slug: string }>();
  const trips = useTripsStore((state) => state.trips);
  const updateTrip = useTripsStore((state) => state.updateTrip);
  const getTripBySlug = useTripsStore((state) => state.getTripBySlug);
  const fetchTrips = useTripsStore((state) => state.fetchTrips);
  const updateTripImage = useTripsStore((state) => state.updateTripImage);
  const fetchLocationsForTrip = useLocationsStore(
    (state) => state.fetchLocationsForTrip,
  );
  const lists = useListsStore((state) => state.lists);
  const setLists = useListsStore((state) => state.setLists);
  const fetchListsForTrip = useListsStore((state) => state.fetchListsForTrip);
  const addList = useListsStore((state) => state.addList);
  const reorderTrip = useListsStore((state) => state.reorderTrip);
  const [title, setTitle] = useState("");
  const [notes, setNotes] = useState("");
  const sortedLists = useMemo(() => {
    return [...lists].sort((a, b) => a.display_order - b.display_order);
  }, [lists]);
  const [expandLocation, setExpandLocation] = useState<Location | null>(null);
  const [centerOfMap, setCenterOfMap] = useState({
    latitude: 0,
    longitude: 0,
  });
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [open, setOpen] = useState(false);
  const [showIcon, setShowIcon] = useState(false);
  const navigate = useNavigate();
  const [notesExpanded, setNotesExpanded] = useState(false);
  const [legDistances, setLegDistances] = useState<number[]>([]);
  const [mapReady, setMapReady] = useState(false);
  const [showPage, setShowPage] = useState(false);

  if (!user) return <p>Please sign in</p>;

  useEffect(() => {
    if (user && trips.length === 0) {
      fetchTrips(user.id);
    }
  }, [user, trips.length]);

  useEffect(() => {
    if (mapReady) {
      setTimeout(() => {
        setShowPage(true);
      }, 2000);
    }
  }, [mapReady]);

  useEffect(() => {
    if (expandLocation) {
      setCenterOfMap({
        latitude: expandLocation.latitude,
        longitude: expandLocation.longitude,
      });
    }
  }, [expandLocation]);

  const trip = slug ? getTripBySlug(slug) : undefined;

  useEffect(() => {
    if (trip) {
      setTitle(trip.title);
      setNotes(trip.notes);
      setCenterOfMap({ latitude: trip.latitude, longitude: trip.longitude });
      document.title = trip.title;
    }
  }, [trip]);

  const debouncedUpdate = useMemo(() => {
    if (!trip) return null;
    return debounce(
      (title: string, notes: string) => updateTrip(trip.id, title, notes),
      500,
    );
  }, [updateTrip, trip?.id]);

  useEffect(() => {
    if (!debouncedUpdate) return;
    debouncedUpdate(title, notes);
    return () => debouncedUpdate.cancel();
  }, [title, notes, debouncedUpdate]);

  useEffect(() => {
    if (!trip) return;
    fetchListsForTrip(trip.id);
    fetchLocationsForTrip(trip.id);
  }, [trip, fetchLocationsForTrip]);

  if (!slug) navigate("/error");

  if (trips.length === 0)
    return (
      <div className="fixed left-1/2 top-1/2 transform -translate-x-1/2 -translate-y-1/2">
        <div className="flex flex-row gap-2 items-center">
          <LoaderCircle
            size={60}
            className=" animate-spin [animation-duration:2s]"
          />
          <p className="font-bold text-4xl">Loading...</p>
        </div>
      </div>
    );

  if (!trip) {
    navigate("/error");
    return;
  }

  const otherLists = lists.filter((l) => l.trip_id !== trip.id);

  const getListPos = (id: UniqueIdentifier) => {
    return lists.findIndex((l) => l.id === id);
  };

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;

    if (!over || active.id === over.id) return;

    const originalPos = getListPos(active.id);
    const newPos = getListPos(over.id);

    const updatedLists = arrayMove(sortedLists, originalPos, newPos).map(
      (l, index) => ({
        ...l,
        display_order: index,
      }),
    );

    setLists([...otherLists, ...updatedLists]);
    reorderTrip(trip.id);
  };

  const tripofOrders = lists
    .filter((l) => l.trip_id === trip.id)
    .map((l) => l.display_order);
  const nextOrder = tripofOrders.length > 0 ? Math.max(...tripofOrders) + 1 : 0;

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      await updateTripImage(trip.id, file);
      await fetchTrips(user.id);
    }
  };

  return (
    <div className="flex h-screen">
      {!showPage && (
        <div className="fixed inset-0 z-50 bg-white flex items-center justify-center">
          <div className="flex flex-row gap-2 items-center">
            <LoaderCircle
              size={60}
              className=" animate-spin [animation-duration:2s]"
            />
            <p className="font-bold text-4xl">Loading...</p>
          </div>
        </div>
      )}
      <div className="flex flex-col gap-4 pl-6 pr-8 w-177 py-4 overflow-x-hidden overflow-y-auto no-scrollbar">
        <div className="flex flex-col gap-10 pl-10">
          <div
            className="relative -ml-10 -mr-14 -mt-4"
            onMouseEnter={() => setShowIcon(true)}
            onMouseLeave={() => setShowIcon(false)}
          >
            <input
              ref={fileInputRef}
              className="hidden"
              type="file"
              accept="image/*"
              onChange={handleImageUpload}
            />
            <div
              className={`${showIcon ? "opacity-100" : "opacity-0"}  transition-all duration-200 `}
            >
              <button
                onClick={() => fileInputRef.current?.click()}
                className="cursor-pointer absolute top-2 right-9 bg-black/40 text-white rounded-full p-2 shadow-lg hover:bg-black/55 transition duration-200 z-10"
              >
                <Camera size={20} />
              </button>
              <Link to={`/home`}>
                <button className="cursor-pointer absolute top-2 -left-3 bg-black/40 text-white rounded-full p-2 shadow-lg hover:bg-black/55 transition duration-200 z-10">
                  <ArrowLeft size={20} strokeWidth={3} />
                </button>
              </Link>
              <button
                className={`cursor-pointer absolute top-2 right-20 bg-black/40 text-white hover:text-red-400
                  rounded-full p-2 shadow-lg hover:bg-black/55 transition-all duration-200 z-10`}
                onClick={() => setOpen(true)}
              >
                <Trash2 size={20} />
              </button>
            </div>
            {open && <DeleteTripDialog tripId={trip.id} setOpen={setOpen} />}
            {trip?.trip_image_url ? (
              <img
                src={trip.trip_image_url}
                alt=""
                className="w-full h-85 object-cover -ml-6"
              />
            ) : (
              <div className="w-full h-85 bg-gray-200 flex items-center justify-center -ml-6"></div>
            )}
            <input
              className="absolute -bottom-12 left-1/2 -translate-x-1/2 -translate-y-1/2 font-bold text-2xl bg-white shadow-lg text-center
              transition duration-200 hover:bg-[#F3F4F5] rounded-md p-2 focus:outline-none field-sizing-content w-sm truncate"
              type="text"
              placeholder="Enter a trip name"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
            />
          </div>
          <div className="flex flex-col gap-2">
            <div className="flex flex-row justify-between items-center pl-2">
              <p className="font-bold text-lg">Notes</p>
              <button
                onClick={() => setNotesExpanded(!notesExpanded)}
                className="text-sm text-gray-600 hover:text-gray-800 relative cursor-pointer"
              >
                <ChevronUp
                  strokeWidth={3}
                  className={`absolute inset-0 -left-16 -top-2 transition-opacity duration-200 ${
                    notesExpanded
                      ? "opacity-100"
                      : "opacity-0 pointer-events-none"
                  }`}
                />
                <ChevronDown
                  strokeWidth={3}
                  className={`absolute inset-0 -left-16 -top-2 transition-opacity duration-200 ${
                    notesExpanded
                      ? "opacity-0 pointer-events-none"
                      : "opacity-100"
                  }`}
                />
              </button>
            </div>
            <textarea
              className={`bg-[#F3F4F5] text-sm w-xl p-3 rounded-md focus:outline-none 
                resize-none transition-all duration-200 no-scrollbar ${
                  notesExpanded ? "h-96" : "h-24"
                }`}
              placeholder="Write or paste anything here: how to get around, tips and tricks"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
            />
          </div>
        </div>
        <div className="flex flex-col gap-6">
          <div className="flex flex-row gap-5">
            <DndContext
              collisionDetection={closestCorners}
              onDragEnd={handleDragEnd}
            >
              <div className="flex flex-col gap-4">
                <SortableContext
                  items={sortedLists}
                  strategy={verticalListSortingStrategy}
                >
                  {sortedLists.map((list) => {
                    return (
                      <div key={list.id}>
                        <PlacesToVisit
                          list={list}
                          trip={trip}
                          expandLocation={
                            expandLocation ? expandLocation : null
                          }
                          setExpandLocation={setExpandLocation}
                          legDistances={legDistances}
                        />
                      </div>
                    );
                  })}
                </SortableContext>
              </div>
            </DndContext>
          </div>
          <div className="ml-10">
            <button
              className="bg-[#228B22] text-white px-3 py-2 rounded-4xl font-semibold cursor-pointer transition duration-200 hover:bg-[#1D771D]"
              onClick={() =>
                addList(trip.id, "", nextOrder, "#D9E3F0", "", false)
              }
            >
              <div className="flex flex-row gap-1 pr-1">
                <Plus />
                <p>New list</p>
              </div>
            </button>
          </div>
        </div>
      </div>
      <div className=" top-0 h-screen flex-1 will-change-transform">
        <MapDisplay
          key={trip.id}
          tripId={trip.id}
          centerOfMap={centerOfMap}
          expandLocation={expandLocation}
          setExpandLocation={setExpandLocation}
          setLegDistances={setLegDistances}
          mapReady={mapReady}
          setMapReady={setMapReady}
        />
      </div>
    </div>
  );
};
