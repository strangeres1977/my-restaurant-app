import { redirect } from "next/navigation";
import { cookies } from "next/headers";
import jwt from "jsonwebtoken";

type TokenPayload = {
  role: string;
};

export default function DashboardEntry() {
  const token = cookies().get("auth-token")?.value;
  if (!token) redirect("/login");

  try {
    const auth = jwt.verify(token, process.env.JWT_SECRET!) as TokenPayload;

    if (auth.role === "SUPER_ADMIN") {
      redirect("/dashboard/admin/restaurants");
    }

    if ((auth.role === "PROJECT_OWNER" || auth.role === "RESTAURANT_OWNER")) {
      redirect("/dashboard/restaurant");
    }

    redirect("/login");
  } catch {
    redirect("/login");
  }
}
