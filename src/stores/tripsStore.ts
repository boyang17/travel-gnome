import { create } from "zustand";
import { supabase } from "../lib/supabase";
import { nanoid } from "nanoid";

export interface Trip {
  id: string;
  user_id: string;
  title: string;
  notes: string;
  slug: string;
  created_at: string;
  trip_image_url: string;
  latitude: number;
  longitude: number;
}

interface TripsStore {
  trips: Trip[];
  loading: boolean;
  getTripBySlug: (slug: string) => Trip | undefined;
  fetchTrips: (userId: string) => Promise<void>;
  addTrip: (
    title: string,
    notes: string,
    userId: string,
    latitude: number,
    longitude: number,
  ) => Promise<string | null>;
  updateTrip: (tripId: string, title: string, notes: string) => Promise<void>;
  deleteTrip: (tripId: string) => Promise<void>;
  updateTripImage: (tripId: string, imageFile: File) => Promise<void>;
}

export const useTripsStore = create<TripsStore>((set, get) => ({
  trips: [],
  loading: false,

  getTripBySlug: (slug) => get().trips.find((trip) => trip.slug === slug),

  fetchTrips: async (userId) => {
    set({ loading: true });

    const { data, error } = await supabase
      .from("trips")
      .select("*")
      .eq("user_id", userId)
      .order("created_at", { ascending: false });

    if (error) {
      console.error("Error fetching trips: ", error);
    } else {
      set({ trips: data || [] });
    }

    set({ loading: false });
  },

  addTrip: async (title, notes, userId, latitude, longitude) => {
    const slug = nanoid(10);
    const tripToAdd = {
      id: crypto.randomUUID(),
      user_id: userId,
      title: title,
      notes: notes,
      slug: slug,
      trip_image_url: "",
      latitude: latitude,
      longitude: longitude,
      created_at: new Date().toISOString(),
    };

    set((state) => ({
      trips: [...state.trips, tripToAdd],
    }));

    const { data, error } = await supabase
      .from("trips")
      .insert({
        user_id: userId,
        title: title,
        notes: notes,
        slug: slug,
        trip_image_url: "",
        latitude: latitude,
        longitude: longitude,
      })
      .select()
      .single();

    if (error) {
      console.error("Error adding trip:", error);
      set((state) => ({
        trips: state.trips.filter((t) => t.id !== tripToAdd.id),
      }));
      return null;
    } else {
      set((state) => ({
        trips: state.trips.map((t) => (t.id === tripToAdd.id ? data : t)),
      }));
      return slug;
    }
  },

  updateTrip: async (tripId, title, notes) => {
    const previousTrips = get().trips;

    set((state) => ({
      trips: state.trips.map((t) =>
        t.id === tripId ? { ...t, title, notes } : t,
      ),
    }));

    const { error } = await supabase
      .from("trips")
      .update({ title, notes, created_at: new Date().toISOString() })
      .eq("id", tripId);

    if (error) {
      console.error("Error updating trip:", error);
      set({ trips: previousTrips });
    }
  },

  deleteTrip: async (tripId) => {
    const previousTrips = get().trips;
    const trip = previousTrips.find((t) => t.id === tripId);

    set((state) => ({
      trips: state.trips.filter((t) => t.id !== tripId),
    }));

    try {
      if (trip?.trip_image_url) {
        const filePath = trip.trip_image_url.split("/TripImage/")[1];
        await supabase.storage.from("TripImage").remove([filePath]);
      }

      const { error } = await supabase.from("trips").delete().eq("id", tripId);

      if (error) throw error;
    } catch (error) {
      console.error("Error deleting trip:", error);
      set({ trips: previousTrips });
    }
  },

  updateTripImage: async (tripId, imageFile) => {
    const trip = get().trips.find((t) => t.id === tripId);
    if (!trip) return;
    const previousTrips = get().trips;

    try {
      const fileExt = imageFile.name.split(".").pop();
      const filePath = `${tripId}/trip-image.${fileExt}`;

      const { error: uploadError } = await supabase.storage
        .from("TripImage")
        .upload(filePath, imageFile, {
          contentType: imageFile.type,
          upsert: true,
          cacheControl: "0",
        });

      if (uploadError) throw uploadError;

      const {
        data: { publicUrl },
      } = supabase.storage.from("TripImage").getPublicUrl(filePath);

      const urlWithCacheBust = `${publicUrl}?t=${Date.now()}`;

      const { error: dbError } = await supabase
        .from("trips")
        .update({ trip_image_url: urlWithCacheBust })
        .eq("id", tripId);

      if (dbError) throw dbError;

      set((state) => ({
        trips: state.trips.map((t) =>
          t.id === tripId
            ? {
                ...t,
                trip_image_url: urlWithCacheBust,
              }
            : t,
        ),
      }));
    } catch (error) {
      console.error("Error updating trip image:", error);
      set({ trips: previousTrips });
    }
  },
}));
