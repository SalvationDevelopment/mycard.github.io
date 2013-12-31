class Server extends Spine.Model
  @configure "Server", "name", "ip", "port", "index"
  @extend Spine.Model.Ajax
  @url: "/servers.json"
  @choice: (auth = true, pvp = false)->
    servers = if pvp
      Server.findAllByAttribute('pvp', true)
    else
      Server.all()
    s = _.filter servers, (server)->
      _.find $('#servers').multiselect('getChecked'), (e)->
        parseInt(e.value) == server.id
    if s.length
      servers = s
    return servers[Math.floor Math.random() * servers.length]
class Servers extends Spine.Controller
  constructor: ->
    super
    Server.bind "refresh", @render
    Server.one "refresh", @connect
  render: =>
    @html $('#server_template').tmpl Server.all()
    @el.multiselect(
      noneSelectedText: '房间筛选'
      selectedText: '房间筛选'
      header: false
      minWidth: 'auto'
      classes: 'server_filter'
    ).bind "multiselectclick", (event, ui)->
      Room.trigger 'refresh'

    $('#server option[value!=0]').remove()
    #server = Server.choice()
    #new_room.server_ip.value = server.ip
    #new_room.server_port.value = server.port
    #new_room.server_auth.checked = server.auth
    Server.each (server)->
      $('<option />',
        label: server.name
        value: server.id
      ).appendTo $('#server')
  connect: =>
    $('#rooms').html '正在连接...'
    wsServer = 'ws://my-card.in/rooms.json'
    websocket = new WebSocket(wsServer);
    websocket.onopen = ->
      $('#rooms').html '正在读取房间列表...'
      console.log("websocket: Connected to WebSocket server.")
      Room.deleteAll()
    websocket.onclose = (evt)=>
      $('#rooms').html '大厅连接中断, '
      $('<a />', id: 'reconnect', text: '重新连接').appendTo $('#rooms')
      $('#reconnect').click @connect
      console.log("websocket: Disconnected");
    websocket.onmessage = (evt)->
      rooms = JSON.parse(evt.data)
      for room in rooms
        if room._deleted
          Room.find(room.id).destroy() if Room.exists(room.id)
      Room.refresh ($.extend({rule: 0, mode: 0, enable_priority: false, no_check_deck: false, no_shuffle_deck: false,start_lp: 8000, start_hand: 5, draw_count: 1}, room) for room in rooms when !room._deleted)
    websocket.onerror = (evt)->
      console.log('websocket: Error occured: ' + evt.data);

class Room extends Spine.Model
  @configure "Room", "name", "status", "private", "rule", "mode", "start_lp"
  @belongsTo 'server', Server

class Rooms extends Spine.Controller
  events:
    'click .room': 'clicked'
  constructor: ->
    super
    Room.bind "refresh", @render
  render: =>
    @html $('#room_template').tmpl _.sortBy(_.filter(Room.all(), @filter), @sort)
    $('#status').html "房间数量: #{Room.findAllByAttribute('status', 'wait').length}/#{Room.count()}"
  filter: (room)->
    _.find $('#servers').multiselect('getChecked'), (e)->
      parseInt(e.value) == room.server_id
  sort: (room)->
    [
      if room.status == "wait" then 0 else 1,
      room.private
    ]
  clicked: (e)->
    room = $(e.target).tmplItem().data
    if room.private
      $('#join_private_room')[0].reset()
      $('#join_private_room').data('room_id', room.id)
      $('#join_private_room_dialog').dialog('open')
    else
      mycard.join(room.server().ip, room.server().port, mycard.room_name(room.name, null, room.pvp, room.rule, room.mode, room.start_lp, room.start_hand, room.draw_count), Candy.Util.getCookie('username'), Candy.Util.getCookie('password') if room.server().auth)

