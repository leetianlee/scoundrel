import { GameBoard } from './components/GameBoard'
import { useSound, SoundContext } from './hooks/useSound'
import './App.css'

function App() {
  const soundHook = useSound();

  return (
    <SoundContext.Provider value={soundHook}>
      <GameBoard />
    </SoundContext.Provider>
  )
}

export default App
