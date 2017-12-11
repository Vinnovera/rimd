window.getQuery = function (path) {
  var a = document.createElement('a');

  a.href = path;

  return a.search;
};
