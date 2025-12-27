/**
 * Health check endpoint for Render
 * Used to verify the API is running
 */
export default async function handler(req, res) {
    try {
        return res.status(200).json({
            status: 'ok',
            environment: process.env.NODE_ENV || 'development',
            timestamp: new Date().toISOString(),
            uptime: process.uptime(),
            memory: process.memoryUsage(),
        });
    } catch (error) {
        return res.status(500).json({
            status: 'error',
            message: error.message
        });
    }
}
