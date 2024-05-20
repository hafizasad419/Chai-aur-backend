import express from 'express'
import 'dotenv/config'
const app = express();

const packageJson = {
    "name": "basic-express",
    "version": "1.0.0",
    "description": "my-first-express-project",
    "main": "index.js",
    "type": "module",
    "scripts": {
        "dev": "node index.js",
        "watch": "nodemon index.js",
        "test": "echo \"Error: no test specified\" && exit 1"
    },
    "keywords": [
        "node",
        "express",
        "backend"
    ],
    "author": "Asad Riaz",
    "license": "ISC",
    "dependencies": {
        "dotenv": "^16.4.5",
        "express": "^4.19.2"
    }
}


// const port = 3000;

app.get('/', (req, res) => {
    res.send("Hello World!")
})

app.get("/twitter", (req, res) => {
    res.send("Twitter")
})

app.get("/package.json", (req, res) => {
    res.json(packageJson)
})


app.get("/github", (req, res) => {
    res.send('<a href="https://github.com/hafizasad419" target=_blank>Github</a>')
})


app.listen(process.env.PORT, () => {
    console.log(`My App is listening on port ${process.env.PORT}`);
})