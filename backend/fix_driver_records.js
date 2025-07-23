const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function fixDriverRecords() {
  try {
    console.log('Starting driver records fix...');
    
    // Find all users with role 'driver' who don't have a Driver record
    const driverUsers = await prisma.user.findMany({
      where: { 
        role: 'driver',
        drivers: {
          none: {}
        }
      }
    });
    
    console.log(`Found ${driverUsers.length} driver users without Driver records`);
    
    // Create Driver records for these users
    for (const user of driverUsers) {
      await prisma.driver.create({
        data: { id: user.id }
      });
      console.log(`Created Driver record for user: ${user.email} (${user.id})`);
    }
    
    console.log('Driver records fix completed successfully!');
  } catch (error) {
    console.error('Error fixing driver records:', error);
  } finally {
    await prisma.$disconnect();
  }
}

fixDriverRecords();
