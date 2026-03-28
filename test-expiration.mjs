import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  'https://bnyvsgnedynsjldghvjj.supabase.co', 
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImJueXZzZ25lZHluc2psZGdodmpqIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc3MDMzMjA3NSwiZXhwIjoyMDg1OTA4MDc1fQ.-Zl10P2OwcqBD-kpxav15E0iH96uSlzzSVQVRE6-QIc'
);

async function run() {
  console.log('1. Buscando usuario...');
  const { data: { users } } = await supabase.auth.admin.listUsers();
  const user = users.find(u => u.email === 'lucaspython2020@gmail.com');
  
  if(!user) {
    console.error('Usuario nao encontrado!');
    return;
  }
  
  console.log('2. Atualizando plano para PRO vencido há 2 dias...');
  const d = new Date();
  d.setDate(d.getDate() - 2);
  
  await supabase.from('profiles').update({ 
    plan: 'pro', 
    expires_at: d.toISOString(), 
    is_recurring: false 
  }).eq('id', user.id);
  
  console.log('3. Chamando edge function...');
  const { data, error } = await supabase.functions.invoke('check-plan-expiration', { 
    headers: { Authorization: `Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImJueXZzZ25lZHluc2psZGdodmpqIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc3MDMzMjA3NSwiZXhwIjoyMDg1OTA4MDc1fQ.-Zl10P2OwcqBD-kpxav15E0iH96uSlzzSVQVRE6-QIc` } 
  });
  
  if(error) console.error('Erro na funcao:', error);
  else console.log('Resultado da funcao:', data);
  
  console.log('4. Verificando o plano e as notificações no banco de dados...');
  const { data: p } = await supabase.from('profiles').select('plan, expires_at').eq('id', user.id).single();
  console.log('Novo plano no BD:', p.plan);

  const { data: n } = await supabase.from('notifications')
    .select('title, message')
    .eq('user_id', user.id)
    .order('created_at', { ascending: false })
    .limit(1);

  if (n && n.length > 0) {
    console.log('Ultima notificacao:', n[0]);
  }
}

run();
