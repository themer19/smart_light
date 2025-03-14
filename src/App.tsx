import { BrowserRouter,Routes,Route } from "react-router-dom"
import Login from './pages/Login'
import Cr_compte from'./pages/Cr_compte'
function App() {
  return (
    <>
    <BrowserRouter>
    <Routes>
      <Route path="/" element={<Login/>}>
      </Route>
    </Routes>
    </BrowserRouter>
    
    </>
  )
}

export default App
