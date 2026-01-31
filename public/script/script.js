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
});
