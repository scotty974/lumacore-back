import express, { urlencoded } from "express";
import cors from "cors";
import dotenv from "dotenv";
import rateLimitMiddleware from "./rateLimit.js";
import OpenAI from "openai";
const app = express();
app.use(cors());
app.use(express.json());
dotenv.config();
app.use(urlencoded({ extended: true }));
app.use((req, res, next) => {
  res.header("Access-Control-Allow-Origin", process.env.ALLOWED_ORIGIN || "*");
  res.header("X-Content-Type-Options", "nosniff");

  if (req.headers["x-api-secret"] !== process.env.API_SECRET) {
    return res.status(403).json({ error: "Non autorisé" });
  }

  next();
});

app.post("/summarize", rateLimitMiddleware, async (req, res) => {
  try {
    const { text } = req.body;

    if (!text || text.length > 30000) {
      return res.status(400).json({ error: "Texte invalide" });
    }

    const openai = new OpenAI({
      apiKey: process.env.OPENAY_KEY,
    });

    const completion = await openai.chat.completions.create({
      model: "gpt-4o-mini-2024-07-18",
      messages: [
        {
          role: "user",
          content: `Analysez attentivement le texte suivant et résumez-le en des points clés en français. Assurez-vous que ces points :  
- Capturent fidèlement les idées principales du texte, sans omettre d'éléments essentiels.  
- Soient formulés de manière concise, claire et impactante.  
- Soient rédigés sous forme de puces, en mettant en avant les informations les plus pertinentes pour le lecteur.  

Texte : ${text}`,
        },
      ],
      max_tokens: 500,
    });

    res.json({ summary: completion.choices[0].message.content });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.listen(process.env.PORT, () => {
  console.log(`Server is running on port ${process.env.PORT}`);
});
