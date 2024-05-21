import React from 'react';

import axios from 'axios';

import { Link, useNavigate } from 'react-router-dom'
import { AuthContext } from '../../Provider/AuthContextProvider';
import Spinner from '../../Component/Spinner/Spinner';
import { useContext } from 'react';
import { useState } from 'react';
import { useEffect } from 'react'; 
const Results = ({setTitle}) => {
    const navigate = useNavigate()
    const { registerUser, user, logOut, loginUser, isLogged, setIsLogged, isAdmin, isInstructor } = useContext(AuthContext);


    const { toastPush } = useContext(AuthContext);


    const [loading, setLoading] = useState(true)
    const [renderData, setRenderData] = useState(null);
    const [myClassesData, setmyClassesData] = useState(null)
    const [currentID, setCurrentID] = useState(null)
    const [feedbackDetails, setfeedbackDetails] = useState(null)



  


    const [elections, setElections] = useState([]);
    useEffect(() => {
        setTitle('Ongoing Elections')
        if (loading) {
            axios.get(`/candidates`)
                .then(response => {
                    let data = response.data
                    console.log(data)
                    setElections(data)
                    setLoading(false)
                })
        }
    }, []);
return (
    <div className='px-[20%]'>
            {loading?<Spinner/>: elections.map((e) => (
                    <div key={e._id} className="flex items-center hover:scale-105 transition-all duration-300 ease-out gap-10 justify-between border px-2 md:px-10 py-5 rounded-lg shadow-lg md:w-[80%] mx-auto">
                      <div>
                        <img
                          src={e.photoURL}
                          alt="Option 1"
                          className="mt-2 w-auto h-20 rounded-lg object-cover"
                        />
                        <h3 className="text-xs font-light text-center text-gray-400 pt-1">
                          Vote Count : {e.vote }</h3>

                      </div>
                      <h2 className="text-xl font-medium text-center text-gray-600">
                        {e.name}
                      </h2>
                    
                    </div>
                  ))}
    </div>)
};

export default Results;
