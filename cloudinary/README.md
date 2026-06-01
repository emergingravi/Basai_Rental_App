Cloudinary setup for Basera
----------------------------

1) Create a Cloudinary account at https://cloudinary.com and note your Cloud Name.

2) Create an unsigned upload preset (Settings → Upload → Upload presets → Add upload preset).
   - Set `Unsigned` = ON
   - Configure folder or restrictions as needed

3) In your project, set the following env vars in a local `.env` file (edit `.env` directly — no need to copy `.env.example`):

VITE_CLOUDINARY_CLOUD_NAME=your-cloud-name
VITE_CLOUDINARY_UPLOAD_PRESET=your-upload-preset

4) Client-side uploads (already implemented)

   The app uses an unsigned preset and the REST API to upload images directly from the browser. Ensure your upload preset is unsigned and has appropriate restrictions.

5) Security note

   Unsigned uploads are convenient for client-side UX but allow any user to upload. For more control, use signed uploads from a trusted server using your Cloudinary API secret.
