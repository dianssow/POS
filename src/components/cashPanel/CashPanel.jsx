import { useState } from "react"
import Encaissement from "./Encaissement"
import Decaissement from "./Decaissement"
import Invoice from "./Invoice"
import Versement from "./Versement"
import SearchProducts from "./SearchProducts"
function CashPanel({onClose}) {

    const[view, setView] = useState(null)

  return (
    <div className="w-[100%] fixed inset-0 z-50 flex items-center justify-center bg-slate-800/20 bg-opacity-30">
        <div className="flex flex-col bg-slate-700/80 w-[55%] h-[85%] rounded shadow-lg  ">

            <div className="flex justify-between items-center pb-3 border-b">
             <h1 className="text-3xl font-bold text-slate-300 tracking-wide font-serif "> FUNCTION </h1>
             <button 
             onClick={onClose}
             className="px-3 py-1 mt-1 bg-gray-200 text-black rounded-lg"
             >Fermer</button>
            </div>
            <div className="mt-1 flex flex-wrap gap-2 justify-center font-serif overflow-hidden ">
                <button onClick={() => setView("encaissement")} className="px-4 py-2 bg-orange-100/90 text-black rounded-lg text-xl w-auto max-w-full">Encaissement</button>
                <button onClick={() => setView("decaissement")} className="px-4 py-2 bg-orange-100/90 text-black rounded-lg text-xl w-auto max-w-full">Decaissement</button>
                <button onClick={() => setView("invoice")}      className="px-4 py-2 bg-orange-100/90 text-black rounded-lg text-xl w-auto max-w-full">Factures</button>
                <button onClick={() => setView("searchProducts")} className="px-4 py-2 bg-orange-100/90 text-black rounded-lg text-xl w-auto max-w-full">Produits</button>
                <button onClick={() => setView("versement")} className="px-4 py-2 bg-orange-100/90 text-black rounded-lg text-xl w-auto max-w-full">Versement</button>
            </div>

            <div className="flex-1 p-6 overflow-auto">
              {view === "encaissement" && <Encaissement />}
              {view === "decaissement" && <Decaissement />}
              {view === "invoice" && <Invoice />}
              {view === "searchProducts" && <SearchProducts />}
              {view === "versement" && <Versement />}
            </div>
        </div>
        </div>
  )
}
export default CashPanel