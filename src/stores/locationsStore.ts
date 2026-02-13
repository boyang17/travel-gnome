import { create } from "zustand";
import { supabase } from "../lib/supabase";

export interface Location {
  id: string;
  trip_id: string;
  name: string;
  address: string;
  latitude: number;
  longitude: number;
  notes: string;
  list_id: string;
  display_order: number;
  created_at: string;
}

interface LocationsStore {
  locations: Location[];
  loading: boolean;
  setLocations: (locations: Location[]) => void;
  fetchLocationsForTrip: (tripId: string) => Promise<void>;
  addLocation: (
    trip_id: string,
    name: string,
    address: string,
    notes: string,
    latitude: number,
    longitude: number,
    listId: string,
    display_order: number,
  ) => Promise<void>;
  updateLocationNotes: (locationId: string, notes: string) => Promise<void>;
  updateLocationListId: (locationId: string, listId: string) => Promise<void>;
  deleteLocation: (locationId: string) => Promise<void>;
  deleteLocationsForList: (listId: string) => void;
  reorderList: (listId: string) => void;
  getLocationCountForTrip: (tripId: string) => number;
}

export const useLocationsStore = create<LocationsStore>((set, get) => ({
  locations: [],
  loading: false,

  setLocations: (locations) => set({ locations }),

  fetchLocationsForTrip: async (tripId) => {
    set({ loading: true });

    const { data, error } = await supabase
      .from("locations")
      .select("*")
      .eq("trip_id", tripId);

    if (error) {
      console.error("Error fetching locations: ", error);
    } else {
      set((state) => ({
        locations: [
          ...state.locations.filter((l) => l.trip_id !== tripId),
          ...(data || []),
        ],
      }));
    }

    set({ loading: false });
  },

  addLocation: async (
    trip_id,
    name,
    address,
    notes,
    latitude,
    longitude,
    listId,
    display_order,
  ) => {
    const locationToAdd = {
      id: crypto.randomUUID(),
      trip_id: trip_id,
      name: name,
      address: address,
      notes: notes,
      latitude: latitude,
      longitude: longitude,
      list_id: listId,
      display_order: display_order,
      created_at: new Date().toISOString(),
    };

    set((state) => ({
      locations: [...state.locations, locationToAdd],
    }));

    const { data, error } = await supabase
      .from("locations")
      .insert({
        trip_id: trip_id,
        name: name,
        address: address,
        notes: notes,
        latitude: latitude,
        longitude: longitude,
        list_id: listId,
        display_order: display_order,
      })
      .select()
      .single();

    if (error) {
      console.error("Error adding location: ", error);
      set((state) => ({
        locations: state.locations.filter((l) => l.id !== locationToAdd.id),
      }));
    } else {
      set((state) => ({
        locations: state.locations.map((l) =>
          l.id === locationToAdd.id ? data : l,
        ),
      }));
    }
  },

  updateLocationNotes: async (locationId, notes) => {
    const previousLocations = get().locations;

    set((state) => ({
      locations: state.locations.map((l) =>
        l.id === locationId ? { ...l, notes } : l,
      ),
    }));

    const { error } = await supabase
      .from("locations")
      .update({ notes })
      .eq("id", locationId);

    if (error) {
      console.error("Error updating location:", error);
      set({ locations: previousLocations });
    }
  },

  updateLocationListId: async (locationId, listId) => {
    const previousLocations = get().locations;

    set((state) => ({
      locations: state.locations.map((l) =>
        l.id === locationId ? { ...l, listId } : l,
      ),
    }));

    const { error } = await supabase
      .from("locations")
      .update({ list_id: listId })
      .eq("id", locationId);

    if (error) {
      console.error("Error updating location:", error);
      set({ locations: previousLocations });
    }
  },

  deleteLocation: async (locationId) => {
    const previousLocations = get().locations;

    set((state) => ({
      locations: state.locations.filter((l) => l.id !== locationId),
    }));

    const { error } = await supabase
      .from("locations")
      .delete()
      .eq("id", locationId);

    if (error) {
      console.error("Error deleting location:", error);
      set({ locations: previousLocations });
    }
  },

  deleteLocationsForList: (listId) => {
    set({ locations: get().locations.filter((l) => l.list_id !== listId) });
  },

  reorderList: async (listId) => {
    const previousLocations = get().locations;
    let currentOrder = -1;
    let updateArray: Location[] = [];

    set((state) => ({
      locations: state.locations.map((l) => {
        if (l.list_id === listId) {
          currentOrder += 1;
          updateArray.push({
            ...l,
            display_order: currentOrder,
          });
          return { ...l, display_order: currentOrder };
        } else {
          return l;
        }
      }),
    }));

    const { error } = await supabase.from("locations").upsert(updateArray);

    if (error) {
      console.error("Error updating location:", error);
      set({ locations: previousLocations });
    }
  },

  getLocationCountForTrip: (tripId) =>
    get().locations.filter((l) => l.trip_id === tripId).length,
}));
