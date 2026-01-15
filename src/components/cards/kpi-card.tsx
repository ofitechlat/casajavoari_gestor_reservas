"use client";

import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { cva, type VariantProps } from "class-variance-authority";
import { LucideIcon, MoreVertical } from "lucide-react";
import { KpiDropdownMenu } from "./kpi-dropdown-menu";

const kpiCardVariants = cva(
    "border-0 shadow-none transition-all hover:shadow-md",
    {
        variants: {
            variant: {
                info: "bg-gradient-to-tr from-cyan-200/40 to-cyan-100/40 dark:from-cyan-950/40 dark:to-cyan-900/40",
                success: "bg-gradient-to-tr from-green-200/40 to-green-100/40 dark:from-green-950/40 dark:to-green-900/40",
                destructive: "bg-gradient-to-tr from-pink-200/40 to-pink-100/40 dark:from-pink-950/40 dark:to-pink-900/40",
                warning: "bg-gradient-to-tr from-yellow-200/40 to-yellow-100/40 dark:from-yellow-950/40 dark:to-yellow-900/40",
            },
        },
        defaultVariants: {
            variant: "info",
        },
    }
);

export interface KpiCardProps extends VariantProps<typeof kpiCardVariants> {
    className?: string;
    title: string;
    value: number | string;
    subtitle?: string;
    icon: LucideIcon;
    loading?: boolean;
    onMenuClick?: () => void;
}

export function KpiCard({
    variant,
    className,
    title,
    value,
    subtitle,
    icon: Icon,
    loading = false,
    onMenuClick,
}: KpiCardProps) {
    return (
        <Card className={cn(kpiCardVariants({ variant }), className)}>
            <CardContent className="px-6 space-y-1 ">
                <div className="mb-4 flex items-start justify-between">
                    <div className="flex size-8 items-center justify-center rounded-xl lg:size-10">
                        <Icon className="size-5" />
                    </div>

                    <KpiDropdownMenu
                        trigger={
                            <Button variant="ghost" size="icon">
                                <MoreVertical className="size-4" />
                            </Button>
                        }
                    />

                </div>

                <p className="text-muted-foreground text-sm">{title}</p>
                {loading ? (
                    <div className="h-9 w-20 bg-muted animate-pulse rounded" />
                ) : (
                    <p className="text-2xl font-semibold lg:text-3xl">{value}</p>
                )}
                {subtitle && (
                    <p className="text-muted-foreground text-sm">{subtitle}</p>
                )}
            </CardContent>
        </Card>
    );
}
