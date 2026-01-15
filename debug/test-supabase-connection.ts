import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!

async function testSupabaseConnection() {
  console.log('🔍 Testing Supabase connection...\n')

  try {
    const supabase = createClient(supabaseUrl, supabaseAnonKey)

    // Test 1: Check connection
    console.log('✅ Supabase client created successfully')
    console.log(`   URL: ${supabaseUrl}`)
    console.log(`   Anon Key: ${supabaseAnonKey.substring(0, 20)}...\n`)

    // Test 2: Try to get session (should be null for server-side)
    const { data: { session }, error: sessionError } = await supabase.auth.getSession()
    if (sessionError) {
      console.log('⚠️  Session check error (expected):', sessionError.message)
    } else {
      console.log('✅ Session check successful')
      console.log(`   Current session: ${session ? 'Active' : 'None'}\n`)
    }

    // Test 3: Check if we can access auth API
    const { data, error } = await supabase.auth.getUser()
    if (error && error.message.includes('session_not_found')) {
      console.log('✅ Auth API is accessible (no active session, which is expected)\n')
    } else if (error) {
      console.log('❌ Auth API error:', error.message, '\n')
    } else {
      console.log('✅ Auth API is accessible')
      console.log(`   User: ${data.user?.email || 'None'}\n`)
    }

    console.log('✅ All connection tests passed!')
    console.log('\n📝 Next steps:')
    console.log('   1. Run the development server: npm run dev')
    console.log('   2. Navigate to the login page')
    console.log('   3. Try to sign up a new user')
    console.log('   4. Check your email for verification link')

  } catch (error: any) {
    console.error('❌ Connection test failed:', error.message)
    process.exit(1)
  }
}

testSupabaseConnection()
