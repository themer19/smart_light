import { BrowserRouter,Routes,Route } from "react-router-dom"
import Login from './pages/Login'
import Validationuser from './pages/Validationuser'
function App() {
  return (
    <>
    <BrowserRouter>
    <Routes>
      <Route path="/" element={<Validationuser/>}>
      </Route>
    </Routes>
    </BrowserRouter>
    
    </>
  )
}

export default App
