const axios = require('axios');

const API_BASE_URL = 'https://skillbridge-ecommerce-backend-3.onrender.com';

class UserStoryTester {
  constructor() {
    this.testResults = [];
    this.userToken = null;
    this.adminToken = null;
    this.testUserId = null;
    this.testProductId = null;
    this.testOrderId = null;
  }

  log(message, success = true) {
    const icon = success ? '✅' : '❌';
    console.log(`${icon} ${message}`);
    this.testResults.push({ message, success });
  }

  async runAllTests() {
    console.log('🧪 Testing All User Stories for E-commerce Platform\n');
    
    try {
      await this.testUserStory1(); // Signup
      await this.testUserStory2(); // Login
      await this.testUserStory3(); // Create Product (Admin)
      await this.testUserStory4(); // Update Product (Admin)
      await this.testUserStory5(); // Get Products List
      await this.testUserStory6(); // Search Products
      await this.testUserStory7(); // Get Product Details
      await this.testUserStory8(); // Delete Product (Admin)
      await this.testUserStory9(); // Place Order
      await this.testUserStory10(); // View Order History
      
      this.printSummary();
    } catch (error) {
      console.error('❌ Test suite failed:', error.message);
    }
  }

  // User Story 1: Signup
  async testUserStory1() {
    console.log('\n📝 User Story 1: Signup');
    
    try {
      // Test successful registration
      const userData = {
        username: `testuser${Date.now()}`,
        email: `test${Date.now()}@example.com`,
        password: 'TestPass123!',
        firstName: 'Test',
        lastName: 'User'
      };

      const response = await axios.post(`${API_BASE_URL}/auth/register`, userData);
      
      if (response.status === 201 && response.data.success) {
        this.log('User registration successful');
        this.testUserId = response.data.object._id;
      } else {
        this.log('User registration failed', false);
      }

      // Test duplicate email validation
      try {
        await axios.post(`${API_BASE_URL}/auth/register`, userData);
        this.log('Duplicate email validation failed', false);
      } catch (error) {
        if (error.response?.status === 409 || error.response?.status === 400) {
          this.log('Duplicate email properly rejected');
        } else {
          this.log('Unexpected error for duplicate email', false);
        }
      }

      // Test password validation
      try {
        await axios.post(`${API_BASE_URL}/auth/register`, {
          ...userData,
          email: `weak${Date.now()}@example.com`,
          password: '123'
        });
        this.log('Weak password validation failed', false);
      } catch (error) {
        if (error.response?.status === 400) {
          this.log('Weak password properly rejected');
        } else {
          this.log('Unexpected error for weak password', false);
        }
      }

    } catch (error) {
      this.log(`Signup test failed: ${error.message}`, false);
    }
  }

  // User Story 2: Login
  async testUserStory2() {
    console.log('\n🔐 User Story 2: Login');
    
    try {
      // Test admin login
      const adminLogin = await axios.post(`${API_BASE_URL}/auth/login`, {
        email: 'admin@skillbridge.com',
        password: 'Admin123!'
      });

      if (adminLogin.data.success && adminLogin.data.object.token) {
        this.adminToken = adminLogin.data.object.token;
        this.log('Admin login successful');
        
        if (adminLogin.data.object.user.role === 'admin') {
          this.log('Admin role properly assigned');
        } else {
          this.log('Admin role not properly assigned', false);
        }
      } else {
        this.log('Admin login failed', false);
      }

      // Test invalid credentials
      try {
        await axios.post(`${API_BASE_URL}/auth/login`, {
          email: 'admin@skillbridge.com',
          password: 'wrongpassword'
        });
        this.log('Invalid credentials validation failed', false);
      } catch (error) {
        if (error.response?.status === 401) {
          this.log('Invalid credentials properly rejected');
        } else {
          this.log('Unexpected error for invalid credentials', false);
        }
      }

    } catch (error) {
      this.log(`Login test failed: ${error.message}`, false);
    }
  }

  // User Story 3: Create Product (Admin)
  async testUserStory3() {
    console.log('\n➕ User Story 3: Create Product');
    
    if (!this.adminToken) {
      this.log('Cannot test product creation - no admin token', false);
      return;
    }

    try {
      const productData = {
        name: 'Test Product API',
        description: 'This is a test product created via API testing suite.',
        price: 99.99,
        stock: 25,
        category: 'electronics'
      };

      const response = await axios.post(`${API_BASE_URL}/products`, productData, {
        headers: { Authorization: `Bearer ${this.adminToken}` }
      });

      if (response.status === 201 && response.data.success) {
        this.testProductId = response.data.object._id;
        this.log('Product creation successful');
      } else {
        this.log('Product creation failed', false);
      }

      // Test unauthorized access
      try {
        await axios.post(`${API_BASE_URL}/products`, productData);
        this.log('Unauthorized product creation should fail', false);
      } catch (error) {
        if (error.response?.status === 401) {
          this.log('Unauthorized access properly blocked');
        } else {
          this.log('Unexpected error for unauthorized access', false);
        }
      }

      // Test validation
      try {
        await axios.post(`${API_BASE_URL}/products`, {
          name: '',
          description: 'Test',
          price: -10,
          stock: -5,
          category: 'electronics'
        }, {
          headers: { Authorization: `Bearer ${this.adminToken}` }
        });
        this.log('Product validation should fail', false);
      } catch (error) {
        if (error.response?.status === 400) {
          this.log('Product validation working correctly');
        } else {
          this.log('Unexpected validation error', false);
        }
      }

    } catch (error) {
      this.log(`Product creation test failed: ${error.message}`, false);
    }
  }

