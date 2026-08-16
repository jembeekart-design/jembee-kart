
import { copyFileSync, readFileSync, writeFileSync } from 'fs';
import { resolve } from 'path';

const target = process.argv[2]; // 'ecommerce' or 'video'

if (!target || !['ecommerce', 'video'].includes(target)) {
  console.error('Usage: ts-node scripts/switch-config.ts [ecommerce|video]');
  process.exit(1);
}

// 1. Switch Capacitor config
const srcConfig = resolve(`capacitor.config.${target}.ts`);
const destConfig = resolve('capacitor.config.ts');
copyFileSync(srcConfig, destConfig);

// 2. Determine App ID
const appId = target === 'video' ? 'com.jembeekart.video' : 'com.jembeekart.app';

// 3. Set Build Target
const targetPath = resolve('src/lib/build-target.ts');
writeFileSync(targetPath, `export const BUILD_TARGET = '${target}';\n`);

// 4. Update Android build.gradle
const gradlePath = resolve('android/app/build.gradle');
let gradleContent = readFileSync(gradlePath, 'utf8');

// Replace applicationId
gradleContent = gradleContent.replace(
  /applicationId\s+".*"/,
  `applicationId "${appId}"`
);

// Replace namespace (also needs to match applicationId)
gradleContent = gradleContent.replace(
  /namespace\s+=\s+".*"/,
  `namespace = "${appId}"`
);

writeFileSync(gradlePath, gradleContent);

console.log(`Switched to ${target} configuration (App ID: ${appId})`);
