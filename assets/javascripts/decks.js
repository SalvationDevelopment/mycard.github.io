// Generated by CoffeeScript 1.6.2
(function() {
  var Card, CardUsage, CardsController, Deck, DecksController, cards, decks, locale, _ref, _ref1, _ref2, _ref3, _ref4,
    __hasProp = {}.hasOwnProperty,
    __extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; },
    __indexOf = [].indexOf || function(item) { for (var i = 0, l = this.length; i < l; i++) { if (i in this && this[i] === item) return i; } return -1; },
    __bind = function(fn, me){ return function(){ return fn.apply(me, arguments); }; };

  locale = 'zh';

  Card = (function(_super) {
    __extends(Card, _super);

    function Card() {
      _ref = Card.__super__.constructor.apply(this, arguments);
      return _ref;
    }

    Card.types = ['Warrior', 'Spellcaster', 'Fairy', 'Fiend', 'Zombie', 'Machine', 'Aqua', 'Pyro', 'Rock', 'Winged_Beast', 'Plant', 'Insect', 'Thunder', 'Dragon', 'Beast', 'Beast-Warrior', 'Dinosaur', 'Fish', 'Sea_Serpent', 'Reptile', 'Psychic', 'Divine-Beast', 'Creator_God'];

    Card._attributes = ['EARTH', 'WATER', 'FIRE', 'WIND', 'LIGHT', 'DARK', 'DIVINE'];

    Card.card_types = ['Monster', 'Spell', 'Trap', null, 'Normal', 'Effect', 'Fusion', 'Ritual', null, 'Spirit', 'Union', 'Gemini', 'Tuner', 'Synchro', null, null, 'Quick-Play', 'Continuous', 'Equip', 'Field', 'Counter', 'Flip', 'Toon', 'Xyz'];

    Card.categories = ['Monster', 'Spell', 'Trap'];

    Card.card_types_extra = ['Fusion', 'Synchro', 'Xyz'];

    Card.configure('Card', 'id', 'name', 'card_type', 'type', 'attribute', 'level', 'atk', 'def', 'description');

    Card.extend(Spine.Model.Local);

    Card.extend(Spine.Events);

    Card.url = "http://my-card.in/cards";

    Card.locale_url = "http://my-card.in/cards_" + locale;

    Card.prototype.image_url = function() {
      return "http://my-card.in/images/cards/ygocore/" + this.id + ".jpg";
    };

    Card.prototype.image_thumbnail_url = function() {
      return "http://my-card.in/images/cards/ygocore/thumbnail/" + this.id + ".jpg";
    };

    Card.load = function(cards, langs) {
      var card, card_type, i, lang;

      return this.refresh((function() {
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
      }).call(this));
    };

    Card.fetch_by_name = function(name, callback) {
      var _this = this;

      return $.getJSON("" + this.locale_url + "?q=" + (JSON.stringify({
        name: {
          $regex: name.replace(/([.?*+^$[\]\\(){}|-])/g, '\\$1'),
          $options: 'i'
        }
      })), function(langs) {
        var cards_id, e, lang, result, _i, _len;

        result = [];
        cards_id = [];
        for (_i = 0, _len = langs.length; _i < _len; _i++) {
          lang = langs[_i];
          try {
            result.push(Card.find(lang._id));
          } catch (_error) {
            e = _error;
            cards_id.push(lang._id);
          }
        }
        if (cards_id.length) {
          return $.getJSON("" + _this.url + "?q=" + (JSON.stringify({
            _id: {
              $in: cards_id
            }
          })), function(cards) {
            var card, _j, _len1;

            _this.load(cards, langs);
            for (_j = 0, _len1 = cards.length; _j < _len1; _j++) {
              card = cards[_j];
              result.push(Card.find(card._id));
            }
            return callback(result);
          });
        } else {
          return callback(result);
        }
      });
    };

    Card.fetch_by_id = function(cards_id, callback, before, after) {
      var card_id,
        _this = this;

      cards_id = (function() {
        var _i, _len, _results;

        _results = [];
        for (_i = 0, _len = cards_id.length; _i < _len; _i++) {
          card_id = cards_id[_i];
          if (!Card.exists(card_id)) {
            _results.push(card_id);
          }
        }
        return _results;
      })();
      if (cards_id.length) {
        if (before) {
          before();
        }
        return $.when($.getJSON("" + this.url + "?q=" + (JSON.stringify({
          _id: {
            $in: cards_id
          }
        }))), $.getJSON("" + this.locale_url + "?q=" + (JSON.stringify({
          _id: {
            $in: cards_id
          }
        })))).done(function(cards, langs) {
          _this.load(cards[0], langs[0]);
          callback();
          if (after) {
            return after();
          }
        });
      } else {
        return callback();
      }
    };

    return Card;

  })(Spine.Model);

  CardUsage = (function(_super) {
    __extends(CardUsage, _super);

    function CardUsage() {
      _ref1 = CardUsage.__super__.constructor.apply(this, arguments);
      return _ref1;
    }

    CardUsage.configure('CardUsage', 'count', 'side');

    CardUsage.belongsTo('card', Card);

    CardUsage.belongsTo('deck', Deck);

    return CardUsage;

  })(Spine.Model);

  Deck = (function(_super) {
    __extends(Deck, _super);

    function Deck() {
      _ref2 = Deck.__super__.constructor.apply(this, arguments);
      return _ref2;
    }

    Deck.configure('Deck', 'name');

    Deck.hasMany('card_usages', CardUsage);

    Deck.key = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789-_=";

    Deck.prototype.encode = function() {
      var c, card_usage, i, result, _i, _j, _len, _ref3;

      result = '';
      _ref3 = this.card_usages().all();
      for (_i = 0, _len = _ref3.length; _i < _len; _i++) {
        card_usage = _ref3[_i];
        c = card_usage.side << 29 | card_usage.count << 27 | card_usage.card_id;
        for (i = _j = 4; _j >= 0; i = --_j) {
          result += Deck.key.charAt((c >> i * 6) & 0x3F);
        }
      }
      return result;
    };

    Deck.prototype.sort = function() {
      var card, card_type, card_usage, category, _i, _j, _len, _len1, _ref3, _ref4, _results;

      this._main = [];
      this._side = [];
      this._extra = [];
      this._main_count = 0;
      this._side_count = 0;
      this._extra_count = 0;
      this._category_count = {};
      _ref3 = Card.categories;
      for (_i = 0, _len = _ref3.length; _i < _len; _i++) {
        category = _ref3[_i];
        this._category_count[category] = 0;
      }
      _ref4 = this.card_usages().all();
      _results = [];
      for (_j = 0, _len1 = _ref4.length; _j < _len1; _j++) {
        card_usage = _ref4[_j];
        card = card_usage.card();
        if (card_usage.side) {
          this._side.push(card_usage);
          _results.push(this._side_count += card_usage.count);
        } else if (((function() {
          var _k, _len2, _ref5, _results1;

          _ref5 = card.card_type;
          _results1 = [];
          for (_k = 0, _len2 = _ref5.length; _k < _len2; _k++) {
            card_type = _ref5[_k];
            if (__indexOf.call(Card.card_types_extra, card_type) >= 0) {
              _results1.push(card_type);
            }
          }
          return _results1;
        })()).length) {
          this._extra.push(card_usage);
          _results.push(this._extra_count += card_usage.count);
        } else {
          this._main.push(card_usage);
          this._main_count += card_usage.count;
          _results.push(this._category_count[((function() {
            var _k, _len2, _ref5, _results1;

            _ref5 = card.card_type;
            _results1 = [];
            for (_k = 0, _len2 = _ref5.length; _k < _len2; _k++) {
              category = _ref5[_k];
              if (__indexOf.call(Card.categories, category) >= 0) {
                _results1.push(category);
              }
            }
            return _results1;
          })()).pop()] += card_usage.count);
        }
      }
      return _results;
    };

    Deck.prototype.main = function() {
      if (this._main == null) {
        this.sort();
      }
      return this._main;
    };

    Deck.prototype.side = function() {
      if (this._side == null) {
        this.sort();
      }
      return this._side;
    };

    Deck.prototype.extra = function() {
      if (this._extra == null) {
        this.sort();
      }
      return this._extra;
    };

    Deck.prototype.main_count = function() {
      if (this._main_count == null) {
        this.sort();
      }
      return this._main_count;
    };

    Deck.prototype.side_count = function() {
      if (!this._side_count) {
        this.sort();
      }
      return this._side_count;
    };

    Deck.prototype.extra_count = function() {
      if (!this._extra_count) {
        this.sort();
      }
      return this._extra_count;
    };

    Deck.prototype.category_count = function() {
      if (this._category_count == null) {
        this.sort();
      }
      return this._category_count;
    };

    Deck.decode = function(str, name) {
      var card_id, card_usages, char, count, decoded, i, result, side, _i, _j, _len, _ref3, _ref4;

      result = new Deck({
        name: name
      });
      result.save();
      card_usages = [];
      for (i = _i = 0, _ref3 = str.length; _i < _ref3; i = _i += 5) {
        decoded = 0;
        _ref4 = str.substr(i, 5);
        for (_j = 0, _len = _ref4.length; _j < _len; _j++) {
          char = _ref4[_j];
          decoded = (decoded << 6) + this.key.indexOf(char);
        }
        side = decoded >> 29;
        count = decoded >> 27 & 0x3;
        card_id = decoded & 0x07FFFFFF;
        card_usages.push({
          id: "" + result.cid + "_" + side + "_" + card_id + "_" + (Math.random()),
          card_id: card_id,
          side: side,
          count: count
        });
      }
      result.card_usages(card_usages);
      return result;
    };

    Deck.load = function(str, name) {
      var card_id, card_usages, count, last_id, line, lines, result, side, _i, _len;

      result = new Deck({
        name: name
      });
      result.save();
      card_usages = [];
      lines = str.split("\n");
      side = false;
      last_id = 0;
      count = 0;
      for (_i = 0, _len = lines.length; _i < _len; _i++) {
        line = lines[_i];
        if (!line || line.charAt(0) === '#') {
          continue;
        } else if (line.substr(0, 5) === '!side') {
          if (last_id) {
            card_usages.push({
              id: "" + result.cid + "_" + side + "_" + last_id + "_" + (Math.random()),
              card_id: last_id,
              side: side,
              count: count
            });
          }
          side = true;
          last_id = null;
        } else {
          card_id = parseInt(line);
          if (card_id) {
            if (card_id === last_id) {
              count++;
            } else {
              if (last_id) {
                card_usages.push({
                  id: "" + result.cid + "_" + side + "_" + last_id + "_" + (Math.random()),
                  card_id: last_id,
                  side: side,
                  count: count
                });
              }
              last_id = card_id;
              count = 1;
            }
          } else {
            throw '无效卡组';
          }
        }
      }
      if (last_id) {
        card_usages.push({
          id: "" + result.cid + "_" + side + "_" + last_id + "_" + (Math.random()),
          card_id: last_id,
          side: side,
          count: count
        });
      }
      result.card_usages(card_usages);
      return result;
    };

    Deck.prototype.location = function() {
      return "/decks/new?name=" + this.name + "&cards=" + (this.encode());
    };

    Deck.prototype.location_ydk = function() {
      return "/decks/new.ydk?name=" + this.name + "&cards=" + (this.encode());
    };

    Deck.prototype.url = function() {
      return "http://my-card.in" + this.location();
    };

    Deck.prototype.url_ydk = function() {
      return "http://my-card.in" + this.location_ydk();
    };

    Deck.prototype.url_mycard = function() {
      return "mycard://my-card.in" + this.location_ydk() + ("&filename=" + this.name + ".ydk");
    };

    Deck.prototype.add = function(card_usage) {
      var c, count, _i, _len, _ref3;

      if (!card_usage.card_id) {
        card_usage = this.card_usages().findByAttribute('card_id', card.id) || new CardUsage({
          card_id: card_usage.id,
          deck_id: this.id,
          main: true,
          count: 0
        });
      }
      count = 0;
      _ref3 = this.card_usages().findAllByAttribute('card_id', card_usage.card_id);
      for (_i = 0, _len = _ref3.length; _i < _len; _i++) {
        c = _ref3[_i];
        count += c.count;
      }
      if (count < 3) {
        card_usage.count++;
        return card_usage.save();
      }
    };

    Deck.prototype.minus = function(card_usage) {
      if (!card_usage.card_id) {
        card_usage = this.card_usages().findByAttribute('card_id', card_usage.id);
      }
      if (!card_usage) {
        return;
      }
      card_usage.count--;
      if (card_usage.count) {
        return card_usage.save();
      } else {
        return card_usage.destroy();
      }
    };

    return Deck;

  })(Spine.Model);

  DecksController = (function(_super) {
    __extends(DecksController, _super);

    function DecksController() {
      this.render = __bind(this.render, this);
      this.refresh = __bind(this.refresh, this);      _ref3 = DecksController.__super__.constructor.apply(this, arguments);
      return _ref3;
    }

    DecksController.prototype.events = {
      'mouseover .card_usage': 'show',
      'click .card_usage': 'add',
      'contextmenu .card_usage': 'minus'
    };

    $('#deck_select').change(function(e) {
      decks._deck = decks.decks[this.selectedOptions[0].value];
      return decks.refresh();
    });

    DecksController.prototype.decks = {};

    DecksController.prototype.deck = function(deck) {
      if (deck) {
        this.decks[deck.id] = deck;
        this._deck = deck;
        CardUsage.bind('change refresh', this.refresh);
        $('<option/>', {
          value: deck.id,
          text: deck.name,
          selected: true
        }).appendTo($('#deck_select'));
        this.refresh();
      }
      return this._deck;
    };

    DecksController.prototype.refresh = function() {
      var card_usage,
        _this = this;

      return Card.fetch_by_id((function() {
        var _i, _len, _ref4, _results;

        _ref4 = this.deck().card_usages().all();
        _results = [];
        for (_i = 0, _len = _ref4.length; _i < _len; _i++) {
          card_usage = _ref4[_i];
          _results.push(card_usage.card_id);
        }
        return _results;
      }).call(this), function() {
        _this.deck().sort();
        return _this.render();
      }, function() {
        return _this.html($('#loading_template').tmpl());
      });
    };

    DecksController.prototype.render = function() {
      var card_width, deck_width, extra_margin, main_margin, side_margin;

      this.html($('#deck_template').tmpl({
        main: this.deck().main(),
        side: this.deck().side(),
        extra: this.deck().extra(),
        main_count: this.deck().main_count(),
        side_count: this.deck().side_count(),
        extra_count: this.deck().extra_count(),
        category_count: this.deck().category_count()
      }));
      this.set_history();
      this.set_download();
      /*
      $( ".deck_part" ).sortable(
        connectWith: ".deck_part"
        stop: =>
          card_usages = []
          last_item = null
          for el in $('.card_usage')
            card_id = $(el).tmplItem().data.card_id
            side = $(el).parent().hasClass('side')
            if last_item
              if last_item.card_id == card_id and last_item.side == side
                last_item.count++
              else
                card_usages.push last_item
                last_item = {card_id: card_id, side: side, count: 1}
            else
              last_item = {card_id: card_id, side: side, count: 1}
          card_usages.push last_item
          @deck().card_usages card_usages, clear: true
      ).disableSelection();
      */

      if ($('.operate_area').hasClass('text')) {
        return this.el.jscroll({
          W: "12px",
          Btn: {
            btn: false
          }
        });
      } else {
        deck_width = $('.deck_part').width();
        card_width = $('.card_usage').width();
        main_margin = Math.floor((deck_width - card_width * Math.max(Math.ceil(this.deck().main_count() / 4), 10)) / (Math.max(Math.ceil(this.deck().main_count() / 4), 10) - 1) / 2);
        $('.deck_part.main').css({
          'margin-left': -main_margin,
          'margin-right': -main_margin
        });
        $('.deck_part.main .card_usage').css({
          'margin-left': main_margin,
          'margin-right': main_margin
        });
        side_margin = Math.floor((deck_width - card_width * Math.max(this.deck().side_count(), 10)) / (Math.max(this.deck().side_count(), 10) - 1) / 2);
        $('.deck_part.side').css({
          'margin-left': -side_margin,
          'padding-right': -side_margin
        });
        $('.deck_part.side .card_usage').css({
          'margin-left': side_margin,
          'margin-right': side_margin
        });
        extra_margin = Math.floor((deck_width - card_width * Math.max(this.deck().extra_count(), 10)) / (Math.max(this.deck().extra_count(), 10) - 1) / 2);
        $('.deck_part.extra').css({
          'margin-left': -extra_margin,
          'padding-right': -extra_margin
        });
        return $('.deck_part.extra .card_usage').css({
          'margin-left': extra_margin,
          'margin-right': extra_margin
        });
      }
    };

    DecksController.prototype.upload = function(files) {
      var basename, extname, file, reader;

      file = files[0];
      if (file) {
        $('#deck_load').attr('disabled', true);
      }
      basename = file.name.split('.');
      extname = basename.pop();
      basename = basename.join('.');
      if (extname === 'yrp') {
        return mycard.load_decks_from_replay(file, function(deck) {
          var result;

          $('#deck_load').attr('disabled', false);
          result = new Deck({
            name: deck.name
          });
          result.save();
          result.card_usages(deck.card_usages);
          return decks.deck(result);
        });
      } else {
        reader = new FileReader();
        reader.onload = function(ev) {
          var error;

          $('#deck_load').attr('disabled', false);
          try {
            return decks.deck(Deck.load(ev.target.result, basename));
          } catch (_error) {
            error = _error;
            return alert(error);
          }
        };
        return reader.readAsText(file);
      }
    };

    DecksController.prototype.load_from_url = function(url) {
      var cards_param, error;

      try {
        cards_param = $.url(url).param('cards');
        if (cards_param.indexOf('*') >= 0) {
          cards_param = cards_param.replace(/[\*\-]/g, function(char) {
            return {
              '*': '-',
              '-': '_'
            }[char];
          });
        }
        return decks.deck(Deck.decode(cards_param, $.url().param('name')));
      } catch (_error) {
        error = _error;
        return alert(error);
      }
    };

    DecksController.prototype.set_history = function() {
      if (this.deck().location() !== $.url().attr('relative')) {
        return history.pushState(CardUsage.toJSON(), this.deck().name, this.deck().location());
      }
    };

    DecksController.prototype.set_download = function() {
      var card_usage, i;

      if ($.browser.chrome) {
        $('#deck_url_ydk').attr('download', this.deck().name + '.ydk');
        $('#deck_url_ydk').attr('href', 'data:application/x-ygopro-deck,' + encodeURI(["#generated by mycard/web"].concat((function() {
          var _i, _len, _ref4, _results;

          _ref4 = this.deck().main();
          _results = [];
          for (_i = 0, _len = _ref4.length; _i < _len; _i++) {
            card_usage = _ref4[_i];
            _results.push(((function() {
              var _j, _ref5, _results1;

              _results1 = [];
              for (i = _j = 0, _ref5 = card_usage.count; 0 <= _ref5 ? _j < _ref5 : _j > _ref5; i = 0 <= _ref5 ? ++_j : --_j) {
                _results1.push(card_usage.card_id);
              }
              return _results1;
            })()).join("\r\n"));
          }
          return _results;
        }).call(this), (function() {
          var _i, _len, _ref4, _results;

          _ref4 = this.deck().extra();
          _results = [];
          for (_i = 0, _len = _ref4.length; _i < _len; _i++) {
            card_usage = _ref4[_i];
            _results.push(((function() {
              var _j, _ref5, _results1;

              _results1 = [];
              for (i = _j = 0, _ref5 = card_usage.count; 0 <= _ref5 ? _j < _ref5 : _j > _ref5; i = 0 <= _ref5 ? ++_j : --_j) {
                _results1.push(card_usage.card_id);
              }
              return _results1;
            })()).join("\r\n"));
          }
          return _results;
        }).call(this), ["!side"], (function() {
          var _i, _len, _ref4, _results;

          _ref4 = this.deck().side();
          _results = [];
          for (_i = 0, _len = _ref4.length; _i < _len; _i++) {
            card_usage = _ref4[_i];
            _results.push(((function() {
              var _j, _ref5, _results1;

              _results1 = [];
              for (i = _j = 0, _ref5 = card_usage.count; 0 <= _ref5 ? _j < _ref5 : _j > _ref5; i = 0 <= _ref5 ? ++_j : --_j) {
                _results1.push(card_usage.card_id);
              }
              return _results1;
            })()).join("\r\n"));
          }
          return _results;
        }).call(this)).join("\r\n")));
      } else {
        $('#deck_url_ydk').attr('href', this.deck().url_ydk());
      }
      return $('#deck_url_mycard').attr('href', this.deck().url_mycard());
    };

    DecksController.prototype.tab_control = function() {
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

    DecksController.prototype.show = function(e) {
      var active_page_index, card;

      card = $(e.target).tmplItem().data;
      if (card.card_id) {
        card = card.card();
      }
      $('#card').removeClass(Card.card_types.join(' '));
      active_page_index = $('.bottom_area div').index($(".bottom_button_active"));
      $('#card').html($("#card_template").tmpl(card));
      $('#card').addClass(card.card_type.join(' '));
      $('.card_frame .frame_element').eq(active_page_index).addClass('card_frame_focus');
      $('.bottom_area div').eq(active_page_index).addClass('bottom_button_active').removeClass("bottom_button");
      return this.tab_control();
    };

    DecksController.prototype.add = function(e) {
      return this.deck().add($(e.target).tmplItem().data);
    };

    DecksController.prototype.minus = function(e) {
      e.preventDefault();
      return this.deck().minus($(e.target).tmplItem().data);
    };

    return DecksController;

  })(Spine.Controller);

  CardsController = (function(_super) {
    __extends(CardsController, _super);

    function CardsController() {
      _ref4 = CardsController.__super__.constructor.apply(this, arguments);
      return _ref4;
    }

    CardsController.prototype.events = {
      'mouseover .search_card': 'show',
      'click .search_card': 'add',
      'contextmenu .search_card': 'minus'
    };

    CardsController.prototype.add = function(e) {
      return decks.deck().add($(e.target).tmplItem().data);
    };

    CardsController.prototype.minus = function(e) {
      e.preventDefault();
      return decks.deck().minus($(e.target).tmplItem().data);
    };

    CardsController.prototype.show = function(e) {
      return decks.show(e);
    };

    CardsController.prototype.template = function() {
      return $('#search_cards_' + ($('.operate_area').hasClass('text') ? 'text' : 'graphic') + '_template');
    };

    CardsController.prototype.search = function(name) {
      var _this = this;

      return Card.fetch_by_name(name, function(cards) {
        var card, category, category_count, _i, _j, _len, _len1, _ref5;

        category_count = {};
        _ref5 = Card.categories;
        for (_i = 0, _len = _ref5.length; _i < _len; _i++) {
          category = _ref5[_i];
          category_count[category] = 0;
        }
        for (_j = 0, _len1 = cards.length; _j < _len1; _j++) {
          card = cards[_j];
          category_count[((function() {
            var _k, _len2, _ref6, _results;

            _ref6 = card.card_type;
            _results = [];
            for (_k = 0, _len2 = _ref6.length; _k < _len2; _k++) {
              category = _ref6[_k];
              if (__indexOf.call(Card.categories, category) >= 0) {
                _results.push(category);
              }
            }
            return _results;
          })()).pop()]++;
        }
        $("#search_cards_spells_count").html(category_count.Spell);
        $("#search_cards_traps_count").html(category_count.Trap);
        $("#search_cards_monsters_count").html(category_count.Monster);
        _this.html(_this.template().tmpl(cards));
        return _this.el.easyPaginate({
          step: 7,
          delay: 30
        });
      });
    };

    return CardsController;

  })(Spine.Controller);

  decks = new DecksController({
    el: $("#deck")
  });

  cards = new CardsController({
    el: $("#search_cards")
  });

  decks.load_from_url();

  $('#search').submit(function() {
    cards.search($('.search_input').val());
    return false;
  });

  $("#deck_share_dialog").dialog({
    modal: true,
    autoOpen: $.url().attr('fragment') === 'share',
    width: 600,
    open: function() {
      $("#deck_url").val(decks.deck().url());
      $("#deck_url")[0].select();
      return $("#deck_url_qrcode").attr('src', 'https://chart.googleapis.com/chart?chs=171x171&cht=qr&chld=|0&chl=' + encodeURIComponent(decks.deck().url()));
    }
  });

  $("#drop_upload_dialog").dialog({
    dialogClass: 'drop_upload',
    draggable: false,
    resizable: false,
    modal: true,
    autoOpen: false
  });

  $('#deck_share').click(function() {
    return $("#deck_share_dialog").dialog('open');
  });

  $('#deck_url_shorten').click(function() {
    $('#deck_url_shorten').attr("disabled", true);
    return $.ajax({
      url: 'https://www.googleapis.com/urlshortener/v1/url',
      type: 'POST',
      data: JSON.stringify({
        longUrl: decks.deck().url()
      }),
      contentType: 'application/json; charset=utf-8',
      success: function(data) {
        $("#deck_url").val(data.id);
        $("#deck_url")[0].select();
        return $('#deck_url_shorten').attr("disabled", false);
      }
    });
  });

  $('#deck_load').change(function() {
    return decks.upload(this.files);
  });

  $(window).bind('popstate', function(ev) {
    if (ev.state) {
      return deck.refresh(ev.state, false);
    }
  });

  $('.main_div').bind('dragover', function(ev) {
    return ev.preventDefault();
  });

  $('.main_div').bind('drop', function(ev) {
    ev.preventDefault();
    $("#drop_upload_dialog").dialog('close');
    return decks.upload(event.dataTransfer.files);
  });

  $(".switch").click(function() {
    $(".text,.graphic").toggleClass("graphic text");
    return decks.render();
  });

  $.i18n.properties({
    name: 'card',
    path: '/locales/',
    mode: 'map',
    cache: true
  });

  addthis.init();

}).call(this);
