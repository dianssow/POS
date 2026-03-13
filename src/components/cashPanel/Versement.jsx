import { useState, useEffect } from "react";
import api from "../../api";
import { useSelector } from "react-redux";
import { getCustomers } from "../../utils/dataService";
import { localDB } from "../../utils/localDB";
import { v4 as uuidv4 } from "uuid"

function Versement() { 

    const [customers, setCustomers]= useState([])
    const [showSuggestions, setShowSuggestions] = useState(false)
    const[errorMessage, setErrorMessage] = useState("")
    const[successMessage, setSuccessMessage] = useState("")
    const [search, setSearch] = useState("")
    const [selectedCustomer, setSelectedCustomer] = useState(null)
    const [amount, setAmount] = useState("")
    const [motif, setMotif] = useState("")
    const [isSubmitting, setIsSubmitting] = useState(false)


  const token = useSelector((state) => state.loginPage.token)

  const handleVersement= async (e) => {
    e.preventDefault()
    if(isSubmitting) return 

    if(!amount || Number(amount) <= 0){
      setErrorMessage("Entrez un montant valide")
      return
    }

    if (!selectedCustomer) {
            setErrorMessage("Veuillez sélectionner un client")
            return
    }

    setIsSubmitting(true)
        
    

    const localId = `local_vers_${uuidv4()}`
    const versementNumber = `VRS-${Date.now()}`

    const apiData = {
      customerId: selectedCustomer.id,    
      amount: Number(amount),
      motif: motif || null,
      method: "Versement"
    }

    const localVersementData = {
      id:localId,
      versementNumber,
      type: "ENC",
      method: "Versement",
      customerId:selectedCustomer.id,
      customer:{
        id: selectedCustomer.id,
        name: selectedCustomer.name,
        adress: selectedCustomer.address || "",
        number: selectedCustomer.number || "",
      },
      amount:Number(amount),
      motif: motif || null,
      synced: false, 
      createdAt: new Date().toISOString()

    }

    try{
      await localDB.versements.add(localVersementData)
      console.log("Versement enregistré den local", localVersementData)
      const res = await api.post(
        "/api/versement/add",
        apiData,
        {headers: {Authorization: `Bearer ${token}`}}
      )

      if(res.data.success && !res.data.offline) {
        await localDB.versements.delete(localId)
        await localDB.versements.add({
          ...res.data.versement,
          synced:true
        })
        console.log("Versement enregistré et synchronisé");
         setAmount("")
         setMotif("")
         setSearch("")
         setSelectedCustomer(null)
         
        } else if(res.data.offline) {
          console.log("Versement enregistré , ser synchroniße");
          setAmount("")
          setMotif("")
          setSearch("")
          setSelectedCustomer(null)
          
        }
        
        setSuccessMessage("Versemnet enregistré avec succes")
    
     
    } catch(error){
      console.error("Erreur versement", error);
      if(error.response?.data?.offline ){
        console.log("Versement enregistré en local(sera synchro....) ");
        setAmount("")
        setMotif("")
        setSearch("")
        setSelectedCustomer(null)
        
      } else if (!error.response){
        console.log("Versement enregistré localemeent");
         setAmount("")
        setMotif("")
        setSearch("")
        setSelectedCustomer(null)

        
      }
      
      else {
          console.log("Impossible denregistrer le versement");
          await localDB.versements.delete(localId)
      }
    } finally{
      setIsSubmitting(false)
    }
     setTimeout(()=>{
      setErrorMessage("")
      setSuccessMessage("")
    }, 3000 )
    setisLoading(false)
  }
  
       useEffect(() => {
         const fetchCustomers = async () => {
           try {
             const allCustomers =  await getCustomers()
             setCustomers(allCustomers)
           } catch (error) {
             console.error("Erreur chargement clients", error)
             setCustomers([])
           }
         };
         fetchCustomers()
         setCustomers([])
         window.addEventListener('online', fetchCustomers)
         return () => window.removeEventListener('online', fetchCustomers)
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
             disabled={isSubmitting}
           />
           {showSuggestions && filteredCustomers.length > 0 && (
              <ul className="absolute z-10 bg-orange-200 text-black w-3/4 border border-gray-300 rounded text-left max-h-40 overflow-y-auto mt-1">
                {filteredCustomers.map((c) => (
                  <li
                    key={c.id}
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
           {errorMessage && (
                <div className="text-red-500 text-lg m-0 flex justify-center items-center ">{errorMessage}</div>
            )}
             {successMessage && (
              <div className="text-green-400 text-lg m-0 flex justify-center items-center">{successMessage}</div>
            )}
            <div>

           <button
           type="submit"
           className="text-xl mt-6 p-3 rounded-xl mb-2 bg-blue-500 "
           disabled={isSubmitting}
           >{isSubmitting ? "Envoi..." : "Confirmer"}</button>
           </div>
          </form>
                  </div>
        </div>
  )
}
export default Versement

