const next = require('next')
const fs = require("fs");
const http = require("http");

const dev = process.env.NODE_ENV !== 'production'

console.log('NODE_ENV', process.env.NODE_ENV, dev)

// Your app will get the Azure port from the process.enc.PORT
const port = 80;

const app = next({ dev, port })
const handle = app.getRequestHandler()

const key = fs.readFileSync("./localhost-key.pem", "utf-8");
const cert = fs.readFileSync("./localhost.pem", "utf-8");

app
    .prepare()
    .then(() => {
        http.createServer({ key, cert }, (req, res) => {
            return handle(req, res)
        }).listen(port);
    })
    .catch(ex => {
        process.exit(1)
    })
