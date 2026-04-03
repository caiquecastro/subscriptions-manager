import { getDownloadURL, getStorage, ref, uploadBytes } from "firebase/storage";
import { app } from "./firebase-app";

const storage = getStorage(app);

export async function uploadInvoiceFile(
	file: File,
	userId: string,
): Promise<{ url: string; name: string }> {
	const timestamp = Date.now();
	const safeName = file.name.replace(/[^a-zA-Z0-9._-]/g, "_");
	const path = `users/${userId}/invoices/${timestamp}_${safeName}`;
	const storageRef = ref(storage, path);

	await uploadBytes(storageRef, file);
	const url = await getDownloadURL(storageRef);

	return { url, name: file.name };
}
