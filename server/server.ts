import path from "path";

const app = require('express')();
const server = require('http').createServer(app);
const io = require('socket.io')(server);
const port = process.env.PORT || 8080;
import {Socket} from "socket.io"
import {Request,Response} from "express";


io.on("connection",(socket:Socket)=>{

    console.log(Socket);
    
    

})

app.get('/', function(req:Request, res:Response) {

  return res.sendfile(path.resolve("client","index.html"));
  
});

server.listen(port, function() {
  console.log(`Listening on port ${port}`);
});