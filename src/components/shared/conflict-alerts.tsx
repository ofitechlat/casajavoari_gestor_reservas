'use client';

import { Conflict } from '@/lib/booking-utils';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import { AlertCircle, AlertTriangle, Info } from 'lucide-react';
import { cn } from '@/lib/utils';

interface ConflictAlertsProps {
    conflicts: Conflict[];
    onBypass?: () => void;
    canBypass?: boolean;
    className?: string;
}

export function ConflictAlerts({ conflicts, onBypass, canBypass = false, className }: ConflictAlertsProps) {
    if (conflicts.length === 0) return null;

    const blockingConflicts = conflicts.filter(c => c.severity === 'blocking');
    const warningConflicts = conflicts.filter(c => c.severity === 'warning');
    const infoConflicts = conflicts.filter(c => c.severity === 'info');

    return (
        <div className={cn("space-y-3", className)}>
            {/* Blocking Conflicts */}
            {blockingConflicts.map((conflict, idx) => (
                <Alert key={`blocking-${idx}`} variant="destructive">
                    <AlertCircle className="h-4 w-4" />
                    <AlertTitle className="font-bold">Conflicto Bloqueante</AlertTitle>
                    <AlertDescription>
                        <p className="font-medium">{conflict.message}</p>
                        {conflict.suggestion && (
                            <p className="text-sm mt-2 opacity-90">
                                💡 {conflict.suggestion}
                            </p>
                        )}
                    </AlertDescription>
                </Alert>
            ))}

            {/* Warning Conflicts */}
            {warningConflicts.map((conflict, idx) => (
                <Alert key={`warning-${idx}`} className="border-yellow-500/50 bg-yellow-500/10">
                    <AlertTriangle className="h-4 w-4 text-yellow-600" />
                    <AlertTitle className="font-bold text-yellow-900 dark:text-yellow-100">
                        Advertencia
                    </AlertTitle>
                    <AlertDescription className="text-yellow-800 dark:text-yellow-200">
                        <p className="font-medium">{conflict.message}</p>
                        {conflict.suggestion && (
                            <p className="text-sm mt-2 opacity-90">
                                💡 {conflict.suggestion}
                            </p>
                        )}
                    </AlertDescription>
                </Alert>
            ))}

            {/* Info Conflicts */}
            {infoConflicts.map((conflict, idx) => (
                <Alert key={`info-${idx}`} className="border-blue-500/50 bg-blue-500/10">
                    <Info className="h-4 w-4 text-blue-600" />
                    <AlertTitle className="font-bold text-blue-900 dark:text-blue-100">
                        Información
                    </AlertTitle>
                    <AlertDescription className="text-blue-800 dark:text-blue-200">
                        <p className="font-medium">{conflict.message}</p>
                        {conflict.suggestion && (
                            <p className="text-sm mt-2 opacity-90">
                                💡 {conflict.suggestion}
                            </p>
                        )}
                    </AlertDescription>
                </Alert>
            ))}

            {/* Bypass Button (only for warnings, not blocking) */}
            {canBypass && warningConflicts.length > 0 && blockingConflicts.length === 0 && onBypass && (
                <Button
                    type="button"
                    variant="outline"
                    className="w-full border-yellow-500/50 hover:bg-yellow-500/10"
                    onClick={onBypass}
                >
                    ✓ Continuar de todas formas
                </Button>
            )}
        </div>
    );
}
