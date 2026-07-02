/**
 * Maps raw Firebase error codes and messages to user-friendly strings.
 * Logs the technical error to the console for debugging purposes.
 * 
 * @param {Error|Object|string} error - The error object thrown by Firebase or fetch.
 * @returns {string} A user-friendly error message.
 */
export function getFriendlyErrorMessage(error) {
  // Always log the raw error for developers in the console
  if (process.env.NODE_ENV !== 'production' || true) {
    console.error("Firebase/Application Error Caught:", error);
  }

  if (!error) return "An unexpected error occurred. Please try again.";

  // Extract the code and message from the error object
  const errorCode = error.code || '';
  const errorMessage = error.message || (typeof error === 'string' ? error : '');

  // 1. Check for specific Firebase Authentication Error Codes
  switch (errorCode) {
    case 'auth/invalid-credential':
    case 'auth/invalid-email':
    case 'auth/wrong-password':
    case 'auth/user-not-found':
      return "Invalid email or password. Please try again.";
    case 'auth/email-already-in-use':
      return "This email is already registered. Please log in.";
    case 'auth/weak-password':
      return "Password is too weak. Please use a stronger password.";
    case 'auth/too-many-requests':
      return "Too many failed attempts. Please try again later.";
    case 'auth/user-disabled':
      return "This account has been disabled. Please contact support.";
    case 'auth/operation-not-allowed':
      return "This login method is currently disabled.";
    case 'auth/network-request-failed':
      return "Network error. Please check your internet connection.";
    case 'auth/requires-recent-login':
      return "For security reasons, please log out and log in again before doing this.";
    case 'auth/missing-email':
      return "Please provide an email address.";
    
    // Firestore / Storage specific generic codes
    case 'permission-denied':
      return "You don't have permission to perform this action.";
    case 'unavailable':
    case 'failed-precondition':
      return "Service temporarily unavailable. Please try again later.";
    case 'resource-exhausted':
      return "Quota exceeded. Please try again later.";
  }

  // 2. Fallback regex checks on the raw message string
  const lowerMsg = errorMessage.toLowerCase();
  
  if (lowerMsg.includes('permission denied') || lowerMsg.includes('missing or insufficient permissions')) {
    return "You don't have permission to perform this action.";
  }
  
  if (lowerMsg.includes('network error') || lowerMsg.includes('failed to fetch')) {
    return "Network error. Please check your internet connection.";
  }
  
  if (lowerMsg.includes('quota')) {
    return "Service quota exceeded. Please try again later.";
  }

  if (lowerMsg.includes('maximum 3 devices') || lowerMsg.includes('max-devices-exceeded')) {
    return "Maximum device limit reached. Please log out from another device.";
  }

  // 3. Absolute Fallback for completely unknown errors
  // We do NOT return the raw error message to prevent exposing technical details.
  return "An unexpected error occurred. Please try again.";
}
