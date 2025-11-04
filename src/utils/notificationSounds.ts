// Play tone using Web Audio API directly
const playTone = (frequency: number, duration: number, volume: number = 0.3) => {
  try {
    const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();

    const oscillator = audioContext.createOscillator();
    const gainNode = audioContext.createGain();

    oscillator.connect(gainNode);
    gainNode.connect(audioContext.destination);

    oscillator.frequency.value = frequency;
    oscillator.type = 'sine';

    // Set initial volume
    gainNode.gain.setValueAtTime(volume, audioContext.currentTime);
    // Fade out at the end
    gainNode.gain.exponentialRampToValueAtTime(0.001, audioContext.currentTime + duration);

    oscillator.start(audioContext.currentTime);
    oscillator.stop(audioContext.currentTime + duration);

    return new Promise<void>((resolve) => {
      oscillator.onended = () => {
        audioContext.close();
        resolve();
      };
    });
  } catch (err) {
    console.error('Error playing tone:', err);
    return Promise.reject(err);
  }
};

const playSiren = async (duration: number, volume: number) => {
  const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
  const oscillator = audioContext.createOscillator();
  const gainNode = audioContext.createGain();

  oscillator.connect(gainNode);
  gainNode.connect(audioContext.destination);
  oscillator.type = 'square';
  gainNode.gain.setValueAtTime(volume, audioContext.currentTime);

  const startFreq = 800;
  const endFreq = 400;
  oscillator.frequency.setValueAtTime(startFreq, audioContext.currentTime);

  for (let i = 0; i < duration * 4; i++) {
    const time = audioContext.currentTime + (i * 0.25);
    const freq = i % 2 === 0 ? startFreq : endFreq;
    oscillator.frequency.setValueAtTime(freq, time);
  }

  oscillator.start(audioContext.currentTime);
  oscillator.stop(audioContext.currentTime + duration);

  return new Promise<void>((resolve) => {
    oscillator.onended = () => {
      audioContext.close();
      resolve();
    };
  });
};

const speakText = async (text: string, lang: string = 'ar') => {
  if ('speechSynthesis' in window) {
    return new Promise<void>((resolve) => {
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.lang = lang === 'ar' ? 'ar-SA' : 'no-NO';
      utterance.rate = 1.0;
      utterance.pitch = 1.0;
      utterance.volume = 1.0;
      utterance.onend = () => resolve();
      utterance.onerror = () => resolve();
      window.speechSynthesis.speak(utterance);
    });
  }
  return Promise.resolve();
};

export const NOTIFICATION_SOUNDS = {
  bell: {
    name: 'جرس / Bjelle',
    frequency: 800,
    duration: 0.5,
    description: 'صوت جرس ناعم وهادئ',
    type: 'tone' as const
  },
  chime: {
    name: 'نغمة / Chime',
    frequency: 1200,
    duration: 0.4,
    description: 'نغمة موسيقية لطيفة',
    type: 'tone' as const
  },
  alert: {
    name: 'تنبيه / Varsel',
    frequency: 1000,
    duration: 0.3,
    description: 'صوت تنبيه واضح',
    type: 'tone' as const
  },
  alarm: {
    name: 'إنذار / Alarm',
    frequency: 1500,
    duration: 0.6,
    description: 'صوت إنذار قوي ومتكرر',
    type: 'tone' as const
  },
  gentle: {
    name: 'لطيف / Mild',
    frequency: 600,
    duration: 0.7,
    description: 'صوت هادئ ولطيف جداً',
    type: 'tone' as const
  },
  siren: {
    name: '🚨 صفارة إنذار / Sirene',
    frequency: 800,
    duration: 1.5,
    description: 'صفارة إنذار صاخبة ومتذبذبة',
    type: 'siren' as const
  },
  urgent: {
    name: '🔴 عاجل / Haster',
    frequency: 2000,
    duration: 1.2,
    description: 'صوت عاجل وصاخب جداً',
    type: 'tone' as const
  },
  loud_beep: {
    name: '⚡ صفير قوي / Høyt pip',
    frequency: 2500,
    duration: 1.0,
    description: 'صفير حاد وقوي',
    type: 'tone' as const
  },
  voice_ar: {
    name: '🗣️ صوت بشري عربي',
    frequency: 0,
    duration: 3,
    description: 'صوت بشري يقرأ التنبيه بالعربية',
    type: 'voice' as const,
    text: 'تنبيه! يرجى إكمال المهام الروتينية اليومية'
  },
  voice_no: {
    name: '🗣️ Menneskelig stemme norsk',
    frequency: 0,
    duration: 3,
    description: 'Menneskelig stemme leser varselet på norsk',
    type: 'voice' as const,
    text: 'Advarsel! Vennligst fullfør de daglige rutineoppgavene'
  }
};

export const playSound = async (
  soundType: keyof typeof NOTIFICATION_SOUNDS,
  volume: number,
  repeatCount: number,
  intervalSeconds: number,
  onComplete?: () => void
) => {
  console.log('🔊 playSound called with:', { soundType, volume, repeatCount, intervalSeconds });

  const sound = NOTIFICATION_SOUNDS[soundType];
  if (!sound) {
    console.error('❌ Sound type not found:', soundType);
    console.log('Available sounds:', Object.keys(NOTIFICATION_SOUNDS));
    if (onComplete) onComplete();
    return;
  }

  const calculatedVolume = Math.min(Math.max(volume / 100, 0), 1);
  console.log('🎚️ Volume calculated:', calculatedVolume);

  const playOnce = async () => {
    try {
      if (sound.type === 'siren') {
        console.log('🚨 Playing siren for', sound.duration + 's');
        await playSiren(sound.duration, calculatedVolume);
      } else if (sound.type === 'voice') {
        console.log('🗣️ Speaking text:', sound.text);
        await speakText(sound.text || '', soundType.includes('ar') ? 'ar' : 'no');
      } else {
        console.log('🎵 Playing tone:', sound.frequency + 'Hz for', sound.duration + 's');
        await playTone(sound.frequency, sound.duration, calculatedVolume);
      }
      console.log('✅ Sound played successfully:', soundType);
    } catch (err) {
      console.error('❌ Error playing tone:', err);
      throw err;
    }
  };

  const playAll = async () => {
    for (let i = 0; i < repeatCount; i++) {
      console.log(`🔁 Repetition ${i + 1}/${repeatCount}`);
      try {
        await playOnce();
        if (i < repeatCount - 1) {
          console.log(`⏳ Waiting ${intervalSeconds}s before next repetition...`);
          await new Promise(resolve => setTimeout(resolve, intervalSeconds * 1000));
        }
      } catch (err) {
        console.error('❌ Failed to play sound:', err);
        break;
      }
    }
    console.log('🎉 All repetitions completed');
    if (onComplete) onComplete();
  };

  playAll().catch(err => {
    console.error('❌ Error in playSound:', err);
    if (onComplete) onComplete();
  });
};
