import { useEffect, useState } from "react"
import {useSelector} from "react-redux"
import api from "../../api";
import { getSales, getVersements } from "../../utils/dataService";
import { localDB } from "../../utils/localDB";

function Invoice() {
       const [currentSessionSales, setCurrentSessionSales] = useState([])
       const [currentSessionVersements, setCurrentSessionVersements] = useState([])
       const [searchTerm, setSearchTerm] = useState("")
       const[selectedSale, setSelectedSale] = useState(null)
       
     const token = useSelector(state => state.loginPage.token)
       const user= useSelector((state) => state.loginPage.user)    
     
useEffect(() => { 
  const fetchSales = async () => {
      try {
           
               const sales = await getSales()
               const currentShift = await localDB.shifts
          .where('status')
          .equals('OPEN')
          .first()
        
        if (!currentShift) {
          console.log("Aucune session ouverte")
          setCurrentSessionSales([])
          return
        }
        
        // Filtrer les ventes de la session actuelle
        const current = sales.filter(sale => {
          // Ventes non synchronisées (offline)
          if (sale.synced === false) return true
          
          // Ventes de la session ouverte
          return sale.shiftId === currentShift.id || 
                 sale.shift?.id === currentShift.id ||
                 sale.shift?.status === "OPEN"
        })
                setCurrentSessionSales(current);

         
            } catch (error) {
            console.error("Erreur de recuperation de la vente :", error)

            setCurrentSessionSales([])
                
            }
    
        }
         fetchSales() 
    window.addEventListener('online', fetchSales)
    return () => window.removeEventListener('online', fetchSales)
         }, []) 
         const filteredCurrentSales = currentSessionSales.filter((sale) => {if(!searchTerm.trim()) return true
          return sale.customer?.name?.toLowerCase().includes(searchTerm.toLowerCase())
         })

         useEffect(() => {
          const fetchVersements = async () => {
             try {
           
           const versements = await getVersements()
           const currentShift = await localDB.shifts
          .where('status')
          .equals('OPEN')
          .first()
        
        if (!currentShift) {
          console.log("Aucune session ouverte")
          setCurrentSessionVersements([])
          return
        }
        
        // Filtrer les ventes de la session actuelle
        const current = versements.filter(versement => {
          // Ventes non synchronisées (offline)
          if (versement.synced === false) return true
          
          // Ventes de la session ouverte
          return versement.shiftId === currentShift.id || 
                 versement.shift?.id === currentShift.id ||
                 versement.shift?.status === "OPEN"
        })
                setCurrentSessionVersements(current);

         
            } catch (error) {
            console.error("Erreur de recuperation de la vente :", error)

            setCurrentSessionVersements([])
                
            }
          }
          fetchVersements()
           window.addEventListener("online", fetchVersements)
           return () => window.removeEventListener("online", fetchVersements)

          }, [])
          const filteredCurrentVersements = currentSessionVersements.filter((versement) => {if(!searchTerm.trim()) return true
         return versement.customer?.name?.toLowerCase().includes(searchTerm.toLowerCase())
          
         })
   


const handleDelete = async() => {
     if(user.role !== "admin") {
         alert("seul un admin peut retirer une facture")
        return      
      }
      if(selectedSale){
          try {
            const response = await api.delete(`/api/sale/${selectedSale.id}`, {
      headers: {
           Authorization: `Bearer ${token}`
             } 
          })
          if(response.data.success) {
              const sales = await getSales()
              const current = sales.filter(sale => 
                sale.shift?.status === "OPEN" || sale.synced === false
              )
              setCurrentSessionSales(current)
          }
          else {
              console.error("erreur de suppression du Produit", error.response) 
          }
              
          } catch (error) {
              console.error("erreur de suppression du Produit", error)
          }
          finally {
              setSelectedSale(null)      
          }
      }
             }


  return (
    <>
     <div className="flex justify-between ">
         <input
          type="text"
          placeholder="Rechercher Une Facture..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="w-[40%] text-black bg-gray-200 p-2 border shadow-sm rounded  focus:outline-none focus:ring-0"
        />
         <div className="flex gap-2" >
        <button className="px-3 py-2 rounded   text-black bg-gray-300">Modifier</button>
        <button 
        onClick={handleDelete}
        className="px-4 py-2 rounded text-black bg-gray-300">Retirer</button>
          </div> 
          </div>
        
      <div className="max-h-60 overflow-y-auto min-h-60  scrollbar-hide">  
    <table className="w-full text-left border-collapse text-white">
      <thead className="sticky top-0 bg-slate-700/90 z-10   ">
        <tr >
          <th className="px-4 py-2 border-b text-center">Client</th>
          <th className="px-4 py-2 border-b">Paiement</th>
          <th className="px-4 py-2 border-b">Total</th>
          <th className="px-4 py-2 border-b">Dates</th>
        </tr>
      </thead>

      <tbody>
        {filteredCurrentSales.map((sale)  => (
        <tr key={sale.id} 
        onClick={() => setSelectedSale(sale)}
        className={` cursor-pointer ${selectedSale?.id === sale.id? 'bg-slate-200 text-slate-950' :  "" }`}
        >
          <td className="px-4 py-2 border-b text-center">{sale.customer?.name || "--"} </td>
          <td className="px-4 py-2 border-b">{sale.paymentType} </td>
          <td className="px-4 py-2 border-b">{sale.totalAmount.toLocaleString("fr-FR")} </td>
          <td className="px-4 py-2 border-b">{new Date(sale.createdAt).toLocaleString("fr-FR")} </td>
        </tr>
        ))}

         {filteredCurrentVersements.map((versement)  => (
        <tr key={versement.id} 
        className="cursor-pointer bg-orange-100/90 "  
        >
          <td className="px-4 py-2 border-b text-center">{versement.customer?.name || "--"} </td>
          <td className="px-4 py-2 border-b"> Versement </td>
          <td className="px-4 py-2 border-b">{versement.amount.toLocaleString("fr-FR")} </td>
          <td className="px-4 py-2 border-b">{new Date(versement.createdAt).toLocaleString("fr-FR")} </td>
        </tr>
        ))}
      </tbody>
    </table>
    </div>
    </>
  )
}
export default Invoice