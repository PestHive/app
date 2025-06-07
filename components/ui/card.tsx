import * as React from "react"
import { Text, TextProps, View, ViewProps } from "react-native"

import { cn } from "~/lib/utils"

function Card({ className, ...props }: ViewProps) {
    return (
        <View
            className={cn(
                "text-foreground flex flex-col gap-2",
                className
            )}
            {...props}
        />
    )
}

function CardHeader({ className, ...props }: ViewProps) {
    return (
        <View
            className={cn(
                "grid auto-rows-min grid-rows-[auto_auto] items-start gap-1.5 has-data-[slot=card-action]:grid-cols-[1fr_auto] [.border-b]:pb-4",
                className
            )}
            {...props}
        />
    )
}

function CardTitle({ className, ...props }: TextProps) {
    return (
        <Text
            className={cn("text-foreground text-base leading-none font-semibold", className)}
            {...props}
        >
            {props.children}
        </Text>
    )
}

function CardDescription({ className, ...props }: TextProps) {
    return (
        <Text
            className={cn("text-muted-foreground text-sm", className)}
            {...props}
        >
            {props.children}
        </Text>
    )
}

function CardAction({ className, ...props }: ViewProps) {
    return (
        <View
            className={cn(
                "col-start-2 row-span-2 row-start-1 self-start justify-self-end",
                className
            )}
            {...props}
        />
    )
}

function CardContent({ className, ...props }: ViewProps) {
    return (
        <View
            className={cn("bg-card text-card-foreground flex flex-col gap-4 rounded-lg border border-border p-4 shadow-sm ", className)}
            {...props}
        />
    )
}

function CardFooter({ className, ...props }: ViewProps) {
    return (
        <View
            className={cn("flex items-center px-6 [.border-t]:pt-6", className)}
            {...props}
        />
    )
}

export {
    Card,
    CardHeader,
    CardFooter,
    CardTitle,
    CardAction,
    CardDescription,
    CardContent,
}