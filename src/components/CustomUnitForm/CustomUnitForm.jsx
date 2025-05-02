import React, { useState, useEffect } from 'react';
import PropTypes from 'prop-types';
import styles from './CustomUnitForm.module.css';
// Assuming a Button component exists or use standard <button>
// import Button from '../Button/Button';

// Simple validation helper (more robust needed for production)
const validateField = (name, value, formData, categories) => {
  switch (name) {
    case 'name':
      return !value.trim() ? 'Name is required.' : null;
    case 'symbol':
      if (!value.trim()) return 'Symbol is required.';
      if (!/^[a-zA-Z0-9_.-]+$/.test(value)) return 'Symbol can only contain letters, numbers, _, ., -';
      // Add check for uniqueness later if needed here
      return null;
    case 'categoryId':
      return !value ? 'Category is required.' : null;
    case 'factorToBase':
      const num = parseFloat(value);
      if (isNaN(num) || num <= 0) return 'Factor must be a positive number.';
      return null;
    default:
      return null;
  }
};

const CustomUnitForm = ({
  initialData = null,
  onSubmit,
  onCancel,
  categories = [], // Expecting format [{ id, name, baseUnitSymbol }, ...]
}) => {
  const [formData, setFormData] = useState({
    name: initialData?.name || '',
    symbol: initialData?.symbol || '',
    categoryId: initialData?.categoryId || '',
    factorToBase: initialData?.factorToBase || '',
  });
  const [errors, setErrors] = useState({});

  // Find base unit symbol for the selected category
  const baseUnitSymbol = categories.find(cat => cat.id === formData.categoryId)?.baseUnitSymbol || 'N/A';

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));

    // Basic live validation
    const error = validateField(name, value, formData, categories);
    setErrors(prev => ({ ...prev, [name]: error }));

    // If category changes, clear factor
    if (name === 'categoryId') {
      setFormData(prev => ({ ...prev, factorToBase: '' }));
      setErrors(prev => ({ ...prev, factorToBase: null }));
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    let formIsValid = true;
    const currentErrors = {};

    // Validate all fields on submit
    Object.entries(formData).forEach(([key, value]) => {
      const error = validateField(key, value, formData, categories);
      if (error) {
        formIsValid = false;
        currentErrors[key] = error;
      }
    });

    setErrors(currentErrors);

    if (formIsValid) {
      const submissionData = {
        ...formData,
        factorToBase: parseFloat(formData.factorToBase),
        // Include ID if editing
        ...(initialData?.id && { id: initialData.id }),
      };
      onSubmit(submissionData);
    }
  };

  return (
    <form onSubmit={handleSubmit} className={styles.formContainer} noValidate>
      <h3 className={styles.title}>{initialData ? 'Edit' : 'Create'} Custom Unit</h3>

      <div className={styles.formGroup}>
        <label htmlFor="custom-unit-name">Name:</label>
        <input
          type="text"
          id="custom-unit-name"
          name="name"
          value={formData.name}
          onChange={handleChange}
          aria-invalid={!!errors.name}
          aria-describedby={errors.name ? "name-error" : undefined}
          required
        />
        {errors.name && <p id="name-error" className={styles.errorText}>{errors.name}</p>}
      </div>

      <div className={styles.formGroup}>
        <label htmlFor="custom-unit-symbol">Symbol:</label>
        <input
          type="text"
          id="custom-unit-symbol"
          name="symbol"
          value={formData.symbol}
          onChange={handleChange}
          aria-invalid={!!errors.symbol}
          aria-describedby={errors.symbol ? "symbol-error" : undefined}
          required
        />
        {errors.symbol && <p id="symbol-error" className={styles.errorText}>{errors.symbol}</p>}
      </div>

      <div className={styles.formGroup}>
        <label htmlFor="custom-unit-category">Category:</label>
        <select
          id="custom-unit-category"
          name="categoryId"
          value={formData.categoryId}
          onChange={handleChange}
          aria-invalid={!!errors.categoryId}
          aria-describedby={errors.categoryId ? "category-error" : undefined}
          required
        >
          <option value="">-- Select Category --</option>
          {categories.map(cat => (
            <option key={cat.id} value={cat.id}>{cat.name}</option>
          ))}
        </select>
        {errors.categoryId && <p id="category-error" className={styles.errorText}>{errors.categoryId}</p>}
      </div>

      {formData.categoryId && (
        <div className={styles.formGroup}>
          <label htmlFor="custom-unit-factor">Conversion Factor (1 custom unit = ? {baseUnitSymbol}):</label>
          <input
            type="number"
            id="custom-unit-factor"
            name="factorToBase"
            value={formData.factorToBase}
            onChange={handleChange}
            step="any" // Allow decimals
            min="0.0000000001" // Smallest positive number
            aria-invalid={!!errors.factorToBase}
            aria-describedby={errors.factorToBase ? "factor-error" : undefined}
            required
            placeholder={`e.g., 0.3048 for Feet (if base is Meter)`}
          />
          <p className={styles.helpText}>Enter how many base units ({baseUnitSymbol}) make up 1 of your custom unit.</p>
          {errors.factorToBase && <p id="factor-error" className={styles.errorText}>{errors.factorToBase}</p>}
        </div>
      )}

      <div className={styles.buttonGroup}>
        <button type="button" onClick={onCancel} className={`${styles.button} ${styles.cancelButton}`}>Cancel</button>
        <button type="submit" className={`${styles.button} ${styles.submitButton}`}>{initialData ? 'Save Changes' : 'Create Unit'}</button>
      </div>
    </form>
  );
};

CustomUnitForm.propTypes = {
  initialData: PropTypes.object,
  onSubmit: PropTypes.func.isRequired,
  onCancel: PropTypes.func.isRequired,
  categories: PropTypes.arrayOf(PropTypes.shape({
    id: PropTypes.string.isRequired,
    name: PropTypes.string.isRequired,
    baseUnitSymbol: PropTypes.string.isRequired,
  })).isRequired,
};

export default CustomUnitForm; 