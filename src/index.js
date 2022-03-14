const resolveConfig = require("tailwindcss/resolveConfig");

/**
 * Converts a CSS-in-JS literal to a Sass literal.
 * With a special case for values containing slashes or commas,
 * see https://sass-lang.com/documentation/breaking-changes/slash-div.
 */
const literalToSass = (v) => {
  const quoted = typeof v === "string" && (v.includes("/") || v.includes(","));
  return quoted ? `"${v}"` : v;
};

/**
 * Converts a deep object of CSS-in-JS literals to a flat Sass map.
 */
const jsTreeToFlatSass = (prefix, [key, val]) => {
  // For example, theme('spacing[0.5]').
  const hasDot = key.includes(".");
  key = hasDot ? `[${key}]` : key;
  prefix = prefix ? `${prefix}${hasDot ? "" : "."}${key}` : key;

  if (typeof val === "function") {
    return null;
  }

  if (typeof val === "object") {
    // Commented out because all instances of this _should_ be safe to hand over to built-in Tailwind theme().
    // let arrayOutput = "";
    // // For example, theme('fontFamily.mono').
    // if (Array.isArray(val)) {
    //   arrayOutput = `'${prefix}': '${val.map(literalToSass).join(", ")}',\n`;
    // }

    const entries = Object.entries(val).map(
      jsTreeToFlatSass.bind(null, prefix)
    );
    // return `${arrayOutput}${entries.join("")}`;
    return entries.join("");
  }

  return `'${prefix}': ${literalToSass(val)},\n`;
};

/**
 * Converts the Tailwind theme nested object to a flat Sass map,
 * to use with a `theme()` function like Tailwind’s.
 * Or plain `map.get` works too!
 */
const tailwindThemeToSass = (theme, themeOptions = []) => {
  console.log(theme.colors);
  const options = themeOptions.map((opt) =>
    jsTreeToFlatSass("theme", [opt, theme[opt]])
  );
  return `(\n${options.join("\n")})`;
};

const vanillaSassThemeFunction = (tailwindConfig) => {
  const fullConfig = resolveConfig(tailwindConfig);

  return `
@use "sass:map";
@use "sass:string";
$theme: ${tailwindThemeToSass(fullConfig.theme)};
@function theme($path) {
  $value: map.get($theme, $path);
  @if $value != null {
    @return $value;
  }
  // Hand over processing to vanilla Tailwind theme function.
  @return string.unquote("theme('#{$path}')");
}`;
};

module.exports = {
  tailwindThemeToSass,
  vanillaSassThemeFunction,
};
