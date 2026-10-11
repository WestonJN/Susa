import { useEffect, useRef } from "react";
import { getVehicle, itemGroups, recommendLoad } from "../../lib/catalog";
import { Button, Counter } from "../ui";

export function LoadAssistant({
  open,
  items,
  onItems,
  onApply,
  onClose,
}: {
  open: boolean;
  items: Record<string, number>;
  onItems: (next: Record<string, number>) => void;
  onApply: (rec: ReturnType<typeof recommendLoad>) => void;
  onClose: () => void;
}) {
  const ref = useRef<HTMLDialogElement>(null);
  useEffect(() => {
    const d = ref.current;
    if (!d) return;
    if (open && !d.open) d.showModal();
    if (!open && d.open) d.close();
  }, [open]);

  const rec = recommendLoad(items);
  const vehicle = getVehicle(rec.vehicleId);

  return (
    <dialog
      ref={ref}
      onClose={onClose}
      aria-labelledby="load-assistant-title"
      className="m-auto h-[90dvh] w-[min(40rem,calc(100%-1rem))] rounded-2xl p-0 shadow-2xl"
    >
      <div className="flex h-full flex-col">
        <div className="flex items-center justify-between border-b border-slate-200 px-4 py-3">
          <h2 id="load-assistant-title" className="text-lg font-bold text-brand-900">
            Household load assistant
          </h2>
          <button type="button" onClick={onClose} aria-label="Close" className="h-10 w-10 rounded-lg text-2xl hover:bg-slate-100">
            ×
          </button>
        </div>

        <div className="flex-1 overflow-y-auto px-4 pb-4">
          <p className="py-3 text-sm text-slate-600">
            Add what you are moving and we will suggest a truck. This is optional, and your quote only changes when you apply the suggestion.
          </p>
          {itemGroups.map((g) => (
            <fieldset key={g.id} className="mb-4 rounded-xl border border-slate-200 px-3 pb-2">
              <legend className="px-1 text-sm font-bold uppercase tracking-wide text-slate-500">{g.label}</legend>
              {g.items.map((it) => (
                <Counter
                  key={it.id}
                  label={it.label}
                  value={items[it.id] ?? 0}
                  onChange={(n) => onItems({ ...items, [it.id]: n })}
                />
              ))}
            </fieldset>
          ))}
        </div>

        <div className="border-t border-slate-200 bg-white p-4">
          <dl className="mb-3 grid grid-cols-3 gap-2 text-sm">
            <div>
              <dt className="text-slate-500">Truck</dt>
              <dd className="font-semibold">{vehicle ? vehicle.name : "Add items"}</dd>
            </div>
            <div>
              <dt className="text-slate-500">Volume</dt>
              <dd className="font-semibold">{rec.volumeM3.toFixed(1)} m³</dd>
            </div>
            <div>
              <dt className="text-slate-500">Helpers</dt>
              <dd className="font-semibold">{rec.helpers}</dd>
            </div>
          </dl>
          {rec.trips > 1 && <p className="mb-2 text-sm text-amber-700">This load needs about {rec.trips} trips with our largest truck.</p>}
          <Button className="w-full" disabled={!vehicle} onClick={() => onApply(rec)}>
            Apply suggestion
          </Button>
        </div>
      </div>
    </dialog>
  );
}
