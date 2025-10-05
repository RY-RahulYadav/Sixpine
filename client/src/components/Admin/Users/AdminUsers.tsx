import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import adminAPI from '../../../services/adminApi';

interface User {
  id: number;
  username: string;
  email: string;
  first_name: string;
  last_name: string;
  is_active: boolean;
  is_staff: boolean;
  date_joined: string;
  last_login: string;
}

const AdminUsers: React.FC = () => {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [totalPages, setTotalPages] = useState<number>(1);
  const [searchTerm, setSearchTerm] = useState<string>('');
  
  useEffect(() => {
    const fetchUsers = async () => {
      try {
        setLoading(true);
        const params = {
          page: currentPage,
          search: searchTerm,
        };
        
        const response = await adminAPI.getUsers(params);
        setUsers(response.data.results);
        setTotalPages(Math.ceil(response.data.count / response.data.results.length));
        setError(null);
      } catch (err) {
        console.error('Error fetching users:', err);
        setError('Failed to load users');
      } finally {
        setLoading(false);
      }
    };
    
    fetchUsers();
  }, [currentPage, searchTerm]);
  
  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setCurrentPage(1); // Reset to first page on search
  };
  
  const handleToggleActive = async (id: number, isActive: boolean) => {
    try {
      await adminAPI.toggleUserActive(id);
      
      // Update the user in the local state
      setUsers(users.map(user => 
        user.id === id ? { ...user, is_active: !isActive } : user
      ));
    } catch (err) {
      console.error('Error toggling user status:', err);
      alert('Failed to update user status');
    }
  };
  
  const handleToggleStaff = async (id: number, isStaff: boolean) => {
    try {
      await adminAPI.toggleUserStaff(id);
      
      // Update the user in the local state
      setUsers(users.map(user => 
        user.id === id ? { ...user, is_staff: !isStaff } : user
      ));
    } catch (err) {
      console.error('Error toggling staff status:', err);
      alert('Failed to update admin status');
    }
  };
  
  const handleDeleteUser = async (id: number) => {
    if (window.confirm('Are you sure you want to delete this user?')) {
      try {
        await adminAPI.deleteUser(id);
        // Remove the user from the local state
        setUsers(users.filter(user => user.id !== id));
      } catch (err) {
        console.error('Error deleting user:', err);
        alert('Failed to delete user');
      }
    }
  };
  
  if (loading && users.length === 0) {
    return (
      <div className="admin-loader">
        <div className="spinner"></div>
        <p>Loading users...</p>
      </div>
    );
  }
  
  return (
    <div className="admin-users">
      <div className="admin-header-actions">
        <h2>Users</h2>
      </div>
      
      {/* Filters */}
      <div className="admin-filters">
        <form onSubmit={handleSearch} className="search-form">
          <div className="search-input">
            <input
              type="text"
              placeholder="Search users..."
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
      
      {/* Users table */}
      <div className="admin-table-container">
        <table className="admin-table">
          <thead>
            <tr>
              <th>Username</th>
              <th>Name</th>
              <th>Email</th>
              <th>Joined</th>
              {/* <th>Last Login</th> */}
              <th>Status</th>
              {/* <th>Admin</th> */}
              {/* <th>Actions</th> */}
            </tr>
          </thead>
          <tbody>
            {users.map((user) => (
              <tr key={user.id}>
                <td>{user.username}</td>
                <td>{user.first_name} {user.last_name}</td>
                <td>{user.email}</td>
                <td>{new Date(user.date_joined).toLocaleDateString()}</td>
                {/* <td>{user.last_login ? new Date(user.last_login).toLocaleDateString() : 'Never'}</td> */}
                <td>
                  <button 
                    className={`status-toggle ${user.is_active ? 'active' : 'inactive'}`}
                    onClick={() => handleToggleActive(user.id, user.is_active)}
                  >
                    {user.is_active ? 'Active' : 'Inactive'}
                  </button>
                </td>
                {/* <td>
                  <button 
                    className={`admin-toggle ${user.is_staff ? 'admin' : ''}`}
                    onClick={() => handleToggleStaff(user.id, user.is_staff)}
                  >
                    {user.is_staff ? (
                      <span className="material-symbols-outlined">admin_panel_settings</span>
                    ) : (
                      <span className="material-symbols-outlined">person</span>
                    )}
                  </button>
                </td>
                <td className="actions">
                  <Link to={`/admin/users/${user.id}`} className="edit-btn">
                    <span className="material-symbols-outlined">edit</span>
                  </Link>
                  <button 
                    className="delete-btn"
                    onClick={() => handleDeleteUser(user.id)}
                  >
                    <span className="material-symbols-outlined">delete</span>
                  </button>
                </td> */}
              </tr>
            ))}
            
            {users.length === 0 && !loading && (
              <tr>
                <td colSpan={8} className="empty-table">
                  <div>
                    <span className="material-symbols-outlined">people</span>
                    <p>No users found</p>
                  </div>
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
      
      {/* Pagination */}
      {totalPages > 1 && (
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

export default AdminUsers;