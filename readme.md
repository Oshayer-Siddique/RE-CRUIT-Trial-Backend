Here is the documention of Meeting Recording AI assistant:
Soft Requirement:
    An AI-powered Meeting Minutes Recorder that transcribes and summarizes real-world offline conversations.
    Key Features:
        Recording Interface: 
        A user-friendly web interface with a “Start Recording” and “Stop Recording” button to initiate and stop recording conversations.
        Audio Transcription:
         Recorded audio will be transcribed using the Whisper speech recognition model, converting the audio into text format.
        Speaker Recognition:
         Automatically detect and differentiate between speakers in the conversation, labeling them as “Speaker 1”, “Speaker 2", etc.
        Conversation Format:
         Display the transcribed conversation in a readable format, with each speaker’s lines separated and labeled accordingly.
        Speaker Editing:
         Provide an option to edit speaker labels and assign names or identities to the detected speakers.
        Summarization: Use OpenAI’s GPT-4 to generate a chronological summary of the conversation, highlighting key points and decisions.
        Summary Formats:
         Offer multiple summary formats, such as bullet points, paragraphs, or a timeline, to suit different user preferences.



How to run the backend server :
    1 . git clone https://github.com/Oshayer-Siddique/RE-CRUIT-Trial-Backend.git
    2 . npm i
    3 . install python dependencies:
        {
            pip install assemblyai python-dotenv
        }
    4 . npm start
        (without nodemon)
    5 . npm run dev
        (with nodemon)
         
    

Here for the Backend Part I used Node Js. Backend is running at localhost post 5000
Here I have 5 api endpoints for the Backend:

for the transcribe of audio file:
    api endpoint: http://localhost:5000/transcribe

here I used whisper ai model for transcribe. 
here is the docs : https://platform.openai.com/docs/guides/speech-to-text



for the summarization:
api endpoint : http://localhost:5000/summary

ai model and its parameters:

      model: "gpt-4-vision-preview",
      max_tokens: 200,
      temperature: 0.5, // randomness
      top_p: 1, // Adjust top_p as needed
      frequency_penalty: 0,
      presence_penalty: 0,
then ai formatated the summary with paragrapgh ,bulletpoints and timeline.

here is the docs       : https://platform.openai.com/docs/guides/text-generation
for prompt engineering : https://platform.openai.com/docs/guides/prompt-engineering



for the speaker diariaztion(most difficult part):

api endpoint: http://localhost:5000/conversation

here I ran a python script inside my node js runtime using "child process " library built in node js

python code is executed inside node js.I used regular expression for formating speaker, message and timestamp


for the speaker diarization I used assemblyai. here is the docs : 
(https://www.assemblyai.com/docs/)



for the transcribe of the uploaded file:
api endpoint : http://localhost:5000/transcribefile

It similar to transcribe but it works for uploaded file also.


for the speaker diarization of the uploaded file :
    api endpoint : http://localhost:5000/conversationfile


It also does speaker diarization and also for the uploaded file.



