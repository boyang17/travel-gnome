import { useTripsStore } from "../stores/tripsStore";
import { useListsStore } from "../stores/listsStore";
import { useLocationsStore } from "../stores/locationsStore";
import { useNavigate } from "react-router-dom";

export function DeleteTripDialog({
  tripId,
  setOpen,
}: {
  tripId: string;
  setOpen: (open: boolean) => void;
}) {
  const deleteTrip = useTripsStore((state) => state.deleteTrip);
  const navigate = useNavigate();

  return (
    <div
      className="fixed inset-0 z-40 bg-black/50 flex items-center justify-center"
      onClick={() => setOpen(false)}
    >
      <div
        className="fixed left-1/2 top-1/2 transform -translate-x-1/2 -translate-y-1/2
        flex flex-col gap-6 w-sm
     bg-white z-50 shadow-xl rounded-2xl py-4 px-6 max-w-xl"
        onClick={(e) => e.stopPropagation()}
      >
        <p className="font-bold text-lg">Delete</p>
        <p className="pb-2">
          Are you sure you want to delete this trip plan? This action is not
          reversible!
        </p>
        <div className="flex flex-row justify-between ">
          <button
            className="transition duration-200 cursor-pointer px-4 py-3 rounded-4xl text-sm font-bold bg-[#E9ECEF] hover:bg-black/15"
            onClick={() => setOpen(false)}
          >
            No, don't delete
          </button>
          <button
            className="transition duration-200 text-white cursor-pointer px-4 py-3 rounded-4xl text-sm font-bold bg-red-400 hover:bg-red-500/90"
            onClick={async () => {
              await deleteTrip(tripId);
              navigate("/home", { replace: true });
              setOpen(false);
            }}
          >
            Yes, delete it
          </button>
        </div>
      </div>
    </div>
  );
}

export function DeleteListDialog({
  listId,
  setOpen,
}: {
  listId: string;
  setOpen: (open: boolean) => void;
}) {
  const deleteList = useListsStore((state) => state.deleteList);
  const deleteLocationsForList = useLocationsStore(
    (state) => state.deleteLocationsForList,
  );
  const reorderTrip = useListsStore((state) => state.reorderTrip);

  return (
    <div
      className="fixed inset-0 z-40 bg-black/50 flex items-center justify-center"
      onClick={() => setOpen(false)}
    >
      <div
        className="fixed left-1/2 top-1/2 transform -translate-x-1/2 -translate-y-1/2
        flex flex-col gap-6 w-sm
     bg-white z-50 shadow-xl rounded-2xl py-4 px-6 max-w-xl"
        onClick={(e) => e.stopPropagation()}
      >
        <p className="font-bold text-lg">Delete</p>
        <p className="pb-2">Do you want to delete this list?</p>
        <div className="flex flex-row justify-between ">
          <button
            className="transition duration-200 cursor-pointer px-4 py-3 rounded-4xl text-sm font-bold bg-[#E9ECEF] hover:bg-black/15"
            onClick={() => setOpen(false)}
          >
            No, don't delete
          </button>
          <button
            className="transition duration-200 text-white cursor-pointer px-4 py-3 rounded-4xl text-sm font-bold bg-red-400 hover:bg-red-500/90"
            onClick={() => {
              deleteList(listId);
              deleteLocationsForList(listId);
              reorderTrip(listId);
              setOpen(false);
            }}
          >
            Yes, delete it
          </button>
        </div>
      </div>
    </div>
  );
}
