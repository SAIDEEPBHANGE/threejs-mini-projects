import Field from "./Field";

function isAtMainPlateBase(stiffener, mainPlate) {
  const baseWidth =
    stiffener.position === "left"
      ? Number(mainPlate.leftWidth)
      : stiffener.position === "right"
        ? Number(mainPlate.rightWidth)
        : null;

  return (
    baseWidth !== null &&
    Math.abs(Number(stiffener.offset) - baseWidth) <=
      Math.max(0, Number(stiffener.thickness) || 0) / 2
  );
}

export function PadEyeForm({
  padEye,
  updateMainPlate,
  updateCheekPlate,
  addCheekPlate,
  removeCheekPlate,
  updateStiffener,
  addStiffener,
  duplicateStiffener,
  removeStiffener,
  setPadEye,
}) {
  const totalCheekPlates = padEye.cheekPlates.length;

  return (
    <aside className="max-h-[calc(100vh-8rem)] overflow-y-auto pr-1">
      <div className="space-y-6">
        <div className="rounded-3xl border border-slate-200 bg-white p-5 shadow-xl">
          <h2 className="mb-4 text-lg font-semibold text-slate-700">General</h2>
          <label className="block">
            <span className="mb-1 block text-sm font-medium text-slate-600">
              Pad Eye ID
            </span>
            <input
              type="text"
              value={padEye.id}
              onChange={(event) =>
                setPadEye((current) => ({
                  ...current,
                  id: event.target.value,
                }))
              }
              className="w-full rounded-xl border border-slate-300 bg-slate-50 px-3 py-2.5 text-sm shadow-sm outline-none transition focus:border-sky-500 focus:ring-2 focus:ring-sky-100"
            />
          </label>
        </div>

        <div className="rounded-3xl border border-slate-200 bg-white p-5 shadow-xl">
          <h2 className="mb-4 text-lg font-semibold text-slate-700">
            Main Plate
          </h2>
          <div className="grid grid-cols-2 gap-4">
            <Field
              label="Thickness (t)"
              value={padEye.mainPlate.thickness}
              onChange={(value) => updateMainPlate("thickness", value)}
            />
            <Field
              label="Height (h)"
              value={padEye.mainPlate.height}
              onChange={(value) => updateMainPlate("height", value)}
            />
            <Field
              label="Left Width (lw)"
              value={padEye.mainPlate.leftWidth}
              onChange={(value) => updateMainPlate("leftWidth", value)}
            />
            <Field
              label="Right Width (rw)"
              value={padEye.mainPlate.rightWidth}
              onChange={(value) => updateMainPlate("rightWidth", value)}
            />
            <Field
              label="Outer Radius (R)"
              value={padEye.mainPlate.outerRadius}
              onChange={(value) => updateMainPlate("outerRadius", value)}
            />
            <div className="col-span-2">
              <Field
                label="Hole Diameter (D)"
                value={padEye.mainPlate.holeDiameter}
                onChange={(value) => updateMainPlate("holeDiameter", value)}
              />
            </div>
          </div>
        </div>

        <div className="rounded-3xl border border-slate-200 bg-white p-5 shadow-xl">
          <div className="mb-4 flex items-center justify-between">
            <h2 className="text-lg font-semibold text-slate-700">
              Cheek Plates
            </h2>
            <button
              type="button"
              onClick={addCheekPlate}
              disabled={totalCheekPlates >= 4}
              className="rounded-lg bg-sky-600 px-3 py-1.5 text-sm font-medium text-white transition hover:bg-sky-500 disabled:cursor-not-allowed disabled:bg-slate-300"
            >
              Add
            </button>
          </div>

          <div className="space-y-4">
            {padEye.cheekPlates.map((plate, index) => (
              <div
                key={plate.id}
                className="rounded-2xl border border-slate-200 bg-slate-50 p-4"
              >
                <div className="mb-3 flex items-center justify-between">
                  <span className="text-sm font-semibold uppercase tracking-wide text-slate-500">
                    {plate.id}
                  </span>
                  <button
                    type="button"
                    onClick={() => removeCheekPlate(index)}
                    className="text-sm font-medium text-rose-600 transition hover:text-rose-700"
                  >
                    Remove
                  </button>
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <Field
                    label="Radius (Rc)"
                    value={plate.radius}
                    onChange={(value) =>
                      updateCheekPlate(index, "radius", value)
                    }
                  />
                  <Field
                    label="Thickness (tc)"
                    value={plate.thickness}
                    onChange={(value) =>
                      updateCheekPlate(index, "thickness", value)
                    }
                  />
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="rounded-3xl border border-slate-200 bg-white p-5 shadow-xl">
          <div className="mb-4 flex items-center justify-between">
            <h2 className="text-lg font-semibold text-slate-700">Stiffeners</h2>
            <button
              type="button"
              onClick={addStiffener}
              className="rounded-lg bg-sky-600 px-3 py-1.5 text-sm font-medium text-white transition hover:bg-sky-500"
            >
              Add
            </button>
          </div>

          <div className="space-y-4">
            {padEye.stiffeners.map((stiffener, index) => (
              <div
                key={stiffener.id}
                className="rounded-2xl border border-slate-200 bg-slate-50 p-4"
              >
                <div className="mb-3 flex items-center justify-between">
                  <span className="text-sm font-semibold uppercase tracking-wide text-slate-500">
                    {stiffener.id}
                  </span>
                  <div className="flex gap-2">
                    <button
                      type="button"
                      onClick={() => duplicateStiffener(index)}
                      className="text-sm font-medium text-violet-600 transition hover:text-violet-700"
                    >
                      Duplicate
                    </button>
                    <button
                      type="button"
                      onClick={() => removeStiffener(index)}
                      className="text-sm font-medium text-rose-600 transition hover:text-rose-700"
                    >
                      Remove
                    </button>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <label className="block text-sm text-slate-600">
                    <span className="mb-1 block font-medium">Type</span>
                    <select
                      value={stiffener.type}
                      onChange={(event) =>
                        updateStiffener(index, "type", event.target.value)
                      }
                      className="w-full rounded-xl border border-slate-300 bg-white px-3 py-2 text-sm outline-none focus:border-sky-500 focus:ring-2 focus:ring-sky-100"
                    >
                      <option value="flat">flat</option>
                      <option value="angled">angled</option>
                      <option value="curved">curved</option>
                    </select>
                  </label>

                  <label className="block text-sm text-slate-600">
                    <span className="mb-1 block font-medium">Position</span>
                    <select
                      value={stiffener.position}
                      onChange={(event) =>
                        updateStiffener(index, "position", event.target.value)
                      }
                      className="w-full rounded-xl border border-slate-300 bg-white px-3 py-2 text-sm outline-none focus:border-sky-500 focus:ring-2 focus:ring-sky-100"
                    >
                      <option value="center">center</option>
                      <option value="left">left</option>
                      <option value="right">right</option>
                    </select>
                  </label>

                  <Field
                    label="Thickness (ts)"
                    value={stiffener.thickness}
                    onChange={(value) =>
                      updateStiffener(index, "thickness", value)
                    }
                  />
                  <Field
                    label="Offset"
                    value={stiffener.offset}
                    onChange={(value) =>
                      updateStiffener(index, "offset", value)
                    }
                  />
                  {isAtMainPlateBase(stiffener, padEye.mainPlate) && (
                    <Field
                      label="Base Height"
                      value={stiffener.height}
                      onChange={(value) =>
                        updateStiffener(index, "height", value)
                      }
                    />
                  )}
                  <Field
                    label="Top Size"
                    value={stiffener.topSize}
                    onChange={(value) =>
                      updateStiffener(index, "topSize", value)
                    }
                  />
                  {stiffener.type !== "curved" && (
                    <Field
                      label="Bottom Size"
                      value={stiffener.bottomSize}
                      onChange={(value) =>
                        updateStiffener(index, "bottomSize", value)
                      }
                    />
                  )}
                  {stiffener.type === "curved" && (
                    <div className="col-span-2">
                      <Field
                        label="Bottom Pipe Radius"
                        value={stiffener.bottomRadius}
                        onChange={(value) =>
                          updateStiffener(index, "bottomRadius", value)
                        }
                      />
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </aside>
  );
}
