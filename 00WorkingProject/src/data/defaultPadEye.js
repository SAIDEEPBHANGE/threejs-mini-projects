export const defaultPadEye = {
  id: "PE-001",
  units: "mm",
  mainPlate: {
    thickness: 30,
    height: 220,
    leftWidth: 100,
    rightWidth: 100,
    outerRadius: 150,
    holeDiameter: 60,
  },
  cheekPlates: [
    { id: "CP-01", radius: 100, thickness: 20 },
    { id: "CP-02", radius: 100, thickness: 20 },
  ],
  stiffeners: [
    {
      id: "ST-01",
      type: "flat",
      position: "left",
      thickness: 10,
      offset: 40,
      topSize: 80,
      bottomSize: 100,
      bottomRadius: 0,
    },
    {
      id: "ST-02",
      type: "curved",
      position: "right",
      thickness: 12,
      offset: 40,
      topSize: 80,
      bottomSize: 100,
      bottomRadius: 50,
    },
  ],
};
