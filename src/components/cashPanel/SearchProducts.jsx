import {useRef, useState, useEffect } from "react";
import { useSelector, useDispatch, shallowEqual } from "react-redux";
import api from "../../api";
import { addToCart, setEnteredQuantityForPrice, setEnteredQuantityForQuantity,setEnteredBuffer, setSelected } from "../../features/cart";
import Quantity from "../Quantity";
import { getCategories, getProducts } from "../../utils/dataService";


function SearchProducts() {            
                                                                                                  
  const [products, setProducts] = useState([])
  const [search, setSearch] = useState("")
  const dispatch = useDispatch()
  const selectedProduct = useSelector(state => state.cart.selected, shallowEqual)
  const enteredQuantityForPrice = useSelector(state => state.cart.enteredQuantityForPrice)
  const enteredQuantityForQuantity = useSelector(state => state.cart.enteredQuantityForQuantity)
  const isWholesaleMode = useSelector(state => state.cart.isWholesaleMode)

  const quantityRef = useRef()
  useEffect(() => {
    const fetchProducts = async () => {
      try {
       const fetchedProducts = await getProducts()
       setProducts(fetchedProducts || [])
        
      } catch (error) {
        console.error("Erreur chargement produits", error) 
      } 
    }
    fetchProducts()
  }, [])      

  const filteredProducts = products.filter(product =>                              
    product.name.toLowerCase().includes(search.toLowerCase())
  )                             

  const handleSelect = (product) => {
  const quantity = parseInt(enteredQuantityForQuantity)
  const price = parseFloat(enteredQuantityForPrice)
  const basePrice = isWholesaleMode
                ? product.wholesalePrice
                : product.retailPrice || product.price 
          const finalPrice = !isNaN(price) ? price : basePrice
  const updatedProduct = {
            ...product,
            quantity: isNaN(quantity) ? 1 : quantity,
            price: finalPrice
          }                              
         
   dispatch(setSelected(updatedProduct))


  // let updatedProduct = { ...product }

  // if (enteredQuantityTarget === "quantity") {
  //   updatedProduct.quantity = appliedQty
  // } else if (enteredQuantityTarget === "price") {
  //   updatedProduct.price = appliedQty
  // }

  
  
  
}                                        

  const handleAdd = () => {
   if (selectedProduct) {                                 
     const item = {                                      
      ...selectedProduct,                       
      quantity: selectedProduct.quantity ?? 1,
      price: selectedProduct.price ?? undefined,
    }
    dispatch(addToCart(item))     
    dispatch(setSelected(null))
    setSearch("")     
    dispatch(setEnteredQuantityForPrice(""))
    dispatch(setEnteredQuantityForQuantity(""))
    dispatch(setEnteredBuffer(""))
    quantityRef.current?.clear()  
  }
      }
  return (
    <>   
    
       <div className="flex justify-between ">
         <input
          type="text"
          placeholder="Rechercher produit..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-[40%] text-black bg-gray-200 p-2 border shadow-sm rounded  focus:outline-none focus:ring-0"
        />
        <span className="ml-2 text-sm text-gray-400">
           Quantité: {enteredQuantityForQuantity || 1}
        </span>
        <span className="ml-2 text-sm text-gray-400">
           Rabais: {parseFloat(enteredQuantityForPrice || 0).toLocaleString('fr-GN')}
        </span>
        <button 
        onClick={() => handleAdd() }
        className="px-3 py-2 rounded text-black bg-gray-300">Confirmer</button>

        </div>
        
        <div className="max-h-60 overflow-y-auto min-h-60  scrollbar-hide">
           <table className="w-full text-left border-collapse text-white">
                <thead className="sticky top-0 bg-slate-700/90 z-10   ">
                <tr>
                  <th className="px-4 py-2 border-b">Nom</th>
                  <th className="px-4 py-2 border-b">Prix</th>
                </tr>
                </thead>
                <tbody>
          {filteredProducts.length > 0 ? (
          filteredProducts.map((product) => (                                         
            <tr
              key={product.id}                                                          
              onClick={() => {
              handleSelect(product)
              }}
              className={`p-2 border-b cursor-pointer hover:bg-gray-400 ${selectedProduct?.id === product.id? 'bg-slate-200 text-slate-950' :  "" }`}
            > 
             
                <td className="px-4 py-2">{product.name}</td> 
                <td className="px-4 py-2">{parseFloat(product.retailPrice)?.toLocaleString('fr-GN') }</td> 
                <td className="px-4 py-2">{parseFloat(product.wholesalePrice)?.toLocaleString('fr-GN') }</td> 
              </tr>
             
            ))
          ) : (                                                                                            
            <tr>
                <td colSpan={2} className="text-center italic py-4 text-gray-300">
                  Aucun produit trouvé
                </td>
            </tr>
          )}
          </tbody>
        </table>     
        </div>
        </>                            

  )
}
export default SearchProducts  



