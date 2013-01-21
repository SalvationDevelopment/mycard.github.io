// Generated by CoffeeScript 1.4.0
(function() {

  $(document).ready(function() {
    $('#slider').cycle({
      fx: 'fade',
      timeout: 7200,
      random: 1
    });
    $.get('/mycard/download.url', function(data) {
      var matched;
      if (matched = data.match(/mycard-(.*)-win32\.7z/)) {
        return $('#download_version').html(matched[1]);
      } else {
        return $('#download_version').html('读取失败');
      }
    });
    return $.getJSON('/links.json', function(data) {
      var link, _i, _len, _results;
      _results = [];
      for (_i = 0, _len = data.length; _i < _len; _i++) {
        link = data[_i];
        _results.push($('<a />', {
          href: link.url
        }).append($('<img />', {
          title: link.name,
          alt: link.name,
          src: link.logo
        })).appendTo('#links'));
      }
      return _results;
    });
  });

}).call(this);
