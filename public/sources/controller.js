import { promises as fs } from "fs";
import path from "path";
import { fileURLToPath } from "url";
import axios from "axios";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Helper function to create a delay
const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

export const fetchData = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;

    const dataPath = path.join(__dirname, "../data/data.json");
    const fileContent = await fs.readFile(dataPath, "utf-8");
    const localData = JSON.parse(fileContent);
    const allItems = localData.data;

    const startIndex = (page - 1) * limit;
    const endIndex = page * limit;
    const hasNextPage = endIndex < allItems.length;

    // ONLY fetch the items for the current page
    const paginatedItems = allItems.slice(startIndex, endIndex);

    const results = [];

    // Use for...of to process items SEQUENTIALLY
    for (const item of paginatedItems) {
      try {
        const apiUrl = `https://ranobedb.org/api/v0/book/${item.id}?rl=en&rf=print`;
        const apiRes = await axios.get(apiUrl);
        const book = apiRes.data.book;

        results.push({
          id: item.id,
          updated_at: item.updated_at,
          book_details: {
            title: book.title || "Unknown Title",
            image_url: book.image?.filename
              ? `https://images.ranobedb.org/${book.image.filename}`
              : null,
            rating: book.rating?.score ?? 0,
            description: book.description || "No description available.",
          },
        });
        await sleep(1000);
      } catch (apiError) {
        console.error(`ID ${item.id} fetch failed: ${apiError.message}`);
        results.push({ ...item, book_details: null });
      }
    }

    res.json({
      success: true,
      meta: {
        total_items: allItems.length,
        page,
        limit,
        hasNextPage,
      },
      data: results,
    });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

export const fetchBookDetails = async (req, res) => {
  try {
    const { id } = req.params;

    const dataPath = path.join(__dirname, "../data/data.json");
    const fileContent = await fs.readFile(dataPath, "utf8");
    const data = JSON.parse(fileContent);

    const localItem = data.data.find((item) => String(item.id) === String(id));

    // Initialize as null
    let updated_at = null;
    let cleanDownloadId = null;

    // If found locally, populate the variables
    if (localItem) {
      updated_at = localItem.updated_at;
      cleanDownloadId = localItem.download_url.replace(
        /https:\/\/drive\.google\.com\/uc\?export=download&id=|https:\/\/drive\.google\.com\/file\/d\/|\/view\?usp=drive_link/g,
        "",
      );
    }

    const apiUrl = `https://ranobedb.org/api/v0/book/${id}?rl=en&rf=print`;
    const apiRes = await axios.get(apiUrl);

    // Check if the API actually returned a book
    if (!apiRes.data || !apiRes.data.book) {
      return res
        .status(404)
        .json({ success: false, error: "Book not found on API" });
    }

    const book = apiRes.data.book;

    const rawTags = book.series?.tags || [];
    const genres = rawTags
      .filter((t) => t.ttype === "genre")
      .map((t) => t.name);
    const tags = rawTags.filter((t) => t.ttype === "tag").map((t) => t.name);

    const results = [];
    const series = [];

    for (const seriesItem of book.series.books) {
      series.push({
        id: seriesItem.id,
        title: seriesItem.title,
        image_url: seriesItem.image?.filename
          ? `https://images.ranobedb.org/${seriesItem.image.filename}`
          : null,
      });
    }

    results.push({
      id,
      series_id: book.series.id,
      updated_at: updated_at,
      download_id: cleanDownloadId,
      book_details: {
        titles: {
          title_orig: book.title_orig || "Unknown Title",
          title_eng: book.title || "Unknown Title",
        },
        image_url: book.image?.filename
          ? `https://images.ranobedb.org/${book.image.filename}`
          : null,
        rating: book.rating?.score ?? 0,
        description: book.description || "No description available.",
        editions: book.editions || [],
        publishers: book.publishers || [],
        tags: tags,
        genres: genres,
        series: series,
      },
    });

    res.json({
      success: true,
      data: results,
    });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};
export const fetchReleases = async (req, res) => {
  try {
    // 1. Get Query Parameters (using the keys your URL actually uses)
    const page = req.query.page || 1;
    const limit = req.query.limit || 10;
    const rl = req.query.lang || 'en';   // Mapping 'lang' from your URL to 'rl' for API
    const rf = req.query.type || 'print'; // Mapping 'type' from your URL to 'rf' for API
    const sort = req.query.sort || 'Relevance desc';

    // 2. Dynamic Date Logic
    const now = new Date();
    const today = now.toISOString().split('T')[0];
    
    const lastDayObj = new Date(now.getFullYear(), now.getMonth() + 1, 0);
    const lastDay = `${lastDayObj.getFullYear()}-${String(lastDayObj.getMonth() + 1).padStart(2, '0')}-${String(lastDayObj.getDate()).padStart(2, '0')}`;

    const minDate = req.query.minDate || today;
    const maxDate = req.query.maxDate || lastDay;

    // 3. Axios Request with 'params' object (Handles spaces in 'sort' automatically) https://ranobedb.org/api/v0/releases?page=1&limit=3&rl=en&rf=print&sort=Relevance+desc&minDate=2026-01-21&maxDate=2026-01-31
    console.log(`https://ranobedb.org/api/v0/releases?page=${page}&limit=${limit}&rl=${lang}&rf=${type}&sort=${sort}c&minDate=${minDate}&maxDate=${maxDate}`)
    const response = await axios.get("https://ranobedb.org/api/v0/releases", {
      params: {
        page,
        limit,
        rl,
        rf,
        sort,
        minDate,
        maxDate
      }
    });

    // 4. Extract data from Axios wrapper
    const apiData = response.data;

    if (!apiData || !apiData.releases) {
      return res.status(404).json({ success: false, error: "No data returned from API" });
    }

    // 5. Map the results based on the exact JSON you provided
    const releases = apiData.releases.map(item => ({
      id: item.id,
      title: item.title,
      release_date: formatDate(item.release_date), // Uses your formatDate helper
      isbn13: item.isbn13,
      website: item.website,
      image_url: item.image?.filename 
        ? `https://images.ranobedb.org/${item.image.filename}` 
        : null,
      external_links: {
        amazon: item.amazon,
        bookwalker: item.bookwalker,
        rakuten: item.rakuten
      }
    }));

    // 6. Send clean Response
    res.json({
      success: true,
      meta: {
        total_items: parseInt(apiData.count || 0), // "11" -> 11
        current_page: apiData.currentPage,
        total_pages: apiData.totalPages,
        date_range: { minDate, maxDate }
      },
      data: releases
    });

  } catch (error) {
    // This will now show you the real error in your terminal
    console.error("FetchReleases Error:", error.message);
    res.status(500).json({
      success: false,
      error: "Internal Server Error",
      message: error.message
    });
  }
};

