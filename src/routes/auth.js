import express from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import supabase from '../config/supabase.js';

const router = express.Router();

const SALT_ROUNDS = 10;
const JWT_EXPIRY = '7d';

/**
 * POST /api/auth/register
 * Register a new customer
 *
 * Request body:
 * {
 *   "email": "customer@example.com",
 *   "password": "password123",
 *   "first_name": "John",
 *   "last_name": "Doe"
 * }
 */
router.post('/register', async (req, res) => {
  try {
    const { email, password, first_name, last_name } = req.body;

    // Validate required fields
    if (!email || !password || !first_name || !last_name) {
      return res.status(400).json({
        success: false,
        error: 'All fields are required: email, password, first_name, last_name'
      });
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return res.status(400).json({
        success: false,
        error: 'Invalid email format'
      });
    }

    // Validate password length
    if (password.length < 6) {
      return res.status(400).json({
        success: false,
        error: 'Password must be at least 6 characters long'
      });
    }

    // Check if customer with this email already exists
    const { data: existingCustomer, error: checkError } = await supabase
      .from('customers')
      .select('id')
      .eq('email', email.toLowerCase())
      .single();

    if (existingCustomer) {
      return res.status(409).json({
        success: false,
        error: 'A customer with this email already exists'
      });
    }

    // Hash the password
    const passwordHash = await bcrypt.hash(password, SALT_ROUNDS);

    // Create the customer
    const { data: newCustomer, error: insertError } = await supabase
      .from('customers')
      .insert({
        name: `${first_name.trim()} ${last_name.trim()}`,
        email: email.toLowerCase(),
        password_hash: passwordHash,
        first_name: first_name.trim(),
        last_name: last_name.trim()
      })
      .select('id, email, first_name, last_name, created_at')
      .single();

    if (insertError) {
      console.error('Error creating customer:', insertError);
      return res.status(500).json({
        success: false,
        error: 'Failed to create customer account'
      });
    }

    // Generate JWT token
    const token = jwt.sign(
      {
        id: newCustomer.id,
        email: newCustomer.email,
        type: 'customer'
      },
      process.env.JWT_SECRET,
      { expiresIn: JWT_EXPIRY }
    );

    res.status(201).json({
      success: true,
      message: 'Customer registered successfully',
      data: {
        customer: {
          id: newCustomer.id,
          email: newCustomer.email,
          first_name: newCustomer.first_name,
          last_name: newCustomer.last_name,
          created_at: newCustomer.created_at
        },
        token
      }
    });

  } catch (error) {
    console.error('Registration error:', error);
    res.status(500).json({
      success: false,
      error: 'Internal server error'
    });
  }
});

/**
 * POST /api/auth/login
 * Login an existing customer
 *
 * Request body:
 * {
 *   "email": "customer@example.com",
 *   "password": "password123"
 * }
 */
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;

    // Validate required fields
    if (!email || !password) {
      return res.status(400).json({
        success: false,
        error: 'Email and password are required'
      });
    }

    // Find customer by email
    const { data: customer, error: findError } = await supabase
      .from('customers')
      .select('id, email, password_hash, first_name, last_name, created_at')
      .eq('email', email.toLowerCase())
      .single();

    if (findError || !customer) {
      return res.status(401).json({
        success: false,
        error: 'Invalid email or password'
      });
    }

    // Verify password
    const isPasswordValid = await bcrypt.compare(password, customer.password_hash);

    if (!isPasswordValid) {
      return res.status(401).json({
        success: false,
        error: 'Invalid email or password'
      });
    }

    // Generate JWT token
    const token = jwt.sign(
      {
        id: customer.id,
        email: customer.email,
        type: 'customer'
      },
      process.env.JWT_SECRET,
      { expiresIn: JWT_EXPIRY }
    );

    res.json({
      success: true,
      message: 'Login successful',
      data: {
        customer: {
          id: customer.id,
          email: customer.email,
          first_name: customer.first_name,
          last_name: customer.last_name,
          created_at: customer.created_at
        },
        token
      }
    });

  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({
      success: false,
      error: 'Internal server error'
    });
  }
});

export default router;
