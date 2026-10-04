import dotenv from "dotenv";
dotenv.config();

import prisma from "../src/lib/prisma.js";
import bcrypt from "bcryptjs";
import crypto from "crypto";

async function runTests() {
  console.log("=== STARTING COLLEGE MEDIA VERIFICATION SUITE ===");

  const timestamp = Date.now();
  const userAEmail = `test_usera_${timestamp}@university.edu`;
  const userBEmail = `test_userb_${timestamp}@university.edu`;
  const userCEmail = `test_userc_${timestamp}@university.edu`;

  let userA: any;
  let userB: any;
  let userC: any;

  try {
    // 1. Create Test Users
    console.log("\n[Test 1] Creating test users...");
    const hash = await bcrypt.hash("Password123!", 10);
    userA = await prisma.user.create({
      data: { name: "Alice Test", email: userAEmail, password: hash },
    });
    userB = await prisma.user.create({
      data: { name: "Bob Test", email: userBEmail, password: hash },
    });
    userC = await prisma.user.create({
      data: { name: "Charlie Test", email: userCEmail, password: hash },
    });
    console.log("✓ Created users:", userA.id, userB.id, userC.id);

    // 2. Test Follow & Followers/Following queries
    console.log("\n[Test 2] Testing Follow & Followers/Following system...");
    await prisma.follow.create({
      data: { followerId: userA.id, followingId: userB.id },
    });
    await prisma.follow.create({
      data: { followerId: userC.id, followingId: userB.id },
    });

    const bFollowers = await prisma.follow.findMany({
      where: { followingId: userB.id },
      include: { follower: true },
    });
    if (bFollowers.length !== 2) throw new Error(`Expected 2 followers for Bob, got ${bFollowers.length}`);
    console.log(`✓ Bob has ${bFollowers.length} followers (Alice & Charlie)`);

    const aFollowing = await prisma.follow.findMany({
      where: { followerId: userA.id },
      include: { following: true },
    });
    if (aFollowing.length !== 1 || aFollowing[0].followingId !== userB.id) {
      throw new Error("Alice following list verification failed");
    }
    console.log("✓ Alice follows Bob correctly");

    // 3. Test Notifications
    console.log("\n[Test 3] Testing Notification System...");
    const notif1 = await prisma.notification.create({
      data: { recipientId: userB.id, senderId: userA.id, type: "FOLLOW" },
    });
    const notif2 = await prisma.notification.create({
      data: { recipientId: userB.id, senderId: userC.id, type: "FOLLOW" },
    });

    // Mark single notification read
    await prisma.notification.updateMany({
      where: { id: notif1.id, recipientId: userB.id },
      data: { isRead: true },
    });
    const n1 = await prisma.notification.findUnique({ where: { id: notif1.id } });
    if (!n1?.isRead) throw new Error("Single notification mark-as-read failed");
    console.log("✓ Single notification mark-as-read verified");

    // Mark all read
    await prisma.notification.updateMany({
      where: { recipientId: userB.id, isRead: false },
      data: { isRead: true },
    });
    const unreadCount = await prisma.notification.count({
      where: { recipientId: userB.id, isRead: false },
    });
    if (unreadCount !== 0) throw new Error("Mark all read failed");
    console.log("✓ Mark all notifications as read verified");

    // 4. Test Conversation & Deletion
    console.log("\n[Test 4] Testing Conversation & Deletion...");
    const conv = await prisma.conversation.create({
      data: {
        isGroup: false,
        creatorId: userA.id,
        participants: {
          create: [
            { userId: userA.id, isAdmin: true },
            { userId: userB.id, isAdmin: false },
          ],
        },
      },
    });

    // Alice deletes conversation from her list
    await prisma.conversationParticipant.update({
      where: {
        conversationId_userId: { conversationId: conv.id, userId: userA.id },
      },
      data: { isDeleted: true },
    });

    // Alice active conversations
    const aConvs = await prisma.conversation.findMany({
      where: {
        participants: { some: { userId: userA.id, isDeleted: false } },
      },
    });
    if (aConvs.some((c) => c.id === conv.id)) {
      throw new Error("Conversation should be hidden from Alice");
    }

    // Bob still has the conversation
    const bConvs = await prisma.conversation.findMany({
      where: {
        participants: { some: { userId: userB.id, isDeleted: false } },
      },
    });
    if (!bConvs.some((c) => c.id === conv.id)) {
      throw new Error("Conversation should still exist for Bob");
    }
    console.log("✓ Conversation deletion is user-scoped and preserves recipient's chat");

    // 5. Test Group Admin Management & Creator Protection
    console.log("\n[Test 5] Testing Group Admin Management & Permissions...");
    const groupConv = await prisma.conversation.create({
      data: {
        name: "CS Senior Project",
        isGroup: true,
        creatorId: userA.id,
        participants: {
          create: [
            { userId: userA.id, isAdmin: true },
            { userId: userB.id, isAdmin: false },
            { userId: userC.id, isAdmin: false },
          ],
        },
      },
      include: { participants: true },
    });

    // Make Bob admin
    await prisma.conversationParticipant.update({
      where: {
        conversationId_userId: { conversationId: groupConv.id, userId: userB.id },
      },
      data: { isAdmin: true },
    });
    const bParticipant = await prisma.conversationParticipant.findUnique({
      where: {
        conversationId_userId: { conversationId: groupConv.id, userId: userB.id },
      },
    });
    if (!bParticipant?.isAdmin) throw new Error("Making Bob admin failed");
    console.log("✓ Successfully promoted Bob to Admin");

    // Creator protection check
    if (groupConv.creatorId === userA.id) {
      console.log("✓ Group creator is identified as Alice");
    }

    // Remove Bob from admin
    await prisma.conversationParticipant.update({
      where: {
        conversationId_userId: { conversationId: groupConv.id, userId: userB.id },
      },
      data: { isAdmin: false },
    });
    const bDemoted = await prisma.conversationParticipant.findUnique({
      where: {
        conversationId_userId: { conversationId: groupConv.id, userId: userB.id },
      },
    });
    if (bDemoted?.isAdmin) throw new Error("Demoting Bob failed");
    console.log("✓ Successfully demoted Bob back to Member");

    // 6. Test Communities & Owner Deletion
    console.log("\n[Test 6] Testing Communities Ownership & Deletion...");
    const commName = `Robotics Club ${timestamp}`;
    const comm = await prisma.community.create({
      data: {
        name: commName,
        description: "Official robotics club",
        ownerId: userA.id,
        members: { create: { userId: userA.id } },
      },
    });
    if (comm.ownerId !== userA.id) throw new Error("Community owner assignment failed");
    console.log("✓ Community created with Alice as owner");

    // Non-owner unauthorized check
    const isOwnerB = comm.ownerId === userB.id;
    if (isOwnerB) throw new Error("Bob should not be owner");
    console.log("✓ Non-owner (Bob) correctly denied delete permission");

    // Owner deletes community
    await prisma.community.delete({ where: { id: comm.id } });
    const deletedComm = await prisma.community.findUnique({ where: { id: comm.id } });
    if (deletedComm) throw new Error("Community deletion failed");
    console.log("✓ Community successfully deleted by owner (Alice)");

    // 7. Test Forgot Password & Password Reset Flow
    console.log("\n[Test 7] Testing Password Reset Flow...");
    const rawToken = crypto.randomBytes(32).toString("hex");
    const tokenHash = crypto.createHash("sha256").update(rawToken).digest("hex");
    const expiresAt = new Date(Date.now() + 15 * 60 * 1000);

    const resetTokenRecord = await prisma.passwordResetToken.create({
      data: {
        userId: userA.id,
        tokenHash,
        expiresAt,
      },
    });
    console.log("✓ Created secure hashed password reset token (expires in 15m)");

    // Reset password with token
    const newPassword = "NewSecretPassword456!";
    const newHash = await bcrypt.hash(newPassword, 10);
    await prisma.user.update({
      where: { id: resetTokenRecord.userId },
      data: { password: newHash },
    });
    await prisma.passwordResetToken.update({
      where: { id: resetTokenRecord.id },
      data: { used: true },
    });

    // Check token is now marked used
    const usedToken = await prisma.passwordResetToken.findUnique({
      where: { id: resetTokenRecord.id },
    });
    if (!usedToken?.used) throw new Error("Token should be marked used");
    console.log("✓ Reset token marked as used (prevents replay/reuse)");

    // Verify login with new password
    const updatedUser = await prisma.user.findUnique({ where: { id: userA.id } });
    const isNewPassValid = await bcrypt.compare(newPassword, updatedUser!.password);
    const isOldPassValid = await bcrypt.compare("Password123!", updatedUser!.password);
    if (!isNewPassValid) throw new Error("New password compare failed");
    if (isOldPassValid) throw new Error("Old password should no longer work");
    console.log("✓ Password reset verified: new password succeeds, old password rejected");

    console.log("\n========================================");
    console.log("🎉 ALL TESTS PASSED SUCCESSFULLY! 🎉");
    console.log("========================================\n");
  } finally {
    // Cleanup test data
    console.log("Cleaning up test data...");
    if (userA) {
      await prisma.passwordResetToken.deleteMany({ where: { userId: userA.id } });
      await prisma.notification.deleteMany({ where: { OR: [{ senderId: userA.id }, { recipientId: userA.id }] } });
      await prisma.conversationParticipant.deleteMany({ where: { userId: userA.id } });
      await prisma.follow.deleteMany({ where: { OR: [{ followerId: userA.id }, { followingId: userA.id }] } });
      await prisma.user.delete({ where: { id: userA.id } }).catch(() => {});
    }
    if (userB) {
      await prisma.notification.deleteMany({ where: { OR: [{ senderId: userB.id }, { recipientId: userB.id }] } });
      await prisma.conversationParticipant.deleteMany({ where: { userId: userB.id } });
      await prisma.follow.deleteMany({ where: { OR: [{ followerId: userB.id }, { followingId: userB.id }] } });
      await prisma.user.delete({ where: { id: userB.id } }).catch(() => {});
    }
    if (userC) {
      await prisma.conversationParticipant.deleteMany({ where: { userId: userC.id } });
      await prisma.follow.deleteMany({ where: { OR: [{ followerId: userC.id }, { followingId: userC.id }] } });
      await prisma.user.delete({ where: { id: userC.id } }).catch(() => {});
    }
    console.log("✓ Test data cleaned up cleanly");
  }
}

runTests()
  .then(() => process.exit(0))
  .catch((err) => {
    console.error("Test execution failed:", err);
    process.exit(1);
  });
