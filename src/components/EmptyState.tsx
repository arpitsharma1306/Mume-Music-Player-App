import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { SPACING, FONT_SIZE, BORDER_RADIUS } from '../constants';
import { useThemeStore, getThemeColors } from '../store/themeStore';

interface EmptyStateProps {
  icon?: keyof typeof Ionicons.glyphMap;
  title: string;
  message?: string;
  actionLabel?: string;
  onAction?: () => void;
}

const EmptyState: React.FC<EmptyStateProps> = ({
  icon = 'musical-notes-outline',
  title,
  message,
  actionLabel,
  onAction,
}) => {
  const isDarkMode = useThemeStore((state) => state.isDarkMode);
  const COLORS = getThemeColors(isDarkMode);

  return (
    <View style={styles.container}>
      <Ionicons name={icon} size={64} color={COLORS.textTertiary} />
      <Text style={[styles.title, { color: COLORS.textPrimary }]}>{title}</Text>
      {message && <Text style={[styles.message, { color: COLORS.textSecondary }]}>{message}</Text>}
      {actionLabel && onAction && (
        <TouchableOpacity style={[styles.button, { backgroundColor: COLORS.primary }]} onPress={onAction}>
          <Text style={[styles.buttonText, { color: COLORS.white }]}>{actionLabel}</Text>
        </TouchableOpacity>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: SPACING.xl,
  },
  title: {
    fontSize: FONT_SIZE.xl,
    fontWeight: '600',
    marginTop: SPACING.md,
    textAlign: 'center',
  },
  message: {
    fontSize: FONT_SIZE.md,
    marginTop: SPACING.sm,
    textAlign: 'center',
    lineHeight: 22,
  },
  button: {
    marginTop: SPACING.lg,
    paddingVertical: SPACING.sm,
    paddingHorizontal: SPACING.lg,
    borderRadius: BORDER_RADIUS.round,
  },
  buttonText: {
    fontSize: FONT_SIZE.md,
    fontWeight: '600',
  },
});

export default EmptyState;
