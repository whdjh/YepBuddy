import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarMenu,
} from "@/components/ui/sidebar";
import { MessageCard } from "@/components/common/Card/MessageCard";

export default function SideBar() {
  return (
    <Sidebar variant="floating">
      <SidebarContent className="overflow-y-auto">
        <SidebarGroup>
          <SidebarMenu>
            {Array.from({ length: 20 }).map((_, index) => (
              <MessageCard
                key={index}
                id={index.toString()}
                name={`이주훈`}
                lastMessage={`최근 메세지 ${index}`}
                avatarUrl={`https://github.com/gym.png`}
              />
            ))}
          </SidebarMenu>
        </SidebarGroup>
      </SidebarContent>
    </Sidebar>
  );
}