 qs = require("querystring")
const express = require("express")
const app = express()
const cors = require('cors')
const assert = require("assert")
const path = require("path")
// ===========Socket Setup============
const http = require("https")
const socketio = require("socket.io")
const server = http.createServer(app)
const io = socketio(server)
const chatRoutes = require("./src/chat/chatRoutes")
app.use(chatRoutes)
// ==================================
const mongoose = require("mongoose")
const morgan = require("morgan")
const dotenv = require('dotenv').config({ path: path.resolve(__dirname, './.env') })
const bodyParser = require("body-parser")
app.set("views", __dirname + "/src/views")
app.engine("html", require("ejs").renderFile)
app.set("view engine", "html")
app.use(cors())
app.use(bodyParser.json())
app.use(bodyParser.urlencoded({ extended: true }))
app.use(morgan("dev"))

app.use(function (req, res, next) {
  res.header("Access-Control-Allow-Origin", "*")
  res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept")
  next()
})

mongoose
  .connect("mongodb://127.0.0.1:27042/my_irc", { useNewUrlParser: true, useUnifiedTopology: true })
  .then(() => console.log("DB Connected"))
  .catch((err) => console.log("DB CONNECTION FAIL :", err))

// app.get("/", (request, res) => {
//   res.send(`Welcome to my NODEMON API in delevelopment mode ! Hostname is ${hostname}`)
//   if (process.env.NODE_ENV === "development") {
//     // res.send(`Welcome to my NODEMON API in delevelopment mode ! Hostname is ${hostname}`)
//   }
// })

io.on('connect', (socket) => {
  console.log('User is connected')

  socket.on('disconnect', () => {
    console.log('User has left chat room')
  })
})



server.listen(process.env.PORT, process.env.HOSTNAME, () => {
  console.log(`Running on port ${process.env.PORT} - ${process.env.NODE_ENV}`)
})
