import Link from "next/link";
import { auth } from "@/auth";
import { signOutUser, signUpWithGoogle } from "@/app/auth-actions";
import HeaderNav from "@/components/HeaderNav";

export default async function Header({ wide = false }: { wide?: boolean }) {
  const session = await auth();
  const account = session?.user?.name || session?.user?.email;

  return (
    <header className="shrink-0 border-b border-ink/10 bg-paper/95">
      <div
        className={`mx-auto flex h-14 items-center justify-between gap-2 px-3 sm:h-16 sm:gap-4 sm:px-6 ${
          wide ? "max-w-none" : "max-w-6xl"
        }`}
      >
        <div className="flex min-w-0 items-center gap-2 sm:gap-6">
          <Link href="/" className="flex items-center gap-2.5">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-plum text-ink-invert shadow-sm">
              <svg
                width="24"
                height="24"
                viewBox="0 0 24 24"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
                aria-hidden="true"
              >
                <path
                  d="M6.5 5.5H17.5C18.3284 5.5 19 6.17157 19 7V16.5C19 17.3284 18.3284 18 17.5 18H6.5C5.67157 18 5 17.3284 5 16.5V7C5 6.17157 5.67157 5.5 6.5 5.5Z"
                  fill="currentColor"
                />
                <path
                  d="M8 3.5H18C19.3807 3.5 20.5 4.61929 20.5 6V15"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                />
                <path
                  d="M8 9H16"
                  stroke="white"
                  strokeWidth="1.7"
                  strokeLinecap="round"
                />
                <path
                  d="M8 13H13"
                  stroke="white"
                  strokeWidth="1.7"
                  strokeLinecap="round"
                />
              </svg>
            </div>
            <span className="hidden font-display text-lg font-semibold tracking-tight sm:inline">
              Note-Stack
            </span>
          </Link>

          <HeaderNav />
        </div>

        <div className="flex shrink-0 items-center gap-2 sm:gap-4">
          {account ? (
            <>
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
            </>
          ) : (
            <form action={signUpWithGoogle}>
              <button
                type="submit"
                className="rounded-md bg-plum px-3 py-2 text-sm font-semibold text-ink-invert shadow transition-colors hover:bg-plum/80 sm:px-4"
              >
                <span className="sm:hidden">Google</span>
                <span className="hidden sm:inline">Sign up with Google</span>
              </button>
            </form>
          )}
        </div>
      </div>
    </header>
  );
}
