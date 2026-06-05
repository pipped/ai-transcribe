import React, { useState } from 'react'
import ReactDOM from 'react-dom/client'
import App from './App.jsx'
import Landing from './Landing.jsx'
import './index.css'

function Root() {
  const [view, setView] = useState(window.location.hash === '#app' ? 'app' : 'landing')

  const goToApp = () => {
    window.location.hash = '#app'
    setView('app')
  }

  const goToLanding = () => {
    window.location.hash = ''
    setView('landing')
  }

  if (view === 'app') return <App onBack={goToLanding} />
  return <Landing onGetStarted={goToApp} />
}

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <Root />
  </React.StrictMode>,
)
