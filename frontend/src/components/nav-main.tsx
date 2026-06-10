import {
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarMenuSub,
  SidebarMenuSubButton,
  SidebarMenuSubItem,
} from "@/components/ui/sidebar"
import { NavLink, useLocation } from "react-router"

export function NavMain({
  groups,
}: {
  groups: {
    title: string
    items: {
      title: string
      url: string
      icon?: React.ReactNode
      items?: {
        title: string
        url: string
      }[]
    }[]
  }[]
}) {
  const location = useLocation()

  return (
    <>
      {groups.map((group) => (
        <SidebarGroup key={group.title}>
          <SidebarGroupLabel>{group.title}</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {group.items.map((item) => (
                <SidebarMenuItem key={item.title}>
                  {(() => {
                    const isSubItemActive = item.items?.some((subItem) => {
                      return location.pathname === subItem.url
                    })
                    const shouldShowSubItems = Boolean(
                      item.items && isSubItemActive
                    )

                    return (
                      <>
                        <NavLink to={item.url} end={Boolean(item.items)}>
                          {({ isActive }) => (
                            <SidebarMenuButton
                              isActive={item.items ? false : isActive}
                              tooltip={item.title}
                            >
                              {item.icon}
                              <span>{item.title}</span>
                            </SidebarMenuButton>
                          )}
                        </NavLink>
                        {shouldShowSubItems && (
                          <SidebarMenuSub>
                            {item.items?.map((subItem) => (
                              <SidebarMenuSubItem key={subItem.title}>
                                <NavLink to={subItem.url} end>
                                  {({ isActive }) => (
                                    <SidebarMenuSubButton isActive={isActive}>
                                      <span>{subItem.title}</span>
                                    </SidebarMenuSubButton>
                                  )}
                                </NavLink>
                              </SidebarMenuSubItem>
                            ))}
                          </SidebarMenuSub>
                        )}
                      </>
                    )
                  })()}
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      ))}
    </>
  )
}
