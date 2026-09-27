import { useEffect, useState } from "react";
import { usePadEyeState } from "./hooks/usePadEyeState";
import { PadEyeCanvas } from "./components/PadEyeCanvas";
import { PadEyeForm } from "./components/PadEyeForm";

function App() {
  const [isDark, setIsDark] = useState(
    () => window.localStorage.getItem("pad-eye-theme") === "dark",
  );
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

  useEffect(() => {
    window.localStorage.setItem("pad-eye-theme", isDark ? "dark" : "light");
  }, [isDark]);

  return (
    <div
      data-theme={isDark ? "dark" : "light"}
      className="min-h-screen bg-slate-100 text-slate-800"
    >
      <div className="mx-auto max-w-7xl px-4 py-6">
        <div className="mb-4 flex justify-end">
          <button
            type="button"
            aria-pressed={isDark}
            onClick={() => setIsDark((current) => !current)}
            className="rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm font-medium text-slate-700 shadow-sm transition hover:bg-slate-50 focus:outline-none focus:ring-2 focus:ring-sky-500"
          >
            {isDark ? "Switch to light theme" : "Switch to dark theme"}
          </button>
        </div>
        <div className="grid gap-6 xl:grid-cols-[1.15fr_0.85fr]">
          <PadEyeCanvas padEye={padEye} isDark={isDark} />
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
