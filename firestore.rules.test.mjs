import { after, before, beforeEach, test } from "node:test";
import assert from "node:assert/strict";
import {
  initializeTestEnvironment,
  assertSucceeds,
  assertFails,
} from "@firebase/rules-unit-testing";
import {
  doc, getDoc, setDoc, updateDoc, deleteDoc,
} from "firebase/firestore";
import { readFile } from "node:fs/promises";

const rules = await readFile("firestore.rules", "utf8");
let env;

before(async () => {
  env = await initializeTestEnvironment({
    projectId: "demo-jembeekart-rules-test",
    firestore: { host: "127.0.0.1", port: 8080, rules },
  });
});

beforeEach(async () => {
  await env.clearFirestore();
  await env.withSecurityRulesDisabled(async (ctx) => {
    const db = ctx.firestore();
    await setDoc(doc(db, "users", "userA"), {
      uid: "userA", role: "user", walletBalance: 100,
    });
    await setDoc(doc(db, "users", "userB"), {
      uid: "userB", role: "user", walletBalance: 50,
    });
    await setDoc(doc(db, "users", "adminA"), {
      uid: "adminA", role: "admin",
    });
    await setDoc(doc(db, "products", "visible"), {
      title: "Visible product", visible: true,
    });
    await setDoc(doc(db, "products", "hidden"), {
      title: "Hidden product", visible: false,
    });
    await setDoc(doc(db, "orders", "orderA"), {
      userId: "userA", status: "placed",
    });
  });
});

after(async () => {
  if (env) await env.cleanup();
});


test("user can create and read their own wishlist item", async () => {
  const db = env.authenticatedContext("userA").firestore();
  const ref = doc(db, "wishlist", "itemA");
  await assertSucceeds(setDoc(ref, {
    userId: "userA",
    productId: "productA",
    productTitle: "Test product",
    image: "/placeholder.png",
    price: 12.5,
  }));
  await assertSucceeds(getDoc(ref));
});

test("user cannot read another user's wishlist item", async () => {
  await env.withSecurityRulesDisabled(async (ctx) => {
    await setDoc(doc(ctx.firestore(), "wishlist/itemB"), {
      userId: "userB", productId: "productB", productTitle: "Private item", image: "", price: 1,
    });
  });
  await assertFails(getDoc(doc(env.authenticatedContext("userA").firestore(), "wishlist/itemB")));
});

test("user cannot create a wishlist item for another user or add extra fields", async () => {
  const db = env.authenticatedContext("userA").firestore();
  await assertFails(setDoc(doc(db, "wishlist/forgedOwner"), {
    userId: "userB", productId: "productB", productTitle: "Forged", image: "", price: 1,
  }));
  await assertFails(setDoc(doc(db, "wishlist/extraField"), {
    userId: "userA", productId: "productA", productTitle: "Test", image: "", price: 1, role: "admin",
  }));
});

test("wishlist item cannot be updated directly but owner can delete it", async () => {
  await env.withSecurityRulesDisabled(async (ctx) => {
    await setDoc(doc(ctx.firestore(), "wishlist/itemC"), {
      userId: "userA", productId: "productC", productTitle: "Test", image: "", price: 1,
    });
  });
  const ref = doc(env.authenticatedContext("userA").firestore(), "wishlist/itemC");
  await assertFails(updateDoc(ref, { price: 0 }));
  await assertSucceeds(deleteDoc(ref));
});

test("approved comments can be read by users", async () => {
  await env.withSecurityRulesDisabled(async (ctx) => {
    await setDoc(doc(ctx.firestore(), "comments/approvedComment"), {
      contentId: "videoA",
      userId: "userA",
      text: "A normal comment",
      status: "approved",
    });
  });

  await assertSucceeds(
    getDoc(doc(env.authenticatedContext("userB").firestore(), "comments/approvedComment"))
  );
});

