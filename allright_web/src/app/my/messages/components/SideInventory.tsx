import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarMenu,
} from "@/components/ui/sidebar";
import { MessageCard } from "@/app/my/messages/components/MessageCard";

export default function SideInventory() {
  return (
    <Sidebar variant="floating">
      <SidebarContent className="overflow-y-auto">
        <SidebarGroup>
          <SidebarMenu>
            {Array.from({ length: 20 }).map((_, index) => (
              <MessageCard
                key={index}
                id={index.toString()}
                name={`사용자명`}
                lastMessage={`최근 메세지 ${index}`}
                avatarFile={`https://github.com/gym.png`}
              />
            ))}
          </SidebarMenu>
        </SidebarGroup>
      </SidebarContent>
    </Sidebar>
  );
}