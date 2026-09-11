import {
  collection,
  doc,
  addDoc,
  getDocs,
  updateDoc,
  deleteDoc,
  setDoc,
  serverTimestamp,
  query,
  where,
  writeBatch,
} from 'firebase/firestore';
import { db } from './firebase';

export interface ConversationDoc {
  id: string;
  title: string;
  createdAt: Date | null;
  updatedAt: Date | null;
}

export interface MessageDoc {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  feedback?: 'like' | 'dislike' | null;
  createdAt: Date | null;
}

export async function listConversations(userId: string): Promise<ConversationDoc[]> {
  const q = query(
    collection(db, 'conversations'),
    where('userId', '==', userId)
  );
  const snap = await getDocs(q);
  const results = snap.docs.map((d) => {
    const data = d.data();
    return {
      id: d.id,
      title: (data.title as string) || 'New chat',
      createdAt: data.createdAt?.toDate?.() ?? null,
      updatedAt: data.updatedAt?.toDate?.() ?? null,
    };
  });
  return results.sort((a, b) => {
    const at = a.updatedAt?.getTime() ?? 0;
    const bt = b.updatedAt?.getTime() ?? 0;
    return bt - at;
  });
}

export async function createConversation(
  userId: string,
  title = 'New chat'
): Promise<string> {
  const ref = await addDoc(collection(db, 'conversations'), {
    userId,
    title,
    model: 'openai/gpt-oss-120b',
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
  });
  return ref.id;
}

export async function getMessages(conversationId: string): Promise<MessageDoc[]> {
  const snap = await getDocs(
    collection(db, 'conversations', conversationId, 'messages')
  );
  const results = snap.docs.map((d) => {
    const data = d.data();
    return {
      id: d.id,
      role: data.role as 'user' | 'assistant',
      content: (data.content as string) || '',
      feedback: (data.feedback as 'like' | 'dislike' | null) ?? null,
      createdAt: data.createdAt?.toDate?.() ?? null,
    };
  });
  return results.sort((a, b) => {
    const at = a.createdAt?.getTime() ?? 0;
    const bt = b.createdAt?.getTime() ?? 0;
    return at - bt;
  });
}

export async function addMessage(
  conversationId: string,
  role: 'user' | 'assistant',
  content: string,
  localId?: string
): Promise<string> {
  const coll = collection(db, 'conversations', conversationId, 'messages');
  const ref = localId ? doc(coll, localId) : doc(coll);
  await setDoc(ref, { role, content, createdAt: serverTimestamp() });
  await updateDoc(doc(db, 'conversations', conversationId), {
    updatedAt: serverTimestamp(),
  });
  return ref.id;
}

export async function deleteMessage(
  conversationId: string,
  messageId: string
): Promise<void> {
  await deleteDoc(
    doc(db, 'conversations', conversationId, 'messages', messageId)
  );
}

export async function setMessageFeedback(
  conversationId: string,
  messageId: string,
  feedback: 'like' | 'dislike' | null
): Promise<void> {
  await updateDoc(
    doc(db, 'conversations', conversationId, 'messages', messageId),
    { feedback }
  );
}

export async function renameConversation(id: string, title: string): Promise<void> {
  await updateDoc(doc(db, 'conversations', id), {
    title,
    updatedAt: serverTimestamp(),
  });
}

export async function deleteConversation(id: string): Promise<void> {
  const msgsSnap = await getDocs(collection(db, 'conversations', id, 'messages'));
  const batch = writeBatch(db);
  msgsSnap.docs.forEach((d) => batch.delete(d.ref));
  batch.delete(doc(db, 'conversations', id));
  await batch.commit();
}

export function deriveTitle(text: string): string {
  const cleaned = text.trim().replace(/\s+/g, ' ');
  if (cleaned.length <= 42) return cleaned;
  return cleaned.slice(0, 42).trim() + '…';
}

export function groupByDate(convs: ConversationDoc[]) {
  const today: ConversationDoc[] = [];
  const yesterday: ConversationDoc[] = [];
  const older: ConversationDoc[] = [];

  const now = new Date();
  const startOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate()).getTime();
  const startOfYesterday = startOfToday - 86_400_000;

  for (const c of convs) {
    const t = c.updatedAt?.getTime() ?? 0;
    if (t >= startOfToday) today.push(c);
    else if (t >= startOfYesterday) yesterday.push(c);
    else older.push(c);
  }
  return { today, yesterday, older };
}