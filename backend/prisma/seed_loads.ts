import { PrismaClient } from '@prisma/client';
import { v4 as uuidv4 } from 'uuid';

const prisma = new PrismaClient();

async function main() {
  const loads = [
    {
      id: uuidv4(),
      origin_location: 'Dallas, TX',
      destination_location: 'Houston, TX',
      payload_description: 'Electronics, 10 pallets',
      payout_amount: 1200.00,
      status: 'available',
      booked_by_driver_id: null,
      booked_at: null,
      created_at: new Date().toISOString(),
    },
    {
      id: uuidv4(),
      origin_location: 'Austin, TX',
      destination_location: 'San Antonio, TX',
      payload_description: 'Furniture, 5 pallets',
      payout_amount: 800.00,
      status: 'available',
      booked_by_driver_id: null,
      booked_at: null,
      created_at: new Date().toISOString(),
    },
    {
      id: uuidv4(),
      origin_location: 'Oklahoma City, OK',
      destination_location: 'Tulsa, OK',
      payload_description: 'Groceries, 8 pallets',
      payout_amount: 950.00,
      status: 'available',
      booked_by_driver_id: null,
      booked_at: null,
      created_at: new Date().toISOString(),
    },
  ];

  for (const load of loads) {
    await prisma.load.create({ data: load });
  }

  console.log('Seeded loads successfully!');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
