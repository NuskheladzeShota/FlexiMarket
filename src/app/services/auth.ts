import { supabase } from "../utils/supabase/client";
import { supabaseServer } from "../utils/supabase/servers";
import { cookies } from "next/headers";

export const signUp = async (email: string, password: string) => {
  const { data, error } = await supabase.auth.signUp({ email, password });

  if (error) {
    throw new Error(error.message);
  }

  return data.user;
};

export const signIn = async (email: string, password: string) => {
  const { data, error } = await supabase.auth.signInWithPassword({ email, password });

  if (error) {
    throw new Error(error.message);
  }

  return data.user;
};

export const signOut = async () => {
  const { error } = await supabase.auth.signOut();

  if (error) {
    throw new Error(error.message);
  }
};

export const getServerUser = async () => {
    const allCookies = await cookies();
    const accessToken = allCookies.get("sb-access-token")?.value;
  
    if (!accessToken) {
      throw new Error("Access token is missing");
    }
  
    const { data, error } = await supabaseServer.auth.getUser(accessToken);
  
    if (error) {
      throw new Error(error.message);
    }
  
    return data.user;
};
