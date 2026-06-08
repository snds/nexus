import "@testing-library/jest-dom/vitest";
import { expect } from "vitest";
import { toHaveNoViolations } from "jest-axe";

// jest-axe matcher → vitest's expect.
expect.extend(toHaveNoViolations);

// jest-axe ships jest typings; teach vitest's matcher interface about the matcher.
declare module "vitest" {
  interface Assertion {
    toHaveNoViolations(): void;
  }
  interface AsymmetricMatchersContaining {
    toHaveNoViolations(): void;
  }
}
