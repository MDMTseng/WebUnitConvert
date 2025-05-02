import React, { useState, useEffect, useCallback, useRef } from 'react';
import PropTypes from 'prop-types';
import styles from './CustomUnitManager.module.css';
import CustomUnitForm from '../CustomUnitForm/CustomUnitForm';
import {
  getCustomUnits,
  addCustomUnit,
  updateCustomUnit,
  deleteCustomUnit,
  exportCustomUnits,
  importCustomUnits
} from '../../utils/customUnitUtils';
// Assuming a Modal component exists
// import Modal from '../Modal/Modal';

// Placeholder for a proper Modal component
const Modal = ({ isOpen, onClose, title, children }) => {
  if (!isOpen) return null;
  return (
    <div className={styles.modalOverlay}>
      <div className={styles.modalContent}>
        <div className={styles.modalHeader}>
          <h2>{title}</h2>
          <button onClick={onClose} className={styles.closeButton}>&times;</button>
        </div>
        {children}
      </div>
    </div>
  );
};
Modal.propTypes = { isOpen: PropTypes.bool, onClose: PropTypes.func, title: PropTypes.string, children: PropTypes.node };

const CustomUnitManager = ({ categories }) => {
  const [customUnits, setCustomUnits] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingUnit, setEditingUnit] = useState(null); // null for create, object for edit
  const [importResult, setImportResult] = useState(null); // For import feedback
  const fileInputRef = useRef(null); // Ref for hidden file input

  const loadUnits = useCallback(() => {
    setIsLoading(true);
    setError(null);
    try {
      const units = getCustomUnits();
      setCustomUnits(units);
    } catch (err) {
      console.error("Failed to load custom units:", err);
      setError("Failed to load custom units.");
    }
    setIsLoading(false);
  }, []);

  useEffect(() => {
    loadUnits();
  }, [loadUnits]);

  const handleOpenCreateForm = () => {
    setEditingUnit(null);
    setIsFormOpen(true);
  };

  const handleOpenEditForm = (unit) => {
    setEditingUnit(unit);
    setIsFormOpen(true);
  };

  const handleDeleteUnit = (id) => {
    if (window.confirm("Are you sure you want to delete this custom unit?")) {
      const result = deleteCustomUnit(id);
      if (result.success) {
        loadUnits(); // Refresh the list
      } else {
        setError(result.message || "Failed to delete unit.");
      }
    }
  };

  const handleFormSubmit = (unitData) => {
    setError(null);
    setImportResult(null); // Clear import feedback
    let result;
    if (editingUnit?.id) {
      // Update existing unit
      result = updateCustomUnit(unitData); // updateCustomUnit expects the full unit including ID
    } else {
      // Add new unit
      result = addCustomUnit(unitData);
    }

    if (result.success) {
      setIsFormOpen(false);
      loadUnits(); // Refresh list
    } else {
      // Display error (could be passed to the form component later)
      setError(result.message || "Failed to save unit.");
      // Keep form open if there was an error
    }
  };

  const handleExportClick = () => {
    setImportResult(null); // Clear feedback
    exportCustomUnits();
  };

  const handleImportClick = () => {
    setImportResult(null); // Clear feedback
    // Trigger click on the hidden file input
    fileInputRef.current?.click();
  };

  const handleFileChange = async (event) => {
    const file = event.target.files?.[0];
    if (!file) return;

    setIsLoading(true); // Show loading indicator during import
    setError(null);
    const result = await importCustomUnits(file);
    setImportResult(result); // Store result for feedback

    if (result.success) {
      loadUnits(); // Refresh the list if successful
    } else {
      setError(result.error || "Import failed.");
      setIsLoading(false);
    }
    // Reset file input value so the same file can be selected again
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  return (
    <div className={styles.managerContainer}>
      <div className={styles.header}>
          <h3>Manage Custom Units</h3>
          <div className={styles.headerActions}>
              <button onClick={handleImportClick} className={`${styles.actionButton} ${styles.importButton}`}>Import Units</button>
              <button onClick={handleExportClick} className={`${styles.actionButton} ${styles.exportButton}`}>Export Units</button>
              <button onClick={handleOpenCreateForm} className={styles.createButton}>+ Create New Unit</button>
              {/* Hidden file input */}
              <input
                  type="file"
                  ref={fileInputRef}
                  onChange={handleFileChange}
                  accept=".json"
                  style={{ display: 'none' }}
              />
          </div>
      </div>

      {/* Display Import Result Feedback */}
      {importResult && (
          <p className={importResult.success ? styles.successText : styles.errorText}>
              Import {importResult.success ? 'successful' : 'failed'}: Added {importResult.addedCount}, Skipped {importResult.skippedCount}.
              {!importResult.success && importResult.error && ` Error: ${importResult.error}`}
          </p>
      )}

      {isLoading && <p>Loading custom units...</p>}
      {!isLoading && error && !importResult?.error && <p className={styles.errorText}>{error}</p>}

      {!isLoading && customUnits.length === 0 && (
        <p>You haven't created any custom units yet.</p>
      )}

      {!isLoading && customUnits.length > 0 && (
        <table className={styles.unitsTable}>
          <thead>
            <tr>
              <th>Name</th>
              <th>Symbol</th>
              <th>Category</th>
              <th>Factor (to Base)</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {customUnits.map(unit => {
              const categoryName = categories.find(c => c.id === unit.categoryId)?.name || unit.categoryId;
              return (
                <tr key={unit.id}>
                  <td>{unit.name}</td>
                  <td>{unit.symbol}</td>
                  <td>{categoryName}</td>
                  <td>{unit.factorToBase}</td>
                  <td>
                    <button onClick={() => handleOpenEditForm(unit)} className={`${styles.actionButton} ${styles.editButton}`}>Edit</button>
                    <button onClick={() => handleDeleteUnit(unit.id)} className={`${styles.actionButton} ${styles.deleteButton}`}>Delete</button>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      )}

      <Modal
        isOpen={isFormOpen}
        onClose={() => setIsFormOpen(false)}
        title={editingUnit ? 'Edit Custom Unit' : 'Create Custom Unit'}
      >
        <CustomUnitForm
          key={editingUnit?.id || 'create'} // Force re-render form when editingUnit changes
          initialData={editingUnit}
          onSubmit={handleFormSubmit}
          onCancel={() => setIsFormOpen(false)}
          categories={categories}
        />
      </Modal>
    </div>
  );
};

CustomUnitManager.propTypes = {
  categories: PropTypes.arrayOf(PropTypes.shape({
    id: PropTypes.string.isRequired,
    name: PropTypes.string.isRequired,
    baseUnitSymbol: PropTypes.string.isRequired,
    // Add other category props if needed by the form
  })).isRequired,
};

export default CustomUnitManager; 