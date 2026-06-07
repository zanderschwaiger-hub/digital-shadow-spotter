import { describe, it, expect, vi } from "vitest";
import { render } from "@testing-library/react";
import { MemoryRouter, Routes, Route } from "react-router-dom";
import Index from "./Index";

vi.mock("react-router-dom", async () => {
  const actual = await vi.importActual<typeof import("react-router-dom")>("react-router-dom");
  return {
    ...actual,
    Navigate: vi.fn(() => null),
  };
});

import { Navigate } from "react-router-dom";

describe("Index page", () => {
  it("redirects to /exposure-check with replace", () => {
    render(
      <MemoryRouter initialEntries={["/"]}>
        <Routes>
          <Route path="/" element={<Index />} />
        </Routes>
      </MemoryRouter>
    );

    expect(Navigate).toHaveBeenCalled();
    const props = (Navigate as unknown as ReturnType<typeof vi.fn>).mock.calls[0][0];
    expect(props.to).toBe("/exposure-check");
    expect(props.replace).toBe(true);
  });
});
