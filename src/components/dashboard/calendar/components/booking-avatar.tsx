import { cn } from "@/lib/utils";
import { useUsers } from "@/hooks/queries/useBookings";
import { useContacts } from "@/hooks/queries";
import { Avatar, AvatarFallback, AvatarGroup } from "@/components/ui/avatar";
import { BookingUserAvatarProps } from "../types";

export function BookingUserAvatar({ userId, contactId, responsible, responsibleContactIds, name, showName = true, className }: BookingUserAvatarProps) {
  const { data: userMap } = useUsers();
  const { data: contacts = [] } = useContacts();

  let displayNames: string[] = [];

  // 1. Resolve names from explicit props
  if (userId && userMap?.[userId]) {
    displayNames.push(userMap[userId].name);
  }
  if (contactId) {
    const contact = contacts.find(c => c.id === contactId);
    if (contact) displayNames.push(contact.name);
  }

  // 2. Resolve names from responsible array (legacy)
  if (responsible && Array.isArray(responsible)) {
    responsible.forEach(id => {
      // Check if it's a contact
      const contact = contacts.find(c => c.id === id);
      if (contact) {
        displayNames.push(contact.name);
      } else if (userMap?.[id]) {
        // Check if it's a user
        displayNames.push(userMap[id].name);
      } else {
        // If it's just a string name
        displayNames.push(id);
      }
    });
  }

  // 2b. Resolve names from responsibleContactIds array (new)
  if (responsibleContactIds && Array.isArray(responsibleContactIds)) {
    responsibleContactIds.forEach(id => {
      const contact = contacts.find(c => c.id === id);
      if (contact) displayNames.push(contact.name);
    });
  }

  // 3. Fallback to manual names
  if (name) {
    if (Array.isArray(name)) displayNames.push(...name);
    else displayNames.push(name);
  }

  // Unique names and filter empty
  displayNames = Array.from(new Set(displayNames.filter(Boolean)));

  if (displayNames.length === 0) displayNames = ["Desconocido"];

  const getInitials = (fullName: string) => {
    return fullName.split(' ').filter(Boolean).map(n => n[0]).join('').slice(0, 2).toUpperCase() || "??";
  };

  const fullName = showName ? displayNames.join(', ') : displayNames[0];

  // Single avatar case
  if (displayNames.length === 1) {
    const initials = getInitials(displayNames[0]);
    const isUser = userId || (responsible && responsible.length > 0 && userMap?.[responsible[0]]);

    return (
      <div className={cn("inline-flex items-center gap-2", className)} title={displayNames[0]}>
        <Avatar className="size-6 text-[10px]  shrink-0 bg-background">
          <AvatarFallback className={cn("font-bold text-primary", isUser ? "bg-primary/5" : "bg-orange-500/10")}>
            {initials}
          </AvatarFallback>
        </Avatar>
        {showName && <span className="truncate text-xs font-medium max-w-[120px]">{fullName}</span>}
      </div>
    );
  }

  // Multiple avatars case - use AvatarGroup
  return (
    <div className={cn("inline-flex items-center mr-6 gap-2 ", className)} title={displayNames.join(', ')}>
      <div className="_*:data-[slot=avatar]:ring- flex -space-x-2 _*:data-[slot=avatar]:ring-2 *:data-[slot=avatar]:grayscale">
        {displayNames.slice(0, 3).map((displayName, index) => {
          const initials = getInitials(displayName);
          const isUser = responsible && userMap?.[responsible[index]];

          return (
            <Avatar key={index} className="size-6 text-[10px] border shrink-0 bg-background">
              <AvatarFallback className={cn("font-bold text-primary", isUser ? "bg-primary/5" : "bg-orange-500/10")}>
                {initials}
              </AvatarFallback>
            </Avatar>
          );
        })}
        {displayNames.length > 3 && (
          <Avatar className="size-6 text-[10px] border shrink-0 bg-background">
            <AvatarFallback className="font-bold text-primary bg-muted">
              +{displayNames.length - 3}
            </AvatarFallback>
          </Avatar>
        )}
      </div>
      {showName && <span className="truncate text-xs font-medium max-w-[120px]">{fullName}</span>}
    </div>
  );
}
