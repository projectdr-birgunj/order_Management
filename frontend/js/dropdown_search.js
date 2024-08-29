// let valThis;
window.create_custom_dropdowns = function (classNameParam) {
  $("select." + classNameParam).each(function (i, select) {
    if (!$(this).next().hasClass("dropdown-select")) {
      $(this).after(
        '<div class="dropdown-select wide ' +
          ($(this).attr("class") || "") +
          '" tabindex="0"><span class="current"></span><div class="list"><ul></ul></div></div>'
      );
      var dropdown = $(this).next();
      var options = $(select).find("option");
      var selected = $(this).find("option:selected");
      dropdown
        .find(".current")
        .html(selected.data("display-text") || selected.text());
      options.each(function (j, o) {
        var display = $(o).data("display-text") || "";
        dropdown
          .find("ul")
          .append(
            '<li id="dropdownLI" class="option ' +
              ($(o).is(":selected") ? "selected" : "") +
              '" data-value="' +
              $(o).val() +
              '" data-display-text="' +
              display +
              '">' +
              $(o).text() +
              "</li>"
          );
      });
    }
  });

  $(".dropdown-select ul").before(
    '<div class="dd-search"><input id="txtSearchValue" autocomplete="off" onkeyup="filter()" class="dd-searchbox" type="text"></div>'
  );
};

// Event listeners

// Open/close
$(document).on("click", ".dropdown-select", function (event) {
  if ($(event.target).hasClass("dd-searchbox")) {
    return;
  }
  $(".dropdown-select").not($(this)).removeClass("open");
  $(this).toggleClass("open");
  if ($(this).hasClass("open")) {
    //jft
    var searchInput = $(this).find(".dd-searchbox");
    searchInput.val(""); // Clear the search input value
    $(this)
      .find(".dropdown-select ul > li")
      .each(function () {
        $(this).show(); // Show all options
      });
    //jft_ends
    console.log("checking tf this is when close is added");
    // console.log("Inside clering" + valThis);
    $(this).find(".option").attr("tabindex", 0);
    $(this).find(".selected").focus();
  } else {
    console.log("checking tf this is when close is removed");
    $(this).find(".option").removeAttr("tabindex");
    $(this).focus();
  }
});

// Close when clicking outside
$(document).on("click", function (event) {
  if ($(event.target).closest(".dropdown-select").length === 0) {
    $(".dropdown-select").removeClass("open");
    $(".dropdown-select .option").removeAttr("tabindex");
  }
  event.stopPropagation();
});

window.filter = function (searchInput) {
  console.log("SearchInput\t" + searchInput);
  if (!searchInput) return; // Check if searchInput is provided

  var valThis = $(searchInput).val().toLowerCase();
  console.log("Filtering with value:", valThis);

  var dropdown = $(searchInput).closest(".dropdown-select");
  if (dropdown.length === 0) {
    console.error("Dropdown container not found");
    return;
  }

  console.log(dropdown);
  console.log("Outside filtering hide and show");

  dropdown.find(" ul > li").each(function () {
    console.log("Inside filtering hide and show");
    var text = $(this).text();
    text.toLowerCase().indexOf(valThis.toLowerCase()) > -1
      ? $(this).show()
      : $(this).hide();
  });
};

// Search

// Option click
$(document).on("click", ".dropdown-select .option", function (event) {
  $(this).closest(".list").find(".selected").removeClass("selected");
  $(this).addClass("selected");
  var text = $(this).data("display-text") || $(this).text();
  $(this).closest(".dropdown-select").find(".current").text(text);
  $(this)
    .closest(".dropdown-select")
    .prev("select")
    .val($(this).data("value"))
    .trigger("change");
});

// Keyboard events
$(document).on("keydown", ".dropdown-select", function (event) {
  var focused_option = $(
    $(this).find(".list .option:focus")[0] ||
      $(this).find(".list .option.selected")[0]
  );
  // Space or Enter
  //if (event.keyCode == 32 || event.keyCode == 13) {
  if (event.keyCode == 13) {
    if ($(this).hasClass("open")) {
      focused_option.trigger("click");
    } else {
      $(this).trigger("click");
    }
    return false;
    // Down
  } else if (event.keyCode == 40) {
    if (!$(this).hasClass("open")) {
      $(this).trigger("click");
    } else {
      focused_option.next().focus();
    }
    return false;
    // Up
  } else if (event.keyCode == 38) {
    if (!$(this).hasClass("open")) {
      $(this).trigger("click");
    } else {
      var focused_option = $(
        $(this).find(".list .option:focus")[0] ||
          $(this).find(".list .option.selected")[0]
      );
      focused_option.prev().focus();
    }
    return false;
    // Esc
  } else if (event.keyCode == 27) {
    if ($(this).hasClass("open")) {
      $(this).trigger("click");
    }
    return false;
  }
});

// Event listener for search input
// $(document).on("keyup", "#txtSearchValue", function () {
//   filter();
// });

$(document).on("keyup", ".dd-searchbox", function () {
  window.filter(this);
});

// $(document).ready(function () {
//     create_custom_dropdowns();
// });
