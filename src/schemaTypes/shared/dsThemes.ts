/**
 * Design System theme options from @marcelinodzn/ds-react DsProvider.
 * ThemeName: 'MyJio' | 'JioHome' | 'JioMart' | 'JioFinance' | 'JioGauSamridhhi' | 'JioKrishi'
 */
export const DS_THEMES = [
  { value: 'MyJio', title: 'MyJio' },
  { value: 'JioHome', title: 'JioHome' },
  { value: 'JioMart', title: 'JioMart' },
  { value: 'JioFinance', title: 'JioFinance' },
  { value: 'JioGauSamridhhi', title: 'JioGauSamridhhi' },
  { value: 'JioKrishi', title: 'JioKrishi' },
] as const

export const DS_THEME_DEFAULT = 'MyJio'
