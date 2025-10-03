import { fileURLToPath } from "url";
import path from "path";
import express from "express";
import cors from "cors";
import multer from "multer";
import { promises as fs } from "fs";
import fsSync from "fs";
import { v4 as uuidv4 } from "uuid";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 3000;

const DATA_DIR = path.join(__dirname, "data");
const MESSAGES_FILE = path.join(DATA_DIR, "messages.json");
const UPLOADS_DIR = path.join(__dirname, "uploads");

app.use(cors());

app.use(express.json());

app.use("/uploads", express.static(UPLOADS_DIR));

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    if (!fsSync.existsSync(UPLOADS_DIR))
      fsSync.mkdirSync(UPLOADS_DIR, { recursive: true });
    cb(null, UPLOADS_DIR);
  },

  filename: (req, file, cb) => {
    const ext = path.extname(file.originalname) || "";
    cb(null, `${uuidv4()}${ext}`);
  },
});

// Configuração do Multer para upload de arquivos
const upload = multer({
  storage,
  limits: { fileSize: 10 * 1024 * 1024 }, // Limite de 10MB por arquivo
  fileFilter: (req, file, cb) => {
    const allowed = /\.(jpg|jpeg|png|gif|mp3|wav)$/i;
    if (!allowed.test(file.originalname)) {
      return cb(
        new Error("Tipo de arquivo não permitido. Use jpg/png/mp3/wav.")
      );
    }
    cb(null, true);
  },
});

// Funções auxiliares
async function ensureDataFile() {
  await fs.mkdir(DATA_DIR, { recursive: true });
  try {
    await fs.access(MESSAGES_FILE);
  } catch (err) {
    await fs.writeFile(MESSAGES_FILE, "[]", "utf8");
  }
}

async function readMessages() {
  await ensureDataFile();
  const raw = await fs.readFile(MESSAGES_FILE, "utf8");
  try {
    return JSON.parse(raw || "[]");
  } catch (err) {
    return [];
  }
}

async function writeMessages(messages) {
  const tmp = MESSAGES_FILE + ".tmp";
  await fs.writeFile(tmp, JSON.stringify(messages, null, 2), "utf8");
  await fs.rename(tmp, MESSAGES_FILE);
}

// Função para ordenar mensagens por data (mais antigas primeiro)
function sortByTimestampAsc(a, b) {
  return new Date(a.timestamp) - new Date(b.timestamp);
}

app.get("/", (req, res) => {
  res.json({ ok: true, message: "Backend rodando" });
});

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
 * Resposta:
 * { url: "http://localhost:3000/uploads/arquivo.jpg" }
 */
app.post("/upload", upload.single("file"), (req, res) => {
  try {
    // Verifica se o arquivo foi enviado
    if (!req.file)
      return res.status(400).json({ error: "Arquivo não enviado" });

    // Monta a URL do arquivo salvo
    const url = `${req.protocol}://${req.get("host")}/uploads/${
      req.file.filename
    }`;
    res.status(201).json({ url });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Erro no upload" });
  }
});

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
  console.log(`Servidor ouvindo em http://localhost:${PORT}`);
});
