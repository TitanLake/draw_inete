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
  userName :string,
  score: number;
}

let words = [
  "Base de dados",
  "Computador",
  "Teclado",
  "Inteligencia artificial",
  "Microsoft",
  "Google",
  "Android",
  "Computador gamer",
  "Câmara de segurança",
  "Smartphone",
  "Cafeteira",
  "Laptop",
  "Nuvem de dados",
  "Robô de limpeza",
  "Impressora 3D",
  "Drone",
  "Instagram",
  "Facebook",
  "TikTok",
  "Escola",
  "Faculdade",
  "Máquina de lavar roupa",
  "Headset",
  "Tablet",
  "Smartwatch",
  "Carregador portátil",
  "Projetor",
  "Caixa de som bluetooth",
  "Consola de videojogos",
  "Câmara",
  "Fones de ouvido sem fio",
  "Mouse gamer",
  "Teclado mecânico",
  "Monitor",
  "Cadeira gamer",
  "TV",
  "Scanner",
  "Roteador Wi-Fi",
  "Câmera fotográfica",
  "Smart home",
  "Caixa de ferramentas",
  "Bicicleta elétrica",
  "Mochila anti-furto",
  "Mala de viagem com rodinhas",
  "Garrafa térmica",
  "Guarda-chuva dobrável",
  "Caneca térmica",
  "Óculos de realidade virtual",
  "Cadeado",
  "Máquina de costura",
  "Piano",
  "Maquilhagem",
  "Relógio de pulso",
  "Auriculares bluetooth",
  "Lâmpada",
  "Carregador wireless",
  "USB",
  "Kit de ferramentas para celular",
  "Balança digital",
  "Powerbank",
  "Gilete",
  "Purificador de ar",
  "Câmera",
  "Colchão",
  "Câmera de monitoramento de bebês",
  "Barbeador elétrico",
  "Relógio inteligente",
  "Caixa de som portátil",
  "Smart tag",
  "Carregador de bateria para o carro",
  "Serra elétrica",
  "Aquecedor portátil",
  "Ventilador de mesa",
  "Lixeira inteligente",
  "Termómetro",
  "Escova de dentes elétrica",
  "Fogão elétrico",
  "Ferro de passar roupas",
  "Torradeira",
  "Aspirador de pó robô",
  "Churrasqueira elétrica",
  "Frigorífico",
  "Elefante",
  "Girafa",
  "Leão",
  "Tigre",
  "Urso",
  "Zebra",
  "Cavalo",
  "Cão",
  "Gato",
  "Papagaio",
  "Águia",
  "Tartaruga",
  "Cobra",
  "Tubarão",
  "Golfinho",
  "Baleia",
  "Caranguejo",
  "Polvo",
  "Esquilo",
  "Raposa",
  "Coelho",
  "Camelo",
  "Canguru",
  "Pinguim",
  
]

let users:IUser[] = []
const messages: IMessage[] = [] 
let drawingPlayer = '';
let generaTedWord = ""

function clearTurn(){
  drawingPlayer = ""
  generaTedWord = ""
    messages.push({
      username: "JC BOT",
      message: `ended turn`,
    });

    io.emit("messages_load", messages)

    io.emit("clearCanvaServer")
    io.emit("ended_turn")
    io.emit("openChat")

}

io.on("connection",(socket:Socket)=>{


    // incrementa a pontuação do utilizador com o nome de utilizador especificado
  function addPoints(username: string, points: number) {
    const user = users.find((u) => u.userName === username);
    if (user) {
      user.score += points;
    }
  }


  
  socket.on("load_messages", async function(socketInfo: ISocketToUser){
    
    io.emit("messages_load", messages) // emit load messages to only user

  })

  socket.on("message_sent", async function(socketInfo: ISocketToUserWithMessage){

  
    //if(drawingPlayer !== "" && generaTedWord !== "") // game is running
    {
      if(generaTedWord.toLowerCase().trim().includes(socketInfo.message.toLowerCase().trim()) && socketInfo.message.length > 2)
      {
        
        const user = users.find((u) => u.userName === socketInfo.user_name);

        if(user)
        {

          addPoints(user.userName, socketInfo.message.length)

          messages.push({
            username: "JC BOT",
            message: `NICE ${user.userName}!🎉 - ${user.score} points`,
          });
          io.emit("message_received")
          io.to(socket.id).emit("closeChat")

          //bloquear o chat?
        }
      }
      else
      {
          //mandar msg palavra incorreta
          messages.push({
              username: "JC BOT",
              message: `WRONG 😢`,
          });

            io.emit("message_received")
      }

        return
    }

    messages.push({
      message:socketInfo.message,
      username:socketInfo.user_name
    })

    io.emit("message_received")

  })

  socket.on("fillColorCheckedChanged",()=>{
    socket.broadcast.emit("fillColorCheckedChanged")
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

  socket.on("colorChanged",(color)=>{

    socket.broadcast.emit("colorChanged",color)

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
        socketId:socket.id,
        score:0
      })
    }

    io.emit("playerConnectedServer", users)

    console.log("logged users:");
    console.log(users)

  })




  socket.on("start_game", ({ user_name }) => {

    // Only allow the first player who started the game to draw
    if (drawingPlayer === "") {
      console.log('game Started');
      drawingPlayer = socket.id;

      messages.push({
        username: "JC BOT",
        message: `${user_name} started the game. Only they can draw.`,
      });
      io.emit("messages_load", messages) // emit load messages to only user
    
      socket.broadcast.emit("game_started", { 
        userName:user_name,
        socketId:socket.id
      });

      const randomIndex = Math.floor(Math.random() * words.length);

      // select the string at the random index
      const randomWord = words[randomIndex];

      generaTedWord = randomWord

      io.to(drawingPlayer).emit("drawing_allowed",{
        word:randomWord
      });
    }
  });

  socket.on("end_turn",()=>{

    clearTurn()

    io.to(socket.id).emit("user_ended_turn")

  })


  socket.on("usernameCheck",()=>{
    io.to(socket.id).emit("usernameCheckServer",users)
  })
 
  socket.on("playerJoinedClient",(socketData:any)=>{

    if(socketData.userName  != "")
    {
      users.push({
        userName:socketData.userName,
        socketId:socket.id,
        score:0
      })
    }

    io.emit("playerJoinedServer", users)

  })


  socket.on("disconnect",(socketData)=>{
   
    let user = users.find(u => u.socketId == socket.id)
    
    if(user){
      user = {...user,score:0}
    }

    let users2:IUser[] = []

    users.map((u)=>{
      if(u.userName !== user?.userName)
        users2.push(u)
    })

    if(drawingPlayer === socket.id)
    {
      clearTurn()
    }

    users = users2

    console.log("users saida:");
    
    io.emit("playerDisconnectedServer",users)

    console.log(users)

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

- desabilitar o cht de quem desenha
- desabilitar chat quando acerta
- end game depois que todos jogaram
- ao acertarem ele ganha os pontos da pessoa
- comndo reset no chat caso preciso

*/

