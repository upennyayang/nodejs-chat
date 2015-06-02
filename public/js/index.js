let $ = require('jquery')

let io = require('socket.io-client')
let socket = io('')

//ESNext in the browser
socket.on('connect', () => console.log('connected'))

// Enable the form now that our code has loaded
$('#send').removeAttr('disabled')

let $template = $('#template')

// Add a message from the server
socket.on('im', ({username, msg}) => {
    let $li = $template.clone().show()
    $li.children('i').text(username + ': ')
    $li.children('span').text(msg)
    $('#messages').append($li)
    console.log(msg)
})

// Send msg to server when pressing enter
$('form').submit(() => {
    socket.emit('im', $('#m').val())
    $('#m').val('')
    return false
})





