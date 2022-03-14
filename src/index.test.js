const sass = require("sass");
const { tailwindThemeToSass, vanillaSassThemeFunction } = require("./index");
const defaultTheme = require("tailwindcss/defaultTheme");

const tailwindConfig = {
  theme: {
    screens: {
      sm: "50em", // 800px
      md: "56.25em", // 900px
      lg: "75em", // 1200px
      xl: "100em", // 1600px
    },
    colors: {
      black: {
        DEFAULT: "#000000",
      },
      primary: {
        DEFAULT: "#2E1F5E",
      },
      test: "#ff0000",
      info: {
        100: "#1F7E9A",
        50: "#E2F5FC",
      },
    },
    spacing: {
      px: "1px",
      0: "0px",
      0.5: "0.125rem",
      1: "0.25rem",
      1.5: "0.375rem",
      2: "0.5rem",
    },
  },
};

describe("tailwindcss-vanilla-sass", () => {
  it("tailwindThemeToSass works", () => {
    expect(tailwindThemeToSass(tailwindConfig.theme, ["colors"]))
      .toMatchInlineSnapshot(`
      "(
      'theme.colors.black.DEFAULT': #000000,
      'theme.colors.primary.DEFAULT': #2E1F5E,
      'theme.colors.test': #ff0000,
      'theme.colors.info.50': #E2F5FC,
      'theme.colors.info.100': #1F7E9A,
      )"
    `);
  });

  it("vanillaSassThemeFunction works", () => {
    expect(
      sass.compileString(`
    ${vanillaSassThemeFunction(tailwindConfig)}
    body {
      content: theme('screens.sm');
      content: theme('screens.md');
      content: theme('screens.lg');
      content: theme('screens.xl');
      content: theme('colors.black.DEFAULT');
      content: theme('colors.primary.DEFAULT');
      content: theme('colors.test');
      content: theme('colors.info.50');
      content: theme('colors.info.100');
      content: theme('spacing.0');
      content: theme('spacing.1');
      content: theme('spacing.2');
      content: theme('spacing.px');
      content: theme('spacing[0.5]');
      content: theme('spacing[1.5]');
    }
    `).css
    ).toMatchInlineSnapshot(`
      "body {
        content: theme('screens.sm');
        content: theme('screens.md');
        content: theme('screens.lg');
        content: theme('screens.xl');
        content: theme('colors.black.DEFAULT');
        content: theme('colors.primary.DEFAULT');
        content: theme('colors.test');
        content: theme('colors.info.50');
        content: theme('colors.info.100');
        content: theme('spacing.0');
        content: theme('spacing.1');
        content: theme('spacing.2');
        content: theme('spacing.px');
        content: theme('spacing[0.5]');
        content: theme('spacing[1.5]');
      }"
    `);
  });

  it("works", () => {
    expect(tailwindThemeToSass({ theme: defaultTheme })).toMatchInlineSnapshot(`
      "(
      )"
    `);
  });
});
