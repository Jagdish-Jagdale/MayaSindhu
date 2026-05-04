import { useNavigate, useLocation } from 'react-router-dom';

/**
 * Custom hook to handle back navigation with fallback to home.
 * Requirements:
 * 1. Navigate to previous page in history if available.
 * 2. If no history (direct land), navigate to Home (/).
 * 3. Always ensure a clean navigation.
 */
export const useGoBack = () => {
  const navigate = useNavigate();
  const location = useLocation();

  const goBack = () => {
    // Check if there's history. 
    // In many React Router setups, history.state.idx > 0 means there's history.
    // If we land directly, idx is usually 0.
    if (window.history.state && window.history.state.idx > 0) {
      navigate(-1);
    } else {
      navigate('/', { replace: true });
    }
  };

  return goBack;
};
