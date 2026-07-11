import { UserProfile, DocumentFile, Application } from "../types";
import { supabase } from "../supabaseClient";
export { supabase };




/**
 * Sync user profile to Supabase 'profiles' table.
 * Supports both snake_case columns and logs warnings if any operation fails.
 */
export async function syncUserProfileToSupabase(uid: string, profile: UserProfile): Promise<void> {
  try {
    console.log(`Syncing profile for user ${uid} to Supabase...`);
    const { error } = await supabase
      .from("profiles")
      .upsert({
        id: uid,
        name: profile.name,
        email: profile.email,
        phone: profile.phone,
        state: profile.state,
        district: profile.district,
        occupation: profile.occupation,
        income: profile.income,
        gender: profile.gender,
        age: profile.age,
        education: profile.education,
        category: profile.category,
        disability: profile.disability,
        preferred_language: profile.preferredLanguage,
        updated_at: new Date().toISOString()
      }, { onConflict: "id" });

    if (error) {
      console.warn("Supabase profile sync returned an error. This might be due to missing database tables in Supabase. Error:", error.message);
    } else {
      console.log("Supabase profile sync completed successfully!");
    }
  } catch (err: any) {
    console.error("Failed to sync profile to Supabase:", err);
  }
}

/**
 * Sync document details to Supabase 'documents' table.
 */
export async function syncDocumentToSupabase(userId: string, docFile: DocumentFile): Promise<void> {
  try {
    console.log(`Syncing document ${docFile.id} to Supabase...`);
    const { error } = await supabase
      .from("documents")
      .upsert({
        id: docFile.id,
        user_id: userId,
        document_type: docFile.documentType,
        document_id: docFile.documentId,
        holder_name: docFile.holderName,
        file_url: docFile.fileUrl || "",
        verified: docFile.verified,
        uploaded_at: docFile.uploadedAt,
        additional_info: docFile.additionalInfo || "",
        expiry_date: docFile.expiryDate || "",
        dob: docFile.dob || "",
        gender: docFile.gender || "",
        state: docFile.state || ""
      }, { onConflict: "id" });

    if (error) {
      console.warn("Supabase document sync returned an error. This might be due to missing database tables in Supabase. Error:", error.message);
    } else {
      console.log("Supabase document sync completed successfully!");
    }
  } catch (err: any) {
    console.error("Failed to sync document to Supabase:", err);
  }
}

/**
 * Delete document from Supabase 'documents' table.
 */
export async function deleteDocumentFromSupabase(docId: string): Promise<void> {
  try {
    console.log(`Deleting document ${docId} from Supabase...`);
    const { error } = await supabase
      .from("documents")
      .delete()
      .eq("id", docId);

    if (error) {
      console.warn("Supabase document deletion returned an error:", error.message);
    } else {
      console.log("Supabase document deletion completed successfully!");
    }
  } catch (err: any) {
    console.error("Failed to delete document from Supabase:", err);
  }
}

/**
 * Sync active scheme application to Supabase 'applications' table.
 */
export async function syncApplicationToSupabase(userId: string, app: Application): Promise<void> {
  try {
    console.log(`Syncing application ${app.id} to Supabase...`);
    const { error } = await supabase
      .from("applications")
      .upsert({
        id: app.id,
        user_id: userId,
        scheme_id: app.schemeId,
        scheme_name: app.schemeName,
        applicant_name: app.applicantName,
        status: app.status,
        submitted_at: app.submittedAt || new Date().toISOString(),
        documents_attached: app.documentsAttached || [],
        notes: app.notes || "",
        form_values: app.formValues || {}
      }, { onConflict: "id" });

    if (error) {
      console.warn("Supabase application sync returned an error. This might be due to missing database tables in Supabase. Error:", error.message);
    } else {
      console.log("Supabase application sync completed successfully!");
    }
  } catch (err: any) {
    console.error("Failed to sync application to Supabase:", err);
  }
}
