/**
 * RNS SHOP - Admin Account Initialization & Verification Utility
 * 
 * This script ensures the administrator account exists with secure Bcrypt hashing,
 * verifies environment configuration, and outputs MySQL initialization SQL.
 */
import 'dotenv/config';
import bcrypt from 'bcryptjs';
import { db } from './db.js';
import { AUTHORIZED_ADMIN_EMAIL } from './auth.js';

async function initAdmin() {
  console.log("==================================================================");
  console.log("       RNS SHOP - SECURE ADMIN ACCOUNT INITIALIZATION             ");
  console.log("==================================================================");

  const adminName = process.env.ADMIN_NAME || "Saniya Dangre";
  const adminEmail = (process.env.ADMIN_EMAIL || AUTHORIZED_ADMIN_EMAIL || "saniyadangre80@gmail.com").toLowerCase().trim();
  const rawPassword = process.env.ADMIN_INITIAL_PASSWORD || process.env.ADMIN_PASSWORD || "RnsShopSecure#2026";

  console.log(`[Config] Admin Name:     ${adminName}`);
  console.log(`[Config] Admin Email:    ${adminEmail}`);
  console.log(`[Config] Password Set:   [CONFIGURED] (${rawPassword.length} characters)`);

  // Generate fresh salt and Bcrypt hash
  const salt = bcrypt.genSaltSync(10);
  const passwordHash = bcrypt.hashSync(rawPassword.trim(), salt);

  console.log(`[Security] Bcrypt Salt:  ${salt}`);
  console.log(`[Security] Bcrypt Hash:  ${passwordHash}`);

  // Test bcrypt comparison
  const testCompare = bcrypt.compareSync(rawPassword.trim(), passwordHash);
  if (!testCompare) {
    throw new Error("Bcrypt self-verification failed!");
  }
  console.log(`[Security] Verification: bcrypt.compare() PASSED [OK]`);

  // Initialize or update in persistent database
  const admin = db.ensureAdmin();
  admin.name = adminName;
  admin.email = adminEmail;
  admin.password_hash = passwordHash;
  db.saveData();

  console.log(`[Database] JSON Store:   Updated data/rns_database.json [OK]`);
  console.log(`[Database] Admin Record: ID #${admin.id} - ${admin.name} <${admin.email}>`);

  // Generate MySQL execution script
  console.log("\n------------------------------------------------------------------");
  console.log("                  MYSQL SYNCHRONIZATION QUERY                     ");
  console.log("------------------------------------------------------------------");
  console.log(`To verify or initialize this admin in MySQL, execute:`);
  console.log(`
USE \`rns_shop_db\`;

INSERT INTO \`admins\` (\`id\`, \`name\`, \`email\`, \`password_hash\`, \`role\`)
VALUES (1, '${adminName.replace(/'/g, "\\'")}', '${adminEmail.replace(/'/g, "\\'")}', '${passwordHash}', 'Super Admin')
ON DUPLICATE KEY UPDATE 
  \`name\` = VALUES(\`name\`),
  \`password_hash\` = VALUES(\`password_hash\`),
  \`role\` = VALUES(\`role\`);
`);
  console.log("==================================================================");
  console.log("  RNS SHOP Admin Authentication is 100% Initialized and Verified  ");
  console.log("==================================================================");
}

initAdmin().catch(err => {
  console.error("Failed to initialize admin account:", err);
  process.exit(1);
});
