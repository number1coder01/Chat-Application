const path=require('path')
const http=require('http')
const express=require('express')
const socketio=require('socket.io')

//configure express(instance of express)
const app = express()
//yeh express khud karta hai background mei 
const server=http.createServer(app)
//refractoring isliye kari thi kyuki socketio 
//function expects a server to work with   
const io=socketio(server)

const port=process.env.port || 3000

//__dirname --> current directory name (absolute path)
const publicDirectoryPath = path.join(__dirname,'../public')

app.use(express.static(publicDirectoryPath))

let count = 0
//name of the event & what to do when event occurs
//yaha par connection-->will get fired whenever new connection 
//socket --> object that contains information
io.on('connection',(socket)=>{
    console.log('New Websocket connection.')
    //socket.emit will send count to that particular client
    //io.emit will send to all ek saath 
    socket.emit('countUpdated',count) //send an event to that client
    //callback se jaa raha count 
    socket.on('increment',()=>{
        count++
        // socket.emit('countUpdated',count)
        io.emit('countUpdated',count) //every single connection par jayega change
    })
})
server.listen(port, ()=>{
    console.log(`Server is up on ${port} !`)
})
//client wali file ka 
//receive karne ke liye (on accept karta event occur hone par event ke)
socket.on('countUpdated',(count)=>{
    console.log('The count has been updated.',count)
})

document.querySelector('#increment').
addEventListener('click',()=>{
    console.log('Clicked')
    socket.emit('increment') //sending from the client to server 
    //emit needs the name for an event 
})