import { useSelector } from "react-redux"
import { useState} from "react"
import { checkSessionAndSync } from "../../utils/shiftManager"
function PayButton({cartItems, setShowPaymentView, setErrorMessage}) {
    

    const token = useSelector((state) => state.loginPage.token)


  
   const handleClickPayer =async () => {
      if(cartItems.length === 0) {
        setErrorMessage("Ajoutez un produit au panier.")   

        return
      } 

      const sessionOpen = await checkSessionAndSync(token) 
       console.log("sessionOpen:", sessionOpen)
      if(!sessionOpen) {
        setErrorMessage("VEuillez dire au Manager de lancer une session.")   
        return
      }
      
      setShowPaymentView(true),
      setErrorMessage("")
    }
  return (
     <button
      className="flex-1 w-full bg-green-500 hover:bg-green-600 text-white font-bold py-6 rounded shadow-lg uppercase tracking-wide"
      onClick={handleClickPayer }>
                Payer
     </button>
  )
}
export default PayButton