import prisma from "@/lib/prisma";
import { Container } from "@/components/ui/container";
import { redirect, notFound } from "next/navigation";
import { cookies } from "next/headers";
import jwt from "jsonwebtoken";
import EditRestaurantForm from "./EditRestaurantForm";

export default async function AdminRestaurantEditPage({ params }: { params: { id: string } }) {
  const token = cookies().get("auth-token")?.value;
  if (!token) redirect("/dashboard");

  let payload: any;
  try {
    payload = jwt.verify(token, process.env.JWT_SECRET!);
  } catch {
    redirect("/dashboard");
  }

  if (payload.role !== "SUPER_ADMIN") redirect("/dashboard");

  const restaurant = await prisma.restaurant.findUnique({
    where: { id: params.id },
    select: {
      id: true,
      name: true,
      slug: true,
      description: true,
      themeColor: true,
      bannerUrl: true,
      logoUrl: true,
      contactEmail: true,
    },
  });

  if (!restaurant) notFound();

  return (
    <Container className="py-8">
      <div className="mx-auto max-w-2xl">
        <EditRestaurantForm restaurant={restaurant} />
      </div>
    </Container>
  );
}
