$(document).ready(function () {
  const currentUrl = window.location.href;
  const segments = currentUrl.split("/reader/");
  const bookId = segments[1];
  let book = null;

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
          trackDownload(bookLink);
        } else {
          $loaderText.text("Download link not found.");
        }
      },
      error: function () {
        $loaderText.text("Error fetching book data.");
      },
    });
  }

  async function trackDownload(url) {
    try {
      const response = await fetch(url);
      const reader = response.body.getReader();
      const contentLength = +response.headers.get("Content-Length");

      let receivedLength = 0;
      let chunks = [];

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        chunks.push(value);
        receivedLength += value.length;

        if (contentLength) {
          let percent = Math.round((receivedLength / contentLength) * 100);
          $loaderText.text(`Downloading: ${percent}%`);
        }
      }

      $loaderText.text("Processing Archive...");

      // 1. Combine chunks into a single Uint8Array
      let allChunks = new Uint8Array(receivedLength);
      let position = 0;
      for (let chunk of chunks) {
        allChunks.set(chunk, position);
        position += chunk.length;
      }

      // 2. Pass the underlying ArrayBuffer to ePub.js
      initializeReader(allChunks.buffer);
    } catch (err) {
      console.error("Download failed:", err);
      $loaderText.text("Download failed.");
    }
  }

  function initializeReader(data) {
    let currentPageIndex = 0;

    book = ePub(data);

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
    //
    book.opened
      .then(function () {
        console.log("Book is opened and parsed!", book);
        $loaderText.text("Preparing Content...");

        const isMobile = window.innerWidth < 768;

        const settings = {
          width: "100%",
          height: "100vh",
          flow: isMobile ? "scrolled" : "paginated",
          manager: isMobile ? "continuous" : "default",
          allowScriptedContent: true,
          sandbox: "allow-same-origin allow-scripts",
        };
        let rendition = book.renderTo("viewer", settings);

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
          "@media (min-width: 768px)": {
            body: {
              padding: "10px",
              "font-size": "1rem",
            },
            "h1, h2, h3, h4, h5, h6": {
              "font-size": "1.4rem",
            },
            p: {
              "font-size": "0.8rem",
            },
            a: {
              "font-size": "0.8rem",
            },
            "h1 a, h2 a, h3 a, h4 a, h5 a, h6 a": {
              "font-size": "1.4rem",
            },
          },
        });

        rendition.themes.select("default");
        rendition.themes.fontSize("140%");

        rendition.display(currentPageIndex).catch((error) => {
          console.error("Error displaying page:", error);
        });

        let items = [];

        //  Paste all TOC List
        book.loaded.navigation.then(function (toc) {
          toc.forEach(function (chapter) {
            const fileName = chapter.href.split("/").pop().split("#")[0];
            const actualSpineItem = book.spine.spineItems.find((item) =>
              item.href.includes(fileName),
            );

            const finalHref = actualSpineItem
              ? actualSpineItem.href
              : chapter.href;

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
            $activeItem[0].scrollIntoView({
              behavior: "smooth",
              block: "nearest",
            });
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
              $chapterLoader.removeClass("hidden").css("opacity", "1");
            }

            if (key === 39) rendition.next();
            if (key === 37) rendition.prev();
          }
        };

        $(document).on("keydown", handleNavigation);
        rendition.on("keydown", handleNavigation);
      })
      .catch(function (err) {
        console.error("EPUB Parsing Error:", err);
        $loaderText.text("Failed to parse book file.");
      });
  }

  loadBook();

  //  Side Panel
  const $sidePanel = $(".side-panel");

  // Add state tracking variables
  let currentAction = null; // Track the currently active action
  let isPanelVisible = false; // Track panel visibility

  function performAction(action) {
    switch (action) {
      case "list":
        $("#side-panel-title").text("Table of Contents");
        $("#toc-list").removeClass("show");
        $("#bookmark-list").removeClass("show");
        $("#image-list").removeClass("show");
        $("#settings-list").removeClass("show");
        $("#toc-list").addClass("show");
        break;
      case "bookmark":
        $("#side-panel-title").text("Bookmarks");
        $("#toc-list").removeClass("show");
        $("#bookmark-list").removeClass("show");
        $("#image-list").removeClass("show");
        $("#settings-list").removeClass("show");
        $("#bookmark-list").addClass("show");
        break;
      case "image":
        $("#side-panel-title").text("Images");
        $("#toc-list").removeClass("show");
        $("#bookmark-list").removeClass("show");
        $("#image-list").removeClass("show");
        $("#settings-list").removeClass("show");
        $("#image-list").addClass("show");
        break;
      case "settings":
        $("#side-panel-title").text("Settings");
        $("#toc-list").removeClass("show");
        $("#bookmark-list").removeClass("show");
        $("#image-list").removeClass("show");
        $("#settings-list").removeClass("show");
        $("#settings-list").addClass("show");
        break;
      case "home":
        window.location.href = "/";
        break;
      default:
        console.log("Unknown action");
    }
  }

  // Updated click handler with toggle logic
  $(".side-button").on("click", function (e) {
    e.preventDefault();
    const action = $(this).data("action");

    // If the same button is clicked, toggle the panel
    if (currentAction === action) {
      isPanelVisible = !isPanelVisible;
      $sidePanel.toggleClass("hidden", !isPanelVisible);
      if (!isPanelVisible) {
        $(".side-button").removeClass("selected");
      } else {
        $(this).addClass("selected");
      }
    } else {
      // Different button: Switch content and ensure panel is visible
      currentAction = action;
      isPanelVisible = true;
      $sidePanel.removeClass("hidden");
      $(".side-button").removeClass("selected");
      $(this).addClass("selected");
      performAction(action);
    }
  });

  // Initial setup (if needed, e.g., show panel for default action)
  const initialSelected = $(".side-button.selected");
  if (initialSelected.length > 0) {
    const initialAction = initialSelected.data("action");
    currentAction = initialAction;
    isPanelVisible = true; // Assume visible on load
    performAction(initialAction);
  } else {
    // If no initial selection, hide panel by default
    $sidePanel.addClass("hidden");
    isPanelVisible = false;
  }
});
