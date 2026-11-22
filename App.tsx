import React, { useEffect, useRef, useState } from 'react';
import { Alert, AppState, ScrollView, View, useWindowDimensions, type ScrollViewInstance } from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { C } from './src/ui/kit.tsx';
import { loadSettings, getSettings, saveSettings } from './src/lib/settings.ts';
import { AUTO_UPLOAD_DELAY_MS, syncAll } from './src/lib/github.ts';
import { loadHistory, refreshHistory, refreshEvents } from './src/lib/history.ts';
import { ensurePermissions, restore, start } from './src/tracking/tracker.ts';
import Wizard from './src/screens/Wizard.tsx';
import Home from './src/screens/Home.tsx';
import LiveScreen from './src/screens/LiveScreen.tsx';
import SessionScreen from './src/screens/SessionScreen.tsx';
import History from './src/screens/History.tsx';
import PoolLog from './src/screens/PoolLog.tsx';
import SettingsScreen from './src/screens/SettingsScreen.tsx';
import Profile from './src/screens/Profile.tsx';
import Events from './src/screens/Events.tsx';
import Stats from './src/screens/Stats.tsx';
import Splash from './src/screens/Splash.tsx';
import * as SplashScreen from 'expo-splash-screen';
import type { Sport } from './src/lib/geo.ts';

type Route =
  | { name: 'loading' } | { name: 'wizard' } | { name: 'home' } | { name: 'live' } | { name: 'history' }
  | { name: 'pool' } | { name: 'settings' } | { name: 'profile' } | { name: 'events' } | { name: 'stats' } | { name: 'session'; id: string; fresh?: boolean };

export default function App() {
  const [route, setRoute] = useState<Route>({ name: 'loading' });
  const [syncNote, setSyncNote] = useState('');

  const later = useRef<ReturnType<typeof setTimeout> | null>(null);
  const { width } = useWindowDimensions();
  const pager = useRef<ScrollViewInstance>(null);
  const [pageH, setPageH] = useState(0);

  const sync = async () => {
    const r = await syncAll();
    await refreshHistory();
    await refreshEvents();
    if (r.message) setSyncNote(r.message);
  };

  // Automatic upload 5 minutes after a session ends (time to name it first). Save uploads it at once.
  const uploadLater = () => {
    if (later.current) clearTimeout(later.current);
    later.current = setTimeout(() => { later.current = null; sync(); }, AUTO_UPLOAD_DELAY_MS + 5000);
  };

  const uploadNow = async () => {
    setSyncNote('Uploading…');
    const r = await syncAll({ manual: true });
    setSyncNote(r.message);
    if (r.failed || /Settings/.test(r.message)) Alert.alert('Upload to GitHub', r.message);
    await refreshHistory();
  };

  useEffect(() => {
    (async () => {
      const shownAt = Date.now();
      SplashScreen.hideAsync().catch(() => {}); // native splash off; our logo screen takes over
      const s = await loadSettings();
      await loadHistory();
      // A session still open means the app was closed mid-run: GPS restarts straight away.
      const resumed = s.setupDone ? await restore() : false;
      // keep the logo on screen for about 3 seconds in total
      await new Promise((r) => setTimeout(r, Math.max(0, 3000 - (Date.now() - shownAt))));
      if (!s.setupDone) return setRoute({ name: 'wizard' });
      if (resumed) return setRoute({ name: 'live' });
      setRoute({ name: 'home' });
      sync();
    })();
    const sub = AppState.addEventListener('change', (st) => { if (st === 'active') sync(); });
    return () => sub.remove();
  }, []);

  const startSport = async (sport: Sport) => {
    const perm = await ensurePermissions();
    if (perm === 'denied') {
      Alert.alert('Location is off', 'Allow location for Mzansi Go in iPhone Settings to record.');
      return;
    }
    if (perm === 'whenInUse' && !getSettings().keepScreenOn) {
      Alert.alert('Screen-locked recording needs "Always"', 'Set iPhone Settings > Mzansi Go > Location to "Always". Until then keep the screen on during the session.');
    }
    await start(sport);
    setRoute({ name: 'live' });
  };

  const goHome = () => { setRoute({ name: 'home' }); sync(); };

  let screen: React.ReactNode;
  switch (route.name) {
    case 'loading':
      screen = <Splash />;
      break;
    case 'wizard':
      screen = <Wizard onDone={goHome} />;
      break;
    case 'home':
    case 'history': {
      // Home and History sit side by side: History is on the RIGHT (Matthew, 22 Nov 2026).
      // Swipe left on Home to see History, swipe right to come back.
      const toHome = () => pager.current?.scrollTo({ x: 0, animated: true });
      const toHistory = () => pager.current?.scrollTo({ x: width, animated: true });
      screen = (
        <ScrollView ref={pager} horizontal pagingEnabled bounces={false} showsHorizontalScrollIndicator={false}
          contentOffset={{ x: route.name === 'history' ? width : 0, y: 0 }} keyboardShouldPersistTaps="handled"
          style={{ flex: 1 }} onLayout={(e) => setPageH(e.nativeEvent.layout.height)}>
          <View style={{ width, height: pageH || undefined }}>
            <Home onStart={startSport} onPool={() => setRoute({ name: 'pool' })} onHistory={toHistory}
              onSettings={() => setRoute({ name: 'settings' })} onProfile={() => setRoute({ name: 'profile' })} onEvents={() => setRoute({ name: 'events' })}
              onStats={() => setRoute({ name: 'stats' })} onBackToLive={() => setRoute({ name: 'live' })}
              onSync={uploadNow} syncNote={syncNote} />
          </View>
          <View style={{ width, height: pageH || undefined }}>
            <History onOpen={(id) => setRoute({ name: 'session', id })} onBack={toHome} />
          </View>
        </ScrollView>
      );
      break;
    }
    case 'live':
      screen = <LiveScreen onBack={() => setRoute({ name: 'home' })} onFinished={(id) => { if (id) uploadLater(); setRoute(id ? { name: 'session', id, fresh: true } : { name: 'home' }); }} />;
      break;
    case 'session':
      screen = <SessionScreen key={route.id} id={route.id} fresh={route.fresh} onClose={goHome} />;
      break;
    case 'pool':
      screen = <PoolLog onSaved={(id) => { uploadLater(); setRoute({ name: 'session', id, fresh: true }); }} onBack={goHome} />;
      break;
    case 'profile':
      screen = <Profile onBack={goHome} onEvents={() => setRoute({ name: 'events' })} />;
      break;
    case 'events':
      screen = <Events onBack={goHome} />;
      break;
    case 'stats':
      screen = <Stats onBack={goHome} />;
      break;
    case 'settings':
      screen = (
        <SettingsScreen onBack={goHome} onRerunWizard={async () => { await saveSettings({ setupDone: false }); setRoute({ name: 'wizard' }); }} />
      );
      break;
  }

  return (
    <SafeAreaProvider>
      <StatusBar style="light" />
      <View style={{ flex: 1, backgroundColor: C.bg }}>{screen}</View>
    </SafeAreaProvider>
  );
}
