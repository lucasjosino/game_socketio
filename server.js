var app = require('express')();
// passa o express para o http-server
var http = require('http').Server(app);
// passa o http-server par ao socketio
var socket = require('socket.io')(http);

var position = {
  x1: 0,
  y1: 200,
  x2: 685,
  y2: 200,
  x: 5,
  y: 20
}

var positionBallFlag = {
  x: true,
  y: true
}

// ROTA PARA FORNECER O INDEX ------------------
app.get('/', function(req, res){
  res.sendFile(__dirname + '/index.html');
});

// SOCKET.IO LISTENERS E EMITTERS --------------
socket.on('connection', async function(socketClient){

  socketClient.join('room_player');
  const clientsInRoom = await socket.in('room_player').allSockets()

  if(clientsInRoom.size > 1){
    socketClient.emit('room',2);
  }
  else{
    socketClient.emit('room',1);
  }

  socketClient.on('set_position', function(newPosition){
    position.x1 += newPosition.x1 || 0;
    position.x2 += newPosition.x2 || 0;
    position.y1 += newPosition.y1 || 0;
    position.y2 += newPosition.y2 || 0;
  });

});

// FUNCOES GERAIS ------------------------------
function updatePosition(){

  if (position.x >= 700){
    if (!(position.y >= position.y2 && position.y <= position.y2 + 150)){
      socket.emit('gameOver',2);
    }
    positionBallFlag.x = false;
  }
  if (position.x <= 0){
    if (!(position.y >= position.y1 && position.y <= position.y1 + 150)){
      socket.emit('gameOver',1);
    }
    positionBallFlag.x = true;
  }
  if (position.y >= 500){
    positionBallFlag.y = false;
  }
  if (position.y <= 0){
    positionBallFlag.y = true;
  }

  if (positionBallFlag.x)
    position.x += 5;
  else
    position.x -= 5;
    
  if (positionBallFlag.y)
    position.y += 5;
  else
    position.y -= 5;
  // if (positionBallFlag.y)
  //   position.y += 0.0001;
  // else
  //   position.y -= 0.0001;

  socket.emit('updatePosition', position);
}
setInterval(updatePosition, 10);

// SERVIDOR ------------------------------------
http.listen(4321, function(){
  console.log('Servidor rodando em: http://localhost:4321');
});