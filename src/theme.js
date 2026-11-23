/**
 * CanteenKart Theme Configuration
 * Warm orange accent color scheme with clean white cards and rounded corners.
 */

export const colors = {
  // Primary brand colors
  primary: '#FF6D00', // Warm energetic orange
  primaryDark: '#E65100',
  primaryLight: '#FFE0B2',
  primaryUltraLight: '#FFF8E1',

  // Neutrals and backgrounds
  background: '#F8F9FA',
  cardBackground: '#FFFFFF',
  surface: '#FFFFFF',
  border: '#E8ECEF',
  borderLight: '#F1F3F5',

  // Typography
  textPrimary: '#1E293B',
  textSecondary: '#64748B',
  textMuted: '#94A3B8',
  textWhite: '#FFFFFF',

  // Semantic status colors (for order lifecycle: New -> Preparing -> Ready -> Served)
  statusNew: '#0284C7',          // Blue
  statusNewBg: '#E0F2FE',
  statusPreparing: '#EA580C',    // Orange/Amber
  statusPreparingBg: '#FFEDD5',
  statusReady: '#16A34A',        // Green
  statusReadyBg: '#DCFCE7',
  statusServed: '#475569',       // Slate / Grey
  statusServedBg: '#F1F5F9',

  // Alert & feedback colors
  success: '#16A34A',
  successLight: '#DCFCE7',
  error: '#DC2626',
  errorLight: '#FEE2E2',
  warning: '#D97706',
  warningLight: '#FEF3C7',

  // Interactive states
  disabled: '#CBD5E1',
  disabledText: '#94A3B8',
  overlay: 'rgba(0, 0, 0, 0.4)',
};

export const spacing = {
  xs: 4,
  sm: 8,
  md: 12,
  lg: 16,
  xl: 20,
  xxl: 24,
  xxxl: 32,
};

export const borderRadius = {
  sm: 6,
  md: 10,
  lg: 16,
  xl: 20,
  full: 9999,
};

export const typography = {
  title: {
    fontSize: 24,
    fontWeight: '700',
    color: colors.textPrimary,
  },
  subtitle: {
    fontSize: 18,
    fontWeight: '600',
    color: colors.textPrimary,
  },
  body: {
    fontSize: 14,
    fontWeight: '400',
    color: colors.textSecondary,
  },
  caption: {
    fontSize: 12,
    fontWeight: '500',
    color: colors.textMuted,
  },
};

export const shadow = {
  card: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 6,
    elevation: 2,
  },
  cardHover: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
};

export default {
  colors,
  spacing,
  borderRadius,
  typography,
  shadow,
};
