const { createClient } = require('@supabase/supabase-js');

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

(async () => {
  const { count: profileCount, error } = await supabase
    .from('profiles')
    .select('*', { count: 'exact', head: true });

  if (error) {
    console.error('Error:', error);
    return;
  }

  console.log('👥 Total profiles count:', profileCount);
  console.log('');

  const { data: profiles } = await supabase
    .from('profiles')
    .select('id, full_name, email, created_at')
    .order('created_at', { ascending: false });

  console.log('📋 All profiles:');
  profiles.forEach((p, i) => {
    const createdAt = new Date(p.created_at).toLocaleDateString('th-TH');
    console.log(`${i + 1}. ${p.full_name || 'N/A'} (${p.email || 'N/A'}) - Created: ${createdAt}`);
  });
})();
