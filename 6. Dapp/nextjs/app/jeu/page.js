"use client"
import React, { useState, useEffect } from 'react'

const Jeu = () => {

const [number,setNumber] = useState(0)

const increment = () =>{
    setNumber(number+1);
}

const decrement = () =>{
    setNumber(number-1);
}

// Lorsque le composant est chargé
useEffect(() =>{
    console.log('page changé')
}, [])

 // Le composant number à changé
useEffect(() =>{
    console.log('number à changé')
}, [number])

// à chaque changement sur la page (rendering)
useEffect(() =>{
    console.log('rendering')
})

// au démontage
useEffect(() =>{
    return() =>{
        console.log('démonté')
    }
})


  return (
    <div>
      La variable est à {number};
      <button onClick={increment}>Incrémenter</button>
      <button onClick={decrement}>Decrement</button>  
    </div>
  )
}

export default Jeu
