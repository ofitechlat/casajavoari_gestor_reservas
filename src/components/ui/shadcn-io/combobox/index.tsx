'use client';

import { useControllableState } from '@radix-ui/react-use-controllable-state';
import { CheckIcon, ChevronsUpDownIcon, PlusIcon } from 'lucide-react';
import {
  type ComponentProps,
  createContext,
  type ReactNode,
  useContext,
  useEffect,
  useRef,
  useState,
} from 'react';
import { Button } from '@/components/ui/button';
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
  CommandSeparator,
} from '@/components/ui/command';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import { cn } from '@/lib/utils';

type ComboboxData = {
  label: string;
  value: string;
};

type ComboboxContextType = {
  data: ComboboxData[];
  type: string;
  value: string | string[];
  onValueChange: (value: string | string[]) => void;
  multiple: boolean;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  width: number;
  setWidth: (width: number) => void;
  inputValue: string;
  setInputValue: (value: string) => void;
};

const ComboboxContext = createContext<ComboboxContextType>({
  data: [],
  type: 'item',
  value: '',
  onValueChange: () => { },
  multiple: false,
  open: false,
  onOpenChange: () => { },
  width: 200,
  setWidth: () => { },
  inputValue: '',
  setInputValue: () => { },
});

export type ComboboxProps = ComponentProps<typeof Popover> & {
  data: ComboboxData[];
  type: string;
  multiple?: boolean;
  defaultValue?: string | string[];
  value?: string | string[];
  onValueChange?: (value: any) => void;
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
  className?: string;
};

export const Combobox = ({
  data,
  type,
  multiple = false,
  defaultValue,
  value: controlledValue,
  onValueChange: controlledOnValueChange,
  defaultOpen = false,
  open: controlledOpen,
  onOpenChange: controlledOnOpenChange,
  className,
  ...props
}: ComboboxProps) => {
  const [value, onValueChange] = useControllableState({
    defaultProp: defaultValue ?? (multiple ? [] : ''),
    prop: controlledValue,
    onChange: controlledOnValueChange,
  });
  const [open, onOpenChange] = useControllableState({
    defaultProp: defaultOpen,
    prop: controlledOpen,
    onChange: controlledOnOpenChange,
  });
  const [width, setWidth] = useState(200);
  const [inputValue, setInputValue] = useState('');

  return (
    <ComboboxContext.Provider
      value={{
        type,
        value: value as any,
        onValueChange: onValueChange as any,
        multiple,
        open,
        onOpenChange,
        data,
        width,
        setWidth,
        inputValue,
        setInputValue,
      }}
    >
      <Popover {...(props as any)} onOpenChange={onOpenChange} open={open} />
    </ComboboxContext.Provider>
  );
};

export type ComboboxTriggerProps = ComponentProps<typeof Button>;

export const ComboboxTrigger = ({
  children,
  ...props
}: ComboboxTriggerProps) => {
  const { value, data, type, setWidth, multiple } = useContext(ComboboxContext);
  const ref = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    // Create a ResizeObserver to detect width changes
    const resizeObserver = new ResizeObserver((entries) => {
      for (const entry of entries) {
        const newWidth = (entry.target as HTMLElement).offsetWidth;
        if (newWidth) {
          setWidth?.(newWidth);
        }
      }
    });

    if (ref.current) {
      resizeObserver.observe(ref.current);
    }

    // Clean up the observer when component unmounts
    return () => {
      resizeObserver.disconnect();
    };
  }, [setWidth]);

  return (
    <PopoverTrigger asChild>
      <Button variant="outline" {...(props as any)} ref={ref}>
        {children ?? (
          <span className="flex w-full items-center justify-between gap-2">
            <span className="truncate">
              {multiple && Array.isArray(value) && value.length > 0
                ? `${value.length} ${type}${value.length > 1 ? 's' : ''} selected`
                : !multiple && value && !Array.isArray(value)
                  ? data.find((item) => item.value === value)?.label
                  : `Select ${type}...`}
            </span>
            <ChevronsUpDownIcon
              className="ml-auto shrink-0 text-muted-foreground"
              size={16}
            />
          </span>
        )}
      </Button>
    </PopoverTrigger>
  );
};

export type ComboboxContentProps = ComponentProps<typeof Command> & {
  popoverOptions?: ComponentProps<typeof PopoverContent>;
};

