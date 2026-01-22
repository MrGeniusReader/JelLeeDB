import { Router } from "express";
// FIX: Added ./ to indicate a local file
import {
  fetchData,
  fetchBookDetails,
  fetchReleases,
  fetchReleaseBookDetails,
  fetchSingleSeriesDetails,
} from "./controller.js";

const router = Router();

// Changed to .get to match standard fetching practices
router.get("/v0/latest", fetchData);
router.get("/v0/releases", fetchReleases);
router.get("/v0/book/:id", fetchBookDetails);
router.get("/v0/release/:id", fetchReleaseBookDetails);
router.get("/v0/series/:id", fetchSingleSeriesDetails);

export default router;
