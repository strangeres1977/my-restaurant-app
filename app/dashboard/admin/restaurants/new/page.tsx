import NewRestaurantForm from "./NewRestaurantForm";
import { Container } from "@/components/ui/container";

export default function NewRestaurantPage() {
  return (
    <Container className="py-8">
      <div className="mx-auto max-w-2xl">
        <NewRestaurantForm />
      </div>
    </Container>
  );
}
