// Home: this week per sport (big), this month (small), next event, sport choice, start, profile.
import React, { useState } from 'react';
import { Alert, Pressable, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Avatar, C, Hero, Segmented, SPORT_COLOR, T, initialsOf } from '../ui/kit.tsx';
import SidePanel, { type PanelTarget } from '../ui/SidePanel.tsx';
import { getSettings } from '../lib/settings.ts';
import { countdownLabel, upcoming } from '../lib/events.ts';
import { acwrTone, computeAcwr } from '../lib/acwr.ts';
import { ordered, type Sport } from '../lib/geo.ts';
import { allRows } from '../lib/history.ts';
import { totals } from '../lib/records.ts';
import { getLive } from '../tracking/tracker.ts';
import * as Haptics from 'expo-haptics';

const TONE = { ok: C.ok, warn: C.warn, bad: C.bad, dim: C.dim } as const;
const TAB: Record<Sport, string> = { run: 'Run', bike: 'Bike', swim_open: 'Swim', swim_pool: 'Pool' };
const NOUN: Record<Sport, string> = { run: 'run', bike: 'ride', swim_open: 'swim', swim_pool: 'pool swim' };

export default function Home({
  onStart, onPool, onHistory, onSettings, onProfile, onEvents, onStats, onSync, onBackToLive, syncNote,
}: {
  onStart: (s: Sport) => void; onPool: () => void; onHistory: () => void; onSettings: () => void;
  onProfile: () => void; onEvents: () => void; onStats: () => void; onSync: () => void; onBackToLive: () => void; syncNote: string;
}) {
  const s = getSettings();
  // Swim and Pool share one 'Swim' tab; open water or pool is chosen when you start.
  const sports = ordered(s.sports).filter((x) => x !== 'swim_pool' || !s.sports.includes('swim_open'))
    .map((x) => (x === 'swim_pool' ? 'swim_open' : x)) as Sport[];
  const first = s.defaultSport === 'swim_pool' ? 'swim_open' : s.defaultSport;
  const [sport, setSport] = useState<Sport>(sports.includes(first) ? first : sports[0]);
  const [panel, setPanel] = useState(false);
  const next = upcoming(s.events)[0];
  const history = allRows();
  const { week, month } = totals(history);
  const load = computeAcwr(history);
  const recording = getLive().status !== 'idle';

  const go = (t: PanelTarget) =>
    t === 'profile' ? onProfile() : t === 'events' ? onEvents() : t === 'history' ? onHistory() : t === 'settings' ? onSettings() : t === 'stats' ? onStats() : onSync();

  // Ask first, so a run is never recorded as a ride by accident.
  const confirmStart = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light).catch(() => {});
    if (sport === 'swim_open') {
      const canOpen = s.sports.includes('swim_open');
      const canPool = s.sports.includes('swim_pool');
      Alert.alert('Start a swim?', 'Where are you swimming?', [
        { text: 'Change sport', style: 'cancel' },
        ...(canOpen ? [{ text: 'Open water (GPS)', onPress: () => onStart('swim_open') }] : []),
        ...(canPool ? [{ text: 'Pool (log lengths)', onPress: onPool }] : []),
      ]);
      return;
    }
    Alert.alert(`Start a ${NOUN[sport]}?`, `${TAB[sport].toUpperCase()} is selected.`, [
      { text: 'Change sport', style: 'cancel' },
      { text: `Start ${NOUN[sport]}`, onPress: () => onStart(sport) },
    ]);
  };

  // One tile per sport with its own colour line on top, so the three numbers never run together.
  const Tile = ({ label, km, monthKm, color, alt }: { label: string; km: number; monthKm: number; color: string; alt?: boolean }) => (
    <View style={{ flex: 1, borderRadius: 10, borderWidth: 1, borderColor: C.line, borderTopWidth: 2, borderTopColor: color, backgroundColor: alt ? '#0f0f0f' : 'rgba(26,26,26,0.85)', paddingVertical: 10, paddingHorizontal: 10 }}>
      <Text style={[T.label, { color }]}>{label}</Text>
      <Text style={[T.big, { fontSize: 30, marginTop: 2, color }]} numberOfLines={1} adjustsFontSizeToFit>{km.toFixed(1)}</Text>
      <Text style={T.small}>km this week</Text>
      <View style={{ height: 1, backgroundColor: C.line, marginVertical: 7 }} />
      <Text style={[T.num, { fontSize: 13 }]} numberOfLines={1}>{monthKm.toFixed(0)} <Text style={T.small}>km month</Text></Text>
    </View>
  );

  return (
    <SafeAreaView style={T.screen}>
      <SidePanel open={panel} onClose={() => setPanel(false)} onGo={go} />
      <View style={{ flex: 1, padding: 20, gap: 16 }}>
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 14 }}>
          <Pressable onPress={() => setPanel(true)} hitSlop={14} accessibilityLabel="Open menu"><Text style={{ color: C.text, fontSize: 22 }}>☰</Text></Pressable>
          <Text style={[T.h2, { fontSize: 17 }]}>Mzansi <Text style={{ color: C.red }}>Go</Text></Text>
        </View>

        {recording ? (
          <Pressable onPress={onBackToLive} style={{ backgroundColor: C.red, borderRadius: 12, paddingVertical: 12, paddingHorizontal: 16, flexDirection: 'row', justifyContent: 'space-between' }}>
            <Text style={{ color: '#fff', fontWeight: '700' }}>● Recording</Text>
            <Text style={{ color: '#fff', fontWeight: '700' }}>Back to session ›</Text>
          </Pressable>
        ) : null}

        <Pressable onPress={onStats}>
          <Hero>
            <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
              <Text style={T.label}>This week · <Text style={{ color: C.text }}>{week.all.toFixed(1)} km</Text></Text>
              {load.acwr != null ? (
                <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6, paddingVertical: 3, paddingHorizontal: 9, borderRadius: 999, borderWidth: 1, borderColor: TONE[acwrTone(load.zone)] }}>
                  <View style={{ width: 6, height: 6, borderRadius: 3, backgroundColor: TONE[acwrTone(load.zone)] }} />
                  <Text style={{ color: TONE[acwrTone(load.zone)], fontSize: 11, fontWeight: '700' }}>Load {load.acwr.toFixed(2)}</Text>
                </View>
              ) : null}
            </View>
            <View style={{ flexDirection: 'row', marginTop: 12, gap: 8 }}>
              <Tile label="Run" km={week.run} monthKm={month.run} color={SPORT_COLOR.run} />
              <Tile label="Bike" km={week.bike} monthKm={month.bike} color={SPORT_COLOR.bike} alt />
              <Tile label="Swim" km={week.swim} monthKm={month.swim} color={SPORT_COLOR.swim} />
            </View>
            <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginTop: 10 }}>
              <Text style={T.label}>{new Date().toLocaleDateString('en-ZA', { month: 'long' })} total</Text>
              <Text style={{ color: C.text, fontSize: 13, fontWeight: '700' }}>{month.all.toFixed(1)} km</Text>
            </View>
          </Hero>
        </Pressable>

        {next ? (
          <Pressable onPress={onEvents} style={{ alignSelf: 'flex-start', maxWidth: '100%', flexDirection: 'row', alignItems: 'center', gap: 8, paddingVertical: 7, paddingHorizontal: 12, borderRadius: 999, borderWidth: 1, borderColor: C.line, backgroundColor: C.card2 }}>
            <Text numberOfLines={1} style={{ color: C.text, fontSize: 13, flexShrink: 1 }}>{next.name}</Text>
            <Text style={{ color: C.coral, fontSize: 13, fontWeight: '700' }}>{countdownLabel(next.days)}</Text>
          </Pressable>
        ) : null}

        {!recording ? (
          <View style={{ marginTop: 4 }}>
            <Segmented options={sports.map((sp) => ({ value: sp, label: TAB[sp] }))} value={sport} onChange={setSport} />
          </View>
        ) : null}

        <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }}>
          <Pressable
            onPress={recording ? onBackToLive : confirmStart}
            style={({ pressed }) => ({
              width: 190, height: 190, borderRadius: 95, backgroundColor: pressed ? '#b02a2a' : C.red,
              alignItems: 'center', justifyContent: 'center',
              shadowColor: C.red, shadowOpacity: 0.55, shadowRadius: 30, shadowOffset: { width: 0, height: 0 },
            })}
          >
            <Text style={{ color: '#fff', fontSize: 30, fontWeight: '800', letterSpacing: 1 }}>{recording ? 'LIVE' : TAB[sport].toUpperCase()}</Text>
            <Text style={{ color: '#ffd5d5', fontSize: 14, fontWeight: '700', letterSpacing: 2, marginTop: 4 }}>
              {recording ? 'BACK TO SESSION' : 'START'}
            </Text>
          </Pressable>
        </View>

        <View style={{ flexDirection: 'row', alignItems: 'flex-end', justifyContent: 'space-between' }}>
          <Pressable onPress={onProfile} hitSlop={10} style={{ alignItems: 'center', gap: 4, minWidth: 48 }}>
            <Avatar size={40} uri={s.photoUri} name={s.name} />
            <Text style={{ color: C.text, fontSize: 12, fontWeight: '700', letterSpacing: 1 }}>{s.name ? initialsOf(s.name) : 'Profile'}</Text>
          </Pressable>
          <View style={{ flexDirection: 'row', gap: 6, alignItems: 'center', paddingBottom: 10 }} accessibilityLabel="Swipe left for History">
            <View style={{ width: 16, height: 6, borderRadius: 3, backgroundColor: C.red }} />
            <View style={{ width: 6, height: 6, borderRadius: 3, backgroundColor: C.line }} />
          </View>
          <View style={{ minWidth: 48 }} />
        </View>
        {syncNote ? <Text style={[T.small, { textAlign: 'center', marginTop: -8 }]}>{syncNote}</Text> : null}
      </View>
    </SafeAreaView>
  );
}
