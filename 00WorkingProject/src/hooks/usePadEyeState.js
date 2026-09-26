import { useState } from "react";
import defaultPadEye from "../data/defaultPadEye.json";

export function usePadEyeState() {
  const [padEye, setPadEye] = useState(defaultPadEye);

  const updateMainPlate = (field, value) => {
    const numericValue = Number(value);
    setPadEye((current) => ({
      ...current,
      mainPlate: {
        ...current.mainPlate,
        [field]: Number.isFinite(numericValue) ? numericValue : 0,
      },
    }));
  };

  const updateCheekPlate = (index, field, value) => {
    const numericValue = Number(value);
    setPadEye((current) => ({
      ...current,
      cheekPlates: current.cheekPlates.map((plate, plateIndex) => {
        if (plateIndex !== index) return plate;
        return {
          ...plate,
          [field]: Number.isFinite(numericValue) ? numericValue : 0,
        };
      }),
    }));
  };

  const addCheekPlate = () => {
    setPadEye((current) => {
      if (current.cheekPlates.length >= 2) return current;
      return {
        ...current,
        cheekPlates: [
          ...current.cheekPlates,
          {
            id: `CP-${String(current.cheekPlates.length + 1).padStart(2, "0")}`,
            radius: 90,
            thickness: 10,
          },
        ],
      };
    });
  };

  const removeCheekPlate = (index) => {
    setPadEye((current) => ({
      ...current,
      cheekPlates: current.cheekPlates.filter(
        (_, plateIndex) => plateIndex !== index,
      ),
    }));
  };

  const updateStiffener = (index, field, value) => {
    const numericValue = Number(value);
    setPadEye((current) => ({
      ...current,
      stiffeners: current.stiffeners.map((stiffener, stiffenerIndex) => {
        if (stiffenerIndex !== index) return stiffener;
        return {
          ...stiffener,
          [field]: Number.isFinite(numericValue) ? numericValue : 0,
        };
      }),
    }));
  };

  const addStiffener = () => {
    setPadEye((current) => ({
      ...current,
      stiffeners: [
        ...current.stiffeners,
        {
          id: `ST-${String(current.stiffeners.length + 1).padStart(2, "0")}`,
          type: "flat",
          position: "center",
          thickness: 10,
          offset: 30,
          topSize: 80,
          bottomSize: 100,
          bottomRadius: 0,
        },
      ],
    }));
  };

  const duplicateStiffener = (index) => {
    setPadEye((current) => {
      const source = current.stiffeners[index];
      if (!source) return current;
      const copy = {
        ...source,
        id: `ST-${String(current.stiffeners.length + 1).padStart(2, "0")}`,
      };
      return {
        ...current,
        stiffeners: [...current.stiffeners, copy],
      };
    });
  };

  const removeStiffener = (index) => {
    setPadEye((current) => ({
      ...current,
      stiffeners: current.stiffeners.filter(
        (_, stiffenerIndex) => stiffenerIndex !== index,
      ),
    }));
  };

  return {
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
  };
}
