import { setupZonelessTestEnv } from 'jest-preset-angular/setup-env/zoneless/index.mjs';

setupZonelessTestEnv();

const consoleErrorRef = console.error;
console.error = (...args) => {
  if (
    !args.find((p) =>
      p.toString().includes('Error: Could not parse CSS stylesheet'),
    )
  ) {
    consoleErrorRef(...args);
  }
};
