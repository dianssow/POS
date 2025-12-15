import { useEffect, useState } from "react"
import {useSelector} from "react-redux"
import api from "../../api";

function Invoice() {
       const [currentSessionSales, setCurrentSessionSales] = useState([])
       const [searchTerm, setSearchTerm] = useState("")
       const[selectedSale, setSelectedSale] = useState(null)
       
     const token = useSelector(state => state.loginPage.token)
       const user= useSelector((state) => state.loginPage.user)    
     

  const fetchSales = async () => {
      try {
                 const response = await api.get(`/api/sale`, {
            headers: {
                Authorization: `Bearer ${token}`
                  } 
                })

               const salesData = response.data.sales
               const current = salesData.filter(sale => sale.shift?.status === "OPEN") 
                setCurrentSessionSales(current);

            } catch (error) {
            console.error("Erreur de recuperation de la vente :", error)
                
            }
    
        }
        useEffect (() => {  
        fetchSales()
     }, [token])

     const filteredCurrentSales = currentSessionSales.filter((sale) => {if(!searchTerm.trim()) return true
      return sale.customer?.name?.toLowerCase().includes(searchTerm.toLowerCase())
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
              fetchSales()
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
        {filteredCurrentSales.map((sale) => (
        <tr key={sale.id} 
        onClick={() => setSelectedSale(sale)}
        className={` cursor-pointer ${selectedSale?.id === sale.id? 'bg-slate-200 text-slate-950' :  "" }`}
        >
          <td className="px-4 py-2 border-b text-center">{sale.customer?.name || "--"} </td>
          <td className="px-4 py-2 border-b">{sale.paymentType} </td>
          <td className="px-4 py-2 border-b">{sale.totalAmount.toLocaleString("fr-FR")} </td>
          <td className="px-4 py-2 border-b">{(sale.createdAt).toLocaleString("fr-FR")} </td>
        </tr>
        ))}
      </tbody>
    </table>
    </div>
    </>
  )
}
export default Invoice