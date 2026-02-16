import { mutation } from "./_generated/server";
import { requireOrgAdmin } from "./users";

export const seedDatabase = mutation({
  args: {},
  handler: async (ctx) => {
    await requireOrgAdmin(ctx);
    // Create fake users with new role system
    const users = [
      {
        externalId: "user_1",
        name: "John Smith",
        email: "john.smith@example.com",
        role: "user" as const,
      },
      {
        externalId: "user_2",
        name: "Sarah Johnson",
        email: "sarah.johnson@example.com",
        role: "user" as const,
      },
      {
        externalId: "user_3",
        name: "Mike Davis",
        email: "mike.davis@example.com",
        role: "user" as const,
      },
      {
        externalId: "user_4",
        name: "Emily Brown",
        email: "emily.brown@example.com",
        role: "user" as const,
      },
      {
        externalId: "user_5",
        name: "David Wilson",
        email: "david.wilson@example.com",
        role: "user" as const,
      },
      {
        externalId: "admin_1",
        name: "Admin User",
        email: "admin@gearboxe.com",
        role: "admin" as const,
      },
      {
        externalId: "superadmin_1",
        name: "Super Admin",
        email: "superadmin@gearboxe.com",
        role: "superAdmin" as const,
      },
    ];

    const userIds = [];
    for (const user of users) {
      const userId = await ctx.db.insert("users", {
        ...user,
        createdAt: Date.now(),
      });
      userIds.push(userId);
    }

    // Create fake events first (vehicles require eventId)
    const events = [
      {
        clerkOrgId: "org_seed_sf",
        name: "San Francisco Classic Car Show",
        date: Date.now() + 30 * 24 * 60 * 60 * 1000, // 30 days from now
        location: "Golden Gate Park",
        address: "Golden Gate Park, San Francisco, CA 94117",
        capacity: 200,
        vendorPrice: 50,
        description:
          "Join us for our monthly classic car show featuring vintage and modern performance vehicles. Food trucks, live music, and automotive vendors.",
        createdAt: Date.now(),
      },
      {
        clerkOrgId: "org_seed_la",
        name: "LA Supercar Sunday",
        date: Date.now() + 45 * 24 * 60 * 60 * 1000, // 45 days from now
        location: "Santa Monica Pier",
        address: "200 Santa Monica Pier, Santa Monica, CA 90401",
        capacity: 150,
        vendorPrice: 75,
        description:
          "Exclusive supercar showcase featuring the latest exotic vehicles. Meet fellow enthusiasts and see rare automotive masterpieces.",
        createdAt: Date.now(),
      },
      {
        clerkOrgId: "org_seed_seattle",
        name: "Pacific Northwest Car Meet",
        date: Date.now() + 60 * 24 * 60 * 60 * 1000, // 60 days from now
        location: "Seattle Center",
        address: "305 Harrison St, Seattle, WA 98109",
        capacity: 300,
        vendorPrice: 40,
        description:
          "The largest car meet in the Pacific Northwest. Featuring everything from classic muscle cars to modern electric vehicles.",
        createdAt: Date.now(),
      },
    ];

    const eventIds = [];
    for (const event of events) {
      const eventId = await ctx.db.insert("events", {
        ...event,
        createdAt: Date.now(),
      });
      eventIds.push(eventId);
    }

    // Create fake vehicles (now with eventId)
    const vehicles = [
      {
        userId: userIds[0], // John Smith
        eventId: eventIds[0], // San Francisco event
        title: "2019 BMW M3 Competition Package",
        make: "BMW",
        model: "M3",
        year: 2019,
        mileage: 25_000,
        price: 65_000,
        vin: "WBS8M9C50JA123456",
        photos: [],
        description:
          "Immaculate BMW M3 with Competition Package. Single owner, garage kept, all service records available. Perfect condition with no accidents. Includes extended warranty.",
        contactInfo: "john.smith@example.com",
        status: "approved" as const,
      },
      {
        userId: userIds[1], // Sarah Johnson
        eventId: eventIds[0], // San Francisco event
        title: "2020 Tesla Model S Performance",
        make: "Tesla",
        model: "Model S",
        year: 2020,
        mileage: 18_000,
        price: 85_000,
        vin: "5YJSA1E28LF123456",
        photos: [],
        description:
          'Tesla Model S Performance with Ludicrous Mode. FSD capability, premium interior, 21" wheels. Always charged at home, excellent battery health.',
        contactInfo: "sarah.johnson@example.com",
        status: "approved" as const,
      },
      {
        userId: userIds[0], // John Smith
        eventId: eventIds[1], // LA event
        title: "2018 Porsche 911 Carrera S",
        make: "Porsche",
        model: "911",
        year: 2018,
        mileage: 32_000,
        price: 95_000,
        vin: "WP0AB2A99JS123456",
        photos: [],
        description:
          "Iconic Porsche 911 Carrera S. Sport Chrono package, premium audio, leather interior. Well maintained with Porsche service history.",
        contactInfo: "john.smith@example.com",
        status: "approved" as const,
      },
      {
        userId: userIds[2], // Mike Davis
        eventId: eventIds[1], // LA event
        title: "2021 Ford Mustang GT Premium",
        make: "Ford",
        model: "Mustang",
        year: 2021,
        mileage: 15_000,
        price: 45_000,
        vin: "1FA6P8TH2M5123456",
        photos: [],
        description:
          "Ford Mustang GT Premium with 10-speed automatic. Recaro seats, MagneRide suspension, premium sound system. Like new condition.",
        contactInfo: "mike.davis@example.com",
        status: "approved" as const,
      },
      {
        userId: userIds[1], // Sarah Johnson
        eventId: eventIds[2], // Seattle event
        title: "2017 Audi RS6 Avant",
        make: "Audi",
        model: "RS6",
        year: 2017,
        mileage: 45_000,
        price: 75_000,
        vin: "WAUZZZ4G8HN123456",
        photos: [],
        description:
          "Rare Audi RS6 Avant wagon. Twin-turbo V8, Quattro AWD, sport exhaust. Perfect family car with incredible performance.",
        contactInfo: "sarah.johnson@example.com",
        status: "approved" as const,
      },
      {
        userId: userIds[2], // Mike Davis
        eventId: eventIds[2], // Seattle event
        title: "2019 Mercedes-AMG C63 S",
        make: "Mercedes-Benz",
        model: "C63 AMG",
        year: 2019,
        mileage: 28_000,
        price: 68_000,
        vin: "WDD2050491A123456",
        photos: [],
        description:
          "Mercedes-AMG C63 S with AMG Performance Package. Handcrafted V8, AMG exhaust, carbon fiber trim. One owner, full service history.",
        contactInfo: "mike.davis@example.com",
        status: "approved" as const,
      },
      {
        userId: userIds[0], // John Smith
        eventId: eventIds[1], // LA event
        title: "2020 Lamborghini Huracán EVO",
        make: "Lamborghini",
        model: "Huracán",
        year: 2020,
        mileage: 5000,
        price: 220_000,
        vin: "ZHWGU4ZF6LLA12345",
        photos: [
          "https://images.unsplash.com/photo-1544636331-e26879cd4d9b?w=800&h=600&fit=crop",
          "https://images.unsplash.com/photo-1555215695-3004980ad54e?w=800&h=600&fit=crop",
        ],
        description:
          "Lamborghini Huracán EVO with Ad Personam customization. Carbon fiber package, sport exhaust, ceramic brakes. Museum quality condition.",
        contactInfo: "john.smith@example.com",
        status: "approved" as const,
      },
      {
        userId: userIds[1], // Sarah Johnson
        eventId: eventIds[0], // San Francisco event
        title: "2016 McLaren 570S",
        make: "McLaren",
        model: "570S",
        year: 2016,
        mileage: 12_000,
        price: 180_000,
        vin: "SBM12ABG6GW123456",
        photos: [
          "https://images.unsplash.com/photo-1544636331-e26879cd4d9b?w=800&h=600&fit=crop",
          "https://images.unsplash.com/photo-1555215695-3004980ad54e?w=800&h=600&fit=crop",
        ],
        description:
          "McLaren 570S Spider with carbon fiber package. Track-focused supercar with incredible performance. Well maintained by McLaren specialists.",
        contactInfo: "sarah.johnson@example.com",
        status: "approved" as const,
      },
    ];

    const vehicleIds = [];
    for (const vehicle of vehicles) {
      const vehicleId = await ctx.db.insert("vehicles", {
        ...vehicle,
        createdAt: Date.now(),
      });
      vehicleIds.push(vehicleId);
    }

    // Create some fake registrations
    const registrations = [
      {
        eventId: eventIds[0], // San Francisco event
        vehicleId: vehicleIds[0], // BMW M3
        userId: userIds[0], // John Smith
        paymentStatus: "completed" as const,
        stripePaymentId: "pi_1234567890",
        qrCodeData: "QR_CODE_DATA_1",
        checkedIn: false,
        createdAt: Date.now(),
      },
      {
        eventId: eventIds[0], // San Francisco event
        vehicleId: vehicleIds[1], // Tesla Model S
        userId: userIds[1], // Sarah Johnson
        paymentStatus: "completed" as const,
        stripePaymentId: "pi_1234567891",
        qrCodeData: "QR_CODE_DATA_2",
        checkedIn: false,
        createdAt: Date.now(),
      },
      {
        eventId: eventIds[1], // LA event
        vehicleId: vehicleIds[2], // Porsche 911
        userId: userIds[0], // John Smith
        paymentStatus: "completed" as const,
        stripePaymentId: "pi_1234567892",
        qrCodeData: "QR_CODE_DATA_3",
        checkedIn: false,
        createdAt: Date.now(),
      },
    ];

    for (const registration of registrations) {
      await ctx.db.insert("registrations", registration);
    }

    // Create conversations and messages
    const conversation1 = await ctx.db.insert("conversations", {
      vehicleId: vehicleIds[0], // BMW M3
      participant1Id: userIds[0], // John Smith (seller)
      participant2Id: userIds[3], // Emily Brown (buyer)
      lastMessageAt: Date.now() - 1 * 60 * 60 * 1000, // 1 hour ago
      createdAt: Date.now() - 2 * 60 * 60 * 1000, // 2 hours ago
    });

    const conversation2 = await ctx.db.insert("conversations", {
      vehicleId: vehicleIds[1], // Tesla Model S
      participant1Id: userIds[1], // Sarah Johnson (seller)
      participant2Id: userIds[4], // David Wilson (buyer)
      lastMessageAt: Date.now() - 30 * 60 * 1000, // 30 minutes ago
      createdAt: Date.now() - 30 * 60 * 1000, // 30 minutes ago
    });

    const messages = [
      {
        conversationId: conversation1,
        senderId: userIds[3], // Emily Brown (buyer)
        recipientId: userIds[0], // John Smith (seller)
        content: "Hi! I'm interested in your BMW M3. Is it still available?",
        read: false,
        createdAt: Date.now() - 2 * 60 * 60 * 1000, // 2 hours ago
      },
      {
        conversationId: conversation1,
        senderId: userIds[0], // John Smith (seller)
        recipientId: userIds[3], // Emily Brown (buyer)
        content:
          "Yes, it's still available! Would you like to schedule a viewing?",
        read: false,
        createdAt: Date.now() - 1 * 60 * 60 * 1000, // 1 hour ago
      },
      {
        conversationId: conversation2,
        senderId: userIds[4], // David Wilson (buyer)
        recipientId: userIds[1], // Sarah Johnson (seller)
        content: "Beautiful Tesla! What's the current battery health?",
        read: false,
        createdAt: Date.now() - 30 * 60 * 1000, // 30 minutes ago
      },
    ];

    for (const message of messages) {
      await ctx.db.insert("messages", message);
    }

    // Create some fake favorites
    const favorites = [
      {
        userId: userIds[3], // Emily Brown
        vehicleId: vehicleIds[0], // BMW M3
        createdAt: Date.now() - 24 * 60 * 60 * 1000, // 1 day ago
      },
      {
        userId: userIds[3], // Emily Brown
        vehicleId: vehicleIds[2], // Porsche 911
        createdAt: Date.now() - 12 * 60 * 60 * 1000, // 12 hours ago
      },
      {
        userId: userIds[4], // David Wilson
        vehicleId: vehicleIds[1], // Tesla Model S
        createdAt: Date.now() - 6 * 60 * 60 * 1000, // 6 hours ago
      },
    ];

    for (const favorite of favorites) {
      await ctx.db.insert("favorites", favorite);
    }

    return {
      users: userIds.length,
      vehicles: vehicleIds.length,
      events: eventIds.length,
      registrations: registrations.length,
      messages: messages.length,
      favorites: favorites.length,
    };
  },
});
