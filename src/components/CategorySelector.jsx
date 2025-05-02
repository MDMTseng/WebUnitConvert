import React from 'react';
import styled from 'styled-components';

const SelectWrapper = styled.div`
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

const CategorySelector = ({ categories, selectedCategory, onChange }) => {
  return (
    <SelectWrapper>
      <Label htmlFor="category-select">Category:</Label>
      <Select
        id="category-select"
        value={selectedCategory}
        onChange={onChange}
      >
        {/* Populate with categories later */}
        {categories && categories.length > 0 ? (
          categories.map((cat) => (
            <option key={cat.id} value={cat.id}>
              {cat.name}
            </option>
          ))
        ) : (
          <option value="" disabled>
            Loading...
          </option>
        )}
      </Select>
    </SelectWrapper>
  );
};

export default CategorySelector; 