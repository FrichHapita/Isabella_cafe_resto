import React, { useState } from 'react';
import { Plus, Search, Edit2, Trash2, Coffee, Image as ImageIcon, Upload } from 'lucide-react';
import useStore from '../../store/useStore';

const Items = () => {
  const { items, rawMaterials, addItem, updateItem, deleteItem, showDialog } = useStore();
  const [showModal, setShowModal] = useState(false);
  const [editMode, setEditMode] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');

  const [formData, setFormData] = useState({
    name: '',
    category: 'Coffee',
    sellingPrice: 0,
    costPrice: 0,
    image: '',
    rawMaterials: []
  });

  const handleEdit = (item) => {
    setFormData({
      ...item,
      rawMaterials: item.rawMaterials || []
    });
    setEditMode(true);
    setShowModal(true);
  };

  const handleDelete = (id) => {
    showDialog({
      type: 'confirm',
      title: 'Delete Item',
      message: 'Are you sure you want to delete this item?',
      confirmText: 'Delete',
      onConfirm: () => deleteItem(id)
    });
  };

  const handleAddNew = () => {
    setFormData({ name: '', category: 'Coffee', sellingPrice: 0, costPrice: 0, image: '', rawMaterials: [] });
    setEditMode(false);
    setShowModal(true);
  };

  const addRawToRecipe = () => {
    setFormData({
      ...formData,
      rawMaterials: [...formData.rawMaterials, { rmId: '', qty: 0 }]
    });
  };

  const updateRecipeItem = (index, field, value) => {
    const updated = [...formData.rawMaterials];
    updated[index][field] = field === 'qty' ? Number(value) : value;
    
    let newCost = 0;
    updated.forEach(recipeItem => {
      const rm = rawMaterials.find(m => m.id === recipeItem.rmId);
      if (rm) newCost += (rm.costPerUnit * recipeItem.qty);
    });

    setFormData({ ...formData, rawMaterials: updated, costPrice: Number(newCost.toFixed(2)) });
  };

  const removeRecipeItem = (index) => {
    const updated = formData.rawMaterials.filter((_, i) => i !== index);
    setFormData({ ...formData, rawMaterials: updated });
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setFormData({ ...formData, image: reader.result });
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (editMode) {
      updateItem(formData);
    } else {
      addItem(formData);
    }
    setShowModal(false);
    setFormData({ name: '', category: 'Coffee', sellingPrice: 0, costPrice: 0, image: '', rawMaterials: [] });
  };

  return (
    <div className="inventory-page">
      <div className="page-header">
        <div>
          <h1 className="page-title">Finished Goods (Menu Items)</h1>
          <p className="page-subtitle">Manage products sold in the POS with recipe tracking</p>
        </div>
        <button className="primary-btn" onClick={handleAddNew}>
          <Plus size={18} /> Add Item
        </button>
      </div>

      <div className="premium-card table-card">
        <div className="table-actions">
          <div className="search-box">
            <Search size={18} />
            <input 
              type="text" 
              placeholder="Search menu items..." 
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
        </div>

        <table className="premium-table">
          <thead>
            <tr>
              <th>Item Name</th>
              <th>Category</th>
              <th>Cost Price</th>
              <th>Selling Price</th>
              <th>Recipe</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {items.filter(i => i.name.toLowerCase().includes(searchTerm.toLowerCase())).map(item => {
              return (
                <tr key={item.id}>
                  <td>
                    <div style={{display: 'flex', alignItems: 'center', gap: '10px'}}>
                      <div className="item-thumb-sm">
                        {item.image ? <img src={item.image} alt="" /> : <Coffee size={16} />}
                      </div>
                      <strong>{item.name}</strong>
                    </div>
                  </td>
                  <td>{item.category}</td>
                  <td>₱{item.costPrice?.toLocaleString()}</td>
                  <td className="font-bold">₱{item.sellingPrice?.toLocaleString()}</td>
                  <td>
                    <div className="recipe-tags">
                      {item.rawMaterials?.map((rm, idx) => {
                        const material = rawMaterials.find(m => m.id === rm.rmId);
                        return (
                          <span key={idx} className="recipe-tag">
                            {material?.name}: {rm.qty}{material?.unit}
                          </span>
                        );
                      })}
                    </div>
                  </td>
                  <td>
                    <div className="row-actions">
                      <button className="icon-btn-sm" onClick={() => handleEdit(item)}><Edit2 size={16} /></button>
                      <button className="icon-btn-sm delete" onClick={() => handleDelete(item.id)}><Trash2 size={16} /></button>
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {showModal && (
        <div className="modal-overlay">
          <div className="modal-content premium-card wide-modal">
            <div className="modal-header">
              <h3>{editMode ? 'Edit Menu Item' : 'Create Menu Item & Recipe'}</h3>
            </div>
            <form onSubmit={handleSubmit}>
              <div className="modal-body grid-form">
                <div className="form-column">
                  <div className="form-group full">
                    <label>Product Image</label>
                    <div className="image-upload-container">
                      {formData.image ? (
                        <div className="image-preview">
                          <img src={formData.image} alt="Preview" />
                          <button type="button" className="remove-img" onClick={() => setFormData({...formData, image: ''})}><Trash2 size={14}/></button>
                        </div>
                      ) : (
                        <label className="upload-placeholder">
                          <input type="file" accept="image/*" onChange={handleImageChange} hidden />
                          <Upload size={24} />
                          <span>Click to upload image</span>
                        </label>
                      )}
                    </div>
                  </div>
                  <div className="form-group full">
                    <label>Item Name</label>
                    <input required value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} />
                  </div>
                  <div className="form-group">
                    <label>Category</label>
                    <select value={formData.category} onChange={e => setFormData({...formData, category: e.target.value})}>
                      <option value="Coffee">Coffee</option>
                      <option value="Tea">Tea</option>
                      <option value="Pastries">Pastries</option>
                      <option value="Meals">Meals</option>
                    </select>
                  </div>
                  <div className="form-group">
                    <label>Selling Price (₱)</label>
                    <input type="number" required value={formData.sellingPrice} onChange={e => setFormData({...formData, sellingPrice: Number(e.target.value)})} />
                  </div>
                  <div className="form-group">
                    <label>Cost Price (₱) <small>(Calculated)</small></label>
                    <input type="number" readOnly value={formData.costPrice} className="readonly-input" />
                  </div>
                </div>

                <div className="form-column">
                  <div className="recipe-builder">
                    <div className="recipe-header">
                      <label>Recipe Ingredients (Raw Materials)</label>
                      <button type="button" className="small-btn primary" onClick={addRawToRecipe}>
                        <Plus size={14} /> Add Ingredient
                      </button>
                    </div>
                    
                    <div className="recipe-list">
                      {formData.rawMaterials.map((recipeItem, index) => (
                        <div key={index} className="recipe-row">
                          <select 
                            required
                            value={recipeItem.rmId}
                            onChange={(e) => updateRecipeItem(index, 'rmId', e.target.value)}
                          >
                            <option value="">-- Select --</option>
                            {rawMaterials.map(rm => <option key={rm.id} value={rm.id}>{rm.name} ({rm.unit})</option>)}
                          </select>
                          <input 
                            type="number" step="any" placeholder="Qty" required
                            value={recipeItem.qty}
                            onChange={(e) => updateRecipeItem(index, 'qty', e.target.value)}
                          />
                          <button type="button" className="icon-btn-sm delete" onClick={() => removeRecipeItem(index)}>
                            <Trash2 size={14} />
                          </button>
                        </div>
                      ))}
                      {formData.rawMaterials.length === 0 && (
                        <div className="empty-recipe">No ingredients added yet.</div>
                      )}
                    </div>
                  </div>
                </div>
              </div>
              <div className="modal-footer">
                <button type="button" className="cancel-btn" onClick={() => setShowModal(false)}>Cancel</button>
                <button type="submit" className="confirm-btn">Save Product</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Items;
