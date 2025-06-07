import {
    BottomSheetBackdrop,
    BottomSheetBackdropProps,
    BottomSheetModal,
} from '@gorhom/bottom-sheet';
import * as React from 'react';

import { useTheme } from '~/context/ThemeContext';
import { ThemedView } from '../ThemedView';

const Sheet = React.forwardRef<
    BottomSheetModal,
    React.ComponentPropsWithoutRef<typeof BottomSheetModal>
>(({ index = 0, backgroundStyle, style, handleIndicatorStyle, ...props }, ref) => {
    const { colors } = useTheme();

    const renderBackdrop = React.useCallback(
        (props: BottomSheetBackdropProps) => <BottomSheetBackdrop {...props} disappearsOnIndex={-1} />,
        []
    );
    return (
        <ThemedView>
            <BottomSheetModal
                ref={ref}
                index={index}
                backgroundStyle={
                    backgroundStyle ?? {
                        backgroundColor: colors.card,
                    }
                }
                style={
                    style ?? {
                        borderWidth: 1,
                        borderColor: colors.border,
                        borderTopStartRadius: 16,
                        borderTopEndRadius: 16,
                    }
                }
                handleIndicatorStyle={
                    handleIndicatorStyle ?? {
                        backgroundColor: colors.ring,
                    }
                }
                backdropComponent={renderBackdrop}
                {...props}
            />
        </ThemedView>
    );
});
Sheet.displayName = 'Sheet';

function useSheetRef() {
    return React.useRef<BottomSheetModal>(null);
}

export { Sheet, useSheetRef };

