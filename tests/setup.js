import "@testing-library/jest-dom/vitest";
import { afterEach } from "vitest";
import { cleanup } from "@testing-library/react";

globalThis.IS_REACT_ACT_ENVIRONMENT = true;

window.scrollTo = () => {};
Element.prototype.scrollTo = () => {};

afterEach(() => {
  cleanup();
});
