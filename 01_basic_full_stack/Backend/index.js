import express from 'express'
import { configDotenv } from 'dotenv'
import cors from 'cors'
configDotenv()
const app = express()

app.use(cors())


app.get('/', (req, res) => {
    res.send('Server is ready')
})

//serve 5 funny jokes array of objects

app.get('/api/jokes', (req, res) => {
    const jokes = [
        {
            id: 1,
            joke: "Why don't skeletons fight each other? They don't have the guts."
        },
        {
            id: 2,
            joke: "Parallel lines have so much in common. It’s a shame they’ll never meet."
        },
        {
            id: 3,
            joke: "I told my wife she was drawing her eyebrows too high. She looked surprised."
        },
        {
            id: 4,
            joke: "Why did the scarecrow win an award? Because he was outstanding in his field!"
        },
        {
            id: 5,
            joke: "Did you hear about the mathematician who’s afraid of negative numbers? He’ll stop at nothing to avoid them."
        }
    ];
    

    res.send(jokes)
})


const port = process.env.PORT || 5000

app.listen(port, () => {
    console.log(`Serve at ${port}`)
})