/**
 * XCloudBot - Core Bot Implementation
 * Main class responsible for bot initialization and orchestration
 */
export interface XCloudBotConfig {
    version: string;
    environment: string;
    logLevel?: string;
    [key: string]: unknown;
}
export declare class XCloudBot {
    private readonly logger;
    private readonly config;
    private readonly devOpsService;
    private isRunning;
    constructor(config: XCloudBotConfig);
    /**
     * Initialize the bot and all its services
     */
    initialize(): Promise<void>;
    /**
     * Start the bot
     */
    start(): Promise<void>;
    /**
     * Stop the bot gracefully
     */
    stop(): Promise<void>;
    /**
     * Get bot status
     */
    getStatus(): {
        running: boolean;
        version: string;
        environment: string;
    };
    /**
     * Health check
     */
    healthCheck(): Promise<boolean>;
}
//# sourceMappingURL=XCloudBot.d.ts.map