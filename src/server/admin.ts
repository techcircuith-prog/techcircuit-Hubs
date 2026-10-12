import { existsSync, readFileSync } from 'fs';
import { homedir } from 'os';
import { join, resolve, sep } from 'path';
import { applicationDefault, cert, getApps, initializeApp, type ServiceAccount } from 'firebase-admin/app';
import { Firestore, getFirestore } from 'firebase-admin/firestore';

export class AdminDataConfigurationError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'AdminDataConfigurationError';
  }
}

let adminFirestore: Firestore | undefined;

export const getAdminFirestore = () => {
  if (adminFirestore) return adminFirestore;

  const projectId = process.env.FIREBASE_PROJECT_ID;
  const databaseId = process.env.FIREBASE_DATABASE_ID;
  const defaultCredentialPath = join(homedir(), '.config', 'techcircuithub', 'firebase-service-account.json');
  const configuredCredentialPath = process.env.FIREBASE_SERVICE_ACCOUNT_PATH ||
    process.env.GOOGLE_APPLICATION_CREDENTIALS ||
    (existsSync(defaultCredentialPath) ? defaultCredentialPath : undefined);

  if (!projectId || !databaseId) {
    throw new AdminDataConfigurationError('Server-side Firebase operations require FIREBASE_PROJECT_ID and FIREBASE_DATABASE_ID.');
  }

  const existingApp = getApps().find((candidate) => candidate.name === 'admin-api');
  if (existingApp) {
    adminFirestore = getFirestore(existingApp, databaseId);
    return adminFirestore;
  }

  let credential;
  if (configuredCredentialPath) {
    const credentialPath = resolve(configuredCredentialPath);
    const projectRoot = resolve(process.cwd()).toLowerCase();
    const normalizedCredentialPath = credentialPath.toLowerCase();
    if (
      normalizedCredentialPath === projectRoot ||
      normalizedCredentialPath.startsWith(`${projectRoot}${sep}`)
    ) {
      throw new AdminDataConfigurationError('Store Firebase service-account JSON files outside the project folder.');
    }
    if (!existsSync(credentialPath)) {
      throw new AdminDataConfigurationError('The configured Firebase service-account JSON file was not found.');
    }

    let serviceAccountJson: unknown;
    try {
      serviceAccountJson = JSON.parse(readFileSync(credentialPath, 'utf8'));
    } catch {
      throw new AdminDataConfigurationError('The configured Firebase service-account file must contain valid JSON.');
    }
    if (!serviceAccountJson || typeof serviceAccountJson !== 'object' || Array.isArray(serviceAccountJson)) {
      throw new AdminDataConfigurationError('The configured Firebase service-account file must contain a service-account object.');
    }

    const account = serviceAccountJson as Record<string, unknown>;
    if (
      typeof account.project_id !== 'string' ||
      typeof account.client_email !== 'string' ||
      typeof account.private_key !== 'string'
    ) {
      throw new AdminDataConfigurationError('The Firebase service-account file is missing required credentials.');
    }
    if (account.project_id !== projectId) {
      throw new AdminDataConfigurationError('The Firebase service-account file belongs to a different project than FIREBASE_PROJECT_ID.');
    }

    const serviceAccount: ServiceAccount = {
      projectId: account.project_id,
      clientEmail: account.client_email,
      privateKey: account.private_key,
    };
    credential = cert(serviceAccount);
  } else {
    credential = applicationDefault();
  }

  const app = initializeApp({ credential, projectId }, 'admin-api');
  adminFirestore = getFirestore(app, databaseId);
  return adminFirestore;
};
