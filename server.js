const next = require('next')
const socketIO = require('socket.io')
const { createServer } = require('http')

const dev = process.env.NODE_ENV !== 'production'
const hostname = 'localhost'
const port = 3000

const app = next({ dev, hostname, port })
app.prepare().then(() => {
    const server = createServer(app.getRequestHandler())

    const io = socketIO(server)

    io.on('connection', (socket) => {
        console.log('a user connected ' + socket.id)

        socket.on('battery_status', (data) => {
            socket.emit('battery_status', data)
        })

        socket.on('disconnect', () => {
            console.log('user disconnected')
        })
    })

    server.listen(port, () => {
        console.log(`server listening on port ${port}`)
    })
})