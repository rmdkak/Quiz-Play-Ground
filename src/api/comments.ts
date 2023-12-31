import { auth, db } from 'config/firebase';
import {
  addDoc,
  collection,
  deleteDoc,
  doc,
  getDoc,
  getDocs,
  limit,
  orderBy,
  query,
  startAfter,
  updateDoc,
  where
} from 'firebase/firestore';

interface CommentType {
  id: string;
  userId: string;
  postId: string;
  content: string;
  date: string;
}

interface UserType {
  userId: string;
  userName: string;
  userImg: string;
}

type CommentWithNameType = CommentType & {
  userName: string;
  userImg: string;
};

interface addCommentType {
  postId: string;
  content: string;
}

interface updateCommentType {
  id: string;
  content: string;
}

// 무한 스크롤 아오아오
export const getComments = async (postId: string, cursor?: string): Promise<CommentWithNameType[]> => {
  const commentList: CommentType[] = [];
  let commentQ = query(collection(db, 'comments'), where('postId', '==', postId), orderBy('date', 'desc'), limit(4));
  if (cursor != null) {
    commentQ = query(commentQ, startAfter(cursor));
  }
  const commentSnapshot = await getDocs(commentQ);

  commentSnapshot.forEach(doc => {
    const comment = { ...(doc.data() as Omit<CommentType, 'id'>), id: doc.id };
    commentList.push(comment);
  });

  const userNameList: Record<string, Pick<CommentWithNameType, 'userName' | 'userImg'>> = {};
  for (const comment of commentList) {
    if (Object.prototype.hasOwnProperty.call(userNameList, comment.userId)) continue;
    const userQ = query(collection(db, 'users'), where('userId', '==', comment.userId));
    const userSnapshot = await getDocs(userQ);
    const theUser = userSnapshot.docs[0].data() as UserType;
    userNameList[theUser.userId] = { userName: theUser.userName, userImg: theUser.userImg };
  }

  const nameAddedCommentList = commentList.map(comment => ({ ...comment, ...userNameList[comment.userId] }));
  return nameAddedCommentList.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
};

// 무한 스크롤 없는 getComments
// export const getComments = async (postId: string): Promise<CommentWithNameType[]> => {
//   const commentList: CommentType[] = [];
//   const commentQ = query(collection(db, 'comments'), where('postId', '==', postId));
//   const commentSnapshot = await getDocs(commentQ);
//   commentSnapshot.forEach(doc => {
//     const comment = { ...(doc.data() as Omit<CommentType, 'id'>), id: doc.id };
//     commentList.push(comment);
//   });

//   const userNameList: Record<string, Pick<CommentWithNameType, 'userName' | 'userImg'>> = {};
//   for (const comment of commentList) {
//     if (Object.prototype.hasOwnProperty.call(userNameList, comment.userId)) continue;
//     const userQ = query(collection(db, 'users'), where('userId', '==', comment.userId));
//     const userSnapshot = await getDocs(userQ);
//     const theUser = userSnapshot.docs[0].data() as UserType;
//     userNameList[theUser.userId] = { userName: theUser.userName, userImg: theUser.userImg };
//   }

//   const nameAddedCommentList = commentList.map(comment => ({ ...comment, ...userNameList[comment.userId] }));
//   return nameAddedCommentList.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
// };

export const addComment = async ({ postId, content }: addCommentType) => {
  const user = auth.currentUser;
  if (user == null) throw new Error('로그인 후 이용 가능합니다.');
  const { uid } = user;

  const gameDocRef = doc(db, 'GameLists', postId);
  const gameDocSnapshot = await getDoc(gameDocRef);
  if (!gameDocSnapshot.exists()) throw new Error('게임을 찾을 수 없습니다.');

  await addDoc(collection(db, 'comments'), {
    userId: uid,
    postId,
    content,
    date: new Date().toISOString()
  });
};

export const deleteComment = async (id: string) => {
  const user = auth.currentUser;
  if (user == null) throw new Error('로그인 후 이용 가능합니다.');
  const { uid } = user;

  const docRef = doc(db, 'comments', id);
  const docSnap = await getDoc(docRef);
  if (!docSnap?.exists()) throw new Error('댓글을 찾을 수 없습니다.');
  const docData = { ...(docSnap.data() as Omit<CommentType, 'id'>), id: docSnap.id };

  if (uid !== docData.userId) throw new Error('삭제 권한이 없습니다.');
  await deleteDoc(docRef);
};

export const updateComment = async ({ id, content }: updateCommentType) => {
  const user = auth.currentUser;
  if (user == null) throw new Error('로그인 후 이용 가능합니다.');
  const { uid } = user;

  const docRef = doc(db, 'comments', id);
  const docSnap = await getDoc(docRef);
  if (!docSnap?.exists()) throw new Error('댓글을 찾을 수 없습니다.');
  const docData = { ...(docSnap.data() as Omit<CommentType, 'id'>), id: docSnap.id };

  if (uid !== docData.userId) throw new Error('수정 권한이 없습니다.');
  await updateDoc(docRef, { content });
};

export const getTotalCommentCount = async (postId: string): Promise<number> => {
  const commentQ = query(collection(db, 'comments'), where('postId', '==', postId));
  const commentSnapshot = await getDocs(commentQ);
  return commentSnapshot.size;
};
