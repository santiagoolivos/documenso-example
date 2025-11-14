# Documenso Template Builder Platform

A Next.js application that integrates with Documenso to create custom document templates with drag-and-drop signature fields.

## Features

- 📄 PDF document upload
- 🎨 Drag-and-drop template builder
- ✍️ Multiple field types (Signature, Date, Name, Email, Text)
- 👥 Multiple recipient support
- 📝 Embedded signing experience
- 🔒 Secure API integration with Next.js API routes

## Prerequisites

- Node.js 18+ installed
- Documenso account with API access
- Documenso API Key

## Getting Started

### 1. Install Dependencies

```bash
npm install
```

### 2. Configure Environment Variables

Create a `.env.local` file in the root directory:

```env
DOCUMENSO_API_KEY=your_documenso_api_key_here
NEXT_PUBLIC_DOCUMENSO_HOST=https://app.documenso.com
```

**Important:** Replace `your_documenso_api_key_here` with your actual Documenso API key.

### 3. Run the Development Server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

## How It Works

### 1. Upload PDF
- Drag and drop or browse to upload a PDF document
- The document is uploaded to Documenso and a document ID is generated

### 2. Build Template
- Add signature fields by clicking field type buttons
- Drag fields to position them on the PDF
- Resize fields using the resize handle
- Add multiple recipients with names and emails

### 3. Save & Sign
- Save the template with all fields and recipients
- Generate a signing token
- Use the embedded signing interface to sign documents

## Project Structure

```
/app
  /page.tsx                     # Home page with PDF upload
  /template-builder/page.tsx    # Template builder interface
  /sign/page.tsx               # Embedded signing page
  /api/documenso/              # API routes for Documenso integration
    /upload/route.ts           # Upload PDF endpoint
    /template/
      /create/route.ts         # Create template
      /fields/route.ts         # Add fields to template
      /recipients/route.ts     # Add recipients
      /token/route.ts          # Generate signing token
/components
  /PDFUpload.tsx               # File upload component
  /PDFViewer.tsx               # PDF viewer with field overlay
  /FieldToolbar.tsx            # Field type selector
  /DraggableField.tsx          # Draggable/resizable field component
  /RecipientForm.tsx           # Recipient management form
/types
  /index.ts                    # TypeScript type definitions
```

## API Integration

The application uses Next.js API routes to securely communicate with the Documenso API:

- **POST /api/documenso/upload** - Upload PDF documents
- **POST /api/documenso/template/create** - Create a new template
- **POST /api/documenso/template/recipients** - Add recipients to template
- **POST /api/documenso/template/fields** - Add signature fields
- **POST /api/documenso/template/token** - Generate direct link token

All API keys are stored server-side for security.

## Technologies Used

- **Next.js 15** - React framework with App Router
- **TypeScript** - Type safety
- **Tailwind CSS** - Styling
- **react-pdf** - PDF rendering
- **react-dropzone** - File upload
- **@documenso/embed-react** - Embedded signing component
- **@documenso/sdk-typescript** - Documenso API SDK
- **lucide-react** - Icon library

## Development

### Building for Production

```bash
npm run build
npm start
```

### Linting

```bash
npm run lint
```

## Troubleshooting

### PDF Worker Error
If you encounter PDF.js worker errors, the worker is loaded from CDN by default:
```
//unpkg.com/pdfjs-dist@{version}/build/pdf.worker.min.mjs
```

### API Key Issues
- Ensure your `.env.local` file contains a valid Documenso API key
- The API key must have permissions to create documents and templates
- Check the browser console and server logs for detailed error messages

### Upload Failures
- Verify the file is a valid PDF
- Check network tab for API response errors
- Ensure Documenso API is accessible

## License

MIT

## Support

For issues related to:
- **This application**: Create an issue in this repository
- **Documenso API**: Visit [Documenso Documentation](https://docs.documenso.com)
