import { LogoutButton } from "@/features/auth/logout/ui";
import { NavList } from "./nav-list";

export function Sidebar({ userEmail }: { userEmail: string | null }) {
  return (
    <aside className="flex flex-col gap-4 border-b border-grey-200 bg-white p-4 md:w-56 md:border-b-0 md:border-r">
      <div className="px-2">
        <p className="text-title-2 font-bold text-grey-900">재고 관리 시스템</p>
        {userEmail && (
          <p className="mt-0.5 truncate text-caption text-grey-500">{userEmail}</p>
        )}
      </div>

      <NavList />

      <div className="mt-auto px-2">
        <LogoutButton />
      </div>
    </aside>
  );
}