test("pending comments cannot be read by ordinary users", async () => {
  await env.withSecurityRulesDisabled(async (ctx) => {
    await setDoc(doc(ctx.firestore(), "comments/pendingComment"), {
      contentId: "videoA",
      userId: "userA",
      text: "Awaiting moderation",
      status: "pending",
    });
  });

  await assertFails(
    getDoc(doc(env.authenticatedContext("userB").firestore(), "comments/pendingComment"))
  );
});

test("users cannot create comments directly with the client SDK", async () => {
  await assertFails(
    setDoc(doc(env.authenticatedContext("userA").firestore(), "comments/forbiddenComment"), {
      contentId: "videoA",
      userId: "userA",
      text: "Bypass moderation",
      status: "approved",
    })
  );
});

test("users can read their own comment-like record", async () => {
  await env.withSecurityRulesDisabled(async (ctx) => {
    await setDoc(doc(ctx.firestore(), "videoCommentLikes/commentA_userA"), {
      commentId: "commentA",
      userId: "userA",
      createdAt: Date.now(),
    });
  });

  await assertSucceeds(
    getDoc(doc(env.authenticatedContext("userA").firestore(), "videoCommentLikes/commentA_userA"))
  );
});

test("users cannot read another user's comment-like record", async () => {
  await env.withSecurityRulesDisabled(async (ctx) => {
    await setDoc(doc(ctx.firestore(), "videoCommentLikes/commentA_userB"), {
      commentId: "commentA",
      userId: "userB",
      createdAt: Date.now(),
    });
  });

  await assertFails(
    getDoc(doc(env.authenticatedContext("userA").firestore(), "videoCommentLikes/commentA_userB"))
  );
});

test("clients cannot write comment-like records directly", async () => {
  await assertFails(
    setDoc(doc(env.authenticatedContext("userA").firestore(), "videoCommentLikes/commentA_userA"), {
      commentId: "commentA",
      userId: "userA",
      createdAt: Date.now(),
    })
  );
});

test("clients cannot directly change an approved comment's like count", async () => {
  await env.withSecurityRulesDisabled(async (ctx) => {
    await setDoc(doc(ctx.firestore(), "comments/commentA"), {
      contentId: "videoA",
      userId: "userB",
      text: "Approved comment",
      status: "approved",
      likes: 0,
    });
  });

  await assertFails(
    updateDoc(
      doc(env.authenticatedContext("userA").firestore(), "comments/commentA"),
      { likes: 999 }
    )
  );
});

test("unauthenticated user cannot read a user profile", async () => {
  await assertFails(getDoc(doc(env.unauthenticatedContext().firestore(), "users/userA")));
});

test("visible product can be read publicly", async () => {
  await assertSucceeds(getDoc(doc(env.unauthenticatedContext().firestore(), "products/visible")));
});

test("hidden product cannot be read publicly", async () => {
  await assertFails(getDoc(doc(env.unauthenticatedContext().firestore(), "products/hidden")));
});

test("owner can read own profile", async () => {
  await assertSucceeds(getDoc(doc(env.authenticatedContext("userA").firestore(), "users/userA")));
});

test("user cannot read another user's profile", async () => {
  await assertFails(getDoc(doc(env.authenticatedContext("userA").firestore(), "users/userB")));
});

test("user cannot directly change wallet balance", async () => {
  await assertFails(updateDoc(
    doc(env.authenticatedContext("userA").firestore(), "users/userA"),
    { walletBalance: 999999 }
  ));
});

test("user can write own cart", async () => {
  await assertSucceeds(setDoc(
    doc(env.authenticatedContext("userA").firestore(), "users/userA/cart/item1"),
    { productId: "visible", quantity: 1 }
  ));
});

test("user cannot write another user's cart", async () => {
  await assertFails(setDoc(
    doc(env.authenticatedContext("userA").firestore(), "users/userB/cart/item1"),
    { productId: "visible", quantity: 1 }
  ));
});

test("customer can read own order", async () => {
  await assertSucceeds(getDoc(doc(env.authenticatedContext("userA").firestore(), "orders/orderA")));
});

test("customer cannot read another user's order", async () => {
  await assertFails(getDoc(doc(env.authenticatedContext("userB").firestore(), "orders/orderA")));
});

