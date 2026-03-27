// ============================================================================
// Loom Debug Adapter — DAP entry point
// ============================================================================

import { LoomDebugSession } from './loomDebugSession.js';

// Start the debug adapter using stdin/stdout
LoomDebugSession.run(LoomDebugSession);
