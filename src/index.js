const path = require('path')
const express = require('express')
const socketio = require('socket.io')
const Filter = require('bad-words')
const app = express()

// sockets require this refactoring (express does it on its own anyway)
const http = require('http')
const { generateMessage , generateLocationMessage} = require('./utils/messages')
const server=http.createServer(app)  
const { addUser , removeUser , getUser , getUsersInRoom } = require("./utils/users")
const io=socketio(server) // instance of socket.io

const port=process.env.PORT || 3000

const publicDirectoryPath = path.join(__dirname,'../public')

app.use(express.static(publicDirectoryPath))

// built-in event to establish connection
// server side : a new client connects to the server  
io.on('connection',(socket)=>{  //socket is that particular connection in whole io
    // for client side -> go to html & include script  
    
    console.log('New Websocket connection.')

    //event sent only btw this connection (must be recieved by the client to display)
    // socket.emit('message', generateMessage('Welcome!')) //server to client data transfer -> event name , what to send
    // // send to everyone except the current client  
    // socket.broadcast.emit('message',generateMessage('A new user has joined!'))

    socket.on('join' , ({ username , room  } , callback) =>{
        const { error , user } = addUser({
            id : socket.id , //connection id 
            username , 
            room 
        })
         
        if(error) {
            return callback(error) //acknowledgement  
        }

        //emitting events to everyone just in that room(limited)
        socket.join(user.room) //voh part. room join karne dega yeh
        //io.to().emit && socket.to().emit -> room mei joh unhe hi 
        socket.emit('message', generateMessage(`Welcome ${user.username}!!`))
        socket.broadcast.to(user.room).emit('message',generateMessage(`${user.username} just joined!`))
        io.to(user.room).emit('roomData' , {
            room : user.room , 
            users : getUsersInRoom(user.room)
        })

        callback()
    })

    // client se server (server recieving an event)
    socket.on('sendMessage',( msg , callback )=>{
         
        const filter = new Filter()
        if(filter.isProfane(msg)){
            return callback('Profanity is not allowed!')
        }
        // io -> to everyone | emit -> everyone  
        const user = getUser(socket.id)
        if(user){ 
            io.to(user.room).emit('message', generateMessage(user.username , msg))
            callback() //'successfully!' likh dete to acknoweledgment of the event client ke paas jata
        }
    })
        
    socket.on('sendLocation',(coords,callback)=>{
        const user = getUser(socket.id)
        if(user){
            io.to(user.room).emit('locationMessage',generateLocationMessage(user.username , `https://google.com/maps?q=${coords.latitude},${coords.longitude}`))
            callback('Location shared!')
        }
    })

    //built in event(name yahi rakhna hai)
    socket.on('disconnect',()=>{
        const user = removeUser(socket.id)
        
        if(user) {
            io.to(user.room).emit('message',generateMessage(`${user.username} has left!`))
            io.to(user.room).emit('roomData' , {
                room : user.room , 
                users : getUsersInRoom(user.room)
            })
        }
    })
}) 

server.listen(port, ()=>{
    console.log(`Server is up on ${port} !`)
})