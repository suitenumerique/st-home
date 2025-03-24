import { render, screen } from "@testing-library/react";
import { describe, expect, it, test } from "vitest";
import Page from "@/pages/index";

test("Has index page", () => {
  render(<Page />);
  expect(
    screen.getByRole("heading", { level: 1, name: "La Suite territoriale" }),
  ).toBeDefined();
});
