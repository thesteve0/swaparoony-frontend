#!/usr/bin/env node

// Script to download nginx binary using nginx-binaries package
import { NginxBinary } from 'nginx-binaries';
import { readFileSync, writeFileSync, chmodSync } from 'fs';

async function downloadNginx() {
    try {
        console.log('---> Downloading nginx binary...');
        
        // Download latest nginx binary to current directory
        const nginxPath = await NginxBinary.download({ 
            version: '^1.24.0'  // Latest stable version
        }, './nginx');
        
        console.log(`---> nginx binary downloaded to: ${nginxPath}`);
        
        // Make sure it's executable
        chmodSync(nginxPath, 0o755);
        
        // Test the binary
        console.log('---> Testing nginx binary...');
        const { execSync } = await import('child_process');
        try {
            const version = execSync(`${nginxPath} -v 2>&1`, { encoding: 'utf8' });
            console.log(`---> nginx version: ${version.trim()}`);
        } catch (e) {
            console.log(`---> nginx version check: ${e.message}`);
        }
        
        console.log('---> nginx binary ready!');
        return nginxPath;
        
    } catch (error) {
        console.error('---> ERROR downloading nginx:', error.message);
        process.exit(1);
    }
}

// Run if called directly
if (import.meta.url === `file://${process.argv[1]}`) {
    downloadNginx();
}

export { downloadNginx };