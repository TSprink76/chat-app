import http from 'http';
import fs from 'fs';
import { WebSocketServer, WebSocket } from 'ws';

const PORT = 3001;


const server = http.createServer((req, res) => {
    fs.readFile("./public/index.html", (err, data) => {
        if(err){
            res.writeHead(500)
            res.end(`Error: ${err}`)
        }
        res.writeHead(200, {"Content-Type": "text/html"})
        res.end(data)
    })
})

const wss = new WebSocketServer({server})

wss.on("connection", (socket, req) => {
    const username = new URL(req.url, "http://locahost").searchParams.get(
        "username"
    )
    const message = {
                "type": "system",
                "text": `${username} joined}`
            }

    for(const client of wss.clients){
        
        if(client.readyState === WebSocket.OPEN){
            client.send(JSON.stringify(message))
        }
    }

    socket.on("message", (message) => {
        const {username, text} = JSON.parse(message)
        for(const client of wss.clients){
            if(client.readyState === WebSocket.OPEN){
                client.send(JSON.stringify({
                    "type": "chat",
                    username,
                    text
                }))
            }
        }
    })

    socket.on("close", () => {
        for(const client of wss.clients){
            client.send(JSON.stringify({
                "type": "system", "text": `${username} left`
            }))
        }
    })
})

server.listen(PORT, () => {
    console.log("Chat server running at http://localhost:3001")
})
