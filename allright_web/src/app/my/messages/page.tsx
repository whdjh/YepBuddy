import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarMenu,
  SidebarProvider,
} from "@/components/ui/sidebar";
import { MessageCard } from "@/components/common/Card/MessageCard";
import { MessageCircleIcon } from "lucide-react";

export default function Message() {
  return (
    <div className="h-[calc(100vh-14rem)] overflow-hidden">
      <SidebarProvider className="flex h-full">
        <Sidebar className="" variant="floating">
          <SidebarContent className="overflow-y-auto">
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
        <div className="flex flex-col gap-5 items-center justify-center flex-1">
          <MessageCircleIcon className="size-12 text-muted-foreground" />
          <h1 className="text-xl text-muted-foreground font-semibold">
            Click on a message in the sidebar to view it.
          </h1>
        </div>
      </SidebarProvider>
    </div>
  );
}