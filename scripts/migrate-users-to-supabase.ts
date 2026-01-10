import { createClient } from '@supabase/supabase-js'

const supabaseUrl = 'https://rppgqniszjvayrgxnyka.supabase.co'
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!

const TEMP_PASSWORD = 'CasaJavoari2026!'

const users = [
  {
    id: '8e52d09f-e89e-4497-ad53-4de5070d2ac2',
    email: 'mercedes@casajavoari.com',
    name: 'Mercedes Gestora',
    role: 'gestor'
  },
  {
    id: '689d7e6c-b295-4edc-8640-9651daade0cb',
    email: 'admin@casajavoari.com',
    name: 'Carlos Admin',
    role: 'admin'
  }
]

async function migrateUsers() {
  console.log('🚀 Starting user migration to Supabase Auth...\n')

  if (!supabaseServiceKey || supabaseServiceKey === 'your_service_role_key_here') {
    console.error('❌ ERROR: SUPABASE_SERVICE_ROLE_KEY not configured!')
    console.error('Please add your service role key to the .env file.')
    console.error('Get it from: https://supabase.com/dashboard/project/rppgqniszjvayrgxnyka/settings/api')
    process.exit(1)
  }

  const supabase = createClient(supabaseUrl, supabaseServiceKey, {
    auth: {
      autoRefreshToken: false,
      persistSession: false
    }
  })

  const results = {
    success: [] as string[],
    failed: [] as { email: string; error: string }[],
  }

  for (const user of users) {
    console.log(`\n🔄 Migrating user: ${user.email}`)

    try {
      const { data, error } = await supabase.auth.admin.createUser({
        email: user.email,
        password: TEMP_PASSWORD,
        email_confirm: true,
        user_metadata: {
          name: user.name,
          role: user.role,
        },
      })

      if (error) {
        console.error(`  ❌ Error: ${error.message}`)
        results.failed.push({ email: user.email, error: error.message })
        continue
      }

      console.log(`  ✅ Created in Supabase Auth`)
      console.log(`     ID: ${data.user.id}`)
      console.log(`     Email: ${data.user.email}`)
      console.log(`     Role: ${user.role}`)

      results.success.push(user.email)

    } catch (err: any) {
      console.error(`  ❌ Unexpected error: ${err.message}`)
      results.failed.push({ email: user.email, error: err.message })
    }
  }

  console.log('\n' + '='.repeat(60))
  console.log('📊 MIGRATION SUMMARY')
  console.log('='.repeat(60))
  console.log(`✅ Successfully migrated: ${results.success.length}`)
  console.log(`❌ Failed: ${results.failed.length}`)

  if (results.success.length > 0) {
    console.log('\n✅ Successful migrations:')
    results.success.forEach(email => console.log(`   - ${email}`))
  }

  if (results.failed.length > 0) {
    console.log('\n❌ Failed migrations:')
    results.failed.forEach(({ email, error }) => {
      console.log(`   - ${email}: ${error}`)
    })
  }

  console.log('\n' + '='.repeat(60))
  console.log('🔑 TEMPORARY PASSWORD FOR ALL USERS:')
  console.log(`   ${TEMP_PASSWORD}`)
  console.log('='.repeat(60))
  console.log('\n⚠️  Users should change their password after first login!')
  console.log('\n📝 Next steps:')
  console.log('   1. Test login at /login with:')
  console.log('      - mercedes@casajavoari.com')
  console.log('      - admin@casajavoari.com')
  console.log('   2. Password: CasaJavoari2026!')
  console.log('   3. Verify roles are loaded correctly')
}

migrateUsers().catch(console.error)
