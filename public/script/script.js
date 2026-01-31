$(document).ready(function () {
  const $sidebar = $(".side-navigation-wrapper");
  const $openBtn = $(".side-show-btn");
  const $closeBtn = $(".close-btn");

  // Open Sidebar
  $openBtn.on("click", function () {
    $sidebar.addClass("active");
    $(this).addClass("invisible"); // Use opacity instead of hidden to prevent layout jump
  });

  // Close Sidebar
  $closeBtn.on("click", function () {
    $sidebar.removeClass("active");
    $openBtn.removeClass("invisible");
  });

  // Close when clicking outside the sidebar
  $(document).on("click", function (e) {
    if (
      !$sidebar.is(e.target) &&
      $sidebar.has(e.target).length === 0 &&
      !$openBtn.find("i").is(e.target)
    ) {
      $sidebar.removeClass("active");
      $openBtn.removeClass("invisible");
    }
  });

  //  Side Panel
  const $sidePanel = $(".side-panel");

  function performAction(action) {
    switch (action) {
      case "list":
        $sidePanel.empty();
        const tocListPanel = `
                      <div>
                          <h2>Table of Contents</h2>
                          <ul id="toc-list"></ul>
                      </div>
                  `;
        $sidePanel.append(tocListPanel);
        break;
      case "bookmark":
        $sidePanel.empty();
        const bookmarkPanel = `
                      <div>
                          <h2>Bookmarks</h2>
                          <ul id="bookmark-list"></ul>
                      </div>
                  `;
        $sidePanel.append(bookmarkPanel);
        break;
      case "image":
        $sidePanel.empty();
        const imagePanel = `
                      <div>
                          <h2>Image List</h2>
                          <ul id="image-list"></ul>
                      </div>
                  `;
        $sidePanel.append(imagePanel);
        break;
      case "settings":
        $sidePanel.empty();
        const settingsPanel = `
                      <div>
                          <h2>Settings</h2>
                          <ul id="settings-list"></ul>
                      </div>
                  `;
        $sidePanel.append(settingsPanel);
        break;
      case "home":
        window.location.href = "/";
        break;
      default:
        console.log("Unknown action");
    }
  }

  //  Reader menu
  $(".side-button").on("click", function (e) {
    e.preventDefault();
    $(".side-button").removeClass("selected");
    const action = $(this).data("action");
    performAction(action);
  });

  const initialSelected = $(".side-button.selected");
  if (initialSelected.length > 0) {
    const initialAction = initialSelected.data("action");
    performAction(initialAction);
  }
});