login = ->
  #Candy.Core.Event.Jabber.Presence = (msg)->
  #  Candy.Core.log('[Jabber] Presence');
  #  msg = $(msg);
  #  if(msg.children('x[xmlns^="' + Strophe.NS.MUC + '"]').length > 0)
  #    if (msg.attr('type') == 'error')
  #      self.Jabber.Room.PresenceError(msg);
  #    else
  #      self.Jabber.Room.Presence(msg);
  #  else
  #    alert msg
  #  true
  Candy.Util.setCookie('candy-nostatusmessages', '1', 365);
  Candy.init('http://122.0.65.69/http-bind/',
    core:
      debug: false,
      autojoin: ['mycard@conference.my-card.in'],
    view:
      resources: '/vendor/candy/res/',
      language: 'cn'
  )
  Candy.Util.getPosTopAccordingToWindowBounds = (elem, pos)->
    windowHeight = $(document).height()
    elemHeight   = elem.outerHeight()
    marginDiff = elemHeight - elem.outerHeight(true)
    backgroundPositionAlignment = 'top';
    pos -= relative = $('#candy').offset().top
    if (pos + elemHeight >= windowHeight - relative)
      pos -= elemHeight - marginDiff;
      backgroundPositionAlignment = 'bottom';
    return { px: pos, backgroundPositionAlignment: backgroundPositionAlignment };

  CandyShop.InlineImages.init();
  Candy.View.Template.Login.form = $('#login_form_template').html()
  Candy.Core.connect(Candy.Util.getCookie('jid'), Candy.Util.getCookie('password'))

  Candy.View.Pane.Roster.joinAnimation = (elementId)->
    $('#' + elementId).show().css('opacity',1)

  $('.xmpp').click ->
    Candy.View.Pane.PrivateRoom.open($(this).data('jid'), $(this).data('nick'), true, true)

  $('#candy').show()
  candy_height = $('#candy').outerHeight true
  $('.card_center').css('margin-bottom', -candy_height)
  $('.card_center').css('padding-bottom', candy_height)

  #window.onunload = window.onbeforeunload
  window.onbeforeunload = null

@after_login = ->
  $('#rooms').css('padding-right', 225)
  $('.online_list').show()

  $('#current_username').html(Candy.Util.getCookie('username'))
  $('.log_reg.not_logged').hide()
  $('.log_reg.logged').show()

logout = ->
  Candy.Util.deleteCookie('jid')
  Candy.Util.deleteCookie('username')
  Candy.Util.deleteCookie('password')
  window.location.reload()


setRosterHeight = ->
  pageHight = (document.documentElement.clientHeight)-430
  $("#roster").height(pageHight)
