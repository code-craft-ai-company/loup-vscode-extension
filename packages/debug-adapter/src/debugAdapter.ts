// ============================================================================
// Loup Debug Adapter — DAP entry point
// ============================================================================

import { LoupDebugSession } from './loupDebugSession.js';

// Start the debug adapter using stdin/stdout
LoupDebugSession.run(LoupDebugSession);
