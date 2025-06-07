import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { useEffect, useMemo, useState } from 'react';
import {
    FlatList,
    RefreshControl,
    ScrollView,
    Text,
    TextInput,
    TouchableOpacity,
    View,
    useColorScheme
} from 'react-native';
import { useTheme } from '~/context/ThemeContext';
import JobItem from '../../components/JobItem';
import NotificationBadge from '../../components/NotificationBadge';
import NotificationDrawer from '../../components/NotificationDrawer';
import { Job, authService } from '../../services/authService';

// Define types for our data
type SectionHeader = {
  type: 'header';
  title: string;
  id: string;
};

type JobItemType = {
  type: 'job';
  data: Job;
};

type ListItem = SectionHeader | JobItemType;

export default function TechnicianHomeScreen() {
  const router = useRouter();
  const colorScheme = useColorScheme();
  const isDarkMode = colorScheme === 'dark';
  const [jobs, setJobs] = useState<Job[]>([]);
  const [filteredJobs, setFilteredJobs] = useState<Job[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [refreshing, setRefreshing] = useState<boolean>(false);
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [activeFilter, setActiveFilter] = useState<string>('all');
  const [sortBy, setSortBy] = useState<string>('status'); // 'date' or 'status'
  const [notificationDrawerVisible, setNotificationDrawerVisible] = useState<boolean>(false);

  const loadJobs = async (): Promise<void> => {
    try {
      const jobData = await authService.getJobs();
      setJobs(jobData);
      setFilteredJobs(jobData);
    } catch (error) {
      console.error('Failed to load jobs:', error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    loadJobs();
  }, []);

  useEffect(() => {
    // Filter jobs based on search query and active filter
    let result = jobs;
    
    // Apply search filter
    if (searchQuery) {
      result = result.filter(job => 
        job.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        job.customer.toLowerCase().includes(searchQuery.toLowerCase()) ||
        job.address.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }
    
    // Apply status filter
    if (activeFilter !== 'all') {
      result = result.filter(job => job.status === activeFilter);
    }
    
    setFilteredJobs(result);
  }, [searchQuery, activeFilter, jobs]);

  // Create organized list with sections
  const listData = useMemo((): ListItem[] => {
    if (filteredJobs.length === 0) return [];
    
    // Sort jobs first if needed
    const sortedJobs = [...filteredJobs].sort((a, b) => {
      if (sortBy === 'date') {
        return new Date(a.scheduled).getTime() - new Date(b.scheduled).getTime();
      }
      return 0;
    });
    
    const result: ListItem[] = [];
    
    if (sortBy === 'date') {
      // Group by date (today, tomorrow, future)
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      
      const tomorrow = new Date(today);
      tomorrow.setDate(tomorrow.getDate() + 1);
      
      const nextWeek = new Date(today);
      nextWeek.setDate(nextWeek.getDate() + 7);
      
      // Today's jobs
      const todayJobs = sortedJobs.filter(job => {
        const jobDate = new Date(job.scheduled);
        jobDate.setHours(0, 0, 0, 0);
        return jobDate.getTime() === today.getTime();
      });
      
      if (todayJobs.length > 0) {
        result.push({ type: 'header', title: 'Today', id: 'today-header' });
        todayJobs.forEach(job => result.push({ type: 'job', data: job }));
      }
      
      // Tomorrow's jobs
      const tomorrowJobs = sortedJobs.filter(job => {
        const jobDate = new Date(job.scheduled);
        jobDate.setHours(0, 0, 0, 0);
        return jobDate.getTime() === tomorrow.getTime();
      });
      
      if (tomorrowJobs.length > 0) {
        result.push({ type: 'header', title: 'Tomorrow', id: 'tomorrow-header' });
        tomorrowJobs.forEach(job => result.push({ type: 'job', data: job }));
      }
      
      // This week's jobs
      const thisWeekJobs = sortedJobs.filter(job => {
        const jobDate = new Date(job.scheduled);
        jobDate.setHours(0, 0, 0, 0);
        return jobDate > tomorrow && jobDate < nextWeek;
      });
      
      if (thisWeekJobs.length > 0) {
        result.push({ type: 'header', title: 'This Week', id: 'this-week-header' });
        thisWeekJobs.forEach(job => result.push({ type: 'job', data: job }));
      }
      
      // Future jobs
      const futureJobs = sortedJobs.filter(job => {
        const jobDate = new Date(job.scheduled);
        jobDate.setHours(0, 0, 0, 0);
        return jobDate >= nextWeek;
      });
      
      if (futureJobs.length > 0) {
        result.push({ type: 'header', title: 'Future', id: 'future-header' });
        futureJobs.forEach(job => result.push({ type: 'job', data: job }));
      }
    } else {
      // Group by status
      const pendingJobs = sortedJobs.filter(job => job.status === 'pending');
      if (pendingJobs.length > 0) {
        result.push({ type: 'header', title: 'Pending', id: 'pending-header' });
        pendingJobs.forEach(job => result.push({ type: 'job', data: job }));
      }
      
      const inProgressJobs = sortedJobs.filter(job => job.status === 'in_progress');
      if (inProgressJobs.length > 0) {
        result.push({ type: 'header', title: 'In Progress', id: 'in_progress-header' });
        inProgressJobs.forEach(job => result.push({ type: 'job', data: job }));
      }
      
      const completedJobs = sortedJobs.filter(job => job.status === 'completed');
      if (completedJobs.length > 0) {
        result.push({ type: 'header', title: 'Completed', id: 'completed-header' });
        completedJobs.forEach(job => result.push({ type: 'job', data: job }));
      }
    }
    
    return result;
  }, [filteredJobs, sortBy]);

  const handleRefresh = (): void => {
    setRefreshing(true);
    loadJobs();
  };

  const handleJobPress = (job: Job): void => {
    router.push(`/(technician)/job/${job.id}`);
  };
  
  const handleFilterPress = (filter: string): void => {
    setActiveFilter(filter);
  };

  const renderFilterButton = (label: string, value: string) => (
    <TouchableOpacity
      onPress={() => handleFilterPress(value)}
      className={`px-4 py-2 rounded-full mr-2 ${activeFilter === value ? 'bg-primary' : 'bg-secondary'}`}
    activeOpacity={0.8}
    >
      <Text className={`font-medium ${activeFilter === value ? 'text-primary-foreground' : 'text-secondary-foreground'}`}>
        {label}
      </Text>
    </TouchableOpacity>
  );

  const renderListItem = ({ item }: { item: ListItem }) => {
    if (item.type === 'header') {
      return (
        <View className="pt-4 pb-2 px-4">
          <Text className="text-lg font-semibold text-foreground">{item.title}</Text>
        </View>
      );
    } else {
      return (
        <JobItem job={item.data} onPress={() => handleJobPress(item.data)} />
      );
    }
  };
  
  const keyExtractor = (item: ListItem): string => {
    if (item.type === 'header') return item.id;
    return `job-${item.data.id}`;
  };

  const { isDark } = useTheme();

  return (
    <View className={`flex-1 ${isDark ? 'dark' : ''} bg-background`}>
      <StatusBar style={isDark ? "light" : "dark"} />
      
      {/* Header */}
      <View className="pt-12 pb-4 px-4 bg-card shadow-sm z-10">
        <View className="flex-row justify-between items-center mb-4">
          <View className="flex-row items-center">
            <Ionicons name="calendar-outline" size={28} color={isDark ? "#FBFBFB" : "#242424"} />
            <Text className="text-xl font-bold ml-2 text-foreground">Jobs</Text>
          </View>
          
          <View className="flex-row items-center">
            <TouchableOpacity 
              onPress={() => setSortBy(sortBy === 'date' ? 'status' : 'date')}
              className="mr-4"
            >
              <Ionicons 
                name={sortBy === 'date' ? "calendar-outline" : "list-outline"} 
                size={24} 
                color={isDark ? "#FBFBFB" : "#242424"} 
              />
            </TouchableOpacity>
            
            <TouchableOpacity onPress={() => setNotificationDrawerVisible(true)}>
              <NotificationBadge />
            </TouchableOpacity>
          </View>
        </View>
        
        {/* Search bar */}
        <View className="flex-row items-center bg-input rounded-lg px-3 py-2">
          <Ionicons name="search-outline" size={20} color={isDark ? "#A1A1AA" : "#71717A"} />
          <TextInput
            className="flex-1 pl-2 text-foreground"
            placeholder="Search jobs..."
            placeholderTextColor={isDark ? "#A1A1AA" : "#71717A"}
            value={searchQuery}
            onChangeText={setSearchQuery}
          />
          {searchQuery.length > 0 && (
            <TouchableOpacity onPress={() => setSearchQuery('')}>
              <Ionicons name="close-circle" size={20} color={isDark ? "#A1A1AA" : "#71717A"} />
            </TouchableOpacity>
          )}
        </View>
        
        {/* Filter buttons */}
        <View className="flex-row mt-3">
          <ScrollView horizontal showsHorizontalScrollIndicator={false}>
            {renderFilterButton('All', 'all')}
            {renderFilterButton('Pending', 'pending')}
            {renderFilterButton('In Progress', 'in_progress')}
            {renderFilterButton('Completed', 'completed')}
          </ScrollView>
        </View>
      </View>
      
      {/* Jobs list */}
      <FlatList
        data={listData}
        renderItem={renderListItem}
        keyExtractor={keyExtractor}
        contentContainerStyle={{ paddingBottom: 20 }}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={handleRefresh}
            colors={['#3b82f6']}
            tintColor={isDark ? "#FBFBFB" : "#3b82f6"}
          />
        }
        ListEmptyComponent={
          <View className="flex-1 justify-center items-center p-10">
            <Ionicons name="calendar" size={64} color={isDark ? "#4B5563" : "#E5E7EB"} />
            <Text className="text-center text-muted-foreground mt-4">
              {loading ? "Loading jobs..." : "No jobs found"}
            </Text>
          </View>
        }
      />
      
      {/* Notification drawer */}
      <NotificationDrawer
        visible={notificationDrawerVisible}
        onClose={() => setNotificationDrawerVisible(false)}
      />
    </View>
  );
} 