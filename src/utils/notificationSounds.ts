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

export const NOTIFICATION_SOUNDS = {
  bell: {
    name: 'جرس / Bjelle',
    frequency: 800,
    duration: 0.5,
    description: 'صوت جرس ناعم وهادئ'
  },
  chime: {
    name: 'نغمة / Chime',
    frequency: 1200,
    duration: 0.4,
    description: 'نغمة موسيقية لطيفة'
  },
  alert: {
    name: 'تنبيه / Varsel',
    frequency: 1000,
    duration: 0.3,
    description: 'صوت تنبيه واضح'
  },
  alarm: {
    name: 'إنذار / Alarm',
    frequency: 1500,
    duration: 0.6,
    description: 'صوت إنذار قوي ومتكرر'
  },
  gentle: {
    name: 'لطيف / Mild',
    frequency: 600,
    duration: 0.7,
    description: 'صوت هادئ ولطيف جداً'
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
      console.log('🎵 Playing tone:', sound.frequency + 'Hz for', sound.duration + 's');
      await playTone(sound.frequency, sound.duration, calculatedVolume);
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
