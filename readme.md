# Meeting Recording AI Assistant

An AI-powered Meeting Minutes Recorder that transcribes and summarizes real-world offline conversations.

## Key Features:

### 1. Recording Interface:

A user-friendly web interface with a “Start Recording” and “Stop Recording” button to initiate and stop recording conversations.

### 2. Audio Transcription:

Recorded audio will be transcribed using the Whisper speech recognition model, converting the audio into text format.

### 3. Speaker Recognition:

Automatically detect and differentiate between speakers in the conversation, labeling them as “Speaker 1”, “Speaker 2", etc.

### 4. Conversation Format:

Display the transcribed conversation in a readable format, with each speaker’s lines separated and labeled accordingly.

### 5. Speaker Editing:

Provide an option to edit speaker labels and assign names or identities to the detected speakers.

### 6. Summarization:

Use OpenAI’s GPT-4 to generate a chronological summary of the conversation, highlighting key points and decisions.

### 7. Summary Formats:

Offer multiple summary formats, such as bullet points, paragraphs, or a timeline, to suit different user preferences.

## How to Run the Backend Server:

1. Clone the repository:
git clone https://github.com/Oshayer-Siddique/RE-CRUIT-Trial-Backend.git


2. Install dependencies:

npm install


3. Install Python dependencies:

pip install assemblyai python-dotenv



4. Start the server:

- Without nodemon:

npm start


- With nodemon:

npm run dev



## API Endpoints:

1. **Transcribe Audio File**:

   - Endpoint: `http://localhost:5000/transcribe`
   - Description: Transcribes audio files using the Whisper AI model.
   - Documentation: [Whisper AI Docs](https://platform.openai.com/docs/guides/speech-to-text)

2. **Summarization**:

   - Endpoint: `http://localhost:5000/summary`
   - Description: Generates a summary of the conversation using OpenAI's GPT-4.
   - Documentation: [OpenAI Text Generation Docs](https://platform.openai.com/docs/guides/text-generation)

3. **Speaker Diarization**:

   - Endpoint: `http://localhost:5000/conversation`
   - Description: Detects and labels speakers in the conversation.
   - External Tool: [AssemblyAI Docs](https://www.assemblyai.com/docs/)

4. **Transcribe Uploaded File**:

   - Endpoint: `http://localhost:5000/transcribefile`
   - Description: Transcribes uploaded audio files similar to the audio file transcription endpoint.

5. **Speaker Diarization of Uploaded File**:

   - Endpoint: `http://localhost:5000/conversationfile`
   - Description: Performs speaker diarization for uploaded audio files.

## Prompt Engineering:

For prompt engineering, refer to the [OpenAI Prompt Engineering Guide](https://platform.openai.com/docs/guides/prompt-engineering).

## Additional Notes:

- Adjust AI model parameters as needed for better performance and accuracy.
- Ensure proper error handling for robustness.
- Monitor server resources for optimal performance.

<font face="Arial" size="4">Custom font and size</font>



