import React, { useEffect, useState } from 'react';

const OurTeam = ({setTitle}) => {

    const [teamList, setTeamList] = useState([
        {
            name:"Raihan Miraj",
            img:"https://i.ibb.co/r4Rf8VP/IMG-4649-03-2.jpg",
            roll:349,
            reg:2891,
            exam_roll:4032
        },
        {
            name:"MD. Farhan Shariar",
            img:"https://i.ibb.co/J219hFk/Whats-App-Image-2024-05-21-at-02-41-04-aabc1bfa.jpg",
            roll:365,
            reg:845,
            exam_roll:4022
        },
        {
            name:"Sadman Abdullah Mahee",
            img:"https://i.ibb.co/RT41hMn/IMG-20240222-133354-290.jpg",
            roll:362,
            reg:830,
            exam_roll:4039
        },
        {
            name:"Nazmul Hasan",
            img:"https://i.ibb.co/Jt3JndS/me.jpg",
            roll:359,
            reg:2901,
            exam_roll:4038
        },
    ])

    useEffect(() => {
    setTitle('Team')
    }, []);
    return (
        <div className='min-h-[100vh] py-10 md:py-32 w-[90%] md:w-[90%] mx-auto grid gap-5 grid-cols-1 md:grid-cols-4'>

{
    teamList.map(e=><div className=" w-full h-fit border rounded-lg hover:scale-105  transition-all ease-in-out duration-700 bg-gray-100 shadow-xl">
    <div className='aspect-square overflow-hidden'>
    <img src={e.img} alt={e.name} className='rounded mx-auto w-full' />
    </div>
     <div className="pb-7 pt-4">
         <h2 className="text-xl text-center text-gray-600 font-bold">
      {e.name}
         </h2>
         <p className='text-center text-gray-500'>Exam Roll : {e.exam_roll} </p>  
         <p className='text-center text-gray-500'>Class Roll : {e.roll} </p>  
         <p className='text-center text-gray-500'>Reg. No : {e.reg} </p>  
     </div>
 </div>)

}
           
            
            
           
        </div>
    );
};

export default OurTeam;