import { Socket, ServerOptions } from 'socket.io'; // types

$(() => {
  // create main socket ie. not logged in
  const mainSocket = createSocket('/');
  let userSocket = mainSocket;
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

    if (userSocket) userSocket.disconnect();
    userSocket = connect({ username });
  });

  $('#header .disconnect button').on('click', () => {
    if (!userSocket) return;
    disconnect(userSocket);
    userSocket = mainSocket;
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
});

// = helpers =
// @ts-ignore // visual bug - this line breaks compiler because it can't find 'io' from window even though it's there
const createSocket = (url: string, options?: ServerOptions): Server => io(options);

// = functions =
const connect = (data: { username: string }) => {
  const socket = createSocket('/users');

  socket.on('connect', () => {
    socket.emit('login', data, (e: Error | null, message: string) => {
      if (e) return console.error(e);
      updateHeader(`Hello, ${message}!`);
    });
  });

  socket.on('announce', (data: string) => {
    const $li = document.createElement('li');
    $li.appendChild(document.createTextNode(data));
    $li.classList.add('collection-item');
    $('#footer .announce > ul').prepend($li);
  });

  socket.on('alert', (data: string) => {
    const $div = document.createElement('div');
    $div.appendChild(document.createTextNode(data));
    $('#header .alert > ul').html($div);
  });

  socket.on('outgoing', (data: string) => {
    const $li = document.createElement('li');
    $li.appendChild(document.createTextNode(data));
    $li.classList.add('collection-item', 'cyan-text', 'text-ligten-1', 'right-align')
    $('#main .chat .chatbox ul').append($li);
  });

  socket.on('incoming', (data: string) => {
    const $li = document.createElement('li');
    $li.appendChild(document.createTextNode(data));
    $li.classList.add('collection-item', 'cyan-text', 'text-ligten-4')
    $('#main .chat .chatbox ul').append($li);
  });

  socket.on('userlist', (data: User[]) => {
    const users = data.map((user) => {
      const $li = document.createElement('li');
      $li.appendChild(document.createTextNode(user.username));
      $li.classList.add('collection-item', 'cyan-text', 'text-ligten-4');
      return $li;
    });

    console.log('new users', users);
    $('#main #side-panel .userlist ul').append(...users);
  });

  return socket;
};

const disconnect = (socket: Socket) => {
  console.log('Disconnected from server\n');
  socket.disconnect();
};


const updateHeader = (text: string) => {
  $('#header header > :first-child').html(document.createTextNode(text));
};