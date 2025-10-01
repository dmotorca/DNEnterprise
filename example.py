from dotenv import load_dotenv
from elevenlabs.client import ElevenLabs
from elevenlabs.play import play
from test import get_arrivals

import os

load_dotenv()

elevenlabs = ElevenLabs(
  api_key=os.getenv("ELEVENLABS_API_KEY"),
)

audio = elevenlabs.text_to_speech.convert(
    text="NICO IS REALLY AWESOME AND LOVES TRIMET",
    voice_id="JBFqnCBsd6RMkjVDRZzb",
    model_id="eleven_multilingual_v2",
    output_format="mp3_44100_128",
)


play(audio)

