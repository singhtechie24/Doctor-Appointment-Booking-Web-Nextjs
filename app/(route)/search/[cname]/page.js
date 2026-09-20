"use client"
import DoctorList from '@/app/_components/DoctorList';
import GlobalApi from '@/app/_utils/GlobalApi'
import React, { useEffect, useState } from 'react'

function search({params}) {
  const resolvedParams = React.use(params);
  const [doctorList,setDoctorList]=useState([]);
  const decodedTerm = decodeURIComponent(resolvedParams?.cname || '');

  useEffect(()=>{
    getDoctors();
  },[resolvedParams?.cname])

  const getDoctors=()=>{
    // Fetch all doctors with full population
    GlobalApi.getDoctorList().then(resp=>{
      const allDoctors = resp.data.data || [];
      const term = decodedTerm.toLowerCase().trim();

      // Match by either Doctor Name or Category Name
      const filtered = allDoctors.filter(doc => {
        const nameMatch = doc.attributes?.Name?.toLowerCase().includes(term);
        const categoryMatch = doc.attributes?.categories?.data?.some(c => 
          c.attributes?.Name?.toLowerCase().includes(term)
        );
        return nameMatch || categoryMatch;
      });

      setDoctorList(filtered);
    });
  }

  return (
    <div className='mt-5'>
      <DoctorList heading={`Results for "${decodedTerm}"`}
      doctorList={doctorList}
      />
    </div>
  )
}

export default search