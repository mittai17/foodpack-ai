/**
 * i18n-helpers.ts
 *
 * Comprehensive multilingual translations for dynamic entity names:
 * - Food commodity names (Apple, Banana, Mango, Carrot, Rice, etc.)
 * - Category names (Fruits, Vegetables, Dairy, Grains, etc.)
 * - Brand name (FoodPack AI)
 * - Storage condition labels (Chilled, Ambient, Frozen)
 * - Status labels (COMPLETED, PENDING, FAILED)
 */

export const BRAND_NAMES: Record<string, string> = {
  en: 'NutriWrap',
  ta: 'நியூட்ரிவ்ராப்',
  hi: 'न्यूट्रीरैप',
  te: 'న్యూట్రివ్రాప్',
  ml: 'ന്യൂട്രിറാപ്പ്',
  kn: 'ನ್ಯೂಟ್ರಿವ್ರ್ಯಾಪ್',
};

export const FOOD_TRANSLATIONS: Record<string, Record<string, string>> = {
  apple: {
    en: 'Apple',
    ta: 'ஆப்பிள்',
    hi: 'सेब',
    te: 'ఆపిల్',
    ml: 'ആപ്പിൾ',
    kn: 'ಸೇಬು',
  },
  banana: {
    en: 'Banana',
    ta: 'வாழைப்பழம்',
    hi: 'केला',
    te: 'అరటిపండు',
    ml: 'വാഴപ്പഴം',
    kn: 'ಬಾಳೆಹಣ್ಣು',
  },
  biscuits: {
    en: 'Biscuits (commercial)',
    ta: 'பிஸ்கட்கள்',
    hi: 'बिस्कुट',
    te: 'బిస్కెట్లు',
    ml: 'ബിസ്ക്കറ്റ്',
    kn: 'ಬಿಸ್ಕತ್ತುಗಳು',
  },
  carrot: {
    en: 'Carrot',
    ta: 'கேரட்',
    hi: 'गाजर',
    te: 'క్యారెట్',
    ml: 'കാരറ്റ്',
    kn: 'ಕ್ಯಾರೆಟ್',
  },
  cashew: {
    en: 'Cashew (raw kernel)',
    ta: 'முந்திரி பருப்பு',
    hi: 'काजू',
    te: 'జీడిపప్పు',
    ml: 'കശുവണ്ടി',
    kn: 'ಗೋಡಂಬಿ',
  },
  'coffee-roasted-ground': {
    en: 'Coffee (roasted, ground)',
    ta: 'காபி தூள்',
    hi: 'कॉफी पाउडर',
    te: 'కాఫీ పొడి',
    ml: 'കോഫി പൊടി',
    kn: 'ಕಾಫಿ ಪುಡಿ',
  },
  grapes: {
    en: 'Grapes',
    ta: 'திராட்சை',
    hi: 'अंगूर',
    te: 'ద్రాక్ష',
    ml: 'മുന്തിരി',
    kn: 'ದ್ರಾಕ್ಷಿ',
  },
  mango: {
    en: 'Mango',
    ta: 'மாம்பழம்',
    hi: 'आम',
    te: 'మామిడి',
    ml: 'മാമ്പഴം',
    kn: 'ಮಾವಿನಹಣ್ಣು',
  },
  milk: {
    en: 'Milk (pasteurized, whole)',
    ta: 'பால்',
    hi: 'दूध',
    te: 'పాలు',
    ml: 'പാൽ',
    kn: 'ಹಾಲು',
  },
  onion: {
    en: 'Onion',
    ta: 'வெங்காயம்',
    hi: 'प्याज',
    te: 'ఉల్లిపాయ',
    ml: 'സവാള',
    kn: 'ಈರುಳ್ಳಿ',
  },
  paneer: {
    en: 'Paneer (fresh)',
    ta: 'பனீர்',
    hi: 'पनीर',
    te: 'పనీర్',
    ml: 'പനീർ',
    kn: 'ಪನೀರ್',
  },
  potato: {
    en: 'Potato',
    ta: 'உருளைக்கிழங்கு',
    hi: 'आलू',
    te: 'బంగాళాదుంప',
    ml: 'ഉരുളക്കിഴങ്ങ്',
    kn: 'ಆಲೂಗಡ್ಡೆ',
  },
  'potato-chips': {
    en: 'Potato Chips (fried, salted)',
    ta: 'உருளைக்கிழங்கு சிப்ஸ்',
    hi: 'आलू चिप्स',
    te: 'బంగాళాదుంప చిప్స్',
    ml: 'പൊട്ടറ്റോ ചിപ്സ്',
    kn: 'ಆಲೂಗಡ್ಡೆ ಚಿಪ್ಸ್',
  },
  rice: {
    en: 'Rice',
    ta: 'அரிசி',
    hi: 'चावल',
    te: 'బియ్యం',
    ml: 'അരി',
    kn: 'ಅಕ್ಕಿ',
  },
  strawberry: {
    en: 'Strawberry',
    ta: 'ஸ்ட்ராபெரி',
    hi: 'स्ट्रॉबेरी',
    te: 'స్ట్రాబెర్రీ',
    ml: 'സ്ട്രോബെറി',
    kn: 'ಸ್ಟ್ರಾಬೆರಿ',
  },
  tomato: {
    en: 'Tomato',
    ta: 'தக்காளி',
    hi: 'टमाटर',
    te: 'టమోటా',
    ml: 'തക്കാളി',
    kn: 'ಟೊಮೆಟೊ',
  },
  'toor-dal': {
    en: 'Toor Dal (Pigeon Pea, split)',
    ta: 'துவரம் பருப்பு',
    hi: 'अरहर / तूर दाल',
    te: 'కందిపప్పు',
    ml: 'തുവരപ്പരിപ്പ്',
    kn: 'ತೊಗರಿ ಬೇಳೆ',
  },
  'turmeric-powder': {
    en: 'Turmeric Powder',
    ta: 'மஞ்சள் தூள்',
    hi: 'हल्दी पाउडर',
    te: 'పసుపు పొడి',
    ml: 'മഞ്ഞൾപ്പൊടി',
    kn: 'ಅರಿಶಿನ ಪುಡಿ',
  },
  wheat: {
    en: 'Wheat',
    ta: 'கோதுமை',
    hi: 'गेहूं',
    te: 'గోధుమలు',
    ml: 'ഗോതമ്പ്',
    kn: 'ಗೋಧಿ',
  },
  'wheat-flour': {
    en: 'Wheat Flour (Atta)',
    ta: 'கோதுமை மாவு (ஆட்டா)',
    hi: 'गेहूं का आटा',
    te: 'గోధుమ పిండి',
    ml: 'ഗോതമ്പ് പൊടി',
    kn: 'ಗೋಧಿ ಹಿಟ್ಟು',
  },
  capsicum: {
    en: 'Capsicum',
    ta: 'குடைமிளகாய்',
    hi: 'शिमला मिर्च',
    te: 'క్యాప్సికమ్',
    ml: 'ക്യാപ്സിക്കം',
    kn: 'ದಪ್ಪಮೆಣಸಿನಕಾಯಿ',
  },
  'leafy-veg': {
    en: 'Leafy veg',
    ta: 'கீரை வகைகள்',
    hi: 'पत्तेदार सब्जियां',
    te: 'ఆకుకూరలు',
    ml: 'ഇലക്കറികൾ',
    kn: 'ಸೊಪ್ಪುಗಳು',
  },
};