  // User Story 4: Update Product (Admin)
  async testUserStory4() {
    console.log('\n✏️ User Story 4: Update Product');
    
    if (!this.adminToken || !this.testProductId) {
      this.log('Cannot test product update - missing admin token or product ID', false);
      return;
    }

    try {
      const updateData = {
        name: 'Updated Test Product',
        price: 149.99,
        stock: 30
      };

      const response = await axios.put(`${API_BASE_URL}/products/${this.testProductId}`, updateData, {
        headers: { Authorization: `Bearer ${this.adminToken}` }
      });

      if (response.status === 200 && response.data.success) {
        this.log('Product update successful');
      } else {
        this.log('Product update failed', false);
      }

      // Test non-existent product
      try {
        await axios.put(`${API_BASE_URL}/products/507f1f77bcf86cd799439011`, updateData, {
          headers: { Authorization: `Bearer ${this.adminToken}` }
        });
        this.log('Non-existent product update should fail', false);
      } catch (error) {
        if (error.response?.status === 404) {
          this.log('Non-existent product properly handled');
        } else {
          this.log('Unexpected error for non-existent product', false);
        }
      }

    } catch (error) {
      this.log(`Product update test failed: ${error.message}`, false);
    }
  }

  // User Story 5: Get Products List
  async testUserStory5() {
    console.log('\n📋 User Story 5: Get Products List');
    
    try {
      const response = await axios.get(`${API_BASE_URL}/products`);
      
      if (response.status === 200 && response.data.success) {
        const data = response.data;
        this.log('Products list retrieved successfully');
        
        if (data.products && Array.isArray(data.products)) {
          this.log('Products array format correct');
        } else {
          this.log('Products array format incorrect', false);
        }

        if (typeof data.totalSize === 'number') {
          this.log('Pagination data included');
        } else {
          this.log('Pagination data missing', false);
        }
      } else {
        this.log('Products list retrieval failed', false);
      }

      // Test pagination
      const paginatedResponse = await axios.get(`${API_BASE_URL}/products?page=1&limit=5`);
      if (paginatedResponse.data.products.length <= 5) {
        this.log('Pagination working correctly');
      } else {
        this.log('Pagination not working correctly', false);
      }

    } catch (error) {
      this.log(`Products list test failed: ${error.message}`, false);
    }
  }

  // User Story 6: Search Products
  async testUserStory6() {
    console.log('\n🔍 User Story 6: Search Products');
    
    try {
      const searchResponse = await axios.get(`${API_BASE_URL}/products?search=test`);
      
      if (searchResponse.status === 200 && searchResponse.data.success) {
        this.log('Product search successful');
        
        const products = searchResponse.data.products;
        if (products.some(p => p.name.toLowerCase().includes('test'))) {
          this.log('Search results contain relevant products');
        } else {
          this.log('Search results may not be relevant', false);
        }
      } else {
        this.log('Product search failed', false);
      }

      // Test empty search
      const emptySearchResponse = await axios.get(`${API_BASE_URL}/products?search=`);
      if (emptySearchResponse.status === 200) {
        this.log('Empty search handled correctly');
      } else {
        this.log('Empty search not handled correctly', false);
      }

    } catch (error) {
      this.log(`Product search test failed: ${error.message}`, false);
    }
  }

  // User Story 7: Get Product Details
  async testUserStory7() {
    console.log('\n🔍 User Story 7: Get Product Details');
    
    if (!this.testProductId) {
      this.log('Cannot test product details - no test product ID', false);
      return;
    }

    try {
      const response = await axios.get(`${API_BASE_URL}/products/${this.testProductId}`);
      
      if (response.status === 200 && response.data.success) {
        this.log('Product details retrieved successfully');
        
        const product = response.data.object;
        if (product.name && product.description && product.price && typeof product.stock === 'number') {
          this.log('Product details complete');
        } else {
          this.log('Product details incomplete', false);
        }
      } else {
        this.log('Product details retrieval failed', false);
      }

      // Test non-existent product
      try {
        await axios.get(`${API_BASE_URL}/products/507f1f77bcf86cd799439011`);
        this.log('Non-existent product should return 404', false);
      } catch (error) {
        if (error.response?.status === 404) {
          this.log('Non-existent product properly returns 404');
        } else {
          this.log('Unexpected error for non-existent product', false);
        }
      }

    } catch (error) {
      this.log(`Product details test failed: ${error.message}`, false);
    }
  }

