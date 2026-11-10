import Link from "next/link";
import { auth } from "@/auth";
import { signOutUser } from "@/app/auth-actions";
import HeaderNav from "@/components/HeaderNav";

export default async function Header() {
  const session = await auth();
  const account = session?.user?.name || session?.user?.email;

  return (
    <header className="shrink-0 bg-paper/95">
      <div
        className="mx-auto flex h-14 w-full items-center justify-between gap-2 px-3 sm:h-10 sm:gap-4 sm:px-3"
      >
        <div className="flex min-w-0 items-center gap-2 sm:gap-6">
          <HeaderNav />
        </div>

        {account ? (
          <div className="flex shrink-0 items-center gap-2 sm:gap-4">
            <span className="max-w-[9rem] truncate text-sm font-medium text-ink sm:max-w-[16rem]">
              {account}
            </span>
            <form action={signOutUser}>
              <button
                type="submit"
                className="rounded-md border border-ink/15 bg-white px-3 py-2 text-sm font-semibold text-ink shadow-sm transition-colors hover:bg-surface sm:px-4"
              >
                Sign out
              </button>
            </form>
          </div>
        ) : null}
      </div>
    </header>
  );
}
