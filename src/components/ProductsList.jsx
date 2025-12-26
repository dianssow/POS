import { useEffect, useState } from "react"  
import { useSelector} from "react-redux"
import api from "../api"  
import { useDispatch } from "react-redux"  
import { addToCart, setSelected, setEnteredQuantityForPrice, setEnteredQuantityForQuantity,setEnteredBuffer  } from "../features/cart"
import {FaHome} from "react-icons/fa"
import { getCategories, getProducts } from "../utils/dataService"


export default function ProductsList({ quantityRef }) { 
  const [products, setProducts] = useState([])  
  const [categories, setCategories] = useState([])  
  const [currentView, setCurrentView] = useState("home")   
  const [selectedCategory, setSelectedCategory] = useState(null) 
  const isWholesaleMode = useSelector(state => state.cart.isWholesaleMode)
  const enteredQuantityForPrice = useSelector(state => state.cart.enteredQuantityForPrice)
  const enteredQuantityForQuantity = useSelector(state => state.cart.enteredQuantityForQuantity)
  const dispatch = useDispatch()
 
  const [currentPage, setCurrentPage] = useState(0)  
  const itemsPerPage = 12  

     

 useEffect(() => {
     const fetchData = async () =>{
       try {
       
       const fetchedCategories = await getCategories()
       setCategories(fetchedCategories || [])
        
    
             const fetchedProducts = await getProducts()
          setProducts(fetchedProducts || [])
    
            } catch (err) {
           console.error("Erreur de chargement des données de référence:", err)

          // Assurer que les tableaux sont vides en cas d'échec critique
         setCategories([])
         setProducts([])
   }
}
     fetchData()
    window.addEventListener('online', fetchData)
    return () => window.removeEventListener('online', fetchData)
         }, []) 

  let displayItems = []  
  if (currentView === "home") {
    displayItems = products.slice(0, 12)  
  } else if (currentView === "categories") {
    displayItems = categories  
  } else if (currentView === "products" && selectedCategory) {
    displayItems = products.filter((p) => p.categoryId?.id === selectedCategory.id)  
  }

  const paginatedItems = displayItems.slice(currentPage * itemsPerPage, (currentPage + 1) * itemsPerPage)  

  const handleClick = (item, index) => {
    if (currentView === "home") {
      if (index === 0) {
        setCurrentView("categories")  
        setCurrentPage(0)
        return  
      } else {
        handleAddToCart(item)
      }
    } else if (currentView === "categories") {
      setSelectedCategory(item)  
      setCurrentView("products")  
      setCurrentPage(0)  
    } else if (currentView === "products") {
       handleAddToCart(item)
    }
  }  

  const goBack = () => {
    if (currentView === "products") {
      setCurrentView("categories")  
      setSelectedCategory(null)  
    } else if (currentView === "categories") {
      setCurrentView("home")  
    }
    setCurrentPage(0)  
  }  
  const handleAddToCart = (item) => {
       const quantity = parseInt( enteredQuantityForQuantity)
       const price    = parseFloat(enteredQuantityForPrice)
       const basePrice = isWholesaleMode
       ? item.wholesalePrice
       : item.retailPrice || item.price 

       const finalPrice = !isNaN(price) ? price : basePrice
       const payload = {
            ...item,
            quantity: isNaN(quantity) ? 1 : quantity,
            price: finalPrice
  }



  dispatch(addToCart(payload))
  dispatch(setSelected(item))
  dispatch(setEnteredQuantityForPrice(""))
  dispatch(setEnteredQuantityForQuantity(""))
  dispatch(setEnteredBuffer(""))
  quantityRef.current?.clear()   
}

  return (
   

<div className="h-full overflow-hidden">
    <ul className="grid grid-cols-6 gap-2 h-full-auto">
      {paginatedItems.map((el, index) => (
        <li
          key={el.id || index}
          className="p-1 bg-slate-700 rounded-xl flex flex-col items-center justify-center cursor-pointer"
          onClick={() => handleClick(el, index)}
        >
          {currentView === "home" && index === 0 ? (
            <div className="w-full h-full flex items-center justify-center bg-gray-600 rounded-xl">
              <span 
              className="text-white font-bold bg-cover"><FaHome /></span>
            </div>
          ) : (
            <img
              src={el.image}
              onError={(e) => {
                e.target.onerror = null
                e.target.src = '/placeholder.jpg'
              }}
              alt={currentView === "home" && index=== 0 ? "Catégories"  : (el.name || el.categoryName)}
              className="w-full aspect-square object-cover  rounded-xl hover:scale-105 transition-transform"
            />
          )}
          <p className="text-xs text-center mt-1">{currentView === "home" && index=== 0 ? "Catégories"  : (el.name  || el.categoryName)}</p>
        </li>
      ))}
    </ul>

    {(displayItems.length > itemsPerPage || currentView !== "home" ) && (
      <div className="flex justify-end mt-2 gap-2">
        <button
          onClick={() => setCurrentPage(prev => Math.max(prev - 1, 0))}
          disabled={currentPage === 0}
          className="text-white bg-blue-600 px-3 py-1 rounded hover:bg-blue-700 disabled:opacity-50"
        >
          ⬅ Reculer
        </button>
        <button
          onClick={() =>
            setCurrentPage(prev =>
              (prev + 1) * itemsPerPage < displayItems.length ? prev + 1 : prev
            )
          }
          disabled={(currentPage + 1) * itemsPerPage >= displayItems.length}
          className="text-white bg-blue-600 px-3 py-1 rounded hover:bg-blue-700 disabled:opacity-50"
        >
          ➡ Avancer
        </button>
        {currentView !== "home" && (
          <button
            onClick={goBack}
            className="text-white bg-blue-600 px-3 py-1 rounded hover:bg-blue-700"
          >
            ⬅ Retour
          </button>
        )}
      </div>
    )}
  </div>
  )  
}


