# Start by making sure the `assemblyai` package is installed.
# If not, you can install it by running the following command:
# pip install -U assemblyai
#
# Note: Some macOS users may need to use `pip3` instead of `pip`.

import assemblyai as aai

# Replace with your API key
aai.settings.api_key = "75488de63fb94c67adc3d058c993e675"

# URL of the file to transcribe
FILE_URL = "./uploads/sample1.m4a"

# You can also transcribe a local file by passing in a file path
# FILE_URL = './path/to/file.mp3'

config = aai.TranscriptionConfig(auto_highlights=True)

transcriber = aai.Transcriber()
transcript = transcriber.transcribe(
  FILE_URL,
  config=config
)

for result in transcript.auto_highlights.results:
  print(f"Highlight: {result.text}, Count: {result.count}, Rank: {result.rank}")
