import express from "express";
import cors from "cors";
import fetch from "node-fetch";
import path from "path";
import { fileURLToPath } from "url";
import router from "./sources/router.js";

const app = express();
const PORT = process.env.PORT || 5173;
const HOST = process.env.HOST || "0.0.0.0";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

app.use(cors());
app.use(express.urlencoded({ extended: true }));
app.use(express.json());

app.get("/book/:id", (req, res) => {
  res.sendFile(path.join(__dirname, "..", "public", "pages", "book.html"));
});

app.get("/series/:id", (req, res) => {
  res.sendFile(path.join(__dirname, "..", "public", "pages", "series.html"));
});

app.get("/release/:id", (req, res) => {
  res.sendFile(path.join(__dirname, "..", "public", "pages", "release.html"));
});

app.get("/reader/:id", (req, res) => {
  res.sendFile(path.join(__dirname, "..", "public", "pages", "reader.html"));
});

app.use(express.static(path.join(__dirname, "public")));

// Use the router
app.use("/api", router);

app.get("/proxy", async (req, res) => {
  const targetUrl = req.query.url;
  if (!targetUrl) {
    return res.status(400).send("Missing url query parameter");
  }

  try {
    const response = await fetch(targetUrl, {
      headers: {
        "User-Agent":
          "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36",
      },
    });
    console.log(`Fetch status: ${response.status}, URL: ${targetUrl}`); // Add this for logging
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    const buffer = await response.buffer();
    res.set("Content-Type", response.headers.get("content-type"));
    res.send(buffer);
  } catch (error) {
    console.error(`Error fetching ${targetUrl}:`, error.message);
    res.status(500).send(`Error fetching resource: ${error.message}`);
  }
});

// app.listen(PORT, HOST, () => {
//   console.log(`Server is running at http://${HOST}:${PORT}`);
// });
export default app;
