import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Switch,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { SPACING, FONT_SIZE, BORDER_RADIUS } from '../constants';
import { useFavoritesStore } from '../store/favoritesStore';
import { usePlaylistStore } from '../store/playlistStore';
import { useDownloadStore } from '../store/downloadStore';
import { useThemeStore, getThemeColors, LIGHT_COLORS } from '../store/themeStore';

interface SettingItem {
  icon: keyof typeof Ionicons.glyphMap;
  title: string;
  subtitle?: string;
  onPress?: () => void;
  rightComponent?: React.ReactNode;
}

const SettingsScreen: React.FC = () => {
  const [autoPlay, setAutoPlay] = React.useState(true);
  const [downloadOverWifi, setDownloadOverWifi] = React.useState(true);

  const { clearFavorites, favorites } = useFavoritesStore();
  const { playlists } = usePlaylistStore();
  const { downloadedSongs } = useDownloadStore();
  const { isDarkMode, toggleDarkMode } = useThemeStore();
  const COLORS = getThemeColors(isDarkMode);

  const handleClearCache = () => {
    Alert.alert(
      'Clear Cache',
      'This will clear all cached data. Are you sure?',
      [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Clear', style: 'destructive', onPress: () => {} },
      ]
    );
  };

  const handleClearFavorites = () => {
    Alert.alert(
      'Clear Favorites',
      'This will remove all songs from your favorites. Are you sure?',
      [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Clear', style: 'destructive', onPress: clearFavorites },
      ]
    );
  };

  const renderSettingItem = ({ icon, title, subtitle, onPress, rightComponent }: SettingItem) => (
    <TouchableOpacity
      style={[styles.settingItem, { borderBottomColor: COLORS.border }]}
      onPress={onPress}
      disabled={!onPress && !rightComponent}
    >
      <View style={[styles.settingIcon, { backgroundColor: COLORS.surface }]}>
        <Ionicons name={icon} size={22} color={COLORS.primary} />
      </View>
      <View style={styles.settingContent}>
        <Text style={[styles.settingTitle, { color: COLORS.textPrimary }]}>{title}</Text>
        {subtitle && <Text style={[styles.settingSubtitle, { color: COLORS.textSecondary }]}>{subtitle}</Text>}
      </View>
      {rightComponent || (onPress && <Ionicons name="chevron-forward" size={20} color={COLORS.textTertiary} />)}
    </TouchableOpacity>
  );

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: COLORS.background }]} edges={['top']}>
      <View style={styles.header}>
        <View style={styles.logoContainer}>
          <Ionicons name="settings" size={28} color={COLORS.primary} />
          <Text style={[styles.logoText, { color: COLORS.textPrimary }]}>Settings</Text>
        </View>
      </View>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 150 }}>
        {/* Library Stats */}
        <View style={[styles.statsContainer, { backgroundColor: COLORS.surface }]}>
          <View style={styles.statItem}>
            <Text style={[styles.statNumber, { color: COLORS.primary }]}>{favorites.length}</Text>
            <Text style={[styles.statLabel, { color: COLORS.textSecondary }]}>Favorites</Text>
          </View>
          <View style={[styles.statDivider, { backgroundColor: COLORS.border }]} />
          <View style={styles.statItem}>
            <Text style={[styles.statNumber, { color: COLORS.primary }]}>{playlists.length}</Text>
            <Text style={[styles.statLabel, { color: COLORS.textSecondary }]}>Playlists</Text>
          </View>
          <View style={[styles.statDivider, { backgroundColor: COLORS.border }]} />
          <View style={styles.statItem}>
            <Text style={[styles.statNumber, { color: COLORS.primary }]}>{downloadedSongs.length}</Text>
            <Text style={[styles.statLabel, { color: COLORS.textSecondary }]}>Downloads</Text>
          </View>
        </View>

        {/* Appearance Section */}
        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: COLORS.textTertiary }]}>Appearance</Text>
          {renderSettingItem({
            icon: isDarkMode ? 'moon' : 'sunny',
            title: 'Dark Mode',
            subtitle: isDarkMode ? 'Switch to light theme' : 'Switch to dark theme',
            rightComponent: (
              <Switch
                value={isDarkMode}
                onValueChange={toggleDarkMode}
                trackColor={{ false: COLORS.border, true: COLORS.primaryLight }}
                thumbColor={isDarkMode ? COLORS.primary : COLORS.textTertiary}
              />
            ),
          })}
        </View>

        {/* Playback Section */}
        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: COLORS.textTertiary }]}>Playback</Text>
          {renderSettingItem({
            icon: 'play-circle-outline',
            title: 'Auto-play',
            subtitle: 'Automatically play similar songs',
            rightComponent: (
              <Switch
                value={autoPlay}
                onValueChange={setAutoPlay}
                trackColor={{ false: COLORS.border, true: COLORS.primaryLight }}
                thumbColor={autoPlay ? COLORS.primary : COLORS.textTertiary}
              />
            ),
          })}
        </View>

        {/* Downloads Section */}
        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: COLORS.textTertiary }]}>Downloads</Text>
          {renderSettingItem({
            icon: 'wifi-outline',
            title: 'Download over Wi-Fi only',
            subtitle: 'Save mobile data',
            rightComponent: (
              <Switch
                value={downloadOverWifi}
                onValueChange={setDownloadOverWifi}
                trackColor={{ false: COLORS.border, true: COLORS.primaryLight }}
                thumbColor={downloadOverWifi ? COLORS.primary : COLORS.textTertiary}
              />
            ),
          })}
          {renderSettingItem({
            icon: 'cloud-download-outline',
            title: 'Audio Quality',
            subtitle: 'High (320kbps)',
            onPress: () => {},
          })}
        </View>

        {/* Storage Section */}
        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: COLORS.textTertiary }]}>Storage</Text>
          {renderSettingItem({
            icon: 'trash-outline',
            title: 'Clear Cache',
            subtitle: 'Free up storage space',
            onPress: handleClearCache,
          })}
          {renderSettingItem({
            icon: 'heart-dislike-outline',
            title: 'Clear Favorites',
            subtitle: `${favorites.length} songs in favorites`,
            onPress: handleClearFavorites,
          })}
        </View>

        {/* About Section */}
        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: COLORS.textTertiary }]}>About</Text>
          {renderSettingItem({
            icon: 'information-circle-outline',
            title: 'Version',
            subtitle: '1.0.0',
          })}
          {renderSettingItem({
            icon: 'document-text-outline',
            title: 'Terms of Service',
            onPress: () => {},
          })}
          {renderSettingItem({
            icon: 'shield-checkmark-outline',
            title: 'Privacy Policy',
            onPress: () => {},
          })}
          {renderSettingItem({
            icon: 'mail-outline',
            title: 'Contact Us',
            onPress: () => {},
          })}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: SPACING.lg,
    paddingVertical: SPACING.md,
  },
  logoContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  logoText: {
    fontSize: FONT_SIZE.xxl,
    fontWeight: '700',
    marginLeft: SPACING.sm,
  },
  statsContainer: {
    flexDirection: 'row',
    marginHorizontal: SPACING.lg,
    marginVertical: SPACING.md,
    borderRadius: BORDER_RADIUS.lg,
    padding: SPACING.lg,
  },
  statItem: {
    flex: 1,
    alignItems: 'center',
  },
  statNumber: {
    fontSize: FONT_SIZE.xxl,
    fontWeight: '700',
  },
  statLabel: {
    fontSize: FONT_SIZE.sm,
    marginTop: SPACING.xs,
  },
  statDivider: {
    width: 1,
    marginHorizontal: SPACING.md,
  },
  section: {
    marginTop: SPACING.lg,
    paddingHorizontal: SPACING.lg,
  },
  sectionTitle: {
    fontSize: FONT_SIZE.sm,
    fontWeight: '600',
    marginBottom: SPACING.sm,
    textTransform: 'uppercase',
    letterSpacing: 1,
  },
  settingItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: SPACING.md,
    borderBottomWidth: 1,
  },
  settingIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  settingContent: {
    flex: 1,
    marginLeft: SPACING.md,
  },
  settingTitle: {
    fontSize: FONT_SIZE.md,
    fontWeight: '500',
  },
  settingSubtitle: {
    fontSize: FONT_SIZE.sm,
    marginTop: 2,
  },
});

export default SettingsScreen;
