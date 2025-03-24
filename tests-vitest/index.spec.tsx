import Page from "@/pages/index";
import { render, screen } from "@testing-library/react";
import { expect, test } from "vitest";

test("Has index page", () => {
  render(<Page />);
  expect(
    screen.getByRole("heading", { level: 1, name: "La Suite territoriale" }),
  ).toBeDefined();
});
