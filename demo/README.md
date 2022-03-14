# sass-tailwind-playground

Trying out ways to access the Tailwind theme as Sass values. See also [tailwindsass](https://github.com/VicGUTT/tailwindsass).

## Implementation

This sync relies on generating Sass code in JS, based on the contents of the Tailwind theme. It currently uses the Webpack sass-loader [`additionalData`](https://github.com/webpack-contrib/sass-loader#additionaldata), but could also be changed to output a `.scss` file to then manually import where needed.

### additionalData

With `additionalData`, there is no special setup needed in `.scss` files. The only caveats are:

- The added code prevents using `@use` statements at the top of the Sass entry point (`main.scss`).
- This approach is only possible with Webpack.

### Generating a stylesheet

The alternative is to generate an intermediary stylesheet (e.g. `theme.scss`), which would then be imported in Sass files as usual.
