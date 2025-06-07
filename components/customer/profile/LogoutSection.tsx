import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { Text, } from 'react-native';
import { Button } from '~/components/ui/button';
import { useAuth } from '~/context/AuthContext';
import { useTheme } from '~/context/ThemeContext';
import { authService } from '~/services/authService';



export default function LogoutSection() {
  const { setIsAuthenticated } = useAuth();

  const handleLogout = async (): Promise<void> => {
    await authService.logout();
    setIsAuthenticated(false);
    router.replace('/login' as any);
  };

  return (
    <Button
      className="mx-4 flex-row items-center "
      onPress={handleLogout}
      variant="destructive"
    >
      <Ionicons name="log-out-outline" size={16} className='text-destructive-foreground' />
      <Text className="flex-1 text-destructive-foreground font-medium">Logout</Text>
    </Button>
  );
} 