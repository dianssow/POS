import { useState } from "react"
import { useDispatch } from "react-redux"
import {login}  from "../features/loginPage"
import api from '../api'
function LoginPage() {
  const dispatch = useDispatch()

  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [showPassword, setShowPassword] = useState("")
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
          <div className="relative">
          <input
            type={showPassword ? "text" : "password"}
            onChange={(e) => setPassword(e.target.value)}
            required
            placeholder="Mot de passe"
            className="bg-orange-100 w-full px-4 py-2 pr-10 border rounded focus:outline-none focus:ring-0"
          />

               <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-600 hover:text-gray-800"
            >
              {showPassword ? (
                // Icône œil barré (masquer)
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21" />
                </svg>
              ) : (
                // Icône œil (afficher)
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                </svg>
              )}
            </button>

          </div>
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