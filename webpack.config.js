const path = require("path");
const MiniCssExtractPlugin = require("mini-css-extract-plugin");
const resolveConfig = require("tailwindcss/resolveConfig");
const rawTailwindConfig = require("./tailwind.config");

const tailwindConfig = resolveConfig(rawTailwindConfig);

const formatSassValue = (v) => {
  const quoted = typeof v === "string" && (v.includes("/") || v.includes(","));
  return quoted ? `"${v}"` : v;
};

/**
 * Converts the Tailwind theme nested object to a flat Sass map,
 * to use with a `theme()` function like Tailwind’s.
 */
const themeToSass = (prefix, [key, val]) => {
  // For example, theme('spacing[0.5]').
  const hasDot = key.includes(".");
  key = hasDot ? `[${key}]` : key;
  prefix = prefix ? `${prefix}${hasDot ? "" : "."}${key}` : key;

  if (typeof val === "object") {
    // For example, theme('fontFamily.mono').
    // Commented out because all instances of this _should_ be safe to hand over to built-in Tailwind theme().
    let arrayOutput = "";
    // if (Array.isArray(val)) {
    //   arrayOutput = `'${prefix}': '${val.map(formatSassValue).join(", ")}',\n`;
    // }

    const entries = Object.entries(val).map(themeToSass.bind(null, prefix));
    return `${arrayOutput}${entries.join("")}`;
  }

  return `'${prefix}': ${formatSassValue(val)},\n`;
};

// console.log(themeToSass("", ["", tailwindConfig.theme]) )

module.exports = {
  entry: "./src/main.js",
  output: {
    filename: "main.js",
    path: path.resolve(__dirname, "dist"),
  },
  plugins: [new MiniCssExtractPlugin()],
  module: {
    rules: [
      {
        test: /\.scss$/i,
        use: [
          MiniCssExtractPlugin.loader,
          "css-loader",
          {
            loader: "postcss-loader",
            options: {
              postcssOptions: {
                plugins: ["tailwindcss", "autoprefixer"],
              },
            },
          },
          {
            loader: "sass-loader",
            options: {
              additionalData: `
              @use "sass:map";
              @use "sass:string";
              $theme: (${themeToSass("", ["", tailwindConfig.theme])});
              @function theme($path) {
                $value: map.get($theme, $path);
                @if $value != null {
                  @return $value;
                }
                @return string.unquote("theme('#{$path}')");
              }`,
            },
          },
        ],
      },
    ],
  },
};
