import { Router } from "express";
import {
  fetchData,
  fetchBookDetails,
  fetchReleases,
  fetchReleaseBookDetails,
  fetchSingleSeriesDetails,
  fetchBookSeries,
} from "./controller.js";

const router = Router();

router.get("/v0/latest", fetchData);
router.get("/v0/releases", fetchReleases);
router.get("/v0/series", fetchBookSeries);
router.get("/v0/book/:id", fetchBookDetails);
router.get("/v0/release/:id", fetchReleaseBookDetails);
router.get("/v0/series/:id", fetchSingleSeriesDetails);

export default router;