export const CATEGORY_TRANSLATIONS: Record<string, Record<string, string>> = {
  all: {
    en: 'All',
    ta: 'அனைத்தும்',
    hi: 'सभी',
    te: 'అన్నీ',
    ml: 'എല്ലാം',
    kn: 'ಎಲ್ಲಾ',
  },
  fruits: {
    en: 'Fruits',
    ta: 'பழங்கள்',
    hi: 'फल',
    te: 'పండ్లు',
    ml: 'പഴങ്ങൾ',
    kn: 'ಹಣ್ಣುಗಳು',
  },
  vegetables: {
    en: 'Vegetables',
    ta: 'காய்கறிகள்',
    hi: 'सब्जियां',
    te: 'కూరగాయలు',
    ml: 'പച്ചക്കറികൾ',
    kn: 'ತರಕಾರಿಗಳು',
  },
  dairy: {
    en: 'Dairy',
    ta: 'பால் பொருட்கள்',
    hi: 'डेयरी उत्पाद',
    te: 'పాల ఉత్పత్తులు',
    ml: 'ക്ഷീരോൽപ്പന്നങ്ങൾ',
    kn: 'ಹಾಲು ಉತ್ಪನ್ನಗಳು',
  },
  beverages: {
    en: 'Beverages',
    ta: 'பானங்கள்',
    hi: 'पेय पदार्थ',
    te: 'పానీయాలు',
    ml: 'പാനീയങ്ങൾ',
    kn: 'ಪಾನೀಯಗಳು',
  },
  'grains-cereals': {
    en: 'Grains & Cereals',
    ta: 'தானியங்கள்',
    hi: 'अनाज',
    te: 'ధాన్యాలు',
    ml: 'ധാന്യങ്ങൾ',
    kn: 'ಧಾನ್ಯಗಳು',
  },
  grains: {
    en: 'Grains & Cereals',
    ta: 'தானியங்கள்',
    hi: 'अनाज',
    te: 'ధాన్యాలు',
    ml: 'ധാന്യങ്ങൾ',
    kn: 'ಧಾನ್ಯಗಳು',
  },
  nuts: {
    en: 'Nuts',
    ta: 'கொட்டைகள் & விதைகள்',
    hi: 'मेवे और बीज',
    te: 'గింజలు & విత్తనాలు',
    ml: 'നട്സ് & വിത്തുകൾ',
    kn: 'ಬೀಜಗಳು',
  },
  'nuts-seeds': {
    en: 'Nuts & Seeds',
    ta: 'கொட்டைகள் & விதைகள்',
    hi: 'मेवे और बीज',
    te: 'గింజలు & విత్తనాలు',
    ml: 'നട്സ് & വിത്തുകൾ',
    kn: 'ಬೀಜಗಳು',
  },
  'processed-bakery': {
    en: 'Processed & Bakery',
    ta: 'பதப்படுத்தப்பட்டவை & பேக்கரி',
    hi: 'प्रसंस्कृत और बेकरी',
    te: 'ప్రాసెస్డ్ & బేకరీ',
    ml: 'സംസ്കരിച്ചവ & ബേക്കറി',
    kn: 'ಸಂಸ್ಕರಿಸಿದ ಮತ್ತು ಬೇಕರಿ',
  },
  pulses: {
    en: 'Pulses',
    ta: 'பருப்பு வகைகள்',
    hi: 'दालें',
    te: 'పప్పుధాನ್ಯాలు',
    ml: 'പയർവർഗ്ഗങ്ങൾ',
    kn: 'ದ್ವಿದಳ ಧಾನ್ಯಗಳು',
  },
    spices: {
    en: 'Spices',
    ta: 'மசாலாப் பொருட்கள்',
    hi: 'मसाले',
    te: 'మసాలాలు',
    ml: 'സുഗന്ധവ്യഞ്ജനങ്ങൾ',
    kn: 'ಮಸಾಲೆಗಳು',
  },
  'bakery-snacks': {
    en: 'Bakery & Snacks',
    ta: 'பேக்கரி & தின்பண்டங்கள்',
    hi: 'बेकरी और स्नैक्स',
    te: 'బేకరీ & స్నాక్స్',
    ml: 'ബേക്കറി & സ്നാക്ക്സ്',
    kn: 'ಬೇಕರಿ ಮತ್ತು ತಿಂಡಿಗಳು',
  },
  'processed-foods': {
    en: 'Processed Foods',
    ta: 'பதப்படுத்தப்பட்ட உணவுகள்',
    hi: 'प्रसंस्कृत खाद्य पदार्थ',
    te: 'ప్రాసెస్ చేసిన ఆహారాలు',
    ml: 'സംസ്കരിച്ച ഭക്ഷണങ്ങൾ',
    kn: 'ಸಂಸ್ಕರಿಸಿದ ಆಹಾರಗಳು',
  },
  'frozen-foods': {
    en: 'Frozen Foods',
    ta: 'உறைந்த உணவுகள்',
    hi: 'जमे हुए खाद्य पदार्थ',
    te: 'ఘనీభవించిన ఆహారాలు',
    ml: 'ശീതീകരിച്ച ഭക്ഷണങ്ങൾ',
    kn: 'ಘನೀಕೃತ ಆಹಾರಗಳು',
  },
  'meat-poultry': {
    en: 'Meat & Poultry',
    ta: 'இறைச்சி & கோழி',
    hi: 'मांस और पोल्ट्री',
    te: 'మాంసం & పౌల్ట్రీ',
    ml: 'മാംസം & കോഴിയിറച്ചി',
    kn: 'ಮಾಂಸ ಮತ್ತು ಕೋಳಿ',
  },
};

export const STORAGE_TRANSLATIONS: Record<string, Record<string, string>> = {
  CHILLED: {
    en: 'Chilled (refrigerated)',
    ta: 'குளிரூட்டப்பட்டது',
    hi: 'शीतित (रेफ्रिजरेटेड)',
    te: 'శీతలీకరించబడింది',
    ml: 'ശീതീകരിച്ചത്',
    kn: 'ಶೀತಲೀಕರಿಸಲಾಗಿದೆ',
  },
  AMBIENT: {
    en: 'Ambient / room temperature',
    ta: 'அறை வெப்பநிலை',
    hi: 'कमरे का तापमान',
    te: 'గది ఉష్ణోగ్రత',
    ml: 'സാധാരണ താപനില',
    kn: 'ಕೊಠಡಿ ತಾಪಮಾನ',
  },
  FROZEN: {
    en: 'Frozen',
    ta: 'உறைநிலை',
    hi: 'जमा हुआ (फ्रोजन)',
    te: 'ఘనీభవించిన',
    ml: 'ഫ്രോസൺ',
    kn: 'ಘನೀಕೃತ',
  },
  refrigerated: {
    en: 'Refrigerated',
    ta: 'குளிரூட்டப்பட்டது',
    hi: 'शीतित',
    te: 'శీతలీకరించబడింది',
    ml: 'ശീതീകരിച്ചത്',
    kn: 'ಶೀತಲೀಕರಿಸಲಾಗಿದೆ',
  },
  ambient: {
    en: 'Ambient',
    ta: 'அறை வெப்பநிலை',
    hi: 'सामान्य तापमान',
    te: 'సాధారణ ఉష్ణోగ్రత',
    ml: 'സാധാരണ താപനില',
    kn: 'ಸಾಮಾನ್ಯ ತಾಪಮಾನ',
  },
  frozen: {
    en: 'Frozen',
    ta: 'உறைநிலை',
    hi: 'जमा हुआ',
    te: 'ఘనీభవించిన',
    ml: 'ഫ്രോസൺ',
    kn: 'ಘನೀಕೃತ',
  },
};

