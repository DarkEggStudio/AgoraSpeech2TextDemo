const langs = [
  //2.0.0
  {"code": "en-US", "value": "English (US)"},
  {"code": "en-IN", "value": "English (India)"},
  {"code": "hi-IN", "value": "Hindi (India)"},
  {"code": "ko-KR", "value": "Korean (South Korea)"},
  {"code": "ja-JP", "value": "Japanese (Japan)"},
  {"code": "de-DE", "value": "German (Germany)"},
  {"code": "es-ES", "value": "Spanish (Spain)"},
  {"code": "fr-FR", "value": "French (French)"},
  {"code": "it-IT", "value": "Italian (Italy)"},
  {"code": "zh-CN", "value": "Chinese (Mandarin, Simplified)"},
  {"code": "pt-PT", "value": "Portuguese (Portugal)"},
  // add 2.0.1
  {"code": "zh-HK", "value": "Chinese (Cantonese, Traditional)"},
  {"code": "id-ID", "value": "Indonesian (Indonesia)"},
  {"code": "ar-JO", "value": "Arabic (Jordan)"},
  {"code": "ar-EG", "value": "Arabic (Egyptian)"},
  {"code": "ar-SA", "value": "Arabic (Saudi Arabia)"},
  {"code": "ar-AE", "value": "Arabic (United Arab Emirates)"},
  {"code": "zh-TW", "value": "Chinese (Taiwanese Putonghua)"},
  // add 2.0.2
  {"code": "th-TH", "value": "Thai (Thailand)"},
  {"code": "vi-VN", "value": "Vietnamese (Vietnam)"},
  {"code": "tr-TR", "value": "Turkish (Turkey)"},
  {"code": "ru-RU", "value": "Russian (Russia)"},
  {"code": "ms-MY", "value": "Malay (Malaysia)"},
  {"code": "fa-IR", "value": "Persian (Iran)"},
];

const offlineLangs = [
  {"value": " Auto", "code": "auto"},
]

class LanguageManager {
  languageList = (() => {
    langs.sort(function (a, b) {
      return a.value > b.value ? 1 : -1
    });
    return langs
  })

  offlineLangList = (() => {
    offlineLangs.sort(function (a, b) {
      return a.value > b.value ? 1 : -1
    });
    return offlineLangs
  })
}

let langMgr = (new LanguageManager())
export default langMgr
