import { auth } from "@/auth";
import { redirect } from "next/navigation";
import Navbar from "@/components/Navbar";
import ProfileForm from "@/components/ProfileForm";
import prisma from "@/lib/prisma";

export default async function ProfilePage() {
  const session = await auth();

  if (!session?.user) {
    redirect("/login");
  }

  const user = await prisma.user.findUnique({
    where: {
      id: session.user.id,
    },
  });

  if (!user) {
    redirect("/login");
  }

  return (
    <div className="min-h-screen bg-[#080914] text-[#e8e6f0]">
      <Navbar />

      <main className="mx-auto max-w-5xl px-6 pt-24 pb-16">
        <ProfileForm
          currentName={user.name}
          email={user.email}
          avatar={user.avatar}
          bio={user.bio}
        />
      </main>
    </div>
  );
}