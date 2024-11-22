import crypto from "crypto";

const encryptionKey = process.env.ENCRYPTION_KEY || "0123456789abcdef"; // 16-byte key
if (encryptionKey.length !== 16) {
  throw new Error("ENCRYPTION_KEY must be 16 bytes long.");
}

export const encryptContent = (content) =>
  content.map((item) => {
    if (item.type === "text" || item.type === "image") {
      const iv = crypto.randomBytes(16); // Generate a new IV for this item
      const cipher = crypto.createCipheriv(
        "aes-128-cbc",
        Buffer.from(encryptionKey, "utf8"),
        iv
      );
      let encrypted = cipher.update(item.value, "utf8", "hex");
      encrypted += cipher.final("hex");
      item.value = `${iv.toString("hex")}:${encrypted}`; // Store IV with the encrypted value
    }
    return item;
  });

  export const decryptContent = (content) =>
    content.map((item) => {
      if (item.type === "text" || item.type === "image") {
        try {
          const [ivHex, encrypted] = item.value.split(":");
          const iv = Buffer.from(ivHex, "hex");
          const decipher = crypto.createDecipheriv(
            "aes-128-cbc",
            Buffer.from(encryptionKey, "utf8"),
            iv
          );
          let decrypted = decipher.update(encrypted, "hex", "utf8");
          decrypted += decipher.final("utf8");
          item.value = decrypted; // Replace encrypted value with the decrypted content
        } catch (error) {
          console.error("Decryption failed for item:", item, error);
          throw error; // Handle or log as needed
        }
      }
      return item;
    });
  