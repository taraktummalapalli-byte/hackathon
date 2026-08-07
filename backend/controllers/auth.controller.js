const bcrypt = require('bcryptjs');
const supabase = require('../config/supabase');
const { generateToken } = require('../utils/jwt');
const { registerSchema, loginSchema } = require('../validators/auth.validator');

const register = async (req, res, next) => {
  try {
    const { email, password } = registerSchema.parse(req.body);

    // Check if user already exists
    const { data: existingUser } = await supabase
      .from('users')
      .select('*')
      .eq('email', email.toLowerCase())
      .single();

    if (existingUser) {
      return res.status(400).json({ error: 'User with this email already exists.' });
    }

    // Hash password
    const password_hash = await bcrypt.hash(password, 10);

    // Insert user into Supabase Postgres database
    const { data: newUser, error: insertError } = await supabase
      .from('users')
      .insert({
        email: email.toLowerCase(),
        password_hash
      })
      .select('id, email, created_at')
      .single();

    if (insertError) {
      console.error('[AuthCtrl] Insert User Error:', insertError);
      return res.status(500).json({ error: 'Failed to create user account.' });
    }

    const token = generateToken({ id: newUser.id, email: newUser.email });

    res.status(201).json({
      message: 'Account created successfully.',
      user: { id: newUser.id, email: newUser.email },
      token
    });
  } catch (err) {
    next(err);
  }
};

const login = async (req, res, next) => {
  try {
    const { email, password } = loginSchema.parse(req.body);

    // Fetch user
    const { data: user, error } = await supabase
      .from('users')
      .select('*')
      .eq('email', email.toLowerCase())
      .single();

    if (error || !user) {
      return res.status(401).json({ error: 'Invalid email or password.' });
    }

    // Verify password hash
    const isMatch = await bcrypt.compare(password, user.password_hash);
    if (!isMatch) {
      return res.status(401).json({ error: 'Invalid email or password.' });
    }

    const token = generateToken({ id: user.id, email: user.email });

    res.json({
      message: 'Login successful.',
      user: { id: user.id, email: user.email },
      token
    });
  } catch (err) {
    next(err);
  }
};

module.exports = {
  register,
  login
};
