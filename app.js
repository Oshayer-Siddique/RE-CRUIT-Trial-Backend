// Importing required modules
const express = require("express");
const bodyParser = require("body-parser");
const csv = require("csv-parser");
const fs = require("fs");
const OpenAI = require("openai");
const { exec } = require("child_process");
const axios = require("axios");
const { GoogleGenerativeAI } = require("@google/generative-ai");
const { SpeechClient } = require("@google-cloud/speech");
const { AssemblyAI } = require("assemblyai");
const mongoose = require("mongoose");
const jwt = require("jsonwebtoken");
const cookieParser = require("cookie-parser");
const multer = require("multer");
const path = require("path");
const dotenv = require("dotenv");
const cors = require("cors");

const app = express();

app.use(cors());

dotenv.config();

app.use(
  cors({
    origin: "https://660eda1096df2726338f69a5--cozy-starship-a87900.netlify.app/",
  })
);

app.use(bodyParser.json());
app.use(express.json());
app.use(cookieParser());
app.use(express.urlencoded({ extended: true }));

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY_GPT4,
});

//Define a route
app.get("/", async (req, res) => {
  res.send("Hello Oshayer");
});

const storage = multer.diskStorage({
  destination: function (req, file, callback) {
    callback(null, __dirname + "/uploads");
  },
  // Sets file(s) to be saved in uploads folder in same directory
  filename: function (req, file, callback) {
    callback(null, file.originalname);
  },
  // Sets saved filename(s) to be original filename(s)
});

// Initialize multer with storage configuration

// // Set saved storage options:
const upload = multer({ storage: storage });
app.post("/transcribe", upload.single("audio"), async (req, res) => {
  // Sets multer to intercept files named "audio" on uploaded form data

  let audio = req.file;
  if (!audio) {
    return res.status(400).json({ message: "No audio file uploaded" });
  }

  if (!audio.mimetype.includes("audio")) {
    fs.unlink(audio.path, (err) => {
      if (err) {
        console.error(err);
      }
    });
    return res.status(400).json({ message: "File must be an audio file" });
  }

  try {
    const transcription = await openai.audio.transcriptions.create({
      file: fs.createReadStream(audio.path),
      model: "whisper-1",
      response_format: "verbose_json",
    });

    let reply = transcription.text;

    // Clean up: delete the uploaded file
    // fs.unlink(audio.path, (err) => {
    //   if (err) {
    //     console.error(err);
    //   }
    // });

    //console.log(reply);
    res.json({ message: "File uploaded successfully", description: reply });
  } catch (error) {
    console.error("Error processing transcription:", error);
    res.status(500).json({ message: "Error processing transcription" });
  }
});

app.post("/upload", upload.single("file"), async (req, res) => {
  // Middleware setup to handle single file uploads with the field name "audio"

  try {
    let audio = req.file; // Access the uploaded file details from the request object

    // Do something with the uploaded file, such as saving it to a database or processing it

    res.status(200).send({ message: "File Upload OK", file: audio }); // Send response indicating successful file upload along with file details
  } catch (error) {
    res
      .status(500)
      .send({ message: "Error uploading file", error: error.message }); // Send error response if an error occurs during file upload
  }
});

// const storage = multer.diskStorage({
//   destination: function (req, file, callback) {
//     callback(null, __dirname + '/uploads');
//   },
//   // Sets file(s) to be saved in uploads folder in same directory
//   filename: function (req, file, callback) {
//     callback(null, file.originalname);
//   }
//   // Sets saved filename(s) to be original filename(s)
// })

// // Set saved storage options:
// const upload = multer({ storage: storage })

// app.post("/transcribe", upload.array("files"), async (req, res) => {
//   // Check if files were uploaded
//   if (!req.files || req.files.length === 0) {
//     return res.status(400).json({ message: "No files uploaded" });
//   }

//   // Process the uploaded files
//   let audio = req.files[0];
//   if (!(audio.mimetype.includes('audio'))) {
//     fs.unlink(audio.path, (err) => {
//       if (err) {
//         console.error(err)
//       }
//     })
//     return res.status(400).json({ message: "File(s) must be an audio" });
//   }

