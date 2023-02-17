import path from "path";

import uuid from "uuid"
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

interface ISocketToUserWithMessage extends ISocketToUser
{
  
    room_id:string,
    user_name:string
    socket_id:string,
    message:string
}

interface IMessages
{
  [key:string ] // room_id
  :
  {
    messages:string[]
  }
}


const rooms: string[] = []

const user_names: string[] = []

const messages = {} as IMessages


io.on("connection",(socket:Socket)=>{

  socket.on('join', async function(socketInfo: ISocketToUser) {  

      socket.join(socketInfo.socket_id) // create a connection to only socket IO
      
  })

  socket.on('join_room', async function(socketInfo: ISocketToUser) {  

    socket.join(socketInfo.room_id)

    socket.emit("room_joined",socketInfo.room_id)

    socket.to(socketInfo.room_id).emit("user_entered",socketInfo)
    
})

  socket.on('create_room', async function(socketInfo: ISocketToUser) {  
   
    do{
      socketInfo.room_id = uuid.v4(); // generate room id that is not yet created
    }while(rooms.find(o =>(
      o !== socketInfo.room_id
    )));

    rooms.push(socketInfo.room_id);

    socket.join(socketInfo.room_id)

    socket.emit("room_joined",socketInfo.room_id)

    socket.to(socketInfo.room_id).emit("user_entered",socketInfo)
    
  })

  socket.on("load_messages", async function(socketInfo: ISocketToUser){

    socket.to(socketInfo.socket_id).emit("messages", messages[socketInfo.room_id]) // emit load messages to only user

  })

  socket.on("message_sent", async function(socketInfo: ISocketToUserWithMessage){

    messages[socketInfo.room_id].messages.push(socketInfo.message)

    socket.to(socketInfo.room_id).emit("message_received")
    
  })



})

app.get('/', function(req:Request, res:Response) {

  return res.sendfile(path.resolve("client","index.html"));
  
});

server.listen(port, function() {
  console.log(`Listening on port ${port}`);
});