import { createClient } from "@supabase/supabase-js";

const DEFAULT_SUPABASE_URL = "https://uuhpezybfvhhbfzvzhei.supabase.co";
const DEFAULT_SUPABASE_ANON_KEY = "sb_publishable_Y3OpbmRvQ-wXzhO9lu1L5Q_FELWpQ0d";

function getValidatedUrl() {
  let url = "";
  try {
    url = import.meta.env?.VITE_SUPABASE_URL;
  } catch (e) {}
  
  if (url && typeof url === "string") {
    url = url.trim();
    if (url.startsWith("http://") || url.startsWith("https://")) {
      return url;
    }
  }
  return DEFAULT_SUPABASE_URL;
}

function getValidatedKey() {
  let key = "";
  try {
    key = import.meta.env?.VITE_SUPABASE_ANON_KEY;
  } catch (e) {}
  
  if (key && typeof key === "string") {
    key = key.trim();
    if (key.length > 10 && !key.includes("YOUR_") && key !== "undefined" && key !== "null" && key !== "") {
      return key;
    }
  }
  return DEFAULT_SUPABASE_ANON_KEY;
}

const supabaseUrl = getValidatedUrl();
const supabaseAnonKey = getValidatedKey();

export const supabase = createClient(supabaseUrl, supabaseAnonKey);
