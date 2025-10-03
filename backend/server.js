// server.js
import express from "express";
import cors from "cors";
import multer from "multer";
import path from "path";
import { promises as fs } from "fs";
import fsSync from "fs";
import { v4 as uuidv4 } from "uuid";

const app = express();
const PORT = process.env.PORT || 3000;

const DATA_DIR = path.join(__dirname, "data");
const MESSAGES_FILE = path.join(DATA_DIR, "messages.json");
const UPLOADS_DIR = path.join(__dirname, "uploads");

// middleware
app.use(cors());
app.use(express.json()); // body parser for JSON

// serve uploaded files statically at /uploads
app.use("/uploads", express.static(UPLOADS_DIR));

// --- multer setup for file uploads ---
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    // ensure folder exists
    if (!fsSync.existsSync(UPLOADS_DIR))
      fsSync.mkdirSync(UPLOADS_DIR, { recursive: true });
    cb(null, UPLOADS_DIR);
  },
  filename: (req, file, cb) => {
    const ext = path.extname(file.originalname) || "";
    cb(null, `${uuidv4()}${ext}`);
  },
});

const upload = multer({
  storage,
  limits: { fileSize: 10 * 1024 * 1024 }, // 10MB
  fileFilter: (req, file, cb) => {
    // allow images and audio (png,jpg,jpeg,gif,mp3,wav)
    const allowed = /\.(jpg|jpeg|png|gif|mp3|wav)$/i;
    if (!allowed.test(file.originalname)) {
      return cb(new Error("File type not allowed. Use jpg/png/mp3/wav."));
    }
    cb(null, true);
  },
});

// --- helper functions to read/write messages safely ---
async function ensureDataFile() {
  await fs.mkdir(DATA_DIR, { recursive: true });
  try {
    await fs.access(MESSAGES_FILE);
  } catch (err) {
    // create file with empty array
    await fs.writeFile(MESSAGES_FILE, "[]", "utf8");
  }
}

async function readMessages() {
  await ensureDataFile();
  const raw = await fs.readFile(MESSAGES_FILE, "utf8");
  try {
    return JSON.parse(raw || "[]");
  } catch (err) {
    // if corrupt, reset
    return [];
  }
}

async function writeMessages(messages) {
  // atomic write: write temp and rename
  const tmp = MESSAGES_FILE + ".tmp";
  await fs.writeFile(tmp, JSON.stringify(messages, null, 2), "utf8");
  await fs.rename(tmp, MESSAGES_FILE);
}

function sortByTimestampAsc(a, b) {
  return new Date(a.timestamp) - new Date(b.timestamp);
}

// Routes
app.get("/", (req, res) => {
  res.json({ ok: true, message: "Backend running" });
});

/**
 * GET /messages
 * Retorna todas as mensagens ordenadas por timestamp (ascendente - mais antigas primeiro)
 */
app.get("/messages", async (req, res) => {
  try {
    const messages = await readMessages();
    messages.sort(sortByTimestampAsc);
    res.json(messages);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Erro ao ler mensagens" });
  }
});

/**
 * POST /messages
 * Recebe JSON e salva mensagem
 * Payload esperado:
 * {
 *   id: optional,
 *   content: string (texto ou URL do arquivo),
 *   sender: string,
 *   type: "text" | "image" | "audio",
 *   timestamp: optional ISO string
 * }
 */
app.post("/messages", async (req, res) => {
  try {
    const { id, content, sender, type, timestamp } = req.body;

    if (!content || !sender || !type) {
      return res
        .status(400)
        .json({ error: "Campos obrigatórios: content, sender, type" });
    }
    if (!["text", "image", "audio"].includes(type)) {
      return res
        .status(400)
        .json({ error: "Type inválido. Use text | image | audio" });
    }

    const newMessage = {
      id: id || uuidv4(),
      content,
      sender,
      type,
      timestamp: timestamp || new Date().toISOString(),
    };

    const messages = await readMessages();
    messages.push(newMessage);
    messages.sort(sortByTimestampAsc);
    await writeMessages(messages);

    res.status(201).json(newMessage);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Erro ao salvar mensagem" });
  }
});

/**
 * POST /upload
 * Recebe arquivo (multipart/form-data, campo 'file') e responde com URL
 * Response:
 * { url: "http://localhost:3000/uploads/arquivo.jpg" }
 */
app.post("/upload", upload.single("file"), (req, res) => {
  try {
    if (!req.file)
      return res.status(400).json({ error: "Arquivo não enviado" });

    const url = `${req.protocol}://${req.get("host")}/uploads/${
      req.file.filename
    }`;
    res.status(201).json({ url });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Erro no upload" });
  }
});

// error handler for multer/filefilter
app.use((err, req, res, next) => {
  if (err instanceof multer.MulterError) {
    return res.status(400).json({ error: err.message });
  }
  if (err) {
    return res.status(400).json({ error: err.message });
  }
  next();
});

app.listen(PORT, () => {
  console.log(`Server listening on http://localhost:${PORT}`);
});
