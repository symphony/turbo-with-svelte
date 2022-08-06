import { Socket, ServerOptions } from 'socket.io'; // types

$(() => {
  // Initialize materialize-css
  // @ts-ignore // false positive
  // M.AutoInit();

  // create main socket ie. not logged in
  let mainSocket = createSocket('anon');
  let userSocket: Socket | null = null;
  const $login = $('#header .login');

  // = events =
  $login.find('.connect').on('submit', (e) => {
    e.preventDefault();
    const $this = $(e.currentTarget);
    const $input = $this.find('input');
    const username = $input?.val()?.toString().trim();

    // form validation
    if (!username) return;
    $input.val('');

    if (userSocket) {
      mainSocket = createSocket('anon'); // todo: better way of handling anon connection. should always be open
      userSocket.disconnect();
    }
    mainSocket.disconnect();
    mainSocket = null;
    userSocket = connect({ username });
  });

  $('#header .disconnect button').on('click', (e) => {
    e.preventDefault();
    if (!userSocket) return;
    userSocket.disconnect();
    userSocket = null;
    mainSocket = createSocket('anon'); // todo: better way of handling anon connection. should always be open
    listenGlobal(mainSocket);
    updateHeader('Please Login');
  });

  $('#main .chat form').on('submit', (e) => {
    e.preventDefault();
    const $this = $(e.currentTarget);
    const $input = $this.find('textarea');
    const message = $input?.val()?.toString().trim();

    // form validation
    if (!userSocket || !message) return;

    $input.val('');
    userSocket.emit('send', message);
  });

  // = anon listeners =
  listenGlobal(mainSocket);
});

// = helpers =
// @ts-ignore // false positive error - this line breaks compiler because it can't find 'io' from window even though it's there
const createSocket = (url?: string, options?: ServerOptions): Server => io(options);
const updateHeader = (text: string) => {
  $('#header header > :first-child').html(document.createTextNode(text));
};

// = main listener =
const connect = (data: { username: string }) => {
  const socket = createSocket('/users');

  socket.on('connect', () => {
    socket.emit('login', data, (e: Error | null, message: string) => {
      if (e) return console.error(e.message);
      updateHeader(message);
    });
  });

  // user listener
  listenGlobal(socket);
  return socket;
};

const listenGlobal = (socket: Socket) => {
  // render server announcements
  socket.on('announce', (data: string) => {
    const $li = document.createElement('li');
    $li.appendChild(document.createTextNode(data));
    $li.classList.add('collection-item', 'black-text');
    $('#footer .announce > ul').prepend($li);
  });

  // render personal alerts
  socket.on('alert', (data: string) => {
    const $div = document.createElement('div');
    $div.appendChild(document.createTextNode(data));
    $('#header .alert > ul').html($div);
  });

  // render incoming messages
  socket.on('incoming', (data: string) => {
    const $li = document.createElement('li');
    $li.appendChild(document.createTextNode(data));
    $li.classList.add('collection-item', 'cyan-text', 'text-ligten-4');
    $('#main .chat .chatbox ul').append($li);
  });

  // render outgoing message
  socket.on('outgoing', (data: string) => {
    const $li = document.createElement('li');
    $li.appendChild(document.createTextNode(data));
    $li.classList.add('collection-item', 'cyan-text', 'text-ligten-1', 'right-align')
    $('#main .chat .chatbox ul').append($li);
  });

  // refresh userlist
  socket.on('userlist', (data: { [users: string]: User[]; }) => {
    const users = data.users.map((user) => {
      const $li = document.createElement('li');
      $li.appendChild(document.createTextNode(user.username));
      $li.classList.add('collection-item', 'blue-grey-text', 'text-darken-4');
      return $li;
    });

    $('#main #side-panel .userlist ul').html('').append(...users);
  });

}

