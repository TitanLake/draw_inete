import path from "path";

import { uuid } from 'uuidv4';
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


const user_names= []
const messages: IMessage[] = [] 


io.on("connection",(socket:Socket)=>{


  socket.on("load_messages", async function(socketInfo: ISocketToUser){
    console.log("loadinmessages");

    socket.emit("messages_load", messages) // emit load messages to only user

  })

  socket.on("message_sent", async function(socketInfo: ISocketToUserWithMessage){

    messages.push({
      message:socketInfo.message,
      username:socketInfo.user_name
    })
   
    socket.emit("message_received")
    
  })


})

app.get('/', function(req:Request, res:Response) {

  return res.sendfile(path.resolve("client","index.html"));
  
});

server.listen(port, function() {
  console.log(`Listening on port ${port}`);
});