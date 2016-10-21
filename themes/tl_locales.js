var i18n = require("i18n");

i18n.configure({
  locales:['en', 'cn'],
  defaultLocale: 'en',
  directory:'../locales'
});

var locale = 'en';
var lang = window.navigator.language;
if (lang === 'zh-CN' || lang === 'zh-TW') {
  locale = 'cn';
}
i18n.setLocale(locale);

module.exports.locales = i18n.__;
// ussage, locales('app-slogan')
