import { describe, expect, it, vi, beforeEach, afterEach } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { MemoryRouter, Route, Routes } from "react-router-dom";
import { Login } from "../src/pages/Login.jsx";
import { RequireParent } from "../src/components/RequireParent.jsx";
import { signInWithCredential } from "../src/lib/auth.js";

const token = () => {
  const payload = btoa(
    JSON.stringify({ sub: "9", email: "mom@home.com", name: "Maya" }),
  );
  return `x.${payload}.y`;
};

function renderLogin() {
  return render(
    <MemoryRouter>
      <Login />
    </MemoryRouter>,
  );
}

describe("Login page", () => {
  beforeEach(() => {
    localStorage.clear();
    vi.unstubAllEnvs();
  });

  afterEach(() => {
    vi.unstubAllGlobals();
    vi.unstubAllEnvs();
  });

  it("explains sign-in is not ready without a Google client id", () => {
    renderLogin();
    expect(screen.getByText(/almost ready/)).toBeInTheDocument();
  });

  it("renders the Google button when configured and signed out", async () => {
    vi.stubEnv("VITE_GOOGLE_CLIENT_ID", "abc.apps.googleusercontent.com");
    vi.stubGlobal("google", {
      accounts: {
        id: {
          initialize: () => {},
          renderButton: (el) => {
            el.innerHTML = '<div class="gbtn">Google</div>';
          },
        },
      },
    });
    renderLogin();
    expect(await screen.findByText("Google")).toBeInTheDocument();
  });

  it("shows the signed-in state and signs out", async () => {
    vi.stubEnv("VITE_GOOGLE_CLIENT_ID", "abc.apps.googleusercontent.com");
    signInWithCredential(token());
    const user = userEvent.setup();
    renderLogin();
    expect(screen.getByText(/Hi, Maya/)).toBeInTheDocument();
    expect(
      screen.getByRole("link", { name: "View parent insights" }),
    ).toBeInTheDocument();
    await user.click(screen.getByRole("button", { name: "Sign out" }));
    expect(screen.queryByText(/Hi, Maya/)).not.toBeInTheDocument();
  });
});

describe("RequireParent gate", () => {
  beforeEach(() => {
    localStorage.clear();
    vi.unstubAllEnvs();
  });

  afterEach(() => {
    vi.unstubAllGlobals();
    vi.unstubAllEnvs();
  });

  it("redirects signed-out visitors to login when auth is configured", () => {
    vi.stubEnv("VITE_GOOGLE_CLIENT_ID", "abc.apps.googleusercontent.com");
    render(
      <MemoryRouter initialEntries={["/insights"]}>
        <Routes>
          <Route
            path="/insights"
            element={
              <RequireParent>
                <h1>Insights</h1>
              </RequireParent>
            }
          />
          <Route path="/login" element={<h1>Sign in page</h1>} />
        </Routes>
      </MemoryRouter>,
    );
    expect(
      screen.getByRole("heading", { name: "Sign in page" }),
    ).toBeInTheDocument();
  });

  it("lets signed-in parents through", () => {
    vi.stubEnv("VITE_GOOGLE_CLIENT_ID", "abc.apps.googleusercontent.com");
    signInWithCredential(token());
    render(
      <MemoryRouter initialEntries={["/insights"]}>
        <Routes>
          <Route
            path="/insights"
            element={
              <RequireParent>
                <h1>Insights</h1>
              </RequireParent>
            }
          />
          <Route path="/login" element={<h1>Sign in page</h1>} />
        </Routes>
      </MemoryRouter>,
    );
    expect(
      screen.getByRole("heading", { name: "Insights" }),
    ).toBeInTheDocument();
  });

  it("never blocks when auth is not configured", () => {
    render(
      <MemoryRouter initialEntries={["/insights"]}>
        <Routes>
          <Route
            path="/insights"
            element={
              <RequireParent>
                <h1>Insights</h1>
              </RequireParent>
            }
          />
          <Route path="/login" element={<h1>Sign in page</h1>} />
        </Routes>
      </MemoryRouter>,
    );
    expect(
      screen.getByRole("heading", { name: "Insights" }),
    ).toBeInTheDocument();
  });
});
