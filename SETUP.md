# Setup Guide

## Quick Start

Follow these steps to get the Documenso Template Builder running:

### 1. Update Environment Variables

Open the `.env.local` file and replace the placeholder with your actual Documenso API key:

```env
DOCUMENSO_API_KEY=your_actual_api_key_here
NEXT_PUBLIC_DOCUMENSO_HOST=https://app.documenso.com
```

### 2. Get Your Documenso API Key

If you don't have a Documenso API key yet:

1. Go to [Documenso](https://app.documenso.com)
2. Sign up or log in to your account
3. Navigate to Settings → API Keys
4. Create a new API key
5. Copy the key and paste it in your `.env.local` file

### 3. Start the Development Server

```bash
npm run dev
```

The application will be available at [http://localhost:3000](http://localhost:3000)

## Testing the Application

### Step 1: Upload a PDF
1. Visit http://localhost:3000
2. Drag and drop a PDF file or click to browse
3. Wait for the upload to complete
4. Click "Continue to Template Builder"

### Step 2: Build Your Template
1. Click field type buttons to add fields (Signature, Date, Name, Email, Text)
2. Drag fields to position them on your PDF
3. Resize fields by dragging the bottom-right corner
4. Delete fields by clicking the X button

### Step 3: Add Recipients
1. Fill in the recipient form on the left sidebar
2. Enter name and email for each signer
3. Click "Add Recipient" button
4. Add multiple recipients as needed

### Step 4: Save and Sign
1. Click "Save & Continue" button
2. The template will be created in Documenso
3. A signing token will be generated
4. The embedded signing interface will load

## Troubleshooting

### "API key not configured" Error
- Check that `.env.local` exists and contains your API key
- Restart the development server after changing `.env.local`

### Upload Fails
- Verify your Documenso API key has upload permissions
- Check the browser console for detailed error messages
- Ensure the file is a valid PDF (not corrupted)

### PDF Doesn't Render
- Clear your browser cache
- Check browser console for PDF.js errors
- Ensure you have a stable internet connection (PDF worker loads from CDN)

### Signing Page Doesn't Load
- Verify the template was created successfully
- Check that recipients were added
- Ensure at least one field was placed on the document

## API Endpoints Used

The application communicates with these Documenso API endpoints:

- `POST /v1/documents/upload` - Upload PDF documents
- `POST /v1/templates` - Create templates
- `POST /v1/templates/{id}/recipients` - Add recipients
- `POST /v1/templates/{id}/fields` - Add signature fields
- `POST /v1/templates/{id}/direct-link` - Generate signing tokens

## Next Steps

After setting up, you can:

1. Customize the styling in `app/globals.css`
2. Modify field types in `types/index.ts`
3. Add more validation in API routes
4. Implement authentication for multi-user support
5. Add database to persist templates
6. Customize the embedded signing component styling

## Need Help?

- Check the [Documenso Documentation](https://docs.documenso.com)
- Review the [Documenso API Reference](https://openapi.documenso.com/reference)
- Open an issue if you encounter bugs

