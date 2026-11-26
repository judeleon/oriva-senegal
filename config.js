/* ORIVA - CONNEXION À SUPABASE
   Supabase > Project Settings > API. La clé "publishable / anon" peut être
   publique : la sécurité est assurée par les règles de supabase-setup.sql.
   N'utilisez JAMAIS la clé "service_role" ici. */

const SUPABASE_URL = "https://ldzwtukygngysszzivmk.supabase.co";
const SUPABASE_ANON_KEY = "sb_publishable_hM9w0iRSE9GGl0Ok7YJA1Q_Bt3GXFJk";

const db = supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
