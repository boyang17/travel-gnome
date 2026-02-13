import { useLocationsStore } from "../../stores/locationsStore";
import { useListsStore } from "../../stores/listsStore";
import { LocationCard } from "./LocationCard";
import { useMemo, useState, useEffect, useRef } from "react";
import type { List } from "../../stores/listsStore";
import { closestCorners, DndContext } from "@dnd-kit/core";
import {
  arrayMove,
  SortableContext,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import type { DragEndEvent, UniqueIdentifier } from "@dnd-kit/core";
import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import type { Trip } from "../../stores/tripsStore";
import { LocationSearcher } from "./LocationSearcher";
import { debounce } from "lodash";
import type { Location } from "../../stores/locationsStore";
import {
  GripVertical,
  Trash2,
  Pencil,
  Route,
  RouteOff,
  Footprints,
} from "lucide-react";
import {
  ListOrdered,
  CarFront,
  CircleParking,
  Camera,
  Ship,
  ShoppingCart,
  Utensils,
  BusFront,
  Coffee,
  Wine,
} from "lucide-react";
import { BlockPicker } from "react-color";
import { AnimatePresence, motion } from "framer-motion";
import { useClickAway } from "react-use";
import { DeleteListDialog } from "../DeleteDialog";
import type { LucideIcon } from "lucide-react";
import { MAX_ROUTING_LOCATIONS } from "../../constants/routing";

export function PlacesToVisit({
  list,
  trip,
  expandLocation,
  setExpandLocation,
  legDistances,
}: {
  list: List;
  trip: Trip;
  expandLocation: Location | null;
  setExpandLocation: (location: Location | null) => void;
  legDistances: number[];
}) {
  const locations = useLocationsStore((state) => state.locations);
  const otherlocations = locations.filter((l) => l.list_id !== list.id);
  const updateList = useListsStore((state) => state.updateList);
  const setLocations = useLocationsStore((state) => state.setLocations);
  const reorderList = useLocationsStore((state) => state.reorderList);
  const sortedLocations = useMemo(() => {
    return [...locations]
      .filter((location) => location.list_id === list.id)
      .sort((a, b) => a.display_order - b.display_order);
  }, [locations, list.id]);
  const id = list.id;
  const { attributes, listeners, setNodeRef, transform, transition } =
    useSortable({ id });
  const style = { transition, transform: CSS.Translate.toString(transform) };
  const [listName, setListName] = useState(list.name);
  const [listColor, setListColor] = useState(list.color);
  const [listIcon, setListIcon] = useState(list.icon);
  const [listRouting, setListRouting] = useState(list.routing);
  const [showIcons, setShowIcons] = useState(false);
  const customColors = [
    "#FF6467",
    "#FDC745",
    "#05DF72",
    "#51A2FF",
    "#C27AFF",
    "#FF637E",
    "#FF8904",
    "#31D492",
    "#42D3F2",
    "#A684FF",
  ];
  const iconOptions = [
    { name: "ListOrdered", icon: ListOrdered },
    { name: "Camera", icon: Camera },
    { name: "CarFront", icon: CarFront },
    { name: "CircleParking", icon: CircleParking },
    { name: "BusFront", icon: BusFront },
    { name: "Ship", icon: Ship },
    { name: "Utensils", icon: Utensils },
    { name: "ShoppingCart", icon: ShoppingCart },
    { name: "Coffee", icon: Coffee },
    { name: "Wine", icon: Wine },
  ];
  const [open, setOpen] = useState(false);
  const [showPicker, setShowPicker] = useState(false);
  const [isHovering, setIsHovering] = useState(false);
  const isMaxReached = sortedLocations.length > MAX_ROUTING_LOCATIONS;
  const pickerRef = useRef(null);
  useClickAway(pickerRef, () => setShowPicker(false));

  const debouncedUpdate = useMemo(
    () =>
      debounce((name, color, icon, routing) => {
        updateList(list.id, name, color, icon, routing);
      }, 500),
    [updateList, list.id],
  );

  useEffect(() => {
    debouncedUpdate(listName, listColor, listIcon, listRouting);
    return () => {
      debouncedUpdate.cancel();
    };
  }, [listName, listColor, listIcon, listRouting, updateList]);

  useEffect(() => {
    if (isMaxReached) {
      setListRouting(false);
    }
  }, [isMaxReached]);

  const getLocationPos = (id: UniqueIdentifier) => {
    return sortedLocations.findIndex((l) => l.id === id);
  };

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;

    if (!over || active.id === over.id) return;

    const originalPos = getLocationPos(active.id);
    const newPos = getLocationPos(over.id);

    const updatedLocations = arrayMove(
      sortedLocations,
      originalPos,
      newPos,
    ).map((l, index) => ({ ...l, display_order: index }));

    setLocations([...otherlocations, ...updatedLocations]);
    reorderList(list.id);
  };

  function Icon(name: string, icon: LucideIcon) {
    const IconComponent = icon;
    return (
      <div
        onClick={() => setListIcon(name)}
        className="cursor-pointer bg-slate-500 text-white rounded-full 
        p-2 hover:bg-slate-600 transition-all duration-200 z-10 scale-75"
      >
        <IconComponent />
      </div>
    );
  }

  function convertMetersToImperial(meters: number) {
    if (meters === undefined) {
      return "...";
    }
    if (meters < 161) {
      return `${Math.round(meters * 3.28084)} ft`;
    }
    return `${(meters / 1609.344).toFixed(2)} mi`;
  }

  function convertMetersToTime(meters: number, avgSpeed: number) {
    if (meters === undefined) {
      return "...";
    }

    const timeInMinutes = Math.round(meters / avgSpeed);

    if (timeInMinutes > 1440) {
      const totalHours = timeInMinutes / 60;
      const days = Math.floor(totalHours / 24);
      const hours = Math.floor(totalHours % 24);
      return `${days} d ${hours} hr`;
    } else if (timeInMinutes > 60 && timeInMinutes < 1440) {
      const hours = Math.floor(timeInMinutes / 60);
      const minutes = timeInMinutes - hours * 60;
      return `${hours} hr ${minutes} min`;
    } else {
      return `${timeInMinutes} min`;
    }
  }

  return (
    <div ref={setNodeRef} style={style} className="flex flex-col gap-2">
      <div
        className="flex flex-row items-center gap-4"
        onMouseEnter={() => setShowIcons(true)}
        onMouseLeave={() => setShowIcons(false)}
      >
        <div className="flex flex-row gap-4 items-center">
          <div
            className={`transiion duration-200 ${
              showIcons
                ? "opacity-100 cursor-grab active:cursor-grabbing text-gray-700"
                : "opacity-0"
            }`}
            {...attributes}
            {...listeners}
          >
            <GripVertical size={24} />
          </div>
          <input
            className="transition duration-200 hover:bg-[#F3F4F5] rounded-md p-2 font-bold text-lg focus:outline-none field-sizing-content w-2xs truncate"
            type="text"
            placeholder="Add a title"
            value={listName}
            onChange={(e) => setListName(e.target.value)}
          />
          <div ref={pickerRef} className="flex flex-col items-center relative">
            <div
              className={` bg-[#F3F4F5] p-2 rounded-4xl transition duration-200
              ${showIcons ? "opacity-100 cursor-pointer text-blue-500 hover:scale-110" : "opacity-0"}`}
              onClick={() => setShowPicker(!showPicker)}
            >
              <Pencil size={20} />
            </div>
            <AnimatePresence>
              {showPicker && (
                <motion.div
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  transition={{ duration: 0.2 }}
                  className="absolute top-full mt-4 -right-41"
                >
                  <div className="flex flex-row z-50 shadow-sm rounded-md">
                    <BlockPicker
                      color={listColor}
                      colors={customColors}
                      onChangeComplete={(color) => setListColor(color.hex)}
                      styles={{
                        default: {
                          card: {
                            boxShadow: "none",
                            borderTopRightRadius: "0",
                            borderBottomRightRadius: "0",
                          },
                        },
                      }}
                    />
                    <div
                      className=" bg-white rounded-r-md top-0 bottom-0 -right-5 z-40 w-24
                    flex flex-col items-center justify-center"
                    >
                      <div className="grid grid-cols-2 gap-y-0 gap-x-0">
                        {iconOptions.map((i) => (
                          <div key={i.name}>{Icon(i.name, i.icon)}</div>
                        ))}
                      </div>
                    </div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>
        <button
          className={`transition duration-200 bg-[#F3F4F5] p-2 rounded-4xl ${showIcons ? "opacity-100 cursor-pointer text-gray-500 hover:scale-110 transition duration-200" : "opacity-0"}`}
          onClick={() => {
            setListRouting(!listRouting);
          }}
          disabled={isMaxReached}
        >
          {isMaxReached ? (
            <div>
              <RouteOff
                className="relative"
                size={20}
                onClick={(e) => e.stopPropagation()}
                onMouseEnter={() => setIsHovering(true)}
                onMouseLeave={() => setIsHovering(false)}
              />
              {isHovering && (
                <p
                  className="absolute bottom-10 left-1/2 -translate-x-1/2
                   w-52 p-1 text-xs bg-white z-50 shadow-sm rounded-md"
                >{`Routing location limit reached (${MAX_ROUTING_LOCATIONS})`}</p>
              )}
            </div>
          ) : (
            <>
              {listRouting ? (
                <Route size={20} color="black" />
              ) : (
                <RouteOff size={20} />
              )}
            </>
          )}
        </button>
        <button
          className={`transition duration-200 bg-[#F3F4F5] p-2 rounded-4xl ${showIcons ? "opacity-100 cursor-pointer text-red-400 hover:scale-110 transition duration-200" : "opacity-0"}`}
          onClick={() => setOpen(true)}
        >
          <Trash2 size={20} />
        </button>
        {open && <DeleteListDialog listId={list.id} setOpen={setOpen} />}
      </div>
      <DndContext collisionDetection={closestCorners} onDragEnd={handleDragEnd}>
        <div className="flex flex-col gap-0">
          <SortableContext
            items={sortedLocations}
            strategy={verticalListSortingStrategy}
          >
            {sortedLocations.map((location, index) => (
              <div
                className={`flex flex-col items-center ${expandLocation?.list_id === list.id ? "gap-2 mb-2" : "mb-4"}`}
                key={location.id}
              >
                <LocationCard
                  id={location.id}
                  location={location}
                  list={list}
                  display_order={location.display_order}
                  expandLocation={expandLocation}
                  setExpandLocation={setExpandLocation}
                />
                {listRouting &&
                  expandLocation?.list_id === list.id &&
                  index < sortedLocations.length - 1 &&
                  legDistances && (
                    <div className="flex flex-row gap-1 text-sm w-xl pl-6 text-gray-700">
                      <p>
                        {`Distance: ${convertMetersToImperial(legDistances[index])}`}
                      </p>
                      {"\u00B7"}
                      <div className="flex flex-row gap-1 items-center">
                        <Footprints size={18} />
                        <p>{convertMetersToTime(legDistances[index], 83.33)}</p>
                        {"\u00B7"}
                        <CarFront size={18} />
                        <p>{convertMetersToTime(legDistances[index], 700)}</p>
                      </div>
                    </div>
                  )}
              </div>
            ))}
            <LocationSearcher trip={trip} list={list} />
          </SortableContext>
        </div>
      </DndContext>
    </div>
  );
}
