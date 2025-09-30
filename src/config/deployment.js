/**
 * 🌍 Deployment Environment Configuration
 * 
 * Manages configuration for different deployment environments
 */

export const deploymentConfig = {
  development: {
    name: 'Development',
    url: 'https://dev.xcloud-bot.local',
    healthEndpoint: 'https://dev.xcloud-bot.local/health',
    requiresApproval: false,
    deploymentStrategy: 'rolling',
    monitoring: {
      enabled: true,
      metricsEndpoint: 'https://dev.xcloud-bot.local/metrics'
    },
    rollback: {
      enabled: true,
      automaticOnFailure: true
    }
  },
  
  staging: {
    name: 'Staging',
    url: 'https://staging.xcloud-bot.example.com',
    healthEndpoint: 'https://staging.xcloud-bot.example.com/health',
    requiresApproval: false,
    deploymentStrategy: 'blue-green',
    monitoring: {
      enabled: true,
      metricsEndpoint: 'https://staging.xcloud-bot.example.com/metrics'
    },
    rollback: {
      enabled: true,
      automaticOnFailure: true
    }
  },
  
  production: {
    name: 'Production',
    url: 'https://xcloud-bot.example.com',
    healthEndpoint: 'https://xcloud-bot.example.com/health',
    requiresApproval: true,
    deploymentStrategy: 'canary',
    monitoring: {
      enabled: true,
      metricsEndpoint: 'https://xcloud-bot.example.com/metrics',
      alerting: true
    },
    rollback: {
      enabled: true,
      automaticOnFailure: false,
      requiresApproval: true
    }
  }
};

/**
 * Get configuration for specific environment
 * @param {string} environment - Environment name
 * @returns {object} Environment configuration
 */
export function getEnvironmentConfig(environment) {
  const config = deploymentConfig[environment];
  if (!config) {
    throw new Error(`Unknown environment: ${environment}`);
  }
  return config;
}

/**
 * Validate environment configuration
 * @param {string} environment - Environment name
 * @returns {boolean} Whether environment is valid
 */
export function isValidEnvironment(environment) {
  return environment in deploymentConfig;
}

/**
 * Get all available environments
 * @returns {string[]} Array of environment names
 */
export function getAvailableEnvironments() {
  return Object.keys(deploymentConfig);
}