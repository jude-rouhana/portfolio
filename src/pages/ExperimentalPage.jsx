import { useState } from 'react'
import OceanBackground from '../components/OceanBackground'

function ExperimentalPage() {
  const [isGameMode, setIsGameMode] = useState(false)

  return (
    <div className="min-h-screen bg-transparent relative">
      {/* Ocean Background - Sailing Game */}
      <OceanBackground onGameModeChange={setIsGameMode} />
    </div>
  )
}

export default ExperimentalPage