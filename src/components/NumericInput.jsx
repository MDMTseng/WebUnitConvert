import React from 'react';
import styled from 'styled-components';

const InputWrapper = styled.div`
  margin-bottom: 1rem;
`;

const Label = styled.label`
  display: block;
  margin-bottom: 0.5rem;
  color: ${({ theme }) => theme.text};
`;

const Input = styled.input`
  width: 100%;
  padding: 0.5rem;
  border: 1px solid ${({ theme }) => theme.inputBorder};
  border-radius: 4px;
  background-color: ${({ theme }) => theme.inputBg};
  color: ${({ theme }) => theme.text};

  &[type='number'] {
    -moz-appearance: textfield;
  }
  &::-webkit-outer-spin-button,
  &::-webkit-inner-spin-button {
    -webkit-appearance: none;
    margin: 0;
  }
`;

const NumericInput = ({ label, value, onChange, id, placeholder = 'Enter value' }) => {
  const handleChange = (e) => {
    const val = e.target.value;
    if (val === '' || val === '-' || /^-?\d*\.?\d*$/.test(val)) {
      onChange(val);
    }
  };

  return (
    <InputWrapper>
      <Label htmlFor={id}>{label}:</Label>
      <Input
        type="text"
        pattern="^-?\d*\.?\d*$"
        inputMode="decimal"
        id={id}
        value={value}
        onChange={handleChange}
        placeholder={placeholder}
      />
    </InputWrapper>
  );
};

export default NumericInput;
