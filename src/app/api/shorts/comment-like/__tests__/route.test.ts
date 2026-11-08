import { test } from "node:test";
import assert from "node:assert/strict";
import { createPostHandler } from "../handler";

type Doc = {
  exists: boolean;
  data: () => Record<string, unknown> | undefined;
};

function makeHarness(options?: {
  comment?: Record<string, unknown> | null;
  initiallyLiked?: boolean;
  authFails?: boolean;
}) {
  let commentData = options?.comment === undefined
    ? { status: "approved", likes: 0 }
    : options.comment;
  let liked = options?.initiallyLiked ?? false;
  let dbCalls = 0;

  const commentRef = { collection: "comments", id: "commentA" };
  const likeRef = { collection: "videoCommentLikes", id: "commentA_userA" };

  const db = {
    collection(name: string) {
      return {
        doc(id: string) {
          if (name === "comments" && id === "commentA") return commentRef;
          if (name === "videoCommentLikes" && id === "commentA_userA") return likeRef;
          throw new Error(`Unexpected document: ${name}/${id}`);
        },
      };
    },
    async runTransaction(callback: (tx: any) => Promise<any>) {
      dbCalls++;
      const tx = {
        async get(ref: typeof commentRef | typeof likeRef): Promise<Doc> {
          if (ref === commentRef) {
            return {
              exists: commentData !== null,
              data: () => commentData ?? undefined,
            };
          }
          return {
            exists: liked,
            data: () => liked ? { userId: "userA" } : undefined,
          };
        },
        set(ref: typeof likeRef, value: Record<string, unknown>) {
          assert.equal(ref, likeRef);
          assert.equal(value.userId, "userA");
          liked = true;
        },
        update(ref: typeof commentRef, value: Record<string, unknown>) {
          assert.equal(ref, commentRef);
          commentData = { ...(commentData ?? {}), ...value };
        },
        delete(ref: typeof likeRef) {
          assert.equal(ref, likeRef);
          liked = false;
        },
      };

      return callback(tx);
    },
  };

  const handler = createPostHandler({
    async verifyToken(token) {
      if (options?.authFails || token !== "valid-token") {
        throw new Error("Invalid token");
      }
      return { uid: "userA" };
    },
    getDb() {
      return db;
    },
  });

  async function request(body: unknown, token = "valid-token") {
    return handler(new Request("http://localhost/api/shorts/comment-like", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
      body: typeof body === "string" ? body : JSON.stringify(body),
    }));
  }

  return {
    request,
    getComment: () => commentData,
    getLiked: () => liked,
    getDbCalls: () => dbCalls,
  };
}

test("missing authorization returns 401", async () => {
  const harness = makeHarness();
  const response = await createPostHandler({
    async verifyToken() {
      throw new Error("Must not be called");
    },
    getDb() {
      throw new Error("Must not be called");
    },
  })(new Request("http://localhost/api/shorts/comment-like", {
    method: "POST",
    body: JSON.stringify({ commentId: "commentA", action: "like" }),
  }));

  assert.equal(response.status, 401);
  assert.deepEqual(await response.json(), {
    success: false,
    message: "Unauthorized",
  });
  assert.equal(harness.getDbCalls(), 0);
});

test("invalid token returns 401", async () => {
  const harness = makeHarness({ authFails: true });
  const response = await harness.request({ commentId: "commentA", action: "like" });
  assert.equal(response.status, 401);
});

test("invalid JSON returns 400", async () => {
  const harness = makeHarness();
  const response = await harness.request("{invalid-json");
  assert.equal(response.status, 400);
  assert.deepEqual(await response.json(), {
    success: false,
    message: "Invalid JSON",
  });
  assert.equal(harness.getDbCalls(), 0);
});

test("invalid action returns 400", async () => {
  const harness = makeHarness();
  const response = await harness.request({ commentId: "commentA", action: "remove" });
  assert.equal(response.status, 400);
  assert.equal(harness.getDbCalls(), 0);
});

test("approved comment can be liked and count increments", async () => {
  const harness = makeHarness({ comment: { status: "approved", likes: 2 } });
  const response = await harness.request({ commentId: "commentA", action: "like" });

  assert.equal(response.status, 200);
  assert.equal(harness.getLiked(), true);
  assert.equal(harness.getComment()?.likes, 3);
  assert.deepEqual(await response.json(), { success: true, status: 200 });
});

test("duplicate like returns 409 without changing count", async () => {
  const harness = makeHarness({
    comment: { status: "approved", likes: 1 },
    initiallyLiked: true,
  });
  const response = await harness.request({ commentId: "commentA", action: "like" });

  assert.equal(response.status, 409);
  assert.equal(harness.getComment()?.likes, 1);
  assert.equal(harness.getLiked(), true);
});

test("unlike removes like and decrements count", async () => {
  const harness = makeHarness({
    comment: { status: "approved", likes: 2 },
    initiallyLiked: true,
  });
  const response = await harness.request({ commentId: "commentA", action: "unlike" });

  assert.equal(response.status, 200);
  assert.equal(harness.getLiked(), false);
  assert.equal(harness.getComment()?.likes, 1);
});

test("unlike without an existing like returns 409", async () => {
  const harness = makeHarness({ comment: { status: "approved", likes: 2 } });
  const response = await harness.request({ commentId: "commentA", action: "unlike" });

  assert.equal(response.status, 409);
  assert.equal(harness.getComment()?.likes, 2);
});

test("missing or non-approved comment returns 404", async () => {
  for (const comment of [
    null,
    { status: "pending", likes: 0 },
  ]) {
    const harness = makeHarness({ comment });
    const response = await harness.request({ commentId: "commentA", action: "like" });
    assert.equal(response.status, 404);
    assert.equal(harness.getLiked(), false);
  }
});
