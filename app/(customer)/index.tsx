import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { useCallback, useEffect, useState } from 'react';
import {
    FlatList,
    Pressable,
    RefreshControl,
    ScrollView,
    Text,
    TextInput,
    TouchableOpacity,
    View,
} from 'react-native';
import Badge, { BadgeVariant } from '~/components/Badge';
import { ThemedView } from '~/components/ThemedView';
import { CardContent } from '~/components/ui/card';
import { useTheme } from '~/context/ThemeContext';
import axios from '~/lib/axios';
import { cn } from '~/lib/utils';

// Icon name constants
const ICONS = {
    CALENDAR: 'calendar-outline',
    LOCATION: 'location-outline',
    CASH: 'cash-outline',
    HOURGLASS: 'hourglass-outline',
    ADD: 'add',
    SEARCH: 'search-outline',
    CLOSE: 'close-circle',
    CALENDAR_FILL: 'calendar',
} as const;

// Status icon mapping
const STATUS_ICONS = {
    CONFIRMED: 'checkmark-circle',
    PENDING: 'time',
    COMPLETED: 'checkmark-done-outline',
    CANCELLED: 'alert-circle',
    DEFAULT: 'help-outline',
} as const;

// Filter types for API and UI
const FILTERS = {
    ALL: 'all',
    CONFIRMED: 'confirmed',
    PENDING: 'pending',
    COMPLETED: 'completed',
    CANCELLED: 'cancelled',
} as const;

// Define appointment types
interface Appointment {
    id: number;
    service: {
        name: string
        description: string
        price: string
        estimated_duration_minutes: number
    };
    status: {
        code: string;
        name: string;
    };
    scheduled_date: string;
    scheduled_time: string;
    address: {
        address_line1: string;
    };
}

