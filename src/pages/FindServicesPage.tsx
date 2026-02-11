import { Button, Container, Input, Select, ServiceCard } from "@/components";

const servicesMock = [
  {
    image: "https://images.unsplash.com/photo-1581091215364-6b9d3f0b64c8?auto=format&fit=crop&w=800&q=80",
    title: "Luxury Spa Center",
    badge: "Popular",
    address: "123 Main Street, Yerevan",
    specialists: 12,
    services: 25,
    priceFrom: 5000,
    currency: "dram",
    buttonText: "Book Now",
    onButtonClick: () => alert("Booking Luxury Spa Center!"),
  },
  {
    image: "https://images.unsplash.com/photo-1573164574392-0f898f41c5d1?auto=format&fit=crop&w=800&q=80",
    title: "Elite Hair Salon",
    badge: "New",
    address: "45 Northern Avenue, Yerevan",
    specialists: 8,
    services: 15,
    priceFrom: 3000,
    currency: "dram",
    buttonText: "Book Appointment",
    onButtonClick: () => alert("Booking Elite Hair Salon!"),
  },
  {
    image: "https://images.unsplash.com/photo-1556228720-6b8f1f1b9c69?auto=format&fit=crop&w=800&q=80",
    title: "Fitness & Wellness Studio",
    address: "78 Liberty Square, Yerevan",
    specialists: 10,
    services: 18,
    priceFrom: 4000,
    currency: "dram",
    onButtonClick: () => alert("Booking Fitness & Wellness Studio!"),
  },
];


export function FindServicesPage() {
    return (
        <Container>
            <h2 className="uppercase my-8">Find & book services</h2>
            <div className="grid grid-cols-[repeat(4,minmax(150px,220px))] gap-6">
                <Input variant="primary" placeholder="Search..." />
                <Select variant="primary" options={[]} placeholder="Select option" />
                <Select variant="primary" options={[]} placeholder="All" />
                <Button className="bg-primary text-white font-bold hover:bg-primary/95 shadow-xl">Search</Button>
            </div>
            <div className="flex gap-12 mt-12">
                {
                    // change key to _id
                    servicesMock.map((e, index) => <ServiceCard key={index} {...e} />)
                }
            </div>
        </Container>
    )
}