import crypto from "crypto";

const encryptionKey = process.env.ENCRYPTION_KEY || "0123456789abcdef"; // 16-byte key
if (encryptionKey.length !== 16) {
  throw new Error("ENCRYPTION_KEY must be 16 bytes long.");
}

export const encryptContent = (data) => {
  if (Array.isArray(data)) {
      // Encrypt an array of objects
      return data.map((item) => {
          const iv = crypto.randomBytes(16); // Generate a new IV for each item
          const cipher = crypto.createCipheriv(
              "aes-128-cbc",
              Buffer.from(encryptionKey, "utf8"),
              iv
          );
          let encrypted = cipher.update(item.value, "utf8", "hex");
          encrypted += cipher.final("hex");
          item.value = `${iv.toString("hex")}:${encrypted}`;
          return item;
      });
  } else if (typeof data === "string") {
      // Encrypt a single string
      const iv = crypto.randomBytes(16); // Generate a new IV for the string
      const cipher = crypto.createCipheriv(
          "aes-128-cbc",
          Buffer.from(encryptionKey, "utf8"),
          iv
      );
      let encrypted = cipher.update(data, "utf8", "hex");
      encrypted += cipher.final("hex");
      return `${iv.toString("hex")}:${encrypted}`;
  } else {
      throw new TypeError("encryptContent expects a string or an array as input.");
  }
};


export const decryptContent = (data) => {
  if (Array.isArray(data)) {
      // Decrypt an array of objects
      return data.map((item) => {
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
              item.value = decrypted;
              return item;
          } catch (error) {
              console.error("Decryption failed for item:", item, error);
              throw error;
          }
      });
  } else if (typeof data === "string") {
      // Decrypt a single string
      try {
          const [ivHex, encrypted] = data.split(":");
          const iv = Buffer.from(ivHex, "hex");
          const decipher = crypto.createDecipheriv(
              "aes-128-cbc",
              Buffer.from(encryptionKey, "utf8"),
              iv
          );
          let decrypted = decipher.update(encrypted, "hex", "utf8");
          decrypted += decipher.final("utf8");
          return decrypted;
      } catch (error) {
          console.error("Decryption failed for string:", data, error);
          throw error;
      }
  } else {
      throw new TypeError("decryptContent expects a string or an array as input.");
  }
};