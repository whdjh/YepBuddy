'use client';

import { useState } from "react";
import SearchIcon from "@/asset/ic/ic_search.svg"

interface searchInputProps {
  onSearch: (value: string) => void;
  placeholder: string;
}

export default function SearchInput({ onSearch, placeholder }: searchInputProps) {
  const [searchItem, setSearchItem] = useState('');

  const handleSearch = (value: string) => {
    setSearchItem(value);
    onSearch(value);
  }

  const handleButtonClick = () => {
    onSearch(searchItem);
  }

  return (
    <>
      <input 
        value={searchItem}
        onChange={(e) => handleSearch(e.target.value)}
        placeholder={placeholder}
        className="`h-[2rem] w-full rounded-lg border-0 bg-[#34343A] px-[1rem] py-[1rem]"
      />
      <button
        type="button"
        onClick={handleButtonClick}
        className="absolute right-10 translate-y-3.5"
        aria-label="검색 버튼"
      >
        <SearchIcon />
      </button>
    </>
  )
}