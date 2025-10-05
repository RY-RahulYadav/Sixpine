import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import adminAPI from '../../../services/adminApi';

interface Category {
  id: number;
  name: string;
  slug: string;
  description: string;
  parent: number | null;
  level: number;
  is_active: boolean;
  product_count: number;
  image_url?: string;
  created_at: string;
  updated_at: string;
}

interface HierarchicalCategory extends Category {
  children: HierarchicalCategory[];
}

const AdminCategories: React.FC = () => {
  const [categories, setCategories] = useState<Category[]>([]);
  const [hierarchicalCategories, setHierarchicalCategories] = useState<HierarchicalCategory[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [viewMode] = useState<'flat' | 'tree'>('flat');
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [totalPages, setTotalPages] = useState<number>(1);
  const [searchTerm, setSearchTerm] = useState<string>('');
  
  useEffect(() => {
    const fetchCategories = async () => {
      try {
        setLoading(true);
        
        if (viewMode === 'flat') {
          const params = {
            page: currentPage,
            search: searchTerm,
          };
          
          const response = await adminAPI.getCategories(params);
          setCategories(response.data.results || []);
          // Fix for "Cannot read properties of undefined (reading 'length')"
          if (response.data.results && response.data.results.length > 0) {
            setTotalPages(Math.ceil(response.data.count / response.data.results.length));
          } else {
            setTotalPages(1); // Default to 1 page if no results or empty results
          }
        } else {
          const response = await adminAPI.getCategoriesHierarchical();
          setHierarchicalCategories(response.data || []);
        }
        
        setError(null);
      } catch (err) {
        console.error('Error fetching categories:', err);
        setError('Failed to load categories');
      } finally {
        setLoading(false);
      }
    };
    
    fetchCategories();
  }, [currentPage, searchTerm, viewMode]);
  
  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setCurrentPage(1); // Reset to first page on search
  };
  
  const handleToggleActive = async (id: number, isActive: boolean) => {
    try {
      // Note: Assuming a toggleCategoryActive endpoint exists or needs to be added
      await adminAPI.updateCategory(id, { is_active: !isActive });
      
      // Update the category in the local state
      if (viewMode === 'flat') {
        setCategories(categories.map(category => 
          category.id === id ? { ...category, is_active: !isActive } : category
        ));
      } else {
        // For hierarchical view, we'd need a more complex update function
        // This is a simplified version
        const updateCategoryInTree = (cats: HierarchicalCategory[]): HierarchicalCategory[] => {
          return cats.map(cat => {
            if (cat.id === id) {
              return { ...cat, is_active: !isActive };
            } else if (cat.children.length > 0) {
              return { ...cat, children: updateCategoryInTree(cat.children) };
            }
            return cat;
          });
        };
        
        setHierarchicalCategories(updateCategoryInTree(hierarchicalCategories));
      }
    } catch (err) {
      console.error('Error toggling category status:', err);
      alert('Failed to update category status');
    }
  };
  
  const handleDeleteCategory = async (id: number) => {
    if (window.confirm('Are you sure you want to delete this category? This may affect products associated with it.')) {
      try {
        await adminAPI.deleteCategory(id);
        
        // Remove the category from the local state
        if (viewMode === 'flat') {
          setCategories(categories.filter(category => category.id !== id));
        } else {
          // For hierarchical view, we'd need a more complex delete function
          const removeCategoryFromTree = (cats: HierarchicalCategory[]): HierarchicalCategory[] => {
            return cats.filter(cat => {
              if (cat.id === id) return false;
              if (cat.children.length > 0) {
                cat.children = removeCategoryFromTree(cat.children);
              }
              return true;
            });
          };
          
          setHierarchicalCategories(removeCategoryFromTree(hierarchicalCategories));
        }
      } catch (err) {
        console.error('Error deleting category:', err);
        alert('Failed to delete category');
      }
    }
  };
  
  // Recursive component to render category tree
  const CategoryTree: React.FC<{ categories: HierarchicalCategory[] }> = ({ categories }) => {
    return (
      <ul className="admin-category-tree">
        {categories.map(category => (
          <li key={category.id} className="category-tree-item">
            <div className="category-tree-node">
              <div className="category-info">
                {category.image_url && (
                  <img 
                    src={category.image_url} 
                    alt={category.name} 
                    className="category-thumbnail" 
                  />
                )}
                <span className="category-name">{category.name}</span>
                <span className="category-count">({category.product_count})</span>
                <span className={`category-status ${category.is_active ? 'active' : 'inactive'}`}>
                  {category.is_active ? 'Active' : 'Inactive'}
                </span>
              </div>
              <div className="category-actions">
                <button 
                  className={`status-toggle ${category.is_active ? 'active' : 'inactive'}`}
                  onClick={() => handleToggleActive(category.id, category.is_active)}
                >
                  {category.is_active ? 'Active' : 'Inactive'}
                </button>
                <Link to={`/admin/categories/${category.id}`} className="edit-btn">
                  <span className="material-symbols-outlined">edit</span>
                </Link>
                <button 
                  className="delete-btn"
                  onClick={() => handleDeleteCategory(category.id)}
                >
                  <span className="material-symbols-outlined">delete</span>
                </button>
              </div>
            </div>
            {category.children.length > 0 && <CategoryTree categories={category.children} />}
          </li>
        ))}
      </ul>
    );
  };
  
  if (loading && categories.length === 0 && hierarchicalCategories.length === 0) {
    return (
      <div className="admin-loader">
        <div className="spinner"></div>
        <p>Loading categories...</p>
      </div>
    );
  }
  
  return (
    <div className="admin-categories">
      <div className="admin-header-actions">
        <h2>Categories</h2>
        <Link to="/admin/categories/new" className="admin-btn primary">
          <span className="material-symbols-outlined">add_circle</span>
          Add New Category
        </Link>
      </div>
      
      {/* Filters */}
      <div className="admin-filters">
        <form onSubmit={handleSearch} className="search-form">
          <div className="search-input">
            <input
              type="text"
              placeholder="Search categories..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
            <button type="submit">
              <span className="material-symbols-outlined">search</span>
            </button>
          </div>
        </form>
      </div>
      
      {/* Error message */}
      {error && (
        <div className="admin-error-message">
          <span className="material-symbols-outlined">error</span>
          {error}
        </div>
      )}
      
      {/* Categories display */}
      {viewMode === 'flat' ? (
        <div className="admin-table-container">
          <table className="admin-table">
            <thead>
              <tr>
                <th>Name</th>
                <th>Description</th>
                <th>Products</th>
                <th>Parent</th>
                <th>Status</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {categories.map((category) => (
                <tr key={category.id}>
                  <td>
                    <div className="category-cell">
                      {category.image_url && (
                        <img 
                          src={category.image_url} 
                          alt={category.name} 
                          className="category-thumbnail" 
                        />
                      )}
                      <span className="category-name">{category.name}</span>
                    </div>
                  </td>
                  <td className="description-cell">
                    {category.description?.length > 50
                      ? `${category.description.substring(0, 50)}...`
                      : category.description}
                  </td>
                  <td>{category.product_count}</td>
                  <td>
                    {category.parent !== null ? (
                      <Link to={`/admin/categories/${category.parent}`}>
                        Parent #{category.parent}
                      </Link>
                    ) : (
                      'None'
                    )}
                  </td>
                  <td>
                    <button 
                      className={`status-toggle ${category.is_active ? 'active' : 'inactive'}`}
                      onClick={() => handleToggleActive(category.id, category.is_active)}
                    >
                      {category.is_active ? 'Active' : 'Inactive'}
                    </button>
                  </td>
                  <td className="actions">
                    <Link to={`/admin/categories/${category.id}`} className="edit-btn">
                      <span className="material-symbols-outlined">edit</span>
                    </Link>
                    <button 
                      className="delete-btn"
                      onClick={() => handleDeleteCategory(category.id)}
                    >
                      <span className="material-symbols-outlined">delete</span>
                    </button>
                  </td>
                </tr>
              ))}
              
              {categories.length === 0 && !loading && (
                <tr>
                  <td colSpan={6} className="empty-table">
                    <div>
                      <span className="material-symbols-outlined">category</span>
                      <p>No categories found</p>
                    </div>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      ) : (
        <div className="admin-category-tree-container">
          {hierarchicalCategories.length > 0 ? (
            <CategoryTree categories={hierarchicalCategories} />
          ) : (
            <div className="empty-tree">
              <span className="material-symbols-outlined">category</span>
              <p>No categories found</p>
            </div>
          )}
        </div>
      )}
      
      {/* Pagination - only show for flat view */}
      {viewMode === 'flat' && totalPages > 1 && (
        <div className="admin-pagination">
          <button 
            onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
            disabled={currentPage === 1}
          >
            <span className="material-symbols-outlined">chevron_left</span>
          </button>
          
          <span className="page-info">
            Page {currentPage} of {totalPages}
          </span>
          
          <button 
            onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
            disabled={currentPage === totalPages}
          >
            <span className="material-symbols-outlined">chevron_right</span>
          </button>
        </div>
      )}
    </div>
  );
};

export default AdminCategories;