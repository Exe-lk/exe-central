// import { google } from 'googleapis';
// import { Readable } from 'stream';

// // 1. Initialize the Google Drive Client using the Service Account
// const auth = new google.auth.GoogleAuth({
//   credentials: {
//     client_email: process.env.GOOGLE_CLIENT_EMAIL,
//     // Safely parse the private key to handle Vercel/Next.js environment string escaping
//     private_key: process.env.GOOGLE_PRIVATE_KEY?.replace(/\\n/g, '\n'),
//   },
//   scopes: ['https://www.googleapis.com/auth/drive'],
// });

// const drive = google.drive({ version: 'v3', auth });
// const ROOT_FOLDER_ID = process.env.GOOGLE_DRIVE_ROOT_FOLDER_ID!;

// /**
//  * Creates a dedicated folder for a new project inside the Master Folder.
//  * @param folderName e.g., "[PN074] Reservation System"
//  * @returns The new folder's Google Drive ID
//  */
// export async function createProjectFolder(folderName: string): Promise<string> {
//   try {
//     const fileMetadata = {
//       name: folderName,
//       mimeType: 'application/vnd.google-apps.folder',
//       parents: [ROOT_FOLDER_ID],
//     };

//     const file = await drive.files.create({
//       requestBody: fileMetadata,
//       fields: 'id',
//       supportsAllDrives: true, // Prevents errors if the master folder is in a Google Workspace Shared Drive
//     });

//     if (!file.data.id) {
//       throw new Error('Drive API returned null ID');
//     }

//     return file.data.id;
//   } catch (error) {
//     console.error('Failed to create Drive folder:', error);
//     throw new Error('Google Drive integration failed during folder creation');
//   }
// }

// /**
//  * Uploads a file stream (like a generated PDF invoice or uploaded bank slip) to a specific project folder.
//  * @returns The Drive File ID and the Web View URL for instant downloading/viewing.
//  */
// export async function uploadFileToDrive(
//   buffer: Buffer, 
//   fileName: string, 
//   mimeType: string, 
//   folderId: string
// ): Promise<{ fileId: string; fileUrl: string }> {
//   try {
//     // Convert Node Buffer to a Readable Stream for the Google API
//     const stream = new Readable();
//     stream.push(buffer);
//     stream.push(null);

//     const fileMetadata = {
//       name: fileName,
//       parents: [folderId],
//     };

//     const media = {
//       mimeType: mimeType,
//       body: stream,
//     };

//     const file = await drive.files.create({
//       requestBody: fileMetadata,
//       media: media,
//       fields: 'id, webViewLink',
//       supportsAllDrives: true,
//     });

//     if (!file.data.id || !file.data.webViewLink) {
//       throw new Error('Drive API returned incomplete file metadata');
//     }

//     return {
//       fileId: file.data.id,
//       fileUrl: file.data.webViewLink,
//     };
//   } catch (error) {
//     console.error('Failed to upload file to Drive:', error);
//     throw new Error('File upload failed');
//   }
// }

import { google } from 'googleapis';
import { Readable } from 'stream';

// 1. Initialize the Google Drive Client using the Service Account
const auth = new google.auth.GoogleAuth({
  credentials: {
    client_email: process.env.GOOGLE_CLIENT_EMAIL,
    // Safely parse the private key to handle Vercel/Next.js environment string escaping
    private_key: process.env.GOOGLE_PRIVATE_KEY?.replace(/\\n/g, '\n'),
  },
  scopes: ['https://www.googleapis.com/auth/drive'],
});

const drive = google.drive({ version: 'v3', auth });
const ROOT_FOLDER_ID = process.env.GOOGLE_DRIVE_ROOT_FOLDER_ID!;

/**
 * Creates a dedicated folder for a new project inside the Master Folder.
 */
export async function createProjectFolder(folderName: string): Promise<string> {
  try {
    const fileMetadata = {
      name: folderName,
      mimeType: 'application/vnd.google-apps.folder',
      parents: [ROOT_FOLDER_ID],
    };

    const file = await drive.files.create({
      requestBody: fileMetadata,
      fields: 'id',
      supportsAllDrives: true, // Prevents errors if the master folder is in a Shared Drive
    });

    if (!file.data.id) {
      throw new Error('Drive API returned null ID');
    }

    return file.data.id;
  } catch (error: any) {
    console.error('\n🔴 [DRIVE FOLDER CREATION ERROR]:', error.message || error);
    throw new Error('Google Drive integration failed during folder creation');
  }
}

/**
 * Uploads a file stream (Bank slip) to a specific project folder.
 */
export async function uploadFileToDrive(
  buffer: Buffer, 
  fileName: string, 
  mimeType: string, 
  folderId: string
): Promise<{ fileId: string; fileUrl: string }> {
  try {
    const fileMetadata = {
      name: fileName,
      parents: [folderId],
    };

    // BULLETPROOF NODE.JS STREAMING FOR NEXT.JS APP ROUTER
    const media = {
      mimeType: mimeType,
      body: Readable.from(buffer),
    };

    const file = await drive.files.create({
      requestBody: fileMetadata,
      media: media,
      fields: 'id, webViewLink',
      supportsAllDrives: true,
    });

    if (!file.data.id || !file.data.webViewLink) {
      throw new Error('Drive API returned incomplete file metadata');
    }

    return {
      fileId: file.data.id,
      fileUrl: file.data.webViewLink,
    };
  } catch (error: any) {
    console.error('\n🔴 [GOOGLE DRIVE UPLOAD ERROR]:', error.message || error);
    throw new Error('File upload failed');
  }
}