export const STATUS_TRANSLATIONS: Record<string, Record<string, string>> = {
  COMPLETED: {
    en: 'COMPLETED',
    ta: 'நிறைவடைந்தது',
    hi: 'पूर्ण',
    te: 'పూర్తయింది',
    ml: 'പൂർത്തിയായി',
    kn: 'ಪೂರ್ಣಗೊಂಡಿದೆ',
  },
  PENDING: {
    en: 'PENDING',
    ta: 'நிலுவையில் உள்ளது',
    hi: 'लंबित',
    te: 'పెండింగ్‌లో ఉంది',
    ml: 'തീർപ്പാക്കാത്തത്',
    kn: 'ಬಾಕಿ ಉಳಿದಿದೆ',
  },
  FAILED: {
    en: 'FAILED',
    ta: 'தோல்வியடைந்தது',
    hi: 'विफल',
    te: 'విఫలమైంది',
    ml: 'പരാജയപ്പെട്ടു',
    kn: 'ವಿಫಲವಾಗಿದೆ',
  },
};

/**
 * Return localized food name based on slug or fallback name.
 */
export function getFoodName(
  food: { slug?: string; name: string } | string | null | undefined,
  locale = 'en'
): string {
  if (!food) return '';
  if (typeof food === 'string') {
    const slug = food.toLowerCase().trim();
    if (FOOD_TRANSLATIONS[slug]?.[locale]) {
      return FOOD_TRANSLATIONS[slug][locale];
    }
    const nameKey = food.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
    if (FOOD_TRANSLATIONS[nameKey]?.[locale]) {
      return FOOD_TRANSLATIONS[nameKey][locale];
    }
    return food;
  }
  const slug = food.slug?.toLowerCase().trim();
  if (slug && FOOD_TRANSLATIONS[slug]?.[locale]) {
    return FOOD_TRANSLATIONS[slug][locale];
  }
  // Try matching by lowercase name key
  const nameKey = food.name?.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
  if (nameKey && FOOD_TRANSLATIONS[nameKey]?.[locale]) {
    return FOOD_TRANSLATIONS[nameKey][locale];
  }
  return food.name;
}

/**
 * Return localized category name based on category object or slug.
 */
export function getCategoryName(
  category: { slug?: string; name: string } | string | undefined,
  locale = 'en'
): string {
  if (!category) return '';
  const slug = typeof category === 'string' ? category.toLowerCase().trim() : category.slug?.toLowerCase().trim();
  if (slug && CATEGORY_TRANSLATIONS[slug]?.[locale]) {
    return CATEGORY_TRANSLATIONS[slug][locale];
  }
  if (typeof category === 'object' && category.name) {
    const nameKey = category.name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
    if (nameKey && CATEGORY_TRANSLATIONS[nameKey]?.[locale]) {
      return CATEGORY_TRANSLATIONS[nameKey][locale];
    }
    return category.name;
  }
  return String(category);
}

/**
 * Return localized brand name (FoodPack AI).
 */
export function getBrandName(locale = 'en'): string {
  return BRAND_NAMES[locale] ?? BRAND_NAMES.en;
}

/**
 * Return localized storage condition label.
 */
export function getStorageLabel(storageType: string, locale = 'en'): string {
  return STORAGE_TRANSLATIONS[storageType]?.[locale] ?? storageType;
}

/**
 * Return localized analysis status badge label.
 */
export function getStatusLabel(status: string, locale = 'en'): string {
  return STATUS_TRANSLATIONS[status]?.[locale] ?? status;
}

export const MATERIAL_TRANSLATIONS: Record<
  string,
  { name: Record<string, string>; description?: Record<string, string> }
