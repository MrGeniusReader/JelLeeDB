import { Router } from "express";
// FIX: Added ./ to indicate a local file
import { fetchData, fetchBookDetails, fetchReleases } from "./controller.js";

const router = Router();

// Changed to .get to match standard fetching practices
router.get("/novel/latest", fetchData);
router.get("/novel/:id", fetchBookDetails);
router.get("/novel/releases", fetchReleases);

export default router;
