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

    $(".staff-panel-wrapper").html(`
        <div class='edition-section'>
            <ul>
                <li><div class="skeleton" style="width: 70px; height: 20px; border-radius: 5px;"></div></li>
                <li><div class="skeleton" style="width: 70px; height: 20px; border-radius: 5px;"></div></li>
                <li><div class="skeleton" style="width: 70px; height: 20px; border-radius: 5px;"></div></li>
            </ul>
        </div>
    `);

    $(".publishers-panel-wrapper").html(`
        <div class='lang-section'>
            <ul>
                <li><div class="skeleton" style="width: 70px; height: 20px; border-radius: 5px;"></div></li>
                <li><div class="skeleton" style="width: 70px; height: 20px; border-radius: 5px;"></div></li>
                <li><div class="skeleton" style="width: 70px; height: 20px; border-radius: 5px;"></div></li>
            </ul>
        </div>
    `);

    let skeletonItems = "";
    const itemHTML =
      '<li class="series-item skeleton" style="flex: 0 0 180px; height: 260px; border-radius: 8px;"></li>';
    for (let i = 0; i < 9; i++) {
      skeletonItems += itemHTML;
    }
    $("#series-list").html(skeletonItems);
  }

  showSkeletons();

  function fixDecimal(decimal) {
    return decimal.toFixed(1);
  }

  $.ajax({
    url: `http://192.168.10.108:5173/api/v0/book/${bookId}`,
    method: "GET",
    dataType: "json",
    success: function (response) {
      const data = response.data;

      $(".hero-panel-cover").empty();
      $(".titles-panel").empty();
      $(".start-score-panel").empty();
      $(".description-panel").empty();
      $("#title-list").empty();
      $("#genres-list").empty();
      $("#tags-list").empty();
      $(".staff-panel-wrapper").empty();
      $(".publishers-panel-wrapper").empty();
      $("#series-list").empty();

      $(".hero-panel-cover").append(`
        <img src="${data.book_details.image_url}" alt="${data.book_details.titles.title_eng}" />
      `);

      $(".titles-panel").append(`
        <h1>${data.book_details.titles.title_eng}</h1>
        <h5>${data.book_details.titles.title_orig}</h5>
      `);

      // Check if score exists (covers null, undefined, and 0)
      if (
        data.book_details.score !== null &&
        data.book_details.score !== undefined
      ) {
        $(".start-score-panel").append(`
              <p>
                  <span><i class="fa-solid fa-star"></i></span>
                  ${fixDecimal(data.book_details.score)} score out of 10
              </p>
          `);
      } else {
        $(".start-score-panel").append(`
              <p><span><i class="fa-solid fa-star"></i></span> N/A </p>
          `);
      }

      const rawDescription = data.book_details.description;
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
          <li><span>EN</span>${data.book_details.titles.title_eng}</li>
          <li><span>JP</span>${data.book_details.titles.title_orig}</li>
      `);

      for (const genre of data.book_details.genres) {
        const formattedGenre = genre.charAt(0).toUpperCase() + genre.slice(1);
        $("#genres-list").append(`
                <li><span>${formattedGenre}</span></li>
            `);
      }

      for (const tag of data.book_details.tags) {
        const formattedTag = tag.charAt(0).toUpperCase() + tag.slice(1);
        $("#tags-list").append(`
                <li><span>${formattedTag}</span></li>
            `);
      }

      const editions = data.book_details.editions;

      if (editions && editions.length > 0) {
        let htmlContent = "";

        editions.forEach((edition) => {
          // Start the section for each edition
          htmlContent += `<div class='edition-section'><h3>${edition.title}</h3><ul>`;

          // Loop through each staff member in this edition
          edition.staff.forEach((person) => {
            // Fallback to .name if .romaji is null
            const displayName = person.romaji || person.name;

            htmlContent += `
              <li>
                <h5>${displayName}</h5>
                <p>${person.role_type} ${person.note ? `(${person.note})` : ""}</p>
              </li>`;
          });

          htmlContent += `</ul></div>`;
        });

        $(".staff-panel-wrapper").append(htmlContent);
      }

      const publishers = data.book_details.publishers;

      if (publishers && publishers.length > 0) {
        // 1. Group publishers by language
        const grouped = publishers.reduce((acc, pub) => {
          const lang = pub.lang || "Other";
          if (!acc[lang]) acc[lang] = [];
          acc[lang].push(pub);
          return acc;
        }, {});

        let htmlContent = "";

        // 2. Loop through the groups (en, ja, etc.)
        for (const lang in grouped) {
          // Map language codes to readable titles
          const langTitle =
            lang === "ja"
              ? "Japanese"
              : lang === "en"
                ? "English"
                : lang.toUpperCase();

          htmlContent += `
            <div class='lang-section'>
              <h3>${langTitle} Publishers</h3>
              <ul>`;

          // 3. Loop through the publishers in that specific language
          grouped[lang].forEach((pub) => {
            const displayName = pub.romaji || pub.name;
            const typeLabel =
              pub.publisher_type === "imprint" ? " (Imprint)" : "";

            htmlContent += `
              <li>
                <h5>${displayName}</h5>
                <p>${pub.publisher_type.charAt(0).toUpperCase() + pub.publisher_type.slice(1)}</p>
              </li>`;
          });

          htmlContent += `</ul></div>`;
        }

        $(".publishers-panel-wrapper").append(htmlContent);
      }

      data.book_details.series.forEach((book) => {
        $("#series-list").append(`
                  <li class="series-item" data-id="/book/${book.id}">
                      <img src="${book.image_url}" alt="${book.title}" />
                      <div class="series-item-info">
                          <h2>${book.title}</h2>
                      </div>
                  </li>
              `);
      });

      $("#series-list").scrollLeft(0);

      // const downloadId = `https://drive.google.com/uc?export=download&id=${data.download_id}`;

      $("#read-btn").click(function () {
        const dlId = data.download_id;
        if (dlId) {
          window.location.href = `/reader/${dlId}`;
        }
      });
    },
    error: function (xhr, status, error) {
      console.error(error);
    },
  });
});
