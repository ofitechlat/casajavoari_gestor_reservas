import { Checkbox } from '@/components/ui/checkbox'
import { Label } from '@/components/ui/label'
import React from 'react';


export function CheckboxCard({
    label,
    description,
    checked,
    onCheckedChange,
    children,
}: {
    label: string;
    description: string;
    checked: boolean;
    onCheckedChange: (checked: boolean) => void;
    children?: React.ReactNode;
}) {
    return (
        <div className='space-y-2'>
            <Label className='hover:bg-accent/50 flex items-start gap-2 rounded-lg border p-3 has-aria-checked:border-blue-600 has-aria-checked:bg-blue-50 dark:has-aria-checked:border-blue-900 dark:has-aria-checked:bg-blue-950'>
                <Checkbox
                    defaultChecked={checked}
                    onCheckedChange={onCheckedChange}
                    className='data-[state=checked]:border-blue-600 data-[state=checked]:bg-blue-600 data-[state=checked]:text-white dark:data-[state=checked]:border-blue-700 dark:data-[state=checked]:bg-blue-700'
                />
                <div className="w-full">
                    <div className='grid gap-1.5 font-normal'>
                        <p className='text-sm leading-none font-medium'>{label}</p>
                        <p className='text-muted-foreground text-sm'>{description}</p>
                    </div>
                    {children && (
                        <div className="border p-4 rounded-lg mt-4 bg-card">
                            {children}
                        </div>
                    )}
                </div>

            </Label>
        </div>
    )
}
