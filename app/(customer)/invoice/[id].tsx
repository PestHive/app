import { Ionicons } from '@expo/vector-icons';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { useEffect, useState } from 'react';
import {
    Alert,
    ScrollView,
    Share,
    Text,
    TouchableOpacity,
    View,
} from 'react-native';
import Badge, { BadgeVariant } from '~/components/Badge';
import { ThemedView } from '~/components/ThemedView';
import { Card, CardContent, CardHeader, CardTitle } from '~/components/ui/card';
import { useTheme } from '~/context/ThemeContext';

// Invoice interface
interface Invoice {
    id: number;
    invoice_number: string;
    service: string;
    date: string;
    due_date: string;
    amount: number;
    formatted_amount: string;
    status: 'paid' | 'pending' | 'overdue';
    payment_method?: string;
    payment_date?: string;
    customer_name: string;
    address: string;
    line_items: InvoiceItem[];
    subtotal: number;
    tax: number;
    tax_rate: number;
    notes?: string;
}

// Invoice line item
interface InvoiceItem {
    id: number;
    description: string;
    quantity: number;
    unit_price: number;
    total: number;
}

export default function InvoiceDetailScreen() {
    const { id } = useLocalSearchParams<{ id: string }>();
    const router = useRouter();
    const { isDark } = useTheme();
    const [invoice, setInvoice] = useState<Invoice | null>(null);
    const [loading, setLoading] = useState(true);

    // Fetch invoice data
    useEffect(() => {
        // This would be an API call in a real app
        // Mock data for the specific invoice
        const invoiceId = parseInt(id || '1');

        // Determine status based on ID for testing different states
        let status: 'paid' | 'pending' | 'overdue' = 'pending';
        let paymentMethod;
        let paymentDate;

        if (invoiceId % 3 === 0) {
            status = 'overdue';
        } else if (invoiceId % 3 === 1) {
            status = 'paid';
            paymentMethod = 'Credit Card';
            paymentDate = '2023-11-07';
        }

        const mockInvoice: Invoice = {
            id: invoiceId,
            invoice_number: `INV-2023-00${id}`,
            service: 'Pest Control - Residential',
            date: '2023-11-05',
            due_date: '2023-11-19',
            amount: 120.00,
            formatted_amount: '£120.00',
            status: status,
            payment_method: paymentMethod,
            payment_date: paymentDate,
            discount: 0.00,
            customer_name: 'John Doe',
            address: '123 Main St, Anytown, London SW1A 1AA',
            line_items: [
                {
                    id: 1,
                    description: 'Initial Inspection',
                    quantity: 1,
                    unit_price: 40.00,
                    total: 40.00
                },
                {
                    id: 2,
                    description: 'Treatment Application',
                    quantity: 1,
                    unit_price: 65.00,
                    total: 65.00
                },
                {
                    id: 3,
                    description: 'Prevention Materials',
                    quantity: 1,
                    unit_price: 15.00,
                    total: 15.00
                }
            ],
            subtotal: 120.00,
            tax: 0.00,
            tax_rate: 0,
            notes: 'Please contact our office if you have any questions about this invoice.'
        };

        setTimeout(() => {
            setInvoice(mockInvoice);
            setLoading(false);
        }, 1000);
    }, [id]);

    // Format date for display
    const formatDate = (dateString: string) => {
        const date = new Date(dateString);
        return date.toLocaleDateString('en-GB', {
            day: '2-digit',
            month: 'short',
            year: 'numeric'
        });
    };

    // Handle payment
    const handlePayNow = () => {
        Alert.alert(
            'Process Payment',
            'This would redirect to a payment gateway in a real app.',
            [
                {
                    text: 'Cancel',
                    style: 'cancel'
                },
                {
                    text: 'Continue',
                    onPress: () => console.log('Proceed to payment')
                }
            ]
        );
    };

    // Handle download/share invoice
    const handleShareInvoice = async () => {
        try {
            if (invoice) {
                await Share.share({
                    message: `Invoice ${invoice.invoice_number} for ${invoice.service} - ${invoice.formatted_amount}`,
                    title: `Invoice ${invoice.invoice_number}`
                });
            }
        } catch (error) {
            Alert.alert('Error', 'Unable to share invoice');
        }
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

    if (loading) {
        return (
            <ThemedView>
                <StatusBar style={isDark ? "light" : "dark"} />
                <View className="flex-1 justify-center items-center">
                    <Text className="text-foreground">Loading invoice...</Text>
                </View>
            </ThemedView>
        );
    }

    if (!invoice) {
        return (
            <ThemedView>
                <StatusBar style={isDark ? "light" : "dark"} />
                <View className="flex-1 justify-center items-center">
                    <Text className="text-foreground">Invoice not found</Text>
                    <TouchableOpacity
                        className="mt-4 bg-primary px-4 py-2 rounded-lg"
                        onPress={() => router.push({
                            pathname: "/invoices"
                        } as any)}
                    >
                        <Text className="text-white font-medium">View All Invoices</Text>
                    </TouchableOpacity>
                </View>
            </ThemedView>
        );
    }

    const { icon, variant } = getStatusBadgeInfo(invoice.status);
    const statusLabel = invoice.status.charAt(0).toUpperCase() + invoice.status.slice(1);

    return (
        <ThemedView>
            <View className="flex-1 bg-background">
                <StatusBar style={isDark ? "light" : "dark"} />

                {/* Header */}
                <View className="pt-12 pb-4 px-4 bg-card shadow-sm">
                    <View className="flex-row items-center">
                        <TouchableOpacity
                            onPress={() => router.back()}
                            className="mr-3"
                        >
                            <Ionicons name="arrow-back" size={24} color={isDark ? "#FBFBFB" : "#242424"} />
                        </TouchableOpacity>
                        <View className="flex-1">
                            <Text className="text-xl font-bold text-foreground">Invoice Details</Text>
                            <Text className="text-muted-foreground">{invoice.invoice_number}</Text>
                        </View>
                        <TouchableOpacity
                            onPress={handleShareInvoice}
                            className="bg-secondary p-2 rounded-full"
                        >
                            <Ionicons name="share-outline" size={20} color={isDark ? "#FBFBFB" : "#242424"} />
                        </TouchableOpacity>
                    </View>
                </View>

                <ScrollView className="flex-1 p-4">
                    {/* Status and Amount Panel */}
                    <CardContent className="mb-4">
                        <View className="flex-row justify-between items-center mb-4">
                            <View>
                                <Text className="text-foreground text-2xl font-bold">{invoice.formatted_amount}</Text>
                                <Text className="text-muted-foreground">Due {formatDate(invoice.due_date)}</Text>
                            </View>
                            <Badge
                                label={statusLabel}
                                icon={icon as any}
                                variant={variant}
                                size="md"
                            />
                        </View>

                        {/* Payment Button (Only for pending or overdue) */}
                        {(invoice.status === 'pending' || invoice.status === 'overdue') && (
                            <TouchableOpacity
                                onPress={handlePayNow}
                                className="bg-primary py-3 rounded-lg"
                            >
                                <Text className="text-white font-semibold text-center">Pay Now</Text>
                            </TouchableOpacity>
                        )}

                        {/* Payment Info (Only for paid) */}
                        {invoice.status === 'paid' && invoice.payment_method && (
                            <View className="bg-green-50 dark:bg-green-900 p-3 rounded-lg">
                                <View className="flex-row items-center">
                                    <Ionicons name="checkmark-circle" size={18} className='text-green-800 dark:text-green-200' />
                                    <Text className="ml-2 text-green-800 dark:text-green-200 font-medium">
                                        Paid via {invoice.payment_method} on {formatDate(invoice.payment_date || '')}
                                    </Text>
                                </View>
                            </View>
                        )}
                    </CardContent>

                    {/* Invoice Info */}
                    <Card className="mb-6">
                        <CardHeader>
                            <CardTitle>
                                Invoice Information
                            </CardTitle>
                        </CardHeader>

                        <CardContent className="space-y-4">
                            <View className="flex-row justify-between">
                                <Text className="text-muted-foreground">Service:</Text>
                                <Text className="text-foreground font-medium">{invoice.service}</Text>
                            </View>

                            <View className="h-[1px] bg-border" />

                            <View className="flex-row justify-between">
                                <Text className="text-muted-foreground">Invoice Date:</Text>
                                <Text className="text-foreground">{formatDate(invoice.date)}</Text>
                            </View>

                            <View className="h-[1px] bg-border" />

                            <View className="flex-row justify-between">
                                <Text className="text-muted-foreground">Due Date:</Text>
                                <Text className="text-foreground">{formatDate(invoice.due_date)}</Text>
                            </View>

                            <View className="h-[1px] bg-border" />

                            <View>
                                <Text className="text-muted-foreground mb-1">Billed To:</Text>
                                <Text className="text-foreground">{invoice.customer_name}</Text>
                                <Text className="text-foreground">{invoice.address}</Text>
                            </View>
                        </CardContent>
                    </Card>

                    {/* Line Items */}
                    <Card className="mb-6">
                        <CardHeader>
                            <CardTitle>
                                Invoice Items
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            {invoice.line_items.map((item, index) => (
                                <View
                                    key={item.id}
                                    className={`py-0.5 ${index < invoice.line_items.length - 1 ? 'border-b border-border' : ''}`}
                                >
                                    <View className="flex-row justify-between mb-1">
                                        <Text className="text-foreground font-medium">{item.description}</Text>
                                        <Text className="text-foreground font-medium">£{item.total.toFixed(2)}</Text>
                                    </View>
                                    <View className="flex-row justify-between">
                                        <Text className="text-muted-foreground text-sm">
                                            {item.quantity} x £{item.unit_price.toFixed(2)}
                                        </Text>
                                    </View>
                                </View>
                            ))}

                            {/* Subtotal, Tax and Total */}
                            <View className="pt-4 border-t border-border">
                                <View className="flex-row justify-between mb-1">
                                    <Text className="text-muted-foreground">Subtotal</Text>
                                    <Text className="text-foreground">£{invoice.subtotal.toFixed(2)}</Text>
                                </View>

                                <View className="flex-row justify-between mb-1">
                                    <Text className="text-muted-foreground">Tax ({invoice.tax_rate}%)</Text>
                                    <Text className="text-foreground">£{invoice.tax.toFixed(2)}</Text>
                                </View>
                                <View className='flex-row justify-between mb-1'>
                                    <Text className="text-muted-foreground">Discount</Text>
                                    <Text className="text-foreground">£{invoice.discount.toFixed(2)}</Text>
                                </View>
                                <View className="flex-row justify-between mt-2 pt-2 border-t border-border">
                                    <Text className="text-foreground font-semibold">Total</Text>
                                    <Text className="text-foreground font-bold text-lg">{invoice.formatted_amount}</Text>
                                </View>
                            </View>
                        </CardContent>
                    </Card>

                    {/* Notes */}
                    {invoice.notes && (
                        <Card className="mb-12">
                            <CardHeader>
                                <CardTitle>
                                    Notes
                                </CardTitle>
                            </CardHeader>
                            <CardContent>
                                <Text className="text-muted-foreground">{invoice.notes}</Text>
                            </CardContent>
                        </Card>
                    )}
                </ScrollView>
            </View>
        </ThemedView>
    );
} 