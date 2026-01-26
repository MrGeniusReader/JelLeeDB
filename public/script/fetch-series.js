$(document).ready(function () {
  const pathSegments = window.location.pathname.split("/");
  const bookId = pathSegments[pathSegments.length - 1];

  function showSkeletons() {
    // Hero section skeletons (unchanged, as it's only 3 items)
    $(".hero-panel-cover").html(`
        <div class="skeleton" style="width: 100%; height: 100%;"></div>
    `);

    $(".titles-panel").html(`
        <div class="skeleton" style="width: 400px; height: 30px; border-radius: 5px; margin-bottom: 8px;"></div>
        <div class="skeleton" style="width: 200px; height: 20px; border-radius: 5px;"></div>
    `);

    $(".start-score-panel").html(`
        <div class="skeleton" style="width: 80px; height: 20px; border-radius: 5px; margin-bottom: 8px;"></div>
    `);

    $(".description-panel").html(`
        <div class="skeleton" style="width: 100%; height: 200px; border-radius: 5px;"></div>
    `);

    $("#title-list").html(`
        <li><div class="skeleton" style="width: 200px; height: 20px; border-radius: 5px;"></div></li>
        <li><div class="skeleton" style="width: 200px; height: 20px; border-radius: 5px;"></div></li>
        <li><div class="skeleton" style="width: 200px; height: 20px; border-radius: 5px;"></div></li>
    `);

    $("#genres-list").html(`
        <li><div class="skeleton" style="width: 70px; height: 20px; border-radius: 5px;"></div></li>
        <li><div class="skeleton" style="width: 70px; height: 20px; border-radius: 5px;"></div></li>
        <li><div class="skeleton" style="width: 70px; height: 20px; border-radius: 5px;"></div></li>
    `);

    $("#tags-list").html(`
        <li><div class="skeleton" style="width: 70px; height: 20px; border-radius: 5px;"></div></li>
        <li><div class="skeleton" style="width: 70px; height: 20px; border-radius: 5px;"></div></li>
        <li><div class="skeleton" style="width: 70px; height: 20px; border-radius: 5px;"></div></li>
    `);
  }

  showSkeletons();

  function fixDecimal(decimal) {
    return decimal.toFixed(1);
  }

  $.ajax({
    url: `http://192.168.10.108:5173/api/v0/series/${bookId}`,
    method: "GET",
    dataType: "json",
    success: function (data) {
      console.log(data);
      $(".hero-panel-cover").empty();
      $(".titles-panel").empty();
      $(".start-score-panel").empty();
      $(".description-panel").empty();
      $("#title-list").empty();
      $("#genres-list").empty();
      $("#tags-list").empty();

      $(".hero-panel-cover").append(`
        <img src="${data.data.books[0].image_url}" alt="${data.data.books[0].title}" />
      `);

      $(".titles-panel").append(`
        <h1>${data.data.titles.english}</h1>
        <h5>${data.data.titles.native}</h5>
      `);

      // Check if score exists (covers null, undefined, and 0)
      if (data.data.score !== null && data.data.score !== undefined) {
        $(".start-score-panel").append(`
              <p>
                  <span><i class="fa-solid fa-star"></i></span>
                  ${fixDecimal(data.data.score)} score out of 10
              </p>
          `);
      } else {
        $(".start-score-panel").append(`
              <p><span><i class="fa-solid fa-star"></i></span> N/A </p>
          `);
      }

      const rawDescription = data.data.book_description.eng;
      const sourceRegex = /\[From\s+\[([^\]]+)\]\(([^)]+)\)\]/;

      const match = rawDescription.match(sourceRegex);

      let cleanDescription = rawDescription;
      let sourceHTML = "";

      if (match) {
        const sourceName = match[1];
        const sourceUrl = match[2];
        cleanDescription = rawDescription.replace(sourceRegex, "").trim();
        sourceHTML = `
              <p class="source-link">
                  Source: <a href="${sourceUrl}" target="_blank">${sourceName}</a>
              </p>`;
      }

      $(".description-panel").append(`
          <h3>Description</h3>
          <p>${cleanDescription.replace(/\n/g, "<br>")}</p><br/>
          ${sourceHTML}
      `);

      $("#title-list").append(`
          <li><span>EN</span>${data.data.titles.english}</li>
          <li><span>JP</span>${data.data.titles.romaji}</li>
          <li><span>NA</span>${data.data.titles.native}</li>
      `);

      for (const genre of data.data.genres) {
        const formattedGenre = genre.charAt(0).toUpperCase() + genre.slice(1);
        $("#genres-list").append(`
                <li><span>${formattedGenre}</span></li>
            `);
      }

      for (const tag of data.data.tags) {
        const formattedTag = tag.charAt(0).toUpperCase() + tag.slice(1);
        $("#tags-list").append(`
                <li><span>${formattedTag}</span></li>
            `);
      }
    },
    error: function (xhr, status, error) {
      console.error(error);
    },
  });
});
