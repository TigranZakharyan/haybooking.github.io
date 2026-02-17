import type { TUser } from "@/types";

export function Avatar({ user }: { user: TUser }) {
  const initials = `${user.firstName?.[0] || ""}${user.lastName?.[0] || ""}`.toUpperCase();

  return (
    <div className="flex flex-col items-center">
      <div className="w-22 h-22 rounded-full border-3 border-primary/50 shadow-lg overflow-hidden flex-shrink-0
                      bg-primary flex items-center justify-center text-white text-xl font-bold">
        {initials}
      </div>

      <div className="text-center mt-2">
        <p className="font-bold mb-0.5">
          {user.firstName} {user.lastName}
        </p>
        <p className="text-sm">{user.email}</p>
      </div>
    </div>
  );
}
