import { useState } from "react"
import {useSelector} from "react-redux"
import api from "../../api"
function Decaissement() {
   
  const [amount, setAmount] = useState("")
  const [confirmationData, setConfirmationData] = useState(null)
  const[errorMessage, setErrorMessage] = useState("")
  const[successMessage, setSuccessMessage] = useState("")
  const[isLoading, setisLoading] = useState(false)


  
  
      const token = useSelector(state => state.loginPage.token)
  const user= useSelector((state) => state.loginPage.user)
  const handleDecaissement= async (e) => {
    e.preventDefault()
    if(user.role !== "admin") {
      setErrorMessage("seul un admin peut faire un decaissement") 
      return
    }
    
    if(!amount || Number(amount) <= 0){ 
      setErrorMessage("Entrez un montant valide")
      return
    }
    
        if(isLoading) return
          setisLoading(true)

    try {
      await api.post("/api/cash/movements", 
        { type: "DEC", method: "Espèces", amount: Number(amount), userId: user.id, reason: "decaissement manuel" },
        { headers: { Authorization: `Bearer ${token}` } }
      )
      setAmount("")
      setSuccessMessage("Decaissement enregistré")
    } catch (error) {
      setErrorMessage("Impossible,Session fermée");
      return
    }

    setTimeout(()=>{
      setErrorMessage("")
      setSuccessMessage("")
    } )
    setisLoading(false)
  }

  return (
          <div className="flex justify-center ">
            <div
            onClick={e => e.stopPropagation()}
            className="fixed w-1/4 bg-orange-100 rounded text-center max-h-85 overflow-y-auto min-h-60  scrollbar-hide"
            >
          <h1 className="font-serif mt-6 text-black text-3xl ">DÉCAISSEMENT</h1>
           
          <form onSubmit={handleDecaissement} >  
           <input  
             type="number"
             value={amount}
             onChange={(e) => setAmount(e.target.value)}
             placeholder="Montant de Décaissement"
             className="w-3/4 text-black border rounded p-2 mt-4 focus:outline-none focus:ring-0"
           />
             
              {errorMessage && (
                <div className="text-red-500 text-lg mt-auto flex justify-center items-center ">{errorMessage}</div>
            )}

            {successMessage && (
              <div className="text-green-400 text-lg mt-auto flex justify-center items-center">{successMessage}</div>
            )}
            
           <button
           type="submit"
           className="text-xl mt-10 p-3 rounded-xl bg-blue-500 ">Confirmer</button>
          </form>
                  </div>
                  
        </div>
  )
}
export default Decaissement 