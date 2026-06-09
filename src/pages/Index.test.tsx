import { describe, it, expect, vi } from "vitest";
import { render, waitFor } from "@testing-library/react";
import { MemoryRouter, Routes, Route, useNavigate } from "react-router-dom";
import Index from "./Index";

const mockNavigate = vi.fn();
vi.mock("react-router-dom", async () => {
  const actual = await vi.importActual<typeof import("react-router-dom")>("react-router-dom");
  return {
    ...actual,
    useNavigate: () => mockNavigate,
  };
});

const mockGetSession = vi.fn();
vi.mock("@/integrations/supabase/client", () => ({
  supabase: {
    auth: {
      getSession: () => mockGetSession(),
    },
  },
}));

describe("Index page", () => {
  it("redirects to /dashboard when authenticated", async () => {
    mockGetSession.mockResolvedValue({ data: { session: { user: { id: "123" } } } });
    mockNavigate.mockClear();

    render(
      <MemoryRouter initialEntries={["/"]}>
        <Routes>
          <Route path="/" element={<Index />} />
        </Routes>
      </MemoryRouter>
    );

    await waitFor(() => {
      expect(mockNavigate).toHaveBeenCalledWith("/dashboard", { replace: true });
    });
  });

  it("redirects to /exposure-check when not authenticated", async () => {
    mockGetSession.mockResolvedValue({ data: { session: null } });
    mockNavigate.mockClear();

    render(
      <MemoryRouter initialEntries={["/"]}>
        <Routes>
          <Route path="/" element={<Index />} />
        </Routes>
      </MemoryRouter>
    );

    await waitFor(() => {
      expect(mockNavigate).toHaveBeenCalledWith("/exposure-check", { replace: true });
    });
  });
});
