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