$(document).ready ->
  if Candy.Util.getCookie('jid')
    login()
    after_login()


  $('#new_room_dialog').dialog
    autoOpen:false,
    resizable:false,
    title:"建立/加入房间"

  $('#join_private_room_dialog').dialog
    autoOpen:false,
    resizable:false,
    title:"加入私密房间"

  new_room = $('#new_room')[0]
  new_room.pvp.onchange = ->
    if @checked
      new_room.mode.value = 1 if new_room.mode.value == '2'
      new_room.rule.value = 0
      new_room.start_lp.value = 8000
      new_room.start_hand.value = 5
      new_room.draw_count.value = 1
      if (server_id = parseInt new_room.server.value) and !Server.find(server_id).pvp
        new_room.server.value = Server.choice(false, new_room.pvp.ckecked).id
  new_room.mode.onchange = ->
    if @value == '2'
      new_room.pvp.checked = false
  new_room.rule.onchange = ->
    if @value != '0'
      new_room.pvp.checked = false
  new_room.start_lp.onchange = ->
    if @value != '8000'
      new_room.pvp.checked = false
  new_room.server.onchange = ->
    $('#server_custom').hide();
    if server_id = parseInt new_room.server.value
      if !Server.find(server_id).pvp
        new_room.pvp.checked = false
    else
      $('#server_custom').show();
  new_room.onsubmit = (ev)->
    ev.preventDefault()
    $('#new_room_dialog').dialog('close')
    if server_id = parseInt new_room.server.value
      server = Server.find server_id
      server_ip = server.ip
      server_port = server.port
      server_auth = server.auth
    else
      server_ip = new_room.server_ip.value
      server_port = parseInt new_room.server_port.value
      server_auth = new_room.server_auth.checked
    mycard.join(server_ip, server_port, mycard.room_name(@name.value, @password.value, @pvp.checked, parseInt(@rule.value), parseInt(@mode.value), parseInt(@start_lp.value), parseInt(@start_hand.value), parseInt(@draw_count.value)), Candy.Util.getCookie('username'), Candy.Util.getCookie('password') if server_auth)

  $('#join_private_room').submit (ev)->
    ev.preventDefault()
    $('#join_private_room_dialog').dialog('close')

    if @password.value
      room_id = $(this).data('room_id')
      if Room.exists room_id
        room = Room.find(room_id)
        mycard.join(room.server().ip, room.server().port, mycard.room_name(room.name, @password.value, room.pvp, room.rule, room.mode, room.start_lp, room.start_hand, room.draw_count), Candy.Util.getCookie('username'), Candy.Util.getCookie('password') if room.server().auth)
      else
        humane.log '房间已经关闭'

  $('#new_room_button').click ->
    new_room.name.value = Math.floor Math.random() * 1000
    new_room.server.value = Server.choice(false, new_room.pvp.ckecked).id
    new_room.server.onchange() #这个怎么能自动触发...
    $('#new_room_dialog').dialog('open')
    $('#new_room_copy_room_url').zclip('remove')
    $('#new_room_copy_room_url').zclip
      path:'/vendor/javascripts/ZeroClipboard.swf',
      copy: ->
        if server_id = parseInt new_room.server.value
          server = Server.find server_id
          server_ip = server.ip
          server_port = server.port
          server_auth = server.auth
        else
          server_ip = new_room.server_ip.value
          server_port = parseInt new_room.server_port.value
          server_auth = new_room.server_auth.checked
        mycard.room_url server_ip, server_port, mycard.room_name(new_room.name.value, null, new_room.pvp.checked, parseInt(new_room.rule.value), parseInt(new_room.mode.value), parseInt(new_room.start_lp.value), parseInt(new_room.start_hand.value), parseInt(new_room.draw_count.value)), null, null, new_room.password.value.length, server_auth
      afterCopy: ->
        humane.log '房间地址已复制到剪贴板'
  new_room.password.onchange = ->
    $('#new_room_copy_room_url_with_password').zclip('remove')
    if new_room.password.value
      $('#new_room_copy_room_url_with_password').show()
      $('#new_room_copy_room_url_with_password').zclip
        path:'/vendor/javascripts/ZeroClipboard.swf',
        copy: ->
          if server_id = parseInt new_room.server.value
            server = Server.find server_id
            server_ip = server.ip
            server_port = server.port
            server_auth = server.auth
          else
            server_ip = new_room.server_ip.value
            server_port = parseInt new_room.server_port.value
            server_auth = new_room.server_auth.checked
          mycard.room_url server_ip, server_port, mycard.room_name(new_room.name.value, new_room.password.value, new_room.pvp.checked, parseInt(new_room.rule.value), parseInt(new_room.mode.value), parseInt(new_room.start_lp.value), parseInt(new_room.start_hand.value), parseInt(new_room.draw_count.value)), null, null, false, server_auth
    else
      $('#new_room_copy_room_url_with_password').hide()


  #$('#login_domain').combobox()

  #$('#login_dialog').dialog
  #  autoOpen:false,
  #  resizable:false,
  #  title:"用户登录"

  $('#login_button').click ->
    login()
    #$('#login_dialog').dialog 'open'
  #$('#login').submit ->
  #  if @node.value and @domain.value and @password.value
  #    login(@node.value, @password.value, @domain.value)
  #  $('#login_dialog').dialog 'close'
  #  false
  $('#logout_button').click ->
    logout()


  setRosterHeight();
  $(window).resize(setRosterHeight);

  $.getJSON '/announcements.json', (data)->
    if data.length
      for announcement in data
        $('<li />').append($('<a />',
          href: announcement.url
          target: '_blank'
          text: announcement.title
        )).appendTo $('#announcements')

      announcement_scroll = (obj)->
        $('#announcements_wrapper').find("ul:first").animate
          marginTop:"-25px"
        ,500,->
          $(this).css({marginTop:"0px"}).find("li:first").appendTo(this)
      announcement_scrolling = setInterval(announcement_scroll, 5000)
      $('#announcements li').mouseenter ->
        clearInterval(announcement_scrolling)
        announcement_scrolling = null
      $('#announcements li').mouseleave ->
        announcement_scrolling = setInterval(announcement_scroll, 5000) if !announcement_scrolling

  rooms = new Rooms(el: $('#rooms'))
  servers = new Servers(el: $('#servers'))
  $('#rooms').html '正在读取服务器列表...'
  Server.fetch()






