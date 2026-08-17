import { describe, expect, it } from "vitest";
import { render, screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { MemoryRouter } from "react-router-dom";
import { Lessons } from "../src/pages/Lessons.jsx";
import { lessons } from "../src/data/lessons.js";

function renderLessons(initial = "/lessons") {
  return render(
    <MemoryRouter initialEntries={[initial]}>
      <Lessons />
    </MemoryRouter>,
  );
}

describe("Lessons page", () => {
  it("shows every lesson when no filter is set", () => {
    renderLessons();
    for (const l of lessons) {
      expect(
        screen.getByRole("link", { name: new RegExp(l.title) }),
      ).toBeInTheDocument();
    }
  });

  it("honors the ?category= query parameter from the URL", () => {
    renderLessons("/lessons?category=math");
    expect(
      screen.getByRole("link", { name: /Counting to Ten/ }),
    ).toBeInTheDocument();
    expect(
      screen.queryByRole("link", { name: /Short A Sounds/ }),
    ).not.toBeInTheDocument();
  });

  it("filters by subject when a chip is pressed", async () => {
    const user = userEvent.setup();
    renderLessons();
    const phonicsChip = screen.getByRole("button", {
      name: "Phonics",
      pressed: false,
    });
    await user.click(phonicsChip);
    expect(
      screen.getByRole("link", { name: /Short A Sounds/ }),
    ).toBeInTheDocument();
    expect(
      screen.queryByRole("link", { name: /Counting to Ten/ }),
    ).not.toBeInTheDocument();
  });

  it("shows difficulty stars and category badges on cards", () => {
    renderLessons();
    const firstCard = screen.getByRole("link", { name: /Short A Sounds/ });
    expect(
      within(firstCard).getByLabelText("Difficulty 1 of 3"),
    ).toBeInTheDocument();
    expect(within(firstCard).getByLabelText("Phonics")).toBeInTheDocument();
  });
});
