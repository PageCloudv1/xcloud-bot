#!/usr/bin/env node

/**
 * 🔍 xCloud Bot - Connection Test
 * Simple script to test SSH connection
 */

console.log('🔍 Testing SSH connection...');

// Test basic connection without dependencies first
import { spawn } from 'child_process';

const SERVER_CONFIG = {
  host: '72.167.222.237',
  username: 'rootkit',
const SERVER_CONFIG = {
  host: process.env.SSH_HOST || '72.167.222.237',
  username: process.env.SSH_USER || 'rootkit',
  password: process.env.SSH_PASSWORD || '103020Aa@@',
  port: process.env.SSH_PORT || 22,
};
  port: 22,
};

console.log(
  `📡 Connecting to ${SERVER_CONFIG.username}@${SERVER_CONFIG.host}:${SERVER_CONFIG.port}`
);

// Try simple SSH connection test
const testConnection = () => {
  return new Promise((resolve, reject) => {
    const ssh = spawn('ssh', [
      '-o',
      'ConnectTimeout=10',
      '-o',
      'BatchMode=yes',
      '-o',
      'StrictHostKeyChecking=no',
      `${SERVER_CONFIG.username}@${SERVER_CONFIG.host}`,
      'echo "Connection successful"',
    ]);

    let output = '';
    let error = '';

    ssh.stdout.on('data', data => {
      output += data.toString();
    });

    ssh.stderr.on('data', data => {
      error += data.toString();
    });

    ssh.on('close', code => {
      if (code === 0) {
        console.log('✅ SSH connection successful!');
        console.log('📋 Server response:', output.trim());
        resolve();
      } else {
        console.log('❌ SSH connection failed');
        console.log('📋 Error:', error);
        console.log('💡 Trying with password authentication...');

        // Try with sshpass if available
        testWithPassword().then(resolve).catch(reject);
      }
    });

    ssh.on('error', err => {
      console.log('❌ SSH command failed:', err.message);
      console.log('💡 Trying alternative method...');
      testWithPassword().then(resolve).catch(reject);
    });
  });
};

const testWithPassword = async () => {
  console.log('🔑 Testing with Node.js SSH client...');

  try {
    // Dynamic import to handle potential missing dependencies
    const { Client } = await import('ssh2');
    const chalk = await import('chalk');

    return new Promise((resolve, reject) => {
      const conn = new Client();

      conn.on('ready', () => {
        console.log(chalk.default.green('✅ Node.js SSH connection successful!'));

        conn.exec(
          'whoami && pwd && node --version || echo "Node.js not installed"',
          (err, stream) => {
            if (err) {
              console.log(chalk.default.yellow('⚠️ Command execution failed:', err.message));
              conn.end();
              resolve();
              return;
            }

            let output = '';

            stream.on('close', (code, signal) => {
              console.log(chalk.default.blue('📋 Server info:'));
              console.log(output);
              conn.end();
              resolve();
            });

            stream.on('data', data => {
              output += data.toString();
            });
          }
        );
      });

      conn.on('error', err => {
        console.log(chalk.default.red('❌ Connection failed:'), err.message);
        reject(err);
      });

      conn.connect({
        host: SERVER_CONFIG.host,
        username: SERVER_CONFIG.username,
        password: SERVER_CONFIG.password,
        port: SERVER_CONFIG.port,
        readyTimeout: 30000,
      });
    });
  } catch (importError) {
    console.log('📦 Installing required dependencies...');
    console.log('💡 Please run: cd scripts && npm install');
    throw importError;
  }
};

// Run test
testConnection().catch(error => {
  console.log('❌ All connection methods failed');
  console.log('🔧 Please check:');
  console.log('  1. Server is accessible: ping 72.167.222.237');
  console.log('  2. SSH service is running on the server');
  console.log('  3. Credentials are correct');
  console.log('  4. Firewall allows SSH connections');
  process.exit(1);
});
