$(document).ready(function () {
  injectNavBar();
});

function injectNavBar() {
  if ($('body').not(':has(header)')) {
    $('body').append('<header></header>');
  }
  $("header").append('<nav class="navbar"><a class="home-link" href="index.html"><h1>MyHub</h1></a><a class="navbar-link" href="calander.html"><li class="navbar-item">Calander</li></a><a class="navbar-link" href="study.html"><li class="navbar-item">Study</li></a></nav>');
}
