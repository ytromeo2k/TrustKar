import {
  collection,
  doc,
  addDoc,
  getDoc,
  getDocs,
  setDoc,
  deleteDoc,
  query,
  where,
  orderBy,
  limit,
  serverTimestamp,
  updateDoc,
  onSnapshot,
  writeBatch,
  increment,
} from "firebase/firestore";
import { db } from "./firebase";
import { COLLECTIONS, USER_SUB, ESCROW_STATUS } from "./constants";

/**
 * Live listener for active ads (home page).
 */
export function subscribeActiveAds(callback, onError) {
  const q = query(
    collection(db, COLLECTIONS.ADS),
    where("status", "==", "active"),
    limit(150)
  );
  return onSnapshot(
    q,
    (snap) => {
      const list = snap.docs
        .map((d) => ({ id: d.id, ...d.data() }))
        .sort((a, b) => (b.createdAt?.seconds || 0) - (a.createdAt?.seconds || 0));
      callback(list);
    },
    (err) => {
      console.error("subscribeActiveAds:", err);
      if (onError) onError(err);
    }
  );
}

export async function fetchAds({ categoryId, max = 50 } = {}) {
  try {
    const q = query(
      collection(db, COLLECTIONS.ADS),
      where("status", "==", "active"),
      orderBy("createdAt", "desc"),
      limit(max)
    );
    const snapshot = await getDocs(q);
    let list = snapshot.docs.map((d) => ({ id: d.id, ...d.data() }));
    if (categoryId) list = list.filter((a) => a.categoryId === categoryId);
    return list;
  } catch {
    const snapshot = await getDocs(
      query(collection(db, COLLECTIONS.ADS), where("status", "==", "active"), limit(max))
    );
    let list = snapshot.docs.map((d) => ({ id: d.id, ...d.data() }));
    list.sort((a, b) => (b.createdAt?.seconds || 0) - (a.createdAt?.seconds || 0));
    if (categoryId) list = list.filter((a) => a.categoryId === categoryId);
    return list;
  }
}

export async function fetchAdById(adId) {
  const snap = await getDoc(doc(db, COLLECTIONS.ADS, adId));
  if (!snap.exists()) return null;
  return { id: snap.id, ...snap.data() };
}

export async function createAd(adData, sellerId) {
  const payload = {
    ...adData,
    sellerId,
    status: "active",
    escrowVerified: false,
    viewCount: 0,
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
  };
  const ref = await addDoc(collection(db, COLLECTIONS.ADS), payload);
  return ref.id;
}

export async function updateAd(adId, data) {
  await updateDoc(doc(db, COLLECTIONS.ADS, adId), {
    ...data,
    updatedAt: serverTimestamp(),
  });
}

export async function deleteAd(adId) {
  await updateDoc(doc(db, COLLECTIONS.ADS, adId), {
    status: "deleted",
    updatedAt: serverTimestamp(),
  });
}

export async function fetchUserAds(sellerId) {
  const snap = await getDocs(
    query(collection(db, COLLECTIONS.ADS), where("sellerId", "==", sellerId), limit(100))
  );
  return snap.docs
    .map((d) => ({ id: d.id, ...d.data() }))
    .filter((a) => a.status !== "deleted")
    .sort((a, b) => (b.createdAt?.seconds || 0) - (a.createdAt?.seconds || 0));
}

export async function createTransaction({
  adId,
  buyerId,
  sellerId,
  amount,
  adTitle,
  milestonePlan,
}) {
  const payload = {
    adId,
    buyerId,
    sellerId,
    amount,
    adTitle: adTitle || "",
    milestonePlan: milestonePlan || null,
    status: ESCROW_STATUS.PAYMENT_PENDING,
    fundsHeldAt: null,
    releasedAt: null,
    inspectionEndsAt: null,
    reviewed: false,
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
  };
  const ref = await addDoc(collection(db, COLLECTIONS.TRANSACTIONS), payload);
  return ref.id;
}

export async function updateTransactionStatus(transactionId, status, extra = {}) {
  await updateDoc(doc(db, COLLECTIONS.TRANSACTIONS, transactionId), {
    status,
    ...extra,
    updatedAt: serverTimestamp(),
  });
}

