import axios from './axios';

class AdminService {
  // Admin login
  async login(email, password) {
    try {
      const response = await axios.post('/admin/login', {
        email,
        password
      });
      
      if (response.data.token) {
        localStorage.setItem('adminToken', response.data.token);
        localStorage.setItem('adminUser', JSON.stringify(response.data.user));
      }
      
      return response.data;
    } catch (error) {
      throw error.response?.data || error.message;
    }
  }

  // Admin logout
  logout() {
    localStorage.removeItem('adminToken');
    localStorage.removeItem('adminUser');
  }

  // Get current admin user
  getCurrentAdmin() {
    const adminUser = localStorage.getItem('adminUser');
    return adminUser ? JSON.parse(adminUser) : null;
  }

  // Check if user is authenticated admin
  isAuthenticated() {
    const token = localStorage.getItem('adminToken');
    const admin = this.getCurrentAdmin();
    return !!(token && admin && admin.role === 'admin');
  }

  // Get admin token
  getToken() {
    return localStorage.getItem('adminToken');
  }

  // Dashboard data
  async getDashboard() {
    try {
      const response = await axios.get('/admin/dashboard', {
        headers: {
          'Authorization': `Bearer ${this.getToken()}`
        }
      });
      return response.data;
    } catch (error) {
      throw error.response?.data || error.message;
    }
  }

  // User management methods
  async getAllUsers() {
    try {
      const response = await axios.get('/admin/users', {
        headers: {
          'Authorization': `Bearer ${this.getToken()}`
        }
      });
      return response.data;
    } catch (error) {
      throw error.response?.data || error.message;
    }
  }

  async getUserById(id) {
    try {
      const response = await axios.get(`/admin/users/${id}`, {
        headers: {
          'Authorization': `Bearer ${this.getToken()}`
        }
      });
      return response.data;
    } catch (error) {
      throw error.response?.data || error.message;
    }
  }

  async updateUser(id, userData) {
    try {
      const response = await axios.put(`/admin/users/${id}`, userData, {
        headers: {
          'Authorization': `Bearer ${this.getToken()}`
        }
      });
      return response.data;
    } catch (error) {
      throw error.response?.data || error.message;
    }
  }

  async deleteUser(id) {
    try {
      const response = await axios.delete(`/admin/users/${id}`, {
        headers: {
          'Authorization': `Bearer ${this.getToken()}`
        }
      });
      return response.data;
    } catch (error) {
      throw error.response?.data || error.message;
    }
  }
}

export default new AdminService();
