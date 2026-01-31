$(document).ready(function () {
  const currentUrl = window.location.href;
  const segments = currentUrl.split("/reader/");
  const bookId = segments[1];

  // UI Elements
  const $loader = $("#book-loader");
  const $loaderText = $("#loader-text");
  const $chapterLoader = $("#chapter-loader");
  const $tocList = $("#toc-list");

  let isInitialLoad = true;

  // function slugify(text) {
  //   return text
  //     .toString()
  //     .toLowerCase()
  //     .trim()
  //     .replace(/\s+/g, "-")
  //     .replace(/[^\w\-]+/g, "")
  //     .replace(/\-\-+/g, "-");
  // }

  function loadBook() {
    if (!bookId) {
      $loaderText.text("No book ID found.");
      return;
    }

    $.ajax({
      url: `http://192.168.10.108:5173/api/v0/book/${bookId}`,
      method: "GET",
      dataType: "json",
      success: function (response) {
        const bookLink = response.data.download_id;
        if (bookLink) {
          // START THE READER HERE
          initializeReader(bookLink);
        } else {
          $loaderText.text("Download link not found.");
        }
      },
      error: function () {
        $loaderText.text("Error fetching book data.");
      },
    });
  }

  function initializeReader(link) {
    let currentPageIndex = 0;

    const book = ePub(link);

    // book.loaded.metadata.then(function (metadata) {
    //   const title = metadata.title;
    //   const slug = slugify(title);
    //   const newPath = window.location.pathname.replace(
    //     /\/reader\/[^/]+$/,
    //     "/reader/" + slug,
    //   );
    //   if (window.location.pathname !== newPath) {
    //     window.history.replaceState({}, title, newPath);
    //   }
    //   document.title = title + " - JelLeeDB Reader";
    // });

    let rendition = book.renderTo("viewer", {
      width: "100%",
      height: "100vh",
      flow: "paginated",
      manager: "default",
      allowScriptedContent: true,
      sandbox: "allow-same-origin allow-scripts",
    });
    rendition.themes.register("default", "/themes/themes.css");

    rendition.themes.default({
      body: {
        padding: "20px",
        color: "#e1dee6",
        "font-size": "1.4rem",
      },
      "h1, h2, h3, h4, h5, h6": {
        color: "#e1dee6 !important",
        "font-size": "2rem",
        "text-decoration": "none",
      },
      p: {
        margin: "10px",
        color: "#e1dee6",
        "font-size": "1.2rem",
      },
      a: {
        color: "#0464d1",
        "font-size": "1.2rem",
      },

      "h1 a, h2 a, h3 a, h4 a, h5 a, h6 a": {
        color: "#e1dee6",
        "font-size": "1.4rem",
        "text-decoration": "none",
      },
    });

    rendition.themes.select("default");
    rendition.themes.fontSize("140%");

    rendition.display(currentPageIndex);

    const $tocList = $("#toc-list");
    let items = [];

    //  Paste all TOC List
    book.loaded.navigation.then(function (toc) {
      toc.forEach(function (chapter) {
        // 1. Get the filename from the TOC (e.g., "chapter1.xhtml")
        const fileName = chapter.href.split("/").pop().split("#")[0];

        // 2. Find the ACTUAL item in the spine that contains this filename
        const actualSpineItem = book.spine.spineItems.find((item) =>
          item.href.includes(fileName),
        );

        // 3. Use the exact HREF the spine uses (e.g., "Text/chapter1.xhtml")
        const finalHref = actualSpineItem ? actualSpineItem.href : chapter.href;

        const item = `
                <li class="toc-item" data-href="${finalHref}">${chapter.label}</li>
            `;
        items.push(item);
      });

      $tocList.append(items.join(""));
      $tocList.find("li").first().addClass("selected");
    });

    rendition.on("relocating", function () {
      $loaderText.text("Changing Chapter...");
      $loader.removeClass("hidden");
      if (!isInitialLoad) {
        $chapterLoader.removeClass("hidden").css("opacity", "1");
      }
    });

    rendition.on("rendered", function (section) {
      const currentHref = section.href;

      const $activeItem = $tocList.find("li").filter(function () {
        let itemHref = $(this).attr("data-href");
        return currentHref.endsWith(itemHref) || itemHref === currentHref;
      });

      if ($activeItem.length > 0) {
        $tocList.find("li").removeClass("selected"); // Clear old selection
        $activeItem.addClass("selected"); // Set new selection

        // Optional: Smooth scroll the sidebar to the new active chapter
        $activeItem[0].scrollIntoView({ behavior: "smooth", block: "nearest" });
      }

      $loader.addClass("hidden");
      if (isInitialLoad) {
        isInitialLoad = false;
      }

      setTimeout(() => {
        $chapterLoader.css("opacity", "0");
        setTimeout(() => {
          $chapterLoader.addClass("hidden");
        }, 200);
      }, 100);
    });

    rendition.on("relocated", function () {
      $chapterLoader.addClass("hidden");
    });

    book.opened.then(function () {
      $loaderText.text("Preparing Content...");
    });

    book.ready.catch(function (err) {
      $loaderText.text("Error loading book.");
      $fullLoader.addClass("hidden");
      $chapterLoader.addClass("hidden");
    });

    $tocList.on("click", "li", function (event) {
      event.preventDefault();
      $tocList.find("li").removeClass("selected");
      $(this).addClass("selected");
      const cleanHref = $(this).attr("data-href");
      rendition.display(cleanHref);
    });

    // Define the navigation function
    const handleNavigation = (e) => {
      const key = e.which || e.keyCode;

      if (key === 37 || key === 39) {
        // Only show chapter loader if the main initial loader is already gone
        if (!isInitialLoad) {
          e.preventDefault();
          $chapterLoader.removeClass("hidden").css("opacity", "1");
        }

        if (key === 39) rendition.next();
        if (key === 37) rendition.prev();
      }
    };

    $(document).on("keydown", handleNavigation);
    rendition.on("keydown", handleNavigation);
  }

  loadBook();
});

