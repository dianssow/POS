import { useState } from "react"
import {useSelector} from "react-redux"
import api from "../../api"

function Encaissement() {
 
  const [amount, setAmount] = useState("")
  const[errorMessage, setErrorMessage] = useState("")
  const[successMessage, setSuccessMessage] = useState("")
  const[isLoading, setisLoading] = useState(false)
  
  const token = useSelector((state) => state.loginPage.token)
  const currentUser = useSelector((state) => state.loginPage.user)
  const handleEncaissement= async (e) => {
 
    e.preventDefault()

    
    if(!amount || Number(amount) <= 0){
      setErrorMessage("Entrez un montant valide");
      return
    }
    if(isLoading) return
      setisLoading(true)
    try {
      await api.post("/api/cash/movements", 
        { type: "ENC", method: "Espèces", amount: Number(amount),userId: currentUser.id},
        { headers: { Authorization: `Bearer ${token}` } }
      )
      setAmount("")
      setSuccessMessage("Encaissement enregistré")

      setisLoading(false)
      setTimeout(() => {
        setSuccessMessage("")
        setErrorMessage("")
      },5000)
    } catch (error) {
      console.error("Erreur Encaissement:", error)
      setErrorMessage("Impossible, Session Fermée")
  
    }
  }
  return (
          <div className="flex justify-center ">
            <div
            onClick={e => e.stopPropagation()}
            className="fixed w-1/4 bg-orange-100 rounded text-center max-h-80 overflow-y-auto min-h-60  scrollbar-hide"
            >
          <h1 className="font-serif mt-6 text-black text-3xl ">ENCAISSEMENT</h1>
           
          <form onSubmit={handleEncaissement} >
           <input  
             type="number"
             value={amount}
             onChange={(e) => setAmount(e.target.value)}
             placeholder="Montant d'encaissement"
             className="w-3/4 text-black border rounded p-2 mt-4 focus:outline-none focus:ring-0"
           />

              {errorMessage && (
                <div className="text-red-500 text-lg mt-auto flex justify-center items-center ">{errorMessage}</div>
            )}

            {successMessage && (
              <div className="text-green-400 text-lg mt-auto flex-justify-center items-center">{successMessage}</div>
            )}

          
            <div>
           <button
           type="submit"
           disabled={isLoading}
           className={`text-xl mt-8 p-3 rounded-xl ${isLoading ? "bg-gray-400" : "bg-blue-500"} `} >
            {isLoading ? "Envoi..." : "Confirmer"}
           </button>
           </div>
          </form>
                  </div>
                  
 
        </div>
  )
}
export default Encaissement