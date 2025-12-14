import { useState, useEffect, useRef } from 'react';
import * as Tone from 'tone';
import './MidiPlayer.css';


interface MidiPlayerProps {
  midiUrl: string;
  title?: string;
}

export default function MidiPlayer({ midiUrl, title = 'MIDI Player' }: MidiPlayerProps) {
  const [isPlaying, setIsPlaying] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [volume, setVolume] = useState(70);
  const [isMounted, setIsMounted] = useState(false);
  
  const synthsRef = useRef<Tone.PolySynth[]>([]);
  const midiRef = useRef<any>(null);
  const partsRef = useRef<Tone.Part[]>([]);
  const animationFrameRef = useRef<number | null>(null);

  // Ensure component only runs on client
  useEffect(() => {
    setIsMounted(true);
  }, []);

  // Load MIDI file
  useEffect(() => {
    if (!isMounted) return;
    loadMidi();
    return () => {
      cleanup();
    };
  }, [midiUrl, isMounted]);

  // Update volume
  useEffect(() => {
    if (!isMounted) return;
    synthsRef.current.forEach(synth => {
      synth.volume.value = Tone.gainToDb(volume / 100);
    });
  }, [volume, isMounted]);

  const loadMidi = async () => {
    try {
      setIsLoading(true);
      setError(null);
      
      // Dynamically import @tonejs/midi to avoid SSR issues
      const { Midi } = await import('@tonejs/midi');
      
      const response = await fetch(midiUrl);
      const arrayBuffer = await response.arrayBuffer();
      const midi = new Midi(arrayBuffer);
      
      midiRef.current = midi;
      setDuration(midi.duration);
      
      // Create synths for each track with high polyphony
      cleanup();
      synthsRef.current = midi.tracks.map(() => {
        const synth = new Tone.PolySynth(Tone.Synth, {
          envelope: {
            attack: 0.02,
            decay: 0.1,
            sustain: 0.3,
            release: 1,
          },
        });
        synth.maxPolyphony = 128;
        return synth.toDestination();
      });
      
      setIsLoading(false);
    } catch (err) {
      console.error('Error loading MIDI:', err);
      setError('Failed to load MIDI file');
      setIsLoading(false);
    }
  };

  const cleanup = () => {
    // Stop and dispose all parts
    partsRef.current.forEach(part => {
      part.stop();
      part.dispose();
    });
    partsRef.current = [];
    
    // Dispose all synths
    synthsRef.current.forEach(synth => synth.dispose());
    synthsRef.current = [];
    
    // Cancel animation frame
    if (animationFrameRef.current) {
      cancelAnimationFrame(animationFrameRef.current);
      animationFrameRef.current = null;
    }
    
    // Clear transport
    Tone.Transport.cancel();
  };

  const updateTime = () => {
    if (Tone.Transport.state === 'started') {
      setCurrentTime(Tone.Transport.seconds);
      animationFrameRef.current = requestAnimationFrame(updateTime);
    }
  };

  const play = async () => {
    if (!midiRef.current) return;
    
    try {
      // Start Tone.js audio context (requires user gesture)
      if (Tone.context.state !== 'running') {
        await Tone.start();
      }
      
      // If we already have parts, just resume transport
      if (partsRef.current.length > 0) {
        setIsPlaying(true);
        Tone.Transport.start();
        animationFrameRef.current = requestAnimationFrame(updateTime);
        return;
      }

      // Create parts for each track using Transport scheduling
      const midi = midiRef.current;
      
      midi.tracks.forEach((track: any, trackIndex: number) => {
        const synth = synthsRef.current[trackIndex];
        
        // Map notes to the format expected by Tone.Part
        const events = track.notes.map((note: any) => ({
          time: note.time,
          note: note.name,
          duration: note.duration,
          velocity: note.velocity
        }));
        
        const part = new Tone.Part((time, value) => {
          // Use the scheduled time parameter for accurate timing
          synth.triggerAttackRelease(
            value.note,
            value.duration,
            time,
            value.velocity
          );
        }, events).start(0);
        
        partsRef.current.push(part);
      });

      // Schedule stop at end
      Tone.Transport.schedule((time) => {
        // Use Tone.Draw to sync with animation frame for UI updates
        Tone.Draw.schedule(() => {
          stop();
        }, time);
      }, midi.duration);

      setIsPlaying(true);
      Tone.Transport.start();
      animationFrameRef.current = requestAnimationFrame(updateTime);
      
    } catch (err) {
      console.error('Error playing MIDI:', err);
      setError('Failed to play MIDI file. Click play again to start audio.');
    }
  };

  const pause = () => {
    Tone.Transport.pause();
    setIsPlaying(false);
    if (animationFrameRef.current) {
      cancelAnimationFrame(animationFrameRef.current);
      animationFrameRef.current = null;
    }
  };

  const stop = () => {
    Tone.Transport.stop();
    Tone.Transport.cancel();
    Tone.Transport.position = 0;
    setIsPlaying(false);
    setCurrentTime(0);
    
    if (animationFrameRef.current) {
      cancelAnimationFrame(animationFrameRef.current);
      animationFrameRef.current = null;
    }
    
    // Stop and dispose all parts
    partsRef.current.forEach(part => {
      part.stop();
      part.dispose();
    });
    partsRef.current = [];
  };

  const handleSeek = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newTime = parseFloat(e.target.value);
    const wasPlaying = isPlaying;
    
    // Pause if playing
    if (wasPlaying) {
      pause();
    }
    
    // Update transport position
    Tone.Transport.seconds = newTime;
    setCurrentTime(newTime);
    
    // Resume if it was playing
    if (wasPlaying) {
      Tone.Transport.start();
      setIsPlaying(true);
      updateTime();
    }
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  if (!isMounted) {
    return (
      <div className="midi-player geo-box-raised" style={{"background": "rebeccapurple"}}>
        <div className="midi-player-header">
          <h3 className="text-neon-cyan">{title}</h3>
        </div>
        <div className="midi-loading">
          <p>Loading player...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="midi-player geo-box-raised" style={{"background": "rebeccapurple"}}>
      <div className="midi-player-header">
        <h3 className="text-neon-cyan">🎵 {title} 🎵</h3>
      </div>
      
      {error && (
        <div className="midi-error">
          <p>⚠️ {error}</p>
        </div>
      )}
      
      {isLoading ? (
        <div className="midi-loading">
          <p>Loading MIDI file...</p>
        </div>
      ) : (
        <>
          <div className="midi-controls">
            <button
              className="midi-button play-button"
              onClick={isPlaying ? pause : play}
              disabled={!!error}
            >
              {isPlaying ? '⏸️ Pause' : '▶️ Play'}
            </button>
            
            <button
              className="midi-button stop-button"
              onClick={stop}
              disabled={!isPlaying && currentTime === 0}
            >
              ⏹️ Stop
            </button>
          </div>

          <div className="midi-progress">
            <span className="time-display">{formatTime(currentTime)}</span>
            <input
              type="range"
              min="0"
              max={duration}
              step="0.1"
              value={currentTime}
              onChange={handleSeek}
              className="progress-slider"
            />
            <span className="time-display">{formatTime(duration)}</span>
          </div>

          <div className="midi-volume">
            <span className="volume-label">🔊 Volume:</span>
            <input
              type="range"
              min="0"
              max="100"
              value={volume}
              onChange={(e) => setVolume(parseInt(e.target.value))}
              className="volume-slider"
            />
            <span className="volume-value">{volume}%</span>
          </div>
        </>
      )}
    </div>
  );
}

// Made with Bob
