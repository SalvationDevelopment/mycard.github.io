// Generated by CoffeeScript 1.4.0
(function() {
  var Card, CardUsage, Deck, locale,
    __hasProp = {}.hasOwnProperty,
    __extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; },
    __bind = function(fn, me){ return function(){ return fn.apply(me, arguments); }; },
    __indexOf = [].indexOf || function(item) { for (var i = 0, l = this.length; i < l; i++) { if (i in this && this[i] === item) return i; } return -1; };

  locale = 'zh';

  Card = (function(_super) {

    __extends(Card, _super);

    function Card() {
      return Card.__super__.constructor.apply(this, arguments);
    }

    Card.types = ['Warrior', 'Spellcaster', 'Fairy', 'Fiend', 'Zombie', 'Machine', 'Aqua', 'Pyro', 'Rock', 'Winged_Beast', 'Plant', 'Insect', 'Thunder', 'Dragon', 'Beast', 'Beast-Warrior', 'Dinosaur', 'Fish', 'Sea_Serpent', 'Reptile', 'Psychic', 'Divine-Beast', 'Creator_God'];

    Card._attributes = ['EARTH', 'WATER', 'FIRE', 'WIND', 'LIGHT', 'DARK', 'DIVINE'];

    Card.card_types = ['Monster', 'Spell', 'Trap', null, 'Normal', 'Effect', 'Fusion', 'Ritual', null, 'Spirit', 'Union', 'Gemini', 'Tuner', 'Synchro', null, null, 'Quick-Play', 'Continuous', 'Equip', 'Field', 'Counter', 'Flip', 'Toon', 'Xyz'];

    Card.categories = ['Monster', 'Spell', 'Trap'];

    Card.card_types_extra = ['Fusion', 'Synchro', 'Xyz'];

    Card.configure('Card', 'id', 'name', 'card_type', 'type', 'attribute', 'level', 'atk', 'def', 'description');

    Card.extend(Spine.Model.Ajax);

    Card.extend(Spine.Events);

    Card.hasMany('card_usages', CardUsage);

    Card.url = "https://api.mongolab.com/api/1/databases/mycard/collections/cards?apiKey=508e5726e4b0c54ca4492ead";

    Card.locale_url = "https://api.mongolab.com/api/1/databases/mycard/collections/lang_" + locale + "?apiKey=508e5726e4b0c54ca4492ead";

    Card.query = function(q, callback) {
      var _this = this;
      return $.getJSON("" + this.url + "&q=" + (JSON.stringify(q)), function(cards) {
        var card, cards_id;
        cards_id = (function() {
          var _i, _len, _results;
          _results = [];
          for (_i = 0, _len = cards.length; _i < _len; _i++) {
            card = cards[_i];
            _results.push(card._id);
          }
          return _results;
        })();
        return $.getJSON("" + _this.locale_url + "&q=" + (JSON.stringify({
          _id: {
            $in: cards_id
          }
        })), function(langs) {
          var card_type, i, lang;
          cards = (function() {
            var _i, _j, _len, _len1, _results;
            _results = [];
            for (_i = 0, _len = langs.length; _i < _len; _i++) {
              lang = langs[_i];
              for (_j = 0, _len1 = cards.length; _j < _len1; _j++) {
                card = cards[_j];
                if (card._id === lang._id) {
                  $.extend(lang, card);
                  break;
                }
              }
              card_type = [];
              i = 0;
              while (lang.type) {
                if (lang.type & 1) {
                  card_type.push(this.card_types[i]);
                }
                lang.type >>= 1;
                i++;
              }
              _results.push({
                id: card._id,
                alias: card.alias,
                name: lang.name,
                card_type: card_type,
                type: lang.race ? (i = 0, (function() {
                  var _results1;
                  _results1 = [];
                  while (!(lang.race >> i & 1)) {
                    _results1.push(i++);
                  }
                  return _results1;
                })(), this.types[i]) : void 0,
                attribute: lang.attribute ? (i = 0, (function() {
                  var _results1;
                  _results1 = [];
                  while (!(lang.attribute >> i & 1)) {
                    _results1.push(i++);
                  }
                  return _results1;
                })(), this._attributes[i]) : void 0,
                level: card.level,
                atk: card.atk,
                def: card.def,
                description: lang.desc
              });
            }
            return _results;
          }).call(_this);
          _this.refresh(cards);
          return callback(cards);
        });
      });
    };

    return Card;

  })(Spine.Model);

  CardUsage = (function(_super) {

    __extends(CardUsage, _super);

    function CardUsage() {
      return CardUsage.__super__.constructor.apply(this, arguments);
    }

    CardUsage.configure('CardUsage', 'card_id', 'count', 'side');

    CardUsage.belongsTo('card', Card);

    return CardUsage;

  })(Spine.Model);

  Deck = (function(_super) {

    __extends(Deck, _super);

    Deck.prototype.events = {
      'mouseenter .card': 'show',
      'click .card': 'add',
      'contextmenu .card': 'minus'
    };

    Deck.prototype.key = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789*-=";

    function Deck() {
      this.render = __bind(this.render, this);
      Deck.__super__.constructor.apply(this, arguments);
      CardUsage.bind("refresh change", this.render);
    }

    Deck.prototype.render = function() {
      var category, category_count, extra, extra_count, main, main_count, side, side_count, _i, _len, _ref;
      main = [];
      side = [];
      extra = [];
      main_count = 0;
      side_count = 0;
      extra_count = 0;
      category_count = {};
      _ref = Card.categories;
      for (_i = 0, _len = _ref.length; _i < _len; _i++) {
        category = _ref[_i];
        category_count[category] = 0;
      }
      CardUsage.each(function(card_usage) {
        var card, card_type;
        card = card_usage.card();
        if (card_usage.side) {
          side.push(card_usage);
          return side_count += card_usage.count;
        } else if (((function() {
          var _j, _len1, _ref1, _results;
          _ref1 = card.card_type;
          _results = [];
          for (_j = 0, _len1 = _ref1.length; _j < _len1; _j++) {
            card_type = _ref1[_j];
            if (__indexOf.call(Card.card_types_extra, card_type) >= 0) {
              _results.push(card_type);
            }
          }
          return _results;
        })()).length) {
          extra.push(card_usage);
          return extra_count += card_usage.count;
        } else {
          main.push(card_usage);
          main_count += card_usage.count;
          return category_count[((function() {
            var _j, _len1, _ref1, _results;
            _ref1 = card.card_type;
            _results = [];
            for (_j = 0, _len1 = _ref1.length; _j < _len1; _j++) {
              category = _ref1[_j];
              if (__indexOf.call(Card.categories, category) >= 0) {
                _results.push(category);
              }
            }
            return _results;
          })()).pop()] += card_usage.count;
        }
      });
      this.html($('#deck_template').tmpl({
        main: main,
        side: side,
        extra: extra,
        main_count: main_count,
        side_count: side_count,
        extra_count: extra_count,
        category_count: category_count
      }));
      return this.el.jscroll({
        W: "12px",
        Btn: {
          btn: false
        }
      });
    };

    Deck.prototype.tab_control = function() {
      $(".bottom_area div").click(function() {
        var $dangqian;
        $(this).addClass("bottom_button_active").removeClass("bottom_button");
        $(this).siblings().addClass("bottom_button").removeClass("bottom_button_active");
        $dangqian = $(".card_frame .frame_element").eq($(".bottom_area div").index(this));
        $dangqian.addClass("card_frame_focus");
        return $dangqian.siblings().removeClass("card_frame_focus");
      });
      return $('.card_frame .frame_element').jscroll({
        W: "12px",
        Btn: {
          btn: false
        }
      });
    };

    Deck.prototype.show = function(e) {
      var active_page_index, card;
      card = $(e.target).tmplItem().data.card();
      $('#card').removeClass(Card.card_types.join(' '));
      active_page_index = $('.bottom_area div').index($(".bottom_button_active"));
      $('#card').html($("#card_template").tmpl(card));
      $('#card').addClass(card.card_type.join(' '));
      $('.card_frame .frame_element').eq(active_page_index).addClass('card_frame_focus');
      $('.bottom_area div').eq(active_page_index).addClass('bottom_button_active').removeClass("bottom_button");
      return this.tab_control();
    };

    Deck.prototype.add = function(e) {
      var c, card_usage, count, _i, _len, _ref;
      card_usage = $(e.target).tmplItem().data;
      count = 0;
      _ref = CardUsage.findAllByAttribute('card_id', card_usage.card_id);
      for (_i = 0, _len = _ref.length; _i < _len; _i++) {
        c = _ref[_i];
        count += c.count;
      }
      if (count < 3) {
        card_usage.count++;
        return card_usage.save();
      }
    };

    Deck.prototype.minus = function(e) {
      var card_usage;
      card_usage = $(e.target).tmplItem().data;
      card_usage.count--;
      if (card_usage.count) {
        card_usage.save();
      } else {
        card_usage.destroy();
      }
      return false;
    };

    Deck.prototype.parse = function(str) {
      var card_id, card_usage, card_usages, char, count, decoded, i, side,
        _this = this;
      card_usages = (function() {
        var _i, _j, _len, _ref, _ref1, _results;
        _results = [];
        for (i = _i = 0, _ref = str.length; _i < _ref; i = _i += 5) {
          decoded = 0;
          _ref1 = str.substr(i, 5);
          for (_j = 0, _len = _ref1.length; _j < _len; _j++) {
            char = _ref1[_j];
            decoded = (decoded << 6) + this.key.indexOf(char);
          }
          card_id = decoded & 0x07FFFFFF;
          side = decoded >> 29;
          count = decoded >> 27 & 0x3;
          _results.push({
            card_id: card_id,
            side: side,
            count: count
          });
        }
        return _results;
      }).call(this);
      return Card.query({
        _id: {
          $in: (function() {
            var _i, _len, _results;
            _results = [];
            for (_i = 0, _len = card_usages.length; _i < _len; _i++) {
              card_usage = card_usages[_i];
              _results.push(card_usage.card_id);
            }
            return _results;
          })()
        }
      }, function() {
        return CardUsage.refresh(card_usages);
      });
    };

    return Deck;

  })(Spine.Controller);

  $(document).ready(function() {
    var cards_encoded, name;
    name = $.url().param('name');
    cards_encoded = $.url().param('cards');
    $('img#qrcode').attr('src', 'https://chart.googleapis.com/chart?chs=200x200&cht=qr&chld=|0&chl=' + encodeURIComponent("http://my-card.in/decks/?name=" + name + "&cards=" + cards_encoded));
    $('#name').html(name);
    return $.i18n.properties({
      name: 'card',
      path: '/locales/',
      mode: 'map',
      cache: true,
      callback: function() {
        var deck;
        deck = new Deck({
          el: $("#deck")
        });
        deck.tab_control();
        return deck.parse(cards_encoded);
      }
    });
  });

}).call(this);
