#!/usr/bin/env python3
"""Generate pre-recorded Dutch prompts for Spike & Floor using Piper (CC0 voice)."""
import hashlib, json, subprocess, wave
from pathlib import Path
from piper import PiperVoice, SynthesisConfig

root=Path(__file__).resolve().parent
phrases=json.loads((root/"voice-prompts.json").read_text(encoding="utf-8"))
model=Path("/tmp/spike-piper/nl_BE-nathalie-medium.onnx")
assert model.is_file(), "Dutch Piper model missing"
voice=PiperVoice.load(str(model))
output=root/"voice"
output.mkdir(exist_ok=True)
wav=Path("/tmp/spike-floor-voice.wav")
voice_map={}
syn=SynthesisConfig(length_scale=1.06, noise_scale=0.5, noise_w_scale=0.333)
for i, phrase in enumerate(phrases,1):
    phrase=phrase.strip()
    if not phrase or phrase in voice_map:
        continue
    filename=hashlib.sha256(phrase.encode("utf-8")).hexdigest()[:16]+".mp3"
    with wave.open(str(wav),"wb") as f:
        voice.synthesize_wav(phrase,f,syn_config=syn)
    subprocess.run(["ffmpeg","-hide_banner","-nostdin","-loglevel","error","-y","-i",str(wav),
      "-ac","1","-codec:a","libmp3lame","-q:a","5","-ar","22050",str(output/filename)],check=True)
    assert (output/filename).stat().st_size>700, (phrase, filename)
    voice_map[phrase]=filename
    if i%25==0: print(f"Generated {i}/{len(phrases)} phrases",flush=True)
(root/"voice"/"voice-map.json").write_text(json.dumps(voice_map,ensure_ascii=False,indent=2)+"\n",encoding="utf-8")
print("Generated",len(voice_map),"Dutch voice clips; total bytes",
      sum(x.stat().st_size for x in output.glob("*.mp3")),flush=True)
