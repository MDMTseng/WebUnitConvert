import React from 'react';
import { 
  FormControl, 
  InputLabel, 
  Select as MuiSelect, 
  MenuItem, 
  Box 
} from '@mui/material';

const UnitSelector = ({ label, units, selectedUnit, onChange, id }) => {
  const labelId = `${id}-label`;
  
  return (
    <Box sx={{ mb: 2 }}>
      <FormControl fullWidth variant="outlined">
        <InputLabel id={labelId}>{label}</InputLabel>
        <MuiSelect
          labelId={labelId}
          id={id}
          value={selectedUnit}
          onChange={onChange}
          label={label}
        >
          {units && units.length > 0 ? (
            units.map((unit) => (
              <MenuItem key={unit.symbol} value={unit.symbol}>
                {unit.name} {unit.name_zh ? `(${unit.name_zh})` : ''} ({unit.symbol})
              </MenuItem>
            ))
          ) : (
            <MenuItem value="" disabled>
              Select category first
            </MenuItem>
          )}
        </MuiSelect>
      </FormControl>
    </Box>
  );
};

export default UnitSelector; 