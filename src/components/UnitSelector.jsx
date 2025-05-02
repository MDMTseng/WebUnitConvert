import React from 'react';
import styled from 'styled-components';

const SelectWrapper = styled.div`
  /* Basic styling */
  margin-bottom: 1rem;
`;

const Label = styled.label`
  display: block;
  margin-bottom: 0.5rem;
  color: ${({ theme }) => theme.text};
`;

const Select = styled.select`
  width: 100%;
  padding: 0.5rem;
  border: 1px solid ${({ theme }) => theme.inputBorder};
  border-radius: 4px;
  background-color: ${({ theme }) => theme.inputBg};
  color: ${({ theme }) => theme.text};
`;

const UnitSelector = ({ label, units, selectedUnit, onChange, id }) => {
  return (
    <SelectWrapper>
      <Label htmlFor={id}>{label}:</Label>
      <Select id={id} value={selectedUnit} onChange={onChange}>
        {/* Populate with units later */}
        {units && units.length > 0 ? (
          units.map((unit) => (
            <option key={unit.symbol} value={unit.symbol}>
              {unit.name} {unit.name_zh ? `(${unit.name_zh})` : ''} ({unit.symbol})
            </option>
          ))
        ) : (
          <option value="" disabled>
            Select category first
          </option>
        )}
      </Select>
    </SelectWrapper>
  );
};

export default UnitSelector; 