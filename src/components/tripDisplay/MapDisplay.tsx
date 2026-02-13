import { Map, Marker } from "@vis.gl/react-maplibre";
import "maplibre-gl/dist/maplibre-gl.css";
import { useLocationsStore } from "../../stores/locationsStore";
import { useListsStore } from "../../stores/listsStore";
import { useState, useMemo } from "react";
import { MapPin } from "./MapPin";
import { useEffect, useRef } from "react";
import type { MapRef } from "@vis.gl/react-maplibre";
import type { Location } from "../../stores/locationsStore";
import { AnimatePresence, motion } from "framer-motion";
import {
  Listbox,
  ListboxButton,
  ListboxOption,
  ListboxOptions,
} from "@headlessui/react";
import { Sun, CirclePlus, Eclipse, Moon } from "lucide-react";
import MapLibreGlDirections from "@maplibre/maplibre-gl-directions";
import type { LayerSpecification } from "maplibre-gl";

export function MapDisplay({
  tripId,
  centerOfMap,
  expandLocation,
  setExpandLocation,
  setLegDistances,
  mapReady,
  setMapReady,
}: {
  tripId: string;
  centerOfMap: { latitude: number; longitude: number };
  expandLocation: Location | null;
  setExpandLocation: (location: Location | null) => void;
  setLegDistances: (legDistances: number[]) => void;
  mapReady: boolean;
  setMapReady: (ready: boolean) => void;
}) {
  const mapRef = useRef<MapRef>(null);
  const allLocations = useLocationsStore((state) => state.locations);
  const fetchLocationsForTrip = useLocationsStore(
    (state) => state.fetchLocationsForTrip,
  );
  const lists = useListsStore((state) => state.lists);
  const listColorsById = useMemo(
    () => Object.fromEntries(lists.map((l) => [l.id, l.color])),
    [lists],
  );
  const listIconsById = useMemo(
    () => Object.fromEntries(lists.map((l) => [l.id, l.icon])),
    [lists],
  );
  const styles = [
    { name: "dark", icon: Moon },
    { name: "fiord", icon: Eclipse },
    { name: "positron", icon: CirclePlus },
    { name: "bright", icon: Sun },
  ];
  const [mapStyle, setMapStyle] = useState(() => {
    const style = localStorage.getItem("style") || "bright";
    const config = styles.find((s) => s.name === style) || styles[3];
    return config;
  });
  const directionsRef = useRef<MapLibreGlDirections | null>(null);
  const customDirectionsLayers: LayerSpecification[] = [
    {
      id: "custom-routeline",
      type: "line" as const,
      source: "maplibre-gl-directions",
      layout: {
        "line-cap": "round" as const,
        "line-join": "round" as const,
      },
      paint: {
        "line-color": "#3B82F6",
        "line-width": 7,
      },
      filter: ["==", ["get", "route"], "SELECTED"],
    },
  ];

  const directionsLayerConfig = {
    sensitiveRoutelineLayers: ["custom-routeline"],
  };

  const moveToPin = (longitude: number, latitude: number) => {
    if (mapRef.current) {
      mapRef.current.easeTo({
        center: [longitude, latitude],
        duration: 1000,
      });
    }
  };

  const locations = useMemo(() => {
    const filtered = allLocations.filter((l) => l.trip_id === tripId);
    return filtered.sort((a, b) => {
      if (a === expandLocation) return 1;
      if (b === expandLocation) return -1;
      return 0;
    });
  }, [allLocations, tripId, expandLocation]);

  useEffect(() => {
    fetchLocationsForTrip(tripId);
  }, [tripId]);

  useEffect(() => {
    moveToPin(centerOfMap.longitude, centerOfMap.latitude);
  }, [centerOfMap, moveToPin]);

  useEffect(() => {
    const map = mapRef.current?.getMap();
    if (!map) return;

    const handleLoad = () => {
      if (!directionsRef.current) {
        const directions = new MapLibreGlDirections(map, {
          layers: customDirectionsLayers,
          ...directionsLayerConfig,
        });

        directionsRef.current = directions;
      }
    };

    if (map.isStyleLoaded()) {
      handleLoad();
    } else {
      map.once("styledata", handleLoad);
    }
  }, [mapReady]);

  useEffect(() => {
    if (!directionsRef.current) return;

    if (
      !expandLocation ||
      !lists.find((l) => l.id === expandLocation.list_id)?.routing
    ) {
      directionsRef.current.setWaypoints([]);
      setLegDistances([]);
      return;
    }

    const handleRouteEnd = (ev: any) => {
      const route = ev.data.directions?.routes?.[0];
      const legs = route.legs || [];
      const distances = legs.map((leg: any) => leg.distance);

      setLegDistances(distances);
    };

    const waypoints = allLocations
      .filter((l) => l.list_id === expandLocation.list_id)
      .sort((a, b) => a.display_order - b.display_order)
      .map((l) => [l.longitude, l.latitude] as [number, number]);

    directionsRef.current.on("fetchroutesend", handleRouteEnd);
    directionsRef.current.setWaypoints(waypoints);

    return () => {
      if (directionsRef.current) {
        directionsRef.current.off("fetchroutesend", handleRouteEnd);
      }
    };
  }, [expandLocation]);

  useEffect(() => {
    if (!directionsRef.current || !expandLocation) return;

    const map = mapRef.current?.getMap();
    if (!map) return;

    const routeColor =
      (listColorsById[expandLocation.list_id] || "#3B82F6") + "CC";

    map.setPaintProperty("custom-routeline", "line-color", routeColor);
  }, [expandLocation, listColorsById]);

  useEffect(() => {
    if (!directionsRef.current) return;
    const map = mapRef.current?.getMap();
    if (!map) return;

    directionsRef.current.clear();
    directionsRef.current = null;

    const handleStyleLoad = () => {
      const directions = new MapLibreGlDirections(map, {
        layers: customDirectionsLayers,
        ...directionsLayerConfig,
      });

      directionsRef.current = directions;
    };

    if (map.isStyleLoaded()) {
      handleStyleLoad();
    } else {
      map.once("styledata", handleStyleLoad);
    }
  }, [mapStyle]);

  function mapStyleDropdown() {
    const CurrentIcon = mapStyle.icon;
    return (
      <Listbox
        value={mapStyle}
        onChange={(mapStyle) => {
          setMapStyle(mapStyle);
          localStorage.setItem("style", mapStyle.name);
        }}
      >
        {({ open }) => (
          <motion.div
            className={`bg-white px-1 pt-1 font-medium text-sm w-fit focus:outline-none transition-all duration-200 ${open ? "rounded-b-4xl" : "rounded-4xl"}`}
            transition={{ duration: 0.2 }}
          >
            <ListboxButton className={"cursor-pointer text-blue-500"}>
              <CurrentIcon size={18} />
            </ListboxButton>
            <AnimatePresence mode="wait">
              {open && (
                <ListboxOptions
                  static
                  anchor="top"
                  as={motion.div}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: 10 }}
                  className="bg-white p-1 rounded-t-4xl font-medium text-sm w-fit focus:outline-none flex flex-col gap-1 cursor-pointer"
                >
                  {styles.map((style, index) => {
                    const Icon = style.icon;
                    if (style.name !== mapStyle.name) {
                      return (
                        <ListboxOption
                          key={`style-${index}`}
                          value={style}
                          className={`data-focus:text-blue-500 transition duration-200`}
                        >
                          <Icon size={18} />
                        </ListboxOption>
                      );
                    }
                  })}
                </ListboxOptions>
              )}
            </AnimatePresence>
          </motion.div>
        )}
      </Listbox>
    );
  }

  return (
    <div className="h-full w-full relative">
      <Map
        ref={mapRef}
        onLoad={() => {
          setMapReady(true);
        }}
        initialViewState={{
          latitude: centerOfMap.latitude,
          longitude: centerOfMap.longitude,
          zoom: 8,
        }}
        mapStyle={`https://tiles.openfreemap.org/styles/${mapStyle.name}`}
        attributionControl={false}
      >
        {locations.map((location) => (
          <Marker
            key={location.id}
            longitude={location.longitude}
            latitude={location.latitude}
            anchor="bottom"
            onClick={() => {
              setExpandLocation(location);
              moveToPin(location.longitude, location.latitude);
            }}
          >
            <MapPin
              displayOrder={location.display_order}
              color={listColorsById[location.list_id]}
              icon={listIconsById[location.list_id]}
              scaleUp={expandLocation === location}
              showNumber={false}
            />
          </Marker>
        ))}
        <div className="absolute bottom-3 right-3 cursor-pointer">
          {mapStyleDropdown()}
        </div>
        <AnimatePresence>
          {expandLocation?.id && (
            <motion.p
              key={expandLocation.id}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.4 }}
              className="absolute bottom-3 left-3 bg-white p-1 rounded font-medium text-sm"
            >
              {expandLocation.name}
            </motion.p>
          )}
        </AnimatePresence>
      </Map>
    </div>
  );
}
