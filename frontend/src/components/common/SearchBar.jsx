import React, { useState } from 'react';
import {
  Paper,
  InputBase,
  IconButton,
  Box,
  Autocomplete,
  TextField,
} from '@mui/material';
import { Search, Clear } from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';

const SearchBar = ({ suggestions = [], onSearch, placeholder = "Search products..." }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const navigate = useNavigate();

  const handleSearch = () => {
    if (searchTerm.trim()) {
      if (onSearch) {
        onSearch(searchTerm);
      } else {
        navigate(`/products?search=${encodeURIComponent(searchTerm)}`);
      }
    }
  };

  const handleKeyPress = (event) => {
    if (event.key === 'Enter') {
      handleSearch();
    }
  };

  const handleClear = () => {
    setSearchTerm('');
    if (onSearch) {
      onSearch('');
    }
  };

  return (
    <Paper
      component="form"
      sx={{
        p: '2px 4px',
        display: 'flex',
        alignItems: 'center',
        width: '100%',
        maxWidth: 600,
      }}
      onSubmit={(e) => {
        e.preventDefault();
        handleSearch();
      }}
    >
      {suggestions.length > 0 ? (
        <Autocomplete
          freeSolo
          options={suggestions}
          value={searchTerm}
          onChange={(event, newValue) => {
            setSearchTerm(newValue || '');
          }}
          onInputChange={(event, newInputValue) => {
            setSearchTerm(newInputValue);
          }}
          renderInput={(params) => (
            <TextField
              {...params}
              placeholder={placeholder}
              variant="standard"
              InputProps={{
                ...params.InputProps,
                disableUnderline: true,
              }}
              sx={{ ml: 1, flex: 1 }}
            />
          )}
          sx={{ flex: 1 }}
        />
      ) : (
        <InputBase
          sx={{ ml: 1, flex: 1 }}
          placeholder={placeholder}
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          onKeyPress={handleKeyPress}
        />
      )}
      
      {searchTerm && (
        <IconButton
          type="button"
          sx={{ p: '10px' }}
          aria-label="clear"
          onClick={handleClear}
        >
          <Clear />
        </IconButton>
      )}
      
      <IconButton
        type="submit"
        sx={{ p: '10px' }}
        aria-label="search"
        onClick={handleSearch}
      >
        <Search />
      </IconButton>
    </Paper>
  );
};

export default SearchBar;