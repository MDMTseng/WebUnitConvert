import React from 'react';
import { 
  FormControl, 
  InputLabel, 
  Select as MuiSelect, 
  MenuItem, 
  Box 
} from '@mui/material';

const CategorySelector = ({ categories, selectedCategory, onChange }) => {
  return (
    <Box sx={{ mb: 2 }}>
      <FormControl fullWidth variant="outlined">
        <InputLabel id="category-select-label">Category</InputLabel>
        <MuiSelect
          labelId="category-select-label"
          id="category-select"
          value={selectedCategory}
          onChange={onChange}
          label="Category"
        >
          {categories && categories.length > 0 ? (
            categories.map((cat) => (
              <MenuItem key={cat.id} value={cat.id}>
                {cat.name}
              </MenuItem>
            ))
          ) : (
            <MenuItem value="" disabled>
              Loading...
            </MenuItem>
          )}
        </MuiSelect>
      </FormControl>
    </Box>
  );
};

export default CategorySelector; 