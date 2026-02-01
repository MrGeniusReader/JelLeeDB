$(document).ready(function () {
  // UTC Time Format Helper
  function formatRelativeTime(timestamp) {
    // Convert seconds to milliseconds
    const past = new Date(timestamp * 1000);
    const now = new Date();
    const diffInSeconds = Math.floor((now - past) / 1000);

    // 1. Handle very recent updates
    if (diffInSeconds < 60) return "just now";

    // 2. Define our time unit thresholds
    const units = [
      { name: "year", seconds: 31536000 },
      { name: "month", seconds: 2592000 },
      { name: "week", seconds: 604800 },
      { name: "day", seconds: 86400 },
      { name: "hour", seconds: 3600 },
      { name: "minute", seconds: 60 },
    ];

    // 3. Special Case: Yesterday
    if (diffInSeconds >= 86400 && diffInSeconds < 172800) {
      return "yesterday";
    }

    // 4. Loop through units to find the match
    for (const unit of units) {
      const interval = Math.floor(diffInSeconds / unit.seconds);
      if (interval >= 1) {
        return interval === 1
          ? `1 ${unit.name} ago`
          : `${interval} ${unit.name}s ago`;
      }
    }
  }
  // Date formatting function
  function formatReleaseDate(dateStr) {
    // Convert to string in case it's a number (e.g., from API)
    dateStr = dateStr.toString();

    // Basic validation: must be exactly 8 characters (YYYYMMDD)
    if (!dateStr || dateStr.length !== 8) return "Invalid Date";

    // Extract parts
    const year = dateStr.substring(0, 4);
    const month = parseInt(dateStr.substring(4, 6)) - 1; // Month is 0-based in JS
    const day = dateStr.substring(6, 8);

    // Create Date object
    const date = new Date(year, month, day);

    // Check if the date is valid (e.g., not Feb 30)
    if (isNaN(date.getTime())) return "Invalid Date";

    // Format as "Jan 27, 2026" (short month, numeric day/year)
    return date.toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  }

  // Render 3 skeletons
  function showSkeletons() {
    // Hero section skeletons (unchanged, as it's only 3 items)
    $(".item-hero-wrapper").html(`
          <div class="item-hero skeleton" style="right: 270px; top: 50px; transform: rotate(-50deg); z-index: 1;"></div>
          <div class="item-hero skeleton" style="right: 150px; top: 10px; transform: rotate(-0deg); z-index: 3;"></div>
          <div class="item-hero skeleton" style="right: 20px; top: 50px; transform: rotate(50deg); z-index: 2;"></div>
      `);

    // Latest list skeletons: Generate 9 items using a loop
    let skeletonItems = "";
    const itemHTML =
      '<li class="latest-item skeleton" style="flex: 0 0 180px; height: 260px; border-radius: 8px;"></li>';
    for (let i = 0; i < 9; i++) {
      skeletonItems += itemHTML;
    }
    $(".latest-list").html(skeletonItems);
    $(".upcoming-list").html(skeletonItems);
    $(".popular-list").html(skeletonItems);
  }

  function getLatestEbooks(page, limit) {
    showSkeletons();

    $.ajax({
      url: "https://jelleedb.vercel.app/api/v0/latest",
      type: "GET",
      data: { page: page, limit: limit },
      dataType: "json",
      success: function (response) {
        const books = response.data;
        $(".item-hero-wrapper").empty();
        $(".latest-list").empty();

        // Loop for 3 items instead of 2
        for (let i = 0; i < 3; i++) {
          if (books[i]) {
            $(".item-hero-wrapper").append(`
                            <div class="item-hero" data-id="/book/${books[i].id}">
                                <img src="${books[i].book_details.image_url}" alt="${books[i].book_details.title}">
                            </div>
                        `);
          }
        }

        books.forEach((book) => {
          $(".latest-list").append(`
                            <li class="latest-item" data-id="/book/${book.id}">
                                <img src="${book.book_details.image_url}" alt="${book.book_details.title}" />
                                <div class="latest-item-info">
                                    <h3>${book.book_details.title}</h3>
                                    <p>${formatRelativeTime(book.updated_at)}</p>
                                </div>
                            </li>
                        `);
        });

        $(".latest-list").scrollLeft(0);
      },
    });
  }
  getLatestEbooks(1, 10);

  function getUpcomingReleases(
    page,
    limit,
    lang,
    type,
    sort,
    mindate,
    maxdate,
  ) {
    showSkeletons();

    $.ajax({
      url: "https://jelleedb.vercel.app/api/v0/releases",
      type: "GET",
      data: {
        page: page,
        limit: limit,
        lang: lang,
        type: type,
        sort: sort,
        minDate: mindate,
        maxDate: maxdate,
      },
      dataType: "json",
      success: function (response) {
        const books = response.data;
        $(".upcoming-list").empty();

        books.forEach((book) => {
          $(".upcoming-list").append(`
                            <li class="upcoming-item" data-id="/release/${book.id}">
                                <img src="${book.image_url}" alt="${book.title}" />
                                <div class="upcoming-item-info">
                                    <h2>${book.title}</h2>
                                    <p>${formatReleaseDate(book.release_date)}</p>
                                </div>
                            </li>
                        `);
        });

        $(".upcoming-list").scrollLeft(0);
      },
    });
  }
  getUpcomingReleases(1, 10, "en", "print", "Relevance desc", "", "");

  function fetchBookSeries(page, limit, lang, type, sort) {
    showSkeletons();

    $.ajax({
      url: "https://jelleedb.vercel.app/api/v0/series",
      type: "GET",
      data: {
        page: page,
        limit: limit,
        lang: lang,
        type: type,
        sort: sort,
      },
      dataType: "json",
      success: function (response) {
        const books = response.data;
        $(".popular-list").empty();

        books.forEach((book) => {
          $(".popular-list").append(`
                            <li class="popular-item" data-id="/series/${book.id}">
                                <img src="${book.image_url}" alt="${book.title}" />
                                <div class="popular-item-info">
                                    <h2>${book.title}</h2>
                                    <p>${book.volumes} Volumes</p>
                                </div>
                            </li>
                        `);
        });

        $(".popular-list").scrollLeft(0);
      },
    });
  }
  fetchBookSeries(1, 10, "en", "print", "Relevance desc", "", "");
});
