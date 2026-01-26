import express from "express";
import path from "path";
import { fileURLToPath } from "url";
import router from "./public/sources/router.js";

const app = express();
const PORT = process.env.PORT || 5173;
const HOST = process.env.HOST || "0.0.0.0";

const __filename = fileURLToPath(
    import.meta.url);
const __dirname = path.dirname(__filename);

app.use(express.urlencoded({ extended: true }));
app.use(express.json());

app.get("/book/:id", (req, res) => {
    res.sendFile(path.join(__dirname, "public", "pages", "book.html"));
});

app.get("/series/:id", (req, res) => {
    res.sendFile(path.join(__dirname, "public", "pages", "series.html"));
});

app.get("/reader/book/:id", (req, res) => {
    res.sendFile(path.join(__dirname, "public", "pages", "reader.html"));
});

app.use(express.static(path.join(__dirname, "public")));

// Use the router
app.use("/api", router);

app.listen(PORT, HOST, () => {
    console.log(`Server is running at http://${HOST}:${PORT}`);
});