export async function fetchUserTransactions(uid) {
  const [buyerSnap, sellerSnap] = await Promise.all([
    getDocs(query(collection(db, COLLECTIONS.TRANSACTIONS), where("buyerId", "==", uid))),
    getDocs(query(collection(db, COLLECTIONS.TRANSACTIONS), where("sellerId", "==", uid))),
  ]);
  const map = new Map();
  [...buyerSnap.docs, ...sellerSnap.docs].forEach((d) => {
    map.set(d.id, { id: d.id, ...d.data() });
  });
  return Array.from(map.values()).sort(
    (a, b) => (b.createdAt?.seconds || 0) - (a.createdAt?.seconds || 0)
  );
}

/** Popular search terms from live ad titles (dynamic) */
export function derivePopularSearches(ads, max = 6) {
  const counts = {};
  for (const ad of ads) {
    const title = (ad.title || "").trim();
    if (!title) continue;
    const words = title.split(/\s+/).filter((w) => w.length > 2);
    const key = words.slice(0, 3).join(" ") || title.slice(0, 40);
    counts[key] = (counts[key] || 0) + 1;
  }
  const sorted = Object.entries(counts)
    .sort((a, b) => b[1] - a[1])
    .slice(0, max)
    .map(([term]) => term);
  if (sorted.length >= 3) return sorted;
  return ads
    .slice(0, max)
    .map((a) => a.title?.split(/\s+/).slice(0, 2).join(" ") || a.title)
    .filter(Boolean);
}

/** Wishlist */
export async function toggleWishlist(userId, adId, adMeta = {}) {
  const ref = doc(db, COLLECTIONS.USERS, userId, USER_SUB.WISHLIST, adId);
  const snap = await getDoc(ref);
  if (snap.exists()) {
    await deleteDoc(ref);
    return false;
  }
  await setDoc(ref, {
    adId,
    title: adMeta.title || "",
    price: adMeta.price || 0,
    mainImage: adMeta.mainImage || adMeta.images?.[0] || "",
    addedAt: serverTimestamp(),
  });
  return true;
}

export async function isInWishlist(userId, adId) {
  const snap = await getDoc(doc(db, COLLECTIONS.USERS, userId, USER_SUB.WISHLIST, adId));
  return snap.exists();
}

export async function fetchWishlist(userId) {
  const snap = await getDocs(collection(db, COLLECTIONS.USERS, userId, USER_SUB.WISHLIST));
  return snap.docs.map((d) => ({ id: d.id, ...d.data() }));
}

/** View history */
export async function recordAdView(userId, ad) {
  if (!userId || !ad?.id) return;
  const viewId = ad.id;
  await setDoc(
    doc(db, COLLECTIONS.USERS, userId, USER_SUB.VIEWS, viewId),
    {
      adId: ad.id,
      title: ad.title || "",
      mainImage: ad.mainImage || ad.images?.[0] || "",
      price: ad.price || 0,
      viewedAt: serverTimestamp(),
    },
    { merge: true }
  );
}

export async function fetchViewHistory(userId, max = 30) {
  const snap = await getDocs(collection(db, COLLECTIONS.USERS, userId, USER_SUB.VIEWS));
  return snap.docs
    .map((d) => ({ id: d.id, ...d.data() }))
    .sort((a, b) => (b.viewedAt?.seconds || 0) - (a.viewedAt?.seconds || 0))
    .slice(0, max);
}

/** Reviews */
export async function createReview({
  buyerId,
  sellerId,
  transactionId,
  adId,
  rating,
  comment,
  buyerName,
}) {
  const ref = await addDoc(collection(db, COLLECTIONS.REVIEWS), {
    buyerId,
    sellerId,
    transactionId,
    adId,
    rating: Math.min(5, Math.max(1, Number(rating))),
    comment: (comment || "").trim(),
    buyerName: buyerName || "Buyer",
    createdAt: serverTimestamp(),
  });
  await recalculateSellerRating(sellerId);
  return ref.id;
}

export async function fetchSellerReviews(sellerId, max = 50) {
  const snap = await getDocs(
    query(collection(db, COLLECTIONS.REVIEWS), where("sellerId", "==", sellerId), limit(max))
  );
  return snap.docs
    .map((d) => ({ id: d.id, ...d.data() }))
    .sort((a, b) => (b.createdAt?.seconds || 0) - (a.createdAt?.seconds || 0));
}

async function recalculateSellerRating(sellerId) {
  const reviews = await fetchSellerReviews(sellerId, 100);
  if (!reviews.length) return;
  const avg = reviews.reduce((s, r) => s + (r.rating || 0), 0) / reviews.length;
  await updateDoc(doc(db, COLLECTIONS.USERS, sellerId), {
    trustRating: Math.round(avg * 10) / 10,
    reviewCount: reviews.length,
    updatedAt: serverTimestamp(),
  });
}

