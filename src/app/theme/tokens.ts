export const colors = {
  // Michelin Design System - By Universe palette
  byUniverse: {
    purpleEngaged: 'rgb(88, 44, 131)', // #582C83
    generousGreen: 'rgb(132, 189, 0)', // #84BD00
    sustainableGrey: 'rgb(83, 86, 90)', // #53565A
    redGastronomy: 'rgb(189, 35, 51)', // #BD2333
    skyBlue: 'rgb(16, 149, 249)', // #1095F9
    greenTravel: 'rgb(23, 167, 143)', // #17A78F
  },

  // Brand semantic colors
  primary: 'rgb(189, 35, 51)',
  accent: 'rgb(88, 44, 131)',
  success: 'rgb(132, 189, 0)',
  info: 'rgb(16, 149, 249)',
  travel: 'rgb(23, 167, 143)',

  // Backward-compatible alias
  red: 'rgb(189, 35, 51)',

  // Text (Michelin DS gray guidance)
  textPrimary: 'rgb(26, 26, 26)',
  textSecondary: 'rgb(83, 86, 90)',
  textTertiary: 'rgb(102, 102, 102)',

  // Backgrounds
  backgroundPrimary: 'rgb(255, 255, 255)', // #FFFFFF
  backgroundSubtle: 'rgb(242, 242, 242)', // #F2F2F2

  // Borders
  borderSubtle: 'rgb(229, 229, 229)', // #E5E5E5
  divider: 'rgb(229, 229, 229)',
} as const

export const typography = {
  fontSize: {
    display: 32,
    title: 24,
    body: 16,
    subText: 14,
    small: 12,
  },
  lineHeight: {
    display: 48,
    title: 36,
    body: 24,
    subText: 20,
    small: 16,
  },
  fontWeight: {
    regular: '400' as const,
    medium: '500' as const,
    semibold: '600' as const,
    bold: '700' as const,
  },
  fontFamily: {
    regular: 'Figtree',
    medium: 'Figtree-Medium',
    semibold: 'Figtree-SemiBold',
    bold: 'Figtree-Bold',
  },
} as const

export const spacing = {
  1: 4,
  2: 8,
  3: 16,
  4: 24,
  5: 32,
  6: 40,
  7: 48,
  8: 56,
  10: 64,
  12: 72,
} as const

export const radius = {
  sm: 3,
  lg: 8,
  full: 999,
} as const

export const shadow = {
  card: {
    shadowColor: 'rgb(25, 25, 25)',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.06,
    shadowRadius: 2,
    elevation: 1,
  },
} as const
