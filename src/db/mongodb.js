import mongoose from 'mongoose';

// Schema para armazenar dados de workflow
const WorkflowSchema = new mongoose.Schema({
    name: { type: String, required: true },
    repository: { type: String, required: true },
    status: { type: String, enum: ['active', 'inactive', 'disabled'], default: 'active' },
    runs: [{
        id: String,
        status: { type: String, enum: ['success', 'failure', 'cancelled', 'in_progress'] },
        conclusion: String,
        startedAt: Date,
        completedAt: Date,
        duration: Number // em millisegundos
    }],
    metrics: {
        totalRuns: { type: Number, default: 0 },
        successRate: { type: Number, default: 0 },
        averageDuration: { type: Number, default: 0 },
        lastRun: Date,
        lastSuccess: Date,
        lastFailure: Date
    },
    createdAt: { type: Date, default: Date.now },
    updatedAt: { type: Date, default: Date.now }
});

// Schema para issues criadas pelo bot
const BotIssueSchema = new mongoose.Schema({
    issueNumber: { type: Number, required: true },
    repository: { type: String, required: true },
    title: { type: String, required: true },
    type: { type: String, enum: ['workflow_failure', 'performance_alert', 'test_validation'] },
    workflowName: String,
    status: { type: String, enum: ['open', 'closed', 'investigating'], default: 'open' },
    labels: [String],
    createdAt: { type: Date, default: Date.now },
    resolvedAt: Date,
    metadata: mongoose.Schema.Types.Mixed
});

// Schema para logs de atividade do bot
const BotActivitySchema = new mongoose.Schema({
    action: { type: String, required: true },
    repository: String,
    details: mongoose.Schema.Types.Mixed,
    result: { type: String, enum: ['success', 'error', 'warning'] },
    timestamp: { type: Date, default: Date.now },
    duration: Number // em millisegundos
});

export const Workflow = mongoose.model('Workflow', WorkflowSchema);
export const BotIssue = mongoose.model('BotIssue', BotIssueSchema);
export const BotActivity = mongoose.model('BotActivity', BotActivitySchema);

// Função para conectar ao MongoDB
export async function connectDB() {
    try {
        await mongoose.connect(process.env.DATABASE_URL);
        console.log('✅ MongoDB connected successfully');
        return mongoose.connection;
    } catch (error) {
        console.error('❌ MongoDB connection failed:', error.message);
        throw error;
    }
}

// Função para desconectar
export async function disconnectDB() {
    try {
        await mongoose.connection.close();
        console.log('🔒 MongoDB connection closed');
    } catch (error) {
        console.error('❌ Error closing MongoDB connection:', error.message);
    }
}