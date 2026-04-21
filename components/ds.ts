/**
 * Design System — tokens globales compartidos en toda la app.
 * Edita aquí para propagar cambios a todas las pantallas.
 */

export const Colors = {
  // Fondos
  bg: '#F8FAFC',
  surface: '#FFFFFF',
  surfaceSecondary: '#F1F5F9',

  // Texto
  textPrimary: '#0F172A',
  textSecondary: '#64748B',
  textTertiary: '#94A3B8',
  textInverse: '#FFFFFF',

  // Bordes
  border: '#E2E8F0',
  borderLight: '#F1F5F9',

  // Primario
  primary: '#111827',
  primaryLight: 'rgba(17, 24, 39, 0.06)',

  // Acento (para highlights internos)
  accent: '#6366F1',
  accentLight: 'rgba(99, 102, 241, 0.08)',

  // Estados
  success: '#22C55E',
  successLight: '#DCFCE7',
  successText: '#15803D',

  danger: '#EF4444',
  dangerLight: '#FEE2E2',
  dangerText: '#DC2626',

  warning: '#F59E0B',
  warningLight: '#FEF9C3',
  warningText: '#B45309',

  // Overlay
  overlay: 'rgba(15, 23, 42, 0.55)',
};

export const Radius = {
  xs: 8,
  sm: 12,
  md: 16,
  lg: 20,
  xl: 24,
  xxl: 28,
  full: 999,
};

export const Spacing = {
  xs: 4,
  sm: 8,
  md: 12,
  base: 16,
  lg: 20,
  xl: 24,
  xxl: 32,
  xxxl: 40,
};

export const Shadow = {
  sm: {
    shadowColor: '#0F172A',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.04,
    shadowRadius: 6,
    elevation: 2,
  },
  md: {
    shadowColor: '#0F172A',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.06,
    shadowRadius: 12,
    elevation: 4,
  },
  lg: {
    shadowColor: '#0F172A',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.1,
    shadowRadius: 20,
    elevation: 8,
  },
  xl: {
    shadowColor: '#0F172A',
    shadowOffset: { width: 0, height: 16 },
    shadowOpacity: 0.14,
    shadowRadius: 32,
    elevation: 14,
  },
};

export const Typography = {
  displayLg: { fontSize: 34, fontWeight: '800' as const, letterSpacing: -0.8 },
  displayMd: { fontSize: 28, fontWeight: '800' as const, letterSpacing: -0.5 },
  displaySm: { fontSize: 22, fontWeight: '700' as const, letterSpacing: -0.3 },
  heading: { fontSize: 18, fontWeight: '700' as const },
  subheading: { fontSize: 15, fontWeight: '600' as const },
  body: { fontSize: 15, fontWeight: '400' as const },
  bodyMd: { fontSize: 14, fontWeight: '500' as const },
  caption: { fontSize: 12, fontWeight: '600' as const },
  label: { fontSize: 13, fontWeight: '700' as const, letterSpacing: 0.4 },
};
