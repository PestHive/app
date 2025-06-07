import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { useEffect, useState } from 'react';
import {
    FlatList,
    Pressable,
    RefreshControl,
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

// Import IconName type or define it here
type IconName = 'time-outline' | 'play-outline' | 'checkmark-done-outline' | 'help-outline' |
    'bug-outline' | 'flask-outline' | 'paw-outline' | 'build-outline' |
    'location-outline' | 'calendar-outline' | 'navigate-outline' | 'call-outline' |
    'time' | 'checkmark-circle' | 'alert-circle' | 'person-outline' | 'help-circle';

// Define invoice types
interface Invoice {
    id: number;
    invoice_number: string;
    service: {
        name: string;
    };
    date: string;
    due_date: string;
    amount: number;
    formatted_amount: string;
    status: 'paid' | 'pending' | 'overdue';
    payment_method?: string;
    payment_date?: string;
}

export default function CustomerInvoicesScreen() {
    const router = useRouter();
    const { isDark } = useTheme();

    // Mock invoices data
    const mockInvoices: Invoice[] = [
        {
            id: 1,
            invoice_number: 'INV-2023-001',
            service: {
                name: 'Pest Control - Residential',
            },
            date: '2023-11-05',
            due_date: '2023-11-19',
            amount: 120.00,
            formatted_amount: '£120.00',
            status: 'paid',
            payment_method: 'Credit Card',
            payment_date: '2023-11-07'
        },
        {
            id: 2,
            invoice_number: 'INV-2023-002',
            service: {
                name: 'Termite Inspection',
            },
            date: '2023-11-10',
            due_date: '2023-11-24',
            amount: 150.00,
            formatted_amount: '£150.00',
            status: 'pending',
        },
        {
            id: 3,
            invoice_number: 'INV-2023-003',
            service: {
                name: 'Rodent Control',
            },
            date: '2023-10-20',
            due_date: '2023-11-03',
            amount: 110.00,
            formatted_amount: '£110.00',
            status: 'overdue',
        },
        {
            id: 4,
            invoice_number: 'INV-2023-004',
            service: {
                name: 'Mosquito Treatment',
            },
            date: '2023-10-10',
            due_date: '2023-10-24',
            amount: 95.00,
            formatted_amount: '£95.00',
            status: 'paid',
            payment_method: 'Bank Transfer',
            payment_date: '2023-10-15'
        },
        {
            id: 5,
            invoice_number: 'INV-2023-005',
            service: {
                name: 'Spider Control',
            },
            date: '2023-10-01',
            due_date: '2023-10-15',
            amount: 115.00,
            formatted_amount: '£115.00',
            status: 'paid',
            payment_method: 'PayPal',
            payment_date: '2023-10-05'
        }
    ];

    const [invoices, setInvoices] = useState<Invoice[]>([]);
    const [searchQuery, setSearchQuery] = useState<string>('');
    const [refreshing, setRefreshing] = useState<boolean>(false);
    const [activeFilter, setActiveFilter] = useState<string>('all');

    // Filter invoices based on search and active filter
    const filteredInvoices = invoices.filter(invoice => {
        const matchesSearch =
            searchQuery === '' ||
            invoice.invoice_number.toLowerCase().includes(searchQuery.toLowerCase()) ||
            invoice.service.name.toLowerCase().includes(searchQuery.toLowerCase());

        const matchesFilter =
            activeFilter === 'all' ||
            invoice.status === activeFilter;

        return matchesSearch && matchesFilter;
    });

    // Refresh invoices
    const handleRefresh = () => {
        setRefreshing(true);
        // This would be an API call in a real app
        setTimeout(() => {
            setInvoices(mockInvoices);
            setRefreshing(false);
        }, 1000);
    };

    // Format date for display
    const formatDate = (dateString: string) => {
        const date = new Date(dateString);
        return date.toLocaleDateString('en-GB', {
            day: '2-digit',
            month: 'short',
            year: 'numeric'
        });
    };

    // Get status badge styling
    const getStatusBadgeInfo = (status: string): { icon: string; variant: BadgeVariant } => {
        let icon: string, variant: BadgeVariant;

        switch (status) {
            case 'paid':
                icon = 'checkmark-circle';
                variant = 'paid';
                break;
            case 'pending':
                icon = 'time';
                variant = 'pending';
                break;
            case 'overdue':
                icon = 'alert-circle';
                variant = 'overdue';
                break;
            default:
                icon = 'help-outline';
                variant = 'default';
        }

        return { icon, variant };
    };

    // Handle invoice press to view details
    const handleInvoicePress = (invoice: Invoice) => {
        // Navigate to invoice details page
        router.push({
            pathname: `/invoice/${invoice.id}`,
        } as any);
    };

    const renderInvoiceItem = ({ item }: { item: Invoice }) => {
        const { icon, variant } = getStatusBadgeInfo(item.status);

        return (
            <CardContent
                className="mb-3 mx-4 overflow-hidden"
            >
                <Pressable onPress={() => handleInvoicePress(item)}>
                    {/* Amount and status */}
                    <View className="flex-row justify-between items-center mb-4">
                        <Text className="text-foreground text-xl font-bold">{item.formatted_amount || 'N/A'}</Text>
                        <Badge
                            label={item.status.charAt(0).toUpperCase() + item.status.slice(1)}
                            icon={icon as any}
                            variant={variant}
                            size="sm"
                        />
                    </View>

                    {/* Service and invoice number */}
                    <View className="mb-3">
                        <Text className="text-foreground text-base font-semibold">{item.service?.name || 'N/A'}</Text>
                        <Text className="text-muted-foreground text-xs mt-1">Invoice: {item.invoice_number}</Text>
                    </View>

                    {/* Simple date display without border */}
                    <View className="flex-row mb-2">
                        <View className="flex-1 mr-4">
                            <Text className="text-xs text-muted-foreground mb-1">Date</Text>
                            <Text className="text-sm text-foreground">{formatDate(item.date)}</Text>
                        </View>
                        <View className="flex-1">
                            <Text className="text-xs text-muted-foreground mb-1">Due</Text>
                            <Text className="text-sm text-foreground">{formatDate(item.due_date)}</Text>
                        </View>
                    </View>

                    {/* Simple payment info */}
                    {item.status === 'paid' && item.payment_method && (
                        <View className="mt-2 pt-2 border-t border-border">
                            <Text className="text-xs text-green-600">
                                ✓ Paid with {item.payment_method} • {formatDate(item.payment_date || '')}
                            </Text>
                        </View>
                    )}
                </Pressable>
            </CardContent>
        );
    };

    const renderFilterButton = (label: string, value: string) => (
        <TouchableOpacity
            onPress={() => setActiveFilter(value)}
            className={`px-4 py-2 rounded-full mr-2 ${activeFilter === value ? 'bg-primary' : 'bg-secondary'}`}
            activeOpacity={0.8}
        >
            <Text className={`font-medium ${activeFilter === value ? 'text-primary-foreground' : 'text-secondary-foreground'}`}>
                {label}
            </Text>
        </TouchableOpacity>
    );


    const fetchInvoices = async () => {
        try {
            const response = await axios.get('/customer/invoices');
            console.log(response)
            const data = response.data.data;
            setInvoices(data);
        } catch (error) {
            console.error(error);
        }
    }

    useEffect(() => {
        fetchInvoices();
    }, []);

    return (
        <ThemedView>
            <View className="flex-1 bg-background">
                <StatusBar style={isDark ? "light" : "dark"} />

                {/* Header */}
                <View className="pt-12 pb-4 px-4 bg-card shadow-sm z-10">
                    <View className="flex-row items-center mb-4">
                        <Text className="text-lg font-bold ml-2 text-foreground">My Invoices</Text>
                    </View>

                    {/* Search bar */}
                    <View className="bg-input dark:bg-input/50 rounded-xl px-3 flex-row items-center mb-2">
                        <Ionicons name="search-outline" size={18} className="text-muted-foreground" />
                        <TextInput
                            className="flex-1 py-2.5 px-2 text-foreground placeholder:text-muted-foreground"
                            placeholder="Search invoices..."
                            value={searchQuery}
                            onChangeText={setSearchQuery}
                        />
                        {searchQuery.length > 0 && (
                            <TouchableOpacity onPress={() => setSearchQuery('')}>
                                <Ionicons name='close' size={16} className="text-muted-foreground" />
                            </TouchableOpacity>
                        )}
                    </View>

                    {/* Filter buttons */}
                    <View className="flex-row mt-3 overflow-x-auto">
                        <FlatList
                            horizontal
                            showsHorizontalScrollIndicator={false}
                            data={[
                                { label: 'All', value: 'all' },
                                { label: 'Paid', value: 'paid' },
                                { label: 'Pending', value: 'pending' },
                                { label: 'Overdue', value: 'overdue' }
                            ]}
                            renderItem={({ item }) => renderFilterButton(item.label, item.value)}
                            keyExtractor={(item) => item.value}
                        />
                    </View>
                </View>
                {/* Invoice summary */}
                <View className="bg-card mx-4 mt-3 mb-3 p-4 rounded-lg border border-border shadow-sm">
                    <View className="flex-row justify-between">
                        <View className="flex-row items-center">
                            <Text className="text-foreground font-bold mr-1">Total:</Text>
                            <Text className="text-foreground">{filteredInvoices.length}</Text>
                        </View>
                        <View className="flex-row items-center">
                            <Text className="text-foreground font-bold mr-1">Due:</Text>
                            <Text className="text-destructive font-bold">
                                £{invoices
                                    .filter(inv => inv.status === 'pending' || inv.status === 'overdue')
                                    .reduce((sum, inv) => sum + inv.amount, 0)
                                    .toFixed(2)}
                            </Text>
                        </View>
                        <View className="flex-row items-center">
                            <Text className="text-foreground font-bold mr-1">Paid:</Text>
                            <Text className="text-green-600 font-bold ">
                                £{invoices
                                    .filter(inv => inv.status === 'paid')
                                    .reduce((sum, inv) => sum + inv.amount, 0)
                                    .toFixed(2)}
                            </Text>
                        </View>
                    </View>
                </View>

                {/* Invoices list */}
                <FlatList
                    data={filteredInvoices}
                    renderItem={renderInvoiceItem}
                    keyExtractor={(item) => item.id.toString()}
                    contentContainerStyle={{ paddingBottom: 10 }}
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
                            <Ionicons name="receipt" size={64} color={isDark ? "#4B5563" : "#E5E7EB"} />
                            <Text className="text-center text-muted-foreground mt-4">
                                No invoices found
                            </Text>
                        </View>
                    }
                />
            </View>
        </ThemedView>
    );
} 