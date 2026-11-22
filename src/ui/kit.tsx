// Look = a dark training dashboard: near-black, #1a1a1a / #111 cards with #222 borders,
// coral numbers #ff6b6b with a soft red glow, small grey uppercase labels, red bar with a white dot.
// Rule: one hero number per screen, very few words.
import React, { useRef, useState } from 'react';
import { Animated, Image, Pressable, StyleSheet, Text, View, type ViewStyle, type TextStyle } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import * as Haptics from 'expo-haptics';

export const C = {
  bg: '#0d0d0d',
  side: '#0a0a0a',
  card: '#1a1a1a',
  card2: '#111111',
  line: '#222222',
  text: '#f0f0f0',
  dim: '#888888',
  red: '#d93535',
  coral: '#ff6b6b',
  red3: '#e84040',
  ok: '#44dd88',
  warn: '#ff9900',
  bad: '#ff4444',
  // kept for older imports
  gold: '#ff6b6b',
  goldSoft: '#ff6b6b',
  visor: '#f0f0f0',
  panel: '#1a1a1a',
  panel2: '#111111',
  redDark: '#3a0d0d',
  good: '#44dd88',
};

/** Sport colours, as on the dashboard: run red, ride white, swim blue. */
export const SPORT_COLOR = { run: '#ff6b6b', bike: '#f0f0f0', swim: '#5994f0' } as const;

/** "First Last" -> "FL". */
export const initialsOf = (name: string) =>
  (name || '').trim().split(/\s+/).filter(Boolean).map((w) => w[0]).join('').slice(0, 2).toUpperCase() || 'ME';

const glow = { textShadowColor: 'rgba(217,53,53,0.55)', textShadowOffset: { width: 0, height: 0 }, textShadowRadius: 8 } as const;

export const T = StyleSheet.create({
  screen: { flex: 1, backgroundColor: C.bg },
  h1: { color: C.text, fontSize: 28, fontWeight: '700' },
  h2: { color: C.text, fontSize: 20, fontWeight: '700' },
  label: { color: C.dim, fontSize: 11, fontWeight: '600', letterSpacing: 0.9, textTransform: 'uppercase' },
  body: { color: C.text, fontSize: 16 },
  small: { color: C.dim, fontSize: 12 },
  card: { backgroundColor: C.card, borderRadius: 12, padding: 16, borderWidth: 1, borderColor: C.line },
  big: { color: C.coral, fontWeight: '700', fontVariant: ['tabular-nums'], ...glow },
  num: { color: C.text, fontWeight: '700', fontVariant: ['tabular-nums'] },
});

/** The dashboard's hero card: dark with a red glow from the top-right corner. */
export function Hero({ children, style }: { children: React.ReactNode; style?: ViewStyle }) {
  return (
    <View style={[{ borderRadius: 14, borderWidth: 1, borderColor: C.line, backgroundColor: '#111', overflow: 'hidden' }, style]}>
      <LinearGradient
        colors={['rgba(217,53,53,0.26)', 'rgba(217,53,53,0.09)', 'rgba(217,53,53,0)']}
        locations={[0, 0.4, 0.85]}
        start={{ x: 1, y: 0 }}
        end={{ x: 0.2, y: 1 }}
        style={StyleSheet.absoluteFill}
      />
      <View style={{ padding: 20 }}>{children}</View>
    </View>
  );
}

/** Red-to-coral bar with the white glowing dot, as on the dashboard. */
export function GBar({ pct, style }: { pct: number; style?: ViewStyle }) {
  const p = Math.max(0, Math.min(100, pct));
  return (
    <View style={[{ height: 8, borderRadius: 4, backgroundColor: C.line, marginTop: 10 }, style]}>
      <LinearGradient colors={['#c02020', C.red3]} start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }} style={{ height: 8, borderRadius: 4, width: `${p}%` }} />
      {p > 0 ? (
        <View style={{ position: 'absolute', left: `${p}%`, marginLeft: -6, top: -2, width: 12, height: 12, borderRadius: 6, backgroundColor: '#fff', shadowColor: '#fff', shadowOpacity: 0.6, shadowRadius: 6 }} />
      ) : null}
    </View>
  );
}

