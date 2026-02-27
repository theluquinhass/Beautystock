import { supabase } from './supabase';

/**
 * Uploads a customer photo to the 'customer-photos' bucket.
 * 
 * @param {File} file - The image file to upload
 * @param {string} userId - The authenticated user's ID
 * @param {string} customerId - The customer's ID (used for filename)
 * @returns {Promise<string>} - The path of the uploaded file
 */
export const uploadCustomerPhoto = async (file, userId, customerId) => {
    if (!file) return null;

    const fileExt = file.name.split('.').pop();
    const fileName = `${customerId || crypto.randomUUID()}.${fileExt}`;
    const filePath = `${userId}/${fileName}`;

    const { error: uploadError } = await supabase.storage
        .from('customer-photos')
        .upload(filePath, file, { upsert: true });

    if (uploadError) {
        console.error('Error uploading customer photo:', uploadError);
        throw uploadError;
    }

    return filePath;
};

/**
 * Deletes a customer photo from the 'customer-photos' bucket.
 * 
 * @param {string} photoPath - The path of the file to delete
 */
export const deleteCustomerPhoto = async (photoPath) => {
    if (!photoPath) return;

    const { error } = await supabase.storage
        .from('customer-photos')
        .remove([photoPath]);

    if (error) {
        console.error('Error deleting customer photo:', error);
        throw error;
    }
};

/**
 * Gets the public URL for a customer photo.
 * Returns null if no path is provided.
 * 
 * @param {string} photoPath - The path of the image in the bucket
 * @returns {string|null} - The public URL or null
 */
export const getPublicCustomerPhotoUrl = (photoPath) => {
    if (!photoPath) return null;

    // Check if it's already a full URL
    if (photoPath.startsWith('http')) return photoPath;

    const { data } = supabase.storage
        .from('customer-photos')
        .getPublicUrl(photoPath);

    return data.publicUrl;
};
