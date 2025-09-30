/**
 * DevOps Service - Handles CI/CD operations and platform orchestration
 */
export interface WorkflowStatus {
    id: string;
    name: string;
    status: 'pending' | 'running' | 'completed' | 'failed';
    startTime: Date;
    endTime?: Date;
}
export interface DeploymentInfo {
    environment: string;
    version: string;
    branch: string;
    status: 'deploying' | 'deployed' | 'failed';
    strategy: 'rolling' | 'blue-green' | 'canary';
    timestamp: Date;
    url?: string;
    healthEndpoint?: string;
}
export declare class DevOpsService {
    private readonly logger;
    private initialized;
    private running;
    constructor();
    /**
     * Initialize the DevOps service
     */
    initialize(): Promise<void>;
    /**
     * Start the DevOps service
     */
    start(): Promise<void>;
    /**
     * Stop the DevOps service
     */
    stop(): Promise<void>;
    /**
     * Get workflow status
     */
    getWorkflowStatus(workflowId: string): Promise<WorkflowStatus | null>;
    /**
     * Trigger deployment
     */
    triggerDeployment(branch: string, environment: string, strategy?: 'rolling' | 'blue-green' | 'canary'): Promise<DeploymentInfo>;
    /**
     * Get deployment status
     */
    getDeploymentStatus(environment: string): Promise<DeploymentInfo | null>;
    /**
     * Health check
     */
    healthCheck(): Promise<boolean>;
    /**
     * Initialize connections to external services
     */
    private initializeConnections;
}
//# sourceMappingURL=DevOpsService.d.ts.map