import { useState, useEffect } from "react";
import api from "../../api";
import { useSelector } from "react-redux";
function Versement() { 

    const [customers, setCustomers]= useState([])
    const [showSuggestions, setShowSuggestions] = useState(false)
    const [search, setSearch] = useState("")
    const [selectedCustomer, setSelectedCustomer] = useState(null)
    const [amount, setAmount] = useState("")
    const [motif, setMotif] = useState("")


  const token = useSelector((state) => state.loginPage.token)

  const handleVersement= async (e) => {
    e.preventDefault()
    if(!amount || Number(amount) <= 0){
      alert("Entrez un montant valide")
      return
    }
    try {
      const res = await api.post("/api/versement/add", 
        { type: "ENC", 
          method: "Versement",
          customerId:selectedCustomer?.id,
          amount: Number(amount),
          motif: motif,
          },
        { headers: { Authorization: `Bearer ${token}` } }
      )
      alert("✅ Versement enregistre")  
      console.log("Versement enregistré", res.data.versement);
      
      setAmount("")
      setMotif("")
      setSearch("")
    } catch (error) {
      console.error("Erreur Encaissement Versement:", error)
      alert("❌ Impossible denregistrer  Versement")
    }
  }
      useEffect(() => {
    const fetchCustomers = async () => {
      try {
        const response = await api.get("/api/customer");
        setCustomers(response.data.customers)
      } catch (error) {
        console.error("Erreur chargement clients", error)
      }
    }
    fetchCustomers()
    setShowSuggestions(false)
  }, [])

  const filteredCustomers = customers.filter(c =>
    c.name.toLowerCase().includes(search.toLowerCase())
  )

  
 
  return (
    <div className="flex justify-center ">
            <div
            onClick={e => e.stopPropagation()}
            className="fixed w-1/4 bg-orange-100 rounded text-center  h-auto "
            >
          <h1 className="font-serif mt-6 text-black text-3xl ">VERSEMENT</h1>
           
          <form onSubmit={handleVersement} >
           <input  
             type="text"
             value={search}
             onChange={(e) =>{ 
                setSearch(e.target.value)
                setShowSuggestions(true) 
              }}
             placeholder="Nom du Client"
             className="w-3/4 text-black border rounded p-2 mt-4 focus:outline-none focus:ring-0"
           />
           {showSuggestions && filteredCustomers.length > 0 && (
              <ul className="absolute z-10 bg-orange-200 text-black w-3/4 border border-gray-300 rounded text-left max-h-40 overflow-y-auto mt-1">
                {filteredCustomers.map((c) => (
                  <li
                    key={c._id}
                    onClick={() => {
                    setSearch(c.name)
                    setSelectedCustomer(c)
                    setShowSuggestions(false)
                    }}
                    className="px-3 py-2 cursor-pointer hover:bg-gray-200"
                  >
                    {c.name}
                  </li>
                ))}
              </ul>
            )}


           <input  
             type="number"
             value={amount}
             onChange={(e) => setAmount(e.target.value)}
             placeholder="Montant du Versement"
             className="w-3/4 text-black border rounded p-2 mt-4 focus:outline-none focus:ring-0"
           />
           <textarea 
             value={motif}
             onChange={(e) => setMotif(e.target.value)}
             placeholder="Motif du Versement"
              rows={2}
             className="w-3/4 text-black border rounded p-2 mt-4 resize-none focus:outline-none focus:ring-0"
           />
            
           <button
           type="submit"
           className="text-xl mt-6 p-3 rounded-xl mb-2 bg-blue-500 ">Confirmer</button>
          </form>
                  </div>
        </div>
  )
}
export default Versement