> = {
  ldpe: {
    name: {
      en: 'LDPE Film',
      ta: 'LDPE பிலிம்',
      hi: 'एलडीपीई फिल्म',
      te: 'LDPE ఫిల్మ్',
      ml: 'എൽഡിപിഇ ഫിലിം',
      kn: 'ಎಲ್ ಡಿ ಪಿ ಇ ಫಿಲ್ಮ್',
    },
    description: {
      en: 'Low-density polyethylene film — cheap, heat-sealable, moderate barrier.',
      ta: 'குறைந்த அடர்த்தி பாலிஎதிலீன் படம் — மலிவானது, வெப்பத்தால் சீல் செய்யக்கூடியது, மிதமான தடை.',
      hi: 'कम घनत्व पॉलीथीन फिल्म — सस्ती, हीट-सीलेबल, मध्यम अवरोधक।',
      te: 'తక్కువ సాంద్రత కలిగిన పాలీథిలిన్ ఫిల్మ్ — సరసమైనది, హీట్-సీల్ చేయదగినది, మధ్యస్థ అవరోధం.',
      ml: 'കുറഞ്ഞ സാന്ദ്രതയുള്ള പോളിയെത്തിലീൻ ഫിലിം — താങ്ങാനാവുന്നത്, ഹീറ്റ് സീൽ ചെയ്യാവുന്നത്.',
      kn: 'ಕಡಿಮೆ ಸಾಂದ್ರತೆಯ ಪಾಲಿಥಿಲೀನ್ ಫಿಲ್ಮ್ — ಅಗ್ಗದ, ಹೀಟ್-ಸೀಲ್ ಮಾಡಬಹುದಾದ, ಮಧ್ಯಮ ತಡೆಗೋಡೆ.',
    },
  },
  hdpe: {
    name: {
      en: 'HDPE',
      ta: 'HDPE (அதி அடர்த்தி பாலிஎதிலீன்)',
      hi: 'एचडीपीई (उच्च घनत्व पॉलीथीन)',
      te: 'HDPE (అధిక సాంద్రత పాలీథిలిన్)',
      ml: 'എച്ച്ഡിപിഇ',
      kn: 'ಹೆಚ್ ಡಿ ಪಿ ಇ',
    },
    description: {
      en: 'High-density polyethylene — stiffer and a better barrier than LDPE; common for bottles.',
      ta: 'அதி அடர்த்தி பாலிஎதிலீன் — LDPE ஐ விட உறுதியானது மற்றும் சிறந்த தடைத்திறன் கொண்டது; பாட்டில்களுக்கு பொதுவானது.',
      hi: 'उच्च घनत्व पॉलीथीन — एलडीपीई की तुलना में कठोर और बेहतर अवरोधक; बोतलों के लिए आम।',
      te: 'అధిక సాంద్రత పాలీథిలిన్ — LDPE కంటే గట్టిగా మరియు మెరుగైన అవరోధం; బాటిళ్లకు సర్వసాధారణం.',
      ml: 'ഉയർന്ന സാന്ദ്രതയുള്ള പോളിയെത്തിലീൻ — കുപ്പികൾക്ക് അനുയോജ്യം.',
      kn: 'ಹೆಚ್ಚಿನ ಸಾಂದ್ರತೆಯ ಪಾಲಿಥಿಲೀನ್ — ಬಾಟಲಿಗಳಿಗೆ ಸಾಮಾನ್ಯ.',
    },
  },
  bopp: {
    name: {
      en: 'BOPP Film',
      ta: 'BOPP பிலிம்',
      hi: 'बीओपीपी फिल्म',
      te: 'BOPP ఫిల్మ్',
      ml: 'ബിഒപിപി ഫിലിം',
      kn: 'ಬಿಒಪಿಪಿ ಫಿಲ್ಮ್',
    },
    description: {
      en: 'Biaxially oriented polypropylene — good moisture barrier, high mechanical strength, common outer web.',
      ta: 'இருஅச்சு பாலிப்ரோப்பிலீன் — சிறந்த ஈரப்பத தடை, அதிக இயந்திர வலிமை.',
      hi: 'द्विअक्षीय उन्मुख पॉलीप्रोपाइलीन — अच्छा नमी अवरोधक, उच्च यांत्रिक शक्ति।',
      te: 'ద్వయాక్ష ఓరియెంటెడ్ పాలీప్రొపీలిన్ — మంచి తేమ అవరోధం, అధిక బలం.',
      ml: 'ബയാക്സിയൽ ഓറിയന്റഡ് പോളിപ്രൊപിലീൻ — ഈർപ്പ പ്രതിരോധം.',
      kn: 'ಉತ್ತಮ ತೇವಾಂಶ ತಡೆಗೋಡೆ ಮತ್ತು ಯಾಂತ್ರಿಕ ಶಕ್ತಿ.',
    },
  },
  'pet-film': {
    name: {
      en: 'PET Film (BoPET)',
      ta: 'PET பிலிம் (BoPET)',
      hi: 'पीईटी फिल्म (BoPET)',
      te: 'PET ఫిల్మ్ (BoPET)',
      ml: 'പിഇടി ഫിലിം (BoPET)',
      kn: 'ಪಿಇಟಿ ಫಿಲ್ಮ್ (BoPET)',
    },
    description: {
      en: 'Biaxially oriented PET film — good oxygen barrier, high clarity and strength, common outer/structural layer.',
      ta: 'BoPET பிலிம் — சிறந்த ஆக்சிஜன் தடை, அதிக தெளிவு மற்றும் வலிமை.',
      hi: 'BoPET फिल्म — अच्छा ऑक्सीजन अवरोधक, उच्च स्पष्टता और मजबूती।',
      te: 'BoPET ఫిల్మ్ — మంచి ఆక్సిజన్ అవరోధం, అధిక స్పష్టత మరియు బలం.',
      ml: 'BoPET ഫിലിം — നല്ല ഓക്സിജൻ പ്രതിരോധം, ഉയർന്ന വ്യക്തത.',
      kn: 'BoPET ಫಿಲ್ಮ್ — ಉತ್ತಮ ಆಮ್ಲಜನಕ ತಡೆಗೋಡೆ ಮತ್ತು ಸ್ಪಷ್ಟತೆ.',
    },
  },
  'metallized-pet': {
    name: {
      en: 'Metallized Film',
      ta: 'மெட்டலைஸ்ட் பிலிம்',
      hi: 'मेटलाइज्ड फिल्म',
      te: 'మెటలైజ్డ్ ఫిల్మ్',
      ml: 'മെറ്റലൈസ്ഡ് ഫിലിം',
      kn: 'ಮೆಟಲೈಸ್ಡ್ ಫಿಲ್ಮ್',
    },
    description: {
      en: 'Vacuum-metallized PET/BOPP — dramatically improved O2/moisture barrier vs. the unmetallized base film.',
      ta: 'வெற்றிட-உலோகப்படுத்தப்பட்ட PET/BOPP — சிறந்த ஆக்சிஜன் மற்றும் ஈரப்பத தடை.',
      hi: 'वैक्यूम-मेटलाइज्ड PET/BOPP — ऑक्सीजन और नमी से अत्यधिक सुरक्षा।',
      te: 'వాక్యూమ్-మెటలైజ్డ్ PET/BOPP — అత్యుత్తమ ఆక్సిజన్ మరియు తేమ రక్షణ.',
      ml: 'വാക്വം മെറ്റലൈസ്ഡ് ഫിലിം — മികച്ച ഓക്സിജൻ/ഈർപ്പ തടസ്സം.',
      kn: 'ವ್ಯಾಕ್ಯೂಮ್-ಮೆಟಲೈಸ್ಡ್ ಫಿಲ್ಮ್ — ಅತ್ಯುತ್ತಮ ತಡೆಗೋಡೆ.',
    },
  },
  'alu-foil-laminate': {
    name: {
      en: 'Aluminum Foil Laminate',
      ta: 'அலுமினியம் ஃபாயில் லேமினேட்',
      hi: 'एल्युमिनियम फॉयल लैमिनेट',
      te: 'అల్యూమినియం ఫాయిల్ లామినేట్',
      ml: 'അലുമിനിയം ഫോയിൽ ലാമിനേറ്റ്',
      kn: 'ಅಲ್ಯೂಮಿನಿಯಂ ಫಾಯಿಲ್ ಲ್ಯಾಮಿನೇಟ್',
    },
    description: {
      en: 'PET/Aluminum-foil/PE laminate — near-total gas and moisture barrier, used for the most oxidation-sensitive products.',
      ta: 'அலுமினியம் ஃபாயில் லேமினேட் — முழுமையான வாயு மற்றும் ஈரப்பத தடை, ஆக்ஸிஜனேற்ற உணர்திறன் பொருட்களுக்கு.',
      hi: 'एल्युमिनियम फॉयल लैमिनेट — पूर्ण गैस और नमी अवरोधक, संवेदनशील खाद्य पदार्थों के लिए।',
      te: 'PET/అల్యూమినియం-ఫాయిల్/PE లామినేట్ — దాదాపు పూర్తి గ్యాస్ మరియు తేమ అవరోధం.',
      ml: 'അലുമിനിയം ഫോയിൽ ലാമിനേറ്റ് — പൂർണ്ണ വാതക/ഈർപ്പ പ്രതിരോധം.',
      kn: 'ಅಲ್ಯೂಮಿನಿಯಂ ಫಾಯಿಲ್ ಲ್ಯಾಮಿನೇಟ್ — ಸಂಪೂರ್ಣ ಅನಿಲ ಮತ್ತು ತೇವಾಂಶ ತಡೆಗೋಡೆ.',
    },
  },
  'pla-film': {
    name: {
      en: 'PLA Film',
      ta: 'PLA பிலிம்',
      hi: 'पीएलए फिल्म',
      te: 'PLA ఫిల్మ్',
      ml: 'പിഎൽഎ ഫിലിം',
      kn: 'ಪಿಎಲ್ಎ ಫಿಲ್ಮ್',
    },
    description: {
      en: 'Compostable polylactic-acid film. Weaker O2 barrier than PET; industrially compostable, not home-recyclable.',
      ta: 'மக்கும் பாலிแลக்டிக் அமில பிலிம் — தொழில்துறை ரீதியாக மக்கக்கூடியது.',
      hi: 'कंपोस्टेबल पॉलीलैक्टिक एसिड फिल्म — औद्योगिक रूप से कंपोस्टेबल।',
      te: 'కంపోస్టబుల్ పాలీలాక్టిక్ యాసిడ్ ఫిల్మ్ — పారిశ్రామికంగా కంపోస్ట్ చేయదగినది.',
      ml: 'കംപോസ്റ്റബിൾ പോളിലാക്റ്റിക് ആസിഡ് ഫിലിം.',
      kn: 'ಕಾಂಪೋಸ್ಟೆಬಲ್ ಪಾಲಿಲ್ಯಾಕ್ಟಿಕ್ ಆಮ್ಲದ ಫಿಲ್ಮ್.',
    },
  },
  'cellulose-film': {
    name: {
      en: 'Cellulose Film',
      ta: 'செல்லுலோஸ் பிலிம்',
      hi: 'सेल्यूलोज फिल्म',
      te: 'సెల్యులోజ్ ఫిల్మ్',
      ml: 'സെല്ലുലോസ് ഫിലിം',
      kn: 'ಸೆಲ್ಯುಲೋಸ್ ಫಿಲ್ಮ್',
    },
    description: {
      en: 'Compostable cellulose-based film (e.g. NatureFlex-type). Barrier varies significantly with any applied coating.',
      ta: 'மக்கக்கூடிய செல்லுலோஸ் அடிப்படையிலான பிலிம்.',
      hi: 'कंपोस्टेबल सेल्यूलोज आधारित फिल्म।',
      te: 'కంపోస్టబుల్ సెల్యులోజ్ ఆధారిత ఫిల్మ్ (ఉదా. నేచర్‌ఫ్లెక్స్).',
      ml: 'കംപോസ്റ്റബിൾ സെല്ലുലോസ് ഫിലിം.',
      kn: 'ಕಾಂಪೋಸ್ಟೆಬಲ್ ಸೆಲ್ಯುಲೋಸ್ ಆಧಾರಿತ ಫಿಲ್ಮ್.',
    },
  },
  'micro-perforated-bopp': {
    name: {
      en: 'Micro-Perforated BOPP Film',
      ta: 'நுண் துளையிடப்பட்ட BOPP பிலிம்',
      hi: 'माइक्रो-छिद्रित बीओपीपी फिल्म',
      te: 'మైక్రో-రంధ్రాల BOPP ఫిల్మ్',
      ml: 'മൈക്രോ-പെർഫൊറേറ്റഡ് ബിഒപിപി ഫിലിം',
      kn: 'ಮೈಕ್ರೋ-ಪರ್ಫೊರೇಟೆಡ್ ಬಿಒಪಿಪಿ ಫಿಲ್ಮ್',
    },
    description: {
      en: "BOPP film engineered with laser micro-perforations so OTR/WVTR can be tuned to a commodity's respiration rate.",
      ta: 'புதிய விளைபொருட்களின் சுவாச விகிதத்திற்கு ஏற்ற லேசர் நுண் துளையிடப்பட்ட படம்.',
      hi: 'ताजे उत्पादों की श्वसन दर के अनुरूप लेजर माइक्रो-छिद्रित फिल्म।',
      te: 'లేజర్ మైక్రో-రంధ్రాలతో కూడిన BOPP ఫిల్మ్ — తాజా ఉత్పత్తుల శ్వాసక్రియకు అనుకూలం.',
      ml: 'ശ്വസന നിരക്കിന് അനുയോജ്യമായ മൈക്രോ-പെർഫൊറേറ്റഡ് ഫിലിം.',
      kn: 'ಉಸಿರಾಟದ ದರಕ್ಕೆ ಅನುಗುಣವಾಗಿ ವಿನ್ಯಾಸಗೊಳಿಸಲಾದ ಮೈಕ್ರೋ-ರಂಧ್ರಗಳ ಫಿಲ್ಮ್.',
    },
  },
  'kraft-pe-liner': {
    name: {
      en: 'Kraft Paper with PE Liner',
      ta: 'PE லைனருடன் கிராஃப்ட் பேப்பர்',
      hi: 'पीई लाइनर के साथ क्राफ्ट पेपर',
      te: 'PE లైనర్‌తో క్రాఫ్ట్ పేపర్',
      ml: 'പിഇ ലൈനറുള്ള ക്രാഫ്റ്റ് പേപ്പർ',
      kn: 'ಪಿಇ ಲೈನರ್ ಕ್ರಾಫ್ಟ್ ಪೇಪರ್',
    },
    description: {
      en: 'Kraft paper laminated with a thin PE liner — mechanical protection and a moisture liner for dry granular goods.',
      ta: 'உலர்ந்த தானியப் பொருட்களுக்கான இயந்திர பாதுகாப்பு மற்றும் ஈரப்பதம் தாங்கும் காகிதம்.',
      hi: 'सूखे सामानों के लिए यांत्रिक सुरक्षा और नमी प्रतिरोधी लाइनर वाला क्राफ्ट पेपर।',
      te: 'PE లైనర్‌తో లామినేట్ చేయబడిన క్రాఫ్ట్ పేపర్ — పొడి వస్తువులకు తేమ మరియు యాంత్రిక రక్షణ.',
      ml: 'മെക്കാനിക്കൽ സംരക്ഷണവും ഈർപ്പ ലൈനറും ഉള്ള ക്രാഫ്റ്റ് പേപ്പർ.',
      kn: 'ಯಾಂತ್ರಿಕ ರಕ್ಷಣೆ ಮತ್ತು ತೇವಾಂಶ ತಡೆಗೋಡೆ ಹೊಂದಿರುವ ಕ್ರಾಫ್ಟ್ ಪೇಪರ್.',
    },
  },
  'rigid-pet-tray': {
    name: {
      en: 'Rigid PET Tray',
      ta: 'திடமான PET தட்டு',
      hi: 'कठोर पीईटी ट्रे',
      te: 'దృఢమైన PET ట్రే',
      ml: 'റിജിഡ് പിഇടി ട്രേ',
      kn: 'ದೃಢವಾದ ಪಿಇಟಿ ಟ್ರೇ',
    },
    description: {
      en: 'Thermoformed rigid PET tray for produce trays/clamshells.',
      ta: 'பழங்கள் மற்றும் புதிய பொருட்களுக்கான தெர்மோஃபார்ம் செய்யப்பட்ட திட PET தட்டு.',
      hi: 'ताजे उत्पादों के लिए थर्मोफॉर्म कठोर पीईटी ट्रे।',
      te: 'తాజా పండ్లు మరియు కూరగాయల కోసం థర్మోఫార్మ్డ్ గట్టి PET ట్రే.',
      ml: 'ഉൽപന്നങ്ങൾക്കായുള്ള തെർമോഫോം ചെയ്ത പിഇടി ട്രേ.',
      kn: 'ಉತ್ಪನ್ನಗಳಿಗಾಗಿ ಥರ್ಮೋಫಾರ್ಮ್ ಮಾಡಿದ ದೃಢವಾದ ಪಿಇಟಿ ಟ್ರೇ.',
    },
  },
  paperboard: {
    name: {
      en: 'Paperboard',
      ta: 'பேப்பர்போர்டு (அட்டை)',
      hi: 'पेपरबोर्ड (गत्ता)',
      te: 'పేపర్‌బోర్డ్',
      ml: 'പേപ്പർബോർഡ്',
      kn: 'ಪೇಪರ್‌ಬೋರ್ಡ್',
    },
    description: {
      en: 'Folding carton board — recyclable and biodegradable, low intrinsic barrier.',
      ta: 'மடக்கும் அட்டைப்பெட்டி — மறுசுழற்சி செய்யக்கூடியது, மக்கும் தன்மை கொண்டது.',
      hi: 'फोल्डिंग कार्टन बोर्ड — पुनर्चक्रण योग्य और बायोडिग्रेडेबल।',
      te: 'మడత కార్టన్ బోర్డు — రీసైకిల్ చేయదగినది మరియు బయోడిగ్రేడబుల్.',
      ml: 'മടക്കാവുന്ന കാർട്ടൺ ബോർഡ് — പുനരുപയോഗിക്കാവുന്നത്.',
      kn: 'ಮಡಿಸಬಹುದಾದ ರಟ್ಟಿನ ಬೋರ್ಡ್ — ಮರುಬಳಕೆ ಮಾಡಬಹುದಾದ್ದು.',
    },
  },
  'vented-hdpe-crate': {
    name: {
      en: 'Vented HDPE Crate Wall',
      ta: 'துளையிடப்பட்ட HDPE கிரேட்',
      hi: 'हवादार एचडीपीई क्रेट',
      te: 'వెంటిలేటెడ్ HDPE క్రేట్',
      ml: 'വെന്റിലേറ്റഡ് എച്ച്ഡിപിഇ ക്രേറ്റ്',
      kn: 'ಗಾಳಿಯಾಡುವ ಹೆಚ್ ಡಿ ಪಿ ಇ ಕ್ರೇಟ್',
    },
    description: {
      en: 'Injection-molded HDPE crate wall with open vent slots — for stacked fresh-produce transport.',
      ta: 'புதிய விளைபொருட்களின் திறந்த காற்றோட்ட போக்குவரத்திற்கான HDPE கிரேட்.',
      hi: 'ताजा उपज परिवहन के लिए वेंटिलेशन युक्त मजबूत एचडीपीई क्रेट।',
      te: 'గాలి ప్రసరించే రంధ్రాలతో కూడిన HDPE క్రేట్ — తాజా ఉత్పత్తుల రవాణాకు.',
      ml: 'ഉൽപന്ന ഗതാഗതത്തിനായി തുറന്ന വെന്റുകളുള്ള ക്രേറ്റ്.',
      kn: 'ತಾಜಾ ಉತ್ಪನ್ನಗಳ ಸಾಗಣೆಗೆ ಸೂಕ್ತವಾದ ಕ್ರೇಟ್.',
    },
  },
  'woven-pp-fabric': {
    name: {
      en: 'Woven PP Fabric',
      ta: 'நெய்த PP துணி (சாக்கு)',
      hi: 'बुना हुआ पीपी कपड़ा',
      te: 'నేసిన PP ఫ్యాబ్రిక్',
      ml: 'നെയ്ത പിപി ഫാബ്രിക്',
      kn: 'ನೇಯ್ದ ಪಿಪಿ ಬಟ್ಟೆ',
    },
    description: {
      en: 'Woven polypropylene tape fabric — the standard bulk sack material (grain, onion, potato).',
      ta: 'தானியங்கள், வெங்காயம் மற்றும் உருளைக்கிழங்கு மொத்த மூட்டைகளுக்கான பாலிப்ரோப்பிலீன் பை.',
      hi: 'अनाज, प्याज और आलू के थोक परिवहन के लिए मानक मजबूत बोरी।',
      te: 'నేసిన పాలీప్రొపీలిన్ ఫ్యాబ్రిక్ — ధాన్యాలు, ఉల్లిపాయల బల్క్ రవాణా కోసం ప్రామాణిక సంచి.',
      ml: 'ധാന്യങ്ങൾക്കും പച്ചക്കറികൾക്കും ഉപയോഗിക്കുന്ന ബൾക്ക് ചാക്ക്.',
      kn: 'ಧಾನ್ಯಗಳು ಮತ್ತು ತರಕಾರಿಗಳ ಸಗಟು ಸಾಗಣೆಗೆ ಬಳಸುವ ಚೀಲ.',
    },
  },
  'jute-fabric': {
    name: {
      en: 'Jute Fabric',
      ta: 'சணல் துணி (கோணிப்பை)',
      hi: 'जूट का कपड़ा (बोरी)',
      te: 'జనపనార ఫ్యాబ్రిక్',
      ml: 'ചണം ഫാബ്രിക്',
      kn: 'ಸೆಣಬಿನ ಬಟ್ಟೆ (ಗೋಣಿ ಚೀಲ)',
    },
    description: {
      en: 'Woven natural jute sacking — biodegradable, breathable, the traditional Indian bulk sack material.',
      ta: 'பாரம்பரிய இந்திய இயற்கை சணல் சாக்கு — மக்கும் தன்மை மற்றும் காற்றோட்டம் கொண்டது.',
      hi: 'पारंपरिक भारतीय प्राकृतिक जूट बोरी — बायोडिग्रेडेबल और हवादार।',
      te: 'సహజ జనపనార గోనె సంచి — బయోడిగ్రేడబుల్ మరియు గాలి ప్రసరించేది.',
      ml: 'പരമ്പരാഗത ഇന്ത്യൻ ചണച്ചാക്ക് — കംപോസ്റ്റബിൾ.',
      kn: 'ಸಾಂಪ್ರದಾಯಿಕ ನೈಸರ್ಗಿಕ ಸೆಣಬಿನ ಚೀಲ — ಪರಿಸರಸ್ನೇಹಿ ಮತ್ತು ಗಾಳಿಯಾಡುವಂಥದ್ದು.',
    },
  },
  'corrugated-fiberboard': {
    name: {
      en: 'Corrugated Fiberboard',
      ta: 'அலைநெளி அட்டைப்பெட்டி',
      hi: 'नालीदार कार्डबोर्ड (कोरुगेटेड बॉक्स)',
      te: 'ముడతల కార్డ్‌బోర్డ్',
      ml: 'കോറഗേറ്റഡ് ഫൈബർബോർഡ്',
      kn: 'ಸುಕ್ಕುಗಟ್ಟಿದ ಕಾರ್ಡ್‌ಬೋರ್ಡ್',
    },
    description: {
      en: 'Corrugated cardboard — recyclable, biodegradable, the standard export-grade carton.',
      ta: 'மறுசுழற்சி செய்யக்கூடிய ஏற்றுமதி தர அலைநெளி அட்டைப்பெட்டி.',
      hi: 'पुनर्चक्रण योग्य निर्यात-ग्रेड नालीदार कार्डबोर्ड कार्टन।',
      te: 'ముడతల కార్డ్‌బోర్డ్ — రీసైకిల్ చేయదగిన ఎగుమతి గ్రేడ్ కార్టన్ బాక్స్.',
      ml: 'കയറ്റുമതി നിലവാരമുള്ള കോറഗേറ്റഡ് കാർട്ടൺ.',
      kn: 'ರಫ್ತು ದರ್ಜೆಯ ಸುಕ್ಕುಗಟ್ಟಿದ ರಟ್ಟಿನ ಪೆಟ್ಟಿಗೆ.',
    },
  },
  'stainless-steel': {
    name: {
      en: 'Stainless Steel (food-grade)',
      ta: 'துருப்பிடிக்காத எஃகு (உணவு தரம்)',
      hi: 'स्टेनलेस स्टील (खाद्य-ग्रेड)',
      te: 'స్టెయిన్‌లెస్ స్టీల్ (ఫుడ్-గ్రేడ్)',
      ml: 'സ്റ്റെയിൻലെസ്സ് സ്റ്റീൽ (ഭക്ഷ്യ-ഗ്രേഡ്)',
      kn: 'ಸ್ಟೇನ್‌ಲೆಸ್ ಸ್ಟೀಲ್ (ಆಹಾರ-ದರ್ಜೆ)',
    },
    description: {
      en: 'Food-grade stainless steel — the traditional Indian dairy milk can (~40L), reusable, impermeable.',
      ta: 'பாரம்பரிய பால் கேன்களுக்கான உணவு தர துருப்பிடிக்காத எஃகு — மீண்டும் பயன்படுத்தக்கூடியது.',
      hi: 'पारंपरिक दूध के डिब्बों के लिए खाद्य-ग्रेड स्टेनलेस स्टील — पुन: प्रयोज्य, टिकाऊ।',
      te: 'ఫుడ్-గ్రేడ్ స్టెయిన్‌లెస్ స్టీల్ — సాంప్రదాయ పాల రవాణా క్యాన్‌లు, పునర్వినియోగించదగినది.',
      ml: 'പരമ്പരാഗത പാൽ കാനുകൾക്കായുള്ള സ്റ്റെയിൻലെസ്സ് സ്റ്റീൽ.',
      kn: 'ಸಾಂಪ್ರದಾಯಿಕ ಹಾಲಿನ ಕ್ಯಾನ್‌ಗಳಿಗೆ ಬಳಸುವ ಆಹಾರ-ದರ್ಜೆಯ ಸ್ಟೇನ್‌ಲೆಸ್ ಸ್ಟೀಲ್.',
    },
  },
};

