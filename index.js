var liffecyleEvent = process.env.npm_lifecycle_event || ''

function capitalizeFirstLetter (s) {
  return s.charAt(0).toUpperCase() + s.slice(1)
}

var pkgScriptEnv
var defaultOpt
var defaultRules

try {
  pkgScriptEnv = require(require('path').join(process.cwd(), './package.json')).scriptsEnv
} finally {
  defaultRules = pkgScriptEnv && pkgScriptEnv.rules || [
    ['env', 'dev', 'qa', 'prod']
  ]
  defaultOpt = pkgScriptEnv && pkgScriptEnv.opt || {
    split: ':',
    skip: true
  }
}

function scriptEnv (rules, opt) {
  opt = Object.assign(defaultOpt, opt || {})

  var objEnv = {}

  rules = (rules || defaultRules).map(function (rule) {
    var ruleName
    var ruleTest

    if (typeof rule === 'string') {
      ruleName = 'is' + capitalizeFirstLetter(rule)

      objEnv[ruleName] = false

      ruleTest = function (eventVerb) { return rule === eventVerb }
    } else {
      ruleName = rule.shift()

      objEnv[ruleName] = rule.shift()

      ruleTest = function (eventVerb) { return rule.indexOf(eventVerb) >= 0 && eventVerb }
    }

    return {
      name: ruleName,
      test: ruleTest
    }
  })

  return liffecyleEvent.split(opt.split).reduce(function (objEnv, eventVerb) {
    for (var j = 0, k = rules.length; j < k; j++) {
      var rule = rules[j]

      var ruleVal = rule.test(eventVerb)

      if (ruleVal) {
        objEnv[rule.name] = ruleVal

        if (opt.skip) { break }
      }
    }

    return objEnv
  }, objEnv)
}

module.exports = scriptEnv
