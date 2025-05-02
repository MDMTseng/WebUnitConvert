import { useContext } from 'react';
import { ConversionContext } from './ConversionContext';

export const useConversionContext = () => {
  const context = useContext(ConversionContext);
  if (context === undefined) {
    throw new Error(
      'useConversionContext must be used within a ConversionProvider'
    );
  }
  return context;
}; 