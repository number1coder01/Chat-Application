// CLIENT SIDE SCRIPT
// voh script joh html mei likhi
// usko use karne liye(client side)
const socket = io() //to send and recieve events from both server & client

//aise represent karte hai 
const $messageForm = document.querySelector('#message-form')
const $messageFormInput = $messageForm.querySelector('input')
const $messageFormButton = $messageForm.querySelector('button')
const $sendLocationButton = document.querySelector('#send-location')
const $messages = document.querySelector('#messages')

//Templates 
const messageTemplate  = document.querySelector('#message-template').innerHTML
const locationMessageTemplate = document.querySelector('#location-message-template').innerHTML
const sidebarTemplate = document.querySelector('#sidebar-template').innerHTML

const autoscroll = () => {
    //auto scroll to the latest only if we are already at the botoom 
    //if viewing older msgs we wont get scrolled to the bottom
    // New message element
    const $newMessage = $messages.lastElementChild

    //Height of the new message
    const newMessagesStyles = getComputedStyle($newMessage)
    // because offsetHeight doesnt take in account the margin value 
    const newMessagesMargin = parseInt(newMessagesStyles.marginBottom)
    const newMessagesHeight = $newMessage.offsetHeight + newMessagesMargin

    //Visible Height 
    const visibleHeight = $messages.offsetHeight //fixed 

    //Height of the message container
    const containerHeight = $messages.scrollHeight // total scrollable height 

    //How far have i scrolled already 
    const scrollOffset = $messages.scrollTop // number from the top (scroll bar mei value )
                        + visibleHeight 
    
    if(containerHeight - newMessagesHeight <= scrollOffset){
        $messages.scrollTop = $messages.scrollHeight
    }
}

socket.on('message',(message)=>{  //template se aaya yeh 
    console.log(message)
    //RENDERING 
    const html = Mustache.render(messageTemplate,{
        username : message.username ,
        message : message.text ,
        createdAt : moment(message.createdAt).format('h:mm a')
    })
    $messages.insertAdjacentHTML('beforeend',html)
    autoscroll()
})

// Options 
const { username , room } = Qs.parse(location.search , {ignoreQueryPrefix : true}) //? ignore karne ke liye

socket.on('locationMessage',(location)=>{
    console.log(location)
    const html = Mustache.render(locationMessageTemplate,{
        username : location.username ,
        url : location.url , 
        createdAt : moment(location.createdAt).format('h:mm a')
    })
    $messages.insertAdjacentHTML('beforeend',html)
    autoscroll()
})


socket.on('roomData' , ({room , users}) =>{
    const html = Mustache.render(sidebarTemplate , {
        room , 
        users
    })
    document.querySelector('#sidebar').innerHTML = html
})
// emit -> send from server to client | on -> client recieve from server 
// name of the event must be same as the one emitted callback mei (msg) also works

$messageForm.addEventListener('submit',(e)=>{
    e.preventDefault() // prevent default reload upon submitting 
    // e --> input ---> input ke elements --> message 
    // naam ka input ---> uski value disable the 
    // submit button (button par click karne se kuch nahi hoga)
    $messageFormButton.setAttribute('disabled','disabled')
    
    // target -> kispar event listener laga rahe(form) , now form -> elements -> .....
    const msg = e.target.elements.message.value

    // client to server sendingMessage
    socket.emit('sendMessage',msg, (error)=>{
        //re-enable after msg sent taaki ek time par ek hi
        $messageFormButton.removeAttribute('disabled') 
        $messageFormInput.value = '' //pichle wala input clear kardo
        $messageFormInput.focus() //cursor vaapis start par aa jaaye ab

        if(error){
            return console.log(error)
        }    
        console.log('The messsage was delivered')
    })
})

$sendLocationButton.addEventListener('click',()=>{
    if(!navigator.geolocation){
        return alert('Geolocation is not supported by your browser')
    }

    $sendLocationButton.setAttribute('disabled','disabled')
    
    navigator.geolocation.getCurrentPosition((position)=>{
        socket.emit('sendLocation',{
            latitude: position.coords.latitude,
            longitude: position.coords.longitude
        },(acknowledgement_msg)=>{
            $sendLocationButton.removeAttribute('disabled')
            console.log(acknowledgement_msg)
        })
    })
})

socket.emit('join', { username , room } , (error) =>{
    if(error) {
        alert(error)
        location.href = '/'
    }
})