export function Btn({
  title, onPress, kind = 'primary', style, disabled,
}: { title: string; onPress: () => void; kind?: 'primary' | 'gold' | 'ghost' | 'danger'; style?: ViewStyle; disabled?: boolean }) {
  const bg = kind === 'primary' ? C.red : kind === 'gold' ? C.text : kind === 'danger' ? '#2a1212' : 'transparent';
  const fg = kind === 'gold' ? '#0d0d0d' : kind === 'danger' ? C.coral : C.text;
  return (
    <Pressable
      onPress={onPress}
      disabled={disabled}
      style={({ pressed }) => [
        s.btn,
        { backgroundColor: bg, opacity: disabled ? 0.35 : pressed ? 0.75 : 1 },
        kind === 'ghost' && { borderWidth: 1, borderColor: C.line },
        style,
      ]}
    >
      <Text style={[s.btnText, { color: fg }]}>{title}</Text>
    </Pressable>
  );
}

/** Press and hold to confirm (FINISH), so a bump in the pocket cannot end a session. */
export function HoldBtn({ title, onDone, ms = 1200, style }: { title: string; onDone: () => void; ms?: number; style?: ViewStyle }) {
  const prog = useRef(new Animated.Value(0)).current;
  const [w, setW] = useState(0);
  const anim = useRef<Animated.CompositeAnimation | null>(null);
  const begin = () => {
    anim.current = Animated.timing(prog, { toValue: 1, duration: ms, useNativeDriver: false });
    anim.current.start(({ finished }) => {
      if (finished) { prog.setValue(0); onDone(); }
    });
  };
  const cancel = () => { anim.current?.stop(); Animated.timing(prog, { toValue: 0, duration: 150, useNativeDriver: false }).start(); };
  return (
    <Pressable onPressIn={begin} onPressOut={cancel} onLayout={(e) => setW(e.nativeEvent.layout.width)}
      style={[s.btn, { backgroundColor: C.card, borderWidth: 1, borderColor: C.line, overflow: 'hidden' }, style]}>
      <Animated.View style={{ position: 'absolute', left: 0, top: 0, bottom: 0, backgroundColor: C.red, width: prog.interpolate({ inputRange: [0, 1], outputRange: [0, w] }) }} />
      <Text style={s.btnText}>{title}</Text>
      <Text style={[T.label, { fontSize: 9, marginTop: 2 }]}>hold</Text>
    </Pressable>
  );
}

/** Multiple-choice option (wizard). */
export function Choice({ label, hint, selected, onPress, multi }: { label: string; hint?: string; selected: boolean; onPress: () => void; multi?: boolean }) {
  return (
    <Pressable onPress={onPress} style={[s.choice, selected && { borderColor: C.red, backgroundColor: '#1d1111' }]}>
      <View style={[s.dot, multi && { borderRadius: 5 }, selected && { borderColor: C.coral, backgroundColor: C.coral }]} />
      <View style={{ flex: 1 }}>
        <Text style={T.body}>{label}</Text>
        {hint ? <Text style={[T.small, { marginTop: 2 }]}>{hint}</Text> : null}
      </View>
    </Pressable>
  );
}

/** Text tab like the dashboard's side menu: grey, white with a red underline when on. */
export function Chip({ label, selected, onPress }: { label: string; selected: boolean; onPress: () => void }) {
  return (
    <Pressable onPress={onPress} style={{ paddingVertical: 8, paddingHorizontal: 2, marginRight: 16, borderBottomWidth: 2, borderColor: selected ? C.red : 'transparent' }}>
      <Text style={{ color: selected ? C.text : C.dim, fontSize: 15, fontWeight: selected ? '700' : '500' }}>{label}</Text>
    </Pressable>
  );
}

/** Filled pill for a choice that must be obvious (session type): red when chosen. */
export function Pill({ label, selected, onPress }: { label: string; selected: boolean; onPress: () => void }) {
  return (
    <Pressable onPress={onPress} hitSlop={4}
      style={({ pressed }) => ({
        paddingVertical: 9, paddingHorizontal: 16, borderRadius: 999, borderWidth: 1,
        borderColor: selected ? C.red : C.line, backgroundColor: selected ? C.red : C.card2, opacity: pressed ? 0.7 : 1,
        shadowColor: C.red, shadowOpacity: selected ? 0.5 : 0, shadowRadius: 10, shadowOffset: { width: 0, height: 0 },
      })}>
      <Text style={{ color: selected ? '#fff' : C.dim, fontSize: 15, fontWeight: selected ? '700' : '600' }}>{selected ? `✓ ${label}` : label}</Text>
    </Pressable>
  );
}

