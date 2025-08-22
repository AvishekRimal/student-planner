import { useSelector } from 'react-redux';
import { RootState } from '../store';

export const useAuth = () => {
  const { isAuthenticated, user, token } = useSelector(
    (state: RootState) => state.auth
  );

  // You can add more derived state here if needed, e.g., a loading state
  // const isLoading = ...

  return {
    isAuthenticated,
    user,
    token,
  };
};