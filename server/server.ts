import path from "path";

import { v4 as uuid } from 'uuid';
const app = require('express')();
import express from "express";
const server = require('http').createServer(app);
const io = require('socket.io')(server);
const port = process.env.PORT || 8080;
import {Socket} from "socket.io"
import {Request,Response} from "express";

var htmlPath = path.resolve("client");
app.use(express.static(htmlPath));



interface ISocketToUser
{
  
    room_id:string,
    user_name:string
    socket_id:string
}

interface IMessage{
  username:string
  message:string
}

interface ISocketToUserWithMessage extends ISocketToUser
{
  
    user_name:string
    socket_id:string,
    message:string
}

interface IUser{
  socketId:string,
  userName :string
}

let words = [
  "INETE",
  "programação",
  "base de dados",
  "computador",
  "teclado",
  "java",
  "python",
  "ruby",
  "php",
  "inteligencia artificial",
  "microsoft",
  "google",
  "go",
  "android"
]

let users:IUser[] = []
const messages: IMessage[] = [] 
let generatedWord = ""

io.on("connection",(socket:Socket)=>{

 
  

  socket.on("load_messages", async function(socketInfo: ISocketToUser){
    

    io.emit("messages_load", messages) // emit load messages to only user

  })

  socket.on("message_sent", async function(socketInfo: ISocketToUserWithMessage){

    messages.push({
      message:socketInfo.message,
      username:socketInfo.user_name
    })
   
    io.emit("message_received")
    
  })

  socket.on("startDrawClient",(data)=>{
    io.emit("startDrawServer", data)
  })

  socket.on("drawingClient",(data)=>{
    io.emit("drawingServer",data)
  })

  socket.on("clearCanvaClient",()=>{

    socket.broadcast.emit("clearCanvaServer")
    socket.emit("clearCanvaServer")
  })

  socket.on("changeToolClient",(btnId)=>{
    
    socket.broadcast.emit("changeToolServer", btnId)
    socket.emit("changeToolServer", btnId)
  })

  socket.on("mouseUpClient",()=>{

    io.emit("mouseUpServer")
  
  })

  socket.on("playerConnectedClient",(socketData:any)=>{

    if(socketData.userName  != "")
    {

     
    
      users.push({
        userName:socketData.userName,
        socketId:socket.id
      })

     
      
    }

    socket.broadcast.emit("playerConnectedServer", users)
    socket.emit("playerConnectedServer", users)
  })


  // game started

  socket.on("gameStartedClick",()=>{
    socket.broadcast.emit("gameStartedClick")
  })

  socket.on("gameStarted",(socketData)=>{

    if(generatedWord == ""){
      generatedWord = words[5]

      io.emit("generatedWord", generatedWord)

    }

  })

 
  socket.on("playerJoinedClient",(socketData:any)=>{

    if(socketData.userName  != "")
    {
      users.push({
        userName:socketData.userName,
        socketId:socket.id
      })
    }


    socket.broadcast.emit("playerJoinedServer", users)
    socket.emit("playerJoinedServer", users)

  })
  socket.on("disconnect",(socketData)=>{
   
    const user = users.find(u => u.socketId == socket.id)

    console.log(user)

    let users2:IUser[] = []

    users.map((u)=>{
      if(u.userName !== user?.userName)
        users2.push(u)
    })

    users = users2

    socket.broadcast.emit('user_disconnect',{
      userName:user?.userName,
      socketId:user?.socketId 
    });

  })

})

app.get('/', function(req:Request, res:Response) {

  return res.sendfile(path.resolve("client","index.html"));
  
});

server.listen(port, function() {
  console.log(`Listening on port ${port}`);
});


/*

TO DO

  fluxo do jogo

  eventos
  - userJoinedClient
    -userJoinedServer responde todos os users na sala

  - startGame
    - gameStarted avisa que o jogo comecou

  escolher um user para receber a palavra
    userChosen
    e escerever no chat

  - generatedWord = user recebe a palavra e desenha ( ele escolhe quando acaba )

  - userNoChosen
    
    verificar o chat, quando alguem acertar emit evento acertou para o user que acertou 

    escolher outro user

*/

//fill colour bugado nao desliga nos outros utilizadores quando um deles desenhou e depois desligou
//players quando se conectam um deles duplica na tabela, why?
//