//   // Proceed with transcription
//   try {
//     const transcription = await openai.audio.transcriptions.create({
//       file: fs.createReadStream(audio.path),
//       model: "whisper-1",
//       response_format: "verbose_json",
//     });

//     let reply = transcription.text;

//     // Clean up: delete the uploaded file
//     fs.unlink(audio.path, (err) => {
//       if (err) {
//         console.error(err)
//       }
//     });

//     console.log(reply);
//     res.json({ message: "File(s) uploaded successfully", description: reply });
//   } catch (error) {
//     console.error("Error processing transcription:", error);
//     res.status(500).json({ message: "Error processing transcription" });
//   }
// });

app.post("/summary", async (req, res) => {
  const { conversation, summaryFormat } = req.body;

  // Construct the prompt
  const prompt = `Summarize the conversation:\n\n${conversation} and highlight keypoints and decisions`;

  try {
    // Generate summary using GPT-4 model
    const response = await openai.chat.completions.create({
      model: "gpt-4-vision-preview",
      max_tokens: 200,
      temperature: 0.5, // randomness
      top_p: 1, // Adjust top_p as needed
      frequency_penalty: 0,
      presence_penalty: 0,

      messages: [
        {
          role: "user",
          content: [{ type: "text", text: prompt }],
        },
      ],
    });

    const summary = response.choices[0].message;
    let sentences = summary.content.split(". ");
    // Format the summary based on user preference
    switch (summaryFormat) {
      case "bulletPoints":
        sentences = sentences.map((sentence) => `• ${sentence}`).join("\n");
        break;
      case "paragraphs":
        // No formatting needed for paragraphs
        sentences = sentences.map((sentence) => sentence.slice(0)).join("\n");
        break;
      case "timeline":
        // Convert summary into a timeline format (example)
        sentences = sentences
          .map((sentence, index) => `${index + 1}. ${sentence}`)
          .join("\n");
        break;
      default:
        // Default to paragraphs if format is not recognized
        break;
    }
    //sentences = JSON.stringify(sentences);

    //console.log(sentences); // Get summary text from response
    res.json({ sentence: sentences });
  } catch (error) {
    //console.error("Error generating summary:", error);
    res.status(500).send("Error generating summary");
  }
});

const genAI = new GoogleGenerativeAI(process.env.geminiai_api_key);

// app.post('/conversation', async (req, res) => {

//   try {
//     // Retrieve the generative model
//     const model = genAI.getGenerativeModel({ model: "gemini-pro" });

//     // Prompt for the story generation
//     const prompt = "Write a story about a hero";

//     // Generate content asynchronously
//     const result = await model.generateContent(prompt);

//     // Handle potential errors during generation (optional)
//     if (result.error) {
//       console.error("Error generating content:", result.error);
//       return res.status(500).send("An error occurred while generating text 1.");
//     }

//     // Access the generated text from the response
//     const { response } = result; // Destructuring for cleaner assignment
//     console.log(response.candidates[0].content.parts)

//     // Send the generated text as response
//     res.send(response.candidates[0].content.parts[0]);
//   } catch (error) {
//     console.error("Error occurred:", error);
//     res.status(500).send("An error occurred while generating text. 2");
//   }
// });

// app.get("/conversation", (req, res) => {
//   exec("python conversation.py", (error, stdout, stderr) => {
//     if (error || stderr) {
//       console.error("Error:", error || stderr);
//       res.status(500).send("An error occurred during Python code execution.");
//       return;
//     }

//     // Split the stdout by lines
//     const lines = stdout.trim().split("\n");

//     // Define an array to store conversation data
//     const conversation = [];

//     // Regular expression to match speaker, message, and timestamp
//     const regex = /^(Speaker [A-Z]):\s*(.*):\s*([\d.]+)/;

//     // Loop through each line
//     lines.forEach((line) => {
//       // Match line with the regex
//       const match = line.match(regex);

//       // If match is found, extract speaker, message, and timestamp
//       if (match && match.length === 4) {
//         const speaker = match[1];
//         const message = match[2].trim();
//         const timestamp = parseFloat(match[3]);

//         // Add message to conversation array
//         conversation.push({ speaker, message, timestamp });
//       }
//     });

//     // Send conversation data as JSON response
//     console.log({ conversation });
//     res.json({ conversation });
//   });
// });

