"use client"
import axios from 'axios'
import React, { useEffect, useState } from 'react'


const Nyse = () => {

const [data,setData] = useState(null);
const [loading,setLoading] = useState(true); 


// Lorsque le composant est chargé
useEffect(() => {
   const fetchData = async ()  =>{
    try{
        const response = await axios.get('');
        setData(response.data);
    }catch(e){
        console.log(e)
    } finally {
        setLoading(false);
    }
   }
   fetchData();
}, [])

  return (
    <div>
        {loading ? (
            <p>Chargement</p>
        ):(
            <p>
            <p>Les data sont la !</p>
            {data && 
                data.map(item)
            }
            <ul>Les data sont la !</ul>
            </p>
        )}
    </div>
  )
}

export default Nyse
