import { useState, useImperativeHandle, forwardRef } from "react"
import { setEnteredQuantityForQuantity, setEnteredQuantityForPrice, setEnteredBuffer, setEnteredGivenAmount, setEnteredPaymentBuffer } from "../features/cart"
import { useDispatch, useSelector } from "react-redux"


const Quantity = forwardRef(({mode}, ref) => {  
    const buffer = useSelector(state => state.cart.enteredBuffer);
    const bufferPay = useSelector(state => state.cart.enteredPaymentBuffer)
    const dispatch = useDispatch()


      const currentBuffer = mode === "payment" ? bufferPay : buffer
    const updateBuffer = mode === "payment" ? setEnteredPaymentBuffer : setEnteredBuffer

     

    const handleDigitClick = (n) => { 
       const digit = n.toString();
        const updated = currentBuffer + digit;

        if (mode === "payment") {
            dispatch(setEnteredPaymentBuffer(updated));
            dispatch(setEnteredGivenAmount(updated));  // pour paiement
        } else {
            dispatch(setEnteredBuffer(updated));        // mode normal
        }
    }
    //   if (enteredQuantityTarget === "quantity") {
    //     dispatch(setEnteredQuantityForQuantity(updated))

    //     } 
    //   else if (enteredQuantityTarget === "price") {
    //     dispatch(setEnteredQuantityForPrice(updated))
         

    // }  


    useImperativeHandle(ref, () => ({
     clear: () =>{   
        dispatch(setEnteredBuffer(""))
    },
    clearBufferOnly: () => {
        dispatch(setEnteredBuffer(""))
    },
     multiply: () => {
         const number = parseInt(buffer)
         return isNaN(number) ? 1 : number 

     },
     getQuantity: () => buffer,
     getNumber:   () => buffer,
    }))

  return (                                                 
    <div className=" w-full h-full grid grid-cols-3 gap-3">
        {[1,2,3,4,5,6,7,8,9,0,"00","000"].map(n => (
            <button
            key={n}
            onClick={() => handleDigitClick(n)}
            className={`bg-slate-500
             text-white rounded-xl text-xl hover:scale-105 transition-transform `}
            >
                {n}
            </button>
        ))}
    
    </div>

  )})
export default  Quantity 