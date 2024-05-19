import express from 'express'
import 'dotenv/config'
const app = express();
// const port = 3000;

app.get('/', (req, res) => {
    res.send("Hello World!")
})

app.get("/twitter", (req, res) => {
    res.send("Twitter")
})


app.get("/github", (req, res) => {
    res.send('<a href="https://github.com/hafizasad419" target=_blank>Github</a>')
})


app.listen(process.env.PORT, () => {
    console.log(`My App is listening on port ${process.env.PORT}`);
})