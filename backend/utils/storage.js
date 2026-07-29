const supabase = require("../config/supabase");

async function uploadFile(file) {
    const fileName = `${Date.now()}-${file.originalname}`;

    const { error } = await supabase.storage
        .from("student-documents")
        .upload(fileName, file.buffer, {
            contentType: file.mimetype,
            upsert: false,
        });

    if (error) {
        throw error;
    }

    const { data } = supabase.storage
        .from("student-documents")
        .getPublicUrl(fileName);

    return {
        filename: fileName,
        publicUrl: data.publicUrl,
    };
}

module.exports = { uploadFile };