test("customer cannot create an order with client SDK", async () => {
  await assertFails(setDoc(
    doc(env.authenticatedContext("userA").firestore(), "orders/newOrder"),
    { userId: "userA", finalAmount: 1 }
  ));
});

test("admin can create a product", async () => {
  await assertSucceeds(setDoc(
    doc(env.authenticatedContext("adminA").firestore(), "products/adminProduct"),
    { title: "Admin product", visible: true }
  ));
});

test("ordinary user cannot create a product", async () => {
  await assertFails(setDoc(
    doc(env.authenticatedContext("userA").firestore(), "products/forbidden"),
    { title: "Forbidden", visible: true }
  ));
});

test("customer cannot create a profile directly with client SDK", async () => {
  await assertFails(setDoc(
    doc(env.authenticatedContext("newUser").firestore(), "users/newUser"),
    {
      uid: "newUser",
      role: "user",
      walletBalance: 0,
      commissionWallet: 0,
      rewardWallet: 0,
    }
  ));
});

test("customer cannot create a profile with admin role", async () => {
  await assertFails(setDoc(
    doc(env.authenticatedContext("attacker").firestore(), "users/attacker"),
    {
      uid: "attacker",
      role: "admin",
      walletBalance: 0,
    }
  ));
});

test("customer cannot create an order with a manipulated amount", async () => {
  await assertFails(setDoc(
    doc(env.authenticatedContext("userA").firestore(), "orders/manipulatedOrder"),
    {
      userId: "userA",
      productId: "visible",
      productPrice: 1,
      finalAmount: 1,
      status: "placed",
    }
  ));
});

test("public can read saved theme colors", async () => {
  await env.withSecurityRulesDisabled(async (ctx) => {
    await setDoc(doc(ctx.firestore(), "admin_settings/customize"), {
      headerBackground: "#ffffff",
      buttonColor: "#2563eb",
    });
  });

  await assertSucceeds(
    getDoc(doc(env.unauthenticatedContext().firestore(), "admin_settings/customize"))
  );
});

test("public can read footer links", async () => {
  await env.withSecurityRulesDisabled(async (ctx) => {
    await setDoc(doc(ctx.firestore(), "admin_settings/footer_builder"), {
      companyName: "JembeeKart",
      links: [{ title: "Privacy Policy", url: "/privacy" }],
    });
  });

  await assertSucceeds(
    getDoc(doc(env.unauthenticatedContext().firestore(), "admin_settings/footer_builder"))
  );
});

test("ordinary user cannot change saved theme colors", async () => {
  await env.withSecurityRulesDisabled(async (ctx) => {
    await setDoc(doc(ctx.firestore(), "admin_settings/customize"), {
      buttonColor: "#2563eb",
    });
  });

  await assertFails(
    updateDoc(
      doc(env.authenticatedContext("userA").firestore(), "admin_settings/customize"),
      { buttonColor: "#ff0000" }
    )
  );
});

test("ordinary user cannot change footer links", async () => {
  await env.withSecurityRulesDisabled(async (ctx) => {
    await setDoc(doc(ctx.firestore(), "admin_settings/footer_builder"), {
      links: [{ title: "Privacy Policy", url: "/privacy" }],
    });
  });

  await assertFails(
    setDoc(
      doc(env.authenticatedContext("userA").firestore(), "admin_settings/footer_builder"),
      { links: [{ title: "Malicious link", url: "https://example.com" }] }
    )
  );
});

test("admin can save theme colors", async () => {
  await assertSucceeds(
    setDoc(
      doc(env.authenticatedContext("adminA").firestore(), "admin_settings/customize"),
      { headerBackground: "#ffffff", buttonColor: "#2563eb" }
    )
  );
});

test("admin can save footer links", async () => {
  await assertSucceeds(
    setDoc(
      doc(env.authenticatedContext("adminA").firestore(), "admin_settings/footer_builder"),
      { companyName: "JembeeKart", links: [{ title: "Privacy Policy", url: "/privacy" }] }
    )
  );
});
