// Get references to page elements
var socket = io.connect("http://localhost:3000/");
var $exampleText = $("#example-text");
var $exampleDescription = $("#example-description");
var $submitBtn = $("#submit");
var $exampleList = $("#example-list");
// The API object contains methods for each kind of request we'll make
var API = {
  saveExample: function(example) {
    return $.ajax({
      headers: {
        "Content-Type": "application/json"
      },
      type: "POST",
      url: "api/examples",
      data: JSON.stringify(example)
    });
  },
  getExamples: function() {
    return $.ajax({
      url: "api/examples",
      type: "GET"
    });
  },
  deleteExample: function(id) {
    return $.ajax({
      url: "api/examples/" + id,
      type: "DELETE"
    });
  }
};

// refreshExamples gets new examples from the db and repopulates the list
var refreshExamples = function() {
  API.getExamples().then(function(data) {
    var $examples = data.map(function(example) {
      var $a = $("<a>")
        .text(example.text)
        .attr("href", "/example/" + example.id);

      var $li = $("<li>")
        .attr({
          class: "list-group-item",
          "data-id": example.id
        })
        .append($a);

      var $button = $("<button>")
        .addClass("btn btn-danger float-right delete")
        .text("ｘ");

      $li.append($button);

      return $li;
    });

    $exampleList.empty();
    $exampleList.append($examples);
  });
};

// handleFormSubmit is called whenever we submit a new example
// Save the new example to the db and refresh the list
var handleFormSubmit = function(event) {
  event.preventDefault();

  var example = {
    text: $exampleText.val().trim(),
    description: $exampleDescription.val().trim()
  };

  if (!(example.text && example.description)) {
    alert("You must enter an example text and description!");
    return;
  }

  API.saveExample(example).then(function() {
    Swal.fire("Drink has been submitted!");
    refreshExamples();
  });

  $exampleText.val("");
  $exampleDescription.val("");
};

// handleDeleteBtnClick is called when an example's delete button is clicked
// Remove the example from the db and refresh the list
var handleDeleteBtnClick = function() {
  var idToDelete = $(this)
    .parent()
    .attr("data-id");

  Swal.fire({
    title: "Are you sure?",
    text: "You won't be able to revert this!",
    type: "warning",
    showCancelButton: true,
    confirmButtonColor: "#3085d6",
    cancelButtonColor: "#d33",
    confirmButtonText: "Yes, delete it!"
  }).then(function(result) {
    if (result.value) {
      API.deleteExample(idToDelete).then(function() {
        refreshExamples();
      });
      Swal.fire("Deleted!", "Your file has been deleted.", "success");
    }
  });
};

function handleMessage() {
  socket.emit("chat", {
    message: $("#message").val(),
    handle: $("#handle").val()
  });
  $("#message").val("");
}

function handleMessageType() {
  socket.emit("typing", $("#handle").val());
}

$(document).ready(function() {
  $("#bookButton").on("click", function() {
    var book = $('#searchBook').val();
    $.ajax({
      url: "https://www.googleapis.com/books/v1/volumes?q=" + book,
      dataType: "json",
      success: function(data) {
        console.log(data.items);
        for(var i = 0; i < data.items.length; i++){
          console.log(data.items[i].volumeInfo.title);
          console.log(data.items[i].volumeInfo.imageLinks.thumbnail)

          $('#bookList').append(`<p><strong>Title: </strong>${data.items[i].volumeInfo.title}</p><img src="${data.items[i].volumeInfo.imageLinks.thumbnail}" alt="${data.items[i].volumeInfo.title}">`)
        }
      },
      type: "GET"
    });

    $('#searchBook').val('');
 
  });

  $("#slideshow .slick").slick({
    autoplay: true,
    autoplaySpeed: 1000,
    dots: true,
    fade: true
  });

  socket.on("chat", function(data) {
    console.log(data);
    $("#feedback").text("");
    $("#output").append(
      "<p><strong>" + data.handle + ":</strong>" + data.message + "</p>"
    );
  });

  socket.on("typing", function(data) {
    $("#feedback").html("<p><em>" + data + " is typing a message...</em></p>");
  });
  // Add event listeners to the submit and delete buttons
  $submitBtn.on("click", handleFormSubmit);
  $exampleList.on("click", ".delete", handleDeleteBtnClick);
  $("#send").on("click", handleMessage);
  $("#message").keydown(handleMessageType);
});