export const MATERIAL_TYPE_TRANSLATIONS: Record<string, Record<string, string>> = {
  ALU_FOIL_LAMINATE: {
    en: 'Aluminum Foil',
    ta: 'அலுமினியம் ஃபாயில்',
    hi: 'एल्युमिनियम फॉयल',
    te: 'అల్యూమినియం ఫాయిల్',
    ml: 'അലുമിനിയം ഫോയിൽ',
    kn: 'ಅಲ್ಯೂಮಿನಿಯಂ ಫಾಯಿಲ್',
  },
  PP: {
    en: 'PP',
    ta: 'PP (பாலிப்ரோப்பிலீன்)',
    hi: 'पीपी (पॉलीप्रोपाइलीन)',
    te: 'PP (పాలీప్రొపీలిన్)',
    ml: 'പിപി',
    kn: 'ಪಿಪಿ',
  },
  PET: {
    en: 'PET',
    ta: 'PET',
    hi: 'पीईटी',
    te: 'PET',
    ml: 'പിഇടി',
    kn: 'ಪಿಇಟಿ',
  },
  LDPE: {
    en: 'LDPE',
    ta: 'LDPE',
    hi: 'एलडीपीई',
    te: 'LDPE',
    ml: 'എൽഡിപിഇ',
    kn: 'ಎಲ್ ಡಿ ಪಿ ಇ',
  },
  HDPE: {
    en: 'HDPE',
    ta: 'HDPE',
    hi: 'एचडीपीई',
    te: 'HDPE',
    ml: 'എച്ച്ഡിപിഇ',
    kn: 'ಹೆಚ್ ಡಿ ಪಿ ಇ',
  },
  BIODEGRADABLE_FILM: {
    en: 'Biodegradable Film',
    ta: 'மக்கும் பிலிம்',
    hi: 'बायोडिग्रेडेबल फिल्म',
    te: 'బయోడిగ్రేడబుల్ ఫిల్మ్',
    ml: 'കംപോസ്റ്റബിൾ ഫിലിം',
    kn: 'ಬಯೋಡಿಗ್ರೇಡಬಲ್ ಫಿಲ್ಮ್',
  },
  MICRO_PERFORATED_FILM: {
    en: 'Micro-Perforated',
    ta: 'நுண் துளையிடப்பட்டது',
    hi: 'माइक्रो-छिद्रित',
    te: 'మైక్రో-రంధ్రాలు',
    ml: 'മൈക്രോ-പെർഫൊറേറ്റഡ്',
    kn: 'ಮೈಕ್ರೋ-ರಂಧ್ರಗಳು',
  },
  MONO_MATERIAL: {
    en: 'Mono-material',
    ta: 'ஒற்றைப் பொருள்',
    hi: 'मोनो-मटेरियल',
    te: 'మోనో-మెటీరియల్',
    ml: 'മോണോ മെറ്റീരിയൽ',
    kn: 'ಮೊನೊ-ವಸ್ತು',
  },
  VENTED_CRATE: {
    en: 'Vented Crate',
    ta: 'காற்றோட்ட கிரேட்',
    hi: 'हवादार क्रेट',
    te: 'వెంటిలేటెడ్ క్రేట్',
    ml: 'വെന്റിലേറ്റഡ് ക്രേറ്റ്',
    kn: 'ಗಾಳಿಯಾಡುವ ಕ್ರೇಟ್',
  },
  WOVEN_PP: {
    en: 'Woven PP',
    ta: 'நெய்த PP',
    hi: 'बुना हुआ पीपी',
    te: 'నేసిన PP',
    ml: 'നെയ്ത പിപി',
    kn: 'ನೇಯ್ದ ಪಿಪಿ',
  },
  JUTE: {
    en: 'Jute',
    ta: 'சணல்',
    hi: 'जूट',
    te: 'జనపనార',
    ml: 'ചണം',
    kn: 'ಸೆಣಬು',
  },
  CORRUGATED_FIBERBOARD: {
    en: 'Corrugated Board',
    ta: 'அலைநெளி அட்டை',
    hi: 'नालीदार गत्ता',
    te: 'ముడతల కార్డ్‌బోర్డ్',
    ml: 'കോറഗേറ്റഡ് ബോർഡ്',
    kn: 'ಸುಕ್ಕುಗಟ್ಟಿದ ಬೋರ್ಡ್',
  },
  STAINLESS_STEEL: {
    en: 'Stainless Steel',
    ta: 'துருப்பிடிக்காத எஃகு',
    hi: 'स्टेनलेस स्टील',
    te: 'స్టెయిన్‌లెస్ స్టీల్',
    ml: 'സ്റ്റെയിൻലെസ്സ് സ്റ്റീൽ',
    kn: 'ಸ್ಟೇನ್‌ಲೆಸ್ ಸ್ಟೀಲ್',
  },
  METALLIZED_FILM: {
    en: 'Metallized Film',
    ta: 'உலோகப்படுத்தப்பட்ட பிலிம்',
    hi: 'मेटलाइज्ड फिल्म',
    te: 'మెటలైజ్డ్ ఫిల్మ్',
    ml: 'മെറ്റലൈസ്ഡ് ഫിലിം',
    kn: 'ಮೆಟಲೈಸ್ಡ್ ಫಿಲ್ಮ್',
  },
};

