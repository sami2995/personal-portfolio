const bcrypt = require('bcryptjs');
const readline = require('readline');
const { createClient } = require('@supabase/supabase-js');

require('dotenv').config();

const SUPABASE_URL = process.env.SUPABASE_URL;
const SUPABASE_SECRET_KEY = process.env.SUPABASE_SECRET_KEY;

if (!SUPABASE_URL || !SUPABASE_SECRET_KEY) {
  console.error(
    'Missing SUPABASE_URL or SUPABASE_SECRET_KEY in the .env file.'
  );

  process.exit(1);
}

const supabase = createClient(
  SUPABASE_URL,
  SUPABASE_SECRET_KEY,
  {
    auth: {
      persistSession: false,
      autoRefreshToken: false,
      detectSessionInUrl: false
    }
  }
);

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

function askQuestion(message) {
  return new Promise((resolve) => {
    rl.question(message, resolve);
  });
}

async function setup() {
  console.log('\n=== Portfolio Admin Setup ===\n');

  try {
    let username = await askQuestion(
      'Enter admin username (default: admin): '
    );

    username = username.trim() || 'admin';

    while (
      username.length < 3 ||
      username.length > 50
    ) {
      console.log(
        'Username must contain between 3 and 50 characters.'
      );

      username = (
        await askQuestion('Enter admin username: ')
      ).trim();
    }

    let password = '';

    while (password.length < 8) {
      password = await askQuestion(
        'Enter admin password (minimum 8 characters): '
      );

      if (password.length < 8) {
        console.log(
          'Password must be at least 8 characters long.'
        );
      }
    }

    const passwordHash = await bcrypt.hash(password, 12);

    /*
     * The username column is UNIQUE.
     *
     * If the username does not exist, this creates it.
     * If the username already exists, this updates its password.
     */
    const { data, error } = await supabase
      .from('admins')
      .upsert(
        {
          username,
          password_hash: passwordHash
        },
        {
          onConflict: 'username'
        }
      )
      .select('id, username, created_at')
      .single();

    if (error) {
      throw error;
    }

    console.log('\n✓ Admin account created or updated successfully!');
    console.log(`  Username: ${data.username}`);

    console.log('\n=== Setup Complete ===\n');
    console.log('Next steps:');
    console.log('1. Confirm JWT_SECRET exists in .env');
    console.log('2. Run: npm start');
    console.log('3. Open: http://localhost:3000');
    console.log('4. Press Ctrl + Shift + A to open the admin panel\n');
  } catch (error) {
    console.error('\nAdmin setup failed.');

    console.error({
      message: error?.message,
      code: error?.code,
      details: error?.details,
      hint: error?.hint
    });

    process.exitCode = 1;
  } finally {
    rl.close();
  }
}

setup();