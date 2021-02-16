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
    "@bakhirev/stylelint-force-selector-name-prefix"
  ],
  "rules": {
    // ...
    "plugin/stylelint-force-selector-name-prefix": {
        "afterPath": "pages",
        "separator": "kebab-case"
    },
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

Bad CSS:

```css
.some-class-name {
    display: block;
}
.some .child {
    display: inline-block;
}
```

Good CSS:

```css
.game-catalogue-some-class-name {
    display: block;
}
.game-catalogue-some .child {
    display: inline-block;
}
```
