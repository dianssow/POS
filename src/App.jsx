import { useSelector, useDispatch } from "react-redux"
import Cart from "./components/Cart"
import ProductsList from "./components/ProductsList"
import Quantity from "./components/Quantity"
import { useRef, useState, useEffect } from "react"
import PaymentPanel from "./components/Payment/PaymentPanel"
import {clearCart, setSelected, setEnteredQuantityForPrice, setEnteredQuantityForQuantity, setEnteredBuffer, toggleReturnMode, addToCart}  from "./features/cart"
import {removeFromCart}  from "./features/cart"
import { products } from "./features/products"
import { logout } from "./features/loginPage"
import loginPage from "./features/loginPage"
import LoginPage from "./components/LoginPage"
import Client from "./components/Client" 
import CashPanel from "./components/cashPanel/CashPanel"
import PayButton from "./components/Payment/PayButton"
import { saveToWaiting,clearWaiting } from "./features/waitingButton"
import { toggleWholesaleMode } from "./features/cart"
import { checkSessionAndSync } from "./utils/shiftManager"
import { initialDataCaching } from "./utils/cacheManager"





function App() { 

 // -----------Gestion Quantité/Prix/suppression-----
  const dispatch = useDispatch()
  const[errorMessage, setErrorMessage] = useState("")
  const  cartItems = useSelector(state => state.cart.items) 
  const [selectedClient, setSelectedClient] = useState(null)
  const [showSelector, setShowSelector] = useState(false)
  const[showCashPanel, setShowCashPanel] = useState(false)
  const enteredBuffer = useSelector(state => state.cart.enteredBuffer)
  const enteredQuantityForPrice = useSelector(state => state.cart.enteredQuantityForPrice)
  const enteredQuantityForQuantity = useSelector(state => state.cart.enteredQuantityForQuantity)
  const isWholesaleMode = useSelector(state => state.cart.isWholesaleMode)
  const isReturnMode = useSelector(state => state.cart.isReturnMode)
  const quantityRef = useRef()


  


  const handleClear = () => {      
  dispatch(setEnteredBuffer(""));
  dispatch(setEnteredQuantityForQuantity(""));
  dispatch(setEnteredQuantityForPrice(""));
 }
  const handleMultiply = () => {
    dispatch(setEnteredQuantityForQuantity(enteredBuffer))
    dispatch(setEnteredBuffer(""))
    quantityRef.current?.clearBufferOnly
  }

  const handlePriceClick = () => {
    dispatch(setEnteredQuantityForPrice(enteredBuffer))
    dispatch(setEnteredBuffer(""))
    quantityRef.current?.clearBufferOnly

  }
      // --------Calcul Total Panier--------

      const  items = useSelector(state => state.cart.items) || []
      const  waiting = useSelector(state => state.waiting) || []

      const totalPanier = items.reduce((acc, item) => {

              const price = parseFloat((item.price ?? '0' ).toString().replace(',', '.')).toFixed(2)
              const quantity = Number(item.quantity)
              const total = price * quantity
              return acc + (isNaN(total) ? 0 : total)
    }, 0)

    

    

    
    

    // PaymentConfirmation---------------------

    const [showPaymentView, setShowPaymentView] = useState(false)

    const handlePaymentConfirm = async (saleData) => { 
      setShowPaymentView(false)
        dispatch(clearCart())
      setSelectedClient(null)
     
    }
 
    // Suppression de produit------
      const selectedProduct = useSelector(state => state.cart.selected)
    
      const handleSelect = (product) => {
        dispatch(setSelected(product)
        )
      }

    const handleDelete = () => {
      if(selectedProduct) {
        dispatch(removeFromCart(selectedProduct.id))
      }
    }

            //   Panier en attente-------

            const waitingSlots = ["waiting1", "waiting2"]

            const handleSave = (requestedSlot) => {
              if(!waiting[requestedSlot]) {
                dispatch(saveToWaiting({waiting:requestedSlot, cart: items, client: selectedClient}))
                  dispatch(clearCart())
                  setSelectedClient(null)
                  return 
                } 

                const alternativSlot = waitingSlots.find(slot => !waiting[slot])

                if(alternativSlot) {
                  dispatch(saveToWaiting({waiting:alternativSlot, cart: items, client: selectedClient}))
                  dispatch(clearCart())
                  setSelectedClient(null)

                } else {
                  setErrorMessage("Tous les buttons d'attente sont occupés")
                }
            }

            const handleLoad = (slot) => {
              const savedCart = waiting[slot]
              if(savedCart) {
                const {cart, client} = savedCart
                cart.forEach((item) => dispatch(addToCart(item)))
                if(client) {
                 setSelectedClient(client)
                }
                dispatch(clearWaiting({waiting:slot}))
              }
            }

   



          //   Connexion-----------------

     const user = useSelector ((state) => state.loginPage.user)  
     const token = useSelector((state) => state.loginPage.token) 
      useEffect(() => {
        if (user && token) {
            // Appeler la fonction de synchro
            checkSessionAndSync(token) 
                .then(isSessionOpen => {
                    // Optionnel : mettre à jour un état global si nécessaire
                    console.log(`Initialisation de la session: ${isSessionOpen ? 'OUVERTE' : 'FERMÉE'}`);
                })
                .catch(err => console.error("Erreur d'initialisation de session", err));
        }
   }, [user, token])
   
     useEffect(() => {
      dispatch(logout())
     }, [dispatch])

     useEffect(() => {
      if(navigator.onLine){
        initialDataCaching()
      }
     }, [])

     const handleLogout = () => {
      dispatch(logout())
     }

     useEffect(() => {
    if (errorMessage) {
      const timeout = setTimeout(() => setErrorMessage(""), 3000);
      return () => clearTimeout(timeout);
    }
    }, [errorMessage])

    
   




  return (
    <div className="relative">

    {!user && (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex justify-center items-center"> 
      <LoginPage /> 
    </div>
  )} 
    
    
        {user && (
      <div className="bg-slate-800 w-full   min-h-screen h-[100dvh] mx-auto overflow-hidden text-white p-4 flex flex-col">
        <div className="grid grid-cols-2 gap-4 flex-1 min-h-0 " >

          {/*----------- Bloc gauche------------------- */}

         <div className="  flex flex-col   gap-4 min-h-0 h-full">
          <div className="flex-[4] h-[50%] min-h-0 bg-slate-700 p-4 rounded-2xl shadow overflow-y-auto">
            <Cart/>
            {errorMessage && (
                <div className="text-red-500 text-center text-xl mt-2">{errorMessage}</div>
            )}
          </div>
          <div className="  flex  flex-wrap  items-center bg-slate-700 p-4 gap-3 max-w-full overflow-hidden">
            <div className="flex items-center gp-2 ">
             <span className="font-semibold">
                     CLIENT
                     </span>  
           {selectedClient && (                                  
                  <input 
                  className=" flex px-2 auto  font-bold text-lg border border-gray-300 text-green-400 bg-slate-700 w-44 text-right rounded min-w-[13ch] "
                 type="text"
                 value={selectedClient?.name || ""}
                 onChange={(e) => setSelectedClient({...selectedClient, name: e.target.value})}
                                      /> 
                                        )}  
          </div>
              <div className="flex items-center gp-2 ">
            <span className="font-semibold">
              TOTAL 
              </span>
           {items.length > 0 && (
                          
          <input 
          className="flex  auto  font-bold text-lg border border-gray-300 text-green-400 bg-slate-700 w-24 text-right rounded min-w-[13ch] "
          type="text"
          readOnly
          value={totalPanier.toLocaleString('fr-GN')}
          
          /> 
    
    )}
</div>
     
             </div>

          
          <div className="flex  bg-slate-700 p-4 rounded-2xl shadow  h-[40%] w-full gap-4">
         <div className="flex flex-col gap-2 w-[65%]  h-full ">
            
            <input
             type="number"
             value={enteredBuffer}
             placeholder="Nombre Ecrit"
             readOnly
             className="flex-1 bg-slate-600    text-white px-2 py-1 rounded focus:outline-none focus:ring-0"/>

            <input
             type="number"
             value={ enteredQuantityForQuantity}
             onChange={(e) => dispatch(setEnteredQuantityForQuantity(e.target.value))}
             placeholder="Quantité"
             className="flex-1 bg-slate-600   text-white px-2 py-1 rounded focus:outline-none focus:ring-0
                "/>

            <input
             type="number"
             value={enteredQuantityForPrice }
             onChange={(e) => dispatch(setEnteredQuantityForPrice(e.target.value))}
             placeholder="Prix"
             className="flex-1 bg-slate-600   text-white px-2 py-1 rounded focus:outline-none focus:ring-0 
             "/>
          </div>
           <div className="flex flex-col gap-2 justify-center w-[35%] ">
            <div className="flex gap-2 ">
            <button
            onClick={() => (items.length > 0 ? handleSave("waiting1") : handleLoad("waiting1"))}
            className=" flex-1   bg-orange-100 text-black py-5 rounded">{waiting.waiting1 ? "Recup 1" : "Attente 1"} </button>
            <button 
            onClick={() => (items.length > 0 ? handleSave("waiting2") : handleLoad("waiting2"))}
            className=" flex-1   bg-orange-100 text-black py-5 rounded">{waiting.waiting2 ? "Recup 2" : "Attente 2"}
            </button>
            </div >
               <div className="flex gap-2 w-full mt-2">
                    <button
              onClick={() => dispatch(toggleReturnMode())}
               className= { `flex-1 w-full   rounded ${isReturnMode ? 'bg-slate-800 text-white': 'bg-orange-100 text-black'}` } >
                Retour
               </button>
               <button 
               onClick={handleClear}
               className="flex-1 w-full  bg-orange-100 text-black py-5 rounded">Effacer</button>
               </div>
           </div>
          </div>
         </div>
            

          {/*----------- Bloc droit------------------- */}

          <div className="flex flex-col mx-auto min-h-0 overflow-hidden w-full  gap-4">
          <div className=" flex-[0.55] bg-slate-700 p-4 rounded-2xl shadow  overflow-y-auto">
            <ProductsList 
            quantityRef={quantityRef}/>
          </div>
          
          <div className="flex flex-[0.45] min-h-0 gap-4 items-stretch">
            <div className="flex flex-col h-full gap-2 w-[75px]">
              <button 
              onClick={handleMultiply}
              className=" flex-1  w-full  bg-orange-100 text-black rounded">x</button>
              <button
              onClick={handlePriceClick}
              className=" flex-1  w-full  bg-orange-100 text-black rounded">Prix</button>
              <button
              onClick={() => dispatch(toggleWholesaleMode())}
               className= { `flex-1 w-full   rounded ${isWholesaleMode? 'bg-slate-800 text-white': 'bg-orange-100 text-black'}` } >
                En Gros
                </button>
              <button 
              onClick={handleDelete}
              className=" flex-1  w-full  bg-orange-100 text-black rounded"
              >Supprimer</button>
              
             </div> 

          <div className="flex-1   bg-slate-700 p-4 rounded-2xl shadow ">
              <Quantity ref={quantityRef} setEnteredBuffer={setEnteredBuffer} /> 
          </div>
          <div className="flex flex-col  gap-2 w-[75px] h-full">
              <button 
              onClick={() => setShowCashPanel(true)}
              className="flex-1 w-full  bg-orange-100 text-black rounded">Fonction</button>
              <button 
              onClick={() => setShowSelector(true)}
              className="flex-1 w-full  bg-orange-100 text-black rounded">Clients</button>
              <button
              onClick={handleLogout}
              className="flex-1 w-full  bg-orange-100 text-black rounded"> Logout </button>
              <PayButton cartItems={cartItems} setShowPaymentView={setShowPaymentView }  setErrorMessage={setErrorMessage}  />
              
            </div>
            {showCashPanel && (
             <CashPanel onClose={() => setShowCashPanel(false)} />
            )}
            {showSelector && (
        <Client
          onSelect={setSelectedClient}
          onClose={() => setShowSelector(false)}
        />
      )}

         </div>
         
          </div>

        </div>
    </div>
    )}

    {showPaymentView && (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <PaymentPanel 
      selectedClient={selectedClient}
      onCancel={() => setShowPaymentView(false)} 
      onConfirm={handlePaymentConfirm}
      /> 

</div>

)} 



      
    </div>
  )
}


export default App
