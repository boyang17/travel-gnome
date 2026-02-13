import { create } from "zustand";
import { supabase } from "../lib/supabase";

export interface List {
  id: string;
  trip_id: string;
  name: string;
  display_order: number;
  created_at: string;
  color: string;
  icon: string;
  routing: boolean;
}

interface ListsStore {
  lists: List[];
  loading: boolean;
  setLists: (lists: List[]) => void;
  fetchListsForTrip: (tripId: string) => Promise<void>;
  addList: (
    trip_id: string,
    name: string,
    display_order: number,
    color: string,
    icon: string,
    routing: boolean,
  ) => Promise<void>;
  updateList: (
    listId: string,
    name: string,
    color: string,
    icon: string,
    routing: boolean,
  ) => Promise<void>;
  deleteList: (listId: string) => Promise<void>;
  reorderTrip: (tripId: string) => void;
}

export const useListsStore = create<ListsStore>((set, get) => ({
  lists: [],
  loading: false,

  setLists: (lists) => set({ lists }),

  fetchListsForTrip: async (tripId) => {
    set({ loading: true });

    const { data, error } = await supabase
      .from("lists")
      .select("*")
      .eq("trip_id", tripId);

    if (error) {
      console.error("Error fetching lists: ", error);
    } else {
      set({ lists: data || [] });
    }

    set({ loading: false });
  },

  addList: async (
    trip_id,
    name,
    display_order,
    color,
    icon = "",
    routing = false,
  ) => {
    const listToAdd = {
      id: crypto.randomUUID(),
      trip_id: trip_id,
      name: name,
      display_order: display_order,
      color: color,
      icon: icon,
      routing: routing,
      created_at: new Date().toISOString(),
    };

    set((state) => ({
      lists: [...state.lists, listToAdd],
    }));

    const { data, error } = await supabase
      .from("lists")
      .insert({
        trip_id: trip_id,
        name: name,
        display_order: display_order,
        color: color,
      })
      .select()
      .single();

    if (error) {
      console.error("Error adding list: ", error);
      set((state) => ({
        lists: state.lists.filter((l) => l.id !== listToAdd.id),
      }));
    } else {
      set((state) => ({
        lists: state.lists.map((l) => (l.id === listToAdd.id ? data : l)),
      }));
    }
  },

  updateList: async (listId, name, color, icon, routing) => {
    const previousLists = get().lists;

    set((state) => ({
      lists: state.lists.map((l) =>
        l.id === listId ? { ...l, name, color, icon, routing } : l,
      ),
    }));

    const { error } = await supabase
      .from("lists")
      .update({ name, color, icon, routing })
      .eq("id", listId);

    if (error) {
      console.error("Error updating lists:", error);
      set({ lists: previousLists });
    }
  },

  deleteList: async (listId) => {
    const previousLists = get().lists;

    set((state) => ({
      lists: state.lists.filter((l) => l.id !== listId),
    }));

    const { error } = await supabase.from("lists").delete().eq("id", listId);

    if (error) {
      console.error("Error deleting lists:", error);
      set({ lists: previousLists });
    }
  },

  reorderTrip: async (tripId) => {
    const previousLists = get().lists;
    let currentOrder = -1;
    let updateArray: List[] = [];

    set((state) => ({
      lists: state.lists.map((l) => {
        if (l.trip_id === tripId) {
          currentOrder += 1;
          updateArray.push({ ...l, display_order: currentOrder });
          return { ...l, display_order: currentOrder };
        } else {
          return l;
        }
      }),
    }));

    const { error } = await supabase.from("lists").upsert(updateArray);

    if (error) {
      console.error("Error updating list:", error);
      set({ lists: previousLists });
    }
  },
}));
