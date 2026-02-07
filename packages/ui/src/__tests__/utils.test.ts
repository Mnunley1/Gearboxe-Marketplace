import { describe, expect, it } from "vitest";
import { cn } from "../utils";

describe("cn utility function", () => {
  it("should merge class names correctly", () => {
    expect(cn("foo", "bar")).toBe("foo bar");
  });

  it("should handle conditional classes", () => {
    expect(cn("foo", false && "bar", "baz")).toBe("foo baz");
  });

  it("should handle undefined values", () => {
    expect(cn("foo", undefined, "bar")).toBe("foo bar");
  });

  it("should handle arrays of classes", () => {
    expect(cn(["foo", "bar"])).toBe("foo bar");
  });

  it("should merge tailwind classes correctly", () => {
    expect(cn("px-2 py-1", "px-4")).toBe("py-1 px-4");
  });

  it("should handle object syntax", () => {
    expect(cn({ foo: true, bar: false, baz: true })).toBe("foo baz");
  });

  it("should return empty string for no input", () => {
    expect(cn()).toBe("");
  });

  it("should handle complex tailwind merging", () => {
    expect(cn("bg-red-500", "bg-blue-500")).toBe("bg-blue-500");
    expect(cn("text-sm", "text-lg")).toBe("text-lg");
    expect(cn("p-4", "px-2")).toBe("p-4 px-2");
  });
});