  // User Story 8: Delete Product (Admin)
  async testUserStory8() {
    console.log('\n🗑️ User Story 8: Delete Product');
    
    if (!this.adminToken || !this.testProductId) {
      this.log('Cannot test product deletion - missing admin token or product ID', false);
      return;
    }

    try {
      const response = await axios.delete(`${API_BASE_URL}/products/${this.testProductId}`, {
        headers: { Authorization: `Bearer ${this.adminToken}` }
      });

      if (response.status === 200 && response.data.success) {
        this.log('Product deletion successful');
      } else {
        this.log('Product deletion failed', false);
      }

      // Verify product is deleted
      try {
        await axios.get(`${API_BASE_URL}/products/${this.testProductId}`);
        this.log('Deleted product should not be accessible', false);
      } catch (error) {
        if (error.response?.status === 404) {
          this.log('Deleted product properly removed');
        } else {
          this.log('Unexpected error accessing deleted product', false);
        }
      }

    } catch (error) {
      this.log(`Product deletion test failed: ${error.message}`, false);
    }
  }

  // User Story 9: Place Order
  async testUserStory9() {
    console.log('\n🛒 User Story 9: Place Order');
    
    if (!this.adminToken) {
      this.log('Cannot test order placement - no admin token', false);
      return;
    }

    try {
      // First get available products
      const productsResponse = await axios.get(`${API_BASE_URL}/products`);
      const products = productsResponse.data.products;
      
      if (products.length === 0) {
        this.log('No products available for order test', false);
        return;
      }

      const orderData = {
        products: [
          {
            productId: products[0]._id,
            quantity: 1
          }
        ]
      };

      const response = await axios.post(`${API_BASE_URL}/orders`, orderData, {
        headers: { Authorization: `Bearer ${this.adminToken}` }
      });

      if (response.status === 201 && response.data.success) {
        this.testOrderId = response.data.object._id;
        this.log('Order placement successful');
        
        const order = response.data.object;
        if (order.totalAmount && order.products && order.status) {
          this.log('Order data complete');
        } else {
          this.log('Order data incomplete', false);
        }
      } else {
        this.log('Order placement failed', false);
      }

      // Test unauthorized order
      try {
        await axios.post(`${API_BASE_URL}/orders`, orderData);
        this.log('Unauthorized order should fail', false);
      } catch (error) {
        if (error.response?.status === 401) {
          this.log('Unauthorized order properly blocked');
        } else {
          this.log('Unexpected error for unauthorized order', false);
        }
      }

    } catch (error) {
      this.log(`Order placement test failed: ${error.message}`, false);
    }
  }

  // User Story 10: View Order History
  async testUserStory10() {
    console.log('\n📊 User Story 10: View Order History');
    
    if (!this.adminToken) {
      this.log('Cannot test order history - no admin token', false);
      return;
    }

    try {
      const response = await axios.get(`${API_BASE_URL}/orders`, {
        headers: { Authorization: `Bearer ${this.adminToken}` }
      });

      if (response.status === 200 && response.data.success) {
        this.log('Order history retrieved successfully');
        
        const orders = response.data.object;
        if (Array.isArray(orders)) {
          this.log('Order history format correct');
          
          if (orders.length > 0 && this.testOrderId) {
            const testOrder = orders.find(o => o._id === this.testOrderId);
            if (testOrder) {
              this.log('Test order found in history');
            } else {
              this.log('Test order not found in history', false);
            }
          }
        } else {
          this.log('Order history format incorrect', false);
        }
      } else {
        this.log('Order history retrieval failed', false);
      }

      // Test unauthorized access
      try {
        await axios.get(`${API_BASE_URL}/orders`);
        this.log('Unauthorized order history should fail', false);
      } catch (error) {
        if (error.response?.status === 401) {
          this.log('Unauthorized order history properly blocked');
        } else {
          this.log('Unexpected error for unauthorized order history', false);
        }
      }

    } catch (error) {
      this.log(`Order history test failed: ${error.message}`, false);
    }
  }

  printSummary() {
    console.log('\n📊 Test Summary');
    console.log('='.repeat(50));
    
    const passed = this.testResults.filter(r => r.success).length;
    const failed = this.testResults.filter(r => !r.success).length;
    const total = this.testResults.length;
    
    console.log(`✅ Passed: ${passed}`);
    console.log(`❌ Failed: ${failed}`);
    console.log(`📊 Total: ${total}`);
    console.log(`📈 Success Rate: ${((passed / total) * 100).toFixed(1)}%`);
    
    if (failed > 0) {
      console.log('\n❌ Failed Tests:');
      this.testResults
        .filter(r => !r.success)
        .forEach(r => console.log(`   - ${r.message}`));
    }
    
    console.log('\n🎉 All User Stories Tested!');
    
    if (passed === total) {
      console.log('🏆 All tests passed! E-commerce platform is fully functional.');
    } else {
      console.log('⚠️ Some tests failed. Please check the implementation.');
    }
  }
}

// Run all tests
const tester = new UserStoryTester();
tester.runAllTests();