// $(document).ready(function () {

//   // 1. Helper for URL cleanup

//   // 2. Fetch the data from your API
//   function loadBook() {
//     if (!bookId) {
//       $loaderText.text("No book ID found.");
//       return;
//     }

//     $.ajax({
//       url: `http://192.168.10.108:5173/api/v0/book/${bookId}`,
//       method: "GET",
//       dataType: "json",
//       success: function (response) {
//         const bookLink = response.data.download_id;
//         if (bookLink) {
//           // START THE READER HERE
//           initializeReader(bookLink);
//         } else {
//           $loaderText.text("Download link not found.");
//         }
//       },
//       error: function () {
//         $loaderText.text("Error fetching book data.");
//       },
//     });
//   }

//   // 3. This function contains all your ePub.js logic
//   function initializeReader(link) {
//     const book = ePub(link);

//     // Metadata / Slug Logic
//     book.loaded.metadata.then(function (metadata) {
//       const title = metadata.title;
//       const slug = slugify(title);
//       const newPath = window.location.pathname.replace(
//         /\/reader\/[^/]+$/,
//         "/reader/" + slug,
//       );
//       if (window.location.pathname !== newPath) {
//         window.history.replaceState({}, title, newPath);
//       }
//       document.title = title + " - JelLeeDB Reader";
//     });

//     // Rendition Setup
//     let rendition = book.renderTo("viewer", {
//       width: "100%",
//       height: "100vh",
//       flow: "paginated",
//       manager: "default",
//       allowScriptedContent: true,
//       sandbox: "allow-same-origin allow-scripts",
//     });

//     rendition.themes.register("default", "/themes/themes.css");
//     rendition.themes.default({
//       body: {
//         padding: "20px",
//         color: "#e1dee6",
//         "font-size": "1.4rem",
//       },
//       "h1, h2, h3, h4, h5, h6": {
//         color: "#e1dee6 !important",
//         "font-size": "2rem",
//         "text-decoration": "none",
//       },
//       p: {
//         margin: "10px",
//         color: "#e1dee6",
//         "font-size": "1.2rem",
//       },
//       a: {
//         color: "#0464d1",
//         "font-size": "1.2rem",
//       },
//       "h1 a, h2 a, h3 a, h4 a, h5 a, h6 a": {
//         color: "#e1dee6",
//         "font-size": "1.4rem",
//         "text-decoration": "none",
//       },
//     });
//     rendition.themes.select("default");
//     rendition.themes.fontSize("140%");

//     rendition.display(0);

//     // TOC Generation
//     book.loaded.navigation.then(function (toc) {
//       let items = [];
//       toc.forEach(function (chapter) {
//         const fileName = chapter.href.split("/").pop().split("#")[0];
//         const actualSpineItem = book.spine.spineItems.find((item) =>
//           item.href.includes(fileName),
//         );
//         const finalHref = actualSpineItem ? actualSpineItem.href : chapter.href;
//         items.push(
//           `<li class="toc-item" data-href="${finalHref}">${chapter.label}</li>`,
//         );
//       });
//       $tocList.append(items.join(""));
//       $tocList.find("li").first().addClass("selected");
//     });

//     // Event Listeners
//     rendition.on("relocating", () => {
//       $loaderText.text("Changing Chapter...");
//       $loader.removeClass("hidden");
//       if (!isInitialLoad)
//         $chapterLoader.removeClass("hidden").css("opacity", "1");
//     });

//     rendition.on("rendered", (section) => {
//       const currentHref = section.href;
//       const $activeItem = $tocList.find("li").filter(function () {
//         let itemHref = $(this).attr("data-href");
//         return currentHref.endsWith(itemHref) || itemHref === currentHref;
//       });

//       if ($activeItem.length > 0) {
//         $tocList.find("li").removeClass("selected");
//         $activeItem.addClass("selected");
//         $activeItem[0].scrollIntoView({ behavior: "smooth", block: "nearest" });
//       }

//       $loader.addClass("hidden");
//       isInitialLoad = false;
//       setTimeout(() => {
//         $chapterLoader.css("opacity", "0");
//         setTimeout(() => $chapterLoader.addClass("hidden"), 200);
//       }, 100);
//     });

//     // Keyboard Navigation
//     const handleNavigation = (e) => {
//       const key = e.which || e.keyCode;
//       if (key === 37 || key === 39) {
//         if (!isInitialLoad) {
//           e.preventDefault();
//           $chapterLoader.removeClass("hidden").css("opacity", "1");
//         }
//         if (key === 39) rendition.next();
//         if (key === 37) rendition.prev();
//       }
//     };

//     $(document).on("keydown", handleNavigation);
//     rendition.on("keydown", handleNavigation);

//     // Sidebar clicks
//     $tocList.on("click", "li", function (e) {
//       e.preventDefault();
//       const cleanHref = $(this).attr("data-href");
//       rendition.display(cleanHref);
//     });
//   }

//   // --- START THE ENGINE ---
//   loadBook();
// });
