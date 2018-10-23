from pydub import AudioSegment
track = "theme.wav"
sound = AudioSegment.from_wav(track)

quieter_sound = sound - 25

quieter_sound.export('q_' + track, format='wav')
