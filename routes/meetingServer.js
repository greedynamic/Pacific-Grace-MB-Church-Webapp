const express = require('express');
const app = express();
const router = express.Router();
const server = require('http').Server(app);
const io = require('socket.io')(server);
const path = require('path');
const { v4: uuidV4 } = require('uuid');
const { ExpressPeerServer } = require('peer');
const peerServer = ExpressPeerServer(server, {
    debug: true
});

router.use(express.static(path.join(__dirname, '../public')));
router.use('/peerjs', peerServer);

router.get('/', (req,res) => {
    res.render('pages/meeting');

})

router.get('/room', (req,res) => {
    res.redirect(`/meeting/room/${uuidV4()}`); // unique url
})

router.get('/room/:room', (req,res) => {
    res.render('pages/room', {roomId: req.params.room});
})

io.on('connection', socket => {
    socket.on('join-room', (roomId, userId) => {
        socket.join(roomId);
        socket.to(roomId).emit('user-connected', userId);
        socket.on('disconnect', () => {
            socket.to(roomId).emit('user-disconnected', userId);
        })
    })
})

module.exports = router;