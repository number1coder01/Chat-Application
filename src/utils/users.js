const users = [] 

// addUser , removeUser , getUser , get UsersInRoom 

// id --> indvi. socket ki id  
const addUser = ({id , username , room}) => {
    // Clean the data 
    username = username.trim().toLowerCase() 
    room = room.trim().toLowerCase() 

    // Validate the data
    if(!username || !room){
        return {
            error : "Username & room required!"
        }
    }

    // Check fro existing user 
    const existingUser = users.find((user) => {
        return user.room === room && user.username === username 
    })

    // Validate username 
    if(existingUser) return {
        error : "Username already exists!"
    }

    // Store User 
    const user = { id , username , room }
    users.push(user) 
    return{ user }
}

const removeUser = (id) => {
    const idx = users.findIndex( (user) => user.id === id )

    if(idx !== -1){
        return users.splice(idx , 1)[0] // to remove an element by their index
        // splice returns an array  
    }
}

const getUser = (id) => {
    return users.find((user) => user.id === id)
}

const getUsersInRoom = (room) => {
    return users.filter((user) => user.room === room)
}

module.exports = {
    addUser , 
    removeUser ,
    getUser , 
    getUsersInRoom
}