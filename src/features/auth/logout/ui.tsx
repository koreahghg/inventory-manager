import { logout } from "./actions";

export function LogoutButton() {
  return (
    <form action={logout}>
      <button
        type="submit"
        className="w-full rounded-m border border-grey-200 px-3 py-2 text-left text-body-2 text-grey-600 hover:bg-grey-100"
      >
        로그아웃
      </button>
    </form>
  );
}
