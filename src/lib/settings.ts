// App settings (chosen once in the start-up wizard, changeable in Settings). The GitHub token lives in the iOS Keychain.
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as SecureStore from 'expo-secure-store';
import type { Sport } from './geo.ts';

export interface AppEvent {
  id: string;
  name: string; // e.g. 'City Marathon'
  date: string; // YYYY-MM-DD
  kind: string; // Run / Bike / Swim / Triathlon / Other
}

export interface Settings {
  setupDone: boolean;
  sports: Sport[]; // which sports appear on the home screen
  defaultSport: Sport;
  showBigNumbers: boolean;
  showMap: boolean;
  voice: boolean;
  voiceEveryKmRun: number; // 1 = every km
  voiceEveryKmBike: number; // 5 = every 5 km
  voiceEveryMSwim: number; // 500 = every 500 m
  autoPause: boolean;
  keepScreenOn: boolean; // false = screen can lock, GPS keeps recording
  syncEnabled: boolean;
  githubRepo: string; // owner/name of the PRIVATE data repo
  bikeName: string;
  poolLengthM: number;
  weightKg: number; // for the calorie estimate
  name: string; // shown on the profile; empty until the user sets it
  events: AppEvent[]; // the user's own races and goals, stored only on this phone
  deletedEventIds: string[]; // events removed on the phone, so a sync does not bring them back
  photoUri: string; // profile photo copied into the app's own storage (never uploaded)
}

export const DEFAULTS: Settings = {
  setupDone: false,
  sports: ['run', 'bike', 'swim_open', 'swim_pool'],
  defaultSport: 'run',
  showBigNumbers: true,
  showMap: true,
  voice: true,
  voiceEveryKmRun: 1,
  voiceEveryKmBike: 5,
  voiceEveryMSwim: 500,
  autoPause: true,
  keepScreenOn: false,
  syncEnabled: false,
  githubRepo: '', // your-username/your-private-data-repo
  bikeName: '',
  poolLengthM: 25,
  weightKg: 70,
  name: '',
  events: [],
  deletedEventIds: [],
  photoUri: '',
};

// Storage keys keep their first-version names on purpose: renaming them would wipe the
// settings and GitHub token already saved on the phone. Users never see them.
const KEY = 'ironman.settings.v1';
const TOKEN_KEY = 'ironman.github.token';

let cache: Settings = { ...DEFAULTS };
const listeners = new Set<(s: Settings) => void>();

export async function loadSettings(): Promise<Settings> {
  try {
    const raw = await AsyncStorage.getItem(KEY);
    if (raw) cache = { ...DEFAULTS, ...JSON.parse(raw) };
    // The results repo was renamed iron-man-data -> mzansi-go-data (22 Nov 2026).
    if (/iron-man-data/i.test(cache.githubRepo || '')) {
      cache = { ...cache, githubRepo: cache.githubRepo.replace(/iron-man-data/i, 'mzansi-go-data') };
      await AsyncStorage.setItem(KEY, JSON.stringify(cache));
    }
  } catch {
    cache = { ...DEFAULTS };
  }
  return cache;
}

export const getSettings = () => cache;

export async function saveSettings(patch: Partial<Settings>): Promise<Settings> {
  cache = { ...cache, ...patch };
  await AsyncStorage.setItem(KEY, JSON.stringify(cache));
  listeners.forEach((l) => l(cache));
  return cache;
}

export function onSettings(l: (s: Settings) => void) {
  listeners.add(l);
  return () => listeners.delete(l);
}

export const getToken = () => SecureStore.getItemAsync(TOKEN_KEY);
export const setToken = (t: string) =>
  t ? SecureStore.setItemAsync(TOKEN_KEY, t.trim()) : SecureStore.deleteItemAsync(TOKEN_KEY);
