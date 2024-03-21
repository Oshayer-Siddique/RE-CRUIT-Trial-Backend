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

app.use(bodyParser.json());
app.use(express.json());
app.use(cookieParser());
app.use(express.urlencoded({ extended: true }));

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY_GPT4,
});

// Define a route
app.get("/", (req, res) => {
  res.send("Hello Mehnaz Oshayer!");
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

// Set saved storage options:
const upload = multer({ storage: storage });

app.post("/transcribe", upload.array("files"), async (req, res) => {
  // Sets multer to intercept files named "files" on uploaded form data

  let audio = req.files[0];
  if (!audio.mimetype.includes("audio")) {
    fs.unlink(audio.path, (err) => {
      if (err) {
        console.error(err);
      }
    });
    res.json({ message: "File(s) must be an audio" });
  } else {
    const transcription = await openai.audio.transcriptions.create({
      file: fs.createReadStream(audio.path),
      model: "whisper-1",
      response_format: "verbose_json",
    });

    let reply = transcription.text;

    // fs.unlink(audio.path, (err) => {
    //   if (err) {
    //     console.error(err)
    //   }
    // })
    console.log(reply);
    res.json({ message: "File(s) uploaded successfully", description: reply });
  }
});

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

    console.log(sentences); // Get summary text from response
    res.json({ sentence: sentences });
  } catch (error) {
    console.error("Error generating summary:", error);
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



app.get("/conversation", (req, res) => {
  exec("python conversation.py", (error, stdout, stderr) => {
    if (error) {
      console.error("Error:", error.message);
      res.status(500).send("An error occurred during Python code execution.");
      return;
    }

    if (stderr) {
      console.error("Error:", stderr);
      res.status(500).send("An error occurred during Python code execution.");
      return;
    }

    //console.log('Python code output:', stdout);
    console.log({conversation : stdout.replace(/\n/g)});
    res.json({conversation : stdout.replace(/\n/g)});
  });
  
});



// Start the server
app.listen(process.env.port, () => {
  console.log(`server listening on port ${process.env.port}`);
});