export const PROPERTY_TRANSLATIONS: Record<string, Record<string, string>> = {
  MOISTURE_CONTENT: {
    en: 'Moisture content',
    ta: 'ஈரப்பதம்',
    hi: 'नमी की मात्रा',
    te: 'తేమ శాతం',
    ml: 'ഈർപ്പത്തിന്റെ അളവ്',
    kn: 'ತೇವಾಂಶ',
  },
  PH: {
    en: 'pH',
    ta: 'pH',
    hi: 'pH',
    te: 'pH',
    ml: 'pH',
    kn: 'pH',
  },
  FAT_CONTENT: {
    en: 'Fat / oil content',
    ta: 'கொழுப்பு / எண்ணெய் அளவு',
    hi: 'वसा / तेल की मात्रा',
    te: 'కొవ్వు / నూనె శాతం',
    ml: 'കൊഴുപ്പ് / എണ്ണയുടെ അളവ്',
    kn: 'ಕೊಬ್ಬು / ಎಣ್ಣೆ ಅಂಶ',
  },
  WATER_ACTIVITY: {
    en: 'Water activity',
    ta: 'நீர் செயல்பாடு (aw)',
    hi: 'जल सक्रियता (aw)',
    te: 'నీటి చర్య (aw)',
    ml: 'ജല പ്രവർത്തനം (aw)',
    kn: 'ನೀರಿನ ಚಟುವಟಿಕೆ (aw)',
  },
  RESPIRATION_RATE: {
    en: 'Respiration rate',
    ta: 'சுவாச விகிதம்',
    hi: 'श्वसन दर',
    te: 'శ్వాసక్రియ రేటు',
    ml: 'ശ്വസന നിരക്ക്',
    kn: 'ಉಸಿರಾಟದ ದರ',
  },
  OTR: {
    en: 'Oxygen Transmission Rate (OTR)',
    ta: 'ஆக்சிஜன் பரிமாற்ற விகிதம் (OTR)',
    hi: 'ऑक्सीजन ट्रांसमिशन दर (OTR)',
    te: 'ఆక్సిజన్ ప్రసార రేటు (OTR)',
    ml: 'ഓക്സിജൻ ട്രാൻസ്മിഷൻ നിരക്ക് (OTR)',
    kn: 'ಆಮ್ಲಜನಕ ಪ್ರಸರಣ ದರ (OTR)',
  },
  WVTR: {
    en: 'Water Vapor Transmission Rate (WVTR)',
    ta: 'நீராவி பரிமாற்ற விகிதம் (WVTR)',
    hi: 'जल वाष्प संचरण दर (WVTR)',
    te: 'నీటి ఆవిరి ప్రసార రేటు (WVTR)',
    ml: 'വാട്ടർ വേപ്പർ ട്രാൻസ്മിഷൻ നിരക്ക് (WVTR)',
    kn: 'ನೀರಿನ ಆವಿ ಪ್ರಸರಣ ದರ (WVTR)',
  },
  THICKNESS: {
    en: 'Thickness',
    ta: 'தடிமன்',
    hi: 'मोटाई',
    te: 'మందం',
    ml: 'കനം',
    kn: 'ದಪ್ಪ',
  },
  TENSILE_STRENGTH: {
    en: 'Tensile strength',
    ta: 'இழுவிசை வலிமை',
    hi: 'तन्यता ताकत',
    te: 'తన్యత బలం',
    ml: 'ടെൻസൈൽ ശക്തി',
    kn: 'ಕರ್ಷಕ ಶಕ್ತಿ',
  },
  PUNCTURE_RESISTANCE: {
    en: 'Puncture resistance',
    ta: 'துளை எதிர்ப்புத் திறன்',
    hi: 'पंचर प्रतिरोध',
    te: 'పంక్చర్ నిరోధకత',
    ml: 'പങ്ചർ പ്രതിരോധം',
    kn: 'ಪಂಕ್ಚರ್ ಪ್ರತಿರೋಧ',
  },
  SEAL_STRENGTH: {
    en: 'Seal strength',
    ta: 'சீலிங் வலிமை',
    hi: 'सील की मजबूती',
    te: 'సీల్ బలం',
    ml: 'സീൽ ശക്തി',
    kn: 'ಸೀಲ್ ಸಾಮರ್ಥ್ಯ',
  },
  TEMP_RESISTANCE_MIN: {
    en: 'Min. temperature resistance',
    ta: 'குறைந்தபட்ச வெப்பநிலை எதிர்ப்பு',
    hi: 'न्यूनतम तापमान प्रतिरोध',
    te: 'కనిష్ట ఉష్ణోగ్రత నిరోధకత',
    ml: 'കുറഞ്ഞ താപനില പ്രതിരോധം',
    kn: 'ಕನಿಷ್ಠ ತಾಪಮಾನ ಪ್ರತಿರೋಧ',
  },
  TEMP_RESISTANCE_MAX: {
    en: 'Max. temperature resistance',
    ta: 'அதிகபட்ச வெப்பநிலை எதிர்ப்பு',
    hi: 'अधिकतम तापमान प्रतिरोध',
    te: 'గరిష్ట ఉష్ணோగ్రత నిరోధకత',
    ml: 'കൂടിയ താപനില പ്രതിരോധം',
    kn: 'ಗರಿಷ್ಠ ತಾಪಮಾನ ಪ್ರತಿರೋಧ',
  },
  TRANSPARENCY: {
    en: 'Transparency',
    ta: 'ஒளி ஊடுருவும் தன்மை',
    hi: 'पारदर्शिता',
    te: 'పారదర్శకత',
    ml: 'സുതാര്യത',
    kn: 'ಪಾರದರ್ಶಕತೆ',
  },
};

