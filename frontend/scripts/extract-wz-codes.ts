import * as dotenv from 'dotenv';
import { createClient } from '@supabase/supabase-js';
import * as path from 'path';
import { WZ_CODES } from '../lib/wz-codes';

// Load environment variables from .env.local
dotenv.config({ path: path.resolve(__dirname, '../.env.local') });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error('Missing Supabase credentials in .env.local');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function extractWzCodes() {
  const { data, error } = await supabase
    .from('Hamburg Targets')
    .select('wz_code, wz_description')
    .not('wz_code', 'is', null);

  if (error) {
    console.error('Error:', error);
    return;
  }

  // Group by wz_code
  const uniqueCodes = data.reduce((acc, row) => {
    if (row.wz_code && !acc[row.wz_code]) {
      acc[row.wz_code] = row.wz_description;
    }
    return acc;
  }, {} as Record<string, string>);

  const allCodes = Object.keys(uniqueCodes).sort();
  const mappedCodes: string[] = [];
  const missingCodes: string[] = [];

  // Check which codes are mapped and which are missing
  allCodes.forEach(code => {
    if (WZ_CODES[code]) {
      mappedCodes.push(code);
    } else {
      missingCodes.push(code);
    }
  });

  console.log('\n📊 WZ Code Mapping Status\n');
  console.log('═'.repeat(60));

  console.log(`\n✅ Total codes in database: ${allCodes.length}`);
  console.log(`✅ Mapped codes: ${mappedCodes.length}`);
  console.log(`⚠️  Missing translations: ${missingCodes.length}`);

  if (mappedCodes.length > 0) {
    console.log('\n✅ Already Mapped Codes:');
    console.log('─'.repeat(60));
    mappedCodes.forEach(code => {
      const desc = WZ_CODES[code];
      console.log(`  ${code} ✓`);
      console.log(`    DE: ${desc.de}`);
      console.log(`    EN: ${desc.en}`);
    });
  }

  if (missingCodes.length > 0) {
    console.log('\n⚠️  Missing Translations (Need to Add):');
    console.log('─'.repeat(60));
    missingCodes.forEach(code => {
      console.log(`  ${code}`);
      console.log(`    Current: ${uniqueCodes[code]}`);
    });

    console.log('\n📝 Code Template to Add to wz-codes.ts:');
    console.log('─'.repeat(60));
    missingCodes.forEach(code => {
      console.log(`  '${code}': {`);
      console.log(`    de: 'TODO: Add German translation',`);
      console.log(`    en: '${uniqueCodes[code]}',`);
      console.log(`  },`);
    });
  } else {
    console.log('\n🎉 All WZ codes are translated!');
  }

  console.log('\n' + '═'.repeat(60));
}

extractWzCodes();
