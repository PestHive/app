import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { useEffect, useMemo, useState } from 'react';
import {
  FlatList,
  RefreshControl,
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

export default function HomeScreen() {
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
    router.push(`/(tabs)/job/${job.id}`);
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
        <View className="py-2 px-2 mt-2 rounded-t-lg">
          <Text className="font-bold text-foreground">{item.title}</Text>
        </View>
      );
    } else {
      return <JobItem job={item.data}  />;
    }
  };

  const keyExtractor = (item: ListItem): string => {
    return item.type === 'header' ? item.id : `job-${item.data.id}`;
  };
  
  const { isDark } = useTheme();

  return (
    <View className={`flex-1 ${isDark ? 'dark' : ''} bg-background`}>
      <StatusBar style={isDark ? "light" : "dark"} />

      {/* Notification Drawer */}
      <NotificationDrawer 
        isVisible={notificationDrawerVisible} 
        onClose={() => setNotificationDrawerVisible(false)} 
      />

      {/* Header */}
      <View className="pt-12 pb-2 px-4 bg-card shadow-sm z-10">
        <View className="flex-row justify-between items-center mb-4">
          <View className="flex-row items-center">
            <View className="h-9 w-9 rounded-full bg-primary items-center justify-center mr-2">
              <Ionicons name="calendar" size={18} color={isDarkMode ? "#FBFBFB" : "#FBFBFB"} />
            </View>
            <View>
              <Text className="text-xl font-bold text-foreground">My Jobs</Text>
              <Text className="text-xs text-muted-foreground">
                {filteredJobs.length} {filteredJobs.length === 1 ? 'job' : 'jobs'} {activeFilter !== 'all' ? `(${activeFilter})` : ''}
              </Text>
            </View>
          </View>
          <NotificationBadge onPress={() => setNotificationDrawerVisible(true)} />
        </View>
        
        {/* Search Bar */}
        <View className="bg-input rounded-xl px-3 flex-row items-center mb-4">
          <Ionicons name="search-outline" size={18} color={isDarkMode ? "#a5b4fc" : "#6366f1"} />
          <TextInput
            className="flex-1 py-2.5 px-2 text-foreground placeholder:text-muted-foreground"
            placeholder="Search jobs..."
            value={searchQuery}
            onChangeText={setSearchQuery}
            placeholderTextColor={isDarkMode ? "#94a3b8" : "#94a3b8"}
          />
          {searchQuery ? (
            <TouchableOpacity onPress={() => setSearchQuery('')}>
              <Ionicons name="close-circle" size={18} color={isDarkMode ? "#a5b4fc" : "#6366f1"} />
            </TouchableOpacity>
          ) : null}
        </View>
        
        {/* Filter Tabs */}
        <View className="flex-row overflow-x-scroll pb-2">
          {renderFilterButton('All', 'all')}
          {renderFilterButton('Pending', 'pending')}
          {renderFilterButton('In Progress', 'in_progress')}
          {renderFilterButton('Completed', 'completed')}
        </View>
      </View>

      {/* Job List */}
      {loading ? (
        <View className="flex-1 justify-center items-center">
          <View className="h-8 w-8 rounded-full border-2 border-primary border-t-transparent animate-spin" />
          <Text className="text-muted-foreground mt-4">Loading your jobs...</Text>
        </View>
      ) : (
        <FlatList
          data={listData}
          renderItem={renderListItem}
          keyExtractor={keyExtractor}
          contentContainerStyle={{ paddingBottom: 100, paddingHorizontal: 12 }}
          refreshControl={
            <RefreshControl 
              refreshing={refreshing} 
              onRefresh={handleRefresh}
              colors={['#6366f1']} 
              tintColor="#6366f1"
            />
          }
          ListEmptyComponent={
            <View className="flex-1 justify-center items-center py-20 mt-6 bg-card rounded-xl mx-4 shadow-sm">
              <Ionicons name="calendar-outline" size={64} color={isDarkMode ? "#4b5563" : "#CBD5E1"} />
              <Text className="text-muted-foreground text-lg mt-4 text-center">
                {searchQuery 
                  ? 'No jobs match your search' 
                  : activeFilter !== 'all' 
                    ? `No ${activeFilter} jobs found` 
                    : 'No jobs found'}
              </Text>
              {(searchQuery || activeFilter !== 'all') && (
                <TouchableOpacity
                  className="mt-4 rounded-full bg-secondary px-5 py-2.5"
                  onPress={() => {
                    setSearchQuery('');
                    setActiveFilter('all');
                  }}
                >
                  <Text className="text-secondary-foreground font-medium">Reset Filters</Text>
                </TouchableOpacity>
              )}
            </View>
          }
          ListHeaderComponent={null}
        />
      )}

      {/* Floating Action Button */}
      <TouchableOpacity
        className="absolute bottom-6 right-6 bg-primary w-14 h-14 rounded-full items-center justify-center shadow-lg elevation-5"
        onPress={() => console.log('Create new job')}
      >
        <Ionicons name="add" size={26} color="white" />
      </TouchableOpacity>
    </View>
  );
} 