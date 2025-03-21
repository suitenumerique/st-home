import { render, screen } from "@testing-library/react";
import { describe, expect, it, test } from "vitest";
import Page from "../src/pages/index";
import "./onboarding.spec";

test("Has index page", () => {
  render(<Page />);
  expect(
    screen.getByRole("heading", { level: 1, name: "Template" }),
  ).toBeDefined();
});

describe("Test Suite", () => {
  it("should run all tests", () => {
    expect(true).toBe(true);
  });
});
