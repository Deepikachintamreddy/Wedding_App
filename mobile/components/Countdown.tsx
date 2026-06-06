import React, { useState, useEffect } from 'react';
import { StyleSheet, Text, View } from 'react-native';

interface CountdownProps {
  targetDate: string;
}

export default function Countdown({ targetDate }: CountdownProps) {
  const [timeLeft, setTimeLeft] = useState({
    days: 0,
    hours: 0,
    minutes: 0,
    seconds: 0
  });

  useEffect(() => {
    const calculateTime = () => {
      const difference = +new Date(targetDate) - +new Date();
      if (difference <= 0) {
        setTimeLeft({ days: 0, hours: 0, minutes: 0, seconds: 0 });
        return;
      }

      setTimeLeft({
        days: Math.floor(difference / (1000 * 60 * 60 * 24)),
        hours: Math.floor((difference / (1000 * 60 * 60)) % 24),
        minutes: Math.floor((difference / 1000 / 60) % 60),
        seconds: Math.floor((difference / 1000) % 60)
      });
    };

    calculateTime();
    const interval = setInterval(calculateTime, 1000);

    return () => clearInterval(interval);
  }, [targetDate]);

  const padZero = (num: number) => String(num).padStart(2, '0');

  return (
    <View style={styles.container}>
      <Text style={styles.titleText}>
        TIME LEFT UNTIL
      </Text>
      <Text style={styles.scriptText}>
        the <Text style={styles.boldText}>WEDDING</Text>
      </Text>

      <View style={styles.timerRow}>
        <View style={styles.timeBlock}>
          <Text style={styles.timeNumber}>{timeLeft.days}</Text>
          <Text style={styles.timeLabel}>DAYS</Text>
        </View>
        <Text style={styles.colon}>:</Text>
        
        <View style={styles.timeBlock}>
          <Text style={styles.timeNumber}>{padZero(timeLeft.hours)}</Text>
          <Text style={styles.timeLabel}>HOURS</Text>
        </View>
        <Text style={styles.colon}>:</Text>
        
        <View style={styles.timeBlock}>
          <Text style={styles.timeNumber}>{padZero(timeLeft.minutes)}</Text>
          <Text style={styles.timeLabel}>MINUTES</Text>
        </View>
        <Text style={[styles.colon, { color: '#ff7b7b' }]}>:</Text>
        
        <View style={styles.timeBlock}>
          <Text style={[styles.timeNumber, { color: '#ff7b7b' }]}>{padZero(timeLeft.seconds)}</Text>
          <Text style={[styles.timeLabel, { color: '#ff7b7b' }]}>SECONDS</Text>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: 'rgba(26, 26, 46, 0.65)',
    borderWidth: 1,
    borderColor: 'rgba(201, 169, 110, 0.25)',
    borderRadius: 24,
    padding: 24,
    alignItems: 'center',
    width: '100%',
    shadowColor: '#c9a96e',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.1,
    shadowRadius: 10,
    elevation: 4,
    marginBottom: 20,
  },
  titleText: {
    fontSize: 18,
    letterSpacing: 4,
    color: '#a0937d',
    fontWeight: '300',
    textAlign: 'center',
  },
  scriptText: {
    fontSize: 22,
    color: '#c9a96e',
    fontStyle: 'italic',
    textAlign: 'center',
    marginTop: -2,
    marginBottom: 20,
    letterSpacing: 1,
  },
  boldText: {
    fontFamily: 'SpaceMono',
    fontWeight: '700',
    fontSize: 22,
    fontStyle: 'normal',
    color: '#f5f0e8',
    letterSpacing: 2,
  },
  timerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    marginTop: 10,
  },
  timeBlock: {
    alignItems: 'center',
    minWidth: 55,
  },
  timeNumber: {
    fontSize: 32,
    fontWeight: '700',
    color: '#f5f0e8',
    fontFamily: 'SpaceMono',
  },
  timeLabel: {
    fontSize: 9,
    letterSpacing: 1.5,
    color: '#a0937d',
    marginTop: 6,
    fontWeight: '600',
  },
  colon: {
    fontSize: 26,
    fontWeight: '600',
    color: '#a0937d',
    marginTop: -18,
  },
});
