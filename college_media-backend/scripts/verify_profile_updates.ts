import prisma from "../src/lib/prisma.js";

async function run() {
  console.log("=== STARTING INDEPENDENT PROFILE UPDATE VERIFICATION ===");

  const email = `test_profile_${Date.now()}@college.edu`;
  const user = await prisma.user.create({
    data: {
      email,
      name: "Original Name",
      bio: "Original Bio",
      avatarUrl: "https://example.com/original.jpg",
      password: "password123",
    },
  });

  try {
    console.log("✓ Created initial user:", {
      name: user.name,
      bio: user.bio,
      avatarUrl: user.avatarUrl,
    });

    // TEST 1: Update ONLY avatarUrl
    console.log("\n--- TEST 1: Update ONLY avatarUrl ---");
    const updateData1: { name?: string; bio?: string | null; avatarUrl?: string | null } = {};
    const newAvatar = "https://example.com/new-avatar.jpg";
    updateData1.avatarUrl = newAvatar;

    const res1 = await prisma.user.update({
      where: { id: user.id },
      data: updateData1,
    });

    if (res1.avatarUrl !== newAvatar) {
      throw new Error(`Failed: expected avatarUrl ${newAvatar}, got ${res1.avatarUrl}`);
    }
    if (res1.name !== "Original Name") {
      throw new Error(`Failed: name was unexpectedly overwritten! Got: ${res1.name}`);
    }
    if (res1.bio !== "Original Bio") {
      throw new Error(`Failed: bio was unexpectedly overwritten! Got: ${res1.bio}`);
    }
    console.log("✓ PASSED: Only avatarUrl updated, name and bio preserved intact!");

    // TEST 2: Update ONLY bio
    console.log("\n--- TEST 2: Update ONLY bio ---");
    const updateData2: { name?: string; bio?: string | null; avatarUrl?: string | null } = {};
    const newBio = "Updated Campus Bio - Software Engineering major";
    updateData2.bio = newBio;

    const res2 = await prisma.user.update({
      where: { id: user.id },
      data: updateData2,
    });

    if (res2.bio !== newBio) {
      throw new Error(`Failed: expected bio ${newBio}, got ${res2.bio}`);
    }
    if (res2.name !== "Original Name") {
      throw new Error(`Failed: name was unexpectedly overwritten! Got: ${res2.name}`);
    }
    if (res2.avatarUrl !== newAvatar) {
      throw new Error(`Failed: avatarUrl was unexpectedly overwritten! Got: ${res2.avatarUrl}`);
    }
    console.log("✓ PASSED: Only bio updated, name and avatarUrl preserved intact!");

    // TEST 3: Update ONLY name
    console.log("\n--- TEST 3: Update ONLY name ---");
    const updateData3: { name?: string; bio?: string | null; avatarUrl?: string | null } = {};
    const newName = "Alice Senior";
    updateData3.name = newName;

    const res3 = await prisma.user.update({
      where: { id: user.id },
      data: updateData3,
    });

    if (res3.name !== newName) {
      throw new Error(`Failed: expected name ${newName}, got ${res3.name}`);
    }
    if (res3.bio !== newBio) {
      throw new Error(`Failed: bio was unexpectedly overwritten! Got: ${res3.bio}`);
    }
    if (res3.avatarUrl !== newAvatar) {
      throw new Error(`Failed: avatarUrl was unexpectedly overwritten! Got: ${res3.avatarUrl}`);
    }
    console.log("✓ PASSED: Only name updated, bio and avatarUrl preserved intact!");

    // TEST 4: Remove photo (set avatarUrl to null)
    console.log("\n--- TEST 4: Remove Photo (set avatarUrl to null) ---");
    const updateData4: { name?: string; bio?: string | null; avatarUrl?: string | null } = {};
    updateData4.avatarUrl = null;

    const res4 = await prisma.user.update({
      where: { id: user.id },
      data: updateData4,
    });

    if (res4.avatarUrl !== null) {
      throw new Error(`Failed: expected avatarUrl to be null, got ${res4.avatarUrl}`);
    }
    if (res4.name !== newName || res4.bio !== newBio) {
      throw new Error("Failed: name or bio was unexpectedly changed on photo removal");
    }
    console.log("✓ PASSED: Photo removed cleanly while preserving name and bio!");

    console.log("\n=======================================================");
    console.log("🎉 ALL INDEPENDENT PROFILE TESTS PASSED CLEANLY! 🎉");
    console.log("=======================================================");
  } finally {
    console.log("\nCleaning up test user...");
    await prisma.user.delete({ where: { id: user.id } }).catch(() => {});
    console.log("Cleanup complete.");
  }
}

run()
  .catch((e) => {
    console.error("Test failed:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
