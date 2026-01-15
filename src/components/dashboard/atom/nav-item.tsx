import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { SidebarMenuButton, SidebarMenuSub, SidebarMenuSubButton, SidebarMenuSubItem, SidebarMenuItem, SidebarMenuAction } from "@/components/ui/sidebar";
import { ChevronRight } from "lucide-react";
import { usePathname, useRouter } from "next/navigation";
import Link from "next/link";
import { NavItemProps } from "@/types";

export function NavItem({
  href,
  label,
  title,
  icon: Icon,
  className,
  children,
  button
}: NavItemProps) {
  const pathname = usePathname();
  const router = useRouter();
  const displayLabel = title || label || "";
  const isActive = pathname === href || children?.some(child => pathname === child.href);

  const handleActionClick = () => {
    if (button?.link) {
      router.push(button.link);
    }
    if (button?.onClick) {
      button.onClick();
    }
  };

  if (children && children.length > 0) {
    return (
      <Collapsible
        asChild
        defaultOpen={isActive}
        className="group/collapsible"
      >
        <SidebarMenuItem>
          <CollapsibleTrigger asChild>
            <SidebarMenuButton tooltip={displayLabel} className={className}>
              <Icon />
              <span>{displayLabel}</span>
              <ChevronRight className="ml-auto transition-transform duration-200 group-data-[state=open]/collapsible:rotate-90" />
            </SidebarMenuButton>
          </CollapsibleTrigger>
          <CollapsibleContent>
            <SidebarMenuSub>
              {children.map((subItem) => (
                <SidebarMenuSubItem key={subItem.title}>
                  <SidebarMenuSubButton asChild isActive={pathname === subItem.href}>
                    <Link href={subItem.href}>
                      {subItem.icon && <subItem.icon />}
                      <span>{subItem.title}</span>
                    </Link>
                  </SidebarMenuSubButton>
                </SidebarMenuSubItem>
              ))}
            </SidebarMenuSub>
          </CollapsibleContent>
        </SidebarMenuItem>
      </Collapsible>
    );
  }

  return (
    <SidebarMenuItem>
      <SidebarMenuButton
        className={className}
        isActive={pathname === href}
        tooltip={displayLabel}
        asChild
      >
        <Link href={href}>
          <Icon />
          <span>{displayLabel}</span>
        </Link>
      </SidebarMenuButton>
      {button && (
        <SidebarMenuAction showOnHover onClick={handleActionClick}>
          <button.icon />
        </SidebarMenuAction>
      )}
    </SidebarMenuItem>
  );
}
