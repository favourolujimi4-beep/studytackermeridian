```jsx
import React, { useEffect, useState } from 'react'
import './App.css'

import Dashboard from './components/Dashboard'
import SessionLogger from './components/SessionLogger'
import WeeklyReflection from './components/WeeklyReflection'
import Settings from './components/Settings'
import Auth from './components/Auth'

function App() {
  const [currentUser, setCurrentUser] = useState(null)
  const [currentPage, setCurrentPage] = useState('dashboard')

  const [sessions, setSessions] = useState([])
  const [streaks, setStreaks] = useState({
    current: 0,
    lastDate: null
  })

  const [rewards, setRewards] = useState([])
  const [reflections, setReflections] = useState([])

  const [settings, setSettings] = useState({
    font: 'Inter',
    theme: 'Cyber'
  })

  // --------------------------------------------------
  // LOAD DATA FROM LOCAL STORAGE
  // --------------------------------------------------

  useEffect(() => {
    try {
      const savedUser = localStorage.getItem('studyTrackerUser')
      const savedSessions = localStorage.getItem('studySessions')
      const savedStreaks = localStorage.getItem('streaks')
      const savedRewards = localStorage.getItem('rewards')
      const savedReflections = localStorage.getItem('reflections')
      const savedSettings = localStorage.getItem('settings')

      if (savedUser) {
        setCurrentUser(JSON.parse(savedUser))
      }

      if (savedSessions) {
        setSessions(JSON.parse(savedSessions))
      }

      if (savedStreaks) {
        setStreaks(JSON.parse(savedStreaks))
      }

      if (savedRewards) {
        setRewards(JSON.parse(savedRewards))
      }

      if (savedReflections) {
        setReflections(JSON.parse(savedReflections))
      }

      if (savedSettings) {
        setSettings(prevSettings => ({
          ...prevSettings,
          ...JSON.parse(savedSettings)
        }))
      }
    } catch (error) {
      console.error('Error loading saved data:', error)
    }
  }, [])

  // --------------------------------------------------
  // SAVE DATA TO LOCAL STORAGE
  // --------------------------------------------------

  useEffect(() => {
    localStorage.setItem('studySessions', JSON.stringify(sessions))
  }, [sessions])

  useEffect(() => {
    localStorage.setItem('streaks', JSON.stringify(streaks))
  }, [streaks])

  useEffect(() => {
    localStorage.setItem('rewards', JSON.stringify(rewards))
  }, [rewards])

  useEffect(() => {
    localStorage.setItem('reflections', JSON.stringify(reflections))
  }, [reflections])

  useEffect(() => {
    localStorage.setItem('settings', JSON.stringify(settings))
  }, [settings])

  // --------------------------------------------------
  // LOGIN
  // --------------------------------------------------

  const handleLogin = (email, password) => {
    // Do not store the password in localStorage.
    const user = {
      id: Date.now(),
      email
    }

    setCurrentUser(user)
    localStorage.setItem('studyTrackerUser', JSON.stringify(user))
    setCurrentPage('dashboard')
  }

  // --------------------------------------------------
  // LOGOUT
  // --------------------------------------------------

  const handleLogout = () => {
    setCurrentUser(null)
    localStorage.removeItem('studyTrackerUser')
    setCurrentPage('dashboard')
  }

  // --------------------------------------------------
  // ADD STUDY SESSION
  // --------------------------------------------------

  const addSession = sessionData => {
    const newSession = {
      id: Date.now(),
      ...sessionData,
      date: new Date().toISOString()
    }

    // Add the new study session safely.
    setSessions(prevSessions => [
      ...prevSessions,
      newSession
    ])

    // ------------------------------------------------
    // UPDATE STREAK
    // ------------------------------------------------

    const today = new Date().toDateString()

    const lastStudyDate = streaks.lastDate
      ? new Date(streaks.lastDate).toDateString()
      : null

    let newStreak = streaks.current

    // Only update the streak once per day.
    if (lastStudyDate !== today) {
      const yesterday = new Date()
      yesterday.setDate(yesterday.getDate() - 1)

      if (lastStudyDate === yesterday.toDateString()) {
        // Studied yesterday, so continue the streak.
        newStreak = streaks.current + 1
      } else {
        // First study session or streak was broken.
        newStreak = 1
      }
    }

    const updatedStreaks = {
      current: newStreak,
      lastDate: new Date().toISOString()
    }

    setStreaks(updatedStreaks)

    // ------------------------------------------------
    // AWARD BADGES
    // ------------------------------------------------

    if (
      newStreak === 7 &&
      !rewards.some(
        reward => reward.badgeName === 'Week Warrior'
      )
    ) {
      setRewards(prevRewards => [
        ...prevRewards,
        {
          id: Date.now(),
          badgeName: 'Week Warrior',
          type: '7-day'
        }
      ])
    }

    if (
      newStreak === 30 &&
      !rewards.some(
        reward => reward.badgeName === 'Month Master'
      )
    ) {
      setRewards(prevRewards => [
        ...prevRewards,
        {
          id: Date.now() + 1,
          badgeName: 'Month Master',
          type: '30-day'
        }
      ])
    }
  }

  // --------------------------------------------------
  // ADD WEEKLY REFLECTION
  // --------------------------------------------------

  const addReflection = (reflectionText, goals) => {
    const newReflection = {
      id: Date.now(),
      text: reflectionText,
      goals: goals,
      date: new Date().toISOString(),
      week: Math.floor(
        Date.now() / (7 * 24 * 60 * 60 * 1000)
      )
    }

    setReflections(prevReflections => [
      ...prevReflections,
      newReflection
    ])
  }

  // --------------------------------------------------
  // UPDATE SETTINGS
  // --------------------------------------------------

  const updateSettings = newSettings => {
    setSettings(prevSettings => ({
      ...prevSettings,
      ...newSettings
    }))
  }

  // --------------------------------------------------
  // SHOW LOGIN PAGE IF USER IS NOT LOGGED IN
  // --------------------------------------------------

  if (!currentUser) {
    return <Auth onLogin={handleLogin} />
  }

  // --------------------------------------------------
  // THEMES
  // --------------------------------------------------

  const themeClasses = {
    Cyber: 'bg-gray-900 text-cyan-400',
    Emerald: 'bg-green-900 text-emerald-300',
    Sapphire: 'bg-blue-900 text-blue-300',
    Gold: 'bg-yellow-900 text-yellow-300',
    Obsidian: 'bg-black text-gray-300'
  }

  // --------------------------------------------------
  // FONTS
  // --------------------------------------------------

  const fontClasses = {
    Inter: 'font-sans',
    Garamond: 'font-serif',
    Cyber: 'font-mono',
    JetBrains: 'font-mono',
    Playfair: 'font-serif'
  }

  // Fallback classes in case an unexpected setting is saved.
  const selectedTheme =
    themeClasses[settings.theme] || themeClasses.Cyber

  const selectedFont =
    fontClasses[settings.font] || fontClasses.Inter

  // --------------------------------------------------
  // MAIN APPLICATION
  // --------------------------------------------------

  return (
    <div
      className={`min-h-screen ${selectedTheme} ${selectedFont} transition-colors duration-300`}
    >
      {/* Navigation */}
      <nav className="border-b border-gray-700 p-4">
        <div className="max-w-6xl mx-auto flex justify-between items-center">
          <h1 className="text-2xl font-bold">
            📚 Meridian
          </h1>

          <div className="flex gap-4 items-center">
            {/* Dashboard */}
            <button
              onClick={() => setCurrentPage('dashboard')}
              className={`px-4 py-2 rounded ${
                currentPage === 'dashboard'
                  ? 'bg-cyan-600'
                  : 'hover:bg-gray-800'
              }`}
            >
              Dashboard
            </button>

            {/* Log Session */}
            <button
              onClick={() => setCurrentPage('logger')}
              className={`px-4 py-2 rounded ${
                currentPage === 'logger'
                  ? 'bg-cyan-600'
                  : 'hover:bg-gray-800'
              }`}
            >
              Log Session
            </button>

            {/* Reflection */}
            <button
              onClick={() => setCurrentPage('reflection')}
              className={`px-4 py-2 rounded ${
                currentPage === 'reflection'
                  ? 'bg-cyan-600'
                  : 'hover:bg-gray-800'
              }`}
            >
              Reflection
            </button>

            {/* Settings */}
            <button
              onClick={() => setCurrentPage('settings')}
              className={`px-4 py-2 rounded ${
                currentPage === 'settings'
                  ? 'bg-cyan-600'
                  : 'hover:bg-gray-800'
              }`}
            >
              Settings
            </button>

            {/* Logout */}
            <button
              onClick={handleLogout}
              className="px-4 py-2 rounded bg-red-600 hover:bg-red-700"
            >
              Logout
            </button>
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <main className="max-w-6xl mx-auto p-8">
        {currentPage === 'dashboard' && (
          <Dashboard
            sessions={sessions}
            streaks={streaks}
            rewards={rewards}
          />
        )}

        {currentPage === 'logger' && (
          <SessionLogger
            onAddSession={addSession}
          />
        )}

        {currentPage === 'reflection' && (
          <WeeklyReflection
            onAddReflection={addReflection}
            reflections={reflections}
          />
        )}

        {currentPage === 'settings' && (
          <Settings
            settings={settings}
            onUpdateSettings={updateSettings}
          />
        )}
      </main>
    </div>
  )
}

export default App
```

### One important note

I deliberately **didn't pretend this is full authentication**. Your `Auth` component can accept an email/password, but `App.jsx` currently doesn't verify the password against a database. It simply treats the login as successful.

For a **school/project prototype**, that's fine. For a real deployed app, authentication should be moved to a proper auth service/backend.

Also, your `App.jsx` depends on these files existing:

```text
src/
├── App.jsx
├── App.css
└── components/
    ├── Dashboard.jsx
    ├── SessionLogger.jsx
    ├── WeeklyReflection.jsx
    ├── Settings.jsx
    └── Auth.jsx
```

And because you're using classes like `bg-gray-900`, `text-cyan-400`, `flex`, `p-8`, etc., **Tailwind CSS needs to be configured in the project** for those styles to appear.

If you're getting an error after pasting this, send me the **exact error message/screenshot** and I can pinpoint the next file that needs fixing.
