// Automatic Locale & Language Detector for Naroa's Web Application

export type Language = 'eu' | 'es' | 'en'

export interface Translations {
  heroTag: string
  heroTitle1: string
  heroTitleGradient: string
  heroManifesto: string
  exploreBtn: string
  commissionBtn: string
  navGallery: string
  nav3D: string
  navCommissions: string
  navAbout: string
  navBlog: string
  seriesDivinos: string
  seriesVaivenes: string
  seriesEspejos: string
  seriesFacefood: string
}

export const DICTIONARY: Record<Language, Translations> = {
  eu: {
    heroTag: '⚡ HIPERREALISMO POP · BILBO',
    heroTitle1: 'ISPILLU EMOZIONALAK DIRA',
    heroTitleGradient: 'EUSKAL HARRIAN',
    heroManifesto: '«Guztiok gara gauza bera itxura desberdinekin.» Naroa Gutiérrez Gil-ek pop ikonografia eta Bizkaiko baserrietako arbeilazko teilatu zaharrak transformatzen ditu.',
    exploreBtn: '⚡ BILDUMA ARAKATU',
    commissionBtn: '🎨 ESKAERA KALKULATU',
    navGallery: 'BILDUMA',
    nav3D: '3D GUNEA',
    navCommissions: 'ESKAERAK ⚡',
    navAbout: 'NAROA',
    navBlog: 'DIARIO POP'
  },
  es: {
    heroTag: '⚡ HIPERREALISMO POP · BILBAO',
    heroTitle1: 'RETRATOS QUE SON',
    heroTitleGradient: 'ESPEJOS EMOCIONALES',
    heroManifesto: '«Todos somos lo mismo con distintas apariencias.» Naroa Gutiérrez Gil transforma la iconografía pop y los soportes primordiales de pizarra natural en máscaras protectoras.',
    exploreBtn: '⚡ EXPLORAR GALERÍA',
    commissionBtn: '🎨 CALCULAR ENCARGO',
    navGallery: 'OBRA / BILDUMA',
    nav3D: 'SALA 3D',
    navCommissions: 'ENCARGOS ⚡',
    navAbout: 'SOBRE NAROA',
    navBlog: 'DIARIO POP'
  },
  en: {
    heroTag: '⚡ POP HYPERREALISM · BILBAO',
    heroTitle1: 'PORTRAITS THAT ACT AS',
    heroTitleGradient: 'EMOTIONAL MIRRORS',
    heroManifesto: '«We are all the same behind different appearances.» Naroa Gutiérrez Gil fuses pop iconography with authentic natural slate from ancient Basque roofs and pure mineral mica.',
    exploreBtn: '⚡ EXPLORE GALLERY',
    commissionBtn: '🎨 COMMISSION ARTWORK',
    navGallery: 'THE GALLERY',
    nav3D: '3D ROOM',
    navCommissions: 'COMMISSIONS ⚡',
    navAbout: 'ABOUT NAROA',
    navBlog: 'ART DIARY'
  }
}

export function detectUserLanguage(): Language {
  if (typeof window === 'undefined') return 'es'

  // 1. Check persistent saved preference
  const saved = localStorage.getItem('naroa_lang') as Language
  if (saved && ['eu', 'es', 'en'].includes(saved)) {
    return saved
  }

  // 2. Detect browser languages & locale
  const browserLangs = navigator.languages || [navigator.language || 'es']
  
  for (const lang of browserLangs) {
    const code = lang.toLowerCase()
    if (code.startsWith('eu')) return 'eu' // Euskara
    if (code.startsWith('es')) return 'es' // Spanish
    if (code.startsWith('en')) return 'en' // English
  }

  return 'es'
}

export function setPreferredLanguage(lang: Language) {
  if (typeof window !== 'undefined') {
    localStorage.setItem('naroa_lang', lang)
  }
}
