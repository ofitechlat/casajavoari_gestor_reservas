import prisma from '../src/lib/db'

async function updateUserEmails() {
  console.log('🔄 Updating user emails to valid format...\n')

  try {
    // Update mercedes
    const mercedes = await prisma.user.update({
      where: { email: 'mercedes' },
      data: { email: 'mercedes@casajavoari.com' }
    })
    console.log('✅ Updated mercedes:', mercedes.email)

    // Update admin
    const admin = await prisma.user.update({
      where: { email: 'admin' },
      data: { email: 'admin@casajavoari.com' }
    })
    console.log('✅ Updated admin:', admin.email)

    console.log('\n✅ Email update completed successfully!')
    console.log('\nUpdated users:')
    console.log('  - mercedes@casajavoari.com (gestor)')
    console.log('  - admin@casajavoari.com (admin)')

  } catch (error: any) {
    console.error('❌ Error updating emails:', error.message)
    process.exit(1)
  } finally {
    await prisma.$disconnect()
  }
}

updateUserEmails()