// app.get("/conversationfile", (req, res) => {
//   exec("python highlight.py", (error, stdout, stderr) => {
//     if (error || stderr) {
//       console.error("Error:", error || stderr);
//       res.status(500).send("An error occurred during Python code execution.");
//       return;
//     }

//     // Split the stdout by lines
//     const lines = stdout.trim().split("\n");

//     // Define an array to store conversation data
//     const conversation = [];

//     // Regular expression to match speaker, message, and timestamp
//     const regex = /^(Speaker [A-Z]):\s*(.*):\s*([\d.]+)/;

//     // Loop through each line
//     lines.forEach((line) => {
//       // Match line with the regex
//       const match = line.match(regex);

//       // If match is found, extract speaker, message, and timestamp
//       if (match && match.length === 4) {
//         const speaker = match[1];
//         const message = match[2].trim();
//         const timestamp = parseFloat(match[3]);

//         // Add message to conversation array
//         conversation.push({ speaker, message, timestamp });
//       }
//     });

//     // Send conversation data as JSON response
//     //console.log({conversation});
//     res.json({ conversation });
//   });
// });

app.post("/transcribefile", async (req, res) => {
  try {
    const audioFilePath = path.join(__dirname, "uploads", "uploaded_file.mp3");
    console.log("Audio file path:", audioFilePath);

    // Read the audio file
    const audioData = fs.createReadStream(audioFilePath);
    //console.log("Audio data:", audioData);

    // Transcribe the audio file using OpenAI
    const transcription = await openai.audio.transcriptions.create({
      file: audioData,
      model: "whisper-1",
      response_format: "verbose_json",
    });
    //console.log("Transcription:", transcription);

    let reply = transcription.text;

    res.json({ message: "Transcription completed", transcription: reply });
  } catch (error) {
    console.error("Error transcribing audio:", error);
    res.status(500).json({ message: "Error transcribing audio" });
  }
});







const FILE_URL1 =
  "./uploads/uploaded_file.mp3";

// You can also transcribe a local file by passing in a file path
// const FILE_URL = './path/to/file.mp3';

// Request parameters where speaker_labels has been enabled

app.get("/conversationfile", async (req, res) => {
  const client = new AssemblyAI({
    apiKey: process.env.assembleai_api_key,
  });

  const data = {
    audio_url: FILE_URL1,
    speaker_labels: true,
  };

  const transcript = await client.transcripts.create(data);
  //console.log(transcript.text);
  // for (let utterance of transcript.utterances) {
  //   console.log(`Speaker ${utterance.speaker}: ${utterance.text}`);
  // }

  const conversation = [];

  // Loop through each utterance in the transcript
  transcript.utterances.forEach((utterance) => {
    const speaker = `Speaker ${utterance.speaker}`;
    const message = utterance.text;
    const timestamp = utterance.start/1000;

    // Add message to conversation array
    conversation.push({ speaker, message, timestamp });
  });

  // Construct JSON response
  const jsonResponse = { conversation };

  // Send conversation data as JSON response
  res.json(jsonResponse);




});


const FILE_URL2 =
  "./uploads/recorded_audio.wav";

// You can also transcribe a local file by passing in a file path
// const FILE_URL = './path/to/file.mp3';

// Request parameters where speaker_labels has been enabled

app.get("/conversation", async (req, res) => {
  const client = new AssemblyAI({
    apiKey: process.env.assembleai_api_key,
  });

  const data = {
    audio_url: FILE_URL2,
    speaker_labels: true,
  };

  const transcript = await client.transcripts.create(data);
  //console.log(transcript.text);
  // for (let utterance of transcript.utterances) {
  //   console.log(`Speaker ${utterance.speaker}: ${utterance.text}`);
  // }

  const conversation = [];

  // Loop through each utterance in the transcript
  transcript.utterances.forEach((utterance) => {
    const speaker = `Speaker ${utterance.speaker}`;
    const message = utterance.text;
    const timestamp = utterance.start/1000;

    // Add message to conversation array
    conversation.push({ speaker, message, timestamp });
  });

  // Construct JSON response
  const jsonResponse = { conversation };

  // Send conversation data as JSON response
  res.json(jsonResponse);




});

// Start the server
app.listen(process.env.port, () => {
  console.log(`Server running at ${process.env.port}`);
});
