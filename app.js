import express from "express";
import path from "path";
import { fileURLToPath } from "url";
import router from "./public/sources/router.js";

const app = express();
const PORT = process.env.PORT || 5173;

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

app.use(express.urlencoded({ extended: true }));
app.use(express.json());

// Serve static files from the public folder
app.use(express.static(path.join(__dirname, "public")));

// Use the router
app.use("/api", router);

app.listen(PORT, () => {
  console.log(`Server is running at http://localhost:${PORT}`);
});