type Status = {
    id: number;
    name: string;
    code: string;
}
export default function CustomerAppointmentsScreen() {
    const router = useRouter();
    const { isDark } = useTheme();
    const [appointments, setAppointments] = useState<Appointment[]>([]);
    const [loading, setLoading] = useState<boolean>(true);
    const [refreshing, setRefreshing] = useState<boolean>(false);
    const [searchQuery, setSearchQuery] = useState<string>('');
    const [activeFilter, setActiveFilter] = useState<string>(FILTERS.ALL);
    const [statuses, setStatuses] = useState<Status[]>([
        {
            id: 1,
            name: 'All',
            code: FILTERS.ALL,
        },
        {
            id: 2,
            name: 'Confirmed',
            code: FILTERS.CONFIRMED,
        },
        {
            id: 3,
            name: 'Pending',
            code: FILTERS.PENDING,
        },
        {
            id: 4,
            name: 'Completed',
            code: FILTERS.COMPLETED,
        },
        {
            id: 5,
            name: 'Cancelled',
            code: FILTERS.CANCELLED,
        }
    ]);
    // Fetch appointments with optional filter
    const fetchAppointments = useCallback(async (filterStatus?: string) => {
        setLoading(true);
        try {
            let endpoint = '/customer/appointments';

            // Add filter param if specified
            if (filterStatus && filterStatus !== FILTERS.ALL) {
                endpoint += `?status=${filterStatus}`;
            }

            const response = await axios.get(endpoint);
            const data = response.data.data;
            setAppointments(data);
        } catch (error) {
            console.error('Error fetching appointments:', error);
            // Fallback to mock data in development
            if (process.env.NODE_ENV === 'development') {
                setAppointments([]);
            }
        } finally {
            setLoading(false);
        }
    }, []);

    // Mock appointments data for development/testing
    const mockAppointments: Appointment[] = [
        {
            id: 1,
            service: {
                name: 'Termite Inspection',
                description: 'Detailed inspection for termites.',
                price: '150.00',
                estimated_duration_minutes: 60,
            },
            status: {
                code: FILTERS.PENDING,
                name: 'Pending'
            },
            scheduled_date: '2023-11-22',
            scheduled_time: '13:00 - 14:00',
            address: {
                address_line1: '123 Main St, Anytown, USA'
            }
        },
        {
            id: 3,
            service: {
                name: 'Rodent Control',
                description: 'Effective rodent control solutions.',
                price: '200.00',
                estimated_duration_minutes: 90,
            },
            status: {
                code: FILTERS.COMPLETED,
                name: 'Completed'
            },
            scheduled_date: '2023-10-10',
            scheduled_time: '10:00 - 12:00',
            address: {
                address_line1: '123 Main St, Anytown, USA'
            }
        },
        {
            id: 4,
            service: {
                name: 'Mosquito Treatment',
                description: 'Mosquito treatment for your yard.',
                price: '100.00',
                estimated_duration_minutes: 45,
            },
            status: {
                code: FILTERS.CANCELLED,
                name: 'Cancelled'
            },
            scheduled_date: '2023-10-05',
            scheduled_time: '15:00 - 16:00',
            address: {
                address_line1: '123 Main St, Anytown, USA'
            }
        }
    ];

    // Load appointments on initial render
    useEffect(() => {
        fetchAppointments();
    }, [fetchAppointments]);

    // Handle filter changes
    const handleFilterChange = useCallback((filter: string) => {
        setActiveFilter(filter);
        fetchAppointments(filter);
    }, [fetchAppointments]);

    // Filter appointments based on search query
    const filteredAppointments = appointments.filter(appointment => {
        const matchesSearch =
            searchQuery === '' ||
            appointment.service.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
            appointment.address.address_line1?.toLowerCase().includes(searchQuery.toLowerCase());

        return matchesSearch;
    });

    // Handle appointment press
    const handleAppointmentPress = (appointment: Appointment) => {
        router.push({
            pathname: `/(customer)/appointment/${appointment.id}`
        } as any);
    };

    // Refresh appointments
    const handleRefresh = async () => {
        setRefreshing(true);
        await fetchAppointments(activeFilter);
        setRefreshing(false);
    };

    // Get status badge info based on status code
    const getStatusBadgeInfo = (status: string): { icon: string; variant: BadgeVariant } => {
        let icon: string, variant: BadgeVariant;

        switch (status) {
            case FILTERS.CONFIRMED:
                icon = STATUS_ICONS.CONFIRMED;
                variant = 'completed';
                break;
            case FILTERS.PENDING:
                icon = STATUS_ICONS.PENDING;
                variant = 'pending';
                break;
            case FILTERS.COMPLETED:
                icon = STATUS_ICONS.COMPLETED;
                variant = 'completed';
                break;
            case FILTERS.CANCELLED:
                icon = STATUS_ICONS.CANCELLED;
                variant = 'canceled';
                break;
            default:
                icon = STATUS_ICONS.DEFAULT;
                variant = 'default';
        }

        return { icon, variant };
    };

    // Render individual appointment card
    const renderAppointmentItem = ({ item }: { item: Appointment }) => {
        const { icon, variant } = getStatusBadgeInfo(item.status.code);
        const statusLabel = item.status.name;

        return (
            <CardContent
                className="mb-4 mx-4 "
            >
                <Pressable onPress={() => handleAppointmentPress(item)}>
                    <View className="flex-row justify-between items-start mb-2">
                        <Text className="text-lg font-semibold text-foreground flex-1 mr-2">
                            {item.service.name}
                        </Text>
                        <Badge
                            label={statusLabel}
                            icon={icon as any}
                            variant={variant}
                            size="sm"
                        />
                    </View>

                    <Text className="text-xs text-muted-foreground my-1" numberOfLines={2}>
                        {item.service.description}
                    </Text>

                    <View className="flex-row justify-between items-center my-1">
                        <View className="flex-row items-center">
                            <Ionicons name={ICONS.CASH} size={16} className="text-muted-foreground" />
                            <Text className="text-sm text-muted-foreground ml-2">
                                ${item.service.price}
                            </Text>
                        </View>
                        <View className="flex-row items-center">
                            <Ionicons name={ICONS.HOURGLASS} size={16} className="text-muted-foreground" />
                            <Text className="text-sm text-muted-foreground ml-2">
                                {item.service.estimated_duration_minutes} mins
                            </Text>
                        </View>
                    </View>

                    <View className="flex-row items-center my-1">
                        <Ionicons name={ICONS.CALENDAR} size={16} className="text-muted-foreground" />
                        <Text className="text-sm text-muted-foreground ml-2">
                            {item.scheduled_date}, {item.scheduled_time}
                        </Text>
                    </View>

                    <View className="flex-row items-center my-1">
                        <Ionicons name={ICONS.LOCATION} size={16} className="text-muted-foreground" />
                        <Text className="text-sm text-muted-foreground ml-2 flex-1">
                            {item.address?.address_line1}
                        </Text>
                    </View>
                </Pressable>
            </CardContent>
        );
    };

    // Render filter tab buttons
    const renderFilterButton = (label: string, value: string) => (
        <TouchableOpacity
            key={value}
            onPress={() => handleFilterChange(value)}
            className={`px-4 py-2 rounded-full mr-2 ${activeFilter === value ? 'bg-primary' : 'bg-secondary'}`}
            activeOpacity={0.8}
        >
            <Text className={`font-medium ${activeFilter === value ? 'text-primary-foreground' : 'text-secondary-foreground'}`}>
                {label}
            </Text>
        </TouchableOpacity>
    );

    return (
        <ThemedView>
            <View className="flex-1 bg-background">
                <StatusBar style={isDark ? "light" : "dark"} />

                {/* Header */}
                <View className="pt-12 pb-4 px-4 bg-card shadow-sm z-10">
                    <View className="flex-row justify-between items-center mb-4">
                        <View className="flex-row items-center">
                            <Text className="text-lg font-bold text-foreground">My Appointments</Text>
                        </View>
                        <TouchableOpacity
                            onPress={() => router.push('/(customer)/schedule')}
                            className="bg-primary px-3 py-1 rounded-lg flex-row items-center"
                        >
                            <Ionicons name={ICONS.ADD} size={18} className="text-primary-foreground" />
                            <Text className="text-white text-sm font-medium ml-1">Book</Text>
                        </TouchableOpacity>
                    </View>

                    {/* Search bar */}
                    <View className="bg-input border border-border dark:bg-input/50 rounded-xl px-3 flex-row items-center mb-2">
                        <Ionicons name={ICONS.SEARCH} size={18} className="text-muted-foreground" />
                        <TextInput
                            className="flex-1 py-2.5 px-2 text-foreground placeholder:text-muted-foreground"
                            placeholder="Search appointments..."
                            value={searchQuery}
                            onChangeText={setSearchQuery}
                        />
                        {searchQuery.length > 0 && (
                            <TouchableOpacity onPress={() => setSearchQuery('')}>
                                <Ionicons name={ICONS.CLOSE} size={16} className="text-muted-foreground" />
                            </TouchableOpacity>
                        )}
                    </View>

                    {/* Filter buttons */}
                    <View className="flex-row mt-3 overflow-hidden">
                        <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                            {statuses.map(status => renderFilterButton(status.name, status.code))}
                        </ScrollView>
                    </View>
                </View>

                {/* Appointments list */}
                <FlatList
                    data={filteredAppointments}
                    renderItem={renderAppointmentItem}
                    keyExtractor={(item) => item.id.toString()}
                    contentContainerStyle={{ paddingVertical: 10, paddingTop: 12 }}
                    showsVerticalScrollIndicator={false}
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
                            <Ionicons name={ICONS.CALENDAR_FILL} size={64} className="text-muted" />
                            <Text className="text-center text-muted-foreground mt-4">
                                {loading ? "Loading appointments..." : "No appointments found"}
                            </Text>
                            {!loading && (
                                <TouchableOpacity
                                    className="mt-4 bg-primary px-4 py-2 rounded-lg"
                                    onPress={() => router.push('/(customer)/schedule')}
                                >
                                    <Text className="text-white font-medium">Schedule New Appointment</Text>
                                </TouchableOpacity>
                            )}
                        </View>
                    }
                />
            </View>
        </ThemedView>
    );
} 