export async function fetchUserProfile(uid) {
  const snap = await getDoc(doc(db, COLLECTIONS.USERS, uid));
  if (!snap.exists()) return null;
  return { uid, ...snap.data() };
}

/** Payment proof upload metadata */
export async function savePaymentProof(userId, { imageUrl, method, note }) {
  return addDoc(collection(db, COLLECTIONS.USERS, userId, USER_SUB.PAYMENT_PROOFS), {
    imageUrl,
    method: method || "",
    note: note || "",
    status: "pending",
    createdAt: serverTimestamp(),
  });
}

export async function fetchAllPaymentProofs() {
  const usersSnap = await getDocs(query(collection(db, COLLECTIONS.USERS), limit(200)));
  const proofs = [];
  for (const u of usersSnap.docs) {
    const pSnap = await getDocs(collection(db, COLLECTIONS.USERS, u.id, USER_SUB.PAYMENT_PROOFS));
    pSnap.docs.forEach((p) => {
      proofs.push({
        id: p.id,
        userId: u.id,
        userName: u.data().displayName || u.data().email,
        ...p.data(),
      });
    });
  }
  return proofs.sort((a, b) => (b.createdAt?.seconds || 0) - (a.createdAt?.seconds || 0));
}

/** Support tickets */
export async function createSupportTicket({ userId, email, subject, message, type }) {
  return addDoc(collection(db, COLLECTIONS.SUPPORT_TICKETS), {
    userId,
    email,
    subject,
    message,
    type: type || "general",
    status: "open",
    createdAt: serverTimestamp(),
  });
}

/** Admin */
export async function logAdminAction(adminId, action, target = {}) {
  try {
    await addDoc(collection(db, COLLECTIONS.ADMIN_LOGS), {
      adminId,
      action,
      target,
      createdAt: serverTimestamp(),
    });
  } catch (e) {
    console.warn("admin log", e);
  }
}

export async function adminUpdateUser(uid, data) {
  await updateDoc(doc(db, COLLECTIONS.USERS, uid), {
    ...data,
    updatedAt: serverTimestamp(),
  });
}

export async function fetchAllUsers(max = 200) {
  const snap = await getDocs(query(collection(db, COLLECTIONS.USERS), limit(max)));
  return snap.docs.map((d) => ({ uid: d.id, ...d.data() }));
}

export async function fetchAllAds(max = 200) {
  const snap = await getDocs(query(collection(db, COLLECTIONS.ADS), limit(max)));
  return snap.docs.map((d) => ({ id: d.id, ...d.data() }));
}

export async function fetchAllTransactions(max = 200) {
  const snap = await getDocs(query(collection(db, COLLECTIONS.TRANSACTIONS), limit(max)));
  return snap.docs.map((d) => ({ id: d.id, ...d.data() }));
}

/** Stats for admin dashboard */
export function computePlatformStats(ads, users, transactions) {
  const cityCounts = {};
  const categoryCounts = {};
  for (const ad of ads) {
    if (ad.status === "deleted") continue;
    const city = ad.city || ad.location || "Unknown";
    cityCounts[city] = (cityCounts[city] || 0) + 1;
    const cat = ad.categoryName || ad.categoryId || "Other";
    categoryCounts[cat] = (categoryCounts[cat] || 0) + 1;
  }
  const topCities = Object.entries(cityCounts)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 8);
  const topCategories = Object.entries(categoryCounts)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 8);

  const held = transactions.filter((t) =>
    ["funds_held", "dispatched", "inspection", "disputed"].includes(t.status)
  );

  return {
    totalAds: ads.filter((a) => a.status === "active").length,
    totalUsers: users.length,
    totalTransactions: transactions.length,
    escrowHeld: held.reduce((s, t) => s + (t.amount || 0), 0),
    activeDisputes: transactions.filter((t) => t.status === "disputed").length,
    topCities,
    topCategories,
    verifiedSellers: users.filter((u) => u.verified).length,
  };
}

export async function incrementCompletedDeal(sellerId, buyerId) {
  const batch = writeBatch(db);
  const sellerRef = doc(db, COLLECTIONS.USERS, sellerId);
  const buyerRef = doc(db, COLLECTIONS.USERS, buyerId);
  batch.update(sellerRef, { completedDeals: increment(1) });
  batch.update(buyerRef, { completedDeals: increment(1) });
  await batch.commit();
}
