import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarMenu,
  SidebarProvider,
} from "@/components/ui/sidebar";
import { MessageCard } from "@/components/common/Card/MessageCard";

export default function Message() {
  return (
    <div className="">
      <SidebarProvider className="flex max-h-[calc(100vh-14rem)] overflow-hidden h-[calc(100vh-14rem)] min-h-full">
        <Sidebar className="pt-16" variant="floating">
          <SidebarContent>
            <SidebarGroup>
              <SidebarMenu>
                {Array.from({ length: 20 }).map((_, index) => (
                  <MessageCard
                    key={index}
                    id={index.toString()}
                    name={`User ${index}`}
                    lastMessage={`Last message ${index}`}
                    avatarUrl={`https://github.com/serranoarevalo.png`}
                  />
                ))}
              </SidebarMenu>
            </SidebarGroup>
          </SidebarContent>
        </Sidebar>
      </SidebarProvider>
    </div>
  );
}