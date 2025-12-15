import { useState } from "react"
import { useDispatch } from "react-redux"
import {login}  from "../features/loginPage"
import api from '../api'
function LoginPage() {
  const dispatch = useDispatch()

  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [error, setError] = useState(null)
  const [loading, setLoading] = useState(false)



  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)
    setError(null)

    try {
      const response = await api.post("/api/auth/login", {email, password})

      if (response.data.success) {
        dispatch(login({
          userData:response.data.user,
          token: response.data.token
        }))
      }
      else {
        alert (response.data.error)
      }
      
    } catch (error) {
       if (error.response) {
    setError(error.response.data.message || "Erreur serveur");
  } else {
    setError("Impossible de contacter le serveur");
  }

    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="fixed inset-0 bg-slate-800 bg-opacity-50 flex justify-center items-center z-50">
      <div className="bg-slate-800 p-9 rounded shadow-md w-80">
      <h1 className="text-4xl text-orange-100 font-bold text-center mb-2">GAP DISTRIBUTION</h1>
        <h2 className="text-2xl font-bold font-serif mb-4 text-center text-orange-100 ">Connexion</h2>
        {error && (
          <div className="bg-red text-red-700 p-2 mb-4 rounded ">{error}</div>
        )}
        <form 
        onSubmit={handleSubmit}
        className="space-y-4">
          <input
            type="text"
            onChange={(e) => setEmail(e.target.value)}
            required
            placeholder="Email"
            className="bg-orange-100  w-full px-4 py-2 border rounded focus:outline-none focus:ring-0"
          />
          <input
            type="text"
            onChange={(e) => setPassword(e.target.value)}
            required
            placeholder="Mot de passe"
            className="bg-orange-100 w-full px-4 py-2 border rounded focus:outline-none focus:ring-0"
          />
          <button
            type="submit"
            className="w-full bg-orange-100 font-serif text-black py-2 rounded hover:bg-orange-50"
          >
            {loading ? "Loading..." : "Se connecter"}
          </button>
        </form>
      </div>
    </div>
  )
}
export default LoginPage