import { usePadEyeState } from "./hooks/usePadEyeState";
import { PadEyeCanvas } from "./components/PadEyeCanvas";
import { PadEyeForm } from "./components/PadEyeForm";

function App() {
  const {
    padEye,
    setPadEye,
    updateMainPlate,
    updateCheekPlate,
    addCheekPlate,
    removeCheekPlate,
    updateStiffener,
    addStiffener,
    duplicateStiffener,
    removeStiffener,
  } = usePadEyeState();

  return (
    <div className="min-h-screen bg-slate-100 text-slate-800">
      <div className="mx-auto max-w-7xl px-4 py-6">
        {/* <header className="mb-6 flex items-center justify-between rounded-2xl bg-slate-900 px-6 py-4 text-white shadow-lg">
          <div>
            <p className="text-xs font-medium uppercase tracking-[0.25em] text-sky-300">
              Pad Eye Design
            </p>
            <h1 className="mt-1 text-2xl font-bold">
              Engineering Configuration
            </h1>
          </div>
          <div className="rounded-full border border-sky-400/40 bg-sky-500/10 px-4 py-2 text-sm font-medium text-sky-200">
            {padEye.id} • {padEye.units}
          </div>
        </header> */}

        <div className="grid gap-6 xl:grid-cols-[1.15fr_0.85fr]">
          <PadEyeCanvas padEye={padEye} />

          <PadEyeForm
            padEye={padEye}
            setPadEye={setPadEye}
            updateMainPlate={updateMainPlate}
            updateCheekPlate={updateCheekPlate}
            addCheekPlate={addCheekPlate}
            removeCheekPlate={removeCheekPlate}
            updateStiffener={updateStiffener}
            addStiffener={addStiffener}
            duplicateStiffener={duplicateStiffener}
            removeStiffener={removeStiffener}
          />
        </div>
      </div>
    </div>
  );
}

export default App;
