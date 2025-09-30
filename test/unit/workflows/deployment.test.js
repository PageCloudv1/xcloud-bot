/**
 * Tests for deployment configuration and workflow functionality
 */

import { deploymentConfig, getEnvironmentConfig, isValidEnvironment, getAvailableEnvironments } from '../../../src/config/deployment.js';

describe('Deployment Configuration', () => {
  
  describe('Environment validation', () => {
    it('should validate known environments', () => {
      expect(isValidEnvironment('development')).toBe(true);
      expect(isValidEnvironment('staging')).toBe(true);
      expect(isValidEnvironment('production')).toBe(true);
    });

    it('should reject unknown environments', () => {
      expect(isValidEnvironment('unknown')).toBe(false);
      expect(isValidEnvironment('')).toBe(false);
      expect(isValidEnvironment(null)).toBe(false);
    });
  });

  describe('Environment configuration retrieval', () => {
    it('should return development config', () => {
      const config = getEnvironmentConfig('development');
      expect(config.name).toBe('Development');
      expect(config.url).toBe('https://dev.xcloud-bot.local');
      expect(config.requiresApproval).toBe(false);
      expect(config.deploymentStrategy).toBe('rolling');
    });

    it('should return staging config', () => {
      const config = getEnvironmentConfig('staging');
      expect(config.name).toBe('Staging');
      expect(config.url).toBe('https://staging.xcloud-bot.example.com');
      expect(config.requiresApproval).toBe(false);
      expect(config.deploymentStrategy).toBe('blue-green');
    });

    it('should return production config', () => {
      const config = getEnvironmentConfig('production');
      expect(config.name).toBe('Production');
      expect(config.url).toBe('https://xcloud-bot.example.com');
      expect(config.requiresApproval).toBe(true);
      expect(config.deploymentStrategy).toBe('canary');
    });

    it('should throw error for unknown environment', () => {
      expect(() => getEnvironmentConfig('unknown')).toThrow('Unknown environment: unknown');
    });
  });

  describe('Available environments', () => {
    it('should return all environment names', () => {
      const environments = getAvailableEnvironments();
      expect(environments).toContain('development');
      expect(environments).toContain('staging');
      expect(environments).toContain('production');
      expect(environments).toHaveLength(3);
    });
  });

  describe('Environment-specific features', () => {
    it('should have proper rollback configuration', () => {
      const devConfig = getEnvironmentConfig('development');
      const prodConfig = getEnvironmentConfig('production');

      expect(devConfig.rollback.automaticOnFailure).toBe(true);
      expect(prodConfig.rollback.automaticOnFailure).toBe(false);
      expect(prodConfig.rollback.requiresApproval).toBe(true);
    });

    it('should have monitoring configuration', () => {
      const environments = ['development', 'staging', 'production'];
      
      environments.forEach(env => {
        const config = getEnvironmentConfig(env);
        expect(config.monitoring.enabled).toBe(true);
        expect(config.monitoring.metricsEndpoint).toContain(config.url);
      });
    });

    it('should have health check endpoints', () => {
      const environments = ['development', 'staging', 'production'];
      
      environments.forEach(env => {
        const config = getEnvironmentConfig(env);
        expect(config.healthEndpoint).toBe(`${config.url}/health`);
      });
    });
  });

  describe('Deployment strategies', () => {
    it('should use different strategies per environment', () => {
      const devConfig = getEnvironmentConfig('development');
      const stagingConfig = getEnvironmentConfig('staging');
      const prodConfig = getEnvironmentConfig('production');

      expect(devConfig.deploymentStrategy).toBe('rolling');
      expect(stagingConfig.deploymentStrategy).toBe('blue-green');
      expect(prodConfig.deploymentStrategy).toBe('canary');
    });
  });

  describe('Configuration completeness', () => {
    it('should have all required fields for each environment', () => {
      const requiredFields = ['name', 'url', 'healthEndpoint', 'requiresApproval', 'deploymentStrategy', 'monitoring', 'rollback'];
      
      Object.keys(deploymentConfig).forEach(env => {
        const config = deploymentConfig[env];
        requiredFields.forEach(field => {
          expect(config).toHaveProperty(field);
        });
      });
    });

    it('should have monitoring configuration for all environments', () => {
      Object.keys(deploymentConfig).forEach(env => {
        const config = deploymentConfig[env];
        expect(config.monitoring).toHaveProperty('enabled');
        expect(config.monitoring).toHaveProperty('metricsEndpoint');
      });
    });

    it('should have rollback configuration for all environments', () => {
      Object.keys(deploymentConfig).forEach(env => {
        const config = deploymentConfig[env];
        expect(config.rollback).toHaveProperty('enabled');
        expect(config.rollback).toHaveProperty('automaticOnFailure');
      });
    });
  });
});