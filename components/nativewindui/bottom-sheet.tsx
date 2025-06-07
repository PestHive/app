import {
    BottomSheetBackdrop,

    BottomSheetModal,
    BottomSheetView,
} from '@gorhom/bottom-sheet';
import React, { useEffect, useMemo, useRef } from 'react';
import { Text } from 'react-native';
import { ThemedView } from '../ThemedView';
import { useTheme } from '~/context/ThemeContext';
import { Colors } from '~/constants/Colors';

export interface BottomSheetProps {
    children: React.ReactNode;
    visible?: boolean;
    snapPoints?: (string | number)[];
    title?: string;
    onDismiss?: () => void;
}


const BottomSheet: React.FC<BottomSheetProps> = ({
    children,
    visible = false,
    snapPoints = ['50%', '75%'],
    title,
    onDismiss,
    ...rest
}) => {
    const { isDark } = useTheme();
    const internalBottomSheetRef = useRef<BottomSheetModal>(null);
    const memoizedSnapPoints = useMemo(() => snapPoints, [snapPoints]);

    useEffect(() => {
        if (visible) {
            internalBottomSheetRef.current?.present();
        } else {
            internalBottomSheetRef.current?.dismiss();
        }
    }, [visible]);


    return (
        <BottomSheetModal
            ref={internalBottomSheetRef}
            index={0}
            snapPoints={memoizedSnapPoints}
            backdropComponent={(bProps) => (
                <BottomSheetBackdrop
                    {...bProps}
                    appearsOnIndex={0}
                    disappearsOnIndex={-1}
                />
            )}

            backgroundStyle={{
                backgroundColor: isDark ? Colors.dark.background : Colors.light.background,
            }}

            handleIndicatorStyle={{
                backgroundColor: isDark ? Colors.dark.icon : Colors.light.icon,
            }}
            onDismiss={onDismiss}
            enablePanDownToClose={true}

            {...rest}
        >
            <ThemedView>
                <BottomSheetView className="bg-background flex-1 p-4">
                    {title && (
                        <Text className="text-lg font-semibold mb-3 text-neutral-900 dark:text-neutral-100">
                            {title}
                        </Text>
                    )}
                    {children}
                </BottomSheetView>
            </ThemedView>
        </BottomSheetModal>
    );
};

export default BottomSheet;