export const ComboboxContent = ({
  className,
  popoverOptions,
  ...props
}: ComboboxContentProps) => {
  const { width } = useContext(ComboboxContext);

  return (
    <PopoverContent
      className={cn('p-0', className)}
      style={{ width }}
      {...popoverOptions}
    >
      <Command {...(props as any)} />
    </PopoverContent>
  );
};

export type ComboboxInputProps = ComponentProps<typeof CommandInput> & {
  value?: string;
  defaultValue?: string;
  onValueChange?: (value: string) => void;
};

export const ComboboxInput = ({
  value: controlledValue,
  defaultValue,
  onValueChange: controlledOnValueChange,
  ...props
}: ComboboxInputProps) => {
  const { type, inputValue, setInputValue } = useContext(ComboboxContext);

  const [value, onValueChange] = useControllableState({
    defaultProp: defaultValue ?? inputValue,
    prop: controlledValue,
    onChange: (newValue) => {
      // Sync with context state
      setInputValue(newValue);
      // Call external onChange if provided
      controlledOnValueChange?.(newValue);
    },
  });

  return (
    <CommandInput
      onValueChange={onValueChange}
      placeholder={`Search ${type}...`}
      value={value}
      {...(props as any)}
    />
  );
};

export type ComboboxListProps = ComponentProps<typeof CommandList>;

export const ComboboxList = (props: ComboboxListProps) => (
  <CommandList {...(props as any)} />
);

export type ComboboxEmptyProps = ComponentProps<typeof CommandEmpty>;

export const ComboboxEmpty = ({ children, ...props }: ComboboxEmptyProps) => {
  const { type } = useContext(ComboboxContext);

  return (
    <CommandEmpty {...(props as any)}>{children ?? `No ${type} found.`}</CommandEmpty>
  );
};

export type ComboboxGroupProps = ComponentProps<typeof CommandGroup>;

export const ComboboxGroup = (props: ComboboxGroupProps) => (
  <CommandGroup {...(props as any)} />
);

export type ComboboxItemProps = ComponentProps<typeof CommandItem>;

export const ComboboxItem = ({ onSelect, ...props }: ComboboxItemProps) => {
  const { onValueChange, onOpenChange, multiple, value } = useContext(ComboboxContext);

  const isSelected = multiple
    ? Array.isArray(value) && value.includes(props.value as string)
    : value === props.value;

  return (
    <CommandItem
      onSelect={(currentValue) => {
        if (multiple) {
          const currentArray = Array.isArray(value) ? value : [];
          const newValue = currentArray.includes(currentValue)
            ? currentArray.filter((v) => v !== currentValue)
            : [...currentArray, currentValue];
          onValueChange(newValue);
        } else {
          onValueChange(currentValue);
          onOpenChange(false);
        }
        onSelect?.(currentValue);
      }}
      {...(props as any)}
    >
      <CheckIcon
        className={cn(
          "mr-2 h-4 w-4",
          isSelected ? "opacity-100" : "opacity-0"
        )}
      />
      {props.children}
    </CommandItem>
  );
};

export type ComboboxSeparatorProps = ComponentProps<typeof CommandSeparator>;

export const ComboboxSeparator = (props: ComboboxSeparatorProps) => (
  <CommandSeparator {...(props as any)} />
);

export type ComboboxCreateNewProps = {
  onCreateNew: (value: string) => void;
  children?: (inputValue: string) => ReactNode;
  className?: string;
};

export const ComboboxCreateNew = ({
  onCreateNew,
  children,
  className,
}: ComboboxCreateNewProps) => {
  const { inputValue, type, onValueChange, onOpenChange } =
    useContext(ComboboxContext);

  if (!inputValue.trim()) {
    return null;
  }

  const handleCreateNew = () => {
    onCreateNew(inputValue.trim());
    onValueChange(inputValue.trim());
    onOpenChange(false);
  };

  return (
    <button
      className={cn(
        'relative flex w-full cursor-pointer select-none items-center gap-2 rounded-sm px-2 py-1.5 text-sm outline-none aria-selected:bg-accent aria-selected:text-accent-foreground data-[disabled]:pointer-events-none data-[disabled]:opacity-50',
        className
      )}
      onClick={handleCreateNew}
      type="button"
    >
      {children ? (
        children(inputValue)
      ) : (
        <>
          <PlusIcon className="h-4 w-4 text-muted-foreground" />
          <span>
            Create new {type}: "{inputValue}"
          </span>
        </>
      )}
    </button>
  );
};
