function injectNavBar() {
  $("header").append('<nav class="navbar">' +
  '<a class="navbar-link active" href="index.html"><h1>MyHub</h1></a>' +
  '<a class="navbar-link" href="calander.html"><li class="navbar-item">Calander</li></a>'+
  '<a class="navbar-link" href="todo.html"><li class="navbar-item">To-Do</li></a></nav>');
}

$(document).ready(function () {
  injectNavBar()
});
