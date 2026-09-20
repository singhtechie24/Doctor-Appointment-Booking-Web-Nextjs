"use client"
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Search } from 'lucide-react'
import React, { useEffect, useState } from 'react'
import GlobalApi from '../_utils/GlobalApi'
import Image from 'next/image'
import Link from 'next/link'
import { useRouter } from 'next/navigation'

function CategorySearch() {

  const [categoryList, setCategoryList] = useState([]);
  const [searchInput, setSearchInput] = useState('');
  const router = useRouter();

  useEffect(()=>{
    getCategoryList()
  },[])

  const getCategoryList=()=>{
    GlobalApi.getCategory().then(resp=>{
      console.log(resp.data.data);
      setCategoryList(resp.data.data);
    })
  }

  const handleSearch = () => {
    if (!searchInput.trim()) return;
    // Find if user input matches a category (case-insensitive)
    const matched = categoryList.find(c => 
      c.attributes.Name.toLowerCase().includes(searchInput.toLowerCase())
    );
    const targetName = matched ? matched.attributes.Name : encodeURIComponent(searchInput.trim());
    router.push(`/search/${targetName}`);
  };
  return (
    <div className='mb-10 items-center px-5 flex flex-col gap-2'>
        <h2 className='font-bold text-4xl tracking-wide'>
        Search <span className='text-primary'>Doctors</span></h2>
        <h2 className='text-gray-500 text-xl'>Search Your Doctor and Book Appointment in one click</h2>
        
    <div className="flex w-full mt-3 max-w-sm items-center space-x-2">
      <Input 
        type="text" 
        placeholder="Search doctor or specialty..." 
        value={searchInput}
        onChange={(e) => setSearchInput(e.target.value)}
        onKeyDown={(e) => {
          if (e.key === 'Enter' && searchInput.trim()) {
            handleSearch();
          }
        }}
      />

      {/* 
        PREVIOUS ISSUE & SOLUTION:
        - Pehle: Search button sirf first category (index < 1) pe hardcoded redirect karta tha.
                 Input field me kuch bhi type karo, button click karne par input value use nahi hoti thi.
        - Ab: searchInput state add kiya hai. User specialty ya category type karke
              Search button click kare ya Enter press kare, toh exact matching category search page pe navigate hota hai!
      */}
      <Button type="button" onClick={handleSearch} disabled={!searchInput.trim()}>
        <Search className='h-4 w-4 mr-2'/>
        Search
      </Button>
    </div>
       {/*Display List of Category*/}
       <div className='grid grid-cols-3 mt-5 md:grid-cols-4 lg:grid-cols-6'>
       {categoryList.length>0?categoryList.map((item,index)=>index<6&&(
        <Link href={'/search/' +item.attributes.Name} key={index} className='flex 
        flex-col text-center items-center p-5
         bg-blue-50 m-2 rounded-lg cursor-pointer gap-2 hover:scale-110 transition-all
        ease-in-out'>
          <Image src={item.attributes?.icon?.data.attributes?.url}
          alt='icon'
          width={40}
          height={40}/>
          <label className='text-blue-600 text-sm '>{item.attributes?.Name}</label>
          </Link>
       ))
      :
      [1,2,3,4,5,6].map((item,index)=>(
        <div key={index} className='bg-slate-200 m-2
         w-[130px] h-[120px]  rounded-lg animate-pulse'>
  
        </div>
      ))
     
      }
       </div>
    </div>
  )
}

export default CategorySearch