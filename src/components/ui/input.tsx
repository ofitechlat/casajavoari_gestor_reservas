import * as React from "react"
import { cn } from "@/lib/utils"
import { cva, VariantProps } from "class-variance-authority"
import { Slot } from "@radix-ui/react-slot"

export interface InputProps
    extends React.InputHTMLAttributes<HTMLInputElement> { }

const Input = React.forwardRef<HTMLInputElement, InputProps>(
    ({ className, type, ...props }, ref) => {
        return (
            <input
                type={type}
                className={cn(
                    "flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50",
                    className
                )}
                ref={ref}
                {...props}
            />
        )
    }
)
Input.displayName = "Input"

export { Input }




const inputVariants = cva(
  "flex px-2 w-full rounded-md text-sm transition-all file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none disabled:cursor-not-allowed disabled:opacity-50",
  {
    variants: {
      variant: {
        default:
          "border border-input bg-background shadow-sm focus-visible:ring-1 focus-visible:ring-ring",
        underline:
          "border-b border-input bg-transparent px-0 focus-visible:border-primary rounded-none focus-visible:ring-0 focus-visible:outline-none transition-colors duration-200",
        pill: "rounded-full border border-input bg-background px-6 focus-visible:ring-1 focus-visible:ring-ring",
      },
      inputSize: {
        xs: "h-7 text-xs",
        sm: "h-8 text-sm",
        md: "h-9 text-sm",
        lg: "h-10 text-base",
        xl: "h-11 text-lg",
        "2xl": "h-12 text-xl",
      },
    },
    defaultVariants: {
      variant: "default",
      inputSize: "md",
    },
  },
);

interface IconProps {
  Icon: React.ElementType;
  iconPlacement: "left" | "right";
}

interface IconlessProps {
  Icon?: never;
  iconPlacement?: undefined;
}

export interface InputProps
  extends Omit<React.InputHTMLAttributes<HTMLInputElement>, "size">,
    VariantProps<typeof inputVariants> {
  asChild?: boolean;
}

export type InputIconProps = IconProps | IconlessProps;

function CustomInput({
  className,
  variant,
  inputSize,
  asChild = false,
  type,
  Icon,
  iconPlacement,
  ...props
}: InputProps & InputIconProps) {
  const Comp = asChild ? Slot : "input";

  const inputClassName = cn(
    inputVariants({ variant, inputSize, className }),
    Icon && (iconPlacement === "left" ? "pl-8" : "pr-8"),
  );

  return (
    <div className="relative">
      {Icon && (
        <div
          className={cn(
            "absolute top-1/2 transform -translate-y-1/2 text-muted-foreground pointer-events-none",
            iconPlacement === "left" ? "left-2" : "right-2",
          )}
        >
          <Icon className="w-5 h-5" />
        </div>
      )}
      <Comp
        data-slot="input"
        type={type}
        className={inputClassName}
        {...props}
      />
    </div>
  );
}

export { CustomInput, inputVariants };

