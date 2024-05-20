import { useEffect, useState } from 'react'
import axios from 'axios'
import './App.css'

function App() {

  const apiLink = "/api/jokes"
  const [jokes, setJokes] = useState([])


  useEffect(() => {
    axios.get(apiLink)
      .then(response => setJokes(response.data))
      .catch(error => console.error('Error fetching data:', error))
  }, []) // Empty dependency array means this effect runs once after initial render

  return (
    <>
      <h1>Asad Riaz 💗, Full Stack Developer</h1>
      {jokes?.map((joke) => (
        <p key={joke.id}>Number{joke.id}. {joke.joke}</p>
      ))}
    </>
  )
}

export default App
