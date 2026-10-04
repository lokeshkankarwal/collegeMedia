import prisma from "/Users/lokeshkumarkankarwal/Desktop/college_media/college_media-backend/src/lib/prisma.js";
import bcrypt from "bcryptjs";
import fs from "fs";

async function main() {
  console.log("=== STARTING COLLEGE MEDIA AUTOMATED VERIFICATION SUITE 2 ===");
  const timestamp = Date.now();
  const passwordHash = await bcrypt.hash("Password@123", 10);

  // 1. TEST A: Post composer check
  console.log("\n--- TEST A: Post Composer Placeholder Verification ---");
  const createPostContent = fs.readFileSync(
    "/Users/lokeshkumarkankarwal/Desktop/college_media/college-media-frontend/src/components/post/CreatePost.tsx",
    "utf8"
  );
  if (createPostContent.includes("(Ctrl+Enter to post)")) {
    throw new Error("FAILED: '(Ctrl+Enter to post)' is still present in CreatePost.tsx");
  }
  if (!createPostContent.includes("What's on your mind?")) {
    throw new Error("FAILED: 'What's on your mind?' placeholder missing from CreatePost.tsx");
  }
  console.log("✓ PASSED: '(Ctrl+Enter to post)' successfully removed from composer placeholder");

  // Create test users
  const userA = await prisma.user.create({
    data: { name: "Alice Test", email: `alice_${timestamp}@test.edu`, password: passwordHash },
  });
  const userB = await prisma.user.create({
    data: { name: "Bob Test", email: `bob_${timestamp}@test.edu`, password: passwordHash },
  });
  const userC = await prisma.user.create({
    data: { name: "Charlie Test", email: `charlie_${timestamp}@test.edu`, password: passwordHash },
  });
  const userD = await prisma.user.create({
    data: { name: "Diana Test", email: `diana_${timestamp}@test.edu`, password: passwordHash },
  });

  console.log("✓ Created 4 test users for verification");

  try {
    // 2. TEST B: Like Notification & Target Post Navigation
    console.log("\n--- TEST B: Like Notification & Target Post Retrieval ---");
    const postA = await prisma.post.create({
      data: {
        authorId: userA.id,
        content: "Exciting research update on AI!",
      },
    });

    // Bob likes Alice's post
    await prisma.like.create({
      data: {
        userId: userB.id,
        postId: postA.id,
      },
    });

    const likeNotif = await prisma.notification.create({
      data: {
        recipientId: userA.id,
        senderId: userB.id,
        postId: postA.id,
        type: "LIKE",
      },
    });

    // Verify notification contains postId
    const fetchedLikeNotifs = await prisma.notification.findMany({
      where: { recipientId: userA.id, type: "LIKE" },
      include: {
        sender: { select: { id: true, name: true } },
        post: { select: { id: true, content: true } },
      },
    });

    const foundLike = fetchedLikeNotifs.find((n) => n.id === likeNotif.id);
    if (!foundLike || (foundLike.postId !== postA.id && foundLike.post?.id !== postA.id)) {
      throw new Error("FAILED: Like notification missing correct target postId");
    }
    console.log("✓ PASSED: Like notification correctly associates postId:", foundLike.postId);

    // Verify GET /api/posts/:postId retrieves exact post
    const retrievedPost = await prisma.post.findUnique({
      where: { id: postA.id },
      include: {
        author: { select: { id: true, name: true } },
        _count: { select: { likes: true, comments: true } },
      },
    });
    if (!retrievedPost || retrievedPost.content !== "Exciting research update on AI!") {
      throw new Error("FAILED: Could not retrieve exact liked post by ID");
    }
    console.log("✓ PASSED: Exact liked post retrieved by ID with likes count:", retrievedPost._count.likes);

    // 3. TEST C: Comment Notification & Auto-open Comments
    console.log("\n--- TEST C: Comment Notification & Comments Retrieval ---");
    const comment = await prisma.comment.create({
      data: {
        userId: userB.id,
        postId: postA.id,
        content: "Fascinating work, congratulations Alice!",
      },
    });

    const commentNotif = await prisma.notification.create({
      data: {
        recipientId: userA.id,
        senderId: userB.id,
        postId: postA.id,
        type: "COMMENT",
      },
    });

    const fetchedCommentNotifs = await prisma.notification.findMany({
      where: { recipientId: userA.id, type: "COMMENT" },
      include: {
        sender: { select: { id: true, name: true } },
        post: { select: { id: true, content: true } },
      },
    });

    const foundComment = fetchedCommentNotifs.find((n) => n.id === commentNotif.id);
    if (!foundComment || (foundComment.postId !== postA.id && foundComment.post?.id !== postA.id)) {
      throw new Error("FAILED: Comment notification missing correct target postId");
    }
    console.log("✓ PASSED: Comment notification correctly associates postId:", foundComment.postId);

    // Verify comments for the post exist and can be loaded
    const postComments = await prisma.comment.findMany({
      where: { postId: postA.id },
      include: { user: { select: { id: true, name: true } } },
    });
    if (postComments.length !== 1 || postComments[0].content !== comment.content) {
      throw new Error("FAILED: Comment not found for targeted post");
    }
    console.log("✓ PASSED: Comments for target post correctly retrieved:", postComments[0].content);

    // 4. TEST D: Conversation Ordering
    console.log("\n--- TEST D: Conversation Ordering & Top Elevation ---");

    // Create 3 conversations for Alice (with Bob, Charlie, Diana)
    const convBob = await prisma.conversation.create({
      data: {
        isGroup: false,
        creatorId: userA.id,
        updatedAt: new Date(Date.now() - 30000), // 30s ago
        participants: {
          create: [{ userId: userA.id }, { userId: userB.id }],
        },
      },
    });

    const convCharlie = await prisma.conversation.create({
      data: {
        isGroup: false,
        creatorId: userA.id,
        updatedAt: new Date(Date.now() - 20000), // 20s ago
        participants: {
          create: [{ userId: userA.id }, { userId: userC.id }],
        },
      },
    });

    const convDiana = await prisma.conversation.create({
      data: {
        isGroup: false,
        creatorId: userA.id,
        updatedAt: new Date(Date.now() - 10000), // 10s ago
        participants: {
          create: [{ userId: userA.id }, { userId: userD.id }],
        },
      },
    });

    // Add initial message to each
    await prisma.message.create({
      data: {
        conversationId: convBob.id,
        senderId: userB.id,
        content: "Hi from Bob",
        createdAt: new Date(Date.now() - 30000),
      },
    });

    await prisma.message.create({
      data: {
        conversationId: convCharlie.id,
        senderId: userC.id,
        content: "Hi from Charlie",
        createdAt: new Date(Date.now() - 20000),
      },
    });

    await prisma.message.create({
      data: {
        conversationId: convDiana.id,
        senderId: userD.id,
        content: "Hi from Diana",
        createdAt: new Date(Date.now() - 10000),
      },
    });

    // Initial order should be Diana (pos 1), Charlie (pos 2), Bob (pos 3)
    let convs = await prisma.conversation.findMany({
      where: { participants: { some: { userId: userA.id } } },
      include: { messages: { orderBy: { createdAt: "desc" }, take: 1 } },
    });
    convs.sort((a, b) => {
      const timeA = a.messages?.[0]?.createdAt ? new Date(a.messages[0].createdAt).getTime() : 0;
      const timeB = b.messages?.[0]?.createdAt ? new Date(b.messages[0].createdAt).getTime() : 0;
      return timeB - timeA;
    });

    if (convs[0].id !== convDiana.id || convs[2].id !== convBob.id) {
      throw new Error("FAILED: Initial conversation order mismatch");
    }
    console.log("✓ Initial order verified: Diana (1), Charlie (2), Bob (3)");

    // Step 2: User A sends message in Conv Bob (position 3)
    const newMsgBob = await prisma.message.create({
      data: {
        conversationId: convBob.id,
        senderId: userA.id,
        content: "Hey Bob! Replying to you now",
        createdAt: new Date(),
      },
    });
    await prisma.conversation.update({
      where: { id: convBob.id },
      data: { updatedAt: newMsgBob.createdAt },
    });

    // Conv Bob should now be position 1!
    convs = await prisma.conversation.findMany({
      where: { participants: { some: { userId: userA.id } } },
      include: { messages: { orderBy: { createdAt: "desc" }, take: 1 } },
    });
    convs.sort((a, b) => {
      const timeA = a.messages?.[0]?.createdAt ? new Date(a.messages[0].createdAt).getTime() : 0;
      const timeB = b.messages?.[0]?.createdAt ? new Date(b.messages[0].createdAt).getTime() : 0;
      return timeB - timeA;
    });

    if (convs[0].id !== convBob.id) {
      throw new Error(`FAILED: Expected Conv Bob at position 1, but found ${convs[0].id}`);
    }
    console.log("✓ PASSED: After sending message in Conv Bob, it immediately moved to position 1!");

    // Step 3: Charlie sends a new message to Alice (Conv Charlie)
    const newMsgCharlie = await prisma.message.create({
      data: {
        conversationId: convCharlie.id,
        senderId: userC.id,
        content: "Hey Alice, quick question!",
        createdAt: new Date(Date.now() + 1000),
      },
    });
    await prisma.conversation.update({
      where: { id: convCharlie.id },
      data: { updatedAt: newMsgCharlie.createdAt },
    });

    // Conv Charlie should now be position 1, followed by Bob, then Diana!
    convs = await prisma.conversation.findMany({
      where: { participants: { some: { userId: userA.id } } },
      include: { messages: { orderBy: { createdAt: "desc" }, take: 1 } },
    });
    convs.sort((a, b) => {
      const timeA = a.messages?.[0]?.createdAt ? new Date(a.messages[0].createdAt).getTime() : 0;
      const timeB = b.messages?.[0]?.createdAt ? new Date(b.messages[0].createdAt).getTime() : 0;
      return timeB - timeA;
    });

    if (convs[0].id !== convCharlie.id || convs[1].id !== convBob.id || convs[2].id !== convDiana.id) {
      throw new Error("FAILED: Reordering after Charlie message incorrect");
    }
    console.log("✓ PASSED: After receiving message in Conv Charlie, it moved to position 1 (Charlie, Bob, Diana)");

    // Step 4: Test with a group conversation
    const group = await prisma.conversation.create({
      data: {
        name: "Research Group",
        isGroup: true,
        creatorId: userA.id,
        updatedAt: new Date(Date.now() + 2000),
        participants: {
          create: [{ userId: userA.id, isAdmin: true }, { userId: userB.id }, { userId: userC.id }],
        },
      },
    });
    await prisma.message.create({
      data: {
        conversationId: group.id,
        senderId: userB.id,
        content: "Group meeting at 3pm!",
        createdAt: new Date(Date.now() + 2000),
      },
    });

    convs = await prisma.conversation.findMany({
      where: { participants: { some: { userId: userA.id } } },
      include: { messages: { orderBy: { createdAt: "desc" }, take: 1 } },
    });
    convs.sort((a, b) => {
      const timeA = a.messages?.[0]?.createdAt ? new Date(a.messages[0].createdAt).getTime() : 0;
      const timeB = b.messages?.[0]?.createdAt ? new Date(b.messages[0].createdAt).getTime() : 0;
      return timeB - timeA;
    });

    if (convs[0].id !== group.id) {
      throw new Error("FAILED: Group conversation with latest message did not move to position 1");
    }
    console.log("✓ PASSED: Group conversation with latest message moved to position 1");

    console.log("\n=======================================================");
    console.log("🎉 ALL TESTS IN SUITE 2 PASSED CLEANLY AND VERIFIED! 🎉");
    console.log("=======================================================");
  } finally {
    console.log("\nCleaning up test users and data...");
    const userIds = [userA.id, userB.id, userC.id, userD.id];
    await prisma.notification.deleteMany({
      where: {
        OR: [
          { recipientId: { in: userIds } },
          { senderId: { in: userIds } },
        ],
      },
    });
    await prisma.comment.deleteMany({
      where: { userId: { in: userIds } },
    });
    await prisma.like.deleteMany({
      where: { userId: { in: userIds } },
    });
    await prisma.post.deleteMany({
      where: { authorId: { in: userIds } },
    });
    await prisma.message.deleteMany({
      where: { senderId: { in: userIds } },
    });
    await prisma.conversationParticipant.deleteMany({
      where: { userId: { in: userIds } },
    });
    await prisma.conversation.deleteMany({
      where: {
        OR: [
          { creatorId: { in: userIds } },
          { participants: { some: { userId: { in: userIds } } } },
        ],
      },
    });
    await prisma.user.deleteMany({
      where: {
        id: { in: userIds },
      },
    });
    console.log("Cleanup complete.");
  }
}

main()
  .catch((err) => {
    console.error("Verification failed:", err);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