export function Stat({ label, value, unit, big, style, color }: { label: string; value: string; unit?: string; big?: boolean; style?: ViewStyle; color?: string }) {
  return (
    <View style={[{ flex: 1, paddingVertical: 6 }, style]}>
      <Text style={T.label}>{label}</Text>
      <Text style={[big ? T.big : T.num, { fontSize: big ? 56 : 26, marginTop: 2 }, color ? { color } : null] as TextStyle[]} numberOfLines={1} adjustsFontSizeToFit>
        {value}
        {unit ? <Text style={s.unit}> {unit}</Text> : null}
      </Text>
    </View>
  );
}

const s = StyleSheet.create({
  btn: { minHeight: 56, borderRadius: 12, alignItems: 'center', justifyContent: 'center', paddingHorizontal: 18 },
  btnText: { color: C.text, fontSize: 16, fontWeight: '700', letterSpacing: 0.6 },
  choice: { flexDirection: 'row', alignItems: 'center', gap: 14, padding: 16, borderRadius: 12, borderWidth: 1, borderColor: C.line, backgroundColor: C.card, marginBottom: 10 },
  dot: { width: 20, height: 20, borderRadius: 10, borderWidth: 2, borderColor: C.dim },
  unit: { color: C.dim, fontSize: 14, fontWeight: '600', textShadowRadius: 0 },
});

/** Top-left back button used on every screen except Home and the live recording screen. */
export function BackBar({ onBack, title }: { onBack: () => void; title?: string }) {
  return (
    <View style={{ flexDirection: 'row', alignItems: 'center', paddingHorizontal: 12, paddingTop: 4, paddingBottom: 4, minHeight: 44 }}>
      <Pressable onPress={onBack} hitSlop={14} style={({ pressed }) => ({ flexDirection: 'row', alignItems: 'center', paddingHorizontal: 8, paddingVertical: 6, opacity: pressed ? 0.5 : 1 })}>
        <Text style={{ color: C.coral, fontSize: 26, lineHeight: 28, marginTop: -2 }}>‹</Text>
        <Text style={{ color: C.coral, fontSize: 16, fontWeight: '600', marginLeft: 4 }}>Back</Text>
      </Pressable>
      {title ? <Text style={[T.label, { marginLeft: 8 }]}>{title}</Text> : null}
    </View>
  );
}

/** Round profile picture (the user's photo, or their initials). */
export function Avatar({ size = 36, uri, name }: { size?: number; uri?: string; name?: string }) {
  const initials = initialsOf(name ?? '');
  return (
    <View style={{ width: size, height: size, borderRadius: size / 2, backgroundColor: C.card, borderWidth: 1, borderColor: C.line, alignItems: 'center', justifyContent: 'center', overflow: 'hidden' }}>
      {uri ? <Image source={{ uri }} style={{ width: size, height: size }} /> : <Text style={{ color: C.coral, fontWeight: '700', fontSize: size * 0.38 }}>{initials}</Text>}
    </View>
  );
}

/** Centred pill switch (Run | Bike | Swim). The selected one is filled red. Light haptic on change. */
export function Segmented<V extends string>({ options, value, onChange }: { options: { value: V; label: string }[]; value: V; onChange: (v: V) => void }) {
  return (
    <View style={{ flexDirection: 'row', alignSelf: 'center', backgroundColor: C.card2, borderRadius: 999, borderWidth: 1, borderColor: C.line, padding: 4 }}>
      {options.map((o) => {
        const on = o.value === value;
        return (
          <Pressable key={o.value} onPress={() => { if (!on) { Haptics.selectionAsync().catch(() => {}); onChange(o.value); } }}
            style={{ paddingVertical: 9, paddingHorizontal: 22, borderRadius: 999, backgroundColor: on ? C.red : 'transparent' }}>
            <Text style={{ color: on ? '#fff' : C.dim, fontSize: 15, fontWeight: on ? '700' : '600' }}>{o.label}</Text>
          </Pressable>
        );
      })}
    </View>
  );
}
