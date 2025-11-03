import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import adminAPI from '../../../services/adminApi';
import { showToast } from '../utils/adminUtils';

interface Category {
  id: number;
  name: string;
  slug: string;
  description?: string;
  image?: string;
  is_active: boolean;
  subcategories?: Subcategory[];
}

interface Subcategory {
  id: number;
  name: string;
  slug: string;
  category: number;
  description?: string;
  is_active: boolean;
}

interface Color {
  id: number;
  name: string;
  hex_code: string;
  is_active: boolean;
}

interface Material {
  id: number;
  name: string;
  description?: string;
  is_active: boolean;
}

interface Discount {
  id: number;
  title: string;
  description?: string;
  discount_percentage: number;
  discount_amount: number;
  is_active: boolean;
  valid_from?: string;
  valid_until?: string;
}

type FilterSection = 'categories' | 'colors' | 'materials' | 'discounts';

const AdminFilterOptions: React.FC = () => {
  const navigate = useNavigate();
  const [activeSection, setActiveSection] = useState<FilterSection>('categories');
  
  // Data states
  const [categories, setCategories] = useState<Category[]>([]);
  const [colors, setColors] = useState<Color[]>([]);
  const [materials, setMaterials] = useState<Material[]>([]);
  const [discounts, setDiscounts] = useState<Discount[]>([]);
  
  // Loading states
  const [loading, setLoading] = useState<boolean>(true);
  const [saving, setSaving] = useState<boolean>(false);
  
  // Form states
  const [editingCategory, setEditingCategory] = useState<Category | null>(null);
  const [editingSubcategory, setEditingSubcategory] = useState<Subcategory | null>(null);
  const [expandedCategory, setExpandedCategory] = useState<number | null>(null);
  const [subcategoriesMap, setSubcategoriesMap] = useState<Record<number, Subcategory[]>>({});
  
  const [editingColor, setEditingColor] = useState<Color | null>(null);
  const [editingMaterial, setEditingMaterial] = useState<Material | null>(null);
  const [editingDiscount, setEditingDiscount] = useState<Discount | null>(null);
  
  // Form data
  const [categoryForm, setCategoryForm] = useState({ name: '', slug: '', description: '', is_active: true });
  const [subcategoryForm, setSubcategoryForm] = useState({ name: '', slug: '', category: '', description: '', is_active: true });
  const [colorForm, setColorForm] = useState({ name: '', hex_code: '#000000', is_active: true });
  const [materialForm, setMaterialForm] = useState({ name: '', description: '', is_active: true });
  const [discountForm, setDiscountForm] = useState({ 
    title: '', description: '', discount_percentage: 0, discount_amount: 0, 
    is_active: true, valid_from: '', valid_until: '' 
  });

  useEffect(() => {
    fetchAllData();
  }, []);

  useEffect(() => {
    if (expandedCategory) {
      fetchSubcategories(expandedCategory);
    }
  }, [expandedCategory]);

  const fetchAllData = async () => {
    try {
      setLoading(true);
      await Promise.all([
        fetchCategories(),
        fetchColors(),
        fetchMaterials(),
        fetchDiscounts()
      ]);
    } catch (error) {
      console.error('Error fetching filter options:', error);
      showToast('Failed to load filter options', 'error');
    } finally {
      setLoading(false);
    }
  };

  const fetchCategories = async () => {
    try {
      const response = await adminAPI.getCategories();
      const cats = response.data.results || response.data || [];
      setCategories(cats);
      // Fetch subcategories for all categories
      for (const cat of cats) {
        fetchSubcategories(cat.id);
      }
    } catch (error) {
      console.error('Error fetching categories:', error);
    }
  };

  const fetchSubcategories = async (categoryId: number) => {
    try {
      const response = await adminAPI.getSubcategories({ category: categoryId });
      const subcats = response.data.results || response.data || [];
      setSubcategoriesMap(prev => ({
        ...prev,
        [categoryId]: subcats
      }));
    } catch (error) {
      console.error('Error fetching subcategories:', error);
    }
  };

  const fetchColors = async () => {
    try {
      const response = await adminAPI.getColors();
      const cols = response.data.results || response.data || [];
      setColors(cols);
    } catch (error) {
      console.error('Error fetching colors:', error);
    }
  };

  const fetchMaterials = async () => {
    try {
      const response = await adminAPI.getMaterials();
      const mats = response.data.results || response.data || [];
      setMaterials(mats);
    } catch (error) {
      console.error('Error fetching materials:', error);
    }
  };

  const fetchDiscounts = async () => {
    try {
      const response = await adminAPI.getDiscounts();
      const discs = response.data.results || response.data || [];
      setDiscounts(discs);
    } catch (error) {
      console.error('Error fetching discounts:', error);
    }
  };

  // Category handlers
  const handleCategorySubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      if (editingCategory) {
        await adminAPI.updateCategory(editingCategory.id, categoryForm);
        showToast('Category updated successfully', 'success');
      } else {
        await adminAPI.createCategory(categoryForm);
        showToast('Category created successfully', 'success');
      }
      setCategoryForm({ name: '', slug: '', description: '', is_active: true });
      setEditingCategory(null);
      await fetchCategories();
    } catch (error: any) {
      showToast(error.response?.data?.message || 'Failed to save category', 'error');
    } finally {
      setSaving(false);
    }
  };

  const handleEditCategory = (category: Category) => {
    setEditingCategory(category);
    setCategoryForm({
      name: category.name,
      slug: category.slug,
      description: category.description || '',
      is_active: category.is_active
    });
    setExpandedCategory(category.id);
  };

  const handleDeleteCategory = async (id: number) => {
    if (!window.confirm('Are you sure you want to delete this category? This will also delete all subcategories.')) {
      return;
    }
    try {
      await adminAPI.deleteCategory(id);
      showToast('Category deleted successfully', 'success');
      await fetchCategories();
    } catch (error: any) {
      showToast(error.response?.data?.message || 'Failed to delete category', 'error');
    }
  };

  // Subcategory handlers
  const handleSubcategorySubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!subcategoryForm.category) {
      showToast('Please select a category', 'error');
      return;
    }
    setSaving(true);
    try {
      if (editingSubcategory) {
        await adminAPI.updateSubcategory(editingSubcategory.id, subcategoryForm);
        showToast('Subcategory updated successfully', 'success');
      } else {
        await adminAPI.createSubcategory(subcategoryForm);
        showToast('Subcategory created successfully', 'success');
      }
      setSubcategoryForm({ name: '', slug: '', category: '', description: '', is_active: true });
      setEditingSubcategory(null);
      await fetchSubcategories(parseInt(subcategoryForm.category));
    } catch (error: any) {
      showToast(error.response?.data?.message || 'Failed to save subcategory', 'error');
    } finally {
      setSaving(false);
    }
  };

  const handleEditSubcategory = (subcategory: Subcategory) => {
    setEditingSubcategory(subcategory);
    setSubcategoryForm({
      name: subcategory.name,
      slug: subcategory.slug,
      category: subcategory.category.toString(),
      description: subcategory.description || '',
      is_active: subcategory.is_active
    });
  };

  const handleDeleteSubcategory = async (id: number, categoryId: number) => {
    if (!window.confirm('Are you sure you want to delete this subcategory?')) {
      return;
    }
    try {
      await adminAPI.deleteSubcategory(id);
      showToast('Subcategory deleted successfully', 'success');
      await fetchSubcategories(categoryId);
    } catch (error: any) {
      showToast(error.response?.data?.message || 'Failed to delete subcategory', 'error');
    }
  };

  // Color handlers
  const handleColorSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      if (editingColor) {
        await adminAPI.updateColor(editingColor.id, colorForm);
        showToast('Color updated successfully', 'success');
      } else {
        await adminAPI.createColor(colorForm);
        showToast('Color created successfully', 'success');
      }
      setColorForm({ name: '', hex_code: '#000000', is_active: true });
      setEditingColor(null);
      await fetchColors();
    } catch (error: any) {
      showToast(error.response?.data?.message || 'Failed to save color', 'error');
    } finally {
      setSaving(false);
    }
  };

  const handleEditColor = (color: Color) => {
    setEditingColor(color);
    setColorForm({
      name: color.name,
      hex_code: color.hex_code,
      is_active: color.is_active
    });
  };

  const handleDeleteColor = async (id: number) => {
    if (!window.confirm('Are you sure you want to delete this color?')) {
      return;
    }
    try {
      await adminAPI.deleteColor(id);
      showToast('Color deleted successfully', 'success');
      await fetchColors();
    } catch (error: any) {
      showToast(error.response?.data?.message || 'Failed to delete color', 'error');
    }
  };

  // Material handlers
  const handleMaterialSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      if (editingMaterial) {
        await adminAPI.updateMaterial(editingMaterial.id, materialForm);
        showToast('Material updated successfully', 'success');
      } else {
        await adminAPI.createMaterial(materialForm);
        showToast('Material created successfully', 'success');
      }
      setMaterialForm({ name: '', description: '', is_active: true });
      setEditingMaterial(null);
      await fetchMaterials();
    } catch (error: any) {
      showToast(error.response?.data?.message || 'Failed to save material', 'error');
    } finally {
      setSaving(false);
    }
  };

  const handleEditMaterial = (material: Material) => {
    setEditingMaterial(material);
    setMaterialForm({
      name: material.name,
      description: material.description || '',
      is_active: material.is_active
    });
  };

  const handleDeleteMaterial = async (id: number) => {
    if (!window.confirm('Are you sure you want to delete this material?')) {
      return;
    }
    try {
      await adminAPI.deleteMaterial(id);
      showToast('Material deleted successfully', 'success');
      await fetchMaterials();
    } catch (error: any) {
      showToast(error.response?.data?.message || 'Failed to delete material', 'error');
    }
  };

  // Discount handlers
  const handleDiscountSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      if (editingDiscount) {
        await adminAPI.updateDiscount(editingDiscount.id, discountForm);
        showToast('Discount updated successfully', 'success');
      } else {
        await adminAPI.createDiscount(discountForm);
        showToast('Discount created successfully', 'success');
      }
      setDiscountForm({ 
        title: '', description: '', discount_percentage: 0, discount_amount: 0, 
        is_active: true, valid_from: '', valid_until: '' 
      });
      setEditingDiscount(null);
      await fetchDiscounts();
    } catch (error: any) {
      showToast(error.response?.data?.message || 'Failed to save discount', 'error');
    } finally {
      setSaving(false);
    }
  };

  const handleEditDiscount = (discount: Discount) => {
    setEditingDiscount(discount);
    setDiscountForm({
      title: discount.title,
      description: discount.description || '',
      discount_percentage: discount.discount_percentage,
      discount_amount: discount.discount_amount,
      is_active: discount.is_active,
      valid_from: discount.valid_from ? discount.valid_from.split('T')[0] : '',
      valid_until: discount.valid_until ? discount.valid_until.split('T')[0] : ''
    });
  };

  const handleDeleteDiscount = async (id: number) => {
    if (!window.confirm('Are you sure you want to delete this discount?')) {
      return;
    }
    try {
      await adminAPI.deleteDiscount(id);
      showToast('Discount deleted successfully', 'success');
      await fetchDiscounts();
    } catch (error: any) {
      showToast(error.response?.data?.message || 'Failed to delete discount', 'error');
    }
  };

  if (loading) {
    return (
      <div className="admin-loader">
        <div className="spinner"></div>
        <p>Loading filter options...</p>
      </div>
    );
  }

  return (
    <div className="admin-filter-options">
      <div className="admin-header-actions">
        <h2>Filter Options Management</h2>
      </div>

      {/* Section Tabs */}
      <div className="admin-tabs" style={{ marginBottom: '20px' }}>
        <button
          className={`admin-tab ${activeSection === 'categories' ? 'active' : ''}`}
          onClick={() => setActiveSection('categories')}
        >
          <span className="material-symbols-outlined">category</span>
          Categories & Subcategories
        </button>
        <button
          className={`admin-tab ${activeSection === 'colors' ? 'active' : ''}`}
          onClick={() => setActiveSection('colors')}
        >
          <span className="material-symbols-outlined">palette</span>
          Colors
        </button>
        <button
          className={`admin-tab ${activeSection === 'materials' ? 'active' : ''}`}
          onClick={() => setActiveSection('materials')}
        >
          <span className="material-symbols-outlined">texture</span>
          Materials
        </button>
        <button
          className={`admin-tab ${activeSection === 'discounts' ? 'active' : ''}`}
          onClick={() => setActiveSection('discounts')}
        >
          <span className="material-symbols-outlined">percent</span>
          Discounts
        </button>
      </div>

      {/* Categories Section */}
      {activeSection === 'categories' && (
        <div className="admin-content-grid">
          <div className="admin-content-main">
            <div className="admin-card">
              <div className="admin-card-header">
                <h3>Categories</h3>
                <button
                  className="admin-btn primary"
                  onClick={() => {
                    setEditingCategory(null);
                    setCategoryForm({ name: '', slug: '', description: '', is_active: true });
                  }}
                >
                  <span className="material-symbols-outlined">add</span>
                  Add Category
                </button>
              </div>

              <div className="categories-list">
                {categories.map((category) => (
                  <div key={category.id} className="category-item">
                    <div className="category-header" onClick={() => setExpandedCategory(expandedCategory === category.id ? null : category.id)}>
                      <div>
                        <h4>{category.name}</h4>
                        <span className="category-slug">/{category.slug}</span>
                        {!category.is_active && <span className="status-badge inactive">Inactive</span>}
                      </div>
                      <div className="category-actions">
                        <button
                          className="admin-btn icon"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleEditCategory(category);
                          }}
                        >
                          <span className="material-symbols-outlined">edit</span>
                        </button>
                        <button
                          className="admin-btn icon danger"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleDeleteCategory(category.id);
                          }}
                        >
                          <span className="material-symbols-outlined">delete</span>
                        </button>
                        <span className="material-symbols-outlined">
                          {expandedCategory === category.id ? 'expand_less' : 'expand_more'}
                        </span>
                      </div>
                    </div>

                    {expandedCategory === category.id && (
                      <div className="subcategories-section">
                        <div className="subcategories-header">
                          <h5>Subcategories</h5>
                          <button
                            className="admin-btn secondary small"
                            onClick={() => {
                              setEditingSubcategory(null);
                              setSubcategoryForm({ name: '', slug: '', category: category.id.toString(), description: '', is_active: true });
                            }}
                          >
                            <span className="material-symbols-outlined">add</span>
                            Add Subcategory
                          </button>
                        </div>

                        <div className="subcategories-list">
                          {(subcategoriesMap[category.id] || []).map((subcat) => (
                            <div key={subcat.id} className="subcategory-item">
                              <div>
                                <strong>{subcat.name}</strong>
                                <span className="category-slug">/{subcat.slug}</span>
                                {!subcat.is_active && <span className="status-badge inactive">Inactive</span>}
                              </div>
                              <div className="category-actions">
                                <button
                                  className="admin-btn icon"
                                  onClick={() => handleEditSubcategory(subcat)}
                                >
                                  <span className="material-symbols-outlined">edit</span>
                                </button>
                                <button
                                  className="admin-btn icon danger"
                                  onClick={() => handleDeleteSubcategory(subcat.id, category.id)}
                                >
                                  <span className="material-symbols-outlined">delete</span>
                                </button>
                              </div>
                            </div>
                          ))}
                          {(subcategoriesMap[category.id] || []).length === 0 && (
                            <p className="empty-state">No subcategories yet</p>
                          )}
                        </div>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          </div>

          <div className="admin-content-sidebar">
            {/* Category Form */}
            <div className="admin-card">
              <h3>{editingCategory ? 'Edit Category' : 'New Category'}</h3>
              <form onSubmit={handleCategorySubmit}>
                <div className="form-group">
                  <label>Name*</label>
                  <input
                    type="text"
                    value={categoryForm.name}
                    onChange={(e) => setCategoryForm({ ...categoryForm, name: e.target.value, slug: e.target.value.toLowerCase().replace(/\s+/g, '-') })}
                    required
                  />
                </div>
                <div className="form-group">
                  <label>Slug*</label>
                  <input
                    type="text"
                    value={categoryForm.slug}
                    onChange={(e) => setCategoryForm({ ...categoryForm, slug: e.target.value })}
                    required
                  />
                </div>
                <div className="form-group">
                  <label>Description</label>
                  <textarea
                    value={categoryForm.description}
                    onChange={(e) => setCategoryForm({ ...categoryForm, description: e.target.value })}
                    rows={3}
                  />
                </div>
                <div className="form-group">
                  <label className="checkbox-label">
                    <input
                      type="checkbox"
                      checked={categoryForm.is_active}
                      onChange={(e) => setCategoryForm({ ...categoryForm, is_active: e.target.checked })}
                    />
                    Active
                  </label>
                </div>
                <div className="form-actions">
                  <button type="submit" className="admin-btn primary" disabled={saving}>
                    {saving ? 'Saving...' : editingCategory ? 'Update' : 'Create'}
                  </button>
                  {editingCategory && (
                    <button
                      type="button"
                      className="admin-btn secondary"
                      onClick={() => {
                        setEditingCategory(null);
                        setCategoryForm({ name: '', slug: '', description: '', is_active: true });
                      }}
                    >
                      Cancel
                    </button>
                  )}
                </div>
              </form>
            </div>

            {/* Subcategory Form */}
            {expandedCategory && (
              <div className="admin-card">
                <h3>{editingSubcategory ? 'Edit Subcategory' : 'New Subcategory'}</h3>
                <form onSubmit={handleSubcategorySubmit}>
                  <div className="form-group">
                    <label>Category*</label>
                    <select
                      value={subcategoryForm.category}
                      onChange={(e) => setSubcategoryForm({ ...subcategoryForm, category: e.target.value })}
                      required
                    >
                      <option value="">Select category</option>
                      {categories.map((cat) => (
                        <option key={cat.id} value={cat.id}>
                          {cat.name}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div className="form-group">
                    <label>Name*</label>
                    <input
                      type="text"
                      value={subcategoryForm.name}
                      onChange={(e) => setSubcategoryForm({ ...subcategoryForm, name: e.target.value, slug: e.target.value.toLowerCase().replace(/\s+/g, '-') })}
                      required
                    />
                  </div>
                  <div className="form-group">
                    <label>Slug*</label>
                    <input
                      type="text"
                      value={subcategoryForm.slug}
                      onChange={(e) => setSubcategoryForm({ ...subcategoryForm, slug: e.target.value })}
                      required
                    />
                  </div>
                  <div className="form-group">
                    <label>Description</label>
                    <textarea
                      value={subcategoryForm.description}
                      onChange={(e) => setSubcategoryForm({ ...subcategoryForm, description: e.target.value })}
                      rows={3}
                    />
                  </div>
                  <div className="form-group">
                    <label className="checkbox-label">
                      <input
                        type="checkbox"
                        checked={subcategoryForm.is_active}
                        onChange={(e) => setSubcategoryForm({ ...subcategoryForm, is_active: e.target.checked })}
                      />
                      Active
                    </label>
                  </div>
                  <div className="form-actions">
                    <button type="submit" className="admin-btn primary" disabled={saving}>
                      {saving ? 'Saving...' : editingSubcategory ? 'Update' : 'Create'}
                    </button>
                    {editingSubcategory && (
                      <button
                        type="button"
                        className="admin-btn secondary"
                        onClick={() => {
                          setEditingSubcategory(null);
                          setSubcategoryForm({ name: '', slug: '', category: expandedCategory.toString(), description: '', is_active: true });
                        }}
                      >
                        Cancel
                      </button>
                    )}
                  </div>
                </form>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Colors Section */}
      {activeSection === 'colors' && (
        <div className="admin-content-grid">
          <div className="admin-content-main">
            <div className="admin-card">
              <div className="admin-card-header">
                <h3>Colors</h3>
                <button
                  className="admin-btn primary"
                  onClick={() => {
                    setEditingColor(null);
                    setColorForm({ name: '', hex_code: '#000000', is_active: true });
                  }}
                >
                  <span className="material-symbols-outlined">add</span>
                  Add Color
                </button>
              </div>

              <div className="admin-table-container">
                <table className="admin-table">
                  <thead>
                    <tr>
                      <th>Color</th>
                      <th>Name</th>
                      <th>Hex Code</th>
                      <th>Status</th>
                      <th>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {colors.map((color) => (
                      <tr key={color.id}>
                        <td>
                          <div
                            className="color-preview"
                            style={{
                              width: '40px',
                              height: '40px',
                              backgroundColor: color.hex_code,
                              borderRadius: '4px',
                              border: '1px solid #ddd'
                            }}
                          />
                        </td>
                        <td>{color.name}</td>
                        <td>{color.hex_code}</td>
                        <td>
                          <span className={`status-badge ${color.is_active ? 'active' : 'inactive'}`}>
                            {color.is_active ? 'Active' : 'Inactive'}
                          </span>
                        </td>
                        <td>
                          <button
                            className="admin-btn icon"
                            onClick={() => handleEditColor(color)}
                          >
                            <span className="material-symbols-outlined">edit</span>
                          </button>
                          <button
                            className="admin-btn icon danger"
                            onClick={() => handleDeleteColor(color.id)}
                          >
                            <span className="material-symbols-outlined">delete</span>
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>

          <div className="admin-content-sidebar">
            <div className="admin-card">
              <h3>{editingColor ? 'Edit Color' : 'New Color'}</h3>
              <form onSubmit={handleColorSubmit}>
                <div className="form-group">
                  <label>Name*</label>
                  <input
                    type="text"
                    value={colorForm.name}
                    onChange={(e) => setColorForm({ ...colorForm, name: e.target.value })}
                    required
                  />
                </div>
                <div className="form-group">
                  <label>Hex Code*</label>
                  <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
                    <input
                      type="color"
                      value={colorForm.hex_code}
                      onChange={(e) => setColorForm({ ...colorForm, hex_code: e.target.value })}
                      style={{ width: '60px', height: '40px' }}
                    />
                    <input
                      type="text"
                      value={colorForm.hex_code}
                      onChange={(e) => setColorForm({ ...colorForm, hex_code: e.target.value })}
                      placeholder="#000000"
                      style={{ flex: 1 }}
                      required
                    />
                  </div>
                </div>
                <div className="form-group">
                  <label className="checkbox-label">
                    <input
                      type="checkbox"
                      checked={colorForm.is_active}
                      onChange={(e) => setColorForm({ ...colorForm, is_active: e.target.checked })}
                    />
                    Active
                  </label>
                </div>
                <div className="form-actions">
                  <button type="submit" className="admin-btn primary" disabled={saving}>
                    {saving ? 'Saving...' : editingColor ? 'Update' : 'Create'}
                  </button>
                  {editingColor && (
                    <button
                      type="button"
                      className="admin-btn secondary"
                      onClick={() => {
                        setEditingColor(null);
                        setColorForm({ name: '', hex_code: '#000000', is_active: true });
                      }}
                    >
                      Cancel
                    </button>
                  )}
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

      {/* Materials Section */}
      {activeSection === 'materials' && (
        <div className="admin-content-grid">
          <div className="admin-content-main">
            <div className="admin-card">
              <div className="admin-card-header">
                <h3>Materials</h3>
                <button
                  className="admin-btn primary"
                  onClick={() => {
                    setEditingMaterial(null);
                    setMaterialForm({ name: '', description: '', is_active: true });
                  }}
                >
                  <span className="material-symbols-outlined">add</span>
                  Add Material
                </button>
              </div>

              <div className="admin-table-container">
                <table className="admin-table">
                  <thead>
                    <tr>
                      <th>Name</th>
                      <th>Description</th>
                      <th>Status</th>
                      <th>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {materials.map((material) => (
                      <tr key={material.id}>
                        <td>{material.name}</td>
                        <td>{material.description || '-'}</td>
                        <td>
                          <span className={`status-badge ${material.is_active ? 'active' : 'inactive'}`}>
                            {material.is_active ? 'Active' : 'Inactive'}
                          </span>
                        </td>
                        <td>
                          <button
                            className="admin-btn icon"
                            onClick={() => handleEditMaterial(material)}
                          >
                            <span className="material-symbols-outlined">edit</span>
                          </button>
                          <button
                            className="admin-btn icon danger"
                            onClick={() => handleDeleteMaterial(material.id)}
                          >
                            <span className="material-symbols-outlined">delete</span>
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>

          <div className="admin-content-sidebar">
            <div className="admin-card">
              <h3>{editingMaterial ? 'Edit Material' : 'New Material'}</h3>
              <form onSubmit={handleMaterialSubmit}>
                <div className="form-group">
                  <label>Name*</label>
                  <input
                    type="text"
                    value={materialForm.name}
                    onChange={(e) => setMaterialForm({ ...materialForm, name: e.target.value })}
                    required
                  />
                </div>
                <div className="form-group">
                  <label>Description</label>
                  <textarea
                    value={materialForm.description}
                    onChange={(e) => setMaterialForm({ ...materialForm, description: e.target.value })}
                    rows={3}
                  />
                </div>
                <div className="form-group">
                  <label className="checkbox-label">
                    <input
                      type="checkbox"
                      checked={materialForm.is_active}
                      onChange={(e) => setMaterialForm({ ...materialForm, is_active: e.target.checked })}
                    />
                    Active
                  </label>
                </div>
                <div className="form-actions">
                  <button type="submit" className="admin-btn primary" disabled={saving}>
                    {saving ? 'Saving...' : editingMaterial ? 'Update' : 'Create'}
                  </button>
                  {editingMaterial && (
                    <button
                      type="button"
                      className="admin-btn secondary"
                      onClick={() => {
                        setEditingMaterial(null);
                        setMaterialForm({ name: '', description: '', is_active: true });
                      }}
                    >
                      Cancel
                    </button>
                  )}
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

      {/* Discounts Section */}
      {activeSection === 'discounts' && (
        <div className="admin-content-grid">
          <div className="admin-content-main">
            <div className="admin-card">
              <div className="admin-card-header">
                <h3>Discounts</h3>
                <button
                  className="admin-btn primary"
                  onClick={() => {
                    setEditingDiscount(null);
                    setDiscountForm({ 
                      title: '', description: '', discount_percentage: 0, discount_amount: 0, 
                      is_active: true, valid_from: '', valid_until: '' 
                    });
                  }}
                >
                  <span className="material-symbols-outlined">add</span>
                  Add Discount
                </button>
              </div>

              <div className="admin-table-container">
                <table className="admin-table">
                  <thead>
                    <tr>
                      <th>Title</th>
                      <th>Percentage</th>
                      <th>Amount</th>
                      <th>Valid From</th>
                      <th>Valid Until</th>
                      <th>Status</th>
                      <th>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {discounts.map((discount) => (
                      <tr key={discount.id}>
                        <td>{discount.title}</td>
                        <td>{discount.discount_percentage}%</td>
                        <td>${discount.discount_amount}</td>
                        <td>{discount.valid_from ? new Date(discount.valid_from).toLocaleDateString() : '-'}</td>
                        <td>{discount.valid_until ? new Date(discount.valid_until).toLocaleDateString() : '-'}</td>
                        <td>
                          <span className={`status-badge ${discount.is_active ? 'active' : 'inactive'}`}>
                            {discount.is_active ? 'Active' : 'Inactive'}
                          </span>
                        </td>
                        <td>
                          <button
                            className="admin-btn icon"
                            onClick={() => handleEditDiscount(discount)}
                          >
                            <span className="material-symbols-outlined">edit</span>
                          </button>
                          <button
                            className="admin-btn icon danger"
                            onClick={() => handleDeleteDiscount(discount.id)}
                          >
                            <span className="material-symbols-outlined">delete</span>
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>

          <div className="admin-content-sidebar">
            <div className="admin-card">
              <h3>{editingDiscount ? 'Edit Discount' : 'New Discount'}</h3>
              <form onSubmit={handleDiscountSubmit}>
                <div className="form-group">
                  <label>Title*</label>
                  <input
                    type="text"
                    value={discountForm.title}
                    onChange={(e) => setDiscountForm({ ...discountForm, title: e.target.value })}
                    required
                  />
                </div>
                <div className="form-group">
                  <label>Description</label>
                  <textarea
                    value={discountForm.description}
                    onChange={(e) => setDiscountForm({ ...discountForm, description: e.target.value })}
                    rows={3}
                  />
                </div>
                <div className="form-group">
                  <label>Discount Percentage*</label>
                  <input
                    type="number"
                    min="0"
                    max="100"
                    step="0.01"
                    value={discountForm.discount_percentage}
                    onChange={(e) => setDiscountForm({ ...discountForm, discount_percentage: parseFloat(e.target.value) || 0 })}
                    required
                  />
                </div>
                <div className="form-group">
                  <label>Discount Amount*</label>
                  <input
                    type="number"
                    min="0"
                    step="0.01"
                    value={discountForm.discount_amount}
                    onChange={(e) => setDiscountForm({ ...discountForm, discount_amount: parseFloat(e.target.value) || 0 })}
                    required
                  />
                </div>
                <div className="form-group">
                  <label>Valid From</label>
                  <input
                    type="date"
                    value={discountForm.valid_from}
                    onChange={(e) => setDiscountForm({ ...discountForm, valid_from: e.target.value })}
                  />
                </div>
                <div className="form-group">
                  <label>Valid Until</label>
                  <input
                    type="date"
                    value={discountForm.valid_until}
                    onChange={(e) => setDiscountForm({ ...discountForm, valid_until: e.target.value })}
                  />
                </div>
                <div className="form-group">
                  <label className="checkbox-label">
                    <input
                      type="checkbox"
                      checked={discountForm.is_active}
                      onChange={(e) => setDiscountForm({ ...discountForm, is_active: e.target.checked })}
                    />
                    Active
                  </label>
                </div>
                <div className="form-actions">
                  <button type="submit" className="admin-btn primary" disabled={saving}>
                    {saving ? 'Saving...' : editingDiscount ? 'Update' : 'Create'}
                  </button>
                  {editingDiscount && (
                    <button
                      type="button"
                      className="admin-btn secondary"
                      onClick={() => {
                        setEditingDiscount(null);
                        setDiscountForm({ 
                          title: '', description: '', discount_percentage: 0, discount_amount: 0, 
                          is_active: true, valid_from: '', valid_until: '' 
                        });
                      }}
                    >
                      Cancel
                    </button>
                  )}
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminFilterOptions;

