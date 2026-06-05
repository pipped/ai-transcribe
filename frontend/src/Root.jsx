import { useState } from 'react'
import App from './App.jsx'
import Landing from './Landing.jsx'

export default function Root() {
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
