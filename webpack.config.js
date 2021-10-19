const path = require("path");
const MiniCssExtractPlugin = require("mini-css-extract-plugin");
const resolveConfig = require("tailwindcss/resolveConfig");
const rawTailwindConfig = require("./tailwind.config");

const tailwindConfig = resolveConfig(rawTailwindConfig);

const themeToMap = (depth, [key, val]) => {
  const indentation = "  ".repeat(depth);
  const suffix = depth === 0 ? ";" : `,`;

  const sassKey = isNaN(Number(key)) || key === "-0" ? `"${key}"` : Number(key);
  const prefix = depth === 0 ? "$theme: " : `${indentation}${sassKey}: `;

  let sassVal;
  if (Array.isArray(val)) {
    sassVal = `'${val.join(", ")}'`;
  } else if (typeof val === "object") {
    sassVal = `(\n${Object.entries(val)
      .map(themeToMap.bind(null, depth + 1))
      .join("\n")}\n${indentation})`;
  } else {
    sassVal = val.includes(",") ? `#{${val}}` : val;
  }

  return `${prefix}${sassVal}${suffix}`;
};

const themeToVars = (prefix, [key, val]) => {
  const sassKey = key.replace(/[.%,\/]/g, "\\$&");
  if (key === "keyframes") {
    return "";
  }
  if (Array.isArray(val)) {
    return `$${prefix}-${sassKey}: ${val.join(", ")};\n`;
  }
  if (typeof val === "object") {
    return Object.entries(val)
      .map(themeToVars.bind(null, prefix ? `${prefix}-${sassKey}` : sassKey))
      .join("");
  }
  const sassVal =
    typeof val === "string" && val.includes("/")
      ? `list.slash(${val.replace("/", ",")})`
      : val;

  return `$${prefix}-${sassKey}: ${sassVal};\n`;
};

const themeToFunc = (prefix, [key, val]) => {
  // if (key === "keyframes") {
  //   return "";
  // }
  if (Array.isArray(val)) {
    return `'${prefix}.${key}': '${val.join(", ")}',\n`;
  }
  if (typeof val === "object") {
    return Object.entries(val)
      .map(themeToFunc.bind(null, prefix ? `${prefix}.${key}` : key))
      .join("");
  }
  const sassVal =
    typeof val === "string" && (val.includes("/") || val.includes(","))
      ? `'${val}'`
      : val;

  return `'${prefix}.${key}': ${sassVal},\n`;
};

console.log(tailwindConfig.theme.fontFamily);
console.log(themeToMap(0, ["", tailwindConfig.theme.fontFamily]));
console.log(themeToVars("", ["", tailwindConfig.theme.fontFamily]));
console.log(themeToFunc("", ["", tailwindConfig.theme]));

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
              @use "sass:list";
              @use "sass:string";
              ${themeToMap(0, [null, tailwindConfig.theme])}
              ${themeToVars("", ["", tailwindConfig.theme])}
              $funcTheme: (
                ${themeToFunc("", ["", tailwindConfig.theme])}
              );
              @function sass-theme($key) {
                @return map.get($funcTheme, $key);
              }
              $spacing: (${Object.entries(tailwindConfig.theme.spacing)
                .map(([key, val]) => `"${key}": ${val},`)
                .join("\n")});`,
            },
          },
        ],
      },
    ],
  },
};
