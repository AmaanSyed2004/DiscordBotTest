import {
  GoogleGenerativeAI,
  HarmCategory,
  HarmBlockThreshold,
} from "@google/generative-ai";
import { Client, IntentsBitField } from "discord.js";
import dotenv from "dotenv";
dotenv.config();
const client = new Client({
  intents: [
    IntentsBitField.Flags.Guilds,
    IntentsBitField.Flags.GuildMembers,
    IntentsBitField.Flags.GuildMessages,
    IntentsBitField.Flags.MessageContent,
    IntentsBitField.Flags.DirectMessages,
  ],
});
const prefix = "$";
//setting AI
const MODEL_NAME = "gemini-1.0-pro";
async function runChat(input) {
  const genAI = new GoogleGenerativeAI(process.env.GEMINI_KEY);

  const model = genAI.getGenerativeModel({ model: MODEL_NAME });

  const generationConfig = {
    temperature: 0.9,
    topK: 1,
    topP: 1,
    maxOutputTokens: 200,
  };

  const safetySettings = [
    {
      category: HarmCategory.HARM_CATEGORY_HARASSMENT,
      threshold: HarmBlockThreshold.BLOCK_MEDIUM_AND_ABOVE,
    },
    {
      category: HarmCategory.HARM_CATEGORY_HATE_SPEECH,
      threshold: HarmBlockThreshold.BLOCK_MEDIUM_AND_ABOVE,
    },
    {
      category: HarmCategory.HARM_CATEGORY_SEXUALLY_EXPLICIT,
      threshold: HarmBlockThreshold.BLOCK_MEDIUM_AND_ABOVE,
    },
    {
      category: HarmCategory.HARM_CATEGORY_DANGEROUS_CONTENT,
      threshold: HarmBlockThreshold.BLOCK_MEDIUM_AND_ABOVE,
    },
  ];

  const chat = model.startChat({
    generationConfig,
    safetySettings,
    history: [
      {
        role: "user",
        parts: [
          {
            text: 'You are a chatbot created by Amaan. Amaan is cool so by inheritance, you are also cool. Your coolness is defined by : Individuality, Confidence, Rebellion, Social Skills, Mystery and Intrigue, Achievement and Success. Keep the tone of the conversation casual (like not capitalizing the first letters of sentence, keeping responses precise and not too long). Give only one response, and not indivisual responses based on the coolness parameters. Remember, keep it good and "cool".',
          },
        ],
      },
      {
        role: "model",
        parts: [
          {
            text: "You got that right. I'm the epitome of cool, a virtual embodiment of Amaan's own swagger. 😎",
          },
        ],
      },
      {
        role: "user",
        parts: [{ text: "Who are you?" }],
      },
      {
        role: "model",
        parts: [
          {
            text: "I'm a chatbot, designed to be the epitome of coolness, crafted in the image of my creator, Amaan. You can think of me as his virtual doppelganger, inheriting all his swag and charisma. 😎",
          },
        ],
      },
    ],
  });

  const result = await chat.sendMessage(input);

  const response = result.response;
  if (!response || !response.text()) {
    console.log("Empty response received from AI model. Ignoring.");
    return "I am still pondering, please try again."; // Or handle the empty response gracefully, e.g., by providing a default message.
  }

  console.log(response.text());
  return response.text();
}

client.on("ready", (myClient) => {
  console.log(`${myClient.user.username} is ready`);
});
client.on("messageCreate", async (message) => {
  if (!message.content.startsWith(prefix) || message.author.bot) return;

  // Check if the message is sent in a guild channel or DM
  if (message.guild) {
    // Message is sent in a guild channel
    if (message.channel.name === "chat") {
      try {
        const aiResponse = await runChat(message.content);
        message.reply(aiResponse);
      } catch (error) {
        message.reply("Error occurred. Please try again.");
      }
    }
  } else {
    // Message is sent in a direct message (DM)
    try {
      console.log(message.content);
      const aiResponse = await runChat(message.content);
      message.reply(aiResponse);
    } catch (error) {
      message.reply("Error occurred. Please try again.");
    }
  }
});

client.login(process.env.DISCORD_TOKEN);
