# stylelint-force-selector-name-prefix

A stylelint plugin that force it to have page or component name as prefix.

To avoid css naming conflicts between pages, suggest to separate css selectors by prefix. For each page or component, you can have a unique prefix and this plugin will force you to prefix for each selector.

## Installation

```
npm install @bakhirev/stylelint-force-selector-name-prefix
```

Be warned: this is only compatible with stylelint v3+.

## Usage

Add it to your stylelint config `plugins` array, then add `"@bakhirev/stylelint-force-selector-name-prefix"` to your rules.

Like so:

```js
// .stylelintrc
{
  "plugins": [
    "stylelint-force-selector-name-prefix"
  ],
  "rules": {
    // ...
    "plugin/stylelint-force-selector-name-prefix": [
      { "afterPath": "components", "separator": "_" },
      { "afterPath": "pages", "separator": "-" },
    ],
    // ...
  }
}
```

## Rule

For example, you project like this:

```
- src
  |-- helpers
  |-- interfaces
  |-- styles
  |-- components
  |-- pages
      |-- GameCatalogue
          |-- components
          |-- store
          |-- styles
          |-- api.ts
          |-- index.scss    [x]
          |-- index.tsx
  
```

Disallow missing prefix or namespace for selectors, keyframes name and custom font-family name.

```css
    .some-selector { ... }
/** ↑
 * Selector "some-selector" is out of control, please wrap within .game-catalogue         plugin/stylelint-force-selector-name-prefix */

    @keyframes spin {
/** ↑
 * Keyframes name "spin" is out of control, please prefix with game-catalogue       plugin/stylelint-force-selector-name-prefix */
        0% { ... }
        100% { ... }
    }

    @font-face {
        font-family: "my-font";
/**                   ↑
 * Custom font-family "my-font" is out of control, please prefix with game-catalogue         plugin/stylelint-force-selector-name-prefix */
        ...
    }
```
