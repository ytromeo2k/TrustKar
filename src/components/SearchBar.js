import React from 'react';
import './SearchBar.css';

const SearchBar = ({ onCategoryClick, onLocationClick }) => {
  return (
    <div className="search-bar">
      <button onClick={onCategoryClick} className="category-button">Category</button>
      <button onClick={onLocationClick} className="location-button">Location</button>
      <input type="text" placeholder="Search..." />
    </div>
  );
};

export default SearchBar;
