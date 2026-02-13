import type { Location } from "../../stores/locationsStore";
import { useLocationsStore } from "../../stores/locationsStore";
import { useState, useEffect, useMemo, useRef } from "react";
import { debounce } from "lodash";
import type { List } from "../../stores/listsStore";
import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { MapPin } from "./MapPin";
import { motion, AnimatePresence } from "framer-motion";
import { GripVertical, Trash2 } from "lucide-react";

export function LocationCard({
  id,
  location,
  list,
  expandLocation,
  setExpandLocation,
}: {
  id: string;
  location: Location;
  list: List;
  display_order: number;
  expandLocation: Location | null;
  setExpandLocation: (location: Location | null) => void;
}) {
  const { attributes, listeners, setNodeRef, transform, transition } =
    useSortable({ id });
  const style = {
    transition,
    transform: CSS.Translate.toString(transform),
  };
  const reorderList = useLocationsStore((state) => state.reorderList);
  const deleteLocation = useLocationsStore((state) => state.deleteLocation);
  const updateLocationNotes = useLocationsStore(
    (state) => state.updateLocationNotes,
  );
  const [notes, setNotes] = useState(location.notes);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const [showIcons, setShowIcons] = useState(false);
  const locationRef = useRef(null);

  const debouncedUpdate = useMemo(
    () =>
      debounce((notes) => {
        updateLocationNotes(location.id, notes);
      }, 500),
    [updateLocationNotes, location.id],
  );

  useEffect(() => {
    debouncedUpdate(notes);
    return () => {
      debouncedUpdate.cancel();
    };
  }, [notes, updateLocationNotes]);

  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = "auto";
      textareaRef.current.style.height =
        textareaRef.current.scrollHeight + "px";
    }
  });

  function handleClick(e: React.MouseEvent) {
    e.stopPropagation();
    deleteLocation(location.id);
    reorderList(list.id);
  }

  return (
    <div
      className="flex flex-row items-center gap-4 rounded-md cursor-pointer"
      ref={setNodeRef}
      style={style}
      onMouseEnter={() => setShowIcons(true)}
      onMouseLeave={() => setShowIcons(false)}
    >
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
      <div
        ref={locationRef}
        className="bg-[#F3F4F5] flex flex-row items-center gap-2 rounded-md p-2 w-xl"
        onClick={() =>
          setExpandLocation(
            expandLocation?.id === location.id ? null : location,
          )
        }
      >
        <MapPin
          displayOrder={location.display_order}
          color={list.color}
          icon={list.icon}
          scaleUp={false}
          showNumber={true}
        />
        <div>
          <p className="font-bold">{location.name}</p>
          <AnimatePresence>
            {expandLocation?.id === location.id && (
              <motion.div
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: "auto", opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                transition={{ duration: 0.2, ease: "easeInOut" }}
                style={{ overflow: "hidden" }}
              >
                <p className="text-sm text-gray-700 w-120 cursor-text">
                  {location.address}
                </p>
                <textarea
                  ref={textareaRef}
                  className="text-sm focus:outline-none field-sizing-content w-full resize-none"
                  placeholder="Add notes, links, etc. here"
                  value={notes}
                  onChange={(e) => {
                    setNotes(e.target.value);
                  }}
                  rows={1}
                />
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
      <button
        className={`transition duration-200 ${showIcons ? "opacity-100 cursor-pointer text-gray-500 hover:text-red-400 transition duration-200" : "opacity-0"}`}
        onClick={handleClick}
      >
        <Trash2 size={20} />
      </button>
    </div>
  );
}
