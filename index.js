const _ = require('lodash');
const stylelint = require('stylelint');

const ruleName = 'plugin/stylelint-force-selector-name-prefix';

const optionsSchema = {
  appName: _.isString
};

const messages = stylelint.utils.ruleMessages(ruleName, {
  invalid: (selector, appName) => "Selector \""+ selector +"\" is out of control, please wrap within ." + appName,
  invalidKeyFrames: (keyframesName, appName) => "Keyframes name \""+ keyframesName +"\" is out of control, please prefix with " + appName + "-",
  invalidFontFace: (fontFamily, appName) => "Custom font-family \""+ fontFamily +"\" is out of control, please prefix with " + appName + "-"
});
const sendErrorMessage = (ruleName, result, rule, message) => {
  stylelint.utils.report({ ruleName, result, node: rule, message });
};

const parser = {
  defaultOptions: [
    {afterPath: 'components', separator: 'kebab-case'},
    {afterPath: 'containers', separator: 'kebab-case'},
    {afterPath: 'pages', separator: 'kebab-case'},
  ],
  getOptions(userOptions) {
    return (userOptions instanceof Array && userOptions.length > 0)
        ? userOptions
        : this.defaultOptions;
  },
  getPrefix(rule, options) {
    return options.map(option => {
      const separator = this._getSeparator(option);
      return this._getNextWord(this._getPathParts(rule), option.afterPath, separator);
    }).filter(v => v).shift();
  },
  _getSeparator(userOptions = {}) {
    return {
      'snake-case': '_',
      'kebab-case': '-',
    }[userOptions.separator] || userOptions.separator || '-';
  },
  _getPathParts(rule) {
    return [...new Set(rule.source.input.file.split(/[/\\]/gim))];
  },
  _getNextWord(paths, word, separator) {
    const index = paths.indexOf(word);
    if (index < 0) return null;
    const name = paths[index + 1];
    return this._getNameParts(name, separator) || null;
  },
  _getNameParts(word, separator) {
    return (word || '')
        .replace(/([\s\-\_]+)/gim, separator)
        .replace(/([a-z])([A-Z])/gm, `$1${separator}$2`)
        .toLowerCase();
  },
  findTopParentSelector(node) {
    const isRoot = node.parent.type === 'root' || node.parent.type === 'atrule';
    return isRoot
        ? node.selector
        : this.findTopParentSelector(node.parent)
  },
  isInsideAtRule(node) {
    const { type } = node.parent;
    if (type === 'atrule') return true;
    if (type === 'root') return false;
    return this.findTopParentSelector(node.parent);
  }
};

const checking = {
  checkClassName(parentSelector, prefixSelector) {
    const hasClass = parentSelector.indexOf(`.${prefixSelector}`) === 0;
    const nextSymbol = parentSelector[prefixSelector.length + 1];
    const hasCorrectNextSymbol = !nextSymbol || nextSymbol.match(/[\s\:\-\_\(\),\{\}]/gim);
    return hasClass && hasCorrectNextSymbol;
  },
  checkOther(parentSelector, prefixSelector) {
    const hasPrefix = parentSelector.indexOf(prefixSelector) === 0;
    const nextSymbol = parentSelector[prefixSelector.length];
    const hasCorrectNextSymbol = !nextSymbol || nextSymbol.match(/[\s\:\-\_\(\),\{\}]/gim);
    return hasPrefix && hasCorrectNextSymbol;
  }
};

module.exports = stylelint.createPlugin(ruleName, function(options) {
  const userOptions = parser.getOptions(options);

  return function(root, result) {
    if (!options) return;
    const validOptions = stylelint.utils.validateOptions(result, ruleName, {
      actual: options,
      possible: optionsSchema,
    });
    if (!validOptions) return;

    root.walkAtRules('keyframes', rule => {
      const keyFramesName = rule.params;
      const prefixSelector = parser.getPrefix(rule, userOptions);
      if (checking.checkOther(keyFramesName, prefixSelector)) return;
      sendErrorMessage(ruleName, result, rule, messages.invalidKeyFrames(keyFramesName, prefixSelector));
    });

    root.walkAtRules('font-face', rule => {
      const prefixSelector = parser.getPrefix(rule, userOptions);
      rule.walkDecls('font-family', (decl) => {
        const fontFamily = decl.value.replace(/["']/gim, '');
        if (checking.checkOther(fontFamily, prefixSelector)) return;
        sendErrorMessage(ruleName, result, rule, messages.invalidFontFace(fontFamily, prefixSelector));
      });
    });

    root.walkRules(rule => {
      if (parser.isInsideAtRule(rule)) return;
      const topParentSelector = parser.findTopParentSelector(rule);
      if ((/^:.*/).test(topParentSelector))  return;
      const prefixSelector = parser.getPrefix(rule, userOptions);
      if (checking.checkClassName(topParentSelector, prefixSelector)) return;
      sendErrorMessage(ruleName, result, rule, messages.invalid(rule.selector, prefixSelector));
    });
  };
});

module.exports.ruleName = ruleName
module.exports.messages = messages