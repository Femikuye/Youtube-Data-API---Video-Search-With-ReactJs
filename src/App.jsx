import { useState } from 'react'
// import reactLogo from './assets/react.svg'
// import viteLogo from '/vite.svg'
import YoutubeSearch from './components/YoutubeSearch'
import "bootstrap/dist/css/bootstrap.css";
import './assets/css/style.css'

function App() {
  const [count, setCount] = useState(0)

  return (
    <div className='container main-div'>
    <YoutubeSearch />
    </div>
  )
}

export default App
