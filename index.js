const express = require('express')
const cors = require('cors')
const mongoose = require('mongoose')
const authRoutes = require("./Routes/auth");
const messageRoutes = require("./Routes/messages");
const socket = require("socket.io");

const app = express()

require('dotenv').config()
app.use(cors())
app.use(express.json())

const connectDB = async()=>{
    try{
        await mongoose.connect(process.env.MONGO_URI,{
        useNewUrlParser: true,
        useUnifiedTopology: true
    })
    }
    catch(err){
        console.log(err)
    }   
}

connectDB()


mongoose.connection.once('open',()=>{
    console.log('Connected to MongoDB')
    
})

const server = app.listen(process.env.PORT, () => {
  console.log(`Server is running on Port ${process.env.PORT}`);
 });

app.use("/api/auth", authRoutes);
app.use("/api/messages", messageRoutes);


const io = socket(server, {
    cors: {
      origin: process.env.ORIGIN,
      credentials: true,
    },
  });
  
  global.onlineUsers = new Map();
  io.on("connection", (socket) => {
    global.chatSocket = socket;
    socket.on("add-user", (userId) => {
      onlineUsers.set(userId, socket.id);
    });
  
    socket.on("send-msg", (data) => {
      const sendUserSocket = onlineUsers.get(data.to);
      if (sendUserSocket) {
        socket.to(sendUserSocket).emit("msg-recieve", data.msg);
      }
    });
  });