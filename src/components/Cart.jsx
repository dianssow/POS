import { useSelector, useDispatch } from "react-redux"
import { setSelected,addToCart }  from "../features/cart"
import { updateQuantity } from "../features/cart"
export default function Cart({isReturn, setIsReturn}) {
    
    const dispatch = useDispatch()
    const items = useSelector(state => state.cart.items)
    const selectedProduct = useSelector(state => state.cart.selected)
    
      

     
              // Retour Produit ---A revoir---
      const handleSelect = (item) => {
        
        dispatch(setSelected(item))
      }
    
    


  return (
    <div className="w-full">

        <div className="grid grid-cols-5 gap-1 font-bold border-b border-white pb-1 mb-2 ">
            <div>ID</div>
            <div>Quantité</div>
            <div>Unité</div>
            <div>Nom</div>
            <div>Total(GNF)</div>
        </div>

        <div className="flex flex-col gap-2 h-[90%] overflow-auto">
            {items.map((item, index) => {              
              const price = parseFloat((item.price ?? '0' ).toString().replace(',', '.'))
              const quantity = Number(item.quantity)
              const total = price * quantity

            return(     
                <div 
                key={item._id || item.id }
                onClick={() => handleSelect(item)}
                className={`bg-slate-600 grid grid-cols-5 gap-2 p-2 rounded cursor-pointer ${selectedProduct?._id === item._id? 'bg-slate-200 text-slate-950' :  "" }`}
                >
                  
                    <div>{index + 1}  </div>
                    <div>{item.quantity}</div>
                    <div className={item.price < 0 ? "text-red-400" : ""}>{parseFloat(item.price).toLocaleString('fr-GN') }</div>
                    <div>{item.name}</div>
                    <div>{(item.price * item.quantity).toLocaleString('fr-GN')}</div>

                    </div>
                     )
           
                       } )
                      }
</div>
</div>
        
  )
   }