const { nextArrival } = require("./time");

describe("nextArrival", () => {
  beforeAll(() => {
    jest.useFakeTimers().setSystemTime(new Date("2023-01-01T12:00:00Z"));
  });

  afterAll(() => {
    jest.useRealTimers();
  });

  test("headway=3 → add 3 minutes", () => {
    expect(nextArrival(3)).toBe("13:03");
  });

  test("headway default → equal 3", () => {
    expect(nextArrival()).toBe("13:03");
  });

  test("headway <= 0 → error", () => {
    expect(() => nextArrival(0)).toThrow("headwayMin must be > 0");
    expect(() => nextArrival(-5)).toThrow("headwayMin must be > 0");
  });
});
