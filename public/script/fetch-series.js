$(document).ready(function () {
  const pathSegments = window.location.pathname.split("/");
  const bookId = pathSegments[pathSegments.length - 1];

  function formatDate(dateNum) {
    if (!dateNum) return "";
    const dateStr = dateNum.toString();
    const year = dateStr.substring(0, 4);
    const month = dateStr.substring(4, 6);
    const day = dateStr.substring(6, 8);

    const monthNames = [
      "Jan",
      "Feb",
      "Mar",
      "Apr",
      "May",
      "Jun",
      "Jul",
      "Aug",
      "Sep",
      "Oct",
      "Nov",
      "Dec",
    ];
    return `${monthNames[parseInt(month) - 1]} ${parseInt(day)}, ${year}`;
  }

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

    $(".additional-panel-wrapper").html(`
        <div class='additional-section'>
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
    $("#relation-list").html(skeletonItems);
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
      $(".staff-panel-wrapper").empty();
      $(".publishers-panel-wrapper").empty();
      $("#series-list").empty();
      $(".additional-panel-wrapper").empty();
      $("#relation-list").empty();

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

      const details = data.data;
      let metaHtml = "";

      // 1. Status Section
      if (details.status) {
        metaHtml += `
          <div class='lang-section'>
            <h3>Status</h3>
            <ul>
              <li>
                <p>${details.status.charAt(0).toUpperCase() + details.status.slice(1)}</p>
              </li>
            </ul>
          </div>`;
      }

      // 2. Started At Section
      if (details.start_date) {
        metaHtml += `
          <div class='lang-section'>
            <h3>Started At</h3>
            <ul>
              <li>
                <p>${formatDate(details.start_date)}</p>
              </li>
            </ul>
          </div>`;
      }

      // 3. Ended At Section (Only if status is completed)
      if (details.status === "completed" && details.end_date) {
        metaHtml += `
          <div class='lang-section'>
            <h3>Ended At</h3>
            <ul>
              <li>
                <p>${formatDate(details.end_date)}</p>
              </li>
            </ul>
          </div>`;
      }

      $(".additional-panel-wrapper").append(metaHtml);

      const staffs = data.data.staff;

      if (staffs && staffs.length > 0) {
        const grouped = staffs.reduce((acc, person) => {
          // 1. Treat null as 'ja' (Japanese), otherwise use the lang value
          const langKey = person.lang === null ? "ja" : person.lang;

          // 2. ONLY allow 'ja' or 'en', skip everything else
          if (langKey === "ja" || langKey === "en") {
            if (!acc[langKey]) acc[langKey] = [];
            acc[langKey].push(person);
          }

          return acc;
        }, {});

        let htmlContent = "";

        // 3. Define the order explicitly so Japanese always shows first
        const displayOrder = ["ja", "en"];

        displayOrder.forEach((lang) => {
          if (!grouped[lang]) return; // Skip if no staff for this language

          const langTitle = lang === "ja" ? "Japanese" : "English";

          htmlContent += `
            <div class='lang-section'>
              <h3>${langTitle} Staff</h3>
              <ul>`;

          grouped[lang].forEach((person) => {
            const displayName = person.romaji || person.name;

            htmlContent += `
              <li>
                <h5>${displayName}</h5>
                <p>${person.role.charAt(0).toUpperCase() + person.role.slice(1)}</p>
              </li>`;
          });

          htmlContent += `</ul></div>`;
        });

        $(".staff-panel-wrapper").append(htmlContent);
      }

      const publishers = data.data.publishers;

      if (publishers && publishers.length > 0) {
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

      if (data.data.relations.length > 0) {
        data.data.relations.forEach((book) => {
          $("#relation-list").append(`
                    <li class="relation-item" data-id="/series/${book.id}">
                        <img src="${book.image_url}" alt="${book.title}" />
                        <div class="relation-item-info">
                            <h2>${book.title}</h2>
                            <p>${book.type}</p>
                        </div>
                    </li>
                `);
        });

        $("#relation-list").scrollLeft(0);
      } else {
        $(".relation-list-panel").hide();
      }

      data.data.books.forEach((book) => {
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
    },
    error: function (xhr, status, error) {
      console.error(error);
    },
  });
});