export const CONFIDENCE_TRANSLATIONS: Record<string, Record<string, string>> = {
  LOW: {
    en: 'Low',
    ta: 'குறைந்த',
    hi: 'कम',
    te: 'తక్కువ',
    ml: 'കുറഞ്ഞ',
    kn: 'ಕಡಿಮೆ',
  },
  MEDIUM: {
    en: 'Medium',
    ta: 'நடுத்தர',
    hi: 'मध्यम',
    te: 'మధ్యస్థ',
    ml: 'ഇടത്തരം',
    kn: 'ಮಧ್ಯಮ',
  },
  HIGH: {
    en: 'High',
    ta: 'அதிக',
    hi: 'उच्च',
    te: 'అధిక',
    ml: 'ഉയർന്ന',
    kn: 'ಹೆಚ್ಚಿನ',
  },
};

/**
 * Return localized material name.
 */
export function getMaterialName(
  material: { slug?: string; name: string } | string | null | undefined,
  locale = 'en'
): string {
  if (!material) return '';
  const slug = (typeof material === 'string' ? material : material.slug)?.toLowerCase().trim();
  if (slug && MATERIAL_TRANSLATIONS[slug]?.name?.[locale]) {
    return MATERIAL_TRANSLATIONS[slug].name[locale];
  }
  const name = typeof material === 'string' ? material : material.name;
  if (!name) return '';
  const nameKey = name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
  if (MATERIAL_TRANSLATIONS[nameKey]?.name?.[locale]) {
    return MATERIAL_TRANSLATIONS[nameKey].name[locale];
  }
  return name;
}

/**
 * Return localized material description.
 */
export function getMaterialDescription(
  material: { slug?: string; description?: string | null } | null | undefined,
  locale = 'en'
): string {
  if (!material) return '';
  const slug = material.slug?.toLowerCase().trim();
  if (slug && MATERIAL_TRANSLATIONS[slug]?.description?.[locale]) {
    return MATERIAL_TRANSLATIONS[slug].description[locale];
  }
  return material.description ?? '';
}

/**
 * Return localized material type name.
 */
export function getMaterialTypeName(materialType: string, locale = 'en'): string {
  if (!materialType) return '';
  return MATERIAL_TYPE_TRANSLATIONS[materialType]?.[locale] ?? materialType;
}

/**
 * Return localized property name.
 */
export function getPropertyName(propertyType: string, locale = 'en'): string {
  if (!propertyType) return '';
  return PROPERTY_TRANSLATIONS[propertyType]?.[locale] ?? propertyType;
}

/**
 * Return localized confidence level.
 */
export function getConfidenceLabel(confidence: string, locale = 'en'): string {
  if (!confidence) return '';
  return CONFIDENCE_TRANSLATIONS[confidence]?.[locale] ?? confidence;
}

