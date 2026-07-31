import { auth } from "@/auth";
import { redirect } from "next/navigation";
import Navbar from "@/components/Navbar";
import ProfileForm from "@/components/ProfileForm";

export default async function ProfilePage() {
  const session = await auth();
  if (!session?.user) {
    redirect("/login");
  }

  return (
    <div className="min-h-screen bg-[#0b0b12] text-[#e8e6f0]">
      <Navbar />
      <main className="max-w-md mx-auto px-6 pt-24 pb-16">
        <h1 className="text-xl font-bold mb-1">โปรไฟล์ของฉัน</h1>
        <p className="text-sm text-[#8a87a3] mb-6">แก้ไขชื่อและรหัสผ่านของคุณ</p>

        <ProfileForm
          currentName={session.user.name || ""}
          email={session.user.email || ""}
        />
      </main>
    </div>
